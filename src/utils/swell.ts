/**
 * Swell data processing utilities
 */

/**
 * Get swell quality description based on period
 * @param period Swell period in seconds
 * @returns Quality description
 */
export function getSwellQualityDescription(period: number): string {
  if (!period || period < 0) return 'Unknown';
  
  if (period < 8) {
    return 'Wind swell';
  } else if (period < 12) {
    return 'Mixed swell';
  } else if (period < 16) {
    return 'Ground swell';
  } else {
    return 'Long period ground swell';
  }
}

/**
 * Convert degrees to cardinal direction
 * @param degrees Direction in degrees
 * @returns Cardinal direction (N, NE, E, SE, S, SW, W, NW)
 */
export function getSwellDirectionText(degrees: number): string {
  if (degrees === undefined || degrees === null || degrees < 0) return 'N/A';
  
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round(degrees / 22.5) % 16;
  return directions[index];
}

/**
 * Get color for swell height
 * @param height Swell height in feet
 * @returns Color indicator
 */
export function getSwellHeightColor(height: number): 'success' | 'warning' | 'error' | 'info' {
  if (!height || height < 0) return 'info';
  
  if (height >= 6) return 'error';    // Big waves
  if (height >= 3) return 'warning';  // Medium waves
  if (height >= 1) return 'success';  // Good waves
  return 'info';                      // Small waves
}

/**
 * Format swell height for display
 * @param height Swell height in feet
 * @returns Formatted height string
 */
export function formatSwellHeight(height: number): string {
  if (!height || height < 0) return '0ft';
  return `${height.toFixed(1)}ft`;
}

/**
 * Format swell period for display
 * @param period Swell period in seconds
 * @returns Formatted period string, or "—" when unknown (null, or ≤ 0: no swell
 *   has a 0 s period, and the API leaves a period null rather than estimating it)
 */
export function formatSwellPeriod(period: number | null | undefined): string {
  if (period == null || period <= 0) return '—';
  return `${period.toFixed(0)}s`;
}
