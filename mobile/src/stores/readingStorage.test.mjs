import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { readingStorage, setCustomStorage, getMemoryStorageMap } from './readingStorage.ts';

describe('readingStorage Engine Tests', () => {
  beforeEach(() => {
    setCustomStorage(null);
    getMemoryStorageMap().clear();
  });

  it('should store, retrieve, and delete items from in-memory fallback', async () => {
    const testKey = 'test-key-1';
    const testValue = JSON.stringify({ state: { chapterId: 1, verse: 5 }, version: 0 });

    await readingStorage.setItem(testKey, testValue);
    assert.strictEqual(readingStorage.getItem(testKey), testValue);
    assert.strictEqual(getMemoryStorageMap().get(testKey), testValue);

    await readingStorage.removeItem(testKey);
    assert.strictEqual(readingStorage.getItem(testKey), null);
    assert.strictEqual(getMemoryStorageMap().has(testKey), false);
  });

  it('should delegate to custom storage when provided', async () => {
    const customMap = new Map();
    const mockStorage = {
      getItem: (key) => customMap.get(key) ?? null,
      setItem: (key, val) => {
        customMap.set(key, val);
      },
      removeItem: (key) => {
        customMap.delete(key);
      },
    };

    setCustomStorage(mockStorage);

    await readingStorage.setItem('custom-key', 'custom-value');
    assert.strictEqual(customMap.get('custom-key'), 'custom-value');
    assert.strictEqual(readingStorage.getItem('custom-key'), 'custom-value');

    await readingStorage.removeItem('custom-key');
    assert.strictEqual(customMap.has('custom-key'), false);
    assert.strictEqual(readingStorage.getItem('custom-key'), null);
  });

  it('should never throw or reject when custom storage throws an exception', async () => {
    const brokenStorage = {
      getItem: () => {
        throw new Error('Native module is null, cannot access legacy storage');
      },
      setItem: () => {
        throw new Error('Native module is null, cannot access legacy storage');
      },
      removeItem: () => {
        throw new Error('Native module is null, cannot access legacy storage');
      },
    };

    setCustomStorage(brokenStorage);

    // setItem must not throw despite broken storage
    await assert.doesNotReject(async () => {
      await readingStorage.setItem('key-safe', 'value-safe');
    });

    // In-memory fallback retains the value
    assert.strictEqual(getMemoryStorageMap().get('key-safe'), 'value-safe');

    // removeItem must not throw despite broken storage
    await assert.doesNotReject(async () => {
      await readingStorage.removeItem('key-safe');
    });

    assert.strictEqual(getMemoryStorageMap().has('key-safe'), false);
  });

  it('should never throw or reject when custom storage returns a rejected promise', async () => {
    const rejectingStorage = {
      getItem: () => Promise.reject(new Error('Rejected async native error')),
      setItem: () => Promise.reject(new Error('Rejected async native error')),
      removeItem: () => Promise.reject(new Error('Rejected async native error')),
    };

    setCustomStorage(rejectingStorage);

    await assert.doesNotReject(async () => {
      await readingStorage.setItem('key-promise', 'val-promise');
    });

    assert.strictEqual(getMemoryStorageMap().get('key-promise'), 'val-promise');

    await assert.doesNotReject(async () => {
      await readingStorage.removeItem('key-promise');
    });
  });
});
