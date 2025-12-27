'use client';

import { useEffect } from 'react';
import { X, Link, Twitter, Linkedin, Mail } from 'lucide-react';
import styles from '@/styles/Share.module.css';

interface SharePopupProps {
  title: string;
  url: string;
  onClose: () => void;
}

export default function SharePopup({ title, url, onClose }: SharePopupProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareOnX = () => {
    const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const shareOnLinkedIn = () => {
    const shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    window.open(shareUrl, '_blank', 'noopener,noreferrer');
  };

  const shareViaEmail = () => {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}`;
    window.location.href = mailtoUrl;
  };

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.popup}>
        <div className={styles.header}>
          <h3>Share this page</h3>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className={styles.separator} />
        <div className={styles.options}>
          <button className={styles.option} onClick={copyLink}>
            <Link size={20} />
            <span>Copy link</span>
          </button>
          <button className={styles.option} onClick={shareOnX}>
            <Twitter size={20} />
            <span>Share on X</span>
          </button>
          <button className={styles.option} onClick={shareOnLinkedIn}>
            <Linkedin size={20} />
            <span>Share on LinkedIn</span>
          </button>
          <button className={styles.option} onClick={shareViaEmail}>
            <Mail size={20} />
            <span>Share via Email</span>
          </button>
        </div>
      </div>
    </div>
  );
}
