import { Spot, Buoy } from './core';

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

/**
 * Discriminated union for type-safe favorite handling
 */
export type FavoritableItem = 
  | { type: 'spot'; data: Spot }
  | { type: 'buoy'; data: Buoy };

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
  removeFavorite: (id: string, type: 'spot' | 'buoy') => void;
  isFavorited: (id: string, type: 'spot' | 'buoy') => boolean;
  getFavoritesByType: (type: 'spot' | 'buoy') => Favorite[];
} 