'use client';

import { useState, useEffect } from 'react';
import { Palette } from 'lucide-react';
import styles from '@/styles/ThemeSwitcher.module.css';

const AVAILABLE_THEMES = [
  { name: 'base', description: 'Clean foundation theme' },
  { name: 'blog', description: 'Blog with sidebar' },
  { name: 'business', description: 'Professional business site' },
  { name: 'chatbot', description: 'AI chat-focused' },
  { name: 'community', description: 'Community platform' },
  { name: 'influencer', description: 'Personal brand & portfolio' },
];

export default function ThemeSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTheme, setCurrentTheme] = useState<string>('base');
  const [loading, setLoading] = useState(false);
  const [pendingTheme, setPendingTheme] = useState<string | null>(null);

  useEffect(() => {
    const fetchCurrentTheme = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        setCurrentTheme(data.branding?.theme || 'base');
      } catch (error) {
        console.error('Failed to fetch current theme:', error);
      }
    };
    fetchCurrentTheme();
  }, []);

  const handleThemeChange = async (themeName: string) => {
    if (loading || themeName === currentTheme) return;
    
    setLoading(true);
    setPendingTheme(themeName);
    setIsOpen(false);
    
    try {
      const response = await fetch('/api/config/theme', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ theme: themeName }),
      });

      if (response.ok) {
        setCurrentTheme(themeName);
        // Delay reload slightly to let the file system settle
        setTimeout(() => {
          window.location.reload();
        }, 300);
      } else {
        console.error('Failed to switch theme');
        setLoading(false);
        setPendingTheme(null);
      }
    } catch (error) {
      console.error('Error switching theme:', error);
      setLoading(false);
      setPendingTheme(null);
    }
  };

  return (
    <div className={styles.themeSwitcher}>
      <button
        className={`${styles.trigger} ThemeSwitcher_trigger`}
        onClick={() => !loading && setIsOpen(!isOpen)}
        aria-label="Switch theme"
        title={`Current theme: ${currentTheme}`}
        disabled={loading}
      >
        <Palette size={20} />
        <span className={styles.triggerText}>
          {loading ? `Switching to ${pendingTheme}...` : currentTheme}
        </span>
      </button>

      {isOpen && (
        <>
          <div className={styles.overlay} onClick={() => setIsOpen(false)} />
          <div className={styles.menu}>
            <h3 className={styles.title}>Switch Theme</h3>
            <div className={styles.themeList}>
              {AVAILABLE_THEMES.map((theme) => (
                <button
                  key={theme.name}
                  className={`${styles.themeOption} ${currentTheme === theme.name ? styles.active : ''}`}
                  onClick={() => handleThemeChange(theme.name)}
                  disabled={loading || currentTheme === theme.name}
                >
                  <div className={styles.themeInfo}>
                    <div className={styles.themeName}>
                      {theme.name.charAt(0).toUpperCase() + theme.name.slice(1)}
                    </div>
                    <div className={styles.themeDesc}>{theme.description}</div>
                  </div>
                  {currentTheme === theme.name && (
                    <span className={styles.currentBadge}>Current</span>
                  )}
                </button>
              ))}
            </div>
            {loading && <div className={styles.loading}>Switching theme...</div>}
          </div>
        </>
      )}
    </div>
  );
}
