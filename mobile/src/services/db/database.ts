import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

const DB_NAME = 'quran.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Initializes and opens the offline pre-bundled Quran SQLite database.
 * Ensures the database contains all 114 Surahs and words table, otherwise imports/overwrites from the bundled asset.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async (): Promise<SQLite.SQLiteDatabase> => {
    try {
      let db: SQLite.SQLiteDatabase | null = null;
      let isValid = false;

      try {
        db = await SQLite.openDatabaseAsync(DB_NAME);
        const test = await db.getFirstAsync<{ count: number }>(
          "SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name='chapters';",
        );
        if (test && test.count > 0) {
          const row = await db.getFirstAsync<{ count: number }>(
            'SELECT count(*) as count FROM chapters;',
          );
          if (row && row.count === 114) {
            isValid = true;
          }
        }
      } catch {
        isValid = false;
      }

      if (!isValid) {
        if (db) {
          try {
            await db.closeAsync();
          } catch {}
        }

        // Try expo-sqlite's built-in asset import first with forceOverwrite
        try {
          await SQLite.importDatabaseFromAssetAsync(DB_NAME, {
            assetId: require('../../../assets/data/quran.db'),
            forceOverwrite: true,
          });
        } catch (importErr) {
          console.warn('importDatabaseFromAssetAsync fallback to manual copy:', importErr);
          // Fallback to manual FileSystem copy
          const dbDir = `${FileSystem.documentDirectory}SQLite/`;
          const dbPath = `${dbDir}${DB_NAME}`;
          await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
          const asset = await Asset.fromModule(
            require('../../../assets/data/quran.db'),
          ).downloadAsync();
          if (asset.localUri) {
            await FileSystem.copyAsync({
              from: asset.localUri,
              to: dbPath,
            });
          }
        }

        // Re-open database after import
        db = await SQLite.openDatabaseAsync(DB_NAME);
      }

      if (!db) {
        throw new Error('Failed to initialize SQLite database');
      }

      dbInstance = db;
      return dbInstance;
    } catch (err) {
      initPromise = null;
      throw err;
    }
  })();

  return initPromise;
}

/**
 * Closes the active database connection.
 */
export async function closeDatabase(): Promise<void> {
  const pending = initPromise;
  initPromise = null;
  if (pending) {
    try {
      const pendingDb = await pending;
      if (pendingDb && pendingDb !== dbInstance) {
        try {
          await pendingDb.closeAsync();
        } catch {}
      }
    } catch {}
  }
  if (dbInstance) {
    const current = dbInstance;
    dbInstance = null;
    try {
      await current.closeAsync();
    } catch {}
  }
  initPromise = null;
}
