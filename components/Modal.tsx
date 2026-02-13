'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import styles from '@/styles/Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, size = 'md', children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    }

    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && event.target === modalRef.current) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('mousedown', handleClickOutside);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop} ref={modalRef}>
      <div className={`${styles.modalContent} ${styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}>
        {title && (
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>{title}</h2>
            <button
              onClick={onClose}
              className={styles.closeButton}
              aria-label="Close modal"
            >
              <X size={20} />
            </button>
          </div>
        )}
        <div className={styles.modalBody}>
          {children}
        </div>
      </div>
    </div>
  );
}
