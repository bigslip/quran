/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Unified database adapter interface supporting both expo-sqlite and node:sqlite.
 */
export interface SQLiteLikeDb {
  getAll<T = any>(query: string, params?: any[]): Promise<T[]> | T[];
  getFirst<T = any>(query: string, params?: any[]): Promise<T | null> | T | null;
  run?(query: string, params?: any[]): Promise<any> | any;
}

/**
 * Wraps raw database instances (expo-sqlite or node:sqlite) into a unified interface.
 */
export function adaptDatabase(rawDb: any): SQLiteLikeDb {
  if (!rawDb) {
    throw new Error('Database instance is required');
  }

  // If already adapted
  if (typeof rawDb.getAll === 'function' && typeof rawDb.getFirst === 'function') {
    return rawDb;
  }

  // expo-sqlite modern API
  if (typeof rawDb.getAllAsync === 'function') {
    return {
      getAll: async <T>(query: string, params: any[] = []) => rawDb.getAllAsync(query, params),
      getFirst: async <T>(query: string, params: any[] = []) => rawDb.getFirstAsync(query, params),
      run: async (query: string, params: any[] = []) =>
        rawDb.runAsync ? rawDb.runAsync(query, params) : undefined,
    };
  }

  // node:sqlite DatabaseSync API
  if (typeof rawDb.prepare === 'function') {
    return {
      getAll: <T>(query: string, params: any[] = []) => rawDb.prepare(query).all(...params) as T[],
      getFirst: <T>(query: string, params: any[] = []) => {
        const row = rawDb.prepare(query).get(...params);
        return (row ?? null) as T | null;
      },
      run: (query: string, params: any[] = []) => rawDb.prepare(query).run(...params),
    };
  }

  throw new Error('Unsupported database instance type');
}
