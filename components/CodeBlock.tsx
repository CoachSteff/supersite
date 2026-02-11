'use client';

import { useState, ReactNode } from 'react';
import styles from '@/styles/CodeBlock.module.css';

interface CodeBlockProps {
  code: string | ReactNode;
  language?: string;
  className?: string;
  children?: ReactNode;
}

export default function CodeBlock({ code, language, className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract the actual code string
  const codeString = typeof code === 'string' ? code : String(code);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(codeString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Extract language from className if not provided
  const lang = language || (className?.match(/language-(\w+)/)?.[1]) || 'text';
  const displayLang = lang.toUpperCase();

  return (
    <div className={styles.codeBlockWrapper}>
      <pre className={className}>
        <code>{children || code}</code>
      </pre>
      <div className={styles.codeBlockToolbar}>
        <span className={styles.languageLabel}>{displayLang}</span>
        <button
          onClick={handleCopy}
          className={styles.copyButton}
          aria-label={copied ? 'Copied!' : 'Copy code'}
        >
          {copied ? (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
