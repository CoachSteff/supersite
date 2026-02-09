import { ReactNode } from 'react';
import styles from '@/styles/Layouts.module.css';

interface SidebarRightLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  maxWidth: string;
  contentWidth: string;
  sidebarWidth: string;
}

export default function SidebarRightLayout({ 
  children, 
  sidebar, 
  maxWidth, 
  contentWidth, 
  sidebarWidth 
}: SidebarRightLayoutProps) {
  return (
    <div 
      className={styles.sidebarLayout}
      style={{
        maxWidth,
        '--content-width': contentWidth,
        '--sidebar-width': sidebarWidth,
      } as React.CSSProperties}
    >
      <main className={styles.mainContent}>
        {children}
      </main>
      {sidebar && (
        <aside className={styles.sidebarRight}>
          {sidebar}
        </aside>
      )}
    </div>
  );
}
