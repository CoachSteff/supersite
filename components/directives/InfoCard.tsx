import React, { Children } from 'react';
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

export default function InfoCard({ children, number, accent, subtitle, ...props }: any) {
  const accentColor = ACCENT_COLORS[accent] || accent || 'var(--primary-color)';
  let title: React.ReactNode = null;
  const body: React.ReactNode[] = [];

  Children.forEach(children, (child: any) => {
    if (!title && typeof child?.type === 'string' && /^h[1-6]$/.test(child.type)) {
      title = child.props.children;
    } else {
      body.push(child);
    }
  });

  return (
    <div
      className={styles.infoCard}
      style={{ '--info-accent': accentColor } as React.CSSProperties}
    >
      {number && (
        <div className={styles.infoCardNumber}>{number}</div>
      )}
      <div className={styles.infoCardContent}>
        {title && <div className={styles.infoCardTitle}>{title}</div>}
        {subtitle && <div className={styles.infoCardSubtitle}>{subtitle}</div>}
        <div className={styles.infoCardBody}>{body}</div>
      </div>
    </div>
  );
}
