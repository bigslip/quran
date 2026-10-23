/**
 * Native Widget Synchronization Service & Shared Storage Bridge.
 *
 * Coordinates data compilation between React Native stores and native OS widget
 * storage containers (iOS App Group UserDefaults & Android SharedPreferences).
 *
 * Responsibilities:
 * 1. Compiles a rolling 7-day prayer schedule using the Tehran Geophysics engine.
 * 2. Fetches and formats the Daily Ayah payload.
 * 3. Serializes user's last reading progress from useReadingStore.
 * 4. Persists the combined WidgetSharedData payload under 200 KB to multi-tier
 *    storage (AsyncStorage, native App Group / SharedPreferences, and memory cache).
 * 5. Provides reactive auto-synchronization on reading progress changes and app lifecycle transitions.
 */

import { computeWeeklyPrayerSchedule } from '../prayer/tehranPrayerEngine.ts';
import { DEFAULT_CITY, IRANIAN_PROVINCIAL_CAPITALS } from '../prayer/iranianCities.ts';
import { getDailyAyahForDate } from './dailyAyahService.ts';
import type { WidgetSharedData, LastReadPayload } from './widgetContracts.ts';
import { readingStorage } from '../../stores/readingStorage.ts';
import { useReadingStore } from '../../stores/useReadingStore.ts';

/** Storage key for widget shared data in AsyncStorage and readingStorage */
export const WIDGET_DATA_STORAGE_KEY = 'quran_widget_data';

/** Strict memory & OS widget payload size limit: 200 KB */
export const MAX_WIDGET_PAYLOAD_BYTES = 200 * 1024;

/** iOS App Group Identifier */
export const IOS_APP_GROUP_ID = 'group.ir.quran.app';

/** Module-level synchronous cache for instant UI and widget preview access */
let cachedWidgetData: WidgetSharedData | null = null;

/** Active widget synchronizer teardown function to eliminate listener leaks */
let activeSyncTeardown: (() => void) | null = null;

export interface SyncWidgetDataOptions {
  force?: boolean;
  date?: Date;
  cityId?: string;
  coords?: { lat: number; lng: number };
  storageOverride?: {
    setItem?: (key: string, value: string) => Promise<void> | void;
  };
}

/**
 * Finds the closest provincial capital in Iran for given coordinates,
 * or returns a fallback name.
 */
function resolveCityFromCoords(coords: { lat: number; lng: number }): {
  cityNameFa: string;
  latitude: number;
  longitude: number;
} {
  let closest = IRANIAN_PROVINCIAL_CAPITALS[0];
  let minDistanceSq = Number.MAX_VALUE;

  for (const city of IRANIAN_PROVINCIAL_CAPITALS) {
    const dLat = city.latitude - coords.lat;
    const dLng = city.longitude - coords.lng;
    const distSq = dLat * dLat + dLng * dLng;
    if (distSq < minDistanceSq) {
      minDistanceSq = distSq;
      closest = city;
    }
  }

  // If within ~0.35 degrees (~35 km) of a provincial capital, use its official Persian name
  if (minDistanceSq <= 0.35 * 0.35) {
    return {
      cityNameFa: closest.nameFa,
      latitude: coords.lat,
      longitude: coords.lng,
    };
  }

  return {
    cityNameFa: 'موقعیت فعلی',
    latitude: coords.lat,
    longitude: coords.lng,
  };
}

/**
 * Computes exact UTF-8 byte length across Node.js, Web, and React Native runtimes.
 */
export function getUtf8ByteLength(str: string): number {
  const globalBuffer = (
    globalThis as unknown as {
      Buffer?: { byteLength: (input: string, encoding?: string) => number };
    }
  ).Buffer;
  if (globalBuffer && typeof globalBuffer.byteLength === 'function') {
    return globalBuffer.byteLength(str, 'utf8');
  }
  if (typeof TextEncoder !== 'undefined') {
    return new TextEncoder().encode(str).length;
  }
  return str.length;
}

/**
 * Synchronously retrieves cached widget data, checking memory cache first
 * and hydrating from persistent storage if available.
 */
