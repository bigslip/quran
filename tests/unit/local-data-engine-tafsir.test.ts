/* eslint-disable @typescript-eslint/naming-convention */
import { describe, it, expect, beforeEach } from 'vitest';

import { _resetStateForTesting, handleLocalApiRequest } from '../../src/utils/localDataEngine';

/**
 * Task 2: Sovereign Backend Tafsir API Endpoint
 *
 * Verifies that localDataEngine handles:
 *   GET tafsirs/:tafsirIdOrSlug/by_ayah/:verseKey
 *
 * Matching Quran.com / QuranCDN response format:
 *   { tafsir: { resource_id, resource_name, slug, language_id, translated_name, text, ... } }
 */

describe('LocalDataEngine – Tafsir Endpoint (Task 2)', () => {
  beforeEach(() => {
    _resetStateForTesting();
  });

  it('should return tafsir by numeric ID and verse key (1:1)', async () => {
    const response = await handleLocalApiRequest('tafsirs/171/by_ayah/1:1', {});

    expect(response).toBeDefined();
    expect(response.tafsir).toBeDefined();
    expect(response.tafsir.resource_id).toBe(171);
    expect(response.tafsir.slug).toBe('fa-tafsir-nemouneh');
    expect(response.tafsir.language_id).toBeTypeOf('number');
    expect(response.tafsir.translated_name).toBeDefined();
    expect(response.tafsir.translated_name.language_name).toBe('persian');
    expect(typeof response.tafsir.text).toBe('string');
    expect(response.tafsir.text.length).toBeGreaterThan(0);
    expect(Array.isArray(response.tafsir.points)).toBe(true);
    expect(response.tafsir.points.length).toBeGreaterThan(0);
  });

  it('should return tafsir by slug and verse key (18:28)', async () => {
    const response = await handleLocalApiRequest('tafsirs/fa-tafsir-noor/by_ayah/18:28', {});

    expect(response).toBeDefined();
    expect(response.tafsir).toBeDefined();
    expect(response.tafsir.resource_id).toBe(172);
    expect(response.tafsir.slug).toBe('fa-tafsir-noor');
    expect(response.tafsir.text).toContain('ارزش همنشین');
    expect(response.tafsir.points.length).toBeGreaterThanOrEqual(2);
  });

  it('should return tafsir 171 by slug fa-tafsir-nemouneh for verse 1:1', async () => {
    const response = await handleLocalApiRequest('tafsirs/fa-tafsir-nemouneh/by_ayah/1:1', {});

    expect(response.tafsir.resource_id).toBe(171);
    expect(response.tafsir.text).toContain('تسمیه');
  });

  it('should return tafsir 172 by numeric ID for verse 1:1', async () => {
    const response = await handleLocalApiRequest('tafsirs/172/by_ayah/1:1', {});

    expect(response.tafsir.resource_id).toBe(172);
    expect(response.tafsir.slug).toBe('fa-tafsir-noor');
    expect(response.tafsir.text.length).toBeGreaterThan(0);
  });

  it('should include verses metadata in response', async () => {
    const response = await handleLocalApiRequest('tafsirs/171/by_ayah/2:255', {});

    expect(response.tafsir.resource_id).toBe(171);
    expect(typeof response.tafsir.text).toBe('string');
    expect(response.tafsir.text.length).toBeGreaterThan(0);
  });

  it('should throw for an unknown tafsir ID', async () => {
    await expect(handleLocalApiRequest('tafsirs/999/by_ayah/1:1', {})).rejects.toThrow();
  });
});
