'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { getRelativeTimeString } from '@/lib/time-utils';
import CookiePreferencesForm from './CookiePreferencesForm';
import styles from '@/styles/NotificationPanel.module.css';

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

interface NotificationPanelProps {
  notifications: Notification[];
  onClose: () => void;
  onMarkAsRead: (notificationIds: string[]) => void;
  onMarkAllAsRead: () => void;
  onRefresh: () => void;
}

export default function NotificationPanel({
  notifications,
  onClose,
  onMarkAsRead,
  onMarkAllAsRead,
  onRefresh,
}: NotificationPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [expandedNotification, setExpandedNotification] = useState<string | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
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

  function handleNotificationClick(notification: Notification) {
    if (notification.metadata?.context?.type === 'cookie-preferences') {
      setExpandedNotification(notification.id);
      if (!notification.read) {
        onMarkAsRead([notification.id]);
      }
      return;
    }

    if (!notification.read) {
      onMarkAsRead([notification.id]);
    }

    if (notification.link) {
      router.push(notification.link);
    }

    onClose();
  }

  function handleCookiePreferencesSaved() {
    setExpandedNotification(null);
    onRefresh();
  }

  function handleMarkAllAsRead() {
    onMarkAllAsRead();
    onRefresh();
  }

  const hasUnread = notifications.some(n => !n.read);

  return (
    <div ref={panelRef} className={styles.panel}>
      <div className={styles.header}>
        <h3 className={styles.title}>Notifications</h3>
        {hasUnread && (
          <button
            onClick={handleMarkAllAsRead}
            className={styles.markAllButton}
            aria-label="Mark all as read"
          >
            <CheckCircle2 size={14} />
            Mark all read
          </button>
        )}
      </div>

      <div className={styles.divider} />

      {notifications.length === 0 ? (
        <div className={styles.empty}>
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => {
            const isCookiePrefs = notification.metadata?.context?.type === 'cookie-preferences';
            const isExpanded = expandedNotification === notification.id;

            return (
              <div key={notification.id}>
                <button
                  onClick={() => handleNotificationClick(notification)}
                  className={`${styles.item} ${!notification.read ? styles.unread : ''} ${isExpanded ? styles.expanded : ''}`}
                  aria-label={`Notification: ${notification.title}`}
                >
                  <div className={styles.itemContent}>
                    <div className={styles.itemTitle}>{notification.title}</div>
                    <div className={styles.itemMessage}>{notification.message}</div>
                    <div className={styles.itemTime}>
                      {getRelativeTimeString(notification.createdAt)}
                    </div>
                  </div>
                </button>
                
                {isCookiePrefs && isExpanded && (
                  <div className={styles.expandedContent}>
                    <CookiePreferencesForm 
                      onSave={handleCookiePreferencesSaved}
                      compact={true}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
