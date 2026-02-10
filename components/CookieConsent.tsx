'use client';

import { useState, useEffect } from 'react';
import { Cookie, X, Settings } from 'lucide-react';
import styles from '@/styles/CookieConsent.module.css';

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
}

const COOKIE_CONSENT_KEY = 'supersite_cookie_consent';
const COOKIE_PREFERENCES_KEY = 'supersite_cookie_preferences';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    analytics: false,
    marketing: false,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!consent) {
      setIsVisible(true);
    } else {
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY);
      if (savedPreferences) {
        try {
          setPreferences(JSON.parse(savedPreferences));
        } catch (error) {
          console.error('[CookieConsent] Failed to parse preferences:', error);
        }
      }
    }
  }, []);

  function saveConsent(acceptAll: boolean = false) {
    const finalPreferences = acceptAll
      ? { necessary: true, analytics: true, marketing: true }
      : preferences;

    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(finalPreferences));
    
    setIsVisible(false);
  }

  function handleAcceptAll() {
    saveConsent(true);
  }

  function handleAcceptSelected() {
    saveConsent(false);
  }

  function handleReject() {
    const minimalPreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
    };
    setPreferences(minimalPreferences);
    localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(minimalPreferences));
    setIsVisible(false);
  }

  function togglePreference(key: keyof CookiePreferences) {
    if (key === 'necessary') return;
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.banner}>
        <div className={styles.header}>
          <div className={styles.iconWrapper}>
            <Cookie size={24} />
          </div>
          <h3 className={styles.title}>Cookie Preferences</h3>
        </div>

        {!showSettings ? (
          <>
            <p className={styles.description}>
              We use cookies to enhance your browsing experience and analyze site traffic. 
              SuperSite only uses essential session cookies to maintain your login state. 
              No tracking or marketing cookies are used.
            </p>

            <div className={styles.actions}>
              <button
                onClick={handleAcceptAll}
                className={`${styles.button} ${styles.primary}`}
                aria-label="Accept all cookies"
              >
                Accept All
              </button>
              <button
                onClick={handleReject}
                className={`${styles.button} ${styles.secondary}`}
                aria-label="Reject optional cookies"
              >
                Reject All
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className={`${styles.button} ${styles.text}`}
                aria-label="Customize cookie preferences"
              >
                <Settings size={16} />
                Customize
              </button>
            </div>
          </>
        ) : (
          <>
            <div className={styles.settingsPanel}>
              <div className={styles.cookieCategory}>
                <div className={styles.categoryHeader}>
                  <label className={styles.categoryLabel}>
                    <input
                      type="checkbox"
                      checked={preferences.necessary}
                      disabled
                      className={styles.checkbox}
                      aria-label="Necessary cookies (always enabled)"
                    />
                    <span className={styles.categoryTitle}>
                      Necessary Cookies
                      <span className={styles.required}>(Required)</span>
                    </span>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  Essential session cookies required for authentication and basic site functionality. 
                  These cannot be disabled.
                </p>
              </div>

              <div className={styles.cookieCategory}>
                <div className={styles.categoryHeader}>
                  <label className={styles.categoryLabel}>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={() => togglePreference('analytics')}
                      className={styles.checkbox}
                      aria-label="Analytics cookies"
                    />
                    <span className={styles.categoryTitle}>Analytics Cookies</span>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  Help us understand how visitors interact with the site. Currently not implemented.
                </p>
              </div>

              <div className={styles.cookieCategory}>
                <div className={styles.categoryHeader}>
                  <label className={styles.categoryLabel}>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={() => togglePreference('marketing')}
                      className={styles.checkbox}
                      aria-label="Marketing cookies"
                    />
                    <span className={styles.categoryTitle}>Marketing Cookies</span>
                  </label>
                </div>
                <p className={styles.categoryDescription}>
                  Used for targeted advertising. Currently not implemented.
                </p>
              </div>
            </div>

            <div className={styles.actions}>
              <button
                onClick={handleAcceptSelected}
                className={`${styles.button} ${styles.primary}`}
                aria-label="Save preferences"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className={`${styles.button} ${styles.secondary}`}
                aria-label="Go back"
              >
                Back
              </button>
            </div>
          </>
        )}

        <button
          onClick={handleReject}
          className={styles.closeButton}
          aria-label="Close and reject optional cookies"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  );
}
