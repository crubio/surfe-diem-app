// Page titles, descriptions and canonical URLs, shared by prerender.js (plain
// Node at build time) and the <SEO> component (client). Plain JS so Node can
// import it without a TypeScript step; types live in seo-meta.d.ts.

export const SITE_URL = 'https://surfe-diem.com';
export const SITE_NAME = 'Surfe Diem';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

export const STATIC_PAGES = {
  home: {
    path: '',
    title: 'Surfe Diem - Free Surf Conditions for the Community',
    description: 'Real-time surf forecasting, ocean tracking tools, and live data telemetry.',
  },
  about: {
    path: 'about',
    title: 'About Us | Surfe Diem',
    description: 'Learn about the open-source community surf tools driving Surfe Diem.',
  },
  map: {
    path: 'map',
    title: 'Global Surf Spot & Buoy Map | Surfe Diem',
    description: 'Interactive live radar tracking map for tracking global ocean swells.',
  },
  spots: {
    path: 'spots',
    title: 'Surf Spots | Surfe Diem',
    description: 'Browse 2,000+ surf spots with real-time conditions, forecasts, and wave data.',
  },
};

// Some spot names carry stray whitespace from the source data
export const cleanName = (name) => String(name ?? '').replace(/\s+/g, ' ').trim();

export const spotPath = (spot) => `spot/${spot.slug || spot.id}`;
export const buoyPath = (buoy) => `location/${buoy.location_id}`;

export const spotMeta = (spot) => {
  const name = cleanName(spot.name);
  return {
    path: spotPath(spot),
    title: `${name} Surf Forecast & Swell Conditions | Surfe Diem`,
    description: `Real-time surf reports, wind arrays, wave telemetry, and tide forecasts for ${name}. 100% free with no ads.`,
  };
};

export const buoyMeta = (buoy) => {
  const name = cleanName(buoy.name) || buoy.location_id;
  return {
    path: buoyPath(buoy),
    title: `NOAA Buoy ${name} Marine Data | Surfe Diem`,
    description: `Live offshore buoy wave periods, primary heights, and water temperature arrays for buoy station ${buoy.location_id}.`,
  };
};

export const canonicalUrl = (path) => (path ? `${SITE_URL}/${path}` : SITE_URL);
