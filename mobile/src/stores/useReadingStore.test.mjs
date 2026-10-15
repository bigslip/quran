import { describe, it } from 'node:test';
import assert from 'node:assert';
import { useReadingStore } from './useReadingStore.ts';
import { readingStorage } from './readingStorage.ts';

describe('useReadingStore Theme & Persistence Tests', () => {
  it('manages and persists the active reading theme (4 themes)', () => {
    const store = useReadingStore.getState();
    assert.strictEqual(store.theme, 'emerald');

    store.setTheme('sepia');
    assert.strictEqual(useReadingStore.getState().theme, 'sepia');

    store.setTheme('dark');
    assert.strictEqual(useReadingStore.getState().theme, 'dark');

    store.setTheme('light');
    assert.strictEqual(useReadingStore.getState().theme, 'light');

    // Reset back to default
    store.setTheme('emerald');
  });

  it('persists theme into readingStorage through partialize', () => {
    const store = useReadingStore.getState();
    store.setTheme('dark');

    const storedRaw = readingStorage.getItem('quran-reading-store');
    assert.ok(storedRaw, 'Storage must contain serialized store state');
    const parsed = JSON.parse(storedRaw);
    assert.strictEqual(parsed.state.theme, 'dark');

    // Reset back to default
    store.setTheme('emerald');
  });

  it('persists tafsirFontScale into readingStorage through partialize', () => {
    const store = useReadingStore.getState();
    assert.strictEqual(store.tafsirFontScale, 'comfortable');

    store.setTafsirFontScale('large');
    assert.strictEqual(useReadingStore.getState().tafsirFontScale, 'large');

    const storedRaw = readingStorage.getItem('quran-reading-store');
    assert.ok(storedRaw, 'Storage must contain serialized store state');
    const parsed = JSON.parse(storedRaw);
    assert.strictEqual(parsed.state.tafsirFontScale, 'large');

    // Reset back to default
    store.setTafsirFontScale('comfortable');
  });

  it('persists recentSearches into readingStorage through partialize and enforces max 5 limit', () => {
    const store = useReadingStore.getState();
    store.clearRecentSearches();
    assert.deepStrictEqual(useReadingStore.getState().recentSearches, []);

    store.addRecentSearch('نور');
    store.addRecentSearch('رحمت');
    store.addRecentSearch('ایمان');
    store.addRecentSearch('صبر');
    store.addRecentSearch('تقوا');
    // 6th item should shift out the oldest
    store.addRecentSearch('توکل');

    const current = useReadingStore.getState().recentSearches;
    assert.strictEqual(current.length, 5);
    assert.strictEqual(current[0], 'توکل');
    assert.strictEqual(current[1], 'تقوا');
    assert.strictEqual(current.includes('نور'), false);

    // Duplicate should be moved to top
    store.addRecentSearch('صبر');
    assert.strictEqual(useReadingStore.getState().recentSearches[0], 'صبر');
    assert.strictEqual(useReadingStore.getState().recentSearches.length, 5);

    // Ignored short queries (< 2 chars or empty)
    store.addRecentSearch(' ');
    store.addRecentSearch('ا');
    assert.strictEqual(useReadingStore.getState().recentSearches.length, 5);

    const storedRaw = readingStorage.getItem('quran-reading-store');
    assert.ok(storedRaw, 'Storage must contain serialized store state');
    const parsed = JSON.parse(storedRaw);
    assert.deepStrictEqual(parsed.state.recentSearches, useReadingStore.getState().recentSearches);

    // Reset back to empty
    store.clearRecentSearches();
  });
});
