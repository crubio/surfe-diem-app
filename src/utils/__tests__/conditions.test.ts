import {
  getSwellPeriodScore,
  getWindQualityScore,
  getWaveHeightScore,
  calculateOverallScore,
  getEnhancedConditionScore,
  getBatchRecommendationsFromAPI,
  transformConditionsToConditionResult
} from '../conditions';
import { CurrentConditions } from '@/types/conditions';
import { vi } from 'vitest';
import { swellPowerFixture } from './fixtures/swell-power-fixture';

const getBatchConditions = vi.fn();
vi.mock('@features/conditions', () => ({ getBatchConditions: (...args: unknown[]) => getBatchConditions(...args) }));

describe('Surf Condition Scoring', () => {
  describe('getSwellPeriodScore', () => {
    it('should score wind swell (under 10s) as poor', () => {
      expect(getSwellPeriodScore(7)).toBeLessThan(30);
      expect(getSwellPeriodScore(9)).toBeLessThan(30);
    });

    it('should score mixed swell (10-15s) as fair to good', () => {
      expect(getSwellPeriodScore(12)).toBeGreaterThan(30);
      expect(getSwellPeriodScore(12)).toBeLessThan(60);
    });

    it('should score ground swell (15-20s) as excellent', () => {
      expect(getSwellPeriodScore(17)).toBeGreaterThan(60);
      expect(getSwellPeriodScore(17)).toBeLessThan(90);
    });

    it('should score long period swell (20s+) as outstanding', () => {
      expect(getSwellPeriodScore(22)).toBeGreaterThan(90);
    });

    it('should handle missing data gracefully', () => {
      expect(getSwellPeriodScore(0)).toBe(50);
      expect(getSwellPeriodScore(-1)).toBe(50);
    });
  });

  describe('getWindQualityScore', () => {
    it('should score light winds as good', () => {
      expect(getWindQualityScore(5)).toBeGreaterThan(70);
      expect(getWindQualityScore(10)).toBeGreaterThan(70);
    });

    it('should score moderate winds as fair', () => {
      expect(getWindQualityScore(17)).toBeGreaterThan(40);
      expect(getWindQualityScore(17)).toBeLessThan(70);
    });

    it('should score strong winds as poor', () => {
      expect(getWindQualityScore(25)).toBeLessThan(40);
    });

    it('should handle missing data gracefully', () => {
      expect(getWindQualityScore(0)).toBe(50);
      expect(getWindQualityScore(-1)).toBe(50);
    });
  });

  describe('getWaveHeightScore', () => {
    it('should score beginner waves (1-2ft) moderately', () => {
      expect(getWaveHeightScore(1.5)).toBeGreaterThan(50);
      expect(getWaveHeightScore(1.5)).toBeLessThan(75);
    });

    it('should score ideal waves (2-4ft) highly', () => {
      expect(getWaveHeightScore(3)).toBeGreaterThan(75);
      expect(getWaveHeightScore(3)).toBeLessThanOrEqual(100);
    });

    it('should score perfect waves (4-6ft) as perfect', () => {
      expect(getWaveHeightScore(5)).toBe(100);
    });

    it('should score big waves (6ft+) as advanced but good', () => {
      expect(getWaveHeightScore(8)).toBeGreaterThan(60);
      expect(getWaveHeightScore(8)).toBeLessThan(100);
    });

    it('should handle missing data gracefully', () => {
      expect(getWaveHeightScore(0)).toBe(50);
      expect(getWaveHeightScore(-1)).toBe(50);
    });
  });

  describe('calculateOverallScore', () => {
    it('should calculate weighted average correctly', () => {
      const scores = {
        periodQuality: 80,  // 40% weight
        windQuality: 60,  // 35% weight
        waveHeight: 100   // 25% weight
      };
      
      const expected = Math.round((80 * 0.40) + (60 * 0.35) + (100 * 0.25));
      expect(calculateOverallScore(scores)).toBe(expected);
    });

    it('should return rounded integer', () => {
      const scores = {
        periodQuality: 75,
        windQuality: 85,
        waveHeight: 90
      };
      
      const result = calculateOverallScore(scores);
      expect(Number.isInteger(result)).toBe(true);
    });
  });

  describe('getEnhancedConditionScore', () => {
    it('should return excellent for high scores', () => {
      const result = getEnhancedConditionScore({
        swellPeriod: 18,
        windSpeed: 8,
        waveHeight: 5
      });
      
      expect(result.level).toBe('excellent');
      expect(result.color).toBe('success');
    });

    it('should return good for moderate scores', () => {
      const result = getEnhancedConditionScore({
        swellPeriod: 12,
        windSpeed: 12,
        waveHeight: 3
      });
      
      expect(result.level).toBe('good');
      expect(result.color).toBe('success');
    });

    it('should include the numeric 0-100 score', () => {
      const result = getEnhancedConditionScore({
        swellPeriod: 15,
        windSpeed: 10,
        waveHeight: 4
      });
      
      expect(result.value).toBeGreaterThanOrEqual(0);
      expect(result.value).toBeLessThanOrEqual(100);
      expect(Number.isInteger(result.value)).toBe(true);
    });

    it('should handle missing data gracefully', () => {
      const result = getEnhancedConditionScore({});
      expect(result.level).toBeDefined();
      expect(result.color).toBeDefined();
    });
  });

  describe('Practical Examples', () => {
    it('should score excellent conditions correctly', () => {
      // Perfect conditions: long period groundswell, light wind, ideal wave height
      const result = getEnhancedConditionScore({
        swellPeriod: 18,  // Ground swell
        windSpeed: 8,     // Light wind
        waveHeight: 5     // Ideal height
      });
      
      expect(result.level).toBe('excellent');
      expect(result.value).toBeGreaterThanOrEqual(80);
    });

    it('should score poor conditions correctly', () => {
      // Poor conditions: short period windswell, strong wind, small waves
      const result = getEnhancedConditionScore({
        swellPeriod: 7,   // Wind swell
        windSpeed: 25,    // Strong wind
        waveHeight: 1     // Small waves
      });
      
      expect(result.level).toBe('poor');
      expect(result.value).toBeLessThan(40);
    });

    it('should demonstrate scoring breakdown', () => {
      // Let's see the individual scores
      const swellScore = getSwellPeriodScore(12);  // Mixed swell
      const windScore = getWindQualityScore(15);   // Moderate wind
      const heightScore = getWaveHeightScore(3);   // Good height
      
      const overallScore = calculateOverallScore({
        periodQuality: swellScore,
        windQuality: windScore,
        waveHeight: heightScore
      });
      
      // All scores should be in 0-100 range
      expect(swellScore).toBeGreaterThanOrEqual(0);
      expect(swellScore).toBeLessThanOrEqual(100);
      expect(windScore).toBeGreaterThanOrEqual(0);
      expect(windScore).toBeLessThanOrEqual(100);
      expect(heightScore).toBeGreaterThanOrEqual(0);
      expect(heightScore).toBeLessThanOrEqual(100);
      expect(overallScore).toBeGreaterThanOrEqual(0);
      expect(overallScore).toBeLessThanOrEqual(100);
      
      // Sample scoring breakdown logged for demonstration
    });
  });

  describe('transformConditionsToConditionResult', () => {
    const spot = { id: 1, name: 'Test Spot', slug: 'test-spot' };
    const baseConditions = {
      primary_swell_height: null,
      primary_swell_period: null,
      primary_swell_direction: null,
      wind_wave_height: null,
      wind_speed: null,
    } as unknown as CurrentConditions;

    it('should convert metric heights to feet', () => {
      const result = transformConditionsToConditionResult(
        { ...baseConditions, primary_swell_height: 1.5, primary_swell_period: 14, wind_wave_height: 0.5 },
        spot
      );
      expect(result.waveHeightValue).toBeCloseTo(4.92, 2);
      expect(result.swellHeight).toBeCloseTo(4.92, 2);
      expect(result.waveHeight).toBe('4.9-5.9ft');
      expect(result.windWaveHeight).toBeCloseTo(1.64, 2);
      expect(result.conditions).toBe('Slight chop');
    });

    it('should treat missing heights as zero, without claiming glassy', () => {
      const result = transformConditionsToConditionResult(baseConditions, spot);
      expect(result.waveHeightValue).toBe(0);
      expect(result.waveHeight).toBe('0-1ft');
      expect(result.conditions).toBe('Current conditions');
    });

    it('should use the buoy swell when the API sourced power from it', () => {
      // Westport-style: no NWS swell, buoy .spec split available
      const result = transformConditionsToConditionResult({
        ...baseConditions,
        swell_power: 298,
        swell_power_source: 'buoy_spec',
        buoy_swell_height: 1.1,
        buoy_swell_period: 11.1,
        buoy_swell_direction: 248,
        buoy_wind_wave_height: 0.6,
        buoy_wave_station: '46211',
        buoy_observed_at: '2026-10-07T19:56:00Z',
      }, spot);
      expect(result.waveHeightValue).toBeCloseTo(3.61, 2);
      expect(result.swellPeriod).toBe(11.1);
      expect(result.swellPower).toBe(298);
      expect(result.swellPowerSource).toBe('buoy_spec');
      expect(result.swellStation).toBe('46211');
      expect(result.conditions).toBe('Slight chop'); // buoy wind wave 0.6 m = 1.97 ft
    });

    it('should keep NWS swell when the API sourced power from NWS', () => {
      const result = transformConditionsToConditionResult({
        ...baseConditions,
        primary_swell_height: 1.5,
        primary_swell_period: 14,
        swell_power_source: 'nws',
        buoy_swell_height: 0.9,
      }, spot);
      expect(result.waveHeightValue).toBeCloseTo(4.92, 2);
      expect(result.swellStation).toBeUndefined();
    });

    it('should convert wind to mph, and leave it undefined when there is no reading', () => {
      const withWind = transformConditionsToConditionResult({ ...baseConditions, wind_speed: 20 }, spot);
      expect(withWind.windSpeedValue).toBe(12); // 20 km/h = 12.4 mph, floored

      const noWind = transformConditionsToConditionResult(baseConditions, spot);
      expect(noWind.windSpeedValue).toBeUndefined();
    });
  });

  describe('getBatchRecommendationsFromAPI', () => {
    it('should return null results for empty spots array', async () => {
      const result = await getBatchRecommendationsFromAPI([]);
      expect(result).toEqual({
        bestConditions: null,
        cleanestConditions: null,
        mostPowerful: null,
        bySpotId: {}
      });
    });

    it('should return null results for null/undefined spots', async () => {
      const result1 = await getBatchRecommendationsFromAPI(null as any);
      const result2 = await getBatchRecommendationsFromAPI(undefined as any);
      expect(result1).toEqual({
        bestConditions: null,
        cleanestConditions: null,
        mostPowerful: null,
        bySpotId: {}
      });
      expect(result2).toEqual({
        bestConditions: null,
        cleanestConditions: null,
        mostPowerful: null,
        bySpotId: {}
      });
    });

    it('should rank most powerful by swell power, not height', async () => {
      // 4 ft @ 8 s windswell (taller) vs 3 ft @ 16 s groundswell (more powerful)
      getBatchConditions.mockResolvedValueOnce({
        results: [
          { spot_id: 1, conditions: swellPowerFixture(1.22, 8) },
          { spot_id: 2, conditions: swellPowerFixture(0.91, 16) },
        ],
        errors: [],
      });
      const result = await getBatchRecommendationsFromAPI([
        { id: 1, name: 'Windswell Beach', slug: 'windswell' },
        { id: 2, name: 'Groundswell Point', slug: 'groundswell' },
      ]);
      expect(result.mostPowerful?.spot).toBe('Groundswell Point');
    });

    it('should leave most powerful empty when no spot has swell power', async () => {
      getBatchConditions.mockResolvedValueOnce({
        results: [{ spot_id: 1, conditions: { ...swellPowerFixture(1, 10), swell_power: null, swell_power_source: null } }],
        errors: [],
      });
      const result = await getBatchRecommendationsFromAPI([{ id: 1, name: 'A', slug: 'a' }]);
      expect(result.mostPowerful).toBeNull();
    });

    it('should return structured object with all three recommendation keys', async () => {
      const result = await getBatchRecommendationsFromAPI([]);
      expect(result).toHaveProperty('bestConditions');
      expect(result).toHaveProperty('cleanestConditions');
      expect(result).toHaveProperty('mostPowerful');
    });
  });
}); 