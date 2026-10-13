/**
 * @file Page titles, descriptions, canonical URLs and "nearby" helpers, shared
 * by prerender.js (Node, build time) and the client. Plain JS so Node can
 * import it directly; types are in seo-meta.d.ts.
 */

export const SITE_URL = 'https://surfe-diem.com';
export const SITE_NAME = 'Surfe Diem';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.jpg`;

/** Same limits as the API's find_closest routes, so build-time lists match what the page fetches */
export const NEARBY_RADIUS_MI = 100;
export const NEARBY_SPOTS_LIMIT = 8;
export const NEARBY_BUOYS_LIMIT = 3;

/** Headings for the "nearby" section, shared by the static HTML and the page */
export const NEARBY_TEXT = {
  spotTitle: 'Around this spot',
  buoyTitle: 'Around this buoy',
  subtitle: `Within ${NEARBY_RADIUS_MI} miles`,
  buoys: 'Nearest NOAA buoys',
  spots: 'Nearby surf spots',
};

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

/** Collapses and trims whitespace ("Jug Handle State Beach " → "Jug Handle State Beach") */
export const cleanName = (name) => String(name ?? '').replace(/\s+/g, ' ').trim();

export const spotPath = (spot) => `spot/${spot.slug || spot.id}`;
export const buoyPath = (buoy) => `location/${buoy.location_id}`;
export const canonicalUrl = (path) => (path ? `${SITE_URL}/${path}` : SITE_URL);

/**
 * Title and text per NWS coverage level ('full' | 'partial' | null from the
 * API). Each claim holds for every spot at that level.
 */
const COVERAGE = {
  full: {
    title: 'Surf Report & Forecast',
    description: 'hourly NOAA swell height, period and direction, plus wind',
    text: 'Hourly forecast of swell height, period and direction, and wind, from the National Weather Service (NOAA).',
  },
  partial: {
    title: 'Surf Report & Forecast',
    description: 'hourly NOAA wave height and wind',
    text: "Hourly forecast of wave height and wind from the National Weather Service (NOAA). NWS doesn't split the waves into separate swells along this stretch of coast.",
  },
  none: {
    title: 'Surf Spot',
    description: null,
    text: 'No National Weather Service wave forecast covers this spot. When a nearby NOAA buoy is reporting, this page shows its latest reading.',
  },
};

const coverageFor = (forecast) => COVERAGE[forecast] ?? COVERAGE.none;

export const coverageText = (forecast) => coverageFor(forecast).text;

export const spotMeta = (spot) => {
  const name = cleanName(spot.name);
  const region = cleanName(spot.subregion_name);
  const coverage = coverageFor(spot.forecast);
  return {
    path: spotPath(spot),
    title: `${name} ${coverage.title}${region ? ` – ${region}` : ''} | Surfe Diem`,
    description: coverage.description
      ? `${name} surf report and forecast${region ? ` for ${region}` : ''}: ${coverage.description}. Free, no ads.`
      : `${name} surf spot${region ? ` in ${region}` : ''}: location, map and nearby surf spots. Free, no ads.`,
  };
};

/**
 * Place part of a buoy name: "Station 46265  - Nome, AK (241)" → "Nome, AK".
 * Names without the "Station <id> -" prefix are returned trimmed.
 */
export const buoyPlace = (buoy) => {
  const name = cleanName(buoy.name);
  const match = name.match(/^Station\s+\S+\s*-?\s*(.*)$/i);
  const place = match ? match[1] : name;
  return place
    .replace(/\s*-?\s*\(\d+\)\s*$/, '') // trailing CDIP number "(241)"
    .replace(/\s*-\s*$/, '')
    .trim();
};

export const buoyLabel = (buoy) => {
  const place = buoyPlace(buoy);
  return place ? `Buoy ${buoy.location_id} – ${place}` : `Buoy ${buoy.location_id}`;
};

export const buoyMeta = (buoy) => {
  const place = buoyPlace(buoy);
  const id = buoy.location_id;
  return {
    path: buoyPath(buoy),
    title: `NOAA Buoy ${id}${place ? ` – ${place}` : ''} Marine Data | Surfe Diem`,
    description: `Latest readings from NOAA buoy ${id}${place ? ` (${place})` : ''}: wave height, period and water temperature where the station reports them. Free, no ads.`,
  };
};

const EARTH_RADIUS_MI = 3958.8;
const toRad = (deg) => (deg * Math.PI) / 180;

export const milesBetween = (lat1, lng1, lat2, lng2) => {
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_MI * Math.asin(Math.sqrt(a));
};

export const formatMiles = (miles) => (miles < 1 ? '<1 mi' : `${Math.round(miles)} mi`);

/**
 * Places within NEARBY_RADIUS_MI of a point, nearest first, each with `distance` (mi).
 * Items need numeric latitude/longitude; `excludeKey` drops the place itself.
 */
export const nearestTo = (items, lat, lng, { limit, keyOf = (item) => item.id, excludeKey } = {}) =>
  items
    .filter((item) => keyOf(item) !== excludeKey)
    .map((item) => ({ ...item, distance: milesBetween(lat, lng, item.latitude, item.longitude) }))
    .filter((item) => item.distance < NEARBY_RADIUS_MI)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, limit);
