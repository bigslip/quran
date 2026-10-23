import type { StateStorage } from 'zustand/middleware';

const memoryStore = new Map<string, string>();
const dirtyKeys = new Set<string>();
const writeQueues = new Map<string, Promise<void>>();
let customStorage: StateStorage | null = null;

function enqueueKeyOp(key: string, op: () => Promise<void>): Promise<void> {
  const prev = writeQueues.get(key) ?? Promise.resolve();
  const next = prev.catch(() => {}).then(op);
  writeQueues.set(
    key,
    next.finally(() => {
      if (writeQueues.get(key) === next) {
        writeQueues.delete(key);
      }
    }),
  );
  return next;
}

// Dynamically resolve Expo FileSystem if available (works out-of-the-box in Expo Go and prebuilt apps)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let fileSystemModule: any = null;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  fileSystemModule = require('expo-file-system/legacy');
} catch {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    fileSystemModule = require('expo-file-system');
  } catch {
    fileSystemModule = null;
  }
}

// Check if native AsyncStorage binary binding is actually available (not null)
let nativeAsyncStorageAvailable = false;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let asyncStorageModule: any = null;

try {
  // In React Native, check if NativeModules has RNCAsyncStorage or PlatformLocalStorage
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const reactNative = require('react-native');
  const NativeModules = reactNative?.NativeModules;
  const hasModule = Boolean(
    NativeModules && (NativeModules.RNCAsyncStorage || NativeModules.PlatformLocalStorage),
  );
  // Also check TurboModule proxy if New Architecture is active
  const hasTurbo =
    typeof (globalThis as unknown as { __turboModuleProxy?: (name: string) => unknown })
      .__turboModuleProxy === 'function' &&
    Boolean(
      (
        globalThis as unknown as { __turboModuleProxy: (name: string) => unknown }
      ).__turboModuleProxy('AsyncStorage'),
    );

  if (hasModule || hasTurbo) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mod = require('@react-native-async-storage/async-storage');
    asyncStorageModule = mod.default || mod;
    if (asyncStorageModule && typeof asyncStorageModule.getItem === 'function') {
      nativeAsyncStorageAvailable = true;
    }
  }
} catch {
  nativeAsyncStorageAvailable = false;
}

function getStorageFilePath(key: string): string | null {
  if (!fileSystemModule || !fileSystemModule.documentDirectory) {
    return null;
  }
  const safeName = encodeURIComponent(key).replace(/[*]/g, '_');
  return `${fileSystemModule.documentDirectory}quran_store_${safeName}.json`;
}

export const readingStorage: StateStorage = {
  getItem: (name: string): string | null | Promise<string | null> => {
    if (customStorage) {
      return customStorage.getItem(name);
    }

    // Fast-path: return from memory cache synchronously if already present
    if (memoryStore.has(name)) {
      return memoryStore.get(name) ?? null;
    }

    // If no persistent backends are available (e.g. In Node test environment), return null synchronously
    const hasFs = Boolean(fileSystemModule && fileSystemModule.documentDirectory);
    if (!hasFs && !nativeAsyncStorageAvailable) {
      return null;
    }

    // Asynchronous persistent lookup
    dirtyKeys.delete(name);
    return (async (): Promise<string | null> => {
      // 1. Try Expo FileSystem
      if (hasFs) {
        try {
          const filePath = getStorageFilePath(name);
          if (filePath && fileSystemModule?.readAsStringAsync) {
            const content = await fileSystemModule.readAsStringAsync(filePath);
            if (dirtyKeys.has(name)) {
              return memoryStore.get(name) ?? null;
            }
            if (typeof content === 'string') {
              memoryStore.set(name, content);
              return content;
            }
          }
        } catch {
          // File does not exist yet or read failed
        }
      }

      // 2. Try native AsyncStorage if available
      if (nativeAsyncStorageAvailable && asyncStorageModule) {
        try {
          const content = await asyncStorageModule.getItem(name);
          if (dirtyKeys.has(name)) {
            return memoryStore.get(name) ?? null;
          }
          if (typeof content === 'string') {
            memoryStore.set(name, content);
            return content;
          }
        } catch {
          // Disable native AsyncStorage if it fails at runtime
          nativeAsyncStorageAvailable = false;
        }
      }

      return null;
    })();
  },

  setItem: async (name: string, value: string): Promise<void> => {
    // In-memory update is always immediate and synchronous
    dirtyKeys.add(name);
    memoryStore.set(name, value);

    if (customStorage) {
      try {
        await customStorage.setItem(name, value);
      } catch (err) {
        console.warn('[ReadingStorage] Custom storage setItem failed:', err);
      }
      return;
    }

    // 1. Try persisting to Expo FileSystem
    let persistedToFile = false;
    if (fileSystemModule && fileSystemModule.documentDirectory) {
      try {
        const filePath = getStorageFilePath(name);
        if (filePath && fileSystemModule.writeAsStringAsync) {
          await enqueueKeyOp(name, async () => {
            await fileSystemModule.writeAsStringAsync(filePath, value);
          });
          persistedToFile = true;
        }
      } catch (fsErr) {
        console.warn('[ReadingStorage] FileSystem setItem failed:', fsErr);
      }
    }

    // 2. If not saved to file, try native AsyncStorage if available
    if (!persistedToFile && nativeAsyncStorageAvailable && asyncStorageModule) {
      try {
        await asyncStorageModule.setItem(name, value);
      } catch {
        nativeAsyncStorageAvailable = false;
      }
    }
  },

  removeItem: async (name: string): Promise<void> => {
    dirtyKeys.add(name);
    memoryStore.delete(name);

    if (customStorage) {
      try {
        await customStorage.removeItem(name);
      } catch (err) {
        console.warn('[ReadingStorage] Custom storage removeItem failed:', err);
      }
      return;
    }

    // 1. Remove from Expo FileSystem
    if (fileSystemModule && fileSystemModule.documentDirectory) {
      try {
        const filePath = getStorageFilePath(name);
        if (filePath && fileSystemModule.deleteAsync) {
          await enqueueKeyOp(name, async () => {
            await fileSystemModule.deleteAsync(filePath, { idempotent: true });
          });
        }
      } catch {
        // Ignore deletion errors
      }
    }

    // 2. Remove from native AsyncStorage if available
    if (nativeAsyncStorageAvailable && asyncStorageModule) {
      try {
        await asyncStorageModule.removeItem(name);
      } catch {
        nativeAsyncStorageAvailable = false;
      }
    }
  },
};

export function setCustomStorage(storage: StateStorage | null): void {
  customStorage = storage;
  dirtyKeys.clear();
}

export function getMemoryStorageMap(): Map<string, string> {
  return memoryStore;
}
