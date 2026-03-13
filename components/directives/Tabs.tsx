'use client';

import React, { useState, Children } from 'react';
import styles from '@/styles/Directives.module.css';

export default function Tabs({ children }: any) {
  const [activeTab, setActiveTab] = useState(0);

  const tabs: { label: string; content: React.ReactNode }[] = [];

  Children.forEach(children, (child: any) => {
    if (child?.props?.['data-directive'] === 'tab') {
      tabs.push({
        label: child.props.label || `Tab ${tabs.length + 1}`,
        content: child.props.children,
      });
    }
  });

  if (tabs.length === 0) return <div>{children}</div>;

  return (
    <div className={styles.tabs}>
      <div className={styles.tabList} role="tablist">
        {tabs.map((tab, i) => (
          <button
            key={i}
            className={`${styles.tabButton} ${i === activeTab ? styles.tabButtonActive : ''}`}
            role="tab"
            aria-selected={i === activeTab}
            onClick={() => setActiveTab(i)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabPanel} role="tabpanel">
        {tabs[activeTab]?.content}
      </div>
    </div>
  );
}
