'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Search as SearchIcon } from 'lucide-react';
import Navigation from './Navigation';
import Search from './Search';
import ThemeToggle from './ThemeToggle';
import styles from '@/styles/Header.module.css';

export default function Header() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">Supersite</Link>
        </div>
        <Navigation />
        <div className={styles.actions}>
          <ThemeToggle />
          <button 
            className={styles.searchButton}
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
          >
            <SearchIcon size={20} />
            <span className={styles.searchText}>Search</span>
          </button>
        </div>
      </div>
      {searchOpen && <Search onClose={() => setSearchOpen(false)} />}
    </header>
  );
}
