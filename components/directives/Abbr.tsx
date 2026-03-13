'use client';

import { useState, useRef, useEffect } from 'react';
import styles from '@/styles/Directives.module.css';

export default function Abbr({ children, title }: any) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [open]);

  return (
    <span className={styles.abbrWrapper} ref={ref}>
      <abbr
        className={styles.abbr}
        title={title}
        onClick={(e) => {
          e.preventDefault();
          setOpen(!open);
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        {children}
      </abbr>
      {open && title && (
        <span className={styles.abbrPopup} role="tooltip">
          {title}
        </span>
      )}
    </span>
  );
}
