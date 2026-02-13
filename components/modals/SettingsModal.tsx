'use client';

import { useState, useEffect } from 'react';
import { User, Lock, Bell, Activity, Cookie } from 'lucide-react';
import Modal from '../Modal';
import ProfileSettings from '../settings/ProfileSettings';
import PrivacySettings from '../settings/PrivacySettings';
import NotificationSettings from '../settings/NotificationSettings';
import ActivitySettings from '../settings/ActivitySettings';
import CookieSettings from '../settings/CookieSettings';
import styles from '@/styles/Settings.module.css';

type Tab = 'profile' | 'privacy' | 'notifications' | 'cookies' | 'activity';

interface TabConfig {
  id: Tab;
  label: string;
  icon: React.ComponentType<any>;
}

const tabs: TabConfig[] = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'privacy', label: 'Privacy', icon: Lock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'cookies', label: 'Cookies', icon: Cookie },
  { id: 'activity', label: 'Activity', icon: Activity },
];

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      checkAuth();
    }
  }, [isOpen]);

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (data.user) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('[SettingsModal] Auth check failed:', error);
    } finally {
      setLoading(false);
    }
  }

  function handleUserUpdate(updatedUser: any) {
    setUser(updatedUser);
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings" size="lg">
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : user ? (
        <div className={styles.content}>
          <nav className={styles.sidebar}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${styles.tabButton} ${activeTab === tab.id ? styles.tabButtonActive : ''}`}
                >
                  <Icon size={20} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          <main className={styles.main}>
            {activeTab === 'profile' && (
              <ProfileSettings user={user} onUpdate={handleUserUpdate} />
            )}
            {activeTab === 'privacy' && (
              <PrivacySettings user={user} onUpdate={handleUserUpdate} />
            )}
            {activeTab === 'notifications' && (
              <NotificationSettings user={user} onUpdate={handleUserUpdate} />
            )}
            {activeTab === 'cookies' && (
              <CookieSettings user={user} />
            )}
            {activeTab === 'activity' && (
              <ActivitySettings user={user} />
            )}
          </main>
        </div>
      ) : (
        <div>Please log in to access settings.</div>
      )}
    </Modal>
  );
}
