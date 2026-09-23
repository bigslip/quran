/* eslint-disable import/extensions, @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention, no-restricted-syntax, no-await-in-loop */
import { adaptDatabase, type SQLiteLikeDb } from './ayahInsightsService.ts';

/**
 * Metadata for authentic Persian Quran Tafsirs available for on-demand download.
 */
export interface DownloadableTafsirInfo {
  id: number;
  slug: string;
  name: string;
  authorName: string;
  languageCode: string;
  approximateSizeMb: number;
}

/**
 * Authentic Persian Tafsirs catalog (Tafsir Nemouneh and Tafsir Noor).
 */
export const AVAILABLE_DOWNLOADABLE_TAFSIRS: DownloadableTafsirInfo[] = [
  {
    id: 171,
    slug: 'fa-tafsir-nemouneh',
    name: 'تفسیر نمونه',
    authorName: 'آیت‌الله ناصر مکارم شیرازی',
    languageCode: 'fa',
    approximateSizeMb: 12,
  },
  {
    id: 172,
    slug: 'fa-tafsir-noor',
    name: 'تفسیر نور',
    authorName: 'حجت‌الاسلام محسن قرائتی',
    languageCode: 'fa',
    approximateSizeMb: 10,
  },
];

export const DEFAULT_API_BASE_URL = 'https://quran.ir';

/**
 * Abstraction over Expo FileSystem to facilitate clean unit testing in Node environments.
 */
export interface FileSystemAdapter {
  documentDirectory: string | null;
  getInfoAsync(fileUri: string): Promise<{ exists: boolean; size?: number; isDirectory?: boolean }>;
  deleteAsync(fileUri: string, options?: { idempotent?: boolean }): Promise<void>;
  makeDirectoryAsync(dirUri: string, options?: { intermediates?: boolean }): Promise<void>;
  downloadAsync?(
    uri: string,
    fileUri: string,
    options?: any,
  ): Promise<{ uri: string; status: number }>;
  createDownloadResumable?(
    uri: string,
    fileUri: string,
    options?: any,
    callback?: (progress: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => void,
  ): {
    downloadAsync(): Promise<{ uri: string; status: number } | undefined>;
    pauseAsync?(): Promise<any>;
    resumeAsync?(): Promise<any>;
  };
}

// Module-level state
let currentApiBaseUrl = DEFAULT_API_BASE_URL;
let customFileSystem: FileSystemAdapter | null = null;
const customDatabases = new Map<string, SQLiteLikeDb>();
const openDatabases = new Map<string, SQLiteLikeDb>();
const activeDownloads = new Map<string, Promise<string>>();
const progressListeners = new Map<string, Set<(progress: number) => void>>();

/**
 * Sets a custom FileSystem adapter (for Node tests or mock providers).
 */
export function setFileSystemForTesting(fs: FileSystemAdapter | null): void {
  customFileSystem = fs;
}

/**
 * Sets a custom database instance for a given Tafsir slug (for testing).
 */
export function setTafsirDatabase(slug: string, db: any): void {
  const clean = normalizeSlug(slug);
  if (db) {
    customDatabases.set(clean, adaptDatabase(db));
  } else {
    customDatabases.delete(clean);
  }
}

/**
 * Overrides the base URL for Tafsir API / download endpoints.
 */
export function setTafsirApiBaseUrl(url: string): void {
  currentApiBaseUrl = url;
}

/**
 * Resets all internal caches and mocks (intended for test beforeEach/afterEach).
 */
export function resetTafsirDownloaderForTesting(): void {
  customFileSystem = null;
  customDatabases.clear();
  openDatabases.clear();
  activeDownloads.clear();
  progressListeners.clear();
  currentApiBaseUrl = DEFAULT_API_BASE_URL;
}

/**
 * Normalizes a Tafsir slug or file name into a canonical lowercase slug without `.db`.
 */
function normalizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('A valid Tafsir slug is required');
  }
  const clean = slug.trim().toLowerCase().replace(/\.db$/, '');
  if (!clean) {
    throw new Error('A valid Tafsir slug is required');
  }
  return clean;
}

/**
 * Returns the SQLite file name for a Tafsir slug.
 */
export function getTafsirDbFileName(slug: string): string {
  return `${normalizeSlug(slug)}.db`;
}

/**
 * Resolves the active FileSystem module (prefers injected mock, then expo-file-system legacy/modern).
 */
