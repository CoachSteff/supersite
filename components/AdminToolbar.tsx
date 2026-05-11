'use client';

import { Settings } from 'lucide-react';
import AdminOnly from './AdminOnly';
import ThemeSwitcher from './ThemeSwitcher';
import ThemeToggle from './ThemeToggle';
import styles from '@/styles/AdminToolbar.module.css';

interface AdminToolbarProps {
  enabled?: boolean;
}

export default function AdminToolbar({ enabled = false }: AdminToolbarProps) {
  if (!enabled) {
    return null;
  }

  return (
    <AdminOnly>
      <div className={styles.toolbar}>
        <div className={styles.container}>
          <div className={styles.left}>
            <Settings size={16} className={styles.icon} />
            <span className={styles.label}>Admin Tools</span>
          </div>

          <div className={styles.right}>
            <div className={styles.tool}>
              <span className={styles.toolLabel}>Mode:</span>
              <ThemeToggle />
            </div>

            <div className={styles.tool}>
              <span className={styles.toolLabel}>Theme:</span>
              <ThemeSwitcher />
            </div>
          </div>
        </div>
      </div>
    </AdminOnly>
  );
}
