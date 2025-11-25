import { VideoPlayer } from './VideoPlayer';
import { SidebarProvider, SidebarTrigger } from './ui/sidebar';
import { AppSidebar } from './AppSidebar';

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
  onStartChat: (roomType?: 'faith' | 'friends') => void;
  mediaStreamHook: MediaStreamHook;
  showRoomSelection?: boolean;
}

export function Home({ onStartChat, mediaStreamHook, showRoomSelection = false }: HomeProps) {
  const { localStream, error, isLoading, startMedia, stopMedia } = mediaStreamHook;

  const handleStart = async () => {
    await startMedia();
    if (localStream) {
      onStartChat();
    }
  };

  const handleRoomSelection = (roomType: 'faith' | 'friends') => {
    onStartChat(roomType);
  };

  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 flex flex-col min-h-screen bg-charcoal relative">
        <div className="flex items-center gap-2 p-4 border-b-2 border-charcoal/50 bg-charcoal">
          <SidebarTrigger />
        </div>
        <div className="flex-1 flex items-center justify-center p-8 bg-charcoal">
          <div className="max-w-2xl w-full bg-charcoal/80 rounded-2xl shadow-2xl border-2 border-charcoal/50 p-8 text-center backdrop-blur-sm overflow-hidden">
            <h1 className="text-4xl font-bold text-ivory mb-4">Fellow</h1>
            <p className="text-ivory/70 mb-8">Share your faith or find someone to talk with</p>

            {/* Local Video Preview */}
            {localStream && (
              <div className="mb-6">
                <div className="relative w-full max-w-md mx-auto rounded-lg overflow-hidden bg-charcoal/60 border-2 border-charcoal/70 shadow-lg">
                  <VideoPlayer 
                    stream={localStream} 
                    isLocal 
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute top-2 left-2 bg-charcoal/90 text-ivory text-xs px-2 py-1 rounded">
                    You
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-700/50 rounded-lg text-red-200">
                {error}
              </div>
            )}

            {/* Start Chat Button */}
            {!localStream ? (
              <button
                onClick={handleStart}
                disabled={isLoading}
                className="px-8 py-4 bg-moss hover:bg-moss/90 disabled:bg-charcoal/50 disabled:cursor-not-allowed text-ivory font-semibold rounded-lg transition-colors text-lg shadow-lg border-2 border-charcoal/50 box-border max-w-full"
              >
                {isLoading ? 'Requesting permissions...' : 'Start Chat'}
              </button>
            ) : showRoomSelection ? (
              <div className="space-y-4 w-full box-border">
                <h2 className="text-2xl font-semibold text-ivory mb-6">Choose a room</h2>
                <button
                  onClick={() => handleRoomSelection('faith')}
                  className="px-8 py-6 bg-moss hover:bg-moss/90 text-ivory font-semibold rounded-lg transition-colors text-lg w-full shadow-lg border-2 border-charcoal/50 flex items-center justify-center gap-3 box-border"
                >
                  <svg
                    className="h-6 w-6 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                    />
                  </svg>
                  <span className="truncate">Faith</span>
                </button>
                <button
                  onClick={() => handleRoomSelection('friends')}
                  className="px-8 py-6 bg-moss hover:bg-moss/90 text-ivory font-semibold rounded-lg transition-colors text-lg w-full shadow-lg border-2 border-charcoal/50 flex items-center justify-center gap-3 box-border"
                >
                  <svg
                    className="h-6 w-6 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="truncate">Friends</span>
                </button>
                <button
                  onClick={stopMedia}
                  className="px-4 py-2 bg-charcoal/60 hover:bg-charcoal/80 border-2 border-charcoal/70 text-ivory rounded-lg transition-colors text-sm font-medium mt-4 box-border w-full"
                >
                  Stop Camera
                </button>
              </div>
            ) : (
              <div className="space-y-4 w-full box-border">
                <button
                  onClick={() => onStartChat()}
                  className="px-8 py-4 bg-moss hover:bg-moss/90 text-ivory font-semibold rounded-lg transition-colors text-lg w-full shadow-lg border-2 border-charcoal/50 box-border"
                >
                  Find Someone to Chat With
                </button>
                <button
                  onClick={stopMedia}
                  className="px-4 py-2 bg-charcoal/60 hover:bg-charcoal/80 border-2 border-charcoal/70 text-ivory rounded-lg transition-colors text-sm font-medium box-border w-full"
                >
                  Stop Camera
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </SidebarProvider>
  );
}

