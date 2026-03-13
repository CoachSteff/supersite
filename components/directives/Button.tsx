import React from 'react';
import styles from '@/styles/Directives.module.css';

const variantStyles: Record<string, React.CSSProperties> = {
  primary: { color: 'color-mix(in srgb, var(--primary-color) 15%, black)' },
  secondary: { color: 'var(--text-color)' },
  outline: { color: 'var(--primary-color)' },
};

export default function Button({ href, label, variant }: any) {
  const validVariants = ['primary', 'secondary', 'outline'];
  const btnVariant = variant && validVariants.includes(variant) ? variant : 'primary';
  const variantClass = styles[`button${btnVariant.charAt(0).toUpperCase()}${btnVariant.slice(1)}`];

  return (
    <a
      href={href || '#'}
      className={`${styles.button} ${variantClass || ''}`}
      role="button"
      style={variantStyles[btnVariant]}
    >
      {label || 'Click here'}
    </a>
  );
}
