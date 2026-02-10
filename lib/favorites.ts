const FAVORITES_KEY = 'thoai-favorites';

export interface StoredFavorite {
  path: string;
  addedAt: number;
}

export interface FavoriteItem {
  path: string;
  title: string;
  type: 'page' | 'blog';
  addedAt: number;
}

function getStoredFavorites(): StoredFavorite[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (!stored) return [];

    const parsed = JSON.parse(stored);
    
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) return [];
      
      if (typeof parsed[0] === 'string') {
        return parsed.map(path => ({ path, addedAt: Date.now() }));
      }
      
      return parsed as StoredFavorite[];
    }
    
    return [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

function setStoredFavorites(favorites: StoredFavorite[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
}

export function getFavorites(): string[] {
  return getStoredFavorites().map(f => f.path);
}

export function isFavorite(path: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(path);
}

export function addFavorite(path: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const favorites = getStoredFavorites();
  if (!favorites.some(f => f.path === path)) {
    favorites.push({ path, addedAt: Date.now() });
    setStoredFavorites(favorites);
  }
}

export function removeFavorite(path: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const favorites = getStoredFavorites();
  const filtered = favorites.filter(fav => fav.path !== path);
  setStoredFavorites(filtered);
}

export function toggleFavorite(path: string): boolean {
  if (isFavorite(path)) {
    removeFavorite(path);
    return false;
  } else {
    addFavorite(path);
    return true;
  }
}

export function getFavoritesWithTimestamp(): StoredFavorite[] {
  return getStoredFavorites().sort((a, b) => b.addedAt - a.addedAt);
}
