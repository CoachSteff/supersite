'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, X, FileText, BookOpen } from 'lucide-react';
import styles from '@/styles/Search.module.css';

interface SearchResult {
  title: string;
  description?: string;
  path: string;
  type: 'page' | 'blog';
}

interface SearchProps {
  onClose: () => void;
}

export default function Search({ onClose }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        const data = await response.json();
        setResults(data.results || []);
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.searchBox}>
          <SearchIcon size={20} className={styles.searchIcon} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className={styles.input}
          />
          <button onClick={onClose} className={styles.closeButton}>
            <X size={20} />
          </button>
        </div>
        
        {loading && <div className={styles.loading}>Searching...</div>}
        
        {!loading && results.length > 0 && (
          <div className={styles.results}>
            {results.map((result) => (
              <Link
                key={result.path}
                href={result.path}
                className={styles.result}
                onClick={onClose}
              >
                <div className={styles.resultIcon}>
                  {result.type === 'blog' ? <BookOpen size={16} /> : <FileText size={16} />}
                </div>
                <div className={styles.resultContent}>
                  <div className={styles.resultType}>{result.type}</div>
                  <h3>{result.title}</h3>
                  {result.description && <p>{result.description}</p>}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {!loading && query && results.length === 0 && (
          <div className={styles.noResults}>No results found</div>
        )}
      </div>
    </div>
  );
}
