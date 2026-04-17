import React from 'react';
import styles from '@/styles/Directives.module.css';
import { getLucideIcon } from '@/lib/lucide-icon';

interface FlowStepProps {
  children?: React.ReactNode;
  icon?: React.ReactNode;
  label?: string;
}

export default function FlowStep({ children, icon, label }: FlowStepProps) {
  let iconElement: React.ReactNode = icon;

  // If icon is a string naming a Lucide icon, render the component
  if (typeof icon === 'string') {
    const IconComponent = getLucideIcon(icon, null);
    if (IconComponent) {
      iconElement = <IconComponent size={24} strokeWidth={1.5} />;
    }
  }

  return (
    <div className={styles.flowStep}>
      {iconElement && <div className={styles.flowStepIcon}>{iconElement}</div>}
      {label && <div className={styles.flowStepLabel}>{label}</div>}
      <div className={styles.flowStepBody}>{children}</div>
    </div>
  );
}
