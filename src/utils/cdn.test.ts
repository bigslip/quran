import { describe, it, expect } from 'vitest';

import { makeCDNUrl } from './cdn';

describe('makeCDNUrl', () => {
  it('returns empty string for falsy or undefined path', () => {
    expect(makeCDNUrl(undefined)).toBe('');
    expect(makeCDNUrl('')).toBe('');
    expect(makeCDNUrl(null as unknown as string)).toBe('');
  });

  it('prepends slash and appends asset version query param', () => {
    expect(makeCDNUrl('images/logo.png')).toBe('/images/logo.png?v=1');
  });

  it('preserves leading slash', () => {
    expect(makeCDNUrl('/images/logo.png')).toBe('/images/logo.png?v=1');
  });
});
