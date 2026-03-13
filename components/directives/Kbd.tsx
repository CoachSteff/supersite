import React, { Children } from 'react';
import styles from '@/styles/Directives.module.css';

export default function Kbd({ children }: any) {
  const text = typeof children === 'string'
    ? children
    : Children.toArray(children).map((c: any) => (typeof c === 'string' ? c : '')).join('');

  if (text.includes('+')) {
    const keys = text.split('+').map(k => k.trim()).filter(Boolean);
    return (
      <span className={styles.kbdCombo}>
        {keys.map((key, i) => (
          <React.Fragment key={i}>
            {i > 0 && <span className={styles.kbdPlus}>+</span>}
            <kbd className={styles.kbd}>{key}</kbd>
          </React.Fragment>
        ))}
      </span>
    );
  }

  return <kbd className={styles.kbd}>{children}</kbd>;
}
