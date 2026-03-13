import React, { Children } from 'react';
import styles from '@/styles/Directives.module.css';

export default function Steps({ children }: any) {
  const steps: { title: React.ReactNode; content: React.ReactNode[] }[] = [];

  Children.forEach(children, (child: any) => {
    if (child?.type === 'h3') {
      steps.push({ title: child.props.children, content: [] });
    } else if (steps.length > 0) {
      steps[steps.length - 1].content.push(child);
    }
  });

  if (steps.length === 0) return <div>{children}</div>;

  return (
    <ol className={styles.steps}>
      {steps.map((step, i) => (
        <li key={i} className={styles.step}>
          <div className={styles.stepTitle}>{step.title}</div>
          <div className={styles.stepContent}>{step.content}</div>
        </li>
      ))}
    </ol>
  );
}
