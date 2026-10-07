/**
 * Surf condition utilities for color coding and scoring
 */

import { formatDirection, kilometersPerHourToMph } from "./formatting";
import { metersToFeet } from "./nws-parser";
import { CurrentConditions } from "@/types/conditions";

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
  waveDirectionFormatted?: string;
  wavePeriodFormatted?: string;
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
    wind: Record<string, unknown>;
    current: Record<string, unknown>;
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
  periodQuality: number;
  windQuality: number;
  waveHeight: number;
}): number {
  const { periodQuality, windQuality, waveHeight } = scores;
  
  // Weighted average based on importance
  // periodQuality = average of wave_period and primary_swell_period
  // Represents the overall quality of wave period from both main waves and dominant swell
  const weightedScore = (
    (periodQuality * 0.40) +  // 40% weight - period quality (most critical)
    (windQuality * 0.35) +    // 35% weight - surface conditions
    (waveHeight * 0.25)       // 25% weight - surfability
  );
  // Total: 100%
  
  return Math.round(weightedScore);
}

/**
 * Enhanced condition score using the new scoring system
 */
export function getEnhancedConditionScore(conditions: {
  wavePeriod?: number;
  swellPeriod?: number;
  windSpeed?: number;
  waveHeight?: number;
}): ConditionScore {
  const { swellPeriod, windSpeed = 0, waveHeight = 0 } = conditions;
  
  // Calculate individual scores
  const wavePeriodScore = getSwellPeriodScore(conditions.wavePeriod || 0);
  const swellPeriodScore = getSwellPeriodScore(swellPeriod || 0);
  const windQualityScore = getWindQualityScore(windSpeed || 0);
  const waveHeightScore = getWaveHeightScore(waveHeight || 0);
  
  // Average the two period scores (wave_period and primary_swell_period)
  // Both represent different period metrics - combine for overall period quality assessment
  const periodQualityScore = (wavePeriodScore + swellPeriodScore) / 2;
  
  // Calculate overall score
  const overallScore = calculateOverallScore({
    periodQuality: periodQualityScore,
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
 * Transform /conditions data to ConditionResult format for scoring.
 *
 * /conditions has no generic bulk wave_height/wave_period the way the old
 * NWS forecast response did, so there's only
 * one modeled period here (primary_swell_period), not two to average —
 * see the periodQualityScore note inline below.
 *
 * @param conditions CurrentConditions from GET /conditions or /batch-conditions
 * @param spot Spot data with location and metadata
 * @returns ConditionResult ready for scoring and display
 */
export function transformConditionsToConditionResult(
  conditions: CurrentConditions,
  spot: { id: number; name: string; slug: string; distance?: string }
): ConditionResult {
  // /conditions returns heights in meters; scoring thresholds and display are in feet
  const waveHeight = metersToFeet(conditions.primary_swell_height ?? 0);
  const wavePeriod = conditions.primary_swell_period ?? 0;
  // undefined (not 0) when there's no wind reading, so the UI can omit it
  const windSpeedMph = conditions.wind_speed != null
    ? Math.floor(kilometersPerHourToMph(conditions.wind_speed))
    : undefined;
  const windWaveHeight = metersToFeet(conditions.wind_wave_height ?? 0);
  const waveDirection = conditions.primary_swell_direction ?? 0;

  // Only one modeled period available here (primary_swell_period) — the old
  // two-input average (wave_period + primary_swell_period) collapses to a
  // single score, not a behavior change, just no second input to average.
  const conditionScore = getEnhancedConditionScore({
    wavePeriod: wavePeriod,
    swellPeriod: wavePeriod,
    windSpeed: windSpeedMph,
    waveHeight: waveHeight
  });

  const waveHeightDisplay = waveHeight > 0
    ? `${waveHeight.toFixed(1)}-${(waveHeight + 1).toFixed(1)}ft`
    : '0-1ft';

  let conditionsDescription = 'Current conditions';
  if (windWaveHeight < 0.5) {
    conditionsDescription = 'Glassy';
  } else if (windWaveHeight < 1.0) {
    conditionsDescription = 'Clean';
  } else if (windWaveHeight < 2.0) {
    conditionsDescription = 'Slight chop';
  } else {
    conditionsDescription = 'Choppy';
  }

  const waveDirectionDisplay = formatDirection(waveDirection);

  return {
    spot: spot.name,
    spotId: spot.id,
    slug: spot.slug,
    waveHeight: waveHeightDisplay,
    waveHeightValue: waveHeight,
    windSpeedValue: windSpeedMph,
    conditions: conditionsDescription,
    direction: waveDirectionDisplay,
    distance: spot.distance,
    waveDirectionFormatted: waveDirectionDisplay,
    wavePeriodFormatted: `${wavePeriod.toFixed(1)}s`,
    score: conditionScore,
    swellPeriod: wavePeriod,
    swellHeight: waveHeight,
    windWaveHeight,
    swellDirection: waveDirection
  };
}

/**
 * Get batch conditions data for multiple spots and process for recommendations
 * @param closestSpots Array of closest spots
 * @returns Promise with processed data for all recommendation cards
 */
export async function getBatchRecommendationsFromAPI(closestSpots: { id: number; name: string; slug: string; latitude?: number; longitude?: number; distance?: string }[]): Promise<{
  bestConditions: ConditionResult | null;
  cleanestConditions: ConditionResult | null;
  highestWaves: ConditionResult | null;
  bySpotId: Record<number, { conditions: CurrentConditions; conditionResult: ConditionResult }>;
}> {
  if (!closestSpots || closestSpots.length === 0) {
    return {
      bestConditions: null,
      cleanestConditions: null,
      highestWaves: null,
      bySpotId: {}
    };
  }

  try {
    const spotsToCheck = closestSpots.slice(0, 10);

    const { getBatchConditions } = await import('@features/conditions');

    // One batch call for all spots, not one NWS call per spot.
    const batch = await getBatchConditions(spotsToCheck.map(s => s.id));
    const conditionsBySpotId = new Map(batch.results.map(r => [r.spot_id, r.conditions]));

    const validResults = spotsToCheck
      .map((spot) => {
        const conditions = conditionsBySpotId.get(spot.id);
        if (!conditions) {
          console.warn(`No conditions data for ${spot.name}`);
          return null;
        }
        const conditionResult = transformConditionsToConditionResult(conditions, {
          id: spot.id,
          name: spot.name,
          slug: spot.slug,
          distance: spot.distance
        });
        return { spot, conditions, conditionResult };
      })
      .filter((result): result is NonNullable<typeof result> => result !== null);

    if (validResults.length === 0) {
      console.warn('No valid results from batch conditions');
      return {
        bestConditions: null,
        cleanestConditions: null,
        highestWaves: null,
        bySpotId: {}
      };
    }

    const bySpotId = Object.fromEntries(
      validResults.map(r => [r.spot.id, { conditions: r.conditions, conditionResult: r.conditionResult }])
    );

    console.debug('Batch recommendations - Valid results:', validResults.length, validResults);
    
    // Process best conditions (highest overall score)
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
    
    // Process cleanest conditions (70% wind quality + 30% swell period)
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
    
    // Process highest waves (highest wave height)
    let highestResult = validResults[0];
    let highestWaveHeight = 0;
    
    validResults.forEach(result => {
      if (result && result.conditionResult.waveHeightValue) {
        if (result.conditionResult.waveHeightValue > highestWaveHeight) {
          highestWaveHeight = result.conditionResult.waveHeightValue;
          highestResult = result;
        }
      }
    });
    
    const result = {
      bestConditions: bestResult ? bestResult.conditionResult : null,
      cleanestConditions: bestCleanlinessScore >= 40 ? cleanestResult.conditionResult : null,
      highestWaves: highestWaveHeight >= 1 ? highestResult.conditionResult : null,
      bySpotId
    };

    console.debug('Batch recommendations final result:', result);
    return result;

  } catch (error) {
    console.error('Error getting batch recommendations from API:', error);
    return {
      bestConditions: null,
      cleanestConditions: null,
      highestWaves: null,
      bySpotId: {}
    };
  }
}