'use client';

import { useState } from 'react';
import styles from '@/styles/SettingsForm.module.css';

interface NotificationSettingsProps {
  user: any;
  onUpdate: (user: any) => void;
}

export default function NotificationSettings({ user, onUpdate }: NotificationSettingsProps) {
  const [settings, setSettings] = useState(user.settings.notifications);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await fetch('/api/user/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notifications: settings }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccess('Notification settings updated');
      onUpdate({ ...user, settings: data.settings });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Notification Preferences</h2>
      <p className={styles.description}>Choose what notifications you want to receive</p>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.toggleField}>
        <div>
          <label>New Posts</label>
          <p className={styles.fieldDescription}>
            Get notified when new posts are published
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.newPosts}
          onChange={(e) => setSettings({ ...settings, newPosts: e.target.checked })}
          className={styles.toggle}
        />
      </div>

      <div className={styles.toggleField}>
        <div>
          <label>Replies</label>
          <p className={styles.fieldDescription}>
            Get notified when someone replies to your content
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.replies}
          onChange={(e) => setSettings({ ...settings, replies: e.target.checked })}
          className={styles.toggle}
        />
      </div>

      <div className={styles.toggleField}>
        <div>
          <label>Mentions</label>
          <p className={styles.fieldDescription}>
            Get notified when someone mentions you
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.mentions}
          onChange={(e) => setSettings({ ...settings, mentions: e.target.checked })}
          className={styles.toggle}
        />
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
