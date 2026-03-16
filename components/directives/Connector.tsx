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

function extractText(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (Array.isArray(node)) return node.map(extractText).join('');
  if (node && typeof node === 'object' && 'props' in node) {
    return extractText((node as any).props.children);
  }
  return '';
}

export default function Connector({ children, ...props }: any) {
  const leftAccent = ACCENT_COLORS[props['left-accent']] || props['left-accent'] || 'var(--primary-color)';
  const rightAccent = ACCENT_COLORS[props['right-accent']] || props['right-accent'] || 'var(--primary-color)';

  // Parse pipe-separated content: **Left Title** | Left desc | **Right Title** | Right desc
  let parts: string[] = [];
  Children.forEach(children, (child: any) => {
    const text = extractText(child);
    if (text.includes('|')) {
      parts = text.split('|').map((s: string) => s.trim());
    }
  });

  // Need at least left-title | left-desc | right-title | right-desc
  if (parts.length < 4) {
    return <div className={styles.connector}>{children}</div>;
  }

  // Parse bold markers from the text
  const leftTitle = parts[0].replace(/\*\*/g, '');
  const leftDesc = parts[1];
  const rightTitle = parts[2].replace(/\*\*/g, '');
  const rightDesc = parts[3];

  return (
    <div className={styles.connector}>
      <div className={styles.connectorLeft}>
        <div className={styles.connectorTitle}>{leftTitle}</div>
        <div className={styles.connectorDesc}>{leftDesc}</div>
      </div>
      <div className={styles.connectorArrow}>
        <span
          className={styles.connectorDot}
          style={{ '--dot-color': leftAccent } as React.CSSProperties}
        />
        <span className={styles.connectorLine} />
        <span
          className={styles.connectorDot}
          style={{ '--dot-color': rightAccent } as React.CSSProperties}
        />
      </div>
      <div className={styles.connectorRight}>
        <div className={styles.connectorTitle}>{rightTitle}</div>
        <div className={styles.connectorDesc}>{rightDesc}</div>
      </div>
    </div>
  );
}
