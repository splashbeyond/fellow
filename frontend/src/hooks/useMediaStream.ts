import { useState, useEffect, useRef } from 'react';

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);

  const startMedia = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      streamRef.current = stream;
      setLocalStream(stream);
      setIsLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to access media devices';
      setError(errorMessage);
      setIsLoading(false);
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          setError('Camera and microphone permissions are required');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          setError('No camera or microphone found');
        } else {
          setError(`Error accessing media: ${errorMessage}`);
        }
      }
    }
  };

  const stopMedia = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
      setLocalStream(null);
    }
  };

  const toggleAudio = () => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  };

  const toggleVideo = () => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
    }
  };

  const isAudioEnabled = () => {
    return streamRef.current?.getAudioTracks()[0]?.enabled ?? false;
  };

  const isVideoEnabled = () => {
    return streamRef.current?.getVideoTracks()[0]?.enabled ?? false;
  };

  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  return {
    localStream,
    error,
    isLoading,
    startMedia,
    stopMedia,
    toggleAudio,
    toggleVideo,
    isAudioEnabled,
    isVideoEnabled
  };
}

