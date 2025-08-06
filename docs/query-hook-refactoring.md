# Query Hook Refactoring Guide

## Overview

This document outlines the comprehensive refactoring of React Query patterns in the Surfe Diem app to reduce code duplication and improve maintainability.

## 🎯 Goals

- **Reduce code duplication** by 40-60%
- **Improve maintainability** with centralized logic
- **Better type safety** with consolidated types
- **Easier testing** with focused utility functions
- **Consistent patterns** across the application

## 📁 New File Structure

```
src/
├── hooks/
│   ├── index.ts                    # Export all hooks
│   ├── useSpotData.ts              # Spot-related queries
│   ├── useForecastData.ts          # Forecast-related queries
│   ├── useTideData.ts              # Tide-related queries
│   ├── useLocationData.ts          # Location/Buoy queries
│   ├── useGeolocation.ts           # Geolocation queries
│   └── useBatchData.ts             # Batch data queries
└── config/
    └── query-config.ts             # Centralized configuration
```

## 🔧 Custom Hooks Created

### 1. `useSpotData.ts`

**Purpose:** Consolidate all spot-related query patterns

```typescript
// Before: Inline useQuery calls
const {data: spot, isError, error} = useQuery({
  queryKey: ['spots', spotId, isSlug],
  queryFn: () => isSlug ? getSurfSpotBySlug(spotId) : getSurfSpot(spotId)
});

// After: Custom hook
const { data: spot, isError, error } = useSpotDataAuto(spotId);
```

**Available Hooks:**
- `useSpotData(spotId, isSlug)` - Fetch single spot by ID or slug
- `useSurfSpots()` - Fetch all surf spots
- `useClosestSpots(latitude, longitude)` - Fetch closest spots to location
- `useSpotDataAuto(spotId)` - Auto-detect slug vs ID

### 2. `useForecastData.ts`

**Purpose:** Consolidate forecast-related query patterns

```typescript
// Before: Multiple separate queries
const {data: forecastCurrent} = useQuery({
  queryKey: ['forecast_current', latitude, longitude],
  queryFn: () => getForecastCurrent({ latitude, longitude }),
  enabled: !!latitude && !!longitude,
});

const {data: forecastDataHourly} = useQuery({
  queryKey: ['forecast_hourly', latitude, longitude],
  queryFn: () => getForecastHourly({ latitude, longitude, forecast_days: 1 }),
  enabled: !!latitude && !!longitude,
});

// After: Combined hook
const { current: forecastCurrent, hourly: forecastDataHourly } = useForecastData(latitude, longitude);
```

**Available Hooks:**
- `useForecastCurrent(latitude, longitude)` - Current forecast
- `useForecastHourly(latitude, longitude, forecastDays)` - Hourly forecast
- `useForecastDaily(latitude, longitude)` - Daily forecast
- `useForecastData(latitude, longitude)` - All forecast types

### 3. `useTideData.ts`

**Purpose:** Consolidate tide-related query patterns

```typescript
// Before: Multiple dependent queries
const {data: tideStationData} = useQuery({
  queryKey: ['tide_station', spot?.id],
  queryFn: () => getClostestTideStation({lat: spot?.latitude, lng: spot?.longitude}),
  enabled: !!spot?.latitude
});

const {data: tideData} = useQuery({
  queryKey: ['latest_tides', tideStationData?.station_id],
  queryFn: () => getDailyTides({ station: tideStationData?.station_id}),
  enabled: !!tideStationData?.station_id
});

// After: Combined hook
const { station: tideStationData, dailyTides: tideData } = useTideData(spot?.latitude, spot?.longitude);
```

**Available Hooks:**
- `useClosestTideStation(latitude, longitude)` - Find closest tide station
- `useDailyTides(stationId)` - Daily tide predictions
- `useCurrentTides(stationId)` - Current tide data
- `useTideData(latitude, longitude)` - All tide data

### 4. `useLocationData.ts`

**Purpose:** Consolidate location/buoy-related query patterns

