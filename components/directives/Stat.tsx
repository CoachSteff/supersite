import React from 'react';
import { icons } from 'lucide-react';
import styles from '@/styles/Directives.module.css';

const STAT_COLORS: Record<string, string> = {
  green: '#10b981',
  red: '#ef4444',
  blue: '#3b82f6',
  orange: '#f97316',
  yellow: '#eab308',
  purple: '#8b5cf6',
  cyan: '#00BFFF',
  teal: '#2a9d8f',
  pink: '#ec4899',
};

function toPascalCase(str: string): string {
  return str.replace(/(^|-)(\w)/g, (_, __, c) => c.toUpperCase());
}

export default function Stat({ children, value, color, icon }: any) {
  const statColor = STAT_COLORS[color] || color || 'var(--primary-color)';

  const IconComponent = icon
    ? (icons as Record<string, any>)[toPascalCase(icon)]
    : null;

  return (
    <div
      className={styles.stat}
      style={{ '--stat-color': statColor } as React.CSSProperties}
    >
      {IconComponent && (
        <div className={styles.statIcon}>
          <IconComponent size={28} strokeWidth={1.5} />
        </div>
      )}
      {value && <div className={styles.statValue}>{value}</div>}
      <div className={styles.statDesc}>{children}</div>
    </div>
  );
}
