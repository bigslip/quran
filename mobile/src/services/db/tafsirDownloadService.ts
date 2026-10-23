/* eslint-disable import/extensions, @typescript-eslint/no-explicit-any, @typescript-eslint/naming-convention, no-restricted-syntax, no-await-in-loop */
import { adaptDatabase, type SQLiteLikeDb } from './databaseAdapter.ts';

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
 * Resolves the default API base URL for downloading and querying Tafsirs:
 * 1. Explicit environment variable EXPO_PUBLIC_API_URL
 * 2. In development under Expo Go/Dev Client, derives the dev machine host IP from Constants.hostUri
 * 3. Falls back to https://quran.ir for production and non-Expo environments
 */
export function resolveDefaultApiBaseUrl(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
    const Constants = require('expo-constants')?.default || require('expo-constants');
    const hostUri =
      Constants?.expoConfig?.hostUri ||
      Constants?.manifest2?.extra?.expoGo?.debuggerHost ||
      Constants?.manifest?.debuggerHost;
    if (hostUri && typeof hostUri === 'string') {
      const host = hostUri.split(':')[0];
      if (host) {
        return `http://${host}:3000`;
      }
    }
  } catch {
    // Ignore in non-Expo or Node test environments
  }
  return DEFAULT_API_BASE_URL;
}

/**
 * Abstraction over Expo FileSystem to facilitate clean unit testing in Node environments.
 */
export interface FileSystemAdapter {
  documentDirectory: string | null;
  getInfoAsync(fileUri: string): Promise<{ exists: boolean; size?: number; isDirectory?: boolean }>;
  deleteAsync(fileUri: string, options?: { idempotent?: boolean }): Promise<void>;
  makeDirectoryAsync(dirUri: string, options?: { intermediates?: boolean }): Promise<void>;
  moveAsync?(options: { from: string; to: string }): Promise<void>;
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
    cancelAsync?(): Promise<any>;
  };
}

/** Network timeout for downloading a complete Tafsir database (45 seconds) */
export const TAFSIR_DOWNLOAD_TIMEOUT_MS = 45000;

/** Minimum acceptable downloaded Tafsir SQLite database file size (100 KB) */
export const MIN_TAFSIR_FILE_SIZE_BYTES = 100 * 1024;

// Module-level state
let currentApiBaseUrl = resolveDefaultApiBaseUrl();
let customFileSystem: FileSystemAdapter | null = null;
let customSQLite: any = null;
const customDatabases = new Map<string, SQLiteLikeDb>();
const openDatabases = new Map<string, SQLiteLikeDb>();
/** Raw (un-adapted) native SQLite connection objects, keyed by normalized slug. */
const openRawDatabases = new Map<string, any>();
/** In-flight open promises to prevent concurrent duplicate openDatabaseAsync calls. */
const openingDatabases = new Map<string, Promise<SQLiteLikeDb>>();
const activeDownloads = new Map<string, Promise<string>>();
const progressListeners = new Map<string, Set<(progress: number) => void>>();

/**
 * Sets a custom FileSystem adapter (for Node tests or mock providers).
 */
export function setFileSystemForTesting(fs: FileSystemAdapter | null): void {
  customFileSystem = fs;
}

/**
 * Sets a custom SQLite module (for testing native connection deduplication in Node).
 */
export function setSQLiteForTesting(sqlite: any): void {
  customSQLite = sqlite;
}

/**
 * Sets a custom database instance for a given Tafsir slug (for testing).
 * Stores both the adapted wrapper (for queries) and the raw object (for closeAsync).
 */
export function setTafsirDatabase(slug: string, db: any): void {
  const clean = normalizeSlug(slug);
  if (db) {
    customDatabases.set(clean, adaptDatabase(db));
    // Store raw so closeTafsirDatabase can call closeAsync on the original object
    openRawDatabases.set(clean, db);
  } else {
    customDatabases.delete(clean);
    openRawDatabases.delete(clean);
  }
}

/**
 * Overrides the base URL for Tafsir API / download endpoints.
 */
