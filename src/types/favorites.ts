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

/**
 * Favorite data for updates (partial data)
 */
export type FavoriteUpdate = Partial<Omit<Favorite, 'id' | 'addedAt'>> & { id: string | number };

/**
 * Favorite data for display (readonly)
 */
export type FavoriteDisplay = Readonly<Favorite>;

/**
 * Favorite data for API responses (with additional fields)
 */
export type FavoriteResponse = Favorite & {
  created_at?: string;
  updated_at?: string;
};

/**
 * Favorites state for updates
 */
export type FavoritesStateUpdate = Partial<Omit<FavoritesState, 'favorites'>> & {
  favorites?: Favorite[];
};

/**
 * Favorites context for updates
 */
export type FavoritesContextUpdate = Partial<Omit<FavoritesContextType, 'favorites'>> & {
  favorites?: Favorite[];
};

// ========================================
// UTILITY TYPES FOR FAVORITE FILTERING
// ========================================

/**
 * Filter favorites by type
 */
export type FavoritesByType<T extends 'spot' | 'buoy'> = Favorite & { type: T };

/**
 * Filter favorites by ID type
 */
export type FavoritesByIdType<T extends string | number> = Favorite & { id: T };

/**
 * Filter favorites by location
 */
export type FavoritesByLocation = Favorite & {
  latitude: number;
  longitude: number;
};

/**
 * Filter favorites by subregion
 */
export type FavoritesBySubregion = Favorite & {
  subregion_name: string;
}; 