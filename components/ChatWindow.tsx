'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Maximize2 } from 'lucide-react';
import { useChat } from './ChatProvider';
import ChatMessage from './ChatMessage';
import styles from '@/styles/Chat.module.css';

interface ClientConfig {
  site: {
    name: string;
  };
  chat: {
    enabled: boolean;
    window: {
      position: string;
      width: number;
      height: number;
    };
    welcomeMessage: string;
    placeholder: string;
  };
}

export default function ChatWindow() {
  const { messages, isOpen, isLoading, error, sendMessage, toggleChat } = useChat();
  const [input, setInput] = useState('');
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized]);

  if (!isOpen || !config?.chat.enabled) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const getPositionStyles = (): React.CSSProperties => {
    const { position, width, height } = config.chat.window;
    
    const baseStyles: React.CSSProperties = {
      maxHeight: isMinimized ? '60px' : `${height}px`,
    };

    const isDocked = position.includes('docked');

    if (isDocked) {
      switch (position) {
        case 'right-docked':
          return {
            ...baseStyles,
            width: `${width}px`,
            height: '100vh',
            maxHeight: '100vh',
            top: 0,
            right: 0,
            bottom: 'auto',
            borderRadius: 0,
          };
        case 'left-docked':
          return {
            ...baseStyles,
            width: `${width}px`,
            height: '100vh',
            maxHeight: '100vh',
            top: 0,
            left: 0,
            bottom: 'auto',
            borderRadius: 0,
          };
        case 'bottom-docked':
          return {
            ...baseStyles,
            width: '100%',
            height: `${height}px`,
            maxHeight: isMinimized ? '60px' : `${height}px`,
            bottom: 0,
            left: 0,
            right: 0,
            top: 'auto',
            borderRadius: 0,
          };
      }
    }

    const popupStyles: React.CSSProperties = {
      ...baseStyles,
      width: `${width}px`,
    };

    switch (position) {
      case 'bottom-left':
        popupStyles.bottom = '80px';
        popupStyles.left = '20px';
        break;
      case 'bottom-center':
        popupStyles.bottom = '80px';
        popupStyles.left = '50%';
        popupStyles.transform = 'translateX(-50%)';
        break;
      case 'bottom-right':
      default:
        popupStyles.bottom = '80px';
        popupStyles.right = '20px';
        break;
    }

    return popupStyles;
  };

  const isDocked = config.chat.window.position.includes('docked');
  const windowClassName = isDocked 
    ? `${styles.chatWindow} ${styles.chatWindowDocked}`
    : styles.chatWindow;

  return (
    <div className={windowClassName} style={getPositionStyles()}>
      <div className={styles.chatHeader}>
        <h3>{config.site.name} Assistant</h3>
        <div className={styles.chatControls}>
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className={styles.controlButton}
            aria-label={isMinimized ? 'Maximize' : 'Minimize'}
          >
            {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
          </button>
          <button
            onClick={toggleChat}
            className={styles.controlButton}
            aria-label="Close chat"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          <div className={styles.chatMessages}>
            {messages.length === 0 && (
              <div className={styles.welcomeMessage}>
                {config.chat.welcomeMessage}
              </div>
            )}
            
            {messages.map((message) => (
              <ChatMessage key={`${message.timestamp}-${message.role}`} message={message} />
            ))}
            
            {isLoading && (
              <div className={styles.loadingMessage}>
                <div className={styles.loadingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className={styles.chatInputForm}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={config.chat.placeholder}
              className={styles.chatInput}
              disabled={isLoading}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || !input.trim()}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
