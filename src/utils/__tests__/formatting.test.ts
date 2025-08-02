import { formatCoordinates, formatWaveHeight, formatWaveHeightRange } from '../formatting';

describe('formatting utilities', () => {
  describe('formatCoordinates', () => {
    it('formats coordinates to 4 decimal places', () => {
      expect(formatCoordinates(36.9546808252654, -121.97234)).toBe('36.9547, -121.9723');
      expect(formatCoordinates(37.7749, -122.4194)).toBe('37.7749, -122.4194');
      expect(formatCoordinates(0, 0)).toBe('0.0000, 0.0000');
    });

    it('handles negative coordinates', () => {
      expect(formatCoordinates(-36.9547, -121.9723)).toBe('-36.9547, -121.9723');
      expect(formatCoordinates(36.9547, -121.9723)).toBe('36.9547, -121.9723');
    });

    it('handles coordinates with trailing zeros', () => {
      expect(formatCoordinates(37.0, -122.0)).toBe('37.0000, -122.0000');
      expect(formatCoordinates(37.1, -122.1)).toBe('37.1000, -122.1000');
    });
  });

  describe('formatWaveHeight', () => {
    it('formats wave height to 1 decimal place', () => {
      expect(formatWaveHeight(3.806)).toBe('3.8');
      expect(formatWaveHeight(4.0)).toBe('4.0');
      expect(formatWaveHeight(0)).toBe('0.0');
    });

    it('handles large wave heights', () => {
      expect(formatWaveHeight(15.7)).toBe('15.7');
      expect(formatWaveHeight(20.0)).toBe('20.0');
    });

    it('handles small wave heights', () => {
      expect(formatWaveHeight(0.5)).toBe('0.5');
      expect(formatWaveHeight(1.25)).toBe('1.3');
    });
  });

  describe('formatWaveHeightRange', () => {
    it('formats wave height range with default range of 1', () => {
      expect(formatWaveHeightRange(3.8)).toBe('3.8-4.8ft');
      expect(formatWaveHeightRange(4.0)).toBe('4.0-5.0ft');
      expect(formatWaveHeightRange(0)).toBe('0.0-1.0ft');
    });

    it('formats wave height range with custom range', () => {
      expect(formatWaveHeightRange(3.8, 2)).toBe('3.8-5.8ft');
      expect(formatWaveHeightRange(4.0, 0.5)).toBe('4.0-4.5ft');
      expect(formatWaveHeightRange(5.5, 3)).toBe('5.5-8.5ft');
    });

    it('handles decimal precision correctly', () => {
      expect(formatWaveHeightRange(3.806, 1)).toBe('3.8-4.8ft');
      expect(formatWaveHeightRange(4.25, 1.75)).toBe('4.3-6.0ft');
    });
  });
}); 