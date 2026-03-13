import styles from '@/styles/Directives.module.css';

export default function Figure({ children }: any) {
  return (
    <figure className={styles.figure}>
      {children}
    </figure>
  );
}
