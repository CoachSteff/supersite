'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import styles from '@/styles/Header.module.css';

interface NavItem {
  title: string;
  path: string;
  children?: NavItem[];
}

export default function Navigation() {
  const pathname = usePathname();
  const [navItems, setNavItems] = useState<NavItem[]>([]);

  useEffect(() => {
    fetch('/api/navigation')
      .then(res => res.json())
      .then(data => setNavItems(data.items || []))
      .catch(() => setNavItems([]));
  }, []);

  const renderNavItems = (items: NavItem[]) => {
    return items.map((item) => {
      const isActive = pathname === item.path;
      
      return (
        <li key={item.path} className={styles.navItem}>
          <Link 
            href={item.path} 
            className={isActive ? styles.active : ''}
          >
            {item.title}
          </Link>
          {item.children && item.children.length > 0 && (
            <ul className={styles.subNav}>
              {renderNavItems(item.children)}
            </ul>
          )}
        </li>
      );
    });
  };

  return (
    <nav className={styles.nav}>
      <ul className={styles.navList}>
        {renderNavItems(navItems)}
      </ul>
    </nav>
  );
}
