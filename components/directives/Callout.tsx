import styles from '@/styles/Directives.module.css';

const labels: Record<string, string> = {
  tip: 'Tip',
  info: 'Info',
  warning: 'Warning',
  note: 'Note',
};

const validTypes = ['tip', 'info', 'warning', 'note'];

export default function Callout({ children, type }: any) {
  const calloutType = type && validTypes.includes(type) ? type : 'info';
  const typeClass = styles[`callout${calloutType.charAt(0).toUpperCase()}${calloutType.slice(1)}`];

  return (
    <aside className={`${styles.callout} ${typeClass || ''}`} role="note">
      <div className={styles.calloutHeader}>
        {labels[calloutType]}
      </div>
      {children}
    </aside>
  );
}
