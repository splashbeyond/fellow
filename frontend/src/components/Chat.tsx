import { useState, useEffect, useRef } from 'react';
import { Textarea } from './ui/textarea';
import { signalingService } from '../services/signaling';

interface Message {
  id: string;
  text: string;
  isOwn: boolean;
  timestamp: Date;
}

interface ChatProps {
  roomId: string | null;
  isConnected: boolean;
}

export function Chat({ roomId, isConnected }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Listen for incoming messages
  useEffect(() => {
    if (!roomId) return;

    const handleMessage = (data: { text: string; roomId: string }) => {
      if (data.roomId === roomId) {
        setMessages(prev => [...prev, {
          id: Date.now().toString() + Math.random(),
          text: data.text,
          isOwn: false,
          timestamp: new Date()
        }]);
      }
    };

    signalingService.onChatMessage(handleMessage);

    return () => {
      signalingService.offChatMessage(handleMessage);
    };
  }, [roomId]);

  // Clear messages when room changes
  useEffect(() => {
    setMessages([]);
  }, [roomId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !roomId || !isConnected) return;

    // Add own message to list
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue.trim(),
      isOwn: true,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newMessage]);

    // Send message via signaling service
    signalingService.sendChatMessage(roomId, inputValue.trim());

    // Clear input
    setInputValue('');
    textareaRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-charcoal/95 border-r-2 border-ivory/30 shadow-2xl">
      {/* Chat Header */}
      <div className="p-4 border-b border-charcoal/50 bg-charcoal/90">
        <h3 className="font-semibold text-ivory">Chat</h3>
        {!isConnected && (
          <p className="text-xs text-ivory/60 mt-1">Waiting for connection...</p>
        )}
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-charcoal">
        {messages.length === 0 ? (
          <div className="text-center text-ivory/50 text-sm mt-8">
            {isConnected ? 'No messages yet. Start the conversation!' : 'Connect to start chatting'}
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg px-3 py-2 ${
                  message.isOwn
                    ? 'bg-moss text-ivory'
                    : 'bg-charcoal/60 text-ivory border border-charcoal/50'
                }`}
              >
                <p className="text-sm whitespace-pre-wrap break-words">{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.isOwn ? 'text-ivory/70' : 'text-charcoal/50'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat Input */}
      <form onSubmit={handleSend} className="p-4 border-t border-charcoal/50 bg-charcoal/90">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isConnected ? "Type your message..." : "Connect to chat"}
            disabled={!isConnected || !roomId}
            rows={2}
            className="resize-none"
          />
          <button
            type="submit"
            disabled={!inputValue.trim() || !isConnected || !roomId}
            className="px-4 py-2 bg-moss hover:bg-moss/90 disabled:bg-charcoal/50 disabled:cursor-not-allowed text-ivory rounded-md transition-colors self-end"
            aria-label="Send message"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </button>
        </div>
        <p className="text-xs text-ivory/50 mt-2">
          Press Enter to send, Shift+Enter for new line
        </p>
      </form>
    </div>
  );
}

