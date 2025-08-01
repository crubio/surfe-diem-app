/**
 * Surf condition utilities for color coding and scoring
 */

export interface SurfConditions {
  waveHeight: number;
  windSpeed: number;
  windDirection?: string;
  tide?: string;
}

export type ConditionLevel = 'excellent' | 'good' | 'fair' | 'poor';

export interface ConditionScore {
  level: ConditionLevel;
  color: 'success' | 'warning' | 'error' | 'info';
  label: string;
  description: string;
}

/**
 * Calculate surf condition score based on wave height and wind
 */
export function getConditionScore(conditions: SurfConditions): ConditionScore {
  const { waveHeight, windSpeed } = conditions;
  
  // Excellent: Good waves (3-6ft) with light wind (<10mph)
  if (waveHeight >= 3 && waveHeight <= 6 && windSpeed < 10) {
    return {
      level: 'excellent',
      color: 'success',
      label: 'Excellent',
      description: 'Prime conditions'
    };
  }
  
  // Good: Decent waves (2-4ft) with moderate wind (<15mph)
  if (waveHeight >= 2 && waveHeight <= 4 && windSpeed < 15) {
    return {
      level: 'good',
      color: 'success',
      label: 'Good',
      description: 'Solid conditions'
    };
  }
  
  // Fair: Some waves (1-3ft) or windy conditions
  if (waveHeight >= 1 && waveHeight <= 3 && windSpeed < 20) {
    return {
      level: 'fair',
      color: 'warning',
      label: 'Fair',
      description: 'Rideable but challenging'
    };
  }
  
  // Poor: Small waves or very windy
  return {
    level: 'poor',
    color: 'error',
    label: 'Poor',
    description: 'Not ideal'
  };
}

/**
 * Get color for wave height ranges
 */
export function getWaveHeightColor(waveHeight: number): 'success' | 'warning' | 'error' | 'info' {
  if (waveHeight >= 4) return 'success'; // Big waves
  if (waveHeight >= 2) return 'warning'; // Medium waves
  if (waveHeight >= 1) return 'info';    // Small waves
  return 'error'; // Very small
}

/**
 * Get color for wind conditions
 */
export function getWindColor(windSpeed: number): 'success' | 'warning' | 'error' | 'info' {
  if (windSpeed < 10) return 'success';  // Light wind
  if (windSpeed < 15) return 'warning';  // Moderate wind
  if (windSpeed < 20) return 'info';     // Strong wind
  return 'error'; // Very strong wind
}

/**
 * Get descriptive text for conditions
 */
export function getConditionDescription(conditions: SurfConditions): string {
  const { waveHeight, windSpeed } = conditions;
  
  if (waveHeight >= 4 && windSpeed < 10) {
    return 'Epic conditions - get out there!';
  }
  
  if (waveHeight >= 2 && windSpeed < 15) {
    return 'Good waves, clean conditions';
  }
  
  if (waveHeight >= 1 && windSpeed < 20) {
    return 'Rideable but windy';
  }
  
  return 'Small waves or challenging wind';
} 