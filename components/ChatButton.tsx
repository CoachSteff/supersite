'use client';

import { Sparkles, MessageCircle } from 'lucide-react';
import { useChat } from './ChatProvider';
import { useEffect, useState } from 'react';
import styles from '@/styles/ChatButton.module.css';

interface ClientConfig {
  chat: {
    enabled: boolean;
    button: {
      position: string;
      offsetX: number;
      offsetY: number;
      icon?: string;
    };
    window?: {
      layout?: 'popup' | 'center' | 'sidebar';
    };
  };
}

export default function ChatButton() {
  const { toggleChat, isOpen } = useChat();
  const [config, setConfig] = useState<ClientConfig | null>(null);

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => setConfig(data))
      .catch(console.error);
  }, []);

  if (!config?.chat.enabled) {
    return null;
  }

  // Don't show button for center or sidebar layouts (chat is always visible)
  if (config && config.chat?.window?.layout && ['center', 'sidebar'].includes(config.chat.window.layout)) {
    return null;
  }

  const getPositionStyles = () => {
    if (!config) return {};
    const { position, offsetX, offsetY } = config.chat.button;
    
    const styles: React.CSSProperties = {
      bottom: `${offsetY}px`,
    };

    switch (position) {
      case 'bottom-left':
        styles.left = `${20 + offsetX}px`;
        break;
      case 'bottom-center':
        styles.left = '50%';
        styles.transform = `translateX(calc(-50% + ${offsetX}px))`;
        break;
      case 'bottom-right':
        styles.right = `${20 + Math.abs(offsetX)}px`;
        break;
    }

    return styles;
  };

  // Use Sparkles for AI-first feel, MessageCircle as fallback
  const Icon = config?.chat.button?.icon === 'sparkles' ? Sparkles : MessageCircle;

  return (
    <button
      className={`${styles.chatButton} ${isOpen ? styles.chatButtonOpen : ''}`}
      onClick={toggleChat}
      style={getPositionStyles()}
      aria-label="Toggle AI chat"
      title="Chat with AI (⌘K)"
    >
      <Icon size={24} />
    </button>
  );
}
