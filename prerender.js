import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, 'dist');
const TEMPLATE_PATH = path.join(DIST_DIR, 'index.html');
const BASE_URL = 'https://surfe-diem.com';
const API_BASE_URL = process.env.API_BASE_URL || 'https://api.surfe-diem.com/api/v1';

// Used for dynamic pages (spots/buoys) whose HTML shells are genuinely regenerated at each deploy.
// Static pages use hardcoded dates — only update these when content/SEO intent meaningfully changes.
const BUILD_DATE = new Date().toISOString().split('T')[0];

async function run() {
  if (!fs.existsSync(TEMPLATE_PATH)) {
    console.error('Build template index.html missing! Run vite build first.');
    process.exit(1);
  }

  const rawTemplate = fs.readFileSync(TEMPLATE_PATH, 'utf-8');

  try {
    console.log('Fetching slugs from API...');
    const [spotsRes, buoysRes] = await Promise.all([
      fetch(`${API_BASE_URL}/spots?limit=5000`).then(res => res.json()),
      fetch(`${API_BASE_URL}/locations?limit=5000`).then(res => res.json())
    ]);

    const spots = spotsRes;
    const buoys = buoysRes;

    const routes = [
      {
        path: '',
        title: 'Surfe Diem - Free Surf Conditions for the Community',
        desc: 'Real-time surf forecasting, ocean tracking tools, and live data telemetry.',
        lastmod: '2026-05-29',
      },
      {
        path: 'about',
        title: 'About Us | Surfe Diem',
        desc: 'Learn about the open-source community surf tools driving Surfe Diem.',
        lastmod: '2026-05-29',
      },
      {
        path: 'map',
        title: 'Global Surf Spot & Buoy Map | Surfe Diem',
        desc: 'Interactive live radar tracking map for tracking global ocean swells.',
        lastmod: '2026-05-29',
      },
      {
        path: 'spots',
        title: 'Surf Spots | Surfe Diem',
        desc: 'Browse 2,000+ surf spots with real-time conditions, forecasts, and wave data.',
        lastmod: '2026-05-29',
      },

      ...spots.map(spot => ({
        path: `spot/${spot.slug || spot.id}`,
        title: `${spot.name} Surf Forecast & Swell Conditions | Surfe Diem`,
        desc: `Real-time surf reports, wind arrays, wave telemetry, and tide forecasts for ${spot.name}. 100% free with no ads.`,
        lastmod: BUILD_DATE,
      })),

      ...buoys.map(buoy => ({
        path: `location/${buoy.location_id}`,
        title: `NOAA Buoy ${buoy.name || buoy.location_id} Marine Data | Surfe Diem`,
        desc: `Live offshore buoy wave periods, primary heights, and water temperature arrays for buoy station ${buoy.location_id}.`,
        lastmod: BUILD_DATE,
      }))
    ];

    console.log(`Compiling HTML shells for ${routes.length} static target endpoints...`);

    for (const route of routes) {
      const urlPath = route.path ? `/${route.path}` : '';
      const targetDir = route.path ? path.join(DIST_DIR, route.path) : DIST_DIR;

      if (route.path) {
        fs.mkdirSync(targetDir, { recursive: true });
      }

      const SEO_TAGS = `
    <title>${route.title}</title>
    <meta name="description" content="${route.desc}">
    <link rel="canonical" href="${BASE_URL}${urlPath}">
    <meta property="og:title" content="${route.title}">
    <meta property="og:description" content="${route.desc}">
    <meta property="og:url" content="${BASE_URL}${urlPath}">
    <meta property="og:type" content="website">
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:title" content="${route.title}">
    <meta property="twitter:description" content="${route.desc}">`;

      // Strip all pre-existing SEO tags from the template, then inject our own
      let html = rawTemplate
        .replace(/<title>.*?<\/title>/s, '')
        .replace(/<meta\s+name="description"[^>]*>/gi, '')
        .replace(/<meta\s+name="keywords"[^>]*>/gi, '')
        .replace(/<meta\s+name="robots"[^>]*>/gi, '')
        .replace(/<meta\s+property="og:[^"]*"[^>]*>/gi, '')
        .replace(/<meta\s+property="twitter:[^"]*"[^>]*>/gi, '')
        .replace(/<link\s+rel="canonical"[^>]*>/gi, '');
      html = html.replace('<head>', `<head>${SEO_TAGS}`);

      fs.writeFileSync(path.join(targetDir, 'index.html'), html);
    }

    console.log('Assembling sitemap...');
    const sitemapEntries = [
      '<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
      ...routes.map(route => {
        const urlPath = route.path ? `/${route.path}` : '';
        return `  <url>\n    <loc>${BASE_URL}${urlPath}</loc>\n    <lastmod>${route.lastmod}</lastmod>\n    <changefreq>daily</changefreq>\n  </url>`;
      }),
      '</urlset>'
    ].join('\n');

    fs.writeFileSync(path.join(DIST_DIR, 'sitemap.xml'), sitemapEntries);

    console.log(`SEO compilation complete. ${routes.length} routes pre-rendered. Sitemap written.`);
  } catch (error) {
    console.error('Prerender failed:', error);
    process.exit(1);
  }
}

run();
