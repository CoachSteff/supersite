'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, Clock, User, MessageSquare, Settings, LogOut } from 'lucide-react';
import { useChat } from './ChatProvider';
import Avatar from './Avatar';
import AuthModal from './AuthModal';
import styles from '@/styles/Chat.module.css';

interface ChatSidebarProps {
  siteTitle?: string;
  user?: any;
}

export default function ChatSidebar({ siteTitle = 'SuperSite', user }: ChatSidebarProps) {
  const { messages, clearMessages } = useChat();
  const [conversations] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleNewChat = () => {
    clearMessages();
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    window.location.reload();
  };

  return (
    <aside className={styles.chatSidebar}>
      {/* Logo */}
      <div className={styles.sidebarHeader}>
        <Link href="/" className={styles.sidebarLogo}>
          <MessageSquare size={24} />
          <span>{siteTitle}</span>
        </Link>
      </div>

      {/* New Chat Button */}
      <button 
        className={styles.newChatButton}
        onClick={handleNewChat}
      >
        <Plus size={20} />
        <span>New chat</span>
      </button>

      {/* Search */}
      <div className={styles.sidebarSearch}>
        <Search size={18} />
        <input
          type="text"
          placeholder="Search conversations..."
          className={styles.searchInput}
        />
      </div>

      {/* Recent Conversations */}
      <nav className={styles.sidebarNav}>
        <div className={styles.navSection}>
          <div className={styles.navSectionHeader}>
            <Clock size={16} />
            <span>Recent</span>
          </div>
          {messages.length > 0 ? (
            <div className={styles.conversationItem}>
              <span className={styles.conversationTitle}>
                Current conversation
              </span>
              <span className={styles.conversationMeta}>
                {messages.length} messages
              </span>
            </div>
          ) : (
            <div className={styles.emptyState}>
              No conversations yet
            </div>
          )}
        </div>
      </nav>

      {/* User Profile */}
      <div className={styles.sidebarFooter}>
        {user ? (
          <div className={styles.userProfile}>
            <Avatar
              name={user.name || user.email}
            />
            <div className={styles.userInfo}>
              <div className={styles.userName}>
                {user.name || user.email}
              </div>
              <div className={styles.userEmail}>
                {user.email}
              </div>
            </div>
            <button
              className={styles.iconButton}
              aria-label="Settings"
            >
              <Settings size={18} />
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setShowAuthModal(true)}
            className={styles.loginButton}
          >
            <User size={18} />
            <span>Sign in</span>
          </button>
        )}
      </div>

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </aside>
  );
}
