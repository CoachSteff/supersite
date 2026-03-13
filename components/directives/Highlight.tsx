import React from 'react';
import styles from '@/styles/Directives.module.css';

const colors: Record<string, string> = {
  yellow: '#fef08a',
  green: '#bbf7d0',
  blue: '#bfdbfe',
  pink: '#fbcfe8',
  orange: '#fed7aa',
};

export default function Highlight({ children, color }: any) {
  const bg = colors[color] || colors.yellow;

  return (
    <mark
      className={styles.highlight}
      style={{ '--highlight-color': bg } as React.CSSProperties}
    >
      {children}
    </mark>
  );
}
