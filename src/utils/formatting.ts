/**
 * Formatting utilities for consistent display across the site
 */

/**
 * Convert wind speed from km/h to mph
 * @param kilometersPerHour Wind speed in kilometers per hour
 * @returns Wind speed in miles per hour
 */
export const kilometersPerHourToMph = (kilometersPerHour: number): number => {
  return parseFloat((kilometersPerHour * 0.621371).toFixed(0));
};

/**
 * Format coordinates to 4 decimal places
 * @param lat Latitude
 * @param lng Longitude
 * @returns Formatted coordinate string
 */
export const formatCoordinates = (lat: number, lng: number): string => 
  `${lat.toFixed(4)}, ${lng.toFixed(4)}`;

/**
 * Format direction (convert degrees to cardinal directions)
 * @param degrees Direction in degrees
 * @returns Cardinal direction string
 */
export const formatDirection = (degrees: number): string => {
  if (degrees === undefined || degrees === null) return 'N/A';
  
  // Handle negative degrees by converting to positive
  let positiveDegrees = degrees;
  while (positiveDegrees < 0) {
    positiveDegrees += 360;
  }
  
  // Normalize to 0-360 range
  positiveDegrees = positiveDegrees % 360;
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(positiveDegrees / 22.5) % 16;
  return directions[index];
};

/**
 * Format temperature (Celsius to Fahrenheit)
 * @param tempC Temperature in Celsius
 * @returns Formatted temperature string in Fahrenheit
 */
export const formatTemperature = (tempC: number): string => {
  if (tempC === undefined || tempC === null) return 'N/A';
  const tempF = (tempC * 9/5) + 32;
  return `${tempF.toFixed(0)}°F`;
};
