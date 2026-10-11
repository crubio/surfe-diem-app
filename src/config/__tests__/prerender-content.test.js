import { describe, it, expect } from 'vitest';
import { spotBody, buoyBody, spotsIndexBody, escapeHtml } from '../../../prerender-content.js';

const spot = (id, name, latitude, longitude, extra = {}) => ({
  id, name, slug: name.toLowerCase().replace(/\W+/g, '-'), subregion_name: 'Santa Cruz',
  timezone: 'America/Los_Angeles', latitude, longitude, forecast: 'full', ...extra,
});
const spots = [
  spot(1, 'Steamer Lane', 36.951, -122.026),
  spot(2, 'Cowells', 36.962, -122.022),
  spot(3, 'Pleasure Point', 36.958, -121.97, { name: 'Pleasure Point & Co' }),
  spot(4, 'Malibu', 34.03, -118.68), // too far for Santa Cruz
];
const buoys = [
  { location_id: '46284', name: 'Station 46284  - Monterey Canyon Outer (285)', latitude: 36.77, longitude: -121.95 },
];

describe('prerendered bodies', () => {
  it('spot page: heading, coverage text, buoys and nearby spots as links', () => {
    const html = spotBody(spots[0], spots, buoys);
    expect(html).toContain('<h1>Steamer Lane</h1>');
    expect(html).toContain('Hourly forecast of swell height');
    expect(html).toContain('<a href="/location/46284">Buoy 46284 – Monterey Canyon Outer</a>');
    expect(html).toContain('<a href="/spot/cowells">Cowells</a>');
    expect(html).not.toContain('Steamer Lane</a>'); // not linked to itself
    expect(html).not.toContain('Malibu');
    expect(html).toContain('Pleasure Point &amp; Co'); // escaped
    expect(html).toContain('&lt;1 mi');
  });

  it('spot without NWS coverage says so', () => {
    const html = spotBody({ ...spots[0], forecast: null }, spots, buoys);
    expect(html).toContain('No National Weather Service wave forecast covers this spot.');
  });

  it('buoy page: label, NDBC link and nearby spots', () => {
    const html = buoyBody({ ...buoys[0], description: 'Waverider Buoy', url: 'https://www.ndbc.noaa.gov/station_page.php?station=46284' }, spots);
    expect(html).toContain('<h1>Buoy 46284 – Monterey Canyon Outer</h1>');
    expect(html).toContain('href="https://www.ndbc.noaa.gov/station_page.php?station=46284"');
    expect(html).toContain('<a href="/spot/steamer-lane">Steamer Lane</a>');
  });

  it('buoy far from any spot gets no nearby section', () => {
    expect(buoyBody({ location_id: '46246', name: 'Ocean Station PAPA', latitude: 50, longitude: -145 }, spots)).not.toContain('<section>');
  });

  it('spots index groups links by region', () => {
    const html = spotsIndexBody(spots);
    expect(html).toContain('<h2>Santa Cruz</h2>');
    expect(html.match(/<a href="\/spot\//g)).toHaveLength(4);
  });

  it('escapes HTML', () => {
    expect(escapeHtml('<a href="x">&</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&lt;/a&gt;');
  });
});
