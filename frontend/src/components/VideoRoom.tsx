import { useWebRTC } from '../hooks/useWebRTC';
import { VideoPlayer } from './VideoPlayer';
import { Controls } from './Controls';
import { UserButton } from './UserButton';
import { Logo } from './Logo';
import { useEffect } from 'react';
import { signalingService } from '../services/signaling';

interface MediaStreamHook {
  localStream: MediaStream | null;
  error: string | null;
  isLoading: boolean;
  startMedia: () => Promise<void>;
  stopMedia: () => void;
  toggleAudio: () => void;
  toggleVideo: () => void;
  isAudioEnabled: () => boolean;
  isVideoEnabled: () => boolean;
}

interface VideoRoomProps {
  onEndCall: () => void;
  mediaStreamHook: MediaStreamHook;
}

export function VideoRoom({ onEndCall, mediaStreamHook }: VideoRoomProps) {
  const { 
    localStream, 
    toggleAudio, 
    toggleVideo, 
    isAudioEnabled, 
    isVideoEnabled 
  } = mediaStreamHook;
  
  const { 
    connectionState, 
    remoteStream, 
    error, 
    skip 
  } = useWebRTC(localStream);

  // Join queue when component mounts and stream is available
  useEffect(() => {
    if (localStream) {
      signalingService.joinQueue();
    }

    return () => {
      signalingService.leaveQueue();
    };
  }, [localStream]);

  const handleSkip = () => {
    skip();
    // Rejoin queue after skipping
    setTimeout(() => {
      signalingService.joinQueue();
    }, 500);
  };

  const handleEndCall = () => {
    skip();
    onEndCall();
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col relative app-font">
      <div className="absolute top-4 left-4 z-50">
        <Logo size="sm" />
      </div>
      <UserButton />
      {/* Connection Status Bar */}
      <div className="bg-sage p-2 text-center">
        {(connectionState === 'idle' || connectionState === 'waiting') && localStream && (
          <div className="text-charcoal flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Looking for someone to chat with...
          </div>
        )}
        {connectionState === 'connecting' && (
          <div className="text-moss flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Connecting...
          </div>
        )}
        {connectionState === 'connected' && (
          <div className="text-moss font-medium">Connected</div>
        )}
        {connectionState === 'disconnected' && (
          <div className="text-charcoal/70">Partner disconnected. Looking for someone new...</div>
        )}
        {error && (
          <div className="text-red-600">{error}</div>
        )}
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-charcoal">
        {/* Remote Video (Main) */}
        {remoteStream ? (
          <div className="absolute inset-0">
            <VideoPlayer 
              stream={remoteStream} 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-charcoal/50">
            <div className="text-center text-ivory/60">
              <svg className="w-24 h-24 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p>Waiting for partner...</p>
            </div>
          </div>
        )}

        {/* Local Video (Picture-in-Picture) */}
        {localStream && (
          <div className="absolute bottom-4 right-4 w-48 h-36 rounded-lg overflow-hidden bg-charcoal border-2 border-ivory shadow-lg">
            <VideoPlayer 
              stream={localStream} 
              isLocal 
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-sage p-4 flex justify-center">
        <Controls
          isAudioMuted={!isAudioEnabled()}
          isVideoDisabled={!isVideoEnabled()}
          onToggleAudio={toggleAudio}
          onToggleVideo={toggleVideo}
          onSkip={handleSkip}
          onEndCall={handleEndCall}
        />
      </div>
    </div>
  );
}

