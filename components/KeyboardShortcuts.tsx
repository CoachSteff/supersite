'use client';

import { useEffect, useCallback } from 'react';
import { useChat } from './ChatProvider';

interface KeyboardShortcutsProps {
  enabled?: boolean;
}

export default function KeyboardShortcuts({ enabled = true }: KeyboardShortcutsProps) {
  const { toggleChat, isOpen } = useChat();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    const isMod = event.metaKey || event.ctrlKey;

    // Cmd/Ctrl + K: Toggle chat
    if (isMod && event.key === 'k') {
      event.preventDefault();
      toggleChat();
      return;
    }

    // Cmd/Ctrl + /: Focus search
    if (isMod && event.key === '/') {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('supersite:search', { detail: { focus: true } }));
      return;
    }

    // Escape: Close chat (if open)
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      toggleChat();
      return;
    }

    // Cmd/Ctrl + .: Quick action palette (future)
    if (isMod && event.key === '.') {
      event.preventDefault();
      window.dispatchEvent(new CustomEvent('supersite:quickActions'));
      return;
    }
  }, [enabled, toggleChat, isOpen]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return null; // This component doesn't render anything
}

// Optional: Show keyboard shortcuts help
export function KeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: ['⌘', 'K'], description: 'Open AI chat' },
    { keys: ['⌘', '/'], description: 'Focus search' },
    { keys: ['Esc'], description: 'Close chat' },
    { keys: ['⌘', '.'], description: 'Quick actions' },
  ];

  return (
    <div className="keyboard-shortcuts-help">
      <h3>Keyboard Shortcuts</h3>
      <ul>
        {shortcuts.map((shortcut, index) => (
          <li key={index}>
            <span className="keys">
              {shortcut.keys.map((key, i) => (
                <kbd key={i}>{key}</kbd>
              ))}
            </span>
            <span className="description">{shortcut.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
