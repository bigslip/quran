/* eslint-disable react-func/max-lines-per-function */
import { NextRequest } from 'next/server';
import { describe, it, expect } from 'vitest';

import middleware from './middleware';

describe('Edge Middleware', () => {
  describe('_next/data requests', () => {
    it('allows _next/data URLs to pass through for client-side page transitions', () => {
      const req = new NextRequest('https://quran.com/_next/data/build123/en/surah/1.json');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-next')).toBe('1');
    });

    it('allows _next/data in subpath to pass through', () => {
      const req = new NextRequest('https://quran.com/api/_next/data/test');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-next')).toBe('1');
    });
  });

  describe('Case-insensitive route redirection', () => {
    it('redirects uppercase /Ramadan2026 to lowercase /ramadan2026', () => {
      const req = new NextRequest('https://quran.com/Ramadan2026');
      const res = middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('https://quran.com/ramadan2026');
    });

    it('redirects uppercase /RAMADANCHALLENGE to lowercase /ramadanchallenge', () => {
      const req = new NextRequest('https://quran.com/RAMADANCHALLENGE');
      const res = middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe('https://quran.com/ramadanchallenge');
    });

    it('redirects mixed-case nested routes and preserves query parameters', () => {
      const req = new NextRequest('https://quran.com/Ramadan2026/day/1?ref=banner&source=home');
      const res = middleware(req);

      expect(res.status).toBe(307);
      expect(res.headers.get('location')).toBe(
        'https://quran.com/ramadan2026/day/1?ref=banner&source=home',
      );
    });

    it('allows lowercase /ramadan2026 to pass through without redirect', () => {
      const req = new NextRequest('https://quran.com/ramadan2026');
      const res = middleware(req);

      // NextResponse.next() returns a response with the x-middleware-next header set to '1'
      expect(res.headers.get('x-middleware-next')).toBe('1');
      expect(res.headers.get('location')).toBeNull();
    });

    it('allows lowercase /ramadanchallenge with query params to pass through without redirect', () => {
      const req = new NextRequest('https://quran.com/ramadanchallenge?filter=all');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-next')).toBe('1');
      expect(res.headers.get('location')).toBeNull();
    });
  });

  describe('Unrelated routes passthrough', () => {
    it('passes through /surah/1 unchanged', () => {
      const req = new NextRequest('https://quran.com/surah/1');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-next')).toBe('1');
      expect(res.headers.get('location')).toBeNull();
    });

    it('passes through /search with search query', () => {
      const req = new NextRequest('https://quran.com/search?query=Allah&page=1');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-next')).toBe('1');
      expect(res.headers.get('location')).toBeNull();
    });

    it('passes through homepage /', () => {
      const req = new NextRequest('https://quran.com/');
      const res = middleware(req);

      expect(res.headers.get('x-middleware-next')).toBe('1');
      expect(res.headers.get('location')).toBeNull();
    });
  });
});
