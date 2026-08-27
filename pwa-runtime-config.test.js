/* eslint-disable no-global-assign */
/* eslint-disable max-lines */
/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import runtimeCaching from './pwa-runtime-config.js';

describe('PWA Runtime Caching Configuration (Workbox)', () => {
  const originalSelf = global.self;

  beforeEach(() => {
    // Ensure mock self.origin is set for function-based urlPattern tests
    if (typeof global.self === 'undefined') {
      global.self = { origin: 'https://quran.com' };
    } else {
      global.self.origin = 'https://quran.com';
    }
  });

  afterEach(() => {
    global.self = originalSelf;
  });

  it('exports an array of valid Workbox runtime caching entries', () => {
    expect(Array.isArray(runtimeCaching)).toBe(true);
    expect(runtimeCaching.length).toBeGreaterThan(0);

    const validHandlers = [
      'CacheFirst',
      'StaleWhileRevalidate',
      'NetworkFirst',
      'NetworkOnly',
      'CacheOnly',
    ];

    runtimeCaching.forEach((entry) => {
      expect(entry).toHaveProperty('urlPattern');
      const isRegex = entry.urlPattern instanceof RegExp;
      const isFunction = typeof entry.urlPattern === 'function';
      expect(isRegex || isFunction).toBe(true);

      expect(entry).toHaveProperty('handler');
      expect(validHandlers).toContain(entry.handler);

      expect(entry).toHaveProperty('options');
      expect(typeof entry.options).toBe('object');
      expect(entry.options).toHaveProperty('cacheName');
      expect(typeof entry.options.cacheName).toBe('string');
    });
  });

  describe('Google Fonts caching strategies', () => {
    it('caches gstatic webfonts using CacheFirst with 1-year expiration', () => {
      const fontWebfontEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'google-fonts-webfonts',
      );
      expect(fontWebfontEntry).toBeDefined();
      expect(fontWebfontEntry.handler).toBe('CacheFirst');
      expect(
        fontWebfontEntry.urlPattern.test('https://fonts.gstatic.com/s/inter/v12/abc.woff2'),
      ).toBe(true);
      expect(
        fontWebfontEntry.urlPattern.test('https://other.gstatic.com/s/inter/v12/abc.woff2'),
      ).toBe(false);
      expect(fontWebfontEntry.options.expiration).toBeDefined();
      expect(fontWebfontEntry.options.expiration.maxAgeSeconds).toBe(365 * 24 * 60 * 60);
      expect(fontWebfontEntry.options.expiration.maxEntries).toBe(4);
    });

    it('caches googleapis stylesheets using StaleWhileRevalidate with 7-day expiration', () => {
      const fontStyleEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'google-fonts-stylesheets',
      );
      expect(fontStyleEntry).toBeDefined();
      expect(fontStyleEntry.handler).toBe('StaleWhileRevalidate');
      expect(fontStyleEntry.urlPattern.test('https://fonts.googleapis.com/css2?family=Amiri')).toBe(
        true,
      );
      expect(fontStyleEntry.urlPattern.test('https://other.googleapis.com/css2?family=Amiri')).toBe(
        false,
      );
      expect(fontStyleEntry.options.expiration).toBeDefined();
      expect(fontStyleEntry.options.expiration.maxAgeSeconds).toBe(7 * 24 * 60 * 60);
      expect(fontStyleEntry.options.expiration.maxEntries).toBe(4);
    });
  });

  describe('Static asset caching strategies', () => {
    it('caches static image assets (jpg, png, svg, webp, etc.) with StaleWhileRevalidate and 24h TTL', () => {
      const imageEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'static-image-assets',
      );
      expect(imageEntry).toBeDefined();
      expect(imageEntry.handler).toBe('StaleWhileRevalidate');
      expect(imageEntry.urlPattern.test('https://quran.com/images/logo.png')).toBe(true);
      expect(imageEntry.urlPattern.test('/assets/bg.jpg')).toBe(true);
      expect(imageEntry.urlPattern.test('/icons/favicon.ico')).toBe(true);
      expect(imageEntry.urlPattern.test('/images/art.svg')).toBe(true);
      expect(imageEntry.urlPattern.test('/images/photo.webp')).toBe(true);
      expect(imageEntry.urlPattern.test('/images/anim.gif')).toBe(true);
      expect(imageEntry.urlPattern.test('/audio/recitation.mp3')).toBe(false);
      expect(imageEntry.options.expiration.maxEntries).toBe(64);
      expect(imageEntry.options.expiration.maxAgeSeconds).toBe(24 * 60 * 60);
    });

    it('caches next/image optimized images with StaleWhileRevalidate and 24h TTL', () => {
      const nextImageEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'next-image',
      );
      expect(nextImageEntry).toBeDefined();
      expect(nextImageEntry.handler).toBe('StaleWhileRevalidate');
      expect(
        nextImageEntry.urlPattern.test('/_next/image?url=%2Fimages%2Flogo.png&w=64&q=75'),
      ).toBe(true);
      expect(nextImageEntry.options.expiration.maxEntries).toBe(64);
      expect(nextImageEntry.options.expiration.maxAgeSeconds).toBe(24 * 60 * 60);
    });

    it('caches static fonts with StaleWhileRevalidate and 7-day TTL', () => {
      const fontEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'static-font-assets',
      );
      expect(fontEntry).toBeDefined();
      expect(fontEntry.handler).toBe('StaleWhileRevalidate');
      expect(fontEntry.urlPattern.test('/fonts/uthmanic_hafs.woff2')).toBe(true);
      expect(fontEntry.urlPattern.test('/fonts/indopak.ttf')).toBe(true);
      expect(fontEntry.urlPattern.test('/fonts/quran.eot')).toBe(true);
      expect(fontEntry.urlPattern.test('/fonts/style.font.css')).toBe(true);
      expect(fontEntry.options.expiration.maxAgeSeconds).toBe(7 * 24 * 60 * 60);
    });

    it('caches static video assets with CacheFirst and range requests enabled', () => {
      const videoEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'static-video-assets',
      );
      expect(videoEntry).toBeDefined();
      expect(videoEntry.handler).toBe('CacheFirst');
      expect(videoEntry.urlPattern.test('/videos/intro.mp4')).toBe(true);
      expect(videoEntry.options.rangeRequests).toBe(true);
      expect(videoEntry.options.expiration.maxAgeSeconds).toBe(24 * 60 * 60);
    });

    it('caches JS and CSS static bundles with StaleWhileRevalidate', () => {
      const jsEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'static-js-assets',
      );
      const cssEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'static-style-assets',
      );
      expect(jsEntry).toBeDefined();
      expect(jsEntry.handler).toBe('StaleWhileRevalidate');
      expect(jsEntry.urlPattern.test('/static/chunks/main.js')).toBe(true);

      expect(cssEntry).toBeDefined();
      expect(cssEntry.handler).toBe('StaleWhileRevalidate');
      expect(cssEntry.urlPattern.test('/static/css/styles.css')).toBe(true);
    });

    it('caches Next.js JSON data routes with StaleWhileRevalidate', () => {
      const nextDataEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'next-data',
      );
      expect(nextDataEntry).toBeDefined();
      expect(nextDataEntry.handler).toBe('StaleWhileRevalidate');
      expect(nextDataEntry.urlPattern.test('/_next/data/build-id/en/surah/1.json')).toBe(true);
    });

    it('caches static data assets (json, xml, csv) with NetworkFirst', () => {
      const dataEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'static-data-assets',
      );
      expect(dataEntry).toBeDefined();
      expect(dataEntry.handler).toBe('NetworkFirst');
      expect(dataEntry.urlPattern.test('/data/chapters.json')).toBe(true);
      expect(dataEntry.urlPattern.test('/sitemap.xml')).toBe(true);
      expect(dataEntry.urlPattern.test('/export.csv')).toBe(true);
    });
  });

  describe('Audio streaming and bypass rules', () => {
    it('does not have active audio cache rule for MP3 files to prevent Firefox interception errors', () => {
      const audioEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'static-audio-assets',
      );
      expect(audioEntry).toBeUndefined();
    });

    it('cross-origin rule explicitly excludes MP3 files from being cached', () => {
      const crossOriginEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'cross-origin',
      );
      expect(crossOriginEntry).toBeDefined();
      expect(crossOriginEntry.handler).toBe('NetworkFirst');
      expect(crossOriginEntry.options.networkTimeoutSeconds).toBe(10);

      const mp3Url = new URL(
        'https://download.quranicaudio.com/qdc/saud_ash-shuraym/murattal/005.mp3',
      );
      const upperMp3Url = new URL(
        'https://download.quranicaudio.com/qdc/saud_ash-shuraym/murattal/005.MP3',
      );
      const regularCrossOriginUrl = new URL('https://api.quran.com/v4/chapters');
      const sameOriginUrl = new URL('https://quran.com/about');

      // Cross-origin MP3 should NOT be matched (case-insensitive)
      expect(crossOriginEntry.urlPattern({ url: mp3Url })).toBe(false);
      expect(crossOriginEntry.urlPattern({ url: upperMp3Url })).toBe(false);

      // Other cross-origin request should match
      expect(crossOriginEntry.urlPattern({ url: regularCrossOriginUrl })).toBe(true);

      // Same-origin request should NOT match cross-origin rule
      expect(crossOriginEntry.urlPattern({ url: sameOriginUrl })).toBe(false);
    });
  });

  describe('API and Route Caching rules', () => {
    it('handles same-origin API routes with NetworkFirst and 10s fallback timeout', () => {
      const apiEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'apis',
      );
      expect(apiEntry).toBeDefined();
      expect(apiEntry.handler).toBe('NetworkFirst');
      expect(apiEntry.method).toBe('GET');
      expect(apiEntry.options.networkTimeoutSeconds).toBe(10);

      const sameOriginApiUrl = new URL('https://quran.com/api/v4/search?q=rahman');
      const sameOriginAuthCallbackUrl = new URL('https://quran.com/api/auth/callback/google');
      const crossOriginApiUrl = new URL('https://otherdomain.com/api/test');

      // Same origin API should match
      expect(apiEntry.urlPattern({ url: sameOriginApiUrl })).toBe(true);

      // Auth callback routes MUST NOT be cached (OAuth Safari fix)
      expect(apiEntry.urlPattern({ url: sameOriginAuthCallbackUrl })).toBe(false);

      // Cross origin API should not match this rule
      expect(apiEntry.urlPattern({ url: crossOriginApiUrl })).toBe(false);
    });

    it('handles same-origin page routes and other resources with NetworkFirst and 10s timeout', () => {
      const othersEntry = runtimeCaching.find(
        (entry) => entry.options && entry.options.cacheName === 'others',
      );
      expect(othersEntry).toBeDefined();
      expect(othersEntry.handler).toBe('NetworkFirst');
      expect(othersEntry.options.networkTimeoutSeconds).toBe(10);

      const homeUrl = new URL('https://quran.com/');
      const surahUrl = new URL('https://quran.com/1');
      const apiUrl = new URL('https://quran.com/api/chapters');
      const crossOriginUrl = new URL('https://otherdomain.com/page');

      expect(othersEntry.urlPattern({ url: homeUrl })).toBe(true);
      expect(othersEntry.urlPattern({ url: surahUrl })).toBe(true);
      expect(othersEntry.urlPattern({ url: apiUrl })).toBe(false);
      expect(othersEntry.urlPattern({ url: crossOriginUrl })).toBe(false);
    });
  });
});
