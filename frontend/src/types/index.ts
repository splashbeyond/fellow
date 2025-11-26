export type ConnectionState = 
  | 'idle' 
  | 'waiting' 
  | 'connecting' 
  | 'connected' 
  | 'disconnected';

export interface MatchedEvent {
  roomId: string;
  initiator: boolean;
  roomType?: 'faith' | 'friends';
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

export interface ChatMessageEvent {
  text: string;
  roomId: string;
}

export interface BibleVerseEvent {
  roomId: string;
  reference: string;
  text: string;
  verses: Array<{
    book_id: string;
    book_name: string;
    chapter: number;
    verse: number;
    text: string;
  }>;
}

