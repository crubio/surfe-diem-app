/**
 * Surf condition utilities for color coding and scoring
 */

import { Spot } from "@features/locations/types";

/**
 * Interface for surf conditions data
 */
export interface SurfConditions {
  waveHeight: number;
  windSpeed?: number;
  windDirection?: string;
  windWaveHeight?: number;
  windWaveSpeed?: number;
  tide?: string;
  seaSurfaceTemperature?: number;
}

/**
 * Condition quality levels
 */
export type ConditionLevel = 'excellent' | 'good' | 'fair' | 'poor';

/**
 * Interface for condition scoring results
 */
export interface ConditionScore {
  level: ConditionLevel;
  color: 'success' | 'warning' | 'error' | 'info';
  label: string;
  description: string;
}

/**
 * Interface for spot condition analysis results
 */
export interface ConditionResult {
  spot: string;
  spotId: number;
  slug?: string;
  waveHeight?: string;
  waveHeightValue?: number;
  windSpeedValue?: number;
  conditions?: string;
  direction?: string;
  distance?: string;
  score: ConditionScore;
  isLocationBased?: boolean;
}

/**
 * Interface for spot data with weather information
 */
export interface SpotBatchData {
  id: number;
  name: string;
  slug: string;
  weather: {
    swell: {
      height: number;
      direction: number;
      period: number;
    } | null;
    wind: any;
    current: any;
  };
}

/**
 * Calculate surf condition score based on wave height and wind
 */
export function getConditionScore(conditions: SurfConditions): ConditionScore {
  const { waveHeight, windSpeed = 0 } = conditions;
  
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
  const { waveHeight, windSpeed = 0 } = conditions;
  
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

/**
 * Get the spot with the best current conditions
 * @param spots Array of spot data with current conditions
 * @returns ConditionResult for the best spot
 */
export function getBestConditions(spots: SpotBatchData[]): ConditionResult {
  // TODO: Implement logic to find best current conditions
  // This could be based on wave height, wind, tide, etc.
  const conditions = { waveHeight: 4, windSpeed: 8 };
  const score = getConditionScore(conditions);
  return {
    spot: "Steamer Lane",
    spotId: 1,
    slug: "steamer-lane",
    waveHeight: "4-6ft",
    waveHeightValue: 4,
    windSpeedValue: 8,
    conditions: "Clean",
    direction: "SW",
    score
  };
}

/**
 * Get the closest spot to the user's location
 * @param spots Array of spot data, eg; Spot[]
 * @returns ConditionResult for the closest spot
 */
export function getClosestSpot(spots: Spot[]): ConditionResult | null {
  // TODO: Implement logic to find closest spot to user
  if (spots.length === 0) {
    return null;
  }
  const closestSpot = spots[0];
  
  // For now, return a placeholder until we have forecast data
  const conditions = { waveHeight: 3, windSpeed: 12 };
  const score = getConditionScore(conditions);
  return {
    spot: closestSpot.name,
    spotId: closestSpot.id,
    slug: closestSpot.slug,
    waveHeight: "3-4ft",
    waveHeightValue: 3,
    windSpeedValue: 12,
    conditions: "Current conditions",
    direction: "SW",
    score,
    isLocationBased: true
  };
}

/**
 * Get the spot with the cleanest conditions (best wind)
 * @param spots Array of spot data with current conditions
 * @returns ConditionResult for the cleanest spot
 */
export function getCleanestConditions(spots: SpotBatchData[]): ConditionResult {
  // TODO: Implement logic to find cleanest conditions
  const conditions = { waveHeight: 3, windSpeed: 5 };
  const score = getConditionScore(conditions);
  return {
    spot: "Pleasure Point",
    spotId: 2,
    slug: "pleasure-point",
    waveHeight: "3-4ft",
    waveHeightValue: 3,
    windSpeedValue: 5,
    conditions: "Glassy",
    direction: "SW",
    score
  };
}

/**
 * Get the spot with the highest waves
 * @param spots Array of spot data with current conditions
 * @returns ConditionResult for the spot with highest waves
 */
export function getHighestWaves(spots: SpotBatchData[]): ConditionResult {
  // TODO: Implement logic to find highest waves
  const conditions = { waveHeight: 8, windSpeed: 15 };
  const score = getConditionScore(conditions);
  return {
    spot: "Mavericks",
    spotId: 3,
    slug: "mavericks",
    waveHeight: "8-10ft",
    waveHeightValue: 8,
    windSpeedValue: 15,
    conditions: "Big",
    direction: "NW",
    score
  };
} 