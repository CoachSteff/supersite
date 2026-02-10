'use client';

import { usePathname } from 'next/navigation';
import { Globe, Loader2 } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import styles from '@/styles/LanguageSwitcher.module.css';

interface Language {
  code: string;
  label: string;
  flag: string;
}

interface LanguageSwitcherProps {
  compact?: boolean;
}

const languages: Language[] = [
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

export default function LanguageSwitcher({ compact = false }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Extract current language from path
  const pathParts = pathname.split('/').filter(Boolean);
  const firstSegment = pathParts[0];
  const currentLang = languages.find(l => l.code === firstSegment)?.code || 'en';
  const currentLanguage = languages.find(l => l.code === currentLang);

  // Generate URL for a specific language
  const getLanguageUrl = (lang: string): string => {
    if (lang === 'en') {
      // Remove language prefix for English
      if (currentLang === 'en') {
        return pathname;
      }
      // Remove first segment (language code)
      const newPath = '/' + pathParts.slice(1).join('/');
      return newPath || '/';
    }
    
    // Add/replace language prefix
    let pathWithoutLang = pathname;
    if (currentLang !== 'en') {
      // Remove current language prefix
      pathWithoutLang = '/' + pathParts.slice(1).join('/');
      if (!pathWithoutLang.startsWith('/')) {
        pathWithoutLang = '/' + pathWithoutLang;
      }
    }
    
    return `/${lang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
  };

  // Handle language change with loading state
  const handleLanguageChange = (e: React.MouseEvent<HTMLAnchorElement>, lang: string) => {
    if (lang !== currentLang) {
      setIsLoading(true);
      setIsOpen(false);
      // Don't prevent default - let the navigation happen
    } else {
      e.preventDefault();
      setIsOpen(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Reset loading when pathname changes
  useEffect(() => {
    setIsLoading(false);
  }, [pathname]);

  return (
    <>
      <div className={`${styles.languageSwitcher} ${compact ? styles.compact : ''}`} ref={dropdownRef}>
        <button
          className={`${styles.languageButton} ${compact ? styles.compactButton : ''}`}
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Select language"
          aria-expanded={isOpen}
          disabled={isLoading}
          title="Change language"
        >
          {isLoading ? (
            <Loader2 size={18} className={styles.spinner} />
          ) : (
            <Globe size={18} />
          )}
          {!compact && <span className={styles.currentLanguage}>{currentLanguage?.flag}</span>}
        </button>

        {isOpen && (
          <div className={styles.dropdown}>
            <div className={styles.menuItems}>
              {languages.map((lang) => (
                <a
                  key={lang.code}
                  href={getLanguageUrl(lang.code)}
                  className={`${styles.languageOption} ${
                    currentLang === lang.code ? styles.active : ''
                  }`}
                  onClick={(e) => handleLanguageChange(e, lang.code)}
                >
                  <span className={styles.flag}>{lang.flag}</span>
                  <span className={styles.label}>{lang.label}</span>
                  {currentLang === lang.code && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Full-screen loading overlay */}
      {isLoading && (
        <div className={styles.loadingOverlay}>
          <div className={styles.loadingContent}>
            <Loader2 size={48} className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Translating content...</p>
          </div>
        </div>
      )}
    </>
  );
}
