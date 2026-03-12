'use client';

import { useState } from 'react';
import CookiePreferencesForm from '../CookiePreferencesForm';
import styles from '@/styles/SettingsForm.module.css';

interface CookieSettingsProps {
  user: any;
  siteName?: string;
}

export default function CookieSettings({ user, siteName = 'This site' }: CookieSettingsProps) {
  const [message, setMessage] = useState('');

  function handleSaved() {
    setMessage('Cookie preferences saved successfully!');
    setTimeout(() => setMessage(''), 3000);
  }

  return (
    <div className={styles.settingsSection}>
      <div className={styles.sectionHeader}>
        <h2>Cookie Preferences</h2>
        <p className={styles.sectionDescription}>
          Manage how {siteName} uses cookies to enhance your experience.
        </p>
      </div>

      <CookiePreferencesForm onSave={handleSaved} siteName={siteName} />

      {message && (
        <div className={styles.successMessage}>
          {message}
        </div>
      )}
    </div>
  );
}
