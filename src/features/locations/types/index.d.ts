// Re-export core types for backward compatibility
export { Spot, Buoy } from '../../../types/core';

// Re-export common types
export { LocationQueryParams, SearchQueryParams } from '../../../types/common';

// Re-export API types
export { 
  BuoyBatchData, 
  SpotBatchData, 
  BatchForecastResponse,
  BuoyObservation,
  BuoyWeather,
  SpotWeather,
  SwellData
} from '../../../types/api';

// Re-export common types
export { 
  BuoyLocation,
  BuoyNearestType,
  BuoyLocations,
  BuoyLocationSummaryProps,
  BuoyLocationLatestObservation,
  BuoyLocationLatestObservations
} from '../../../types/common';
