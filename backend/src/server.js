import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3001;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
  origin: FRONTEND_URL,
  credentials: true
}));
app.use(express.json());

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Matchmaking queues (FIFO) - separate queues for different room types
const waitingQueues = {
  faith: [],
  friends: []
};
const activeRooms = new Map(); // roomId -> { user1: socketId, user2: socketId, roomType: 'faith' | 'friends' }

// Generate unique room ID
function generateRoomId() {
  return `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Handle user joining queue
function handleJoinQueue(socket, roomType = 'friends') {
  const queue = waitingQueues[roomType] || waitingQueues.friends;
  
  if (queue.includes(socket.id)) {
    return; // Already in queue
  }
  
  queue.push(socket.id);
  console.log(`User ${socket.id} joined ${roomType} queue. Queue length: ${queue.length}`);
  attemptMatch(roomType);
}

// Attempt to match two users in a specific queue
function attemptMatch(roomType = 'friends') {
  const queue = waitingQueues[roomType] || waitingQueues.friends;
  
  if (queue.length >= 2) {
    const user1 = queue.shift();
    const user2 = queue.shift();
    const roomId = generateRoomId();
    
    // Create room
    activeRooms.set(roomId, {
      user1,
      user2,
      roomType,
      createdAt: Date.now()
    });
    
    // Join both users to the room
    const socket1 = io.sockets.sockets.get(user1);
    const socket2 = io.sockets.sockets.get(user2);
    
    if (socket1 && socket2) {
      socket1.join(roomId);
      socket2.join(roomId);
      
      // Notify both users - first user is initiator
      socket1.emit('matched', { roomId, initiator: true, roomType });
      socket2.emit('matched', { roomId, initiator: false, roomType });
      
      console.log(`Matched ${user1} and ${user2} in ${roomType} room ${roomId}`);
    } else {
      // One of the sockets disconnected, clean up
      if (!socket1) queue.push(user2);
      if (!socket2) queue.push(user1);
      activeRooms.delete(roomId);
    }
  }
}

// Remove user from queue
function handleLeaveQueue(socket, roomType = 'friends') {
  const queue = waitingQueues[roomType] || waitingQueues.friends;
  const index = queue.indexOf(socket.id);
  if (index > -1) {
    queue.splice(index, 1);
    console.log(`User ${socket.id} left ${roomType} queue. Queue length: ${queue.length}`);
  }
}

// Handle room cleanup
function cleanupRoom(roomId, socketId) {
  const room = activeRooms.get(roomId);
  if (!room) return;
  
  // Notify the other peer
  const otherSocketId = room.user1 === socketId ? room.user2 : room.user1;
  const otherSocket = io.sockets.sockets.get(otherSocketId);
  if (otherSocket) {
    otherSocket.emit('peer-disconnected', { roomId });
  }
  
  // Remove room
  activeRooms.delete(roomId);
  console.log(`Cleaned up room ${roomId}`);
}

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join queue
  socket.on('join-queue', (data) => {
    const roomType = data?.roomType || 'friends';
    handleJoinQueue(socket, roomType);
  });
  
  // Leave queue
  socket.on('leave-queue', (data) => {
    const roomType = data?.roomType || 'friends';
    handleLeaveQueue(socket, roomType);
  });
  
  // WebRTC signaling: offer
  socket.on('offer', (data) => {
    const { roomId, sdp } = data;
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    const otherSocketId = room.user1 === socket.id ? room.user2 : room.user1;
    const otherSocket = io.sockets.sockets.get(otherSocketId);
    if (otherSocket) {
      otherSocket.emit('offer', { sdp, roomId });
    }
  });
  
  // WebRTC signaling: answer
  socket.on('answer', (data) => {
    const { roomId, sdp } = data;
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    const otherSocketId = room.user1 === socket.id ? room.user2 : room.user1;
    const otherSocket = io.sockets.sockets.get(otherSocketId);
    if (otherSocket) {
      otherSocket.emit('answer', { sdp, roomId });
    }
  });
  
  // WebRTC signaling: ICE candidate
  socket.on('ice-candidate', (data) => {
    const { roomId, candidate } = data;
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    const otherSocketId = room.user1 === socket.id ? room.user2 : room.user1;
    const otherSocket = io.sockets.sockets.get(otherSocketId);
    if (otherSocket) {
      otherSocket.emit('ice-candidate', { candidate, roomId });
    }
  });
  
  // Skip current partner
  socket.on('skip', (data) => {
    const { roomId } = data;
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    // Notify other peer
    const otherSocketId = room.user1 === socket.id ? room.user2 : room.user1;
    const otherSocket = io.sockets.sockets.get(otherSocketId);
    if (otherSocket) {
      otherSocket.emit('peer-disconnected', { roomId });
    }
    
    // Clean up room
    activeRooms.delete(roomId);
    
    // Re-add both to queue (preserve room type)
    const roomType = room.roomType || 'friends';
    handleJoinQueue(socket, roomType);
    if (otherSocket) {
      handleJoinQueue(otherSocket, roomType);
    }
  });
  
  // Chat message
  socket.on('chat-message', (data) => {
    const { roomId, text } = data;
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    // Forward message to the other peer
    const otherSocketId = room.user1 === socket.id ? room.user2 : room.user1;
    const otherSocket = io.sockets.sockets.get(otherSocketId);
    if (otherSocket) {
      otherSocket.emit('chat-message', { roomId, text });
    }
  });

  // Bible verse sharing
  socket.on('bible-verse', (data) => {
    const { roomId, reference, text, verses } = data;
    const room = activeRooms.get(roomId);
    if (!room) return;
    
    // Forward Bible verse to the other peer
    const otherSocketId = room.user1 === socket.id ? room.user2 : room.user1;
    const otherSocket = io.sockets.sockets.get(otherSocketId);
    if (otherSocket) {
      otherSocket.emit('bible-verse', { roomId, reference, text, verses });
    }
  });
  
  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
    
    // Remove from all queues
    handleLeaveQueue(socket, 'faith');
    handleLeaveQueue(socket, 'friends');
    
    // Clean up any rooms this user was in
    for (const [roomId, room] of activeRooms.entries()) {
      if (room.user1 === socket.id || room.user2 === socket.id) {
        cleanupRoom(roomId, socket.id);
        break;
      }
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    queues: {
      faith: waitingQueues.faith.length,
      friends: waitingQueues.friends.length
    },
    activeRooms: activeRooms.size 
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
  console.log(`🌐 Frontend URL: ${FRONTEND_URL}`);
});

