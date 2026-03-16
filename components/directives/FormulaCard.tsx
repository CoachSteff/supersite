import React from 'react';
import styles from '@/styles/Directives.module.css';

const ACCENT_COLORS: Record<string, string> = {
  cyan: '#00BFFF',
  teal: '#2a9d8f',
  green: '#10b981',
  orange: '#f97316',
  yellow: '#eab308',
  purple: '#8b5cf6',
  red: '#ef4444',
  blue: '#3b82f6',
  pink: '#ec4899',
};

export default function FormulaCard({ children, label, accent, ...props }: any) {
  const accentColor = ACCENT_COLORS[accent] || accent || 'var(--primary-color)';

  return (
    <div
      className={styles.formulaCard}
      style={{ '--formula-accent': accentColor } as React.CSSProperties}
    >
      {label && <div className={styles.formulaCardLabel}>{label}</div>}
      <div className={styles.formulaCardBody}>{children}</div>
    </div>
  );
}
