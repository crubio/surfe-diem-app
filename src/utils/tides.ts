/**
 * Tide data processing utilities
 */

import { TidesDataDaily, TidesDataCurrent } from "@features/tides/api/tides";

export interface TideState {
  currentHeight: number;
  direction: 'rising' | 'falling';
  rateOfChange: number; // ft/hr
  timeToNext: number; // minutes
  nextType: 'H' | 'L';
  nextHeight: number;
  nextTime: string;
}

/**
 * Calculate current tide state from predictions
 * @param tidesData Tide predictions data
 * @param currentTime Current timestamp (defaults to now)
 * @returns TideState with current conditions
 */
export function calculateCurrentTideState(
  tidesData: TidesDataDaily, 
  currentTime: Date = new Date()
): TideState | null {
  if (!tidesData.predictions || tidesData.predictions.length === 0) {
    return null;
  }

  const predictions = tidesData.predictions;
  const now = currentTime.getTime();

  // Find the two predictions that bracket the current time
  let beforePrediction = null;
  let afterPrediction = null;

  for (let i = 0; i < predictions.length; i++) {
    const predTime = new Date(predictions[i].t).getTime();
    
    if (predTime <= now) {
      beforePrediction = predictions[i];
    } else {
      afterPrediction = predictions[i];
      break;
    }
  }

  // If we're at the end of the day, wrap around to first prediction of next day
  if (!afterPrediction && predictions.length > 0) {
    afterPrediction = predictions[0];
  }

  if (!beforePrediction || !afterPrediction) {
    return null;
  }

  const beforeTime = new Date(beforePrediction.t).getTime();
  const afterTime = new Date(afterPrediction.t).getTime();
  const beforeHeight = parseFloat(beforePrediction.v);
  const afterHeight = parseFloat(afterPrediction.v);

  // Calculate current height by linear interpolation
  const timeDiff = afterTime - beforeTime;
  const heightDiff = afterHeight - beforeHeight;
  const elapsed = now - beforeTime;
  const currentHeight = beforeHeight + (heightDiff * elapsed / timeDiff);

  // Determine direction
  const direction = heightDiff > 0 ? 'rising' : 'falling';

  // Calculate rate of change (ft/hr)
  const rateOfChange = Math.abs(heightDiff) / (timeDiff / (1000 * 60 * 60));

  // Calculate time to next change
  const timeToNext = Math.round((afterTime - now) / (1000 * 60));

  return {
    currentHeight,
    direction,
    rateOfChange,
    timeToNext,
    nextType: afterPrediction.type as 'H' | 'L',
    nextHeight: afterHeight,
    nextTime: afterPrediction.t
  };
}

/**
 * Format time to next tide change
 * @param minutes Minutes until next change
 * @returns Formatted string
 */
export function formatTimeToNext(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
}

/**
 * Get tide direction description
 * @param direction Rising or falling
 * @returns User-friendly description
 */
export function getTideDirectionDescription(direction: 'rising' | 'falling'): string {
  return direction === 'rising' ? 'Rising' : 'Falling';
}



/**
 * Get tide quality indicator based on rate of change
 * @param rateOfChange Rate of change in ft/hr
 * @returns Quality description
 */
export function getTideQualityDescription(rateOfChange: number): string {
  if (rateOfChange < 0.5) {
    return 'Slow change';
  } else if (rateOfChange < 1.0) {
    return 'Moderate change';
  } else {
    return 'Fast change';
  }
}

/**
 * Get current tide value from current tide data
 * @param currentTideData Current tide data from API
 * @returns Current tide height in feet, or null if data is invalid
 */
export function getCurrentTideValue(currentTideData: TidesDataCurrent): number | null {
  if (!currentTideData?.data || currentTideData.data.length === 0) {
    return null;
  }
  
  // Get the most recent tide reading (last index)
  const latestReading = currentTideData.data[currentTideData.data.length - 1];
  if (!latestReading?.v) {
    return null;
  }
  
  const tideValue = parseFloat(latestReading.v);
  return isNaN(tideValue) ? null : tideValue;
}

/**
 * Get current tide time from current tide data (converted from GMT to local)
 * @param currentTideData Current tide data from API
 * @returns Formatted local time string, or null if data is invalid
 */
export function getCurrentTideTime(currentTideData: TidesDataCurrent): string | null {
  if (!currentTideData?.data || currentTideData.data.length === 0) {
    return null;
  }
  
  // Get the most recent tide reading (last index)
  const latestReading = currentTideData.data[currentTideData.data.length - 1];
  if (!latestReading?.t) {
    return null;
  }
  
  try {
    // Parse GMT time and convert to local timezone
    const gmtTime = new Date(latestReading.t + ' GMT');
    
    // Check if the date is valid
    if (isNaN(gmtTime.getTime())) {
      return null;
    }
    
    return gmtTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  } catch (error) {
    return null;
  }
} 