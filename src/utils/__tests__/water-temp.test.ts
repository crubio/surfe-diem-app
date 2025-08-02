import { describe, it, expect } from 'vitest';
import {
  extractWaterTempFromForecast,
  getWaterTempQualityDescription,
  getWaterTempColor,
  formatWaterTemp,
  getWaterTempPercentage,
  getWaterTempComfortLevel,
  WaterTempData
} from '../water-temp';

describe('Water Temperature Utilities', () => {
  describe('extractWaterTempFromForecast', () => {
    it('should extract water temperature from valid forecast data', () => {
      const mockForecast = {
        current: {
          sea_surface_temperature: 18.5
        }
      };
      
      const result = extractWaterTempFromForecast(mockForecast);
      
      expect(result).toEqual({
        temperature: 18.5,
        unit: 'C'
      });
    });

    it('should return null for missing forecast data', () => {
      const result = extractWaterTempFromForecast(null);
      expect(result).toBeNull();
    });

    it('should return null for missing current data', () => {
      const mockForecast = {};
      const result = extractWaterTempFromForecast(mockForecast);
      expect(result).toBeNull();
    });

    it('should return null for missing sea surface temperature', () => {
      const mockForecast = {
        current: {
          swell_wave_height: 2.5
        }
      };
      
      const result = extractWaterTempFromForecast(mockForecast);
      expect(result).toBeNull();
    });

    it('should handle zero temperature', () => {
      const mockForecast = {
        current: {
          sea_surface_temperature: 0
        }
      };
      
      const result = extractWaterTempFromForecast(mockForecast);
      expect(result).toEqual({
        temperature: 0,
        unit: 'C'
      });
    });
  });

  describe('getWaterTempQualityDescription', () => {
    it('should return correct descriptions for different temperature ranges', () => {
      expect(getWaterTempQualityDescription(5)).toBe('Very Cold');
      expect(getWaterTempQualityDescription(12)).toBe('Cold');
      expect(getWaterTempQualityDescription(17)).toBe('Cool');
      expect(getWaterTempQualityDescription(22)).toBe('Warm');
      expect(getWaterTempQualityDescription(27)).toBe('Very Warm');
      expect(getWaterTempQualityDescription(35)).toBe('Hot');
    });

    it('should handle boundary values', () => {
      expect(getWaterTempQualityDescription(10)).toBe('Cold');
      expect(getWaterTempQualityDescription(15)).toBe('Cool');
      expect(getWaterTempQualityDescription(20)).toBe('Warm');
      expect(getWaterTempQualityDescription(25)).toBe('Very Warm');
      expect(getWaterTempQualityDescription(30)).toBe('Hot');
    });
  });

  describe('getWaterTempColor', () => {
    it('should return correct colors for different temperature ranges', () => {
      expect(getWaterTempColor(5)).toBe('error');    // Very cold - red
      expect(getWaterTempColor(12)).toBe('warning'); // Cold - orange
      expect(getWaterTempColor(17)).toBe('info');    // Cool - blue
      expect(getWaterTempColor(22)).toBe('success'); // Warm - green
      expect(getWaterTempColor(27)).toBe('warning'); // Very warm - orange
      expect(getWaterTempColor(35)).toBe('error');   // Hot - red
    });

    it('should handle boundary values', () => {
      expect(getWaterTempColor(10)).toBe('warning');
      expect(getWaterTempColor(15)).toBe('info');
      expect(getWaterTempColor(20)).toBe('success');
      expect(getWaterTempColor(25)).toBe('warning');
      expect(getWaterTempColor(30)).toBe('error');
    });
  });

  describe('formatWaterTemp', () => {
    it('should format Celsius correctly', () => {
      expect(formatWaterTemp(18.5, 'C')).toBe('18.5°C');
      expect(formatWaterTemp(0, 'C')).toBe('0.0°C');
      expect(formatWaterTemp(25.123, 'C')).toBe('25.1°C');
    });

    it('should format Fahrenheit correctly', () => {
      expect(formatWaterTemp(18.5, 'F')).toBe('65.3°F');
      expect(formatWaterTemp(0, 'F')).toBe('32.0°F');
      expect(formatWaterTemp(25, 'F')).toBe('77.0°F');
    });

    it('should default to Celsius', () => {
      expect(formatWaterTemp(18.5)).toBe('18.5°C');
    });

    it('should handle negative temperatures', () => {
      expect(formatWaterTemp(-5, 'C')).toBe('-5.0°C');
      expect(formatWaterTemp(-5, 'F')).toBe('23.0°F');
    });
  });

  describe('getWaterTempPercentage', () => {
    it('should return correct percentages for temperature range', () => {
      // 5°C = 0%, 35°C = 100%
      expect(getWaterTempPercentage(5)).toBe(0);
      expect(getWaterTempPercentage(20)).toBe(50); // Middle of range
      expect(getWaterTempPercentage(35)).toBe(100);
    });

    it('should clamp values outside the range', () => {
      expect(getWaterTempPercentage(0)).toBe(0);   // Below minimum
      expect(getWaterTempPercentage(40)).toBe(100); // Above maximum
    });

    it('should handle typical surf temperatures', () => {
      expect(getWaterTempPercentage(10)).toBe(17); // Cold
      expect(getWaterTempPercentage(15)).toBe(33); // Cool
      expect(getWaterTempPercentage(25)).toBe(67); // Warm
      expect(getWaterTempPercentage(30)).toBe(83); // Very warm
    });
  });

  describe('getWaterTempComfortLevel', () => {
    it('should return correct comfort levels for different temperatures', () => {
      expect(getWaterTempComfortLevel(5)).toBe('Wetsuit Required');
      expect(getWaterTempComfortLevel(12)).toBe('Full Wetsuit');
      expect(getWaterTempComfortLevel(17)).toBe('Spring Suit');
      expect(getWaterTempComfortLevel(22)).toBe('Rash Guard');
      expect(getWaterTempComfortLevel(27)).toBe('Board Shorts');
      expect(getWaterTempComfortLevel(35)).toBe('Board Shorts');
    });

    it('should handle boundary values', () => {
      expect(getWaterTempComfortLevel(10)).toBe('Full Wetsuit');
      expect(getWaterTempComfortLevel(15)).toBe('Spring Suit');
      expect(getWaterTempComfortLevel(20)).toBe('Rash Guard');
      expect(getWaterTempComfortLevel(25)).toBe('Board Shorts');
      expect(getWaterTempComfortLevel(30)).toBe('Board Shorts');
    });
  });
}); 