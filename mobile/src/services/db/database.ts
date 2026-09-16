import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';

const DB_NAME = 'quran.db';
let dbInstance: SQLite.SQLiteDatabase | null = null;
let initPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/**
 * Initializes and opens the offline pre-bundled Quran SQLite database.
 * On first app run, copies the pre-bundled `assets/data/quran.db` into the app's SQLite directory.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (dbInstance) {
    return dbInstance;
  }
  
  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    const dbDir = `${FileSystem.documentDirectory}SQLite/`;
    const dbPath = `${dbDir}${DB_NAME}`;

    const dirInfo = await FileSystem.getInfoAsync(dbDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
    }

    const fileInfo = await FileSystem.getInfoAsync(dbPath);
    if (!fileInfo.exists) {
      // Copy bundled asset to local SQLite storage
      const asset = Asset.fromModule(require('../../../assets/data/quran.db'));
      await asset.downloadAsync();
      if (asset.localUri) {
        await FileSystem.copyAsync({
          from: asset.localUri,
          to: dbPath,
        });
      }
    }

    dbInstance = await SQLite.openDatabaseAsync(DB_NAME);
    return dbInstance;
  })();

  return initPromise;
}
