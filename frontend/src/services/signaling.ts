import { io, Socket } from 'socket.io-client';
import type { 
  MatchedEvent, 
  OfferEvent, 
  AnswerEvent, 
  IceCandidateEvent,
  PeerDisconnectedEvent 
} from '../types';

const SIGNALING_SERVER_URL = import.meta.env.VITE_SIGNALING_SERVER_URL || 'http://localhost:3001';

export class SignalingService {
  private socket: Socket | null = null;

  connect() {
    if (this.socket?.connected) {
      return;
    }

    this.socket = io(SIGNALING_SERVER_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Queue management
  joinQueue() {
    this.socket?.emit('join-queue');
  }

  leaveQueue() {
    this.socket?.emit('leave-queue');
  }

  // WebRTC signaling
  sendOffer(roomId: string, sdp: RTCSessionDescriptionInit) {
    this.socket?.emit('offer', { roomId, sdp });
  }

  sendAnswer(roomId: string, sdp: RTCSessionDescriptionInit) {
    this.socket?.emit('answer', { roomId, sdp });
  }

  sendIceCandidate(roomId: string, candidate: RTCIceCandidateInit) {
    this.socket?.emit('ice-candidate', { roomId, candidate });
  }

  // Skip current partner
  skip(roomId: string) {
    this.socket?.emit('skip', { roomId });
  }

  // Event listeners
  onMatched(callback: (data: MatchedEvent) => void) {
    this.socket?.on('matched', callback);
  }

  onOffer(callback: (data: OfferEvent) => void) {
    this.socket?.on('offer', callback);
  }

  onAnswer(callback: (data: AnswerEvent) => void) {
    this.socket?.on('answer', callback);
  }

  onIceCandidate(callback: (data: IceCandidateEvent) => void) {
    this.socket?.on('ice-candidate', callback);
  }

  onPeerDisconnected(callback: (data: PeerDisconnectedEvent) => void) {
    this.socket?.on('peer-disconnected', callback);
  }

  // Remove event listeners
  offMatched(callback: (data: MatchedEvent) => void) {
    this.socket?.off('matched', callback);
  }

  offOffer(callback: (data: OfferEvent) => void) {
    this.socket?.off('offer', callback);
  }

  offAnswer(callback: (data: AnswerEvent) => void) {
    this.socket?.off('answer', callback);
  }

  offIceCandidate(callback: (data: IceCandidateEvent) => void) {
    this.socket?.off('ice-candidate', callback);
  }

  offPeerDisconnected(callback: (data: PeerDisconnectedEvent) => void) {
    this.socket?.off('peer-disconnected', callback);
  }

  // Connection status
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }
}

export const signalingService = new SignalingService();

