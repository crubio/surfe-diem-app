export interface Favorite {
  id: string; // Using string for flexibility with both numeric and string IDs
  type: 'spot' | 'buoy';
  name: string;
  subregion_name?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
  addedAt: string; // ISO timestamp
}

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