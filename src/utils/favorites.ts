import { Favorite } from '../types';

const FAVORITES_STORAGE_KEY = 'surfe-diem-favorites';

/**
 * Load favorites from localStorage
 */
export const loadFavoritesFromStorage = (): Favorite[] => {
  try {
    const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!stored) return [];
    
    const favorites = JSON.parse(stored);
    
    // Validate that the stored data is an array
    if (!Array.isArray(favorites)) {
      console.warn('Invalid favorites data in localStorage, clearing...');
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
      return [];
    }
    
    return favorites;
  } catch (error) {
    console.error('Error loading favorites from localStorage:', error);
    // Clear corrupted data
    localStorage.removeItem(FAVORITES_STORAGE_KEY);
    return [];
  }
};

/**
 * Save favorites to localStorage
 */
export const saveFavoritesToStorage = (favorites: Favorite[]): void => {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving favorites to localStorage:', error);
    // Handle quota exceeded or other storage errors
    if (error instanceof Error && error.name === 'QuotaExceededError') {
      console.warn('localStorage quota exceeded, favorites not saved');
    }
  }
};

/**
 * Add a favorite to the list
 */
export const addFavorite = (favorites: Favorite[], newFavorite: Omit<Favorite, 'addedAt'>): Favorite[] => {
  const favoriteWithTimestamp: Favorite = {
    ...newFavorite,
    addedAt: new Date().toISOString(),
  };
  
  // Check if already exists
  const exists = favorites.some(fav => fav.id === newFavorite.id && fav.type === newFavorite.type);
  if (exists) {
    return favorites; // Already exists, return unchanged
  }
  
  return [...favorites, favoriteWithTimestamp];
};

/**
 * Remove a favorite from the list
 */
export const removeFavorite = (favorites: Favorite[], id: string, type: 'spot' | 'buoy'): Favorite[] => {
  return favorites.filter(fav => !(fav.id === id && fav.type === type));
};

/**
 * Check if an item is favorited
 */
export const isFavorited = (favorites: Favorite[], id: string, type: 'spot' | 'buoy'): boolean => {
  return favorites.some(fav => fav.id === id && fav.type === type);
};

/**
 * Get favorites filtered by type
 */
export const getFavoritesByType = (favorites: Favorite[], type: 'spot' | 'buoy'): Favorite[] => {
  return favorites.filter(fav => fav.type === type);
};

/**
 * Get unique favorite by id and type
 */
export const getFavoriteById = (favorites: Favorite[], id: string, type: 'spot' | 'buoy'): Favorite | undefined => {
  return favorites.find(fav => fav.id === id && fav.type === type);
};

/**
 * Get display location for a favorite
 * Handles both coordinate-based (spots) and string-based (buoys) locations
 */
export const getFavoriteDisplayLocation = (favorite: Favorite): string => {
  if (favorite.location) {
    return favorite.location;
  }
  
  if (favorite.latitude !== undefined && favorite.longitude !== undefined) {
    return `${favorite.latitude.toFixed(3)}, ${favorite.longitude.toFixed(3)}`;
  }
  
  return 'Location unavailable';
}; 