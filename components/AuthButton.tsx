'use client';

import { useState, useEffect } from 'react';
import { User } from 'lucide-react';
import AuthModal from './AuthModal';
import UserMenu from './UserMenu';
import styles from '@/styles/AuthButton.module.css';

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
  const [user, setUser] = useState<UserProfile | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkAuthStatus();
  }, []);

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

  function handleAuthSuccess(userData: UserProfile) {
    setUser(userData);
    setShowModal(false);
  }

  async function handleLogout() {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setShowMenu(false);
    } catch (error) {
      console.error('[AuthButton] Logout failed:', error);
    }
  }

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <button className={styles.authButton} disabled aria-label="Loading">
        <User size={20} />
      </button>
    );
  }

  if (user) {
    return (
      <div className={styles.userContainer}>
        <button
          className={styles.authButton}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="User menu"
        >
          {user.profile.avatar ? (
            <img src={user.profile.avatar} alt={user.username} className={styles.avatar} />
          ) : (
            <User size={20} />
          )}
        </button>
        {showMenu && (
          <UserMenu
            user={user}
            onClose={() => setShowMenu(false)}
            onLogout={handleLogout}
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
        <User size={20} />
      </button>
      {showModal && (
        <AuthModal
          onClose={() => setShowModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}
