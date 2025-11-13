import { useState, useEffect, useRef, useCallback } from 'react';
import { signalingService } from '../services/signaling';
import type { ConnectionState } from '../types';

const ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

export function useWebRTC(localStream: MediaStream | null) {
  const [connectionState, setConnectionState] = useState<ConnectionState>('idle');
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const roomIdRef = useRef<string | null>(null);
  const isInitiatorRef = useRef<boolean>(false);

  const createPeerConnection = useCallback(() => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    // Add local stream tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        pc.addTrack(track, localStream);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      if (event.streams[0]) {
        setRemoteStream(event.streams[0]);
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate && roomIdRef.current) {
        signalingService.sendIceCandidate(roomIdRef.current, event.candidate);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log('WebRTC connection state:', state);
      
      switch (state) {
        case 'connected':
          setConnectionState('connected');
          setError(null);
          break;
        case 'disconnected':
        case 'failed':
          setConnectionState('disconnected');
          setError('Connection failed. Trying to reconnect...');
          cleanup();
          break;
        case 'connecting':
          setConnectionState('connecting');
          break;
        default:
          break;
      }
    };

    // Handle ICE connection state
    pc.oniceconnectionstatechange = () => {
      const iceState = pc.iceConnectionState;
      console.log('ICE connection state:', iceState);
      
      if (iceState === 'failed' || iceState === 'disconnected') {
        setError('Network connection issue');
      }
    };

    return pc;
  }, [localStream]);

  const cleanup = useCallback(() => {
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    setRemoteStream(null);
    roomIdRef.current = null;
  }, []);

  const handleMatched = useCallback(async (roomId: string, initiator: boolean) => {
    roomIdRef.current = roomId;
    isInitiatorRef.current = initiator;
    setConnectionState('connecting');
    setError(null);
    setRemoteStream(null); // Clear previous remote stream

    const pc = createPeerConnection();
    peerConnectionRef.current = pc;

    try {
      if (initiator) {
        // Create and send offer
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        signalingService.sendOffer(roomId, offer);
      }
    } catch (err) {
      console.error('Error creating offer:', err);
      setError('Failed to create connection');
      cleanup();
    }
  }, [createPeerConnection, cleanup]);

  const handleOffer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current || !roomIdRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
      
      // Create and send answer
      const answer = await peerConnectionRef.current.createAnswer();
      await peerConnectionRef.current.setLocalDescription(answer);
      signalingService.sendAnswer(roomIdRef.current, answer);
    } catch (err) {
      console.error('Error handling offer:', err);
      setError('Failed to establish connection');
      cleanup();
    }
  }, [cleanup]);

  const handleAnswer = useCallback(async (sdp: RTCSessionDescriptionInit) => {
    if (!peerConnectionRef.current) return;

    try {
      await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(sdp));
    } catch (err) {
      console.error('Error handling answer:', err);
      setError('Failed to establish connection');
      cleanup();
    }
  }, [cleanup]);

  const handleIceCandidate = useCallback((candidate: RTCIceCandidateInit) => {
    if (!peerConnectionRef.current) return;

    try {
      peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (err) {
      console.error('Error adding ICE candidate:', err);
    }
  }, []);

  const handlePeerDisconnected = useCallback(() => {
    setConnectionState('waiting');
    cleanup();
    // Automatically rejoin queue after a short delay
    setTimeout(() => {
      signalingService.joinQueue();
    }, 1000);
  }, [cleanup]);

  const skip = useCallback(() => {
    if (roomIdRef.current) {
      signalingService.skip(roomIdRef.current);
    }
    cleanup();
    setConnectionState('waiting');
  }, [cleanup]);

  // Set up signaling event listeners
  useEffect(() => {
    signalingService.onMatched(({ roomId, initiator }) => {
      handleMatched(roomId, initiator);
    });

    signalingService.onOffer(({ sdp }) => {
      handleOffer(sdp);
    });

    signalingService.onAnswer(({ sdp }) => {
      handleAnswer(sdp);
    });

    signalingService.onIceCandidate(({ candidate }) => {
      handleIceCandidate(candidate);
    });

    signalingService.onPeerDisconnected(() => {
      handlePeerDisconnected();
    });

    return () => {
      signalingService.offMatched(handleMatched);
      signalingService.offOffer(handleOffer);
      signalingService.offAnswer(handleAnswer);
      signalingService.offIceCandidate(handleIceCandidate);
      signalingService.offPeerDisconnected(handlePeerDisconnected);
    };
  }, [handleMatched, handleOffer, handleAnswer, handleIceCandidate, handlePeerDisconnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    connectionState,
    remoteStream,
    error,
    skip
  };
}

