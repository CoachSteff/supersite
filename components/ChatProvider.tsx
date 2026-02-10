'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { parseActions, AIAction, actionExecutor } from '@/lib/ai-actions';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  actions?: AIAction[];
  isStreaming?: boolean;
}

interface ChatConfig {
  streaming: boolean;
  memory: {
    enabled: boolean;
    maxMessages: number;
  };
  actions: {
    enabled: boolean;
  };
}

interface ChatContextType {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
  isStreaming: boolean;
  error: string | null;
  suggestions: string[];
  sendMessage: (content: string) => Promise<void>;
  toggleChat: () => void;
  clearMessages: () => void;
  executeAction: (action: AIAction) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

const STORAGE_KEY = 'supersite_chat_history';
const CHAT_STATE_KEY = 'supersite_chat_open';
const DEFAULT_CONFIG: ChatConfig = {
  streaming: true,
  memory: { enabled: true, maxMessages: 50 },
  actions: { enabled: true },
};

export function ChatProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isOpen, setIsOpen] = useState(() => {
    // Initialize from localStorage to persist across page navigation
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(CHAT_STATE_KEY);
      return stored === 'true';
    }
    return false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [config, setConfig] = useState<ChatConfig>(DEFAULT_CONFIG);

  // Extract current language from pathname
  const getCurrentLanguage = useCallback(() => {
    const pathParts = pathname.split('/').filter(Boolean);
    const supportedLanguages = ['en', 'nl', 'fr'];
    const firstSegment = pathParts[0];
    return supportedLanguages.includes(firstSegment) ? firstSegment : 'en';
  }, [pathname]);

  // Load config and messages from storage
  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        setConfig({
          streaming: data.chat?.streaming ?? true,
          memory: data.chat?.memory ?? { enabled: true, maxMessages: 50 },
          actions: data.chat?.actions ?? { enabled: true },
        });
      })
      .catch(console.error);

    // Load persisted messages
    if (typeof window !== 'undefined' && config.memory.enabled) {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setMessages(parsed.slice(-config.memory.maxMessages));
        } catch (e) {
          console.error('Failed to parse stored messages:', e);
        }
      }
    }
  }, []);

  // Persist messages to storage
  useEffect(() => {
    if (typeof window !== 'undefined' && config.memory.enabled && messages.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-config.memory.maxMessages)));
    }
  }, [messages, config.memory]);

  const sendMessageStreaming = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsStreaming(true);
    setError(null);

    // Add placeholder for assistant message
    const placeholderMessage: ChatMessage = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
      isStreaming: true,
    };
    setMessages(prev => [...prev, placeholderMessage]);

    try {
      const response = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          currentLanguage: getCurrentLanguage(),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');
      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.token) {
                fullContent += data.token;
                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIdx = newMessages.length - 1;
                  if (newMessages[lastIdx]?.role === 'assistant') {
                    newMessages[lastIdx] = {
                      ...newMessages[lastIdx],
                      content: fullContent,
                    };
                  }
                  return newMessages;
                });
              }
              
              if (data.content) {
                // Final message - parse actions
                const { cleanText, actions } = config.actions.enabled 
                  ? parseActions(data.content)
                  : { cleanText: data.content, actions: [] };
                
                // Extract suggestions
                const newSuggestions = actions
                  .filter(a => a.type === 'suggest')
                  .map(a => a.payload.text as string);
                setSuggestions(newSuggestions);

                setMessages(prev => {
                  const newMessages = [...prev];
                  const lastIdx = newMessages.length - 1;
                  if (newMessages[lastIdx]?.role === 'assistant') {
                    newMessages[lastIdx] = {
                      role: 'assistant',
                      content: cleanText,
                      timestamp: data.timestamp,
                      actions: actions.filter(a => a.type !== 'suggest'),
                      isStreaming: false,
                    };
                  }
                  return newMessages;
                });
              }
              
              if (data.error) {
                throw new Error(data.error);
              }
            } catch (e) {
              if (e instanceof SyntaxError) continue;
              throw e;
            }
          }
        }
      }
    } catch (err) {
      console.error('Chat stream error:', err);
      setError('Failed to send message. Please try again.');
      // Remove placeholder message on error
      setMessages(prev => prev.filter(m => !m.isStreaming));
    } finally {
      setIsStreaming(false);
    }
  }, [messages, config.actions.enabled]);

  const sendMessageNonStreaming = useCallback(async (content: string) => {
    const userMessage: ChatMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({ role, content })),
          currentLanguage: getCurrentLanguage(),
        }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const data = await response.json();
      
      // Parse actions
      const { cleanText, actions } = config.actions.enabled 
        ? parseActions(data.content)
        : { cleanText: data.content, actions: [] };
      
      // Extract suggestions
      const newSuggestions = actions
        .filter(a => a.type === 'suggest')
        .map(a => a.payload.text as string);
      setSuggestions(newSuggestions);

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: cleanText,
        timestamp: data.timestamp,
        actions: actions.filter(a => a.type !== 'suggest'),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Chat error:', err);
      setError('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [messages, config.actions.enabled]);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return;
    
    if (config.streaming) {
      await sendMessageStreaming(content);
    } else {
      await sendMessageNonStreaming(content);
    }
  }, [config.streaming, sendMessageStreaming, sendMessageNonStreaming]);

  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      const newState = !prev;
      // Persist the open/closed state to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(CHAT_STATE_KEY, String(newState));
      }
      return newState;
    });
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSuggestions([]);
    setError(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const executeAction = useCallback(async (action: AIAction) => {
    if (!config.actions.enabled) return;
    await actionExecutor.execute(action);
  }, [config.actions.enabled]);

  return (
    <ChatContext.Provider
      value={{
        messages,
        isOpen,
        isLoading,
        isStreaming,
        error,
        suggestions,
        sendMessage,
        toggleChat,
        clearMessages,
        executeAction,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
