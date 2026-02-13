'use client';

import { useState, useEffect, useRef, ReactNode } from 'react';
import type React from 'react';
import styles from '@/styles/CodeBlock.module.css';

function extractTextFromChildren(children: ReactNode): string {
  if (typeof children === 'string') {
    return children;
  }
  
  if (Array.isArray(children)) {
    return children.map(extractTextFromChildren).join('');
  }
  
  if (children && typeof children === 'object' && 'props' in children) {
    const element = children as React.ReactElement;
    return extractTextFromChildren(element.props.children);
  }
  
  return '';
}

interface CodeBlockProps {
  code: string | ReactNode;
  language?: string;
  className?: string;
  children?: ReactNode;
}

export default function CodeBlock({ code, language, className, children }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const preRef = useRef<HTMLPreElement>(null);

  // Only mount toolbar on client side after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract the actual code string from React nodes
  const codeString = extractTextFromChildren(children) || 
                     (typeof code === 'string' ? code : String(code));

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
    <>
      <pre ref={preRef} className={`${className || ''} ${styles.codeBlock}`}>
        <code>{children || code}</code>
      </pre>
      {isMounted && (
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
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span role="status" aria-live="polite">Copied!</span>
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
                  aria-hidden="true"
                >
                  <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
                  <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
                </svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
