'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { useChat } from './ChatProvider';
import ChatMessage from './ChatMessage';
import ChatSidebar from './ChatSidebar';
import VoiceInput from './VoiceInput';
import ActionButton from './ActionButton';
import styles from '@/styles/Chat.module.css';

interface CenterChatLayoutProps {
  config?: any;
  user?: any;
  children?: React.ReactNode;
}

export default function CenterChatLayout({ config, user, children }: CenterChatLayoutProps) {
  const { messages, sendMessage, isLoading, isStreaming, suggestions } = useChat();
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    await sendMessage(userMessage);
  };

  const handleVoiceInput = (transcript: string) => {
    setInput(transcript);
    setIsListening(false);
  };

  const handleSuggestionClick = async (suggestion: string) => {
    // Auto-send the suggestion (like popup chat does)
    await sendMessage(suggestion);
  };

  return (
    <div className={styles.centerChatLayout}>
      {/* Sidebar */}
      <ChatSidebar 
        siteTitle={config?.site?.name || 'SuperSite'}
        user={user}
      />

      {/* Main Chat Area */}
      <main className={styles.centerChatMain}>
        <div className={styles.centerChatContainer}>
          {/* Messages */}
          <div className={styles.centerChatMessages}>
            {messages.length === 0 ? (
              <div className={styles.centerChatEmpty}>
                <div className={styles.emptyIcon}>
                  <Sparkles size={48} />
                </div>
                <h2 className={styles.emptyTitle}>
                  {config?.chat?.welcomeMessage || 'How can I help you today?'}
                </h2>
                <p className={styles.emptySubtitle}>
                  Ask me anything about this site
                </p>
                {suggestions && suggestions.length > 0 && (
                  <div className={styles.quickActions}>
                    {suggestions.slice(0, 4).map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={styles.quickActionButton}
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {messages.map((message, idx) => (
                  <ChatMessage key={idx} message={message} />
                ))}
                <div ref={messagesEndRef} />
              </>
            )}

            {isLoading && !isStreaming && (
              <div className={styles.loadingIndicator}>
                <div className={styles.thinkingDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className={styles.centerChatInputContainer}>
            <form onSubmit={handleSubmit} className={styles.centerChatForm}>
              <div className={styles.inputWrapper}>
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={config?.chat?.placeholder || 'Message AI...'}
                  disabled={isLoading}
                  className={styles.centerChatInput}
                />
                
                {config?.chat?.voice?.enabled && (
                  <VoiceInput
                    onTranscript={handleVoiceInput}
                  />
                )}

                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className={styles.centerChatSubmit}
                  aria-label="Send message"
                >
                  <Send size={20} />
                </button>
              </div>
            </form>

            {/* Action Suggestions */}
            {suggestions && suggestions.length > 0 && messages.length > 0 && (
              <div className={styles.centerSuggestions}>
                {suggestions.slice(0, 3).map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={styles.quickActionButton}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Page content - render in hidden container for SEO/routing but not displayed in UI */}
      <div style={{ position: 'absolute', left: '-9999px', visibility: 'hidden' }} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
