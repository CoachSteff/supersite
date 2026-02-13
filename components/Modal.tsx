'use client';

import { useEffect, useRef, useCallback } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = title ? `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}` : undefined;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
      return;
    }

    // Focus trapping
    if (event.key === 'Tab' && contentRef.current) {
      const focusable = contentRef.current.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    }
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;

    // Save the element that had focus before the modal opened
    previousFocusRef.current = document.activeElement as HTMLElement;

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    // Focus the first focusable element inside the modal
    requestAnimationFrame(() => {
      if (contentRef.current) {
        const focusable = contentRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
      }
    });

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Restore focus to the element that triggered the modal
      previousFocusRef.current?.focus();
    };
  }, [isOpen, handleKeyDown]);

  function handleClickOutside(event: React.MouseEvent) {
    if (event.target === modalRef.current) {
      onClose();
    }
  }

  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalBackdrop} ref={modalRef} onClick={handleClickOutside}>
      <div
        ref={contentRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`${styles.modalContent} ${styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`]}`}
      >
        {title && (
          <div className={styles.modalHeader}>
            <h2 id={titleId} className={styles.modalTitle}>{title}</h2>
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
