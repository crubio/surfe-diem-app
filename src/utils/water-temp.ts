/**
 * Water temperature utilities for surf conditions
 */

export interface WaterTempData {
  temperature: number; // Celsius
  unit: 'C' | 'F';
}

/**
 * Extract water temperature data from API forecast
 * @param forecast API forecast response
 * @returns WaterTempData or null if not available
 */
export function extractWaterTempFromForecast(forecast: any): WaterTempData | null {
  if (!forecast?.current) {
    return null;
  }

  const { current } = forecast;
  const seaSurfaceTemp = current.sea_surface_temperature;
  
  if (seaSurfaceTemp === undefined || seaSurfaceTemp === null) {
    return null;
  }
  
  return {
    temperature: seaSurfaceTemp,
    unit: 'C' // API returns Celsius
  };
}

/**
 * Get water temperature quality description
 * @param tempC Temperature in Celsius
 * @returns Description of water temperature quality
 */
export function getWaterTempQualityDescription(tempC: number): string {
  if (tempC < 10) return 'Very Cold';
  if (tempC < 15) return 'Cold';
  if (tempC < 20) return 'Cool';
  if (tempC < 25) return 'Warm';
  if (tempC < 30) return 'Very Warm';
  return 'Hot';
}

/**
 * Get water temperature color for UI
 * @param tempC Temperature in Celsius
 * @returns Color for temperature display
 */
export function getWaterTempColor(tempC: number): 'success' | 'warning' | 'error' | 'info' {
  if (tempC < 10) return 'error';      // Very cold - red
  if (tempC < 15) return 'warning';    // Cold - orange
  if (tempC < 20) return 'info';       // Cool - blue
  if (tempC < 25) return 'success';    // Warm - green
  if (tempC < 30) return 'warning';    // Very warm - orange
  return 'error';                      // Hot - red
}

/**
 * Format water temperature for display
 * @param tempC Temperature in Celsius
 * @param unit Target unit ('C' or 'F')
 * @returns Formatted temperature string
 */
export function formatWaterTemp(tempC: number, unit: 'C' | 'F' = 'C'): string {
  if (unit === 'F') {
    const tempF = (tempC * 9/5) + 32;
    return `${tempF.toFixed(1)}°F`;
  }
  return `${tempC.toFixed(1)}°C`;
}

/**
 * Get water temperature percentage for progress bar
 * @param tempC Temperature in Celsius
 * @returns Percentage (0-100) for UI progress bar
 */
export function getWaterTempPercentage(tempC: number): number {
  // Normalize to 0-100 scale based on typical surf water temps (5-35°C)
  const minTemp = 5;
  const maxTemp = 35;
  const normalized = Math.max(0, Math.min(100, ((tempC - minTemp) / (maxTemp - minTemp)) * 100));
  return Math.round(normalized);
}

/**
 * Get water temperature comfort level for surfing
 * @param tempC Temperature in Celsius
 * @returns Comfort level description
 */
export function getWaterTempComfortLevel(tempC: number): string {
  if (tempC < 10) return 'Wetsuit Required';
  if (tempC < 15) return 'Full Wetsuit';
  if (tempC < 20) return 'Spring Suit or Full Wetsuit';
  if (tempC < 25) return 'Rash Guard';
  if (tempC < 30) return 'Board Shorts';
  return 'Board Shorts';
} 