import { formatCoordinates, formatDirection, formatTemperature } from '../formatting';

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

  describe('formatDirection', () => {
    it('formats cardinal directions correctly', () => {
      expect(formatDirection(0)).toBe('N');
      expect(formatDirection(90)).toBe('E');
      expect(formatDirection(180)).toBe('S');
      expect(formatDirection(270)).toBe('W');
      expect(formatDirection(45)).toBe('NE');
      expect(formatDirection(135)).toBe('SE');
      expect(formatDirection(225)).toBe('SW');
      expect(formatDirection(315)).toBe('NW');
    });

    it('formats intermediate directions correctly', () => {
      expect(formatDirection(22.5)).toBe('NNE');
      expect(formatDirection(67.5)).toBe('ENE');
      expect(formatDirection(112.5)).toBe('ESE');
      expect(formatDirection(157.5)).toBe('SSE');
      expect(formatDirection(202.5)).toBe('SSW');
      expect(formatDirection(247.5)).toBe('WSW');
      expect(formatDirection(292.5)).toBe('WNW');
      expect(formatDirection(337.5)).toBe('NNW');
    });

    it('handles edge cases and invalid input', () => {
      expect(formatDirection(undefined as any)).toBe('N/A');
      expect(formatDirection(null as any)).toBe('N/A');
      expect(formatDirection(0)).toBe('N');
      expect(formatDirection(360)).toBe('N');
      expect(formatDirection(720)).toBe('N'); // Wraps around
    });

    it('handles negative degrees', () => {
      expect(formatDirection(-90)).toBe('W');
      expect(formatDirection(-180)).toBe('S');
      expect(formatDirection(-270)).toBe('E');
    });
  });

  describe('formatTemperature', () => {
    it('converts Celsius to Fahrenheit correctly', () => {
      expect(formatTemperature(0)).toBe('32°F');
      expect(formatTemperature(100)).toBe('212°F');
      expect(formatTemperature(20)).toBe('68°F');
      expect(formatTemperature(-10)).toBe('14°F');
    });

    it('handles decimal temperatures', () => {
      expect(formatTemperature(20.5)).toBe('69°F');
      expect(formatTemperature(15.7)).toBe('60°F');
    });

    it('handles edge cases and invalid input', () => {
      expect(formatTemperature(undefined as any)).toBe('N/A');
      expect(formatTemperature(null as any)).toBe('N/A');
    });
  });
});
