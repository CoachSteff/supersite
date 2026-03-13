'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Navigation from './Navigation';
import Search from './Search';
import ThemeToggle from './ThemeToggle';
import AuthButton from './AuthButton';
import styles from '@/styles/Header.module.css';

interface HeaderProps {
  style?: 'full' | 'minimal' | 'centered' | 'none';
  sticky?: boolean;
  showLogo?: boolean;
  logoText?: string;
  logoAccent?: string;
  showSearch?: boolean;
  showAuth?: boolean;
  scrollBehavior?: 'sticky' | 'auto-hide' | 'static';
  scrollBackground?: boolean;
}

export default function Header({
  style = 'full',
  sticky = true,
  showLogo = true,
  logoText = 'SuperSite',
  logoAccent,
  showSearch = true,
  showAuth = false,
  scrollBehavior = 'sticky',
  scrollBackground = false,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const handleSearchEvent = () => {
      setSearchOpen(true);
    };

    window.addEventListener('supersite:search', handleSearchEvent);
    return () => window.removeEventListener('supersite:search', handleSearchEvent);
  }, []);

  // Scroll-aware header behavior
  useEffect(() => {
    if (!scrollBackground && scrollBehavior === 'sticky') return;

    let lastScrollY = 0;
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Scroll background: add solid bg + shadow after scrolling past threshold
      if (scrollBackground) {
        setScrolled(currentScrollY > 20);
      }

      // Auto-hide: hide on scroll down, show on scroll up
      if (scrollBehavior === 'auto-hide') {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          setHidden(true);
        } else {
          setHidden(false);
        }
      }

      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrollBehavior, scrollBackground]);

  if (style === 'none') {
    return null;
  }

  const headerClasses = [
    styles.header,
    styles[`header-${style}`],
    sticky || scrollBehavior !== 'static' ? styles.sticky : '',
    scrolled ? styles.scrolled : '',
    hidden ? styles.hidden : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className={styles.container}>
        {showLogo && (
          <div className={styles.logo}>
            <Link href="/">{logoText}{logoAccent && <span className={styles.logoAccent}>{logoAccent}</span>}</Link>
          </div>
        )}
        
        {style !== 'minimal' && <Navigation />}
        
        <div className={styles.actions}>
          {showSearch && (
            <button 
              className={styles.searchButton}
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
            >
              <SearchIcon size={20} />
              {style === 'full' && <span className={styles.searchText}>Search</span>}
            </button>
          )}
          
          <ThemeToggle />
          {showAuth && <AuthButton />}
        </div>
      </div>
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
