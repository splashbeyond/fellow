import { useEffect, useState } from 'react';
import { signalingService } from '../services/signaling';

export function useSocket() {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = signalingService.connect();
    
    if (socket) {
      socket.on('connect', () => {
        setIsConnected(true);
        console.log('Connected to signaling server');
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from signaling server');
      });
    }

    return () => {
      signalingService.disconnect();
    };
  }, []);

  return { isConnected };
}

