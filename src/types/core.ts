/**
 * Core domain types for Surfe Diem
 * These are the fundamental types used across the application
 */

/**
 * Surf spot with numeric ID
 */
export interface Spot {
  id: number;
  name: string;
  slug: string;
  latitude: number;
  longitude: number;
  active: boolean;
  subregion_name: string;
  timezone: string;
  distance?: number;
}

/**
 * Buoy with string ID
 */
export interface Buoy {
  id: string;
  name: string;
  url: string;
  active: boolean;
  description?: string;
  depth?: string;
  elevation?: string;
  location?: string;
  location_id: string;
  date_created: string;
  date_updated: string;
  station_id?: string;
}

/**
 * Union type for all favoritable items
 */
export type FavoritableItem = Spot | Buoy;

/**
 * Base interface for items that can be favorited
 */
export interface BaseFavoritable {
  name: string;
  subregion_name?: string;
  latitude?: number;
  longitude?: number;
  location?: string;
}
