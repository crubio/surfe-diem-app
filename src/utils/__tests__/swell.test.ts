import { 
  getSwellQualityDescription, 
  getSwellDirectionText, 
  getSwellHeightColor,
  formatSwellHeight,
  formatSwellPeriod,
  getSwellHeightPercentage
} from '../swell';

describe('Swell Utilities', () => {
  describe('getSwellQualityDescription', () => {
    it('should return correct quality descriptions', () => {
      expect(getSwellQualityDescription(5)).toBe('Wind swell');
      expect(getSwellQualityDescription(10)).toBe('Mixed swell');
      expect(getSwellQualityDescription(14)).toBe('Ground swell');
      expect(getSwellQualityDescription(18)).toBe('Long period ground swell');
    });

    it('should handle invalid data', () => {
      expect(getSwellQualityDescription(0)).toBe('Unknown');
      expect(getSwellQualityDescription(-1)).toBe('Unknown');
    });
  });

  describe('getSwellDirectionText', () => {
    it('should convert degrees to cardinal directions', () => {
      expect(getSwellDirectionText(0)).toBe('N');
      expect(getSwellDirectionText(90)).toBe('E');
      expect(getSwellDirectionText(180)).toBe('S');
      expect(getSwellDirectionText(270)).toBe('W');
      expect(getSwellDirectionText(45)).toBe('NE');
      expect(getSwellDirectionText(225)).toBe('SW');
    });

    it('should handle invalid data', () => {
      expect(getSwellDirectionText(-1)).toBe('N/A');
      expect(getSwellDirectionText(undefined as any)).toBe('N/A');
      expect(getSwellDirectionText(null as any)).toBe('N/A');
    });
  });

  describe('getSwellHeightColor', () => {
    it('should return correct colors for different heights', () => {
      expect(getSwellHeightColor(0.5)).toBe('info');     // Small
      expect(getSwellHeightColor(2)).toBe('success');    // Good
      expect(getSwellHeightColor(4)).toBe('warning');    // Medium
      expect(getSwellHeightColor(8)).toBe('error');      // Big
    });

    it('should handle invalid data', () => {
      expect(getSwellHeightColor(0)).toBe('info');
      expect(getSwellHeightColor(-1)).toBe('info');
    });
  });

  describe('formatSwellHeight', () => {
    it('should format height correctly', () => {
      expect(formatSwellHeight(3.2)).toBe('3.2ft');
      expect(formatSwellHeight(0)).toBe('0ft');
    });

    it('should handle invalid data', () => {
      expect(formatSwellHeight(-1)).toBe('0ft');
    });
  });

  describe('formatSwellPeriod', () => {
    it('should format period correctly', () => {
      expect(formatSwellPeriod(12)).toBe('12s');
      expect(formatSwellPeriod(0)).toBe('0s');
    });

    it('should handle invalid data', () => {
      expect(formatSwellPeriod(-1)).toBe('0s');
    });
  });

  describe('getSwellHeightPercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(getSwellHeightPercentage(0)).toBe(0);
      expect(getSwellHeightPercentage(7.5)).toBe(50);  // 7.5/15 * 100
      expect(getSwellHeightPercentage(15)).toBe(100);
      expect(getSwellHeightPercentage(20)).toBe(100);  // Capped at 100%
    });

    it('should handle invalid data', () => {
      expect(getSwellHeightPercentage(-1)).toBe(0);
    });
  });
}); 