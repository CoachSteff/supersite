'use client';

import { useEffect, useState } from 'react';
import { CheckCircle, X } from 'lucide-react';
import styles from '@/styles/Notification.module.css';

interface NotificationProps {
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Notification({ message, onClose, duration = 3000 }: NotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for fade out animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div className={`${styles.notification} ${!isVisible ? styles.fadeOut : ''}`}>
      <CheckCircle size={20} className={styles.icon} />
      <span className={styles.message}>{message}</span>
      <button onClick={() => { setIsVisible(false); setTimeout(onClose, 300); }} className={styles.closeButton}>
        <X size={16} />
      </button>
    </div>
  );
}
