import { describe, it, expect, vi } from 'vitest';
import {
  INDEXNOW_KEY,
  INDEXNOW_ENDPOINT,
  pageHash,
  changedPaths,
  fetchPreviousManifest,
  submitUrls,
} from '../../../indexnow.js';

describe('IndexNow change detection', () => {
  it('hashes the same content the same way', () => {
    expect(pageHash('Title', 'Desc', '<main>x</main>')).toBe(pageHash('Title', 'Desc', '<main>x</main>'));
    expect(pageHash('Title', 'Desc', '<main>x</main>')).not.toBe(pageHash('Title', 'Desc', '<main>y</main>'));
  });

  it('lists new, changed and removed paths, not unchanged ones', () => {
    const previous = { 'spot/a': '1', 'spot/b': '2', 'spot/gone': '3' };
    const current = { 'spot/a': '1', 'spot/b': '9', 'spot/new': '4' };
    expect(changedPaths(previous, current).sort()).toEqual(['spot/b', 'spot/gone', 'spot/new']);
    expect(changedPaths({}, current).sort()).toEqual(['spot/a', 'spot/b', 'spot/new']);
  });
});

describe('fetchPreviousManifest', () => {
  it('returns the live manifest', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ 'spot/a': '1' }) });
    expect(await fetchPreviousManifest('https://surfe-diem.com', fetchImpl)).toEqual({ 'spot/a': '1' });
    expect(fetchImpl.mock.calls[0][0]).toBe('https://surfe-diem.com/indexnow-manifest.json');
  });

  it('returns {} when there is none (first deploy) or the request fails', async () => {
    expect(await fetchPreviousManifest('https://surfe-diem.com', vi.fn().mockResolvedValue({ ok: false }))).toEqual({});
    expect(await fetchPreviousManifest('https://surfe-diem.com', vi.fn().mockRejectedValue(new Error('down')))).toEqual({});
  });
});

describe('submitUrls', () => {
  it('posts the key, key location and URLs for the host', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 202 });
    const results = await submitUrls(['https://surfe-diem.com/spot/a'], 'https://surfe-diem.com', fetchImpl);

    expect(results).toEqual([{ count: 1, status: 202 }]);
    const [url, init] = fetchImpl.mock.calls[0];
    expect(url).toBe(INDEXNOW_ENDPOINT);
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body)).toEqual({
      host: 'surfe-diem.com',
      key: INDEXNOW_KEY,
      keyLocation: `https://surfe-diem.com/${INDEXNOW_KEY}.txt`,
      urlList: ['https://surfe-diem.com/spot/a'],
    });
  });

  it('splits more than 10,000 URLs into batches', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ status: 200 });
    const urls = Array.from({ length: 10_001 }, (_, i) => `https://surfe-diem.com/spot/${i}`);
    const results = await submitUrls(urls, 'https://surfe-diem.com', fetchImpl);
    expect(results.map((r) => r.count)).toEqual([10_000, 1]);
  });

  it('reports a failed request instead of throwing', async () => {
    const results = await submitUrls(['https://surfe-diem.com/'], 'https://surfe-diem.com', vi.fn().mockRejectedValue(new Error('timeout')));
    expect(results).toEqual([{ count: 1, status: 'timeout' }]);
  });
});