export function setTafsirApiBaseUrl(url: string): void {
  currentApiBaseUrl = url;
}

/**
 * Returns the currently configured base URL for Tafsir API / download endpoints.
 */
export function getTafsirApiBaseUrl(): string {
  return currentApiBaseUrl;
}

/**
 * Resets all internal caches and mocks (intended for test beforeEach/afterEach).
 */
export function resetTafsirDownloaderForTesting(): void {
  customFileSystem = null;
  customSQLite = null;
  customDatabases.clear();
  openDatabases.clear();
  openRawDatabases.clear();
  openingDatabases.clear();
  activeDownloads.clear();
  progressListeners.clear();
  currentApiBaseUrl = DEFAULT_API_BASE_URL;
}

/**
 * Normalizes a Tafsir slug or file name into a canonical lowercase slug without `.db`.
 * Validates that the result matches the allowed slug pattern.
 */
function normalizeSlug(slug: string): string {
  if (!slug || typeof slug !== 'string') {
    throw new Error('A valid Tafsir slug is required');
  }
  const clean = slug.trim().toLowerCase().replace(/\.db$/, '');
  if (!clean) {
    throw new Error('A valid Tafsir slug is required');
  }
  if (!/^[a-z0-9][a-z0-9_-]*$/.test(clean)) {
    throw new Error(
      `A valid Tafsir slug is required (got "${clean}"). Slugs must start with a letter or digit and contain only letters, digits, underscores, or hyphens.`,
    );
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
  if (!fs.documentDirectory) {
    throw new Error(
      'FileSystem.documentDirectory is null. The app may not have storage access or is running in an unsupported environment.',
    );
  }
  const base = fs.documentDirectory.endsWith('/')
    ? fs.documentDirectory
    : `${fs.documentDirectory}/`;
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
 * Returns false while a download for the same slug is actively in progress.
 */
export async function isTafsirDownloaded(slug: string): Promise<boolean> {
  const clean = normalizeSlug(slug);

  // If a mock test database is actively registered, report as downloaded
  if (customDatabases.has(clean)) {
    return true;
  }

  // A download is in progress — the file may be a partial tmp or not yet renamed
  if (activeDownloads.has(clean)) {
    return false;
  }

  try {
    const fs = resolveFileSystem();
    const filePath = getTafsirDbPath(clean);
    const info = await fs.getInfoAsync(filePath);
    return Boolean(
      info && info.exists && (info.size === undefined || info.size >= MIN_TAFSIR_FILE_SIZE_BYTES),
    );
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
 * Broadcasts progress to all registered listeners for a slug.
 */
function broadcastProgress(slug: string, fraction: number): void {
  const clamped = Math.min(1, Math.max(0, fraction));
  const listeners = progressListeners.get(slug);
  if (listeners) {
    for (const listener of listeners) {
      try {
        listener(clamped);
      } catch {
        // Ignore listener errors
      }
    }
  }
}

/**
 * Downloads a complete Tafsir SQLite database on-demand with progress tracking.
 *
 * Uses an atomic write strategy: downloads to a `.download.tmp` file first, then
 * renames to the final path only on success. This prevents corrupt databases from
 * being left behind if the app is killed mid-download.
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
  options?: { timeoutMs?: number },
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

  const downloadPromise = (async (): Promise<string> => {
    // Short-circuit inside the promise: already fully downloaded — no need to re-download
    if (await isTafsirDownloaded(clean)) {
      broadcastProgress(clean, 1.0);
      return getTafsirDbPath(clean);
    }

    // Close any open connection before overwriting the underlying file
    if (openDatabases.has(clean) || openRawDatabases.has(clean) || openingDatabases.has(clean)) {
      await closeTafsirDatabase(clean);
    }

    const fs = resolveFileSystem();
    const targetDir = getDatabaseDirectory(fs);
    const targetPath = getTafsirDbPath(clean);
    const tmpPath = `${targetPath}.download.tmp`;
    const downloadUrl = getTafsirDownloadUrl(clean);
    const timeoutMs = options?.timeoutMs ?? TAFSIR_DOWNLOAD_TIMEOUT_MS;

    // Ensure directory exists
    await fs.makeDirectoryAsync(targetDir, { intermediates: true });

    broadcastProgress(clean, 0);

    let timeoutTimer: ReturnType<typeof setTimeout> | null = null;
    let resumableInstance: any = null;

    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutTimer = setTimeout(async () => {
        try {
          if (typeof resumableInstance?.cancelAsync === 'function') {
            await resumableInstance.cancelAsync();
          } else if (typeof resumableInstance?.pauseAsync === 'function') {
            await resumableInstance.pauseAsync();
          }
        } catch {
          // Ignore cancellation errors
        }
        reject(new Error(`Tafsir download timed out after ${timeoutMs / 1000}s: ${clean}`));
      }, timeoutMs);
    });

    try {
      const executeDownload = async (): Promise<void> => {
        if (typeof fs.createDownloadResumable === 'function') {
          const downloadResumable = fs.createDownloadResumable(
            downloadUrl,
            tmpPath,
            {},
            (progress) => {
              if (progress && progress.totalBytesExpectedToWrite > 0) {
                const fraction = progress.totalBytesWritten / progress.totalBytesExpectedToWrite;
                broadcastProgress(clean, fraction);
              }
            },
          );
          resumableInstance = downloadResumable;

          const result = await downloadResumable.downloadAsync();
          if (!result || (result.status && result.status !== 200)) {
            throw new Error(
              `Failed to download Tafsir database: HTTP ${result?.status ?? 'unknown'}`,
            );
          }
        } else if (typeof fs.downloadAsync === 'function') {
          const result = await fs.downloadAsync(downloadUrl, tmpPath);
          if (!result || (result.status && result.status !== 200)) {
            throw new Error(
              `Failed to download Tafsir database: HTTP ${result?.status ?? 'unknown'}`,
            );
          }
        } else {
          throw new Error('FileSystem implementation does not support downloading files');
        }
      };

      await Promise.race([executeDownload(), timeoutPromise]);

      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }

      // Verify the downloaded temporary file size and integrity
      const info = await fs.getInfoAsync(tmpPath);
      if (info && info.size !== undefined && info.size < MIN_TAFSIR_FILE_SIZE_BYTES) {
        throw new Error(
          `Downloaded Tafsir database file is corrupt or too small (${info.size} bytes). Minimum required size is 100 KB.`,
        );
      }

      // Atomic rename: move tmp → final path
      if (typeof fs.moveAsync === 'function') {
        await fs.moveAsync({ from: tmpPath, to: targetPath });
      } else {
        // Fallback for adapters that don't implement moveAsync (e.g. legacy test mocks):
        // the tmp file was written to targetPath directly if the adapter ignores the path arg.
        // Ensure tmp is cleaned up in case the adapter did write to it separately.
        try {
          await fs.deleteAsync(tmpPath, { idempotent: true });
        } catch {}
      }

      broadcastProgress(clean, 1);
      return targetPath;
    } catch (err) {
      if (timeoutTimer) {
        clearTimeout(timeoutTimer);
        timeoutTimer = null;
      }
      // Clean up both tmp and target on failure to prevent corrupt databases
      try {
        await fs.deleteAsync(tmpPath, { idempotent: true });
      } catch {}
      try {
        await fs.deleteAsync(targetPath, { idempotent: true });
      } catch {}
      throw err;
    } finally {
      activeDownloads.delete(clean);
      progressListeners.delete(clean);
    }
  })();

  // Register BEFORE any await so concurrent callers share this promise
  activeDownloads.set(clean, downloadPromise);
  return downloadPromise;
}

/** Alias conforming to downloadTafsir specification */
export const downloadTafsir = downloadTafsirDatabase;

/**
 * Deletes a downloaded Tafsir database from disk and closes any active connections.
 *
 * @returns `true` if a database file was deleted, `false` otherwise
 */
export async function deleteTafsirDatabase(slug: string): Promise<boolean> {
  const clean = normalizeSlug(slug);

  // If database is currently opening, await completion before closing/deleting
  if (openingDatabases.has(clean)) {
    try {
      await openingDatabases.get(clean)!;
    } catch {}
  }

  // Close and clean up cached open connection (must happen before fs.deleteAsync)
  await closeTafsirDatabase(clean);

  // Remove mock database if set
  if (customDatabases.has(clean)) {
    customDatabases.delete(clean);
  }

  try {
    const fs = resolveFileSystem();
    const filePath = getTafsirDbPath(clean);
    const info = await fs.getInfoAsync(filePath);
    for (const suffix of ['-wal', '-shm', '.download.tmp']) {
      try {
        await fs.deleteAsync(`${filePath}${suffix}`, { idempotent: true });
      } catch {
        // Ignore missing auxiliary/temp files
      }
    }
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
 * Uses an in-flight promise cache to prevent concurrent calls from opening
 * multiple native connections to the same file.
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

  // 3. In-flight open — return the existing promise to avoid duplicate connections
  if (openingDatabases.has(clean)) {
    return openingDatabases.get(clean)!;
  }

  // 4. Open with expo-sqlite, deduplicating concurrent callers synchronously
  const openingPromise: Promise<SQLiteLikeDb> = (async () => {
    try {
      const downloaded = await isTafsirDownloaded(clean);
      if (!downloaded) {
        throw new Error(
          `Tafsir database for "${slug}" is not downloaded. Please download it first.`,
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SQLite = customSQLite || require('expo-sqlite');
      const fileName = getTafsirDbFileName(clean);
      const rawDb = await SQLite.openDatabaseAsync(fileName);
      const adapted = adaptDatabase(rawDb);
      // Store both adapted (for queries) and raw (for closeAsync) connections
      openDatabases.set(clean, adapted);
      openRawDatabases.set(clean, rawDb);
      return adapted;
    } catch (err: any) {
      if (err instanceof Error && err.message.startsWith('Tafsir database for "')) {
        throw err;
      }
      throw new Error(
        `Failed to open downloaded Tafsir database "${slug}": ${err?.message || String(err)}`,
      );
    } finally {
      openingDatabases.delete(clean);
    }
  })();

  openingDatabases.set(clean, openingPromise);
  return openingPromise;
}

/**
 * Closes the active SQLite connection for a specific Tafsir database.
 * Uses the raw native database object to ensure `closeAsync` is correctly forwarded.
 */
export async function closeTafsirDatabase(slug: string): Promise<void> {
  const clean = normalizeSlug(slug);

  // If database is currently opening, await completion before closing
  if (openingDatabases.has(clean)) {
    try {
      await openingDatabases.get(clean)!;
    } catch {}
  }

  // Close via raw native connection (has the real closeAsync)
  const rawDb = openRawDatabases.get(clean);
  if (rawDb) {
    try {
      if (typeof rawDb.closeAsync === 'function') {
        await rawDb.closeAsync();
      } else if (typeof rawDb.close === 'function') {
        await rawDb.close();
      }
    } catch {}
    openRawDatabases.delete(clean);
  }

  // Also attempt close on adapted db (covers custom mock databases with closeAsync)
  const db = openDatabases.get(clean) || customDatabases.get(clean);
  if (db && !rawDb) {
    // Only attempt if we didn't already close via rawDb (avoid double-close)
    try {
      if (typeof (db as any).closeAsync === 'function') {
        await (db as any).closeAsync();
      } else if (typeof (db as any).close === 'function') {
        await (db as any).close();
      }
    } catch {}
  }

  openDatabases.delete(clean);
  customDatabases.delete(clean);
}

/**
 * Closes all active SQLite connections for downloaded Tafsirs.
 */
export async function closeAllTafsirDatabases(): Promise<void> {
  const allSlugs = new Set([
    ...openDatabases.keys(),
    ...openRawDatabases.keys(),
    ...customDatabases.keys(),
  ]);
  for (const slug of Array.from(allSlugs)) {
    await closeTafsirDatabase(slug);
  }
}
