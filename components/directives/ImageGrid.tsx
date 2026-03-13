import React, { Children } from 'react';
import styles from '@/styles/Directives.module.css';

/** Extract individual images from paragraph wrappers */
function extractImages(children: React.ReactNode): React.ReactNode[] {
  const items: React.ReactNode[] = [];
  Children.forEach(children, (child: any) => {
    if (child?.type === 'img') {
      items.push(child);
    } else if (child?.props?.children) {
      const inner = Children.toArray(child.props.children);
      const images = inner.filter((c: any) => c?.type === 'img');
      if (images.length > 0) {
        images.forEach(img => items.push(img));
      } else {
        items.push(child);
      }
    } else {
      items.push(child);
    }
  });
  return items;
}

export default function ImageGrid({ children, columns }: any) {
  const cols = Math.min(Math.max(parseInt(columns) || 3, 2), 4);
  const images = extractImages(children);

  return (
    <div
      className={styles.imageGrid}
      style={{ '--grid-columns': cols } as React.CSSProperties}
    >
      {images.map((img, i) => (
        <div key={i} className={styles.imageGridItem}>
          {img}
        </div>
      ))}
    </div>
  );
}
