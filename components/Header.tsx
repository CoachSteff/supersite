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
  showSearch?: boolean;
  showThemeToggle?: boolean;
  showAuth?: boolean;
}

export default function Header({
  style = 'full',
  sticky = true,
  showLogo = true,
  showSearch = true,
  showThemeToggle = true,
  showAuth = false,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleSearchEvent = () => {
      setSearchOpen(true);
    };

    window.addEventListener('supersite:search', handleSearchEvent);
    return () => window.removeEventListener('supersite:search', handleSearchEvent);
  }, []);

  if (style === 'none') {
    return null;
  }

  const headerClasses = [
    styles.header,
    styles[`header-${style}`],
    sticky ? styles.sticky : '',
  ].filter(Boolean).join(' ');

  return (
    <header className={headerClasses}>
      <div className={styles.container}>
        {showLogo && (
          <div className={styles.logo}>
            <Link href="/">Supersite</Link>
          </div>
        )}
        
        {style !== 'minimal' && <Navigation />}
        
        <div className={styles.actions}>
          {showThemeToggle && <ThemeToggle />}
          
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
          
          {showAuth && <AuthButton />}
        </div>
      </div>
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
