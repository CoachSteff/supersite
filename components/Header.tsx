'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search as SearchIcon, User } from 'lucide-react';
import Navigation from './Navigation';
import Search from './Search';
import ThemeToggle from './ThemeToggle';
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
          
          {showAuth && (
            <button className={styles.authButton} aria-label="Account">
              <User size={20} />
            </button>
          )}
        </div>
      </div>
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
