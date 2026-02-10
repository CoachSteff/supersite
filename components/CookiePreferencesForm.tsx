'use client';

import { useState, useEffect } from 'react';
import { Cookie, CheckCircle2 } from 'lucide-react';
import styles from '@/styles/CookieConsent.module.css';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

interface CookiePreferencesFormProps {
  onSave?: () => void;
  compact?: boolean;
}

export default function CookiePreferencesForm({ onSave, compact = false }: CookiePreferencesFormProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  async function fetchPreferences() {
    try {
      const response = await fetch('/api/cookie-preferences');
      const data = await response.json();
      
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('[CookiePrefs] Failed to fetch preferences:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(acceptAll: boolean = false) {
    setSaving(true);
    setSaved(false);

    try {
      const prefsToSave = acceptAll
        ? { analytics: true, marketing: true }
        : { analytics: preferences.analytics, marketing: preferences.marketing };

      const response = await fetch('/api/cookie-preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(prefsToSave),
      });

      if (response.ok) {
        setSaved(true);
        if (onSave) {
          setTimeout(onSave, 1000);
        }
      }
    } catch (error) {
      console.error('[CookiePrefs] Failed to save preferences:', error);
    } finally {
      setSaving(false);
    }
  }

  function handleRejectAll() {
    setPreferences(prev => ({
      ...prev,
      analytics: false,
      marketing: false,
    }));
    setTimeout(() => handleSave(false), 100);
  }

  function togglePreference(key: keyof CookiePreferences) {
    if (key === 'necessary') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  if (loading) {
    return <div className={styles.loading}>Loading preferences...</div>;
  }

  return (
    <div className={compact ? styles.compactForm : styles.form}>
      {!compact && (
        <div className={styles.formHeader}>
          <Cookie size={20} />
          <h4 className={styles.formTitle}>Cookie Preferences</h4>
        </div>
      )}

      <p className={styles.formDescription}>
        SuperSite only uses essential session cookies for authentication. 
        Optional analytics and marketing cookies are not currently implemented.
      </p>

      <div className={styles.categories}>
        <label className={styles.category}>
          <input
            type="checkbox"
            checked={preferences.necessary}
            disabled
            className={styles.checkbox}
          />
          <div className={styles.categoryInfo}>
            <span className={styles.categoryName}>
              Necessary Cookies <span className={styles.required}>(Required)</span>
            </span>
            <span className={styles.categoryDesc}>
              Essential for authentication and site functionality
            </span>
          </div>
        </label>

        <label className={styles.category}>
          <input
            type="checkbox"
            checked={preferences.analytics}
            onChange={() => togglePreference('analytics')}
            disabled={saving}
            className={styles.checkbox}
          />
          <div className={styles.categoryInfo}>
            <span className={styles.categoryName}>Analytics Cookies</span>
            <span className={styles.categoryDesc}>
              Help us understand site usage (not implemented)
            </span>
          </div>
        </label>

        <label className={styles.category}>
          <input
            type="checkbox"
            checked={preferences.marketing}
            onChange={() => togglePreference('marketing')}
            disabled={saving}
            className={styles.checkbox}
          />
          <div className={styles.categoryInfo}>
            <span className={styles.categoryName}>Marketing Cookies</span>
            <span className={styles.categoryDesc}>
              For targeted advertising (not implemented)
            </span>
          </div>
        </label>
      </div>

      <div className={styles.formActions}>
        <button
          onClick={() => handleSave(true)}
          disabled={saving}
          className={`${styles.formButton} ${styles.primary}`}
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              Saved!
            </>
          ) : (
            'Accept All'
          )}
        </button>
        <button
          onClick={handleRejectAll}
          disabled={saving}
          className={`${styles.formButton} ${styles.secondary}`}
        >
          Reject Optional
        </button>
        <button
          onClick={() => handleSave(false)}
          disabled={saving}
          className={`${styles.formButton} ${styles.secondary}`}
        >
          Save Selected
        </button>
      </div>

      {saved && !compact && (
        <div className={styles.saveMessage}>
          Your preferences have been saved.
        </div>
      )}
    </div>
  );
}
