'use client';

import { useState } from 'react';
import styles from '@/styles/SettingsForm.module.css';

interface PrivacySettingsProps {
  user: any;
  onUpdate: (user: any) => void;
}

export default function PrivacySettings({ user, onUpdate }: PrivacySettingsProps) {
  const [settings, setSettings] = useState(user.settings.privacy);
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
        body: JSON.stringify({ privacy: settings }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update settings');
      }

      setSuccess('Privacy settings updated');
      onUpdate({ ...user, settings: data.settings });
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Privacy Settings</h2>
      <p className={styles.description}>Control who can see your information</p>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.toggleField}>
        <div>
          <label>Profile Visibility</label>
          <p className={styles.fieldDescription}>
            Allow others to view your full profile
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.profileVisible}
          onChange={(e) => setSettings({ ...settings, profileVisible: e.target.checked })}
          className={styles.toggle}
        />
      </div>

      <div className={styles.toggleField}>
        <div>
          <label>Email Visibility</label>
          <p className={styles.fieldDescription}>
            Show your email address on your public profile
          </p>
        </div>
        <input
          type="checkbox"
          checked={settings.emailVisible}
          onChange={(e) => setSettings({ ...settings, emailVisible: e.target.checked })}
          className={styles.toggle}
        />
      </div>

      <button type="submit" disabled={loading} className={styles.submitButton}>
        {loading ? 'Saving...' : 'Save Changes'}
      </button>
    </form>
  );
}
