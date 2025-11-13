# Video Chat MVP

An Omegle-style anonymous peer-to-peer video chat application built with WebRTC, React, and Node.js.

## Features

- 🎥 Real-time video and audio streaming via WebRTC
- 🔀 Random 1-on-1 matching with FIFO queue
- 🎛️ Audio/video controls (mute, disable video)
- ⏭️ Skip to next partner
- 🔄 Automatic reconnection handling
- 📱 Responsive UI with Tailwind CSS

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Socket.io Client

### Backend
- Node.js + Express
- Socket.io
- WebRTC Signaling Server

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd videochat-mvp
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Set up environment variables**

   Backend (create `backend/.env`):
   ```env
   PORT=3001
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```

   Frontend (create `frontend/.env`):
   ```env
   VITE_SIGNALING_SERVER_URL=http://localhost:3001
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   Server will run on `http://localhost:3001`

2. **Start the frontend (in a new terminal)**
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend will run on `http://localhost:5173`

3. **Open your browser**
   - Navigate to `http://localhost:5173`
   - Allow camera and microphone permissions
   - Click "Start Chat" to begin matching

### Testing with Multiple Users

To test the matching functionality:
1. Open the app in multiple browser windows/tabs
2. Click "Start Chat" in each window
3. The first two users will be matched automatically

## Project Structure

```
videochat-mvp/
├── backend/
│   ├── src/
│   │   └── server.js          # Express + Socket.io server
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── hooks/            # Custom React hooks
│   │   ├── services/         # Signaling service
│   │   ├── types/           # TypeScript types
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## Architecture

- **WebRTC**: Peer-to-peer video/audio streaming (no server proxying)
- **Socket.io**: Signaling server for matchmaking and WebRTC SDP exchange
- **STUN Servers**: NAT traversal (using Google's public STUN servers)
- **FIFO Queue**: Simple first-in-first-out matching algorithm

## Security Notes

⚠️ **For Production:**
- Use HTTPS (required for WebRTC `getUserMedia()`)
- Implement rate limiting
- Add CORS restrictions
- Consider TURN servers for users behind restrictive firewalls
- Add content moderation features

## Development

- Backend uses `--watch` flag for auto-reload
- Frontend uses Vite HMR for instant updates
- TypeScript for type safety

## Deployment

### Backend
- Deploy to Railway, Render, or DigitalOcean
- Ensure WebSocket support is enabled
- Set environment variables

### Frontend
- Deploy to Vercel, Netlify, or similar
- Update `VITE_SIGNALING_SERVER_URL` to production backend URL

## License

MIT

