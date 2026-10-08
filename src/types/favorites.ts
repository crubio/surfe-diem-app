// Core types for managing favorites
export type FavoriteType = 'spot' | 'buoy';
export type FavoriteableId = string | number;

export interface Favorite {
  id: string | number; // Flexible for both numeric and string IDs
  type: 'spot' | 'buoy';
  name: string;
  subregion_name?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  addedAt: string; // ISO timestamp
}

// State management types
export interface FavoritesState {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
}

export interface FavoritesContextType {
  favorites: Favorite[];
  isLoading: boolean;
  error: string | null;
  addFavorite: (favorite: Omit<Favorite, 'addedAt'>) => void;
  removeFavorite: (id: string | number, type: 'spot' | 'buoy') => void;
  isFavorited: (id: string | number, type: 'spot' | 'buoy') => boolean;
  getFavoritesByType: (type: 'spot' | 'buoy') => Favorite[];
}

/**
 * Favorite data for creation (without addedAt)
 */
export type FavoriteCreate = Omit<Favorite, 'addedAt'>;

// ========================================
// UTILITY TYPES FOR FAVORITE FILTERING
// ========================================

