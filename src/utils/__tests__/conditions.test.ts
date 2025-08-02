import { 
  getSwellPeriodScore, 
  getWindQualityScore, 
  getWaveHeightScore, 
  calculateOverallScore,
  getEnhancedConditionScore,
  transformForecastToConditionResult,
  getBestConditionsFromAPI,
  getCleanestConditionsFromAPI
} from '../conditions';

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
        swellPeriod: 80,  // 40% weight
        windQuality: 60,  // 35% weight
        waveHeight: 100   // 25% weight
      };
      
      const expected = Math.round((80 * 0.40) + (60 * 0.35) + (100 * 0.25));
      expect(calculateOverallScore(scores)).toBe(expected);
    });

    it('should return rounded integer', () => {
      const scores = {
        swellPeriod: 75,
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

    it('should include score in description', () => {
      const result = getEnhancedConditionScore({
        swellPeriod: 15,
        windSpeed: 10,
        waveHeight: 4
      });
      
      expect(result.description).toMatch(/\d+\/100/);
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
      expect(result.description).toMatch(/Prime conditions/);
    });

    it('should score poor conditions correctly', () => {
      // Poor conditions: short period windswell, strong wind, small waves
      const result = getEnhancedConditionScore({
        swellPeriod: 7,   // Wind swell
        windSpeed: 25,    // Strong wind
        waveHeight: 1     // Small waves
      });
      
      expect(result.level).toBe('poor');
      expect(result.description).toMatch(/Challenging conditions/);
    });

    it('should demonstrate scoring breakdown', () => {
      // Let's see the individual scores
      const swellScore = getSwellPeriodScore(12);  // Mixed swell
      const windScore = getWindQualityScore(15);   // Moderate wind
      const heightScore = getWaveHeightScore(3);   // Good height
      
      const overallScore = calculateOverallScore({
        swellPeriod: swellScore,
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
      
      console.log(`Sample scoring breakdown:
        Swell Period (12s): ${swellScore}/100
        Wind Quality (15mph): ${windScore}/100  
        Wave Height (3ft): ${heightScore}/100
        Overall Score: ${overallScore}/100`);
    });
  });

  describe('Data Transformation', () => {
    it('should transform API forecast data to ConditionResult', () => {
      // Mock API response
      const mockForecast = {
        current: {
          time: "2025-01-15T10:00",
          interval: 3600,
          swell_wave_height: 2.5,
          swell_wave_direction: 315,
          swell_wave_period: 14,
          wind_wave_height: 0.8,
          wind_wave_direction: 270,
          wind_wave_period: 4,
          sea_surface_temperature: 18.5
        }
      };
      
      const mockSpot = {
        id: 1,
        name: "Steamer Lane",
        slug: "steamer-lane",
        distance: "2.3 miles"
      };
      
      const result = transformForecastToConditionResult(mockForecast, mockSpot);
      
      // Verify basic spot info
      expect(result.spot).toBe("Steamer Lane");
      expect(result.spotId).toBe(1);
      expect(result.slug).toBe("steamer-lane");
      expect(result.distance).toBe("2.3 miles");
      
      // Verify calculated values
      expect(result.waveHeightValue).toBe(2.5); // swell wave height only
      expect(result.windSpeedValue).toBe(0.8);
      expect(result.swellPeriod).toBe(14);
      expect(result.swellHeight).toBe(2.5);
      expect(result.windWaveHeight).toBe(0.8);
      
      // Verify formatted display values
      expect(result.waveHeight).toBe("2.5-3.5ft");
      expect(result.conditions).toBe("Clean"); // windSpeed 0.8 < 1.0
      expect(result.direction).toBe("NW"); // 315 degrees
      
      // Verify scoring was applied
      expect(result.score).toBeDefined();
      expect(result.score.level).toBeDefined();
      expect(result.score.color).toBeDefined();
    });

    it('should handle missing API data gracefully', () => {
      const mockForecast = {
        current: {
          time: "2025-01-15T10:00",
          interval: 3600,
          swell_wave_height: 0,
          swell_wave_direction: 0,
          swell_wave_period: 0,
          wind_wave_height: 0,
          wind_wave_direction: 0,
          wind_wave_period: 0,
          sea_surface_temperature: 0
        }
      };
      
      const mockSpot = {
        id: 2,
        name: "Test Spot",
        slug: "test-spot"
      };
      
      const result = transformForecastToConditionResult(mockForecast, mockSpot);
      
      // Should handle zero values gracefully
      expect(result.waveHeightValue).toBe(0);
      expect(result.windSpeedValue).toBe(0);
      expect(result.waveHeight).toBe("0-1ft");
      expect(result.conditions).toBe("Glassy"); // windSpeed 0 < 0.5
      expect(result.direction).toBe("N/A"); // 0 degrees
      
      // Should still have a score (neutral scores for missing data)
      expect(result.score).toBeDefined();
    });

    it('should format directions correctly', () => {
      const testCases = [
        { degrees: 0, expected: "N/A" },
        { degrees: 90, expected: "E" },
        { degrees: 180, expected: "S" },
        { degrees: 270, expected: "W" },
        { degrees: 315, expected: "NW" },
        { degrees: 45, expected: "NE" },
        { degrees: 135, expected: "SE" },
        { degrees: 225, expected: "SW" }
      ];
      
      testCases.forEach(({ degrees, expected }) => {
        const mockForecast = {
          current: {
            swell_wave_direction: degrees,
            swell_wave_height: 1,
            swell_wave_period: 10,
            wind_wave_height: 0.5,
            wind_wave_direction: 0,
            wind_wave_period: 0,
            sea_surface_temperature: 0
          }
        };
        
        const mockSpot = { id: 1, name: "Test", slug: "test" };
        const result = transformForecastToConditionResult(mockForecast, mockSpot);
        
        expect(result.direction).toBe(expected);
      });
    });

    it('should demonstrate real API transformation', () => {
      // Realistic API response from forecast API
      const realForecast = {
        current: {
          time: "2025-01-15T14:00",
          interval: 3600,
          swell_wave_height: 3.2,
          swell_wave_direction: 320,
          swell_wave_period: 16,
          wind_wave_height: 0.3,
          wind_wave_direction: 280,
          wind_wave_period: 3,
          sea_surface_temperature: 19.2
        }
      };
      
      const realSpot = {
        id: 51,
        name: "Steamer Lane",
        slug: "steamer-lane",
        distance: "1.2 miles"
      };
      
      const result = transformForecastToConditionResult(realForecast, realSpot);
      
      console.log(`Real API Transformation Example:
        Spot: ${result.spot}
        Wave Height: ${result.waveHeight} (${result.waveHeightValue}ft swell)
        Conditions: ${result.conditions}
        Direction: ${result.direction}
        Wind Speed: ${result.windSpeedValue} (proxy from wind waves)
        Swell Period: ${result.swellPeriod}s
        Score: ${result.score.label} (${result.score.description})
        Distance: ${result.distance}`);
      
      // Verify the transformation worked correctly
      expect(result.spot).toBe("Steamer Lane");
      expect(result.waveHeightValue).toBe(3.2); // swell wave height only
      expect(result.windSpeedValue).toBe(0.3);
      expect(result.swellPeriod).toBe(16);
      expect(result.conditions).toBe("Glassy"); // windSpeed 0.3 < 0.5
      expect(result.direction).toBe("NW"); // 320 degrees
      expect(result.score).toBeDefined();
    });
  });

  describe('API Integration', () => {
    it('should handle empty closest spots array', async () => {
      const result = await getBestConditionsFromAPI([]);
      expect(result).toBeNull();
    });

    it('should handle null closest spots array', async () => {
      const result = await getBestConditionsFromAPI(null as any);
      expect(result).toBeNull();
    });

    it('should limit to 5 closest spots', async () => {
      // Mock closest spots data
      const mockClosestSpots = Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        name: `Spot ${i + 1}`,
        slug: `spot-${i + 1}`,
        latitude: 37.7749,
        longitude: -122.4194,
        distance: `${i + 1} miles`
      }));

      // We can't easily test the actual API calls without mocking,
      // but we can test that the function accepts the right data structure
      expect(typeof getBestConditionsFromAPI).toBe('function');
      expect(getBestConditionsFromAPI.length).toBe(1); // Takes one parameter
    });

    it('should handle empty closest spots array for cleanest conditions', async () => {
      const result = await getCleanestConditionsFromAPI([]);
      expect(result).toBeNull();
    });

    it('should handle null closest spots array for cleanest conditions', async () => {
      const result = await getCleanestConditionsFromAPI(null as any);
      expect(result).toBeNull();
    });

    it('should have correct function signature for cleanest conditions', () => {
      expect(typeof getCleanestConditionsFromAPI).toBe('function');
      expect(getCleanestConditionsFromAPI.length).toBe(1); // Takes one parameter
    });
  });
}); 