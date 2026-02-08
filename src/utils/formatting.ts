/**
 * Formatting utilities for consistent display across the site
 */

/**
 * Convert wind speed from km/h to mph
 * @param kilometersPerHour Wind speed in kilometers per hour
 * @returns Wind speed in miles per hour
 */
export const kilometersPerHourToMph = (kilometersPerHour: number): number => {
  return kilometersPerHour * 0.621371;
};

// Helper function to get wave height percentage for progress bar
export const getWaveHeightPercentage = (waveHeight: number) => {
  // Scale 0-15ft to 0-100%
  return Math.min((waveHeight / 15) * 100, 100);
};

// Helper function to get wind speed percentage for progress bar
export const getWindSpeedPercentage = (windSpeed: number) => {
  // Scale 0-30mph to 0-100%
  return Math.min((windSpeed / 30) * 100, 100);
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
export const formatWaveHeightRange = (height: number, range = 1): string => 
  `${height.toFixed(1)}-${(height + range).toFixed(1)}ft`;

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

/**
 * Calculate tide status from tide data
 * @param tideData Tide data from API
 * @returns Tide status object with state and time to next change
 */
export const calculateTideStatus = (tideData: any): { state: string; timeToNext: string } => {
  if (!tideData || !tideData.tides || tideData.tides.length === 0) {
    return { state: 'N/A', timeToNext: 'N/A' };
  }

  const now = new Date();
  const tides = tideData.tides;
  
  // Find current tide state by comparing with tide times
  let currentState = 'Unknown';
  let timeToNext = 'N/A';
  
  for (let i = 0; i < tides.length - 1; i++) {
    const currentTide = new Date(tides[i].time);
    const nextTide = new Date(tides[i + 1].time);
    
    if (now >= currentTide && now < nextTide) {
      // Determine if tide is rising or falling
      const currentHeight = tides[i].height;
      const nextHeight = tides[i + 1].height;
      
      currentState = nextHeight > currentHeight ? 'Rising' : 'Falling';
      
      // Calculate time to next tide change
      const timeDiff = nextTide.getTime() - now.getTime();
      const hours = Math.floor(timeDiff / (1000 * 60 * 60));
      const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        timeToNext = `${hours}h ${minutes}m`;
      } else {
        timeToNext = `${minutes}m`;
      }
      
      break;
    }
  }
  
  return { state: currentState, timeToNext };
}; 