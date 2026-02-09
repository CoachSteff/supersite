'use client';

import { useState, useRef, useEffect } from 'react';
import { X, Send, Minimize2, Maximize2, Trash2, Sparkles, Mic } from 'lucide-react';
import { useChat } from './ChatProvider';
import ChatMessage from './ChatMessage';
import VoiceInput from './VoiceInput';
import ActionButton from './ActionButton';
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
    voice?: {
      enabled: boolean;
      language: string;
    };
  };
}

export default function ChatWindow() {
  const { 
    messages, 
    isOpen, 
    isLoading, 
    isStreaming,
    error, 
    suggestions,
    sendMessage, 
    toggleChat,
    clearMessages,
    executeAction
  } = useChat();
  
  const [input, setInput] = useState('');
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

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

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  if (!isOpen || !config?.chat.enabled) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || isStreaming) return;

    const message = input;
    setInput('');
    await sendMessage(message);
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInput(prev => prev + (prev ? ' ' : '') + transcript);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    await sendMessage(suggestion);
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

  const lastMessage = messages[messages.length - 1];
  const showActions = lastMessage?.role === 'assistant' && lastMessage.actions?.length;

  return (
    <div className={windowClassName} style={getPositionStyles()}>
      <div className={styles.chatHeader}>
        <div className={styles.headerLeft}>
          <Sparkles size={18} className={styles.headerIcon} />
          <h3>{config.site.name} AI</h3>
        </div>
        <div className={styles.chatControls}>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className={styles.controlButton}
              aria-label="Clear chat"
              title="Clear conversation"
            >
              <Trash2 size={16} />
            </button>
          )}
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
                <Sparkles size={24} className={styles.welcomeIcon} />
                <p>{config.chat.welcomeMessage}</p>
                <p className={styles.welcomeHint}>
                  Try asking about our services, or use voice input <Mic size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
                </p>
              </div>
            )}
            
            {messages.map((message, index) => (
              <div key={`${message.timestamp}-${index}`}>
                <ChatMessage message={message} />
                {message.actions && message.actions.length > 0 && (
                  <div className={styles.messageActions}>
                    {message.actions.map((action, actionIndex) => (
                      <ActionButton
                        key={actionIndex}
                        action={action}
                        onClick={() => executeAction(action)}
                      />
                    ))}
                  </div>
                )}
              </div>
            ))}
            
            {(isLoading || isStreaming) && !messages.some(m => m.isStreaming) && (
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

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className={styles.suggestions}>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  className={styles.suggestionButton}
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} className={styles.chatInputForm}>
            {config.chat.voice?.enabled && (
              <VoiceInput
                onTranscript={handleVoiceTranscript}
                onListeningChange={setIsListening}
                disabled={isLoading || isStreaming}
                language={config.chat.voice.language}
              />
            )}
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? 'Listening...' : config.chat.placeholder}
              className={styles.chatInput}
              disabled={isLoading || isStreaming}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={isLoading || isStreaming || !input.trim()}
              aria-label="Send message"
            >
              <Send size={20} />
            </button>
          </form>
          
          <div className={styles.chatFooter}>
            <span className={styles.shortcutHint}>
              <kbd>⌘</kbd><kbd>K</kbd> to open • <kbd>Esc</kbd> to close
            </span>
          </div>
        </>
      )}
    </div>
  );
}
