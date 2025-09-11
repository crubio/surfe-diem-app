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

// ========================================
// UTILITY TYPES FOR SPOT OPERATIONS
// ========================================

/**
 * Spot data for updates (all fields optional except id).
 */
export type SpotUpdate = Partial<Omit<Spot, 'id'>> & { id: number };

/**
 * Spot data for creation (required fields only)
 */
export type SpotCreate = Pick<Spot, 'name' | 'latitude' | 'longitude' | 'subregion_name' | 'timezone'> & 
  Partial<Omit<Spot, 'name' | 'latitude' | 'longitude' | 'subregion_name' | 'timezone'>>;

/**
 * Spot data for display (readonly)
 */
export type SpotDisplay = Readonly<Spot>;

/**
 * Spot data for API responses (with additional fields)
 */
export type SpotResponse = Spot & {
  created_at?: string;
  updated_at?: string;
};

// ========================================
// UTILITY TYPES FOR BUOY OPERATIONS
// ========================================

/**
 * Buoy data for updates (all fields optional except id)
 */
export type BuoyUpdate = Partial<Omit<Buoy, 'id'>> & { id: string };

/**
 * Buoy data for creation (required fields only)
 */
export type BuoyCreate = Pick<Buoy, 'name' | 'url' | 'location_id'> & 
  Partial<Omit<Buoy, 'name' | 'url' | 'location_id'>>;

/**
 * Buoy data for display (readonly)
 */
export type BuoyDisplay = Readonly<Buoy>;

/**
 * Buoy data for API responses (with additional fields)
 */
export type BuoyResponse = Buoy & {
  created_at?: string;
  updated_at?: string;
};

// ========================================
// UTILITY TYPES FOR FAVORITABLE ITEMS
// ========================================

/**
 * Union of all update types
 */
export type FavoritableUpdate = SpotUpdate | BuoyUpdate;

/**
 * Union of all create types
 */
export type FavoritableCreate = SpotCreate | BuoyCreate;

/**
 * Union of all display types
 */
export type FavoritableDisplay = SpotDisplay | BuoyDisplay;
