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
  // Additional data from API for potential future use
  swellPeriod?: number;
  swellHeight?: number;
  windWaveHeight?: number;
  windWaveDirection?: number;
  swellDirection?: number;
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

/**
 * Transform API forecast response to ConditionResult format for scoring
 * @param forecast API forecast response (ForecastDataCurrent)
 * @param spot Spot data with location and metadata
 * @returns ConditionResult ready for scoring and display
 */
export function transformForecastToConditionResult(
  forecast: any, 
  spot: { id: number; name: string; slug: string; distance?: string }
): ConditionResult {
  const { current } = forecast;
  
  // Extract key data from API response
  const swellPeriod = current?.swell_wave_period;
  const swellHeight = current?.swell_wave_height;
  const windWaveHeight = current?.wind_wave_height;
  const windWaveDirection = current?.wind_wave_direction;
  const swellDirection = current?.swell_wave_direction;
  
  // Use swell wave height as the primary wave height (significant wave height should come from API)
  const waveHeight = swellHeight || 0;
  
  // Use wind wave height as proxy for wind speed (API doesn't provide direct wind speed)
  // This is a reasonable approximation since wind waves are directly related to wind speed
  const windSpeed = windWaveHeight || 0;
  
  // Get condition score for display
  const conditionScore = getEnhancedConditionScore({
    swellPeriod,
    windSpeed,
    waveHeight
  });
  
  // Format wave height for display
  const waveHeightDisplay = waveHeight > 0 
    ? `${waveHeight.toFixed(1)}-${(waveHeight + 1).toFixed(1)}ft`
    : '0-1ft';
  
  // Determine conditions description
  let conditionsDescription = 'Current conditions';
  if (windSpeed < 0.5) {
    conditionsDescription = 'Glassy';
  } else if (windSpeed < 1.0) {
    conditionsDescription = 'Clean';
  } else if (windSpeed < 2.0) {
    conditionsDescription = 'Slight chop';
  } else {
    conditionsDescription = 'Choppy';
  }
  
  // Format direction (convert degrees to cardinal directions)
  const formatDirection = (degrees: number): string => {
    if (!degrees) return 'N/A';
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
  };
  
  const swellDirectionDisplay = formatDirection(swellDirection);
  
  return {
    spot: spot.name,
    spotId: spot.id,
    slug: spot.slug,
    waveHeight: waveHeightDisplay,
    waveHeightValue: waveHeight,
    windSpeedValue: windSpeed,
    conditions: conditionsDescription,
    direction: swellDirectionDisplay,
    distance: spot.distance,
    score: conditionScore,
    // Additional data for potential future use
    swellPeriod,
    swellHeight,
    windWaveHeight,
    windWaveDirection,
    swellDirection
  };
} 

/**
 * Get the spot with the best current conditions from nearby spots
 * @param closestSpots Array of closest spots - eg; getClosestSpots() returns data thats used here
 * eg; { id: number; name: string; slug: string; latitude: number; longitude: number; distance?: string }[]
 * @returns Promise<ConditionResult | null> for the best spot
 */
export async function getBestConditionsFromAPI(closestSpots: { id: number; name: string; slug: string; latitude: number; longitude: number; distance?: string }[]): Promise<ConditionResult | null> {
  if (!closestSpots || closestSpots.length === 0) {
    return null;
  }

  try {
    const spotsToCheck = closestSpots.slice(0, 5);
    
    const { getForecastCurrent } = await import('@features/forecasts');
    
    const forecastPromises = spotsToCheck.map(async (spot) => {
      try {
        const forecast = await getForecastCurrent({
          latitude: spot.latitude,
          longitude: spot.longitude,
        });
        
        return {
          spot,
          forecast,
          conditionResult: transformForecastToConditionResult(forecast, {
            id: spot.id,
            name: spot.name,
            slug: spot.slug,
            distance: spot.distance
          })
        };
      } catch (error) {
        console.warn(`Failed to get forecast for ${spot.name}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(forecastPromises);
    const validResults = results.filter(result => result !== null);
    
    if (validResults.length === 0) {
      return null;
    }
    
    let bestResult = validResults[0];
    let bestScore = 0;
    
    validResults.forEach(result => {
      if (result) {
        const scoreMatch = result.conditionResult.score.description.match(/\((\d+)\/100\)/);
        const score = scoreMatch ? parseInt(scoreMatch[1]) : 0;
        
        if (score > bestScore) {
          bestScore = score;
          bestResult = result;
        }
      }
    });
    
    return bestResult ? bestResult.conditionResult : null;
    
  } catch (error) {
    console.error('Error getting best conditions from API:', error);
    return null;
  }
} 

/**
 * Get the spot with the cleanest conditions (lowest wind/choppiness) from nearby spots
 * @param closestSpots Array of closest spots - eg; getClosestSpots() returns data thats used here
 * eg; { id: number; name: string; slug: string; latitude: number; longitude: number; distance?: string }[]
 * @returns Promise<ConditionResult | null> for the cleanest spot
 */
export async function getCleanestConditionsFromAPI(closestSpots: { id: number; name: string; slug: string; latitude: number; longitude: number; distance?: string }[]): Promise<ConditionResult | null> {
  if (!closestSpots || closestSpots.length === 0) {
    return null;
  }

  try {
    const spotsToCheck = closestSpots.slice(0, 5);
    
    const { getForecastCurrent } = await import('@features/forecasts');
    
    const forecastPromises = spotsToCheck.map(async (spot) => {
      try {
        const forecast = await getForecastCurrent({
          latitude: spot.latitude,
          longitude: spot.longitude,
        });
        
        return {
          spot,
          forecast,
          conditionResult: transformForecastToConditionResult(forecast, {
            id: spot.id,
            name: spot.name,
            slug: spot.slug,
            distance: spot.distance
          })
        };
      } catch (error) {
        console.warn(`Failed to get forecast for ${spot.name}:`, error);
        return null;
      }
    });
    
    const results = await Promise.all(forecastPromises);
    const validResults = results.filter(result => result !== null);
    
    if (validResults.length === 0) {
      return null;
    }
    
    // Calculate "cleanliness score" for each spot: 70% wind quality + 30% swell period
    let cleanestResult = validResults[0];
    let bestCleanlinessScore = 0;
    
    validResults.forEach(result => {
      if (result) {
        const windScore = getWindQualityScore(result.conditionResult.windSpeedValue || 0);
        const swellScore = getSwellPeriodScore(result.conditionResult.swellPeriod || 0);
        
        // 70% wind quality + 30% swell period
        const cleanlinessScore = (windScore * 0.70) + (swellScore * 0.30);
        
        if (cleanlinessScore > bestCleanlinessScore) {
          bestCleanlinessScore = cleanlinessScore;
          cleanestResult = result;
        }
      }
    });
    
    // Check if conditions are actually good enough to recommend
    // If the best cleanliness score is still poor, return null to show "not great" message
    if (bestCleanlinessScore < 40) {
      return null; // Will trigger "Nearby spots not great" display
    }
    
    return cleanestResult ? cleanestResult.conditionResult : null;
    
  } catch (error) {
    console.error('Error getting cleanest conditions from API:', error);
    return null;
  }
} 