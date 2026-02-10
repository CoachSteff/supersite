'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from 'lucide-react';
import Avatar from './Avatar';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import Notification from './Notification';
import NotificationBadge from './NotificationBadge';
import styles from '@/styles/AuthButton.module.css';
import '@/styles/NotificationBadge.module.css';

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

export default function AuthButton() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, []);

  useEffect(() => {
    if (!user) return;

    ensureCookieNotification();
    fetchUnreadCount();

    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [user]);

  async function checkAuthStatus() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('[AuthButton] Failed to check auth status:', error);
    }
  }

  async function fetchUnreadCount() {
    try {
      const response = await fetch('/api/notifications?limit=1');
      const data = await response.json();
      
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    } catch (error) {
      console.error('[AuthButton] Failed to fetch unread count:', error);
    }
  }

  async function ensureCookieNotification() {
    try {
      const hasCreated = localStorage.getItem('auth_cookie_notification_created');
      if (hasCreated) return;

      await fetch('/api/notifications/cookie-prompt', { method: 'POST' });
      localStorage.setItem('auth_cookie_notification_created', 'true');
    } catch (error) {
      console.error('[AuthButton] Failed to create cookie notification:', error);
    }
  }

  function handleAuthSuccess(userData: UserProfile) {
    setUser(userData);
    setShowModal(false);
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setShowMenu(false);
      setShowNotification(true);
      router.push('/');
    } catch (error) {
      console.error('[AuthButton] Logout failed:', error);
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <div className={styles.userContainer}>
        <button className={styles.authButton} disabled aria-label="Loading">
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: 'var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <User size={20} color="var(--text-secondary)" />
          </div>
        </button>
      </div>
    );
  }

  if (user) {
    const displayName = user.profile.firstName || user.username || 'User';
    
    return (
      <div className={styles.userContainer}>
        <button
          className={styles.authButton}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="User menu"
          style={{ position: 'relative' }}
        >
          <Avatar
            src={user.profile.avatar}
            name={displayName}
            size={32}
          />
          <NotificationBadge count={unreadCount} show={true} />
        </button>
        {showMenu && (
          <UserMenu
            user={user}
            unreadCount={unreadCount}
            onClose={() => setShowMenu(false)}
            onLogout={handleLogout}
            onNotificationsUpdate={fetchUnreadCount}
          />
        )}
      </div>
    );
  }

  return (
    <>
      <button
        className={styles.authButton}
        onClick={() => setShowModal(true)}
        aria-label="Sign in"
      >
        <div style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          backgroundColor: 'var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <User size={20} color="var(--text-secondary)" />
        </div>
      </button>
      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
      {showNotification && (
        <Notification
          message="You have been signed out successfully"
          onClose={() => setShowNotification(false)}
        />
      )}
    </>
  );
}
