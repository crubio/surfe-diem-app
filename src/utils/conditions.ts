/**
 * Surf condition utilities for color coding and scoring
 */

import { formatDirection, kilometersPerHourToMph } from "./formatting";
import { metersToFeet } from "./nws-parser";
import { CurrentConditions } from "@/types/conditions";
import { getDisplaySwell, SwellPowerSource } from "./swell-power";

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
  /** Overall 0-100 score, for ranking ("Best right now") */
  value: number;
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
  // Swell power, and where the shown swell came from (see utils/swell-power.ts)
  swellPower?: number;
  swellPowerSource?: SwellPowerSource;
  swellStation?: string;
  swellObservedAt?: string;
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
      value: overallScore
    };
  } else if (overallScore >= 60) {
    return {
      level: 'good',
      color: 'success',
      label: 'Good',
      value: overallScore
    };
  } else if (overallScore >= 40) {
    return {
      level: 'fair',
      color: 'warning',
      label: 'Fair',
      value: overallScore
    };
  } else {
    return {
      level: 'poor',
      color: 'error',
      label: 'Poor',
      value: overallScore
    };
  }
}

/**
 * Transform /conditions data to ConditionResult format for scoring.
 *
 * Height/period/direction come from getDisplaySwell: NWS primary swell, else
 * the buoy's measured swell, else its combined reading, the same order the
 * API used for swell_power. Buoy-only spots (no NWS swell) get real numbers
 * instead of 0 ft. One period only, so the two-input period average in
 * getEnhancedConditionScore gets the same value twice.
 *
 * @param conditions CurrentConditions from GET /conditions or /batch-conditions
 * @param spot Spot data with location and metadata
 * @returns ConditionResult ready for scoring and display
 */
export function transformConditionsToConditionResult(
  conditions: CurrentConditions,
  spot: { id: number; name: string; slug: string; distance?: string }
): ConditionResult {
  const swell = getDisplaySwell(conditions);
  // /conditions returns heights in meters; scoring thresholds and display are in feet
  const waveHeight = metersToFeet(swell?.heightM ?? 0);
  const wavePeriod = swell?.periodS ?? 0;
  const waveDirection = swell?.direction ?? 0;
  // undefined (not 0) when there's no wind reading, so the UI can omit it
  const windSpeedMph = conditions.wind_speed != null
    ? Math.floor(kilometersPerHourToMph(conditions.wind_speed))
    : undefined;
  // Chop indicator: NWS wind wave, else the buoy's measured one when its swell is shown
  const windWaveM = conditions.wind_wave_height
    ?? (swell?.source === 'buoy_spec' ? conditions.buoy_wind_wave_height : null);
  const windWaveHeight = windWaveM != null ? metersToFeet(windWaveM) : undefined;

  const conditionScore = getEnhancedConditionScore({
    wavePeriod: wavePeriod,
    swellPeriod: wavePeriod,
    windSpeed: windSpeedMph,
    waveHeight: waveHeight
  });

  const waveHeightDisplay = waveHeight > 0
    ? `${waveHeight.toFixed(1)}-${(waveHeight + 1).toFixed(1)}ft`
    : '0-1ft';

  // No wind-wave reading at all: don't claim "Glassy"
  let conditionsDescription = 'Current conditions';
  if (windWaveHeight != null) {
    if (windWaveHeight < 0.5) {
      conditionsDescription = 'Glassy';
    } else if (windWaveHeight < 1.0) {
      conditionsDescription = 'Clean';
    } else if (windWaveHeight < 2.0) {
      conditionsDescription = 'Slight chop';
    } else {
      conditionsDescription = 'Choppy';
    }
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
    swellDirection: waveDirection,
    swellPower: conditions.swell_power ?? undefined,
    swellPowerSource: conditions.swell_power_source ?? undefined,
    swellStation: swell?.station ?? undefined,
    swellObservedAt: swell?.observedAt ?? undefined,
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
  mostPowerful: ConditionResult | null;
  bySpotId: Record<number, { conditions: CurrentConditions; conditionResult: ConditionResult }>;
}> {
  if (!closestSpots || closestSpots.length === 0) {
    return {
      bestConditions: null,
      cleanestConditions: null,
      mostPowerful: null,
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
        mostPowerful: null,
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
        const score = result.conditionResult.score.value;
        
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
    
    // Most powerful swell: highest swell_power. Ranks groundswell above
    // short-period windswell of the same height, unlike ranking by height.
    const mostPowerfulResult = validResults.reduce<(typeof validResults)[number] | null>((best, result) => {
      const power = result.conditionResult.swellPower;
      if (power == null) return best;
      return best === null || power > (best.conditionResult.swellPower ?? -1) ? result : best;
    }, null);
    
    const result = {
      bestConditions: bestResult ? bestResult.conditionResult : null,
      cleanestConditions: bestCleanlinessScore >= 40 ? cleanestResult.conditionResult : null,
      mostPowerful: mostPowerfulResult?.conditionResult ?? null,
      bySpotId
    };

    console.debug('Batch recommendations final result:', result);
    return result;

  } catch (error) {
    console.error('Error getting batch recommendations from API:', error);
    return {
      bestConditions: null,
      cleanestConditions: null,
      mostPowerful: null,
      bySpotId: {}
    };
  }
}