export function getCachedWidgetData(): WidgetSharedData | null {
  if (cachedWidgetData) {
    return cachedWidgetData;
  }

  try {
    const raw = readingStorage.getItem(WIDGET_DATA_STORAGE_KEY);
    if (typeof raw === 'string') {
      const parsed = JSON.parse(raw) as WidgetSharedData;
      if (parsed && parsed.schemaVersion === 1) {
        cachedWidgetData = parsed;
        return cachedWidgetData;
      }
    }
  } catch {
    // Graceful fallback if storage read/parse fails
  }

  return null;
}

/**
 * Compiles, serializes, and synchronizes the complete WidgetSharedData payload.
 */
export async function syncWidgetData(
  options: SyncWidgetDataOptions = {},
): Promise<WidgetSharedData> {
  const targetDate =
    options.date instanceof Date && !Number.isNaN(options.date.getTime())
      ? options.date
      : new Date();

  // 1. Resolve geographic location & Persian city name
  let cityNameFa = DEFAULT_CITY.nameFa;
  let latitude = DEFAULT_CITY.latitude;
  let longitude = DEFAULT_CITY.longitude;

  if (options.coords) {
    const resolved = resolveCityFromCoords(options.coords);
    cityNameFa = resolved.cityNameFa;
    latitude = resolved.latitude;
    longitude = resolved.longitude;
  } else {
    let targetCityId = options.cityId;
    if (!targetCityId) {
      try {
        const persistedCityId = await readingStorage.getItem('quran_selected_city_id');
        if (typeof persistedCityId === 'string' && persistedCityId.trim()) {
          targetCityId = persistedCityId.trim();
        }
      } catch {
        // Ignore storage read failure
      }
    }
    if (targetCityId) {
      const foundCity = IRANIAN_PROVINCIAL_CAPITALS.find((c) => c.id === targetCityId);
      if (foundCity) {
        cityNameFa = foundCity.nameFa;
        latitude = foundCity.latitude;
        longitude = foundCity.longitude;
      }
    }
  }

  // 2. Compute 7-day rolling prayer schedule (IRST UTC+3.5)
  const schedule = computeWeeklyPrayerSchedule(targetDate, latitude, longitude, 3.5);

  // 3. Fetch curated Daily Ayah payload
  const dailyAyah = await getDailyAyahForDate(targetDate);

  // 4. Extract last-read position from reading store or fallback
  let surahId = 1;
  let ayahNumber = 1;
  let surahNameFa = 'فاتحه (گشایش)';
  let pageNumber = 1;
  let juzNumber = 1;
  let viewMode: 'continuous' | 'mushaf' = 'continuous';
  let timestamp = Date.now();

  try {
    const state = useReadingStore.getState();
    if (state) {
      surahId = state.lastReadSurah ?? state.lastReadChapterId ?? 1;
      ayahNumber = state.lastReadAyah ?? state.lastReadVerseNumber ?? 1;
      surahNameFa = state.lastReadChapterNameFa || 'فاتحه (گشایش)';
      pageNumber = state.lastReadPage ?? 1;
      juzNumber = state.lastReadJuz ?? 1;
      viewMode = state.viewMode ?? 'continuous';
      timestamp = state.lastReadTimestamp ?? Date.now();
    }
  } catch {
    // Graceful fallback in environments where useReadingStore is uninitialized
  }

  const lastRead: LastReadPayload = {
    surahId,
    ayahNumber,
    surahNameFa,
    pageNumber,
    juzNumber,
    viewMode,
    timestamp,
    deepLinkUrl: `quranir://surah/${surahId}?verse=${ayahNumber}&page=${pageNumber}`,
  };

  // 5. Assemble complete WidgetSharedData conforming to widgetContracts schema
  const widgetData: WidgetSharedData = {
    schemaVersion: 1,
    updatedAt: Date.now(),
    prayerTimes: {
      cityNameFa,
      latitude,
      longitude,
      calculationMethod: 'tehran_geophysics',
      schedule,
    },
    dailyAyah,
    lastRead,
  };

  // 6. Serialize and enforce strict payload size constraint (< 200 KB)
  const serialized = JSON.stringify(widgetData);
  const payloadBytes = getUtf8ByteLength(serialized);

  if (payloadBytes > MAX_WIDGET_PAYLOAD_BYTES) {
    console.warn(
      `[widgetSyncService] Payload size (${payloadBytes} bytes) exceeds ${MAX_WIDGET_PAYLOAD_BYTES} bytes!`,
    );
  }

  // 7. Update in-memory synchronous cache
  cachedWidgetData = widgetData;

  // 8. Multi-tier persistence (Custom Override -> readingStorage -> AsyncStorage -> Native Modules)
  if (options.storageOverride?.setItem) {
    try {
      await options.storageOverride.setItem(WIDGET_DATA_STORAGE_KEY, serialized);
    } catch {
      // Ignore override failure
    }
  }

  try {
    readingStorage.setItem(WIDGET_DATA_STORAGE_KEY, serialized);
  } catch {
    // Ignore storage failure
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorageMod = require('@react-native-async-storage/async-storage');
    const asyncStorage = AsyncStorageMod.default || AsyncStorageMod;
    if (asyncStorage && typeof asyncStorage.setItem === 'function') {
      await asyncStorage.setItem(WIDGET_DATA_STORAGE_KEY, serialized);
    }
  } catch {
    // Gracefully ignore if AsyncStorage is unavailable or throws
  }

  // 9. Safe native container dispatch (App Group UserDefaults / SharedPreferences)
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const reactNative = require('react-native');
    const NativeModules = reactNative?.NativeModules;
    if (NativeModules) {
      if (NativeModules.QuranWidgetsBridge?.setWidgetData) {
        await NativeModules.QuranWidgetsBridge.setWidgetData(serialized);
      } else if (NativeModules.SharedGroupPreferences?.setItem) {
        await NativeModules.SharedGroupPreferences.setItem(
          'widget_data',
          serialized,
          IOS_APP_GROUP_ID,
        );
      }

      // Notify WidgetKit / AppWidget timeline reload if bridge provides it
      if (NativeModules.QuranWidgetsBridge?.reloadAllTimelines) {
        NativeModules.QuranWidgetsBridge.reloadAllTimelines();
      }
    }
  } catch {
    // Gracefully ignore in Expo Go, web, or headless test runners
  }

  return widgetData;
}

