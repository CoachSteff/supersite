import React from 'react';
import styles from '@/styles/Directives.module.css';

export default function Columns({ children, count }: any) {
  const colCount = Math.min(Math.max(parseInt(count) || 2, 2), 3);

  // Split children into columns at <hr> elements
  const columns: React.ReactNode[][] = [[]];
  React.Children.forEach(children, (child: any) => {
    if (child?.type === 'hr') {
      columns.push([]);
    } else {
      columns[columns.length - 1].push(child);
    }
  });

  return (
    <div
      className={styles.columns}
      style={{ '--column-count': colCount } as React.CSSProperties}
    >
      {columns.map((col, i) => (
        <div key={i} className={styles.column}>
          {col}
        </div>
      ))}
    </div>
  );
}
