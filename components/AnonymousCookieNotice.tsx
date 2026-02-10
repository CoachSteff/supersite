'use client';

import { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import CookiePreferencesForm from './CookiePreferencesForm';
import styles from '@/styles/AnonymousCookieNotice.module.css';

export default function AnonymousCookieNotice() {
  const [isVisible, setIsVisible] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    const hasSeenCookie = localStorage.getItem('anonymous_cookie_seen');
    const hasSetPreferences = localStorage.getItem('anonymous_cookie_preferences_set');
    
    if (!hasSeenCookie && !hasSetPreferences) {
      setIsVisible(true);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          setIsVisible(false);
        }
      } catch (error) {
        console.error('[AnonymousCookieNotice] Auth check failed:', error);
      }
    };

    checkAuth();
  }, [isVisible]);

  function handleDismiss() {
    localStorage.setItem('anonymous_cookie_seen', 'true');
    setIsVisible(false);
  }

  function handleShowForm() {
    setShowForm(true);
  }

  function handleFormSaved() {
    localStorage.setItem('anonymous_cookie_preferences_set', 'true');
    localStorage.setItem('anonymous_cookie_seen', 'true');
    setIsVisible(false);
  }

  if (!mounted || !isVisible) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.notice}>
        {!showForm ? (
          <>
            <div className={styles.header}>
              <Cookie size={20} className={styles.icon} />
              <div className={styles.content}>
                <h4 className={styles.title}>Cookie Notice</h4>
                <p className={styles.description}>
                  SuperSite uses only essential session cookies. Click to review preferences.
                </p>
              </div>
              <button
                onClick={handleDismiss}
                className={styles.closeButton}
                aria-label="Dismiss"
              >
                <X size={18} />
              </button>
            </div>
            <div className={styles.actions}>
              <button
                onClick={handleFormSaved}
                className={`${styles.button} ${styles.primary}`}
              >
                Accept
              </button>
              <button
                onClick={handleShowForm}
                className={`${styles.button} ${styles.secondary}`}
              >
                Manage Preferences
              </button>
            </div>
          </>
        ) : (
          <div className={styles.formWrapper}>
            <div className={styles.formHeader}>
              <Cookie size={20} className={styles.icon} />
              <h4 className={styles.title}>Cookie Preferences</h4>
              <button
                onClick={() => setShowForm(false)}
                className={styles.backButton}
                aria-label="Back"
              >
                <X size={18} />
              </button>
            </div>
            <CookiePreferencesForm onSave={handleFormSaved} compact={true} />
          </div>
        )}
      </div>
    </div>
  );
}
