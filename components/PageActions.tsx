'use client';

import { useState, useEffect } from 'react';
import { Copy, Star, Share2 } from 'lucide-react';
import { isFavorite, toggleFavorite } from '@/lib/favorites';
import SharePopup from './SharePopup';
import LanguageSwitcher from './LanguageSwitcher';
import styles from '@/styles/PageActions.module.css';

interface PageActionsProps {
  title: string;
  markdown: string;
  path: string;
  url: string;
}

export default function PageActions({ title, markdown, path, url }: PageActionsProps) {
  const [isFavorited, setIsFavorited] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  useEffect(() => {
    setIsFavorited(isFavorite(path));
  }, [path]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(markdown);
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleStar = () => {
    const newState = toggleFavorite(path);
    setIsFavorited(newState);
  };

  const handleShare = () => {
    setShowSharePopup(true);
  };

  return (
    <>
      <div className={styles.separator} />
      <div className={styles.actions}>
        <button 
          className={styles.actionButton} 
          onClick={handleCopy}
          aria-label="Copy as markdown"
          title="Copy as markdown"
        >
          <Copy size={18} />
          {showCopied && <span className={styles.feedback}>Copied!</span>}
        </button>

        <LanguageSwitcher compact />

        <button 
          className={`${styles.actionButton} ${isFavorited ? styles.starred : ''}`}
          onClick={handleStar}
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
          title={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Star size={18} fill={isFavorited ? 'currentColor' : 'none'} />
        </button>

        <button 
          className={styles.actionButton}
          onClick={handleShare}
          aria-label="Share page"
          title="Share page"
        >
          <Share2 size={18} />
        </button>
      </div>

      {showSharePopup && (
        <SharePopup 
          title={title}
          url={url}
          onClose={() => setShowSharePopup(false)}
        />
      )}
    </>
  );
}
