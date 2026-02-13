'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Plus, Search, Clock, User, MessageSquare, Settings, LogOut, Bell, Star } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useChat } from '@/components/ChatProvider';
import Avatar from '@/components/Avatar';
import AuthModal from '@/components/AuthModal';
import NotificationBadge from '@/components/NotificationBadge';
import NotificationModal from '@/components/modals/NotificationModal';
import SettingsModal from '@/components/modals/SettingsModal';
import ProfileModal from '@/components/modals/ProfileModal';
import FavouritesModal from '@/components/modals/FavouritesModal';
import styles from '@/styles/Chat.module.css';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  profile: {
    firstName?: string;
    lastName?: string;
    avatar?: string;
  };
}

interface ChatSidebarProps {
  siteTitle?: string;
}

export default function ChatSidebar({ siteTitle = 'SuperSite' }: ChatSidebarProps) {
  const router = useRouter();
  const { messages, clearMessages } = useChat();
  const [conversations] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeModal, setActiveModal] = useState<'notifications' | 'settings' | 'profile' | 'favourites' | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!user) return;

    fetchUnreadCount();
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showUserMenu]);

  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('[ChatSidebar] Failed to check auth status:', error);
    }
  }

  async function fetchUnreadCount() {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications?limit=1');
      const data = await response.json();
      
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('[ChatSidebar] Failed to fetch unread count:', error);
    }
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setShowUserMenu(false);
      router.push('/');
    } catch (error) {
      console.error('[ChatSidebar] Logout failed:', error);
    }
  }

  const handleNewChat = () => {
    clearMessages();
  };

  const handleAuthSuccess = (userData: UserProfile) => {
    setUser(userData);
    setShowAuthModal(false);
  };

  const displayName = user?.profile.firstName
    ? `${user.profile.firstName}${user.profile.lastName ? ' ' + user.profile.lastName : ''}`
    : (user?.username || 'User');

  function handleMenuItemClick(modal: typeof activeModal) {
    setActiveModal(modal);
    setShowUserMenu(false);
  }

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
          <div className={styles.userProfileContainer} ref={menuRef}>
            <button
              className={styles.userProfile}
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div style={{ position: 'relative' }}>
                <Avatar
                  src={user.profile.avatar}
                  name={displayName}
                  size={40}
                />
                <NotificationBadge count={unreadCount} show={true} />
              </div>
              <div className={styles.userInfo}>
                <div className={styles.userName}>
                  {displayName}
                </div>
                <div className={styles.userEmail}>
                  {user.email}
                </div>
              </div>
            </button>

            {showUserMenu && (
              <div className={styles.chatUserMenu}>
                <button
                  onClick={() => handleMenuItemClick('notifications')}
                  className={styles.chatMenuItem}
                >
                  <Bell size={18} />
                  <span>Notifications</span>
                  {unreadCount > 0 && (
                    <span className={styles.badge}>{unreadCount}</span>
                  )}
                </button>
                <button
                  onClick={() => handleMenuItemClick('favourites')}
                  className={styles.chatMenuItem}
                >
                  <Star size={18} />
                  <span>Favourites</span>
                </button>
                <button
                  onClick={() => handleMenuItemClick('profile')}
                  className={styles.chatMenuItem}
                >
                  <User size={18} />
                  <span>View Profile</span>
                </button>
                <button
                  onClick={() => handleMenuItemClick('settings')}
                  className={styles.chatMenuItem}
                >
                  <Settings size={18} />
                  <span>Settings</span>
                </button>
                {/* TODO: Add Security & Privacy section with Cookie Preferences (see docs/SECURITY_PRIVACY_MENU.md) */}
                <div className={styles.menuDivider}></div>
                <button
                  onClick={handleLogout}
                  className={`${styles.chatMenuItem} ${styles.logoutMenuItem}`}
                >
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
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

      {/* Modals */}
      <NotificationModal
        isOpen={activeModal === 'notifications'}
        onClose={() => setActiveModal(null)}
        onNotificationsUpdate={fetchUnreadCount}
      />
      <SettingsModal
        isOpen={activeModal === 'settings'}
        onClose={() => setActiveModal(null)}
      />
      <ProfileModal
        isOpen={activeModal === 'profile'}
        onClose={() => setActiveModal(null)}
        username={user?.username}
      />
      <FavouritesModal
        isOpen={activeModal === 'favourites'}
        onClose={() => setActiveModal(null)}
      />
    </aside>
  );
}
