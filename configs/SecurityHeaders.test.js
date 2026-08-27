/* eslint-disable react-func/max-lines-per-function */
import { describe, it, expect } from 'vitest';

import securityHeaders from './SecurityHeaders.js';

describe('Security Headers Configuration', () => {
  it('exports an array of valid security header objects', () => {
    expect(Array.isArray(securityHeaders)).toBe(true);
    expect(securityHeaders.length).toBeGreaterThan(0);

    securityHeaders.forEach((header) => {
      expect(header).toHaveProperty('key');
      expect(typeof header.key).toBe('string');
      expect(header.key.trim().length).toBeGreaterThan(0);

      expect(header).toHaveProperty('value');
      expect(typeof header.value).toBe('string');
      expect(header.value.trim().length).toBeGreaterThan(0);
    });
  });

  it('includes Content-Security-Policy with required directives and no newlines', () => {
    const csp = securityHeaders.find((h) => h.key === 'Content-Security-Policy');
    expect(csp).toBeDefined();
    expect(csp.value).not.toContain('\n');

    const expectedDirectives = [
      'default-src',
      'script-src',
      'font-src',
      'frame-src',
      'style-src',
      'worker-src',
      'child-src',
      'img-src',
      'media-src',
      'connect-src',
    ];

    expectedDirectives.forEach((directive) => {
      expect(csp.value).toContain(directive);
    });

    // Check specific critical origins and fallback
    expect(csp.value).toContain("'self'");
    expect(csp.value).toContain('quranicaudio.com');
  });

  it('includes Referrer-Policy set to origin-when-cross-origin', () => {
    const header = securityHeaders.find((h) => h.key === 'Referrer-Policy');
    expect(header).toBeDefined();
    expect(header.value).toBe('origin-when-cross-origin');
  });

  it('includes X-Content-Type-Options set to nosniff', () => {
    const header = securityHeaders.find((h) => h.key === 'X-Content-Type-Options');
    expect(header).toBeDefined();
    expect(header.value).toBe('nosniff');
  });

  it('includes X-DNS-Prefetch-Control set to on', () => {
    const header = securityHeaders.find((h) => h.key === 'X-DNS-Prefetch-Control');
    expect(header).toBeDefined();
    expect(header.value).toBe('on');
  });

  it('includes Permissions-Policy with restrictive browser feature permissions', () => {
    const header = securityHeaders.find((h) => h.key === 'Permissions-Policy');
    expect(header).toBeDefined();
    expect(header.value).toContain('camera=()');
    expect(header.value).toContain('microphone=(self)');
    expect(header.value).toContain('geolocation=(self)');
    expect(header.value).toContain('fullscreen=*');
  });
});
