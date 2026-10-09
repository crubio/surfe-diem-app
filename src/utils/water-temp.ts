/**
 * Water temperature utilities for surf conditions
 */

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
