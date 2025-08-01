# Surf Condition Criteria & Scoring Algorithm

## Overview

This document defines the objective criteria used to determine "good" surfing conditions for the Surfe Diem application. The scoring system is based on factual data and established surfing knowledge, without making assumptions about skill levels.

## Primary Factors (Most Critical)

### 1. Swell Period - The Foundation of Wave Quality
- **Under 10 seconds**: Wind swell (weak, choppy) - Poor
- **10-15 seconds**: Mixed swell - Fair to Good  
- **15-20 seconds**: Ground swell (powerful, organized) - Excellent
- **20+ seconds**: Long period ground swell - Outstanding

### 2. Wind Conditions - Surface Quality
- **Offshore winds**: Clean, smooth wave face (best)
- **Light winds (<15mph)**: Good conditions
- **Moderate winds (15-20mph)**: Fair conditions
- **Strong winds (>20mph)**: Poor conditions

### 3. Wave Height - Size Considerations
- **1-2ft**: Beginner friendly
- **2-4ft**: Good for most conditions
- **4-6ft**: Ideal range
- **6ft+**: Advanced, but can be "best" with excellent period/wind

## Secondary Factors

### 4. Swell Direction - How Waves Approach the Break
- Some spots work better with specific swell directions
- Affects wave shape and break quality

### 5. Tide - Water Level Effects
- **Rising tide**: Generally adds energy to waves (positive)
- **Mid-tide**: Often optimal for many spots
- **Extreme low/high**: Can be negative for some spots

### 6. Weather - Environmental Factors
- Clear visibility: Positive
- Rain: Negative (visibility, comfort)

## Scoring Algorithm

```typescript
interface SurfConditionScore {
  swellPeriod: number;     // 0-100 (35% weight)
  windQuality: number;     // 0-100 (30% weight)
  waveHeight: number;      // 0-100 (20% weight)
  swellDirection: number;  // 0-100 (10% weight)
  tide: number;           // 0-100 (3% weight)
  weather: number;        // 0-100 (2% weight)
  overall: number;        // Weighted average
}
```

### Weight Distribution
- **Swell Period**: 35% (most critical for wave quality)
- **Wind Quality**: 30% (surface conditions)
- **Wave Height**: 20% (surfability)
- **Swell Direction**: 10% (wave approach)
- **Tide**: 3% (water level effects)
- **Weather**: 2% (comfort factor)

## Key Insights

### Groundswell vs Windswell
- **Longer periods** (15+ seconds) indicate more powerful, organized waves (groundswell)
- **Shorter periods** (under 10 seconds) signify weaker, choppier waves (windswell)
- This distinction is crucial for determining wave quality

### Wind Direction Importance
- **Offshore winds** are critical for smooth wave faces
- Even light onshore winds can create choppy conditions
- Wind speed under 15mph is generally preferred

### Tide Timing
- **Rising tide** generally adds energy to waves
- Different spots work best at different tide phases
- Extreme tides can negatively impact some breaks

### Local Geography
- Different types of breaks (beach, reef, point) interact differently with swell
- Each spot may have specific optimal conditions
- Swell direction must match the break's orientation

## Implementation Notes

- All scoring is based on **objective, factual data**
- No skill level assumptions are made
- The spot with the highest overall score is considered "best"
- Missing data should be handled gracefully with fallback scoring
- Scores should be normalized to 0-100 range for consistency

## Sources

This criteria is based on established surfing knowledge and research from:
- Surfing fundamentals and wave science
- Professional surf forecasting principles
- Real-world surfing condition analysis 