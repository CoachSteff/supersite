import { ReactNode } from 'react';
import styles from '@/styles/Layouts.module.css';

interface FullWidthLayoutProps {
  children: ReactNode;
  maxWidth: string;
  contentWidth: string;
}

export default function FullWidthLayout({ 
  children, 
  maxWidth, 
  contentWidth 
}: FullWidthLayoutProps) {
  return (
    <div 
      className={styles.fullWidthLayout}
      style={{
        maxWidth,
        '--content-max-width': contentWidth,
      } as React.CSSProperties}
    >
      <main className={styles.content}>
        {children}
      </main>
    </div>
  );
}