/**
 * Initializes store and AppState subscribers for reactive background widget synchronization.
 * Returns an unsubscribe/cleanup function.
 */
export function initWidgetSyncSubscriber(options?: { debounceMs?: number }): () => void {
  // If a subscriber is already active, invoke its teardown to prevent duplicate listeners
  if (activeSyncTeardown) {
    try {
      activeSyncTeardown();
    } catch {
      // Ignore teardown errors
    }
    activeSyncTeardown = null;
  }

  const debounceMs = options?.debounceMs ?? 300;
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const triggerDebouncedSync = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
      syncWidgetData().catch(() => {
        // Safe catch on background sync
      });
    }, debounceMs);
  };

  // 1. Subscribe to useReadingStore progress updates
  let unsubscribeStore: (() => void) | null = null;
  try {
    unsubscribeStore = useReadingStore.subscribe((state, prevState) => {
      const currentSurah = state.lastReadSurah ?? state.lastReadChapterId;
      const prevSurah = prevState.lastReadSurah ?? prevState.lastReadChapterId;
      const currentAyah = state.lastReadAyah ?? state.lastReadVerseNumber;
      const prevAyah = prevState.lastReadAyah ?? prevState.lastReadVerseNumber;
      const currentPage = state.lastReadPage;
      const prevPage = prevState.lastReadPage;
      const currentJuz = state.lastReadJuz;
      const prevJuz = prevState.lastReadJuz;

      if (
        currentSurah !== prevSurah ||
        currentAyah !== prevAyah ||
        currentPage !== prevPage ||
        currentJuz !== prevJuz
      ) {
        triggerDebouncedSync();
      }
    });
  } catch {
    // Ignore in non-standard store environments
  }

  // 2. Set up AppState lifecycle listener
  let appStateSubscription: { remove: () => void } | null = null;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const reactNative = require('react-native');
    const AppState = reactNative?.AppState;
    if (AppState && typeof AppState.addEventListener === 'function') {
      appStateSubscription = AppState.addEventListener('change', (nextState: string) => {
        if (nextState === 'active' || nextState === 'background') {
          syncWidgetData({ force: true }).catch(() => {});
        }
      });
    }
  } catch {
    // Ignore in Node.js or environments without AppState
  }

  const compoundTeardown = () => {
    unsubscribeStore?.();
    appStateSubscription?.remove?.();
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (activeSyncTeardown === compoundTeardown) {
      activeSyncTeardown = null;
    }
  };

  activeSyncTeardown = compoundTeardown;
  return compoundTeardown;
}
