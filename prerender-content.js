/**
 * @file Static page bodies written into #root at build time; React's createRoot
 * replaces them on load. Each section matches a section of the React page and
 * uses the same config/seo-meta helpers.
 */
import {
  NEARBY_TEXT,
  NEARBY_SPOTS_LIMIT,
  NEARBY_BUOYS_LIMIT,
  buoyLabel,
  buoyPath,
  spotPath,
  cleanName,
  coverageText,
  formatMiles,
  nearestTo,
} from './src/config/seo-meta.js';

export const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

/** Colors from config/theme.ts. body:has() stops applying once React replaces the static content. */
const STYLE = `<style>
.sd-static{max-width:760px;margin:0 auto;padding:32px 16px 48px;font-family:Inter,system-ui,-apple-system,"Segoe UI",sans-serif;color:#082834;line-height:1.5}
.sd-static a{color:#006978}
.sd-static nav{font-size:.875rem}
.sd-static h1{font-size:2.25rem;line-height:1.1;margin:.4em 0 .2em}
.sd-static h2{font-size:1.125rem;margin:1.75em 0 .25em}
.sd-static h3{font-size:.75rem;letter-spacing:.16em;margin:1.25em 0 .25em;color:#7a98a4}
.sd-static ul{list-style:none;padding:0;margin:0}
.sd-static li{display:flex;justify-content:space-between;gap:16px;padding:6px 0;border-bottom:1px solid rgba(0,90,110,.08)}
.sd-static .sd-muted{color:#5b7079;font-size:.875rem}
body:has(.sd-static){background:#eef7fb}
@media (prefers-color-scheme:dark){
body:has(.sd-static){background:#06161d}
.sd-static{color:#e6edf3}.sd-static a{color:#1ed6e6}.sd-static .sd-muted{color:#9fb3b9}
.sd-static li{border-color:rgba(255,255,255,.08)}
}
</style>`;

const page = (inner) => `${STYLE}<main class="sd-static">${inner}</main>`;

const placeList = (heading, places) =>
  places.length === 0
    ? ''
    : `<h3>${escapeHtml(heading)}</h3><ul>${places
        .map(
          (p) =>
            `<li><a href="/${escapeHtml(p.path)}">${escapeHtml(p.label)}</a><span class="sd-muted">${escapeHtml(formatMiles(p.distance))}</span></li>`
        )
        .join('')}</ul>`;

const nearbySection = (title, intro, groups) => {
  const lists = groups.map((g) => placeList(g.heading, g.places)).join('');
  if (!intro && !lists) return '';
  return `<section><h2>${escapeHtml(title)}</h2><p class="sd-muted">${escapeHtml(NEARBY_TEXT.subtitle)}</p>${
    intro ? `<p>${escapeHtml(intro)}</p>` : ''
  }${lists}</section>`;
};

const spotPlaces = (spots) =>
  spots.map((s) => ({ label: cleanName(s.name), path: spotPath(s), distance: s.distance }));

export const spotBody = (spot, spots, buoys) => {
  const region = cleanName(spot.subregion_name);
  const nearbyBuoys = nearestTo(buoys, spot.latitude, spot.longitude, {
    limit: NEARBY_BUOYS_LIMIT,
    keyOf: (b) => b.location_id,
  });
  const nearbySpots = nearestTo(spots, spot.latitude, spot.longitude, {
    limit: NEARBY_SPOTS_LIMIT,
    excludeKey: spot.id,
  });
  return page(
    `<nav aria-label="Breadcrumb"><a href="/">Surfe Diem</a> › <a href="/spots">Surf spots</a>${
      region ? ` › ${escapeHtml(region)}` : ''
    }</nav>` +
      `<h1>${escapeHtml(cleanName(spot.name))}</h1>` +
      `<p class="sd-muted">${[
        region,
        `${spot.latitude.toFixed(3)}, ${spot.longitude.toFixed(3)}`,
        spot.timezone,
      ]
        .filter(Boolean)
        .map(escapeHtml)
        .join(' · ')}</p>` +
      nearbySection(NEARBY_TEXT.spotTitle, coverageText(spot.forecast), [
        {
          heading: NEARBY_TEXT.buoys,
          places: nearbyBuoys.map((b) => ({ label: buoyLabel(b), path: buoyPath(b), distance: b.distance })),
        },
        { heading: NEARBY_TEXT.spots, places: spotPlaces(nearbySpots) },
      ])
  );
};

export const buoyBody = (buoy, spots) => {
  const nearbySpots = nearestTo(spots, buoy.latitude, buoy.longitude, { limit: NEARBY_SPOTS_LIMIT });
  const facts = [buoy.description, buoy.location ? String(buoy.location).split('(')[0].trim() : null].filter(Boolean);
  return page(
    `<nav aria-label="Breadcrumb"><a href="/">Surfe Diem</a> › <a href="/map">Map</a></nav>` +
      `<h1>${escapeHtml(buoyLabel(buoy))}</h1>` +
      (facts.length ? `<p class="sd-muted">${facts.map(escapeHtml).join(' · ')}</p>` : '') +
      (buoy.url
        ? `<p>Station page at NOAA's National Data Buoy Center: <a href="${escapeHtml(buoy.url)}" rel="noopener">${escapeHtml(buoy.url)}</a></p>`
        : '') +
      nearbySection(NEARBY_TEXT.buoyTitle, null, [{ heading: NEARBY_TEXT.spots, places: spotPlaces(nearbySpots) }])
  );
};

/** Spot links grouped by subregion in API order, like the /spots page */
export const spotsIndexBody = (spots) => {
  const groups = new Map();
  for (const spot of spots) {
    const region = cleanName(spot.subregion_name);
    if (!groups.has(region)) groups.set(region, []);
    groups.get(region).push(spot);
  }
  const sections = [...groups]
    .map(
      ([region, list]) =>
        `<section><h2>${escapeHtml(region)}</h2><ul>${list
          .map((s) => `<li><a href="/${escapeHtml(spotPath(s))}">${escapeHtml(cleanName(s.name))}</a></li>`)
          .join('')}</ul></section>`
    )
    .join('');
  return page(`<h1>Surf Spots</h1><p class="sd-muted">${spots.length} spots across all regions</p>${sections}`);
};
