import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  SITE_NAME,
  DEFAULT_OG_IMAGE,
  STATIC_PAGES,
  spotMeta,
  buoyMeta,
  spotPath,
  canonicalUrl,
  SITE_URL as BASE_URL,
} from './src/config/seo-meta.js';
import { escapeHtml, spotBody, buoyBody, spotsIndexBody } from './prerender-content.js';
import { MANIFEST_FILE, pageHash, changedPaths, fetchPreviousManifest, submitUrls } from './indexnow.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.surfe-diem.com/api/v1';
/** Set to "true" on the production build only; other builds never ping IndexNow */
const INDEXNOW_ENABLED = process.env.INDEXNOW_ENABLED === 'true';

/** Sitemap lastmod for spot and buoy pages, which are regenerated every deploy */
const BUILD_DATE = new Date().toISOString().split('T')[0];

/** Sitemap lastmod per static page; update a date only when that page's content changes */
const STATIC_LASTMOD = {
  home: '2026-10-08',
  about: '2026-05-29',
  map: '2026-05-29',
  spots: '2026-10-10',
};

/**
 * Head tags for one page. data-rh marks them as react-helmet-async's, so the
 * client replaces them instead of adding duplicates.
 */
const seoTags = (route) => {
  const url = escapeHtml(canonicalUrl(route.path));
  const title = escapeHtml(route.title);
  const desc = escapeHtml(route.description);
  return `
    <meta charset="UTF-8" />
    <title>${title}</title>
    <meta name="description" content="${desc}" data-rh="true">
    <link rel="canonical" href="${url}" data-rh="true">
    <meta property="og:site_name" content="${SITE_NAME}" data-rh="true">
    <meta property="og:type" content="website" data-rh="true">
    <meta property="og:title" content="${title}" data-rh="true">
    <meta property="og:description" content="${desc}" data-rh="true">
    <meta property="og:url" content="${url}" data-rh="true">
    <meta property="og:image" content="${DEFAULT_OG_IMAGE}" data-rh="true">
    <meta name="twitter:card" content="summary_large_image" data-rh="true">
    <meta name="twitter:title" content="${title}" data-rh="true">
    <meta name="twitter:description" content="${desc}" data-rh="true">
    <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" data-rh="true">`;
};

