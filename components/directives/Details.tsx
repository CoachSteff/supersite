import styles from '@/styles/Directives.module.css';

export default function Details({ children, summary, open }: any) {
  return (
    <details className={styles.details} open={open !== undefined}>
      <summary className={styles.detailsSummary}>
        {summary || 'Details'}
      </summary>
      <div className={styles.detailsContent}>
        {children}
      </div>
    </details>
  );
}
