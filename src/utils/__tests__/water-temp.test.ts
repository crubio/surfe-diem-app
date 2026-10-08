import { describe, it, expect } from 'vitest';
import {
  getWaterTempQualityDescription,
  getWaterTempColor,
  getWaterTempComfortLevel
} from '../water-temp';

describe('Water Temperature Utilities', () => {
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

  describe('getWaterTempComfortLevel', () => {
    it('should return correct comfort levels for different temperatures', () => {
      expect(getWaterTempComfortLevel(5)).toBe('Wetsuit Required');
      expect(getWaterTempComfortLevel(12)).toBe('Full Wetsuit');
      expect(getWaterTempComfortLevel(17)).toBe('Spring Suit or Full Wetsuit');
      expect(getWaterTempComfortLevel(22)).toBe('Rash Guard');
      expect(getWaterTempComfortLevel(27)).toBe('Board Shorts');
      expect(getWaterTempComfortLevel(35)).toBe('Board Shorts');
    });

    it('should handle boundary values', () => {
      expect(getWaterTempComfortLevel(10)).toBe('Full Wetsuit');
      expect(getWaterTempComfortLevel(15)).toBe('Spring Suit or Full Wetsuit');
      expect(getWaterTempComfortLevel(20)).toBe('Rash Guard');
      expect(getWaterTempComfortLevel(25)).toBe('Board Shorts');
      expect(getWaterTempComfortLevel(30)).toBe('Board Shorts');
    });
  });
}); 