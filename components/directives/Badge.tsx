import styles from '@/styles/Directives.module.css';

export default function Badge({ children, color }: any) {
  const validColors = ['primary', 'green', 'red', 'yellow', 'purple'];
  const badgeColor = color && validColors.includes(color) ? color : 'primary';
  const colorClass = styles[`badge${badgeColor.charAt(0).toUpperCase()}${badgeColor.slice(1)}`];

  return (
    <span className={`${styles.badge} ${colorClass || ''}`}>
      {children}
    </span>
  );
}
