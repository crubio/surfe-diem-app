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
} from './src/config/seo-meta.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.surfe-diem.com/api/v1';

// Used for dynamic pages (spots/buoys) whose HTML shells are genuinely regenerated at each deploy.
// Static pages use hardcoded dates — only update these when content/SEO intent meaningfully changes.
const BUILD_DATE = new Date().toISOString().split('T')[0];
const STATIC_LASTMOD = {
  home: '2026-10-08',
  about: '2026-05-29',
  map: '2026-05-29',
  spots: '2026-10-08',
};

const escapeHtml = (value) =>
  String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

// data-rh marks the tags as react-helmet-async's, so the client replaces them
// instead of adding duplicates once the page renders
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

// Old /spot/<id> links (still in Google's index) land on the slug page.
// Google treats an instant meta refresh like a 301.
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
    console.log('Fetching slugs from API...');
    const [spots, buoys] = await Promise.all([
      fetch(`${API_BASE_URL}/spots?limit=5000`).then(res => res.json()),
      fetch(`${API_BASE_URL}/locations?limit=5000`).then(res => res.json())
    ]);

    const allRoutes = [
      ...Object.entries(STATIC_PAGES).map(([key, page]) => ({ ...page, lastmod: STATIC_LASTMOD[key] })),
      ...spots.map(spot => ({ ...spotMeta(spot), lastmod: BUILD_DATE })),
      ...buoys.map(buoy => ({ ...buoyMeta(buoy), lastmod: BUILD_DATE })),
    ];
    // Duplicate spot rows can share a slug; keep the first so the sitemap lists each URL once
    const seen = new Set();
    const routes = allRoutes.filter(route => !seen.has(route.path) && seen.add(route.path));
    if (routes.length < allRoutes.length) {
      console.warn(`Skipped ${allRoutes.length - routes.length} duplicate route path(s)`);
    }

    console.log(`Compiling HTML shells for ${routes.length} routes...`);
    for (const route of routes) {
      writePage(route.path, template.replace('<head>', `<head>${seoTags(route)}`));
    }

    const redirects = [
      { from: 'home', to: '' },
      ...spots
        .filter(spot => spot.slug && spot.slug !== String(spot.id))
        .map(spot => ({ from: `spot/${spot.id}`, to: spotPath(spot) })),
    ];
    for (const { from, to } of redirects) {
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

    console.log(`SEO compilation complete. ${routes.length} routes pre-rendered, ${redirects.length} redirects. Sitemap written.`);
  } catch (error) {
    console.error('Prerender failed:', error);
    process.exit(1);
  }
}

run();
