'use client';

import { useState } from 'react';
import { 
  ArrowRight, 
  Search, 
  Link, 
  Copy, 
  Check,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { AIAction } from '@/lib/ai-actions';
import styles from '@/styles/ActionButton.module.css';

interface ActionButtonProps {
  action: AIAction;
  onClick: () => Promise<void>;
}

export default function ActionButton({ action, onClick }: ActionButtonProps) {
  const [isExecuting, setIsExecuting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleClick = async () => {
    if (isExecuting || isComplete) return;
    
    setIsExecuting(true);
    try {
      await onClick();
      setIsComplete(true);
      
      // Reset after 2 seconds
      setTimeout(() => {
        setIsComplete(false);
      }, 2000);
    } catch (error) {
      console.error('Action failed:', error);
    } finally {
      setIsExecuting(false);
    }
  };

  const getIcon = () => {
    if (isComplete) return <Check size={14} />;
    
    switch (action.type) {
      case 'navigate':
        return <ArrowRight size={14} />;
      case 'search':
        return <Search size={14} />;
      case 'openLink':
        return <ExternalLink size={14} />;
      case 'copyText':
        return <Copy size={14} />;
      case 'scroll':
        return <ChevronDown size={14} />;
      default:
        return <Link size={14} />;
    }
  };

  const getLabel = (): string => {
    if (action.label) return action.label;
    
    switch (action.type) {
      case 'navigate':
        return `Go to ${action.payload.path}`;
      case 'search':
        return `Search: ${action.payload.query}`;
      case 'openLink':
        return (typeof action.payload.label === 'string' ? action.payload.label : null) || 'Open link';
      case 'copyText':
        return 'Copy to clipboard';
      case 'scroll':
        return `Scroll to ${action.payload.target}`;
      default:
        return 'Action';
    }
  };

  return (
    <button
      className={`${styles.actionButton} ${isComplete ? styles.complete : ''}`}
      onClick={handleClick}
      disabled={isExecuting}
      title={(action.description as string | undefined) || undefined}
    >
      <span className={styles.icon}>{getIcon()}</span>
      <span className={styles.label}>{getLabel()}</span>
    </button>
  );
}
