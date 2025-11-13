import { useState, useEffect } from 'react';
import { useUser, SignIn, SignUp } from '@clerk/clerk-react';
import { Home } from './components/Home';
import { VideoRoom } from './components/VideoRoom';
import { Logo } from './components/Logo';
import { useSocket } from './hooks/useSocket';
import { useMediaStream } from './hooks/useMediaStream';

type AppState = 'home' | 'chat' | 'sign-in' | 'sign-up';

function App() {
  const { isLoaded, isSignedIn, user } = useUser();
  const [appState, setAppState] = useState<AppState>('sign-in');
  const { isConnected } = useSocket();
  const mediaStreamHook = useMediaStream();

  // Update app state when auth status changes
  useEffect(() => {
    if (isLoaded && isSignedIn && appState === 'sign-in') {
      setAppState('home');
    }
  }, [isLoaded, isSignedIn, appState]);

  // Show loading state while Clerk is initializing
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-charcoal">Loading...</div>
      </div>
    );
  }

  // Show sign-in/sign-up if not authenticated
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center p-4 relative">
        <div className="absolute top-4 left-4 z-50">
          <Logo size="md" />
        </div>
        <div className="max-w-md w-full">
          {appState === 'sign-in' ? (
            <div>
              <SignIn 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "bg-sage shadow-xl",
                    headerTitle: "text-charcoal",
                    headerSubtitle: "text-charcoal/70",
                    socialButtonsBlockButton: "bg-moss hover:bg-moss/90 text-ivory border-moss",
                    formButtonPrimary: "bg-moss hover:bg-moss/90 text-ivory",
                    formFieldInput: "bg-ivory text-charcoal border-sage",
                    formFieldLabel: "text-charcoal",
                    footerActionLink: "text-moss",
                  }
                }}
              />
              <div className="text-center mt-4">
                <button
                  onClick={() => setAppState('sign-up')}
                  className="text-moss hover:underline text-sm"
                >
                  Don't have an account? Sign up
                </button>
              </div>
            </div>
          ) : (
            <div>
              <SignUp 
                routing="hash"
                appearance={{
                  elements: {
                    rootBox: "mx-auto",
                    card: "bg-sage shadow-xl",
                    headerTitle: "text-charcoal",
                    headerSubtitle: "text-charcoal/70",
                    socialButtonsBlockButton: "bg-moss hover:bg-moss/90 text-ivory border-moss",
                    formButtonPrimary: "bg-moss hover:bg-moss/90 text-ivory",
                    formFieldInput: "bg-ivory text-charcoal border-sage",
                    formFieldLabel: "text-charcoal",
                    footerActionLink: "text-moss",
                  }
                }}
              />
              <div className="text-center mt-4">
                <button
                  onClick={() => setAppState('sign-in')}
                  className="text-moss hover:underline text-sm"
                >
                  Already have an account? Sign in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Authenticated user - show main app
  return (
    <div className="App">
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-moss text-ivory p-2 text-center z-50">
          Connecting to server...
        </div>
      )}
      
      {appState === 'home' && (
        <Home 
          onStartChat={() => setAppState('chat')}
          mediaStreamHook={mediaStreamHook}
        />
      )}
      
      {appState === 'chat' && (
        <VideoRoom 
          onEndCall={() => setAppState('home')}
          mediaStreamHook={mediaStreamHook}
        />
      )}
    </div>
  );
}

export default App;

