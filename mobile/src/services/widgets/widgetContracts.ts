/**
 * Core Type Contracts & Schemas for Quran.ir Home Screen Widgets (OS Widgets).
 *
 * Defines the shared JSON payload structure synced between React Native and native
 * platform widget storage (iOS App Group UserDefaults & Android SharedPreferences).
 */

import type {
  PrayerMilestoneKey,
  PrayerMilestone,
  DayPrayerSchedule,
} from '../prayer/tehranPrayerEngine.ts';

export type { PrayerMilestoneKey, PrayerMilestone, DayPrayerSchedule };

/**
 * Payload contract for Daily Ayah Widget (Medium 4x2).
 */
export interface DailyAyahPayload {
  surahId: number;
  ayahNumber: number;
  surahNameFa: string;
  pageNumber: number;
  arabicText: string;
  translationFa: string;
  translationAuthorFa: string;
  dateKey: string; // ISO date format "YYYY-MM-DD"
  deepLinkUrl: string; // "quranir://surah/{id}?verse={num}&page={page}"
}

/**
 * Payload contract for Last Read / Resume Reading Widget (Small 2x2 & Medium 4x2).
 */
export interface LastReadPayload {
  surahId: number;
  ayahNumber: number;
  surahNameFa: string;
  pageNumber: number;
  juzNumber: number;
  viewMode: 'continuous' | 'mushaf';
  timestamp: number; // UTC ms epoch timestamp
  deepLinkUrl: string; // "quranir://surah/{id}?verse={num}&page={page}"
}

/**
 * Complete shared data payload stored in native App Group / SharedPreferences
 * under key "widget_data". Total footprint is strictly kept under 200 KB.
 */
export interface WidgetSharedData {
  schemaVersion: 1;
  updatedAt: number; // UTC ms timestamp

  prayerTimes: {
    cityNameFa: string; // "تهران"
    latitude: number;
    longitude: number;
    calculationMethod: 'tehran_geophysics';
    schedule: DayPrayerSchedule[]; // 7-day rolling schedule
  };

  dailyAyah: DailyAyahPayload;

  lastRead: LastReadPayload;
}
