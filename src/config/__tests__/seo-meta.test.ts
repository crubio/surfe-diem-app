import { describe, it, expect } from 'vitest';
import { canonicalUrl, cleanName, spotMeta, buoyMeta, spotPath, STATIC_PAGES } from 'config/seo-meta';

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

  it('builds spot meta from the cleaned name', () => {
    const meta = spotMeta({ id: 1, name: 'Jug Handle State Beach ', slug: 'jug-handle-state-beach' });
    expect(meta.path).toBe('spot/jug-handle-state-beach');
    expect(meta.title).toBe('Jug Handle State Beach Surf Forecast & Swell Conditions | Surfe Diem');
    expect(meta.description).toContain('for Jug Handle State Beach.');
  });

  it('builds buoy meta, falling back to the station id without a name', () => {
    expect(buoyMeta({ name: 'Station 46022', location_id: '46022' }).path).toBe('location/46022');
    expect(buoyMeta({ name: null, location_id: '46022' }).title).toBe('NOAA Buoy 46022 Marine Data | Surfe Diem');
  });

  it('has a home page at the root path', () => {
    expect(STATIC_PAGES.home.path).toBe('');
  });
});