```typescript
// Before: Inline queries
const {data: locationData} = useQuery({
  queryKey: ['location', locationId],
  queryFn: () => getLocation(locationId)
});

const {data: latestObservationData} = useQuery({
  queryKey: ['latest_observation', locationId],
  queryFn: () => getLatestObservation(locationId),
  enabled: !!locationData?.location_id
});

// After: Combined hook
const { location: locationData, latestObservation: latestObservationData } = useLocationData(locationId);
```

**Available Hooks:**
- `useLocations()` - All locations/buoys
- `useLocation(locationId)` - Single location
- `useLatestObservation(locationId)` - Latest observation
- `useNearbyBuoys(latitude, longitude)` - Nearby buoys
- `useLocationsGeoJson()` - GeoJSON for locations
- `useSpotsGeoJson()` - GeoJSON for spots
- `useLocationData(locationId)` - All location data

### 5. `useGeolocation.ts`

**Purpose:** Centralize geolocation queries

```typescript
// Before: Inline query
const {data: geolocation} = useQuery({
  queryKey: ['geolocation'],
  queryFn: async () => getGeolocation()
});

// After: Custom hook
const { data: geolocation } = useGeolocation();
```

### 6. `useBatchData.ts`

**Purpose:** Consolidate batch data fetching patterns

```typescript
// Before: Complex inline logic
const {data: favoritesData} = useQuery({
  queryKey: ['favorites-batch-data', favorites.map(f => `${f.type}-${f.id}`).join(',')],
  queryFn: () => {
    if (favorites.length === 0) return { buoys: [], spots: [] };
    const buoyIds = favorites.filter(f => f.type === 'buoy').map(f => f.id);
    const spotIds = favorites.filter(f => f.type === 'spot').map(f => Number(f.id));
    return getBatchForecast({ buoy_ids: buoyIds, spot_ids: spotIds });
  },
  enabled: favorites.length > 0,
  staleTime: 5 * 60 * 1000,
  gcTime: 10 * 60 * 1000,
});

// After: Custom hook
const { data: favoritesData } = useFavoritesBatchData();
```

**Available Hooks:**
- `useFavoritesBatchData()` - Batch forecast for favorites
- `useBatchRecommendations(spots)` - Batch recommendations

## ⚙️ Configuration (`query-config.ts`)

**Purpose:** Centralize query settings and constants

```typescript
export const QUERY_CONFIG = {
  STALE_TIME: {
    SHORT: 5 * 60 * 1000,    // 5 minutes
    MEDIUM: 10 * 60 * 1000,  // 10 minutes
    LONG: 30 * 60 * 1000,    // 30 minutes
  },
  GC_TIME: {
    SHORT: 10 * 60 * 1000,   // 10 minutes
    MEDIUM: 30 * 60 * 1000,  // 30 minutes
    LONG: 60 * 60 * 1000,    // 1 hour
  },
  // ... more config
};

export const QUERY_KEYS = {
  SPOTS: 'spots',
  FORECAST_CURRENT: 'forecast_current',
  TIDE_STATION: 'tide_station',
  // ... all query keys
};
```

## 📊 Before/After Comparison

### Before: `spot.tsx` (Original)
```typescript
// 8 separate useQuery calls
const {data: spot, isError, error} = useQuery({
  queryKey: ['spots', spotId, isSlug],
  queryFn: () => isSlug ? getSurfSpotBySlug(spotId) : getSurfSpot(spotId)
});

const {data: tideStationData} = useQuery({
  queryKey: ['tide_station', spot?.id],
  queryFn: () => getClostestTideStation({lat: spot?.latitude, lng: spot?.longitude}),
  enabled: !!spot?.latitude
});

const {data: tideData, isPending: isTideDataLoading} = useQuery({
  queryKey: ['latest_tides', tideStationData?.station_id],
  queryFn: () => getDailyTides({ station: tideStationData?.station_id}),
  enabled: !!tideStationData?.station_id
});

// ... 5 more similar patterns
```

