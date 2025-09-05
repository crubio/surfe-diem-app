import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
  addFavorite,
  removeFavorite,
  isFavorited,
  getFavoritesByType,
  getFavoriteById,
  getFavoriteDisplayLocation,
} from '../favorites';
import { Favorite } from '../../types';

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('Favorites Utilities', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockFavorite: Omit<Favorite, 'addedAt'> = {
    id: '1', // String ID for consistency
    type: 'spot',
    name: 'Test Spot',
    subregion_name: 'Test Region',
    latitude: 36.934,
    longitude: -122.034,
    location: undefined,
  };

  const mockFavorites: Favorite[] = [
    {
      ...mockFavorite,
      addedAt: '2023-01-01T00:00:00.000Z',
    },
    {
      id: '2',
      type: 'buoy',
      name: 'Test Buoy',
      location: '36.934 N 122.034 W',
      addedAt: '2023-01-01T00:00:00.000Z',
    },
  ];

  describe('loadFavoritesFromStorage', () => {
    it('should return empty array when no favorites stored', () => {
      localStorageMock.getItem.mockReturnValue(null);
      const result = loadFavoritesFromStorage();
      expect(result).toEqual([]);
    });

    it('should return parsed favorites when valid data exists', () => {
      localStorageMock.getItem.mockReturnValue(JSON.stringify(mockFavorites));
      const result = loadFavoritesFromStorage();
      expect(result).toEqual(mockFavorites);
    });

    it('should handle invalid JSON and return empty array', () => {
      localStorageMock.getItem.mockReturnValue('invalid json');
      const result = loadFavoritesFromStorage();
      expect(result).toEqual([]);
      expect(localStorageMock.removeItem).toHaveBeenCalled();
    });
  });

  describe('saveFavoritesToStorage', () => {
    it('should save favorites to localStorage', () => {
      saveFavoritesToStorage(mockFavorites);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'surfe-diem-favorites',
        JSON.stringify(mockFavorites)
      );
    });
  });

  describe('addFavorite', () => {
    it('should add a new favorite with timestamp', () => {
      const result = addFavorite([], mockFavorite);
      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject(mockFavorite);
      expect(result[0].addedAt).toBeDefined();
    });

    it('should not add duplicate favorites', () => {
      const existingFavorites = [mockFavorites[0]];
      const result = addFavorite(existingFavorites, mockFavorite);
      expect(result).toEqual(existingFavorites);
    });
  });

  describe('removeFavorite', () => {
    it('should remove a favorite by id and type', () => {
      const result = removeFavorite(mockFavorites, '1', 'spot');
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('2');
    });

    it('should return unchanged array if favorite not found', () => {
      const result = removeFavorite(mockFavorites, '999', 'spot');
      expect(result).toEqual(mockFavorites);
    });
  });

  describe('isFavorited', () => {
    it('should return true for existing favorite', () => {
      const result = isFavorited(mockFavorites, '1', 'spot');
      expect(result).toBe(true);
    });

    it('should return false for non-existing favorite', () => {
      const result = isFavorited(mockFavorites, '999', 'spot');
      expect(result).toBe(false);
    });
  });

  describe('getFavoritesByType', () => {
    it('should return only spots', () => {
      const result = getFavoritesByType(mockFavorites, 'spot');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('spot');
    });

    it('should return only buoys', () => {
      const result = getFavoritesByType(mockFavorites, 'buoy');
      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('buoy');
    });
  });

  describe('getFavoriteById', () => {
    it('should return favorite by id and type', () => {
      const result = getFavoriteById(mockFavorites, '1', 'spot');
      expect(result).toEqual(mockFavorites[0]);
    });

    it('should return undefined if not found', () => {
      const result = getFavoriteById(mockFavorites, '999', 'spot');
      expect(result).toBeUndefined();
    });
  });

  describe('getFavoriteDisplayLocation', () => {
    it('should return location string for buoy', () => {
      const result = getFavoriteDisplayLocation(mockFavorites[1]);
      expect(result).toBe('36.934 N 122.034 W');
    });

    it('should return formatted coordinates for spot', () => {
      const result = getFavoriteDisplayLocation(mockFavorites[0]);
      expect(result).toBe('36.934, -122.034');
    });

    it('should return fallback for missing location data', () => {
      const favoriteWithoutLocation: Favorite = {
        id: '3',
        type: 'spot',
        name: 'Test Spot',
        addedAt: '2023-01-01T00:00:00.000Z',
      };
      const result = getFavoriteDisplayLocation(favoriteWithoutLocation);
      expect(result).toBe('Location unavailable');
    });
  });
}); 