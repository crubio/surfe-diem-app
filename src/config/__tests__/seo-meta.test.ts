import { describe, it, expect } from 'vitest';
import {
  canonicalUrl,
  cleanName,
  spotMeta,
  buoyMeta,
  buoyLabel,
  buoyPlace,
  spotPath,
  coverageText,
  formatMiles,
  milesBetween,
  nearestTo,
  STATIC_PAGES,
} from 'config/seo-meta';

describe('seo-meta', () => {
  it('builds canonical URLs on the bare domain, with no trailing slash on home', () => {
    expect(canonicalUrl('')).toBe('https://surfe-diem.com');
    expect(canonicalUrl('spot/pipeline')).toBe('https://surfe-diem.com/spot/pipeline');
  });

  it('trims and collapses whitespace in names', () => {
    expect(cleanName('Jug Handle State Beach ')).toBe('Jug Handle State Beach');
    expect(cleanName('Station 46265  - Nome, AK')).toBe('Station 46265 - Nome, AK');
    expect(cleanName(null)).toBe('');
  });

  it('uses the slug for spot paths, falling back to the id', () => {
    expect(spotPath({ id: 1, slug: 'jug-handle-state-beach' })).toBe('spot/jug-handle-state-beach');
    expect(spotPath({ id: 1, slug: null })).toBe('spot/1');
  });

  it('has a home page at the root path', () => {
    expect(STATIC_PAGES.home.path).toBe('');
  });
});

describe('spotMeta by forecast coverage', () => {
  const pipeline = { id: 1950, name: 'Pipeline', slug: 'pipeline', subregion_name: 'North Shore Oahu' };

  it('promises a swell forecast only with full coverage', () => {
    const meta = spotMeta({ ...pipeline, forecast: 'full' });
    expect(meta.title).toBe('Pipeline Surf Report & Forecast – North Shore Oahu | Surfe Diem');
    expect(meta.description).toContain('swell height, period and direction');
  });

  it('promises wave height and wind, not swell, with partial coverage', () => {
    const meta = spotMeta({ ...pipeline, forecast: 'partial' });
    expect(meta.title).toContain('Surf Report & Forecast');
    expect(meta.description).toContain('wave height and wind');
    expect(meta.description).not.toContain('swell');
  });

  it('promises no forecast without NWS coverage', () => {
    const meta = spotMeta({ ...pipeline, forecast: null });
    expect(meta.title).toBe('Pipeline Surf Spot – North Shore Oahu | Surfe Diem');
    expect(meta.description).not.toMatch(/forecast/i);
    expect(coverageText(null)).toContain('No National Weather Service wave forecast');
  });
});

describe('buoy names', () => {
  it.each([
    ['Station 41108  - Wilmington Harbor, NC - (200) ', 'Wilmington Harbor, NC'],
    ['Station 46232  - Point Loma South, CA  (191) ', 'Point Loma South, CA'],
    ['Station 44029  - Buoy A01 - Massachusetts Bay ', 'Buoy A01 - Massachusetts Bay'],
    ['HALF MOON BAY - 24NM SSW of San Francisco, CA', 'HALF MOON BAY - 24NM SSW of San Francisco, CA'],
    ['Barnegat, NJ (209)', 'Barnegat, NJ'],
    ['Station 41139 ', ''],
  ])('%j → %j', (name, place) => {
    expect(buoyPlace({ name, location_id: 'x' })).toBe(place);
  });

  it('labels a buoy by id and place, or id alone', () => {
    expect(buoyLabel({ name: 'Station 46265  - Nome, AK (241)', location_id: '46265' })).toBe('Buoy 46265 – Nome, AK');
    expect(buoyLabel({ name: 'Station 41139 ', location_id: '41139' })).toBe('Buoy 41139');
    expect(buoyMeta({ name: null, location_id: '46022' }).title).toBe('NOAA Buoy 46022 Marine Data | Surfe Diem');
  });
});

describe('nearby places', () => {
  it('measures great-circle miles', () => {
    // Santa Cruz to San Francisco, ~61 mi
    expect(milesBetween(36.95, -122.03, 37.77, -122.42)).toBeCloseTo(60.6, 0);
  });

  it('keeps places within 100 mi, nearest first, without the place itself', () => {
    const places = [
      { id: 1, latitude: 36.95, longitude: -122.03 }, // itself
      { id: 2, latitude: 37.77, longitude: -122.42 }, // ~60 mi
      { id: 3, latitude: 36.97, longitude: -122.0 }, // ~2 mi
      { id: 4, latitude: 34.0, longitude: -118.5 }, // LA, too far
    ];
    const near = nearestTo(places, 36.95, -122.03, { limit: 8, excludeKey: 1 });
    expect(near.map((p) => p.id)).toEqual([3, 2]);
    expect(nearestTo(places, 36.95, -122.03, { limit: 1, excludeKey: 1 }).map((p) => p.id)).toEqual([3]);
  });

  it('formats distances in whole miles', () => {
    expect(formatMiles(0.4)).toBe('<1 mi');
    expect(formatMiles(12.6)).toBe('13 mi');
  });
});
