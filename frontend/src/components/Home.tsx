import { VideoPlayer } from './VideoPlayer';

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
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-gray-800/50 backdrop-blur-lg rounded-2xl shadow-2xl p-8 text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Video Chat MVP</h1>
        <p className="text-gray-300 mb-8">Connect with random people for video conversations</p>

        {/* Local Video Preview */}
        {localStream && (
          <div className="mb-6">
            <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden bg-gray-900">
              <VideoPlayer 
                stream={localStream} 
                isLocal 
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                You
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg text-red-200">
            {error}
          </div>
        )}

        {/* Start Chat Button */}
        {!localStream ? (
          <button
            onClick={handleStart}
            disabled={isLoading}
            className="px-8 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors text-lg"
          >
            {isLoading ? 'Requesting permissions...' : 'Start Chat'}
          </button>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onStartChat}
              className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors text-lg w-full"
            >
              Find Someone to Chat With
            </button>
            <button
              onClick={stopMedia}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
            >
              Stop Camera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

