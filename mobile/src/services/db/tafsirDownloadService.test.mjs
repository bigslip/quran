import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { DatabaseSync } from 'node:sqlite';
import {
  downloadTafsirDatabase,
  isTafsirDownloaded,
  deleteTafsirDatabase,
  getDownloadedTafsirDb,
  getTafsirDownloadUrl,
  getTafsirDbPath,
  getDownloadedTafsirSize,
  getDownloadedTafsirSlugs,
  setTafsirApiBaseUrl,
  setFileSystemForTesting,
  setTafsirDatabase,
  resetTafsirDownloaderForTesting,
  closeTafsirDatabase,
  closeAllTafsirDatabases,
  AVAILABLE_DOWNLOADABLE_TAFSIRS,
} from './tafsirDownloadService.ts';

describe('Tafsir Download Service & SQLite Storage Tests (Task 3)', () => {
  let mockFiles;
  let mockDirectories;
  let mockResumableCalls;
  let mockFs;

  beforeEach(() => {
    resetTafsirDownloaderForTesting();
    mockFiles = new Map();
    mockDirectories = new Set();
    mockResumableCalls = [];

    mockFs = {
      documentDirectory: 'file:///data/user/0/ir.quran.app/files/',
      getInfoAsync: async (uri) => {
        if (mockFiles.has(uri)) {
          const file = mockFiles.get(uri);
          return { exists: true, size: file.size, isDirectory: false };
        }
        return { exists: false, isDirectory: false };
      },
      makeDirectoryAsync: async (uri) => {
        mockDirectories.add(uri);
      },
      deleteAsync: async (uri) => {
        if (!mockFiles.has(uri)) {
          // In expo-file-system, if not idempotent, might throw
        }
        mockFiles.delete(uri);
      },
      moveAsync: async ({ from, to }) => {
        // Simulate atomic rename: copy entry from → to, remove from
        if (mockFiles.has(from)) {
          mockFiles.set(to, mockFiles.get(from));
          mockFiles.delete(from);
        }
      },
      createDownloadResumable: (url, targetPath, options, onProgress) => {
        // NOTE: targetPath here is the tmpPath passed by the service for atomic writes
        mockResumableCalls.push({ url, targetPath });
        return {
          downloadAsync: async () => {
            if (url.includes('fail-network')) {
              return { status: 500, uri: targetPath };
            }
            if (url.includes('fail-404')) {
              return { status: 404, uri: targetPath };
            }

            // Simulate progress ticks: 25%, 50%, 75%, 100%
            if (onProgress) {
              onProgress({ totalBytesWritten: 2500, totalBytesExpectedToWrite: 10000 });
              onProgress({ totalBytesWritten: 5000, totalBytesExpectedToWrite: 10000 });
              onProgress({ totalBytesWritten: 10000, totalBytesExpectedToWrite: 10000 });
            }

            // Write to the tmp path (moveAsync will rename it to the final path)
            mockFiles.set(targetPath, { size: 10000 });
            return { status: 200, uri: targetPath };
          },
        };
      },
    };

    setFileSystemForTesting(mockFs);
  });

  describe('Metadata and URL / Path resolution', () => {
    it('should expose authentic Persian Tafsirs in catalog with proper metadata', () => {
      assert.strictEqual(AVAILABLE_DOWNLOADABLE_TAFSIRS.length, 2);

      const nemouneh = AVAILABLE_DOWNLOADABLE_TAFSIRS.find((t) => t.id === 171);
      assert.ok(nemouneh, 'Nemouneh (171) must be in catalog');
      assert.strictEqual(nemouneh.slug, 'fa-tafsir-nemouneh');
      assert.strictEqual(nemouneh.name, 'تفسیر نمونه');
      assert.ok(nemouneh.authorName.includes('مکارم شیرازی'));
      assert.strictEqual(nemouneh.languageCode, 'fa');
      assert.ok(nemouneh.approximateSizeMb > 0);

      const noor = AVAILABLE_DOWNLOADABLE_TAFSIRS.find((t) => t.id === 172);
      assert.ok(noor, 'Noor (172) must be in catalog');
      assert.strictEqual(noor.slug, 'fa-tafsir-noor');
      assert.strictEqual(noor.name, 'تفسیر نور');
      assert.ok(noor.authorName.includes('قرائتی'));
      assert.strictEqual(noor.languageCode, 'fa');
      assert.ok(noor.approximateSizeMb > 0);
    });

    it('should generate canonical sovereign download URL', () => {
      const url = getTafsirDownloadUrl('fa-tafsir-nemouneh');
      assert.strictEqual(
        url,
        'https://quran.ir/api/proxy/content/api/qdc/download/tafsirs/fa-tafsir-nemouneh.db',
      );

      // Should not append double .db if passed with extension
      const urlWithExt = getTafsirDownloadUrl('fa-tafsir-noor.db');
      assert.strictEqual(
        urlWithExt,
        'https://quran.ir/api/proxy/content/api/qdc/download/tafsirs/fa-tafsir-noor.db',
      );
    });

    it('should allow overriding API base URL', () => {
      setTafsirApiBaseUrl('http://192.168.1.50:3000/');
      const url = getTafsirDownloadUrl('fa-tafsir-nemouneh');
      assert.strictEqual(
        url,
        'http://192.168.1.50:3000/api/proxy/content/api/qdc/download/tafsirs/fa-tafsir-nemouneh.db',
      );
    });

    it('should resolve standard SQLite path inside documentDirectory', () => {
      const path = getTafsirDbPath('fa-tafsir-nemouneh');
      assert.strictEqual(
        path,
        'file:///data/user/0/ir.quran.app/files/SQLite/fa-tafsir-nemouneh.db',
      );
    });

    it('should throw validation error on empty or invalid slug', () => {
      assert.throws(() => getTafsirDownloadUrl(''), /valid tafsir slug/i);
      assert.throws(() => getTafsirDbPath(null), /valid tafsir slug/i);
    });
  });

  describe('Download Lifecycle & Progress Tracking', () => {
    it('should successfully download tafsir db and report progress from 0 to 1', async () => {
      const progressUpdates = [];
      const onProgress = (p) => progressUpdates.push(p);

      const targetPath = await downloadTafsirDatabase('fa-tafsir-nemouneh', onProgress);

      assert.strictEqual(
        targetPath,
        'file:///data/user/0/ir.quran.app/files/SQLite/fa-tafsir-nemouneh.db',
      );
      assert.strictEqual(mockResumableCalls.length, 1);
      assert.ok(mockDirectories.has('file:///data/user/0/ir.quran.app/files/SQLite/'));

      // Verify progress sequence
      assert.ok(progressUpdates.length >= 2);
      assert.strictEqual(progressUpdates[0], 0);
      assert.strictEqual(progressUpdates[progressUpdates.length - 1], 1);
      assert.ok(progressUpdates.includes(0.25));
      assert.ok(progressUpdates.includes(0.5));

      // Check downloaded status
      const downloaded = await isTafsirDownloaded('fa-tafsir-nemouneh');
      assert.strictEqual(downloaded, true);

      // Check size
      const size = await getDownloadedTafsirSize('fa-tafsir-nemouneh');
      assert.strictEqual(size, 10000);
    });

    it('should deduplicate concurrent downloads for the same slug', async () => {
      const progress1 = [];
      const progress2 = [];

      const [res1, res2] = await Promise.all([
        downloadTafsirDatabase('fa-tafsir-noor', (p) => progress1.push(p)),
        downloadTafsirDatabase('fa-tafsir-noor', (p) => progress2.push(p)),
      ]);

      assert.strictEqual(res1, res2);
      assert.strictEqual(mockResumableCalls.length, 1, 'Only one network download initiated');
      assert.strictEqual(progress1[progress1.length - 1], 1);
      assert.strictEqual(progress2[progress2.length - 1], 1);
    });

    it('should clean up incomplete file and throw on network failure (500)', async () => {
      setTafsirApiBaseUrl('https://fail-network.example.com');
      const targetPath = getTafsirDbPath('fa-tafsir-nemouneh');

      await assert.rejects(
        () => downloadTafsirDatabase('fa-tafsir-nemouneh'),
        /failed to download/i,
      );

      // File should not exist in mockFiles
      assert.strictEqual(mockFiles.has(targetPath), false);
      const isDown = await isTafsirDownloaded('fa-tafsir-nemouneh');
      assert.strictEqual(isDown, false);
    });

    it('should clean up incomplete file and throw on HTTP 404', async () => {
      setTafsirApiBaseUrl('https://fail-404.example.com');
      await assert.rejects(() => downloadTafsirDatabase('fa-tafsir-nemouneh'), /HTTP 404/i);
      const isDown = await isTafsirDownloaded('fa-tafsir-nemouneh');
      assert.strictEqual(isDown, false);
    });
  });

  describe('Database Checking & Deletion', () => {
    it('should correctly report downloaded state for available vs missing tafsirs', async () => {
      assert.strictEqual(await isTafsirDownloaded('fa-tafsir-nemouneh'), false);
      assert.strictEqual(await isTafsirDownloaded('fa-tafsir-noor'), false);

      const targetPath = getTafsirDbPath('fa-tafsir-nemouneh');
      mockFiles.set(targetPath, { size: 12500000 });

      assert.strictEqual(await isTafsirDownloaded('fa-tafsir-nemouneh'), true);
      assert.strictEqual(await isTafsirDownloaded('fa-tafsir-noor'), false);

      const downloadedList = await getDownloadedTafsirSlugs();
      assert.deepStrictEqual(downloadedList, ['fa-tafsir-nemouneh']);
    });

    it('should delete downloaded tafsir database file and close connection', async () => {
      const targetPath = getTafsirDbPath('fa-tafsir-nemouneh');
      mockFiles.set(targetPath, { size: 12500000 });

      // Provide mock sqlite db
      let closed = false;
      const fakeDb = {
        getAll: () => [],
        getFirst: () => null,
        closeAsync: async () => {
          closed = true;
        },
      };
      setTafsirDatabase('fa-tafsir-nemouneh', fakeDb);

      assert.strictEqual(await isTafsirDownloaded('fa-tafsir-nemouneh'), true);

      const deleted = await deleteTafsirDatabase('fa-tafsir-nemouneh');
      assert.strictEqual(deleted, true);
      assert.strictEqual(mockFiles.has(targetPath), false);
      assert.strictEqual(await isTafsirDownloaded('fa-tafsir-nemouneh'), false);
      assert.strictEqual(closed, true);
    });

    it('should return false when deleting non-existent tafsir', async () => {
      const deleted = await deleteTafsirDatabase('fa-tafsir-nonexistent');
      assert.strictEqual(deleted, false);
    });
  });

  describe('SQLite Database Access & Querying', () => {
    it('should throw when accessing a tafsir database that is not downloaded', async () => {
      await assert.rejects(() => getDownloadedTafsirDb('fa-tafsir-nemouneh'), /not downloaded/i);
    });

    it('should open and allow querying from downloaded tafsir database via SQLite adapter', async () => {
      // Create real in-memory sqlite db simulating downloaded tafsir
      const memoryDb = new DatabaseSync(':memory:');
      memoryDb.exec(`
        CREATE TABLE tafsir_verses (
          verse_key TEXT PRIMARY KEY,
          chapter_id INTEGER NOT NULL,
          verse_number INTEGER NOT NULL,
          text TEXT NOT NULL,
          points TEXT
        );
        INSERT INTO tafsir_verses (verse_key, chapter_id, verse_number, text, points)
        VALUES (
          '1:1',
          1,
          1,
          'تسمیه در آغاز هر کاری به انسان می‌آموزد...',
          '["هر کار معناداری باید با نام خدا آغاز شود"]'
        );
      `);

      setTafsirDatabase('fa-tafsir-nemouneh', memoryDb);

      const db = await getDownloadedTafsirDb('fa-tafsir-nemouneh');
      assert.ok(db, 'Must return adapted database instance');

      const row = await db.getFirst('SELECT * FROM tafsir_verses WHERE verse_key = ?', ['1:1']);

      assert.ok(row);
      assert.strictEqual(row.verse_key, '1:1');
      assert.strictEqual(row.chapter_id, 1);
      assert.ok(row.text.includes('تسمیه'));
      assert.ok(row.points.includes('نام خدا'));
    });

    it('should cache open database instance and reuse it across calls', async () => {
      const memoryDb = new DatabaseSync(':memory:');
      setTafsirDatabase('fa-tafsir-noor', memoryDb);

      const db1 = await getDownloadedTafsirDb('fa-tafsir-noor');
      const db2 = await getDownloadedTafsirDb('fa-tafsir-noor');

      assert.strictEqual(db1, db2);
    });

    it('should properly close database on closeTafsirDatabase and closeAllTafsirDatabases', async () => {
      let closedNemouneh = false;
      let closedNoor = false;

      setTafsirDatabase('fa-tafsir-nemouneh', {
        getAll: () => [],
        getFirst: () => null,
        closeAsync: async () => {
          closedNemouneh = true;
        },
      });

      setTafsirDatabase('fa-tafsir-noor', {
        getAll: () => [],
        getFirst: () => null,
        closeAsync: async () => {
          closedNoor = true;
        },
      });

      await getDownloadedTafsirDb('fa-tafsir-nemouneh');
      await getDownloadedTafsirDb('fa-tafsir-noor');

      await closeTafsirDatabase('fa-tafsir-nemouneh');
      assert.strictEqual(closedNemouneh, true);
      assert.strictEqual(closedNoor, false);

      await closeAllTafsirDatabases();
      assert.strictEqual(closedNoor, true);
    });
  });
});
