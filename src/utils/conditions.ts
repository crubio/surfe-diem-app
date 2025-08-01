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
 * Calculate swell period score (0-100)
 * Longer periods = better formed, more powerful waves
 * For all socring functions please refer to the docs for more info on our scoring system docs/surf-condition-criteria.md
 */
export function getSwellPeriodScore(period: number): number {
  if (!period || period < 0) return 50; // Neutral score for missing/invalid data
  
  // Under 10 seconds: Wind swell (weak, choppy) - Poor
  if (period < 10) {
    return Math.max(0, (period / 10) * 30); // 0-30 range
  }
  
  // 10-15 seconds: Mixed swell - Fair to Good
  if (period < 15) {
    return 30 + ((period - 10) / 5) * 30; // 30-60 range
  }
  
  // 15-20 seconds: Ground swell (powerful, organized) - Excellent
  if (period < 20) {
    return 60 + ((period - 15) / 5) * 30; // 60-90 range
  }
  
  // 20+ seconds: Long period ground swell - Outstanding
  return Math.min(100, 90 + ((period - 20) / 5) * 10); // 90-100 range
}

/**
 * Calculate wind quality score (0-100)
 * Offshore/light winds = cleaner waves
 */
export function getWindQualityScore(windSpeed: number): number {
  if (!windSpeed || windSpeed < 0) return 50; // Neutral score for missing data
  
  // Light winds (<15mph) - Good conditions
  if (windSpeed < 15) {
    return 100 - (windSpeed / 15) * 30; // 70-100 range
  }
  
  // Moderate winds (15-20mph) - Fair conditions
  if (windSpeed < 20) {
    return 70 - ((windSpeed - 15) / 5) * 30; // 40-70 range
  }
  
  // Strong winds (>20mph) - Poor conditions
  return Math.max(0, 40 - ((windSpeed - 20) / 10) * 40); // 0-40 range
}

/**
 * Calculate wave height score (0-100)
 * Sweet spot range for most surfers
 */
export function getWaveHeightScore(height: number): number {
  if (!height || height < 0) return 50; // Neutral score for missing data
  
  // 1-2ft: Beginner friendly
  if (height < 2) {
    return 50 + (height - 1) * 25; // 50-75 range
  }
  
  // 2-4ft: Good for most conditions
  if (height < 4) {
    return 75 + (height - 2) * 12.5; // 75-100 range
  }
  
  // 4-6ft: Ideal range
  if (height < 6) {
    return 100; // Perfect score
  }
  
  // 6ft+: Advanced, but can be "best" with excellent period/wind
  return Math.max(60, 100 - ((height - 6) / 2) * 10); // 100-60 range
}

/**
 * Calculate weighted overall score from individual factor scores
 */
export function calculateOverallScore(scores: {
  swellPeriod: number;
  windQuality: number;
  waveHeight: number;
}): number {
  const { swellPeriod, windQuality, waveHeight } = scores;
  
  // Weighted average based on importance
  const weightedScore = (
    (swellPeriod * 0.40) +    // 40% weight - most critical for wave quality
    (windQuality * 0.35) +    // 35% weight - surface conditions
    (waveHeight * 0.25)       // 25% weight - surfability
  );
  
  return Math.round(weightedScore);
}

/**
 * Enhanced condition score using the new scoring system
 */
export function getEnhancedConditionScore(conditions: {
  swellPeriod?: number;
  windSpeed?: number;
  waveHeight?: number;
}): ConditionScore {
  const { swellPeriod, windSpeed = 0, waveHeight = 0 } = conditions;
  
  // Calculate individual scores
  const swellPeriodScore = getSwellPeriodScore(swellPeriod || 0);
  const windQualityScore = getWindQualityScore(windSpeed || 0);
  const waveHeightScore = getWaveHeightScore(waveHeight || 0);
  
  // Calculate overall score
  const overallScore = calculateOverallScore({
    swellPeriod: swellPeriodScore,
    windQuality: windQualityScore,
    waveHeight: waveHeightScore
  });
  
  // Convert score to condition level
  if (overallScore >= 80) {
    return {
      level: 'excellent',
      color: 'success',
      label: 'Excellent',
      description: `Prime conditions (${overallScore}/100)`
    };
  } else if (overallScore >= 60) {
    return {
      level: 'good',
      color: 'success',
      label: 'Good',
      description: `Solid conditions (${overallScore}/100)`
    };
  } else if (overallScore >= 40) {
    return {
      level: 'fair',
      color: 'warning',
      label: 'Fair',
      description: `Decent conditions (${overallScore}/100)`
    };
  } else {
    return {
      level: 'poor',
      color: 'error',
      label: 'Poor',
      description: `Challenging conditions (${overallScore}/100)`
    };
  }
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
  const conditions = { waveHeight: 4, windSpeed: 8, swellPeriod: 12 };
  const score = getEnhancedConditionScore(conditions);
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
  const conditions = { waveHeight: 3, windSpeed: 12, swellPeriod: 10 };
  const score = getEnhancedConditionScore(conditions);
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
  const conditions = { waveHeight: 3, windSpeed: 5, swellPeriod: 14 };
  const score = getEnhancedConditionScore(conditions);
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
  const conditions = { waveHeight: 8, windSpeed: 15, swellPeriod: 16 };
  const score = getEnhancedConditionScore(conditions);
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