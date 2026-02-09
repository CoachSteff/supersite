import { ReactNode } from 'react';
import styles from '@/styles/Layouts.module.css';

interface SidebarLeftLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  maxWidth: string;
  contentWidth: string;
  sidebarWidth: string;
}

export default function SidebarLeftLayout({ 
  children, 
  sidebar, 
  maxWidth, 
  contentWidth, 
  sidebarWidth 
}: SidebarLeftLayoutProps) {
  return (
    <div 
      className={styles.sidebarLayout}
      style={{
        maxWidth,
        '--content-width': contentWidth,
        '--sidebar-width': sidebarWidth,
      } as React.CSSProperties}
    >
      {sidebar && (
        <aside className={styles.sidebarLeft}>
          {sidebar}
        </aside>
      )}
      <main className={styles.mainContent}>
        {children}
      </main>
    </div>
  );
}
