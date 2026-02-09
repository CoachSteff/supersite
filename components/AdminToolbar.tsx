'use client';

import { useState, useEffect } from 'react';
import { Palette, Settings } from 'lucide-react';
import ThemeSwitcher from './ThemeSwitcher';
import styles from '@/styles/AdminToolbar.module.css';

interface AdminToolbarProps {
  enabled?: boolean;
}

export default function AdminToolbar({ enabled = false }: AdminToolbarProps) {
  const [isVisible, setIsVisible] = useState(enabled);

  useEffect(() => {
    setIsVisible(enabled);
  }, [enabled]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={styles.toolbar}>
      <div className={styles.container}>
        <div className={styles.left}>
          <Settings size={16} className={styles.icon} />
          <span className={styles.label}>Admin Tools</span>
        </div>
        
        <div className={styles.right}>
          <div className={styles.tool}>
            <span className={styles.toolLabel}>Theme:</span>
            <ThemeSwitcher />
          </div>
        </div>
      </div>
    </div>
  );
}
