/**
 * Main types index - exports all types for easy importing
 */

// Core domain types
export * from './core';

// API types
export * from './api';

// Common utility types
export * from './common';

// Favorites types
// Explicitly re-export FavoritableItem to resolve export ambiguity
export type { FavoritableItem } from './favorites';
export * from './favorites';

// Re-export feature types for convenience
export * from '../features/forecasts/types';
export * from '../features/weather/types';
export * from '../features/maps/types';
