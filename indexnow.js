/**
 * @file IndexNow: tells Bing and other IndexNow search engines which pages
 * changed since the last deploy. Used by prerender.js.
 */
import crypto from 'crypto';

/** Public by design; must match public/<key>.txt */
export const INDEXNOW_KEY = '84c2e602829de55dfd9258823c8483e3';
export const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/** Written to dist/ each build: { [path]: content hash } for every page */
export const MANIFEST_FILE = 'indexnow-manifest.json';

/** IndexNow's per-request limit */
const MAX_URLS_PER_REQUEST = 10_000;

/** Hash of a page's SEO content (title, description, static body); not the whole HTML, whose asset names change every build */
export const pageHash = (...parts) =>
  crypto.createHash('sha1').update(parts.join('\n')).digest('hex').slice(0, 16);

/** Paths that are new, changed, or gone since `previous` */
export const changedPaths = (previous, current) => [
  ...Object.keys(current).filter((p) => previous[p] !== current[p]),
  ...Object.keys(previous).filter((p) => !(p in current)),
];

/** The live site's manifest from the previous deploy; {} when there is none or it can't be read */
export const fetchPreviousManifest = async (siteUrl, fetchImpl = fetch) => {
  try {
    const res = await fetchImpl(`${siteUrl}/${MANIFEST_FILE}`, { signal: AbortSignal.timeout(15_000) });
    return res.ok ? await res.json() : {};
  } catch {
    return {};
  }
};

/**
 * POSTs `urls` to IndexNow in batches. Returns one { count, status } per batch;
 * status is the HTTP code, or the error message when the request failed.
 */
export const submitUrls = async (urls, siteUrl, fetchImpl = fetch) => {
  const host = new URL(siteUrl).host;
  const results = [];
  for (let i = 0; i < urls.length; i += MAX_URLS_PER_REQUEST) {
    const urlList = urls.slice(i, i + MAX_URLS_PER_REQUEST);
    try {
      const res = await fetchImpl(INDEXNOW_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({
          host,
          key: INDEXNOW_KEY,
          keyLocation: `${siteUrl}/${INDEXNOW_KEY}.txt`,
          urlList,
        }),
        signal: AbortSignal.timeout(30_000),
      });
      results.push({ count: urlList.length, status: res.status });
    } catch (error) {
      results.push({ count: urlList.length, status: error.message });
    }
  }
  return results;
};
