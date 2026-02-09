'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut } from 'lucide-react';
import Avatar from './Avatar';
import styles from '@/styles/UserMenu.module.css';

interface UserMenuProps {
  user: {
    id: string;
    username: string;
    email: string;
    profile: {
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  };
  onClose: () => void;
  onLogout: () => void;
}

export default function UserMenu({ user, onClose, onLogout }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const displayName = user.profile.firstName || user.username;

  return (
    <div ref={menuRef} className={styles.menu}>
      <div className={styles.userInfo}>
        <div className={styles.userAvatar}>
          <Avatar
            src={user.profile.avatar}
            name={displayName}
            size={48}
          />
        </div>
        <div className={styles.userDetails}>
          <div className={styles.userName}>{displayName}</div>
          <div className={styles.userEmail}>{user.email}</div>
        </div>
      </div>

      <div className={styles.divider} />

      <nav className={styles.menuItems}>
        <Link href={`/user/${user.username}`} className={styles.menuItem} onClick={onClose}>
          <User size={16} />
          View Profile
        </Link>
        <Link href="/settings" className={styles.menuItem} onClick={onClose}>
          <Settings size={16} />
          Settings
        </Link>
      </nav>

      <div className={styles.divider} />

      <button onClick={onLogout} className={styles.logoutButton}>
        <LogOut size={16} />
        Sign Out
      </button>
    </div>
  );
}
