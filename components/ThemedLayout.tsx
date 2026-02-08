'use client';

import { useThemeStructure, useThemeFeatures, useThemeBlocks } from './ThemeContext';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import styles from '@/styles/ThemedLayout.module.css';

interface ThemedLayoutProps {
  children: React.ReactNode;
}

export default function ThemedLayout({ children }: ThemedLayoutProps) {
  const structure = useThemeStructure();
  const features = useThemeFeatures();
  const blocks = useThemeBlocks();

  const { layout, header, footer } = structure;
  const hasSidebar = layout.type === 'sidebar-left' || layout.type === 'sidebar-right';
  const sidebarPosition = layout.type === 'sidebar-left' ? 'left' : 'right';

  // Build layout class based on structure
  const layoutClasses = [
    styles.layout,
    styles[`layout-${layout.type}`],
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses} style={{
      '--layout-max-width': layout.maxWidth,
      '--content-width': layout.contentWidth,
      '--sidebar-width': layout.sidebarWidth,
    } as React.CSSProperties}>
      {header.enabled && (
        <Header 
          style={header.style}
          sticky={header.sticky}
          showLogo={header.logo}
          showSearch={header.search && features.search}
          showThemeToggle={header.themeToggle && features.darkMode}
          showAuth={header.auth && features.auth}
        />
      )}
      
      <div className={styles.mainContainer}>
        {hasSidebar && sidebarPosition === 'left' && (
          <aside className={styles.sidebar}>
            <Sidebar widgets={blocks.sidebar} />
          </aside>
        )}
        
        <main className={styles.mainContent}>
          {children}
        </main>
        
        {hasSidebar && sidebarPosition === 'right' && (
          <aside className={styles.sidebar}>
            <Sidebar widgets={blocks.sidebar} />
          </aside>
        )}
      </div>
      
      {footer.enabled && (
        <Footer style={footer.style} />
      )}
    </div>
  );
}