function resolveFileSystem(): FileSystemAdapter {
  if (customFileSystem) {
    return customFileSystem;
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('expo-file-system/legacy');
    if (fs) return fs;
  } catch {}

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const fs = require('expo-file-system');
    if (fs) return fs;
  } catch {}

  throw new Error('FileSystem module not available. In tests, use setFileSystemForTesting().');
}

/**
 * Returns the directory path where Tafsir SQLite databases are stored (`documentDirectory/SQLite/`).
 */
function getDatabaseDirectory(fs: FileSystemAdapter): string {
  const docDir = fs.documentDirectory || '';
  const base = docDir.endsWith('/') ? docDir : `${docDir}/`;
  return `${base}SQLite/`;
}

/**
 * Returns the full file path for a downloaded Tafsir database.
 */
export function getTafsirDbPath(slug: string): string {
  const fs = resolveFileSystem();
  const dir = getDatabaseDirectory(fs);
  return `${dir}${getTafsirDbFileName(slug)}`;
}

/**
 * Generates the backend download endpoint URL for a given Tafsir slug.
 *
 * Endpoint: `GET /api/proxy/content/api/qdc/download/tafsirs/:tafsirSlug.db`
 */
export function getTafsirDownloadUrl(slug: string): string {
  const clean = normalizeSlug(slug);
  const base = currentApiBaseUrl.replace(/\/+$/, '');
  return `${base}/api/proxy/content/api/qdc/download/tafsirs/${clean}.db`;
}

/**
 * Checks whether the complete SQLite database for a given Tafsir is downloaded on-device.
 */
export async function isTafsirDownloaded(slug: string): Promise<boolean> {
  const clean = normalizeSlug(slug);

  // If a mock test database is actively registered, report as downloaded
  if (customDatabases.has(clean)) {
    return true;
  }

  try {
    const fs = resolveFileSystem();
    const filePath = getTafsirDbPath(clean);
    const info = await fs.getInfoAsync(filePath);
    return Boolean(info && info.exists && (info.size === undefined || info.size > 0));
  } catch {
    return false;
  }
}

/**
 * Returns the file size in bytes of a downloaded Tafsir database, or 0 if not present.
 */
export async function getDownloadedTafsirSize(slug: string): Promise<number> {
  const clean = normalizeSlug(slug);
  try {
    const fs = resolveFileSystem();
    const filePath = getTafsirDbPath(clean);
    const info = await fs.getInfoAsync(filePath);
    return info && info.exists && typeof info.size === 'number' ? info.size : 0;
  } catch {
    return 0;
  }
}

/**
 * Returns the list of all currently downloaded Tafsir slugs from the catalog.
 */
export async function getDownloadedTafsirSlugs(): Promise<string[]> {
  const downloaded: string[] = [];
  for (const tafsir of AVAILABLE_DOWNLOADABLE_TAFSIRS) {
    if (await isTafsirDownloaded(tafsir.slug)) {
      downloaded.push(tafsir.slug);
    }
  }
  return downloaded;
}

/**
 * Downloads a complete Tafsir SQLite database on-demand with progress tracking.
 *
 * Deduplicates concurrent download requests for the same slug so that multiple
 * callers share the same network operation and progress stream.
 *
 * @param slug The Tafsir identifier or slug (e.g. 'fa-tafsir-nemouneh')
 * @param onProgress Callback receiving progress fraction between 0.0 and 1.0
 * @returns Resolves with the saved local database file path on success
 */
