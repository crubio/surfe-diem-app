/**
 * Formatting utilities for consistent display across the site
 */

/**
 * Format coordinates to 4 decimal places
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted coordinate string
 */
export const formatCoordinates = (lat: number, lng: number): string => 
  `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

/**
 * Format wave height to 1 decimal place
 * @param height Wave height in feet
 * @returns Formatted wave height string
 */
export const formatWaveHeight = (height: number): string => 
  height.toFixed(1);

/**
 * Format wave height range (e.g., "3.8-4.8ft")
 * @param height Base wave height in feet
 * @param range Range to add (default: 1)
 * @returns Formatted wave height range string
 */
export const formatWaveHeightRange = (height: number, range: number = 1): string => 
  `${height.toFixed(1)}-${(height + range).toFixed(1)}ft`; 