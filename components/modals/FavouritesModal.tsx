'use client';

import { useState, useEffect } from 'react';
import Modal from '../Modal';
import FavouritesList from '../FavouritesList';
import { getFavoritesWithTimestamp, StoredFavorite, FavoriteItem } from '@/lib/favorites';
import styles from '@/styles/Favourites.module.css';

interface FavouritesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FavouritesModal({ isOpen, onClose }: FavouritesModalProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      loadFavorites();
    }
  }, [isOpen]);

  async function loadFavorites() {
    try {
      const storedFavorites: StoredFavorite[] = getFavoritesWithTimestamp();
      
      if (storedFavorites.length === 0) {
        setFavorites([]);
        setLoading(false);
        return;
      }

      const paths = storedFavorites.map(f => f.path);
      const response = await fetch(`/api/favorites?paths=${encodeURIComponent(JSON.stringify(paths))}`);
      const data = await response.json();

      if (data.favorites) {
        const enrichedFavorites = data.favorites.map((fav: FavoriteItem) => {
          const stored = storedFavorites.find(s => s.path === fav.path);
          return {
            ...fav,
            addedAt: stored?.addedAt || Date.now(),
          };
        });

        enrichedFavorites.sort((a: FavoriteItem, b: FavoriteItem) => (b.addedAt || 0) - (a.addedAt || 0));
        setFavorites(enrichedFavorites);
      }
    } catch (error) {
      console.error('[FavouritesModal] Failed to load favorites:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRemove() {
    // Reload favorites after removal
    loadFavorites();
  }

  if (!isOpen) {
    return null;
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Favourites" size="md">
      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
      ) : (
        <div className={styles.container}>
          <FavouritesList initialFavorites={favorites} onUpdate={handleRemove} />
        </div>
      )}
    </Modal>
  );
}