export async function downloadTafsirDatabase(
  slug: string,
  onProgress?: (progress: number) => void,
): Promise<string> {
  const clean = normalizeSlug(slug);

  // Register progress listener if provided
  if (onProgress) {
    if (!progressListeners.has(clean)) {
      progressListeners.set(clean, new Set());
    }
    progressListeners.get(clean)!.add(onProgress);
  }

  // Deduplicate concurrent active downloads
  if (activeDownloads.has(clean)) {
    return activeDownloads.get(clean)!;
  }

  const broadcastProgress = (fraction: number) => {
    const clamped = Math.min(1, Math.max(0, fraction));
    const listeners = progressListeners.get(clean);
    if (listeners) {
      for (const listener of listeners) {
        try {
          listener(clamped);
        } catch {
          // Ignore listener errors
        }
      }
    }
  };

  const downloadPromise = (async (): Promise<string> => {
    const fs = resolveFileSystem();
    const targetDir = getDatabaseDirectory(fs);
    const targetPath = getTafsirDbPath(clean);
    const downloadUrl = getTafsirDownloadUrl(clean);

    // Ensure directory exists
    await fs.makeDirectoryAsync(targetDir, { intermediates: true });

    broadcastProgress(0);

    try {
      if (typeof fs.createDownloadResumable === 'function') {
        const downloadResumable = fs.createDownloadResumable(
          downloadUrl,
          targetPath,
          {},
          (progress) => {
            if (progress && progress.totalBytesExpectedToWrite > 0) {
              const fraction = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
              broadcastProgress(fraction);
            }
          },
        );

        const result = await downloadResumable.downloadAsync();
        if (!result || (result.status && result.status !== 200)) {
          throw new Error(
            `Failed to download Tafsir database: HTTP ${result?.status ?? 'unknown'}`,
          );
        }
      } else if (typeof fs.downloadAsync === 'function') {
        const result = await fs.downloadAsync(downloadUrl, targetPath);
        if (!result || (result.status && result.status !== 200)) {
          throw new Error(
            `Failed to download Tafsir database: HTTP ${result?.status ?? 'unknown'}`,
          );
        }
      } else {
        throw new Error('FileSystem implementation does not support downloading files');
      }

      broadcastProgress(1);
      return targetPath;
    } catch (err) {
      // Clean up incomplete or corrupted file on failure
      try {
        await fs.deleteAsync(targetPath, { idempotent: true });
      } catch {}
      throw err;
    } finally {
      activeDownloads.delete(clean);
      progressListeners.delete(clean);
    }
  })();

  activeDownloads.set(clean, downloadPromise);
  return downloadPromise;
}

/**
 * Deletes a downloaded Tafsir database from disk and closes any active connections.
 *
 * @returns `true` if a database file was deleted, `false` otherwise
 */
export async function deleteTafsirDatabase(slug: string): Promise<boolean> {
  const clean = normalizeSlug(slug);

  // Close and clean up cached open connection
  await closeTafsirDatabase(clean);

  // Remove mock database if set
  if (customDatabases.has(clean)) {
    customDatabases.delete(clean);
  }

  try {
    const fs = resolveFileSystem();
    const filePath = getTafsirDbPath(clean);
    const info = await fs.getInfoAsync(filePath);
    if (info && info.exists) {
      await fs.deleteAsync(filePath, { idempotent: true });
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

/**
 * Returns an adapted SQLite database instance for a downloaded Tafsir.
 *
 * @throws Error if the database is not downloaded yet
 */
export async function getDownloadedTafsirDb(slug: string): Promise<SQLiteLikeDb> {
  const clean = normalizeSlug(slug);

  // 1. Custom mock database (for Node tests)
  if (customDatabases.has(clean)) {
    return customDatabases.get(clean)!;
  }

  // 2. Cached open database connection
  if (openDatabases.has(clean)) {
    return openDatabases.get(clean)!;
  }

  // 3. Verify downloaded status
  const downloaded = await isTafsirDownloaded(clean);
  if (!downloaded) {
    throw new Error(`Tafsir database for "${slug}" is not downloaded. Please download it first.`);
  }

  // 4. Open with expo-sqlite
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SQLite = require('expo-sqlite');
    const fileName = getTafsirDbFileName(clean);
    const rawDb = await SQLite.openDatabaseAsync(fileName);
    const adapted = adaptDatabase(rawDb);
    openDatabases.set(clean, adapted);
    return adapted;
  } catch (err: any) {
    throw new Error(
      `Failed to open downloaded Tafsir database "${slug}": ${err?.message || String(err)}`,
    );
  }
}

/**
 * Closes the active SQLite connection for a specific Tafsir database.
 */
export async function closeTafsirDatabase(slug: string): Promise<void> {
  const clean = normalizeSlug(slug);
  const db = openDatabases.get(clean) || customDatabases.get(clean);
  if (db) {
    try {
      if (typeof (db as any).closeAsync === 'function') {
        await (db as any).closeAsync();
      } else if (typeof (db as any).close === 'function') {
        await (db as any).close();
      }
    } catch {}
    openDatabases.delete(clean);
    customDatabases.delete(clean);
  }
}

/**
 * Closes all active SQLite connections for downloaded Tafsirs.
 */
export async function closeAllTafsirDatabases(): Promise<void> {
  const allSlugs = new Set([...openDatabases.keys(), ...customDatabases.keys()]);
  for (const slug of Array.from(allSlugs)) {
    await closeTafsirDatabase(slug);
  }
}
