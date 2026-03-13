import React, { Children } from 'react';
import styles from '@/styles/Directives.module.css';

function extractCardParts(children: React.ReactNode) {
  let image: React.ReactNode = null;
  let title: React.ReactNode = null;
  const body: React.ReactNode[] = [];

  Children.forEach(children, (child: any) => {
    if (!image && child?.type === 'img') {
      image = child;
      return;
    }
    if (!image && child?.props?.children) {
      const inner = Children.toArray(child.props.children);
      const img = inner.find((c: any) => c?.type === 'img');
      if (img) {
        image = img;
        const rest = inner.filter((c: any) => c?.type !== 'img');
        if (rest.length > 0) body.push(...rest);
        return;
      }
    }
    if (!title && typeof child?.type === 'string' && /^h[1-6]$/.test(child.type)) {
      title = child.props.children;
      return;
    }
    body.push(child);
  });

  return { image, title, body };
}

export default function Card({ children }: any) {
  const { image, title, body } = extractCardParts(children);

  return (
    <div className={styles.card}>
      {image && <div className={styles.cardImage}>{image}</div>}
      {title && <div className={styles.cardTitle}>{title}</div>}
      <div className={styles.cardBody}>{body}</div>
    </div>
  );
}
