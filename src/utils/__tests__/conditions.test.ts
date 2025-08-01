import { 
  getSwellPeriodScore, 
  getWindQualityScore, 
  getWaveHeightScore, 
  calculateOverallScore,
  getEnhancedConditionScore 
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
}); 