/** Page that sends an old URL to `target`: instant meta refresh plus a canonical link */
const redirectPage = (target) => {
  const url = escapeHtml(canonicalUrl(target));
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Redirecting… | ${SITE_NAME}</title>
    <link rel="canonical" href="${url}">
    <meta http-equiv="refresh" content="0; url=${url}">
  </head>
  <body>
    <a href="${url}">${url}</a>
  </body>
</html>
`;
};

const writePage = (routePath, html) => {
  const targetDir = routePath ? path.join(DIST_DIR, routePath) : DIST_DIR;
  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), html);
};

/** Submits pages changed since the live deploy. Never fails the build: problems are logged. */
async function notifyIndexNow(manifest) {
  const previous = await fetchPreviousManifest(BASE_URL);
  const urls = changedPaths(previous, manifest).map(canonicalUrl);
  if (urls.length === 0) {
    console.log('IndexNow: no changed pages');
    return;
  }
  const results = await submitUrls(urls, BASE_URL);
  for (const { count, status } of results) {
    // 200/202 accepted; 4xx means the key file or URL list was rejected
    const ok = status === 200 || status === 202;
    (ok ? console.log : console.warn)(`IndexNow: ${count} URLs → ${status}`);
  }
}

async function run() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('Build template index.html missing! Run vite build first.');
    process.exit(1);
  }

  const rawTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  // Strip the template's own charset and SEO tags; seoTags() puts them back, charset first
  const template = rawTemplate
    .replace(/<meta\s+charset=[^>]*>/i, '')
    .replace(/<title>.*?<\/title>/s, '')
    .replace(/<meta\s+name="(description|keywords|robots)"[^>]*>/gi, '')
    .replace(/<meta\s+(property|name)="(og|twitter):[^"]*"[^>]*>/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>/gi, '');

  try {
    console.log('Fetching spots and buoys from API...');
    const [spotsGeo, buoysGeo] = await Promise.all([
      fetch(`${API_BASE_URL}/spots/geojson`).then(res => res.json()),
      fetch(`${API_BASE_URL}/locations/geojson`).then(res => res.json())
    ]);

    // Spot titles and text need the API's `forecast` coverage field
    if (!spotsGeo.features?.length || !('forecast' in spotsGeo.features[0].properties)) {
      throw new Error('/spots/geojson has no `forecast` property; deploy the API first');
    }
    const spots = spotsGeo.features.map(({ geometry, properties }) => ({
      ...properties,
      longitude: Number(geometry.coordinates[0]),
      latitude: Number(geometry.coordinates[1]),
    }));
    const buoys = buoysGeo.features.map(({ geometry, properties }) => ({
      ...properties,
      location_id: properties.id,
      longitude: Number(geometry.coordinates[0]),
      latitude: Number(geometry.coordinates[1]),
    }));

    const staticBodies = { spots: () => spotsIndexBody(spots) };
    const allRoutes = [
      ...Object.entries(STATIC_PAGES).map(([key, page]) => ({ ...page, lastmod: STATIC_LASTMOD[key], body: staticBodies[key] })),
      ...spots.map(spot => ({ ...spotMeta(spot), lastmod: BUILD_DATE, body: () => spotBody(spot, spots, buoys) })),
      ...buoys.map(buoy => ({ ...buoyMeta(buoy), lastmod: BUILD_DATE, body: () => buoyBody(buoy, spots) })),
    ];
    // One route per path; duplicate spot rows can share a slug
    const seen = new Set();
    const routes = allRoutes.filter(route => !seen.has(route.path) && seen.add(route.path));
    if (routes.length < allRoutes.length) {
      console.warn(`Skipped ${allRoutes.length - routes.length} duplicate route path(s)`);
    }

    console.log(`Compiling HTML shells for ${routes.length} routes...`);
    const manifest = {};
    for (const route of routes) {
      const body = route.body ? route.body() : '';
      manifest[route.path] = pageHash(route.title, route.description, body);
      writePage(
        route.path,
        template
          .replace('<head>', `<head>${seoTags(route)}`)
          .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
      );
    }

    const redirects = [
      { from: 'home', to: '' },
      ...spots
        .filter(spot => spot.slug && spot.slug !== String(spot.id))
        .map(spot => ({ from: `spot/${spot.id}`, to: spotPath(spot) })),
    ];
    // Never replace a real page with a redirect (an all-digit slug can equal another spot's id)
    const routePaths = new Set(routes.map(route => route.path));
    for (const { from, to } of redirects) {
      if (routePaths.has(from)) {
        console.warn(`Skipped redirect /${from} → /${to}: a page already lives there`);
        continue;
      }
      writePage(from, redirectPage(to));
    }

    console.log('Assembling sitemap...');
    const sitemapEntries = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...routes.map(route =>
        `  <url>\n    <loc>${escapeHtml(canonicalUrl(route.path))}</loc>\n    <lastmod>${route.lastmod}</lastmod>\n  </url>`
      ),
      '</urlset>'
    ].join('\n');

    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapEntries);
    fs.writeFileSync(path.join(DIST_DIR, MANIFEST_FILE), JSON.stringify(manifest));

    console.log(`SEO compilation complete. ${routes.length} routes pre-rendered, ${redirects.length} redirects. Sitemap written.`);

    if (INDEXNOW_ENABLED) {
      await notifyIndexNow(manifest);
    }
  } catch (error) {
    console.error('Prerender failed:', error);
    process.exit(1);
  }
}

run();
