'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { User, Settings, LogOut, Bell, Star } from 'lucide-react';
import Avatar from './Avatar';
import NotificationPanel from './NotificationPanel';
import styles from '@/styles/UserMenu.module.css';

interface Notification {
  id: string;
  type: 'system' | 'interaction' | 'content' | 'admin' | 'custom';
  title: string;
  message: string;
  link?: string;
  createdAt: string;
  read: boolean;
  metadata?: {
    actor?: string;
    context?: Record<string, any>;
  };
}

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
  unreadCount: number;
  onClose: () => void;
  onLogout: () => void;
  onNotificationsUpdate: () => void;
}

export default function UserMenu({ 
  user, 
  unreadCount, 
  onClose, 
  onLogout,
  onNotificationsUpdate 
}: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        if (showNotifications) {
          setShowNotifications(false);
        } else {
          onClose();
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose, showNotifications]);

  async function fetchNotifications() {
    try {
      const response = await fetch('/api/notifications?limit=20');
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('[UserMenu] Failed to fetch notifications:', error);
    }
  }

  async function handleMarkAsRead(notificationIds: string[]) {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      
      await fetchNotifications();
      onNotificationsUpdate();
    } catch (error) {
      console.error('[UserMenu] Failed to mark as read:', error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ all: true }),
      });
      
      await fetchNotifications();
      onNotificationsUpdate();
    } catch (error) {
      console.error('[UserMenu] Failed to mark all as read:', error);
    }
  }

  function handleNotificationsClick() {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      fetchNotifications();
    }
  }

  const displayName = user.profile.firstName || user.username;

  return (
    <div ref={menuRef} className={styles.menu}>
      {showNotifications ? (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setShowNotifications(false)}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefresh={fetchNotifications}
        />
      ) : (
        <>
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
            <button 
              onClick={handleNotificationsClick}
              className={styles.menuItem}
            >
              <Bell size={16} />
              Notifications
              {unreadCount > 0 && (
                <span className={styles.badge}>{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </button>
            <Link href="/favourites" className={styles.menuItem} onClick={onClose}>
              <Star size={16} />
              Favourites
            </Link>
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
        </>
      )}
    </div>
  );
}
