import { VideoPlayer } from './VideoPlayer';
import { UserButton } from './UserButton';
import { Logo } from './Logo';

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

interface HomeProps {
  onStartChat: () => void;
  mediaStreamHook: MediaStreamHook;
}

export function Home({ onStartChat, mediaStreamHook }: HomeProps) {
  const { localStream, error, isLoading, startMedia, stopMedia } = mediaStreamHook;

  const handleStart = async () => {
    await startMedia();
    if (localStream) {
      onStartChat();
    }
  };

  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center p-4 relative app-font">
      <div className="absolute top-4 left-4 z-50">
        <Logo size="md" />
      </div>
      <UserButton />
      <div className="max-w-2xl w-full bg-sage rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-charcoal mb-4">Video Chat MVP</h1>
        <p className="text-charcoal/70 mb-8">Connect with random people for video conversations</p>

        {/* Local Video Preview */}
        {localStream && (
          <div className="mb-6">
            <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden bg-charcoal/10 border-2 border-sage">
              <VideoPlayer 
                stream={localStream} 
                isLocal 
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 left-2 bg-charcoal/80 text-ivory text-xs px-2 py-1 rounded">
                You
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800">
            {error}
          </div>
        )}

        {/* Start Chat Button */}
        {!localStream ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="px-8 py-4 bg-moss hover:bg-moss/90 disabled:bg-sage disabled:cursor-not-allowed text-ivory font-semibold rounded-lg transition-colors text-lg"
          >
            {isLoading ? 'Requesting permissions...' : 'Start Chat'}
          </button>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onStartChat}
              className="px-8 py-4 bg-moss hover:bg-moss/90 text-ivory font-semibold rounded-lg transition-colors text-lg w-full"
            >
              Find Someone to Chat With
            </button>
            <button
              onClick={stopMedia}
              className="px-4 py-2 bg-sage hover:bg-sage/80 text-charcoal rounded-lg transition-colors text-sm"
            >
              Stop Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

