import React, { Children } from 'react';
import styles from '@/styles/Directives.module.css';

// Named accents map to theme-overridable CSS variables with hardcoded fallbacks.
// Themes can override any accent by setting e.g. `--accent-cyan: #...` on :root.
const ACCENT_COLORS: Record<string, string> = {
  cyan: 'var(--accent-cyan, #00BFFF)',
  teal: 'var(--accent-teal, #2a9d8f)',
  green: 'var(--accent-green, #10b981)',
  orange: 'var(--accent-orange, #f97316)',
  yellow: 'var(--accent-yellow, #eab308)',
  purple: 'var(--accent-purple, #8b5cf6)',
  red: 'var(--accent-red, #ef4444)',
  blue: 'var(--accent-blue, #3b82f6)',
  pink: 'var(--accent-pink, #ec4899)',
};

interface InfoCardProps {
  children?: React.ReactNode;
  number?: string | number;
  accent?: string;
  subtitle?: string;
}

export default function InfoCard({ children, number, accent, subtitle }: InfoCardProps) {
  const accentColor = (accent && ACCENT_COLORS[accent]) || accent || 'var(--primary-color)';
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
