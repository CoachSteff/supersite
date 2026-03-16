import React from 'react';
import styles from '@/styles/Directives.module.css';
import * as LucideIcons from 'lucide-react';

export default function FlowStep({ children, icon, label }: any) {
  let iconElement: React.ReactNode = icon;

  // If icon matches a Lucide icon name, render the component
  if (icon && typeof icon === 'string' && icon in LucideIcons) {
    const IconComponent = (LucideIcons as any)[icon];
    iconElement = <IconComponent size={24} strokeWidth={1.5} />;
  }

  return (
    <div className={styles.flowStep}>
      {iconElement && <div className={styles.flowStepIcon}>{iconElement}</div>}
      {label && <div className={styles.flowStepLabel}>{label}</div>}
      <div className={styles.flowStepBody}>{children}</div>
    </div>
  );
}
