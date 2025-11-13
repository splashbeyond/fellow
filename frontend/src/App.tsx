import { useState } from 'react';
import { Home } from './components/Home';
import { VideoRoom } from './components/VideoRoom';
import { useSocket } from './hooks/useSocket';
import { useMediaStream } from './hooks/useMediaStream';

type AppState = 'home' | 'chat';

function App() {
  const [appState, setAppState] = useState<AppState>('home');
  const { isConnected } = useSocket();
  const mediaStreamHook = useMediaStream();

  return (
    <div className="App">
      {!isConnected && (
        <div className="fixed top-0 left-0 right-0 bg-red-600 text-white p-2 text-center z-50">
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

