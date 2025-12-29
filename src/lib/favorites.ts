const FAVORITES_KEY = 'thoai-favorites';

export function getFavorites(): string[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const stored = localStorage.getItem(FAVORITES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error reading favorites:', error);
    return [];
  }
}

export function isFavorite(path: string): boolean {
  const favorites = getFavorites();
  return favorites.includes(path);
}

export function addFavorite(path: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const favorites = getFavorites();
  if (!favorites.includes(path)) {
    favorites.push(path);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
  }
}

export function removeFavorite(path: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  const favorites = getFavorites();
  const filtered = favorites.filter(fav => fav !== path);
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
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
