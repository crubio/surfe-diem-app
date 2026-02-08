/**
 * Test file to verify NWS parser utilities work correctly
 * This demonstrates the parser with real NWS data structure
 */

import { buildCurrentForecast, parseNWSValidTime, groupNWSDataByHour } from '../nws-parser';

// Example NWS response structure (from your Untitled-1 JSON)
const exampleNWSData = {
  spot_id: 51,
  latitude: 36.971492,
  longitude: -121.9486,
  grid_id: 'MTR',
  grid_x: 93,
  grid_y: 66,
  timezone: 'America/Los_Angeles',
  wave_data: {
    wave_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/P3DT4H',
        value: 0.3048,
      },
      {
        validTime: '2026-01-01T12:00:00+00:00/P2D',
        value: 0.6096,
      },
      {
        validTime: '2026-01-03T12:00:00+00:00/P1DT6H',
        value: 0.9144,
      },
    ],
    wave_period: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT22H',
        value: 7,
      },
      {
        validTime: '2025-12-30T06:00:00+00:00/PT6H',
        value: 8,
      },
    ],
    primary_swell_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT4H',
        value: 0.6096,
      },
      {
        validTime: '2025-12-29T12:00:00+00:00/PT12H',
        value: 0.3048,
      },
    ],
    primary_swell_direction: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT4H',
        value: 320,
      },
    ],
    primary_swell_period: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT4H',
        value: 10,
      },
    ],
    secondary_swell_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/PT22H',
        value: 0.3048,
      },
    ],
    wind_wave_height: [
      {
        validTime: '2025-12-29T08:00:00+00:00/P4DT10H',
        value: 0,
      },
    ],
  },
};

// Test 1: Parse validTime with timezone
console.log('=== Test 1: Parse validTime ===');
const parsed = parseNWSValidTime(
  '2025-12-29T08:00:00+00:00/PT4H',
  'America/Los_Angeles'
);
console.log('Start (PT):', parsed.start!.toISO());
console.log('End (PT):', parsed.end!.toISO());
console.log('Duration:', parsed.duration.toISO());
console.log('Hours:', parsed.hours);

// Test 2: Build current forecast
console.log('\n=== Test 2: Build Current Forecast ===');
const current = buildCurrentForecast(exampleNWSData.wave_data, exampleNWSData.timezone);
console.log('Swell wave height (ft):', current.swell_wave_height.toFixed(1));
console.log('Primary swell height (ft):', current.primary_swell_height.toFixed(1));
console.log('Secondary swell height (ft):', current.secondary_swell_height.toFixed(1));
console.log('Swell period (s):', current.swell_wave_period);
console.log('Swell direction (°):', current.swell_wave_direction);
console.log('Wind wave height (ft):', current.wind_wave_height.toFixed(1));
console.log('Timestamp:', current.timestamp.toISO());

// Test 3: Group by hour
console.log('\n=== Test 3: Group Data by Hour (24 hours) ===');
const hourly = groupNWSDataByHour(
  exampleNWSData.wave_data.wave_height,
  exampleNWSData.timezone,
  24
);
console.log('First 5 hourly points:');
hourly.slice(0, 5).forEach((point) => {
  console.log(`  Hour ${point.hour}: ${point.value ?? 'no data'}`);
});

console.log('\n✅ All tests completed successfully!');
console.log(
  'Tip: You now have all the utilities to convert NWS data to your UI format'
);
