import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Favorite, FavoritesState, FavoritesContextType, FavoriteCreate, FavoriteableId, FavoriteType } from '../types';
import {
  loadFavoritesFromStorage,
  saveFavoritesToStorage,
  addFavorite as addFavoriteUtil,
  removeFavorite as removeFavoriteUtil,
  isFavorited as isFavoritedUtil,
  getFavoritesByType as getFavoritesByTypeUtil,
} from '../utils/favorites';

// Initial state
const initialState: FavoritesState = {
  favorites: [],
  isLoading: true,
  error: null,
};

// Action types
type FavoritesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_FAVORITES'; payload: Favorite[] }
  | { type: 'ADD_FAVORITE'; payload: FavoriteCreate }
  | { type: 'REMOVE_FAVORITE'; payload: { id: FavoriteableId; type: FavoriteType }; };

// Reducer
const favoritesReducer = (state: FavoritesState, action: FavoritesAction): FavoritesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_FAVORITES':
      return { ...state, favorites: action.payload, isLoading: false };
    case 'ADD_FAVORITE': {
      const newFavorites = addFavoriteUtil(state.favorites, action.payload);
      return { ...state, favorites: newFavorites };
    }
    case 'REMOVE_FAVORITE': {
      const newFavorites = removeFavoriteUtil(state.favorites, String(action.payload.id), action.payload.type);
      return { ...state, favorites: newFavorites };
    }
    default:
      return state;
  }
};

// Create context
const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

// Provider component
interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Load favorites from localStorage on mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        const favorites = loadFavoritesFromStorage();
        dispatch({ type: 'SET_FAVORITES', payload: favorites });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load favorites';
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadFavorites();
  }, []);

  // Save favorites to localStorage whenever they change
  useEffect(() => {
    if (!state.isLoading) {
      saveFavoritesToStorage(state.favorites);
    }
  }, [state.favorites, state.isLoading]);

  // Context methods
  const addFavorite = (favorite: FavoriteCreate) => {
    dispatch({ type: 'ADD_FAVORITE', payload: favorite });
  };

  const removeFavorite = (id: FavoriteableId, type: FavoriteType) => {
    dispatch({ type: 'REMOVE_FAVORITE', payload: { id, type } });
  };

  const isFavorited = (id: FavoriteableId, type: FavoriteType): boolean => {
    return isFavoritedUtil(state.favorites, String(id), type);
  };

  const getFavoritesByType = (type: FavoriteType): Favorite[] => {
    return getFavoritesByTypeUtil(state.favorites, type);
  };

  const contextValue: FavoritesContextType = {
    favorites: state.favorites,
    isLoading: state.isLoading,
    error: state.error,
    addFavorite,
    removeFavorite,
    isFavorited,
    getFavoritesByType,
  };

  return (
    <FavoritesContext.Provider value={contextValue}>
      {children}
    </FavoritesContext.Provider>
  );
};

// Custom hook to use favorites context
export const useFavorites = (): FavoritesContextType => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}; 