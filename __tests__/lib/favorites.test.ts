import { getFavorites, isFavorite, addFavorite, removeFavorite, toggleFavorite } from '@/lib/favorites';

describe('Favorites', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('getFavorites', () => {
    it('should return empty array when no favorites exist', () => {
      expect(getFavorites()).toEqual([]);
    });

    it('should return stored favorites', () => {
      localStorage.setItem('thoai-favorites', JSON.stringify(['/page1', '/page2']));
      expect(getFavorites()).toEqual(['/page1', '/page2']);
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('thoai-favorites', 'invalid-json');
      expect(getFavorites()).toEqual([]);
    });
  });

  describe('isFavorite', () => {
    it('should return false when page is not favorited', () => {
      expect(isFavorite('/page1')).toBe(false);
    });

    it('should return true when page is favorited', () => {
      localStorage.setItem('thoai-favorites', JSON.stringify(['/page1', '/page2']));
      expect(isFavorite('/page1')).toBe(true);
      expect(isFavorite('/page2')).toBe(true);
    });
  });

  describe('addFavorite', () => {
    it('should add a new favorite', () => {
      addFavorite('/page1');
      expect(getFavorites()).toEqual(['/page1']);
    });

    it('should not add duplicate favorites', () => {
      addFavorite('/page1');
      addFavorite('/page1');
      expect(getFavorites()).toEqual(['/page1']);
    });

    it('should add multiple favorites', () => {
      addFavorite('/page1');
      addFavorite('/page2');
      expect(getFavorites()).toEqual(['/page1', '/page2']);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite', () => {
      localStorage.setItem('thoai-favorites', JSON.stringify(['/page1', '/page2']));
      removeFavorite('/page1');
      expect(getFavorites()).toEqual(['/page2']);
    });

    it('should handle removing non-existent favorite', () => {
      localStorage.setItem('thoai-favorites', JSON.stringify(['/page1']));
      removeFavorite('/page2');
      expect(getFavorites()).toEqual(['/page1']);
    });
  });

  describe('toggleFavorite', () => {
    it('should add favorite if not present', () => {
      const result = toggleFavorite('/page1');
      expect(result).toBe(true);
      expect(getFavorites()).toEqual(['/page1']);
    });

    it('should remove favorite if present', () => {
      localStorage.setItem('thoai-favorites', JSON.stringify(['/page1']));
      const result = toggleFavorite('/page1');
      expect(result).toBe(false);
      expect(getFavorites()).toEqual([]);
    });
  });
});
