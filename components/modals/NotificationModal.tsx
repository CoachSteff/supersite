'use client';

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import NotificationPanel from '../NotificationPanel';

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

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationsUpdate?: () => void;
}

export default function NotificationModal({ isOpen, onClose, onNotificationsUpdate }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  async function loadNotifications() {
    try {
      const response = await fetch('/api/notifications');
      const data = await response.json();
      
      if (data.notifications) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('[NotificationModal] Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(notificationIds: string[]) {
    try {
      await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationIds }),
      });
      
      setNotifications(prev =>
        prev.map(n => notificationIds.includes(n.id) ? { ...n, read: true } : n)
      );
      
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } catch (error) {
      console.error('[NotificationModal] Failed to mark notifications as read:', error);
    }
  }

  async function handleMarkAllAsRead() {
    try {
      await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      
      if (onNotificationsUpdate) {
        onNotificationsUpdate();
      }
    } catch (error) {
      console.error('[NotificationModal] Failed to mark all as read:', error);
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Notifications" size="md">
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : (
        <NotificationPanel
          notifications={notifications}
          onClose={onClose}
          onMarkAsRead={handleMarkAsRead}
          onMarkAllAsRead={handleMarkAllAsRead}
          onRefresh={loadNotifications}
        />
      )}
    </Modal>
  );
}
