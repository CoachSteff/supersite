import { ReactNode } from 'react';
import styles from '@/styles/Layouts.module.css';

interface CenteredLayoutProps {
  children: ReactNode;
  maxWidth: string;
}

export default function CenteredLayout({ 
  children, 
  maxWidth 
}: CenteredLayoutProps) {
  return (
    <div 
      className={styles.centeredLayout}
      style={{ maxWidth } as React.CSSProperties}
    >
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
