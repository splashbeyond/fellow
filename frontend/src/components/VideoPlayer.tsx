import { useEffect, useRef } from 'react';

interface VideoPlayerProps {
  stream: MediaStream | null;
  muted?: boolean;
  className?: string;
  isLocal?: boolean;
}

export function VideoPlayer({ stream, muted = false, className = '', isLocal = false }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={muted || isLocal}
      className={className}
      style={{
        transform: isLocal ? 'scaleX(-1)' : 'none', // Mirror local video
      }}
    />
  );
}

