'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import FavouritesList from '@/components/FavouritesList';
import { getFavoritesWithTimestamp, StoredFavorite, FavoriteItem } from '@/lib/favorites';
import styles from '@/styles/Favourites.module.css';

export default function FavouritesPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndLoadFavorites();
  }, []);

  async function checkAuthAndLoadFavorites() {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();

      if (!data.user) {
        router.push('/');
        return;
      }

      setUser(data.user);
      await loadFavorites();
    } catch (error) {
      console.error('[Favourites] Auth check failed:', error);
      router.push('/');
    } finally {
      setLoading(false);
    }
  }

  async function loadFavorites() {
    try {
      const storedFavorites: StoredFavorite[] = getFavoritesWithTimestamp();
      
      if (storedFavorites.length === 0) {
        setFavorites([]);
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

        enrichedFavorites.sort((a: FavoriteItem, b: FavoriteItem) => b.addedAt - a.addedAt);
        setFavorites(enrichedFavorites);
      }
    } catch (error) {
      console.error('[Favourites] Failed to load favorites:', error);
      setFavorites([]);
    }
  }

  function handleUpdate() {
    loadFavorites();
  }

  if (loading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1>Favourites</h1>
        <p>Manage your favourited pages and blog posts</p>
      </div>

      <FavouritesList initialFavorites={favorites} onUpdate={handleUpdate} />
    </div>
  );
}
