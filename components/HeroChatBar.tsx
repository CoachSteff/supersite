'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send, Sparkles } from 'lucide-react';
import { useChat } from './ChatProvider';
import VoiceInput from './VoiceInput';
import styles from '@/styles/HeroChatBar.module.css';

interface ClientConfig {
  chat: {
    enabled: boolean;
    placeholder: string;
    voice?: {
      enabled: boolean;
      language: string;
    };
  };
}

interface HeroChatBarProps {
  heading?: string;
  subheading?: string;
  sampleQuestions?: string[];
}

export default function HeroChatBar({
  heading,
  subheading,
  sampleQuestions = [],
}: HeroChatBarProps) {
  const router = useRouter();
  const { isLoading, isStreaming, error, sendMessage } = useChat();

  const [input, setInput] = useState('');
  const [config, setConfig] = useState<ClientConfig | null>(null);
  const [isListening, setIsListening] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => setConfig(data))
      .catch(console.error);
  }, []);

  const submitMessage = useCallback(
    async (raw: string) => {
      const message = raw.trim();
      if (!message || isLoading || isStreaming) return;
      setInput('');
      // Navigate to /chat first so the user lands on the dedicated surface
      // before the streamed response arrives. ChatProvider state is shared
      // across routes, so the message thread carries over.
      router.push('/chat');
      void sendMessage(message);
    },
    [isLoading, isStreaming, sendMessage, router],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await submitMessage(input);
    },
    [input, submitMessage],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) {
        e.preventDefault();
        void submitMessage(input);
      }
    },
    [input, submitMessage],
  );

  const handleVoiceTranscript = useCallback((transcript: string) => {
    setInput((prev) => prev + (prev ? ' ' : '') + transcript);
  }, []);

  const handleSampleClick = useCallback(
    (question: string) => {
      void submitMessage(question);
    },
    [submitMessage],
  );

  if (!config?.chat.enabled) {
    return null;
  }

  const showHeader = !!(heading || subheading);

  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        {showHeader && (
          <header className={styles.heading}>
            {heading && <h1 className={styles.title}>{heading}</h1>}
            {subheading && <p className={styles.subtitle}>{subheading}</p>}
          </header>
        )}

        {error && <div className={styles.error}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
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
            onKeyDown={handleKeyDown}
            placeholder={isListening ? 'Listening…' : config.chat.placeholder}
            disabled={isLoading || isStreaming}
            className={styles.input}
            aria-label="Message"
          />
          <button
            type="submit"
            className={styles.send}
            disabled={isLoading || isStreaming || !input.trim()}
            aria-label="Send message"
          >
            <Send size={20} />
          </button>
        </form>

        {sampleQuestions.length > 0 && (
          <div className={styles.chips} role="group" aria-label="Sample questions">
            {sampleQuestions.map((question) => (
              <button
                key={question}
                type="button"
                onClick={() => handleSampleClick(question)}
                className={styles.chip}
                disabled={isLoading || isStreaming}
              >
                <Sparkles size={14} />
                <span>{question}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
