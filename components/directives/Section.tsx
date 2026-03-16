import React from 'react';
import styles from '@/styles/Directives.module.css';

const BG_CLASSES: Record<string, string> = {
  dark: styles.sectionDark,
  light: styles.sectionLight,
  muted: styles.sectionMuted,
  gradient: styles.sectionGradient,
};

const PADDING_CLASSES: Record<string, string> = {
  sm: styles.sectionPaddingSm,
  md: styles.sectionPaddingMd,
  lg: styles.sectionPaddingLg,
  xl: styles.sectionPaddingXl,
};

export default function Section({ children, background, padding }: any) {
  const bgClass = BG_CLASSES[background] || '';
  const padClass = PADDING_CLASSES[padding] || styles.sectionPaddingLg;

  return (
    <div className={`${styles.section} ${bgClass} ${padClass}`}>
      <div className={styles.sectionContent}>
        {children}
      </div>
    </div>
  );
}
