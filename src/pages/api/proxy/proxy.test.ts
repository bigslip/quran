import { describe, it, expect, beforeEach } from 'vitest';
import type { NextApiRequest, NextApiResponse } from 'next';
import handler from './[...path]';
import { _resetStateForTesting, initializeLocalDataEngine } from '@/utils/localDataEngine';

function createMockReqRes(query: Record<string, any> = {}, url = '') {
  const req = {
    query,
    url,
    headers: {},
  } as unknown as NextApiRequest;

  const headers: Record<string, string> = {};
  const res = {
    statusCode: 200,
    headers,
    jsonData: null as any,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    setHeader(key: string, value: string) {
      headers[key.toLowerCase()] = value;
      return this;
    },
    json(data: any) {
      this.jsonData = data;
      return this;
    },
  } as unknown as NextApiResponse & { statusCode: number; headers: Record<string, string>; jsonData: any };

  return { req, res };
}

describe('API Proxy Handler (/api/proxy/[...path])', () => {
  beforeEach(async () => {
    await initializeLocalDataEngine();
  });

  it('serves chapters list with immutable caching headers for proxied content path', async () => {
    const { req, res } = createMockReqRes({
      path: ['content', 'api', 'qdc', 'chapters'],
      language: 'en',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.jsonData).toBeDefined();
    expect(res.jsonData.chapters).toHaveLength(114);
    expect(res.jsonData.chapters[0].id).toBe(1);
    expect(res.jsonData.chapters[0].name_simple).toBe('Al-Fatihah');
  });

  it('serves pages lookup when path is a single string or array', async () => {
    const { req, res } = createMockReqRes({
      path: ['content', 'api', 'qdc', 'pages', 'lookup'],
      mushaf: '2',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.jsonData).toBeDefined();
    expect(res.jsonData.pages).toBeDefined();
    expect(res.jsonData.total_page || res.jsonData.totalPage).toBe(604);
  });

  it('serves verses by page with requested words and translations', async () => {
    const { req, res } = createMockReqRes({
      path: ['content', 'api', 'qdc', 'verses', 'by_page', '1'],
      words: 'true',
      mushaf: '2',
      translations: '20',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
    expect(res.jsonData.verses).toHaveLength(7);
    expect(res.jsonData.verses[0].words).toBeDefined();
    expect(res.jsonData.verses[0].translations).toBeDefined();
    expect(res.jsonData.verses[0].translations[0].resource_id).toBe(20);
  });

  it('serves audio timestamps and files for reciter', async () => {
    const { req, res } = createMockReqRes({
      path: ['content', 'api', 'qdc', 'audio', 'reciters', '7', 'audio_files'],
      chapter: '1',
      segments: 'true',
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.audio_files).toBeDefined();
    expect(res.jsonData.audio_files[0].chapter_id).toBe(1);
  });

  it('serves translation resources list', async () => {
    const { req, res } = createMockReqRes({
      path: ['content', 'api', 'qdc', 'resources', 'translations'],
    });

    await handler(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.jsonData.translations).toBeDefined();
    expect(res.jsonData.translations.length).toBeGreaterThan(0);
  });

  it('returns 404 for unsupported or non-existent routes', async () => {
    const { req, res } = createMockReqRes({
      path: ['content', 'api', 'qdc', 'unknown_invalid_endpoint'],
    });

    await handler(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.jsonData.error).toBe('Resource not found');
  });

  it('safely handles concurrent cold-start initialization requests (mutex)', async () => {
    _resetStateForTesting();

    const requests = Array.from({ length: 15 }, (_, i) => {
      const page = (i % 5) + 1;
      const { req, res } = createMockReqRes({
        path: ['content', 'api', 'qdc', 'verses', 'by_page', String(page)],
        words: 'true',
      });
      return { req, res };
    });

    // Execute all 15 requests concurrently during cold start
    await Promise.all(requests.map(({ req, res }) => handler(req, res)));

    for (const { res } of requests) {
      expect(res.statusCode).toBe(200);
      expect(res.headers['cache-control']).toBe('public, max-age=31536000, immutable');
      expect(res.jsonData.verses).toBeDefined();
    }
  });
});
