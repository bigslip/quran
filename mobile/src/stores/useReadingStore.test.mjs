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
});