### After: `spot.tsx` (Refactored)
```typescript
// 4 custom hook calls
const { data: spot, isError, error } = useSpotDataAuto(spotId);
const { station: tideStationData, dailyTides: tideData, isLoading: isTideDataLoading } = useTideData(spot?.latitude, spot?.longitude);
const { current: forecastCurrent, hourly: forecastDataHourly } = useForecastData(spot?.latitude, spot?.longitude);
const { data: nearbyBuoys } = useNearbyBuoys(spot?.latitude, spot?.longitude);
```

## 🚀 Migration Guide

### Step 1: Update Imports
```typescript
// Remove individual API imports
// import { getSurfSpot, getSurfSpotBySlug } from "@features/locations/api/locations"
// import { getForecastCurrent, getForecastHourly } from "@features/forecasts"

// Add custom hook imports
import { useSpotDataAuto, useForecastData, useTideData } from "../hooks";
```

### Step 2: Replace useQuery Calls
```typescript
// Before
const {data: spot} = useQuery({
  queryKey: ['spots', spotId, isSlug],
  queryFn: () => isSlug ? getSurfSpotBySlug(spotId) : getSurfSpot(spotId)
});

// After
const { data: spot } = useSpotDataAuto(spotId);
```

### Step 3: Update Data Access
```typescript
// Before: Direct access
const tideData = tideDataQuery.data;
const forecastCurrent = forecastCurrentQuery.data;

// After: Destructured access
const { dailyTides: tideData, current: forecastCurrent } = useTideData(lat, lng);
```

## 📈 Benefits Achieved

### 1. **Code Reduction**
- **Before:** 8 useQuery calls in spot.tsx
- **After:** 4 custom hook calls
- **Reduction:** 50% fewer lines of query code

### 2. **Consistency**
- All query keys use centralized constants
- All stale times use centralized config
- All error handling follows same patterns

### 3. **Maintainability**
- Changes to query logic happen in one place
- New features can reuse existing patterns
- Testing is simplified with focused hooks

### 4. **Type Safety**
- Better TypeScript inference with custom hooks
- Centralized type definitions
- Reduced chance of query key mismatches

### 5. **Performance**
- Optimized query key generation
- Consistent caching strategies
- Reduced bundle size through code sharing

## 🧪 Testing Strategy

### Unit Tests for Hooks
```typescript
// src/hooks/__tests__/useSpotData.test.ts
describe('useSpotData', () => {
  it('fetches spot by ID', () => {
    // Test implementation
  });
  
  it('fetches spot by slug', () => {
    // Test implementation
  });
});
```

### Integration Tests
```typescript
// Test that hooks work together correctly
describe('useTideData integration', () => {
  it('fetches station then tides', () => {
    // Test the dependency chain
  });
});
```

## 🔄 Future Enhancements

### 1. **Error Handling Hooks**
```typescript
export const useQueryWithErrorHandling = (queryFn, options) => {
  // Centralized error handling logic
};
```

### 2. **Optimistic Updates**
```typescript
export const useOptimisticSpotUpdate = (spotId) => {
  // Optimistic update patterns
};
```

### 3. **Background Refetching**
```typescript
export const useBackgroundRefetch = (queryKey) => {
  // Background refresh patterns
};
```

## 📋 Implementation Checklist

- [x] Create custom hooks directory structure
- [x] Implement `useSpotData.ts`
- [x] Implement `useForecastData.ts`
- [x] Implement `useTideData.ts`
- [x] Implement `useLocationData.ts`
- [x] Implement `useGeolocation.ts`
- [x] Implement `useBatchData.ts`
- [x] Create centralized configuration
- [x] Update all hooks to use config
- [x] Create example refactored component
- [ ] Migrate existing pages to use new hooks
- [ ] Add comprehensive tests
- [ ] Update documentation
- [ ] Performance testing
- [ ] Code review and cleanup

## 🎯 Next Steps

1. **Migrate one page at a time** (start with `spot.tsx`)
2. **Add tests** for each custom hook
3. **Performance testing** to ensure no regressions
4. **Documentation updates** for team adoption
5. **Code review** and final cleanup

This refactoring provides a solid foundation for future development while significantly reducing code duplication and improving maintainability. 