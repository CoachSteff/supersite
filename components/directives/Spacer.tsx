import styles from '@/styles/Directives.module.css';

const sizes: Record<string, string> = {
  sm: 'var(--spacing-sm)',
  md: 'var(--spacing-md)',
  lg: 'var(--spacing-lg)',
  xl: 'var(--spacing-xl)',
};

export default function Spacer({ size }: any) {
  const height = sizes[size] || sizes.md;

  return <div className={styles.spacer} style={{ height }} aria-hidden="true" />;
}
