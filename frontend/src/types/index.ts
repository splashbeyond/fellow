export type ConnectionState = 
  | 'idle' 
  | 'waiting' 
  | 'connecting' 
  | 'connected' 
  | 'disconnected';

export interface MatchedEvent {
  roomId: string;
  initiator: boolean;
}

export interface OfferEvent {
  sdp: RTCSessionDescriptionInit;
  roomId: string;
}

export interface AnswerEvent {
  sdp: RTCSessionDescriptionInit;
  roomId: string;
}

export interface IceCandidateEvent {
  candidate: RTCIceCandidateInit;
  roomId: string;
}

export interface PeerDisconnectedEvent {
  roomId: string;
}

