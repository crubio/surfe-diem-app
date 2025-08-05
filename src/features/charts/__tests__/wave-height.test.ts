import { interpolateTideData } from '../wave-height';

describe('interpolateTideData', () => {
  it('should interpolate tide data correctly between two points', () => {
    const tidePredictions = [
      { t: '2025-01-15T06:00:00Z', v: '1.2', type: 'L' }, // Low tide
      { t: '2025-01-15T12:00:00Z', v: '5.8', type: 'H' }, // High tide
    ];
    
    const waveTimeData = [
      '2025-01-15T06:00:00Z', // 6 AM - should be 1.2
      '2025-01-15T09:00:00Z', // 9 AM - should be interpolated (halfway = 3.5)
      '2025-01-15T12:00:00Z', // 12 PM - should be 5.8
    ];
    
    const result = interpolateTideData(tidePredictions, waveTimeData);
    
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(1.2, 1); // 6 AM
    expect(result[1]).toBeCloseTo(3.5, 1); // 9 AM (interpolated)
    expect(result[2]).toBeCloseTo(5.8, 1); // 12 PM
  });

  it('should handle edge cases correctly', () => {
    const tidePredictions = [
      { t: '2025-01-15T06:00:00Z', v: '1.2', type: 'L' },
      { t: '2025-01-15T12:00:00Z', v: '5.8', type: 'H' },
    ];
    
    // Test before first tide point - should interpolate using first two points
    const earlyTimeData = ['2025-01-15T05:00:00Z'];
    const earlyResult = interpolateTideData(tidePredictions, earlyTimeData);
    expect(earlyResult).toHaveLength(1);
    // 5 AM is 1 hour before 6 AM, so it should be interpolated between 1.2 and 5.8
    // The ratio is -1/6 (1 hour before 6-hour interval), so result should be less than 1.2
    expect(earlyResult[0]).toBeLessThan(1.2);
    
    // Test after last tide point - should interpolate using last two points
    const lateTimeData = ['2025-01-15T13:00:00Z'];
    const lateResult = interpolateTideData(tidePredictions, lateTimeData);
    expect(lateResult).toHaveLength(1);
    // 1 PM is 1 hour after 12 PM, so it should be interpolated between 1.2 and 5.8
    // The ratio is 1/6 (1 hour into 6-hour interval), so result should be greater than 5.8
    expect(lateResult[0]).toBeGreaterThan(5.8);
  });

  it('should handle empty inputs gracefully', () => {
    expect(interpolateTideData([], [])).toEqual([]);
    expect(interpolateTideData([], ['2025-01-15T06:00:00Z'])).toEqual([]);
    expect(interpolateTideData([{ t: '2025-01-15T06:00:00Z', v: '1.2', type: 'L' }], [])).toEqual([]);
  });

  it('should handle single tide point', () => {
    const tidePredictions = [{ t: '2025-01-15T06:00:00Z', v: '1.2', type: 'L' }];
    const waveTimeData = ['2025-01-15T06:00:00Z', '2025-01-15T07:00:00Z'];
    
    const result = interpolateTideData(tidePredictions, waveTimeData);
    expect(result).toHaveLength(2);
    expect(result[0]).toBeCloseTo(1.2, 1);
    expect(result[1]).toBeCloseTo(1.2, 1); // Should use the single point for both
  });
}); 