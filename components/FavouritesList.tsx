'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, Search, Star } from 'lucide-react';
import { FavoriteItem } from '@/lib/favorites';
import { removeFavorite } from '@/lib/favorites';
import styles from '@/styles/Favourites.module.css';

interface FavouritesListProps {
  initialFavorites: FavoriteItem[];
  onUpdate: () => void;
}

type FilterType = 'all' | 'page' | 'blog';

export default function FavouritesList({ initialFavorites, onUpdate }: FavouritesListProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>(initialFavorites);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');

  useEffect(() => {
    setFavorites(initialFavorites);
  }, [initialFavorites]);

  const handleRemove = (path: string) => {
    removeFavorite(path);
    setFavorites(prev => prev.filter(f => f.path !== path));
    onUpdate();
  };

  const filteredFavorites = favorites.filter(fav => {
    const matchesSearch = fav.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         fav.path.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'all' || fav.type === filterType;
    return matchesSearch && matchesType;
  });

  if (favorites.length === 0) {
    return (
      <div className={styles.emptyState}>
        <Star size={64} className={styles.emptyIcon} />
        <h2>No favourites yet</h2>
        <p>Start favouriting pages by clicking the star icon on any page or blog post</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.searchBox}>
          <Search size={20} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search favourites..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterButtons}>
          <button
            onClick={() => setFilterType('all')}
            className={`${styles.filterButton} ${filterType === 'all' ? styles.filterButtonActive : ''}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterType('page')}
            className={`${styles.filterButton} ${filterType === 'page' ? styles.filterButtonActive : ''}`}
          >
            Pages
          </button>
          <button
            onClick={() => setFilterType('blog')}
            className={`${styles.filterButton} ${filterType === 'blog' ? styles.filterButtonActive : ''}`}
          >
            Blog Posts
          </button>
        </div>
      </div>

      {filteredFavorites.length === 0 ? (
        <div className={styles.noResults}>
          <p>No favourites match your search</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filteredFavorites.map((fav) => (
            <div key={fav.path} className={styles.item}>
              <div className={styles.itemContent}>
                <Link href={fav.path} className={styles.itemLink}>
                  <h3 className={styles.itemTitle}>{fav.title}</h3>
                  <p className={styles.itemPath}>{fav.path}</p>
                </Link>
                <span className={styles.typeBadge}>
                  {fav.type === 'blog' ? 'Blog Post' : 'Page'}
                </span>
              </div>
              <button
                onClick={() => handleRemove(fav.path)}
                className={styles.removeButton}
                aria-label={`Remove ${fav.title} from favourites`}
                title="Remove from favourites"
              >
                <X size={20} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
