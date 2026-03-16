import React, { Children } from 'react';
import styles from '@/styles/Directives.module.css';

export default function Flow({ children, loop }: any) {
  const steps: React.ReactNode[] = [];

  Children.forEach(children, (child: any) => {
    const directive = child?.props?.['data-directive'];
    if (directive === 'flow-step') {
      steps.push(child);
    }
  });

  return (
    <div className={styles.flow}>
      <div className={styles.flowSteps}>
        {steps.map((step, i) => (
          <React.Fragment key={i}>
            {step}
            {i < steps.length - 1 && (
              <div className={styles.flowArrow}>
                <span>→</span>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      {loop && (
        <div className={styles.flowLoop}>
          <span className={styles.flowLoopLine} />
          <span className={styles.flowLoopLabel}>{loop}</span>
          <span className={styles.flowLoopLine} />
        </div>
      )}
    </div>
  );
}
