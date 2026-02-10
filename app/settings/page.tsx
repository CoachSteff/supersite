'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Lock, Bell, Activity, Cookie } from 'lucide-react';
import ProfileSettings from '@/components/settings/ProfileSettings';
import PrivacySettings from '@/components/settings/PrivacySettings';
import NotificationSettings from '@/components/settings/NotificationSettings';
import ActivitySettings from '@/components/settings/ActivitySettings';
import CookieSettings from '@/components/settings/CookieSettings';
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

export default function SettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/');
        return;
      }

      setUser(data.user);
    } catch (error) {
      console.error('[Settings] Auth check failed:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  function handleUserUpdate(updatedUser: any) {
    setUser(updatedUser);
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Settings</h1>
        <p>Manage your account settings and preferences</p>
      </div>

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
    </div>
  );
}
