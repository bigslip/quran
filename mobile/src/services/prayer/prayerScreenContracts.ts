/**
 * Prayer Sanctuary Screen Contracts, Milestones & Localization Helpers.
 *
 * Provides shared contracts, milestone metadata, Hijri/Solar date formatting,
 * and upcoming prayer countdown calculations for the Daily Prayer Sanctuary screen.
 */

import {
  computeDayPrayerSchedule,
  formatPersianDate,
  toPersianDigits,
} from './tehranPrayerEngine.ts';
import type {
  PrayerMilestoneKey,
  PrayerMilestone,
  DayPrayerSchedule,
} from './tehranPrayerEngine.ts';
import { IRANIAN_PROVINCIAL_CAPITALS, DEFAULT_CITY } from './iranianCities.ts';
import type { IranianCity } from './iranianCities.ts';

export const PRAYER_STORAGE_CITY_KEY = 'quran_selected_city_id';

export interface MilestoneMeta {
  key: PrayerMilestoneKey;
  titleFa: string;
  subtitleFa: string;
  iconName: string;
}

export const PRAYER_MILESTONES_ORDER: PrayerMilestoneKey[] = [
  'imsak',
  'fajr',
  'sunrise',
  'dhuhr',
  'asr',
  'sunset',
  'maghrib',
  'isha',
  'midnight',
];

export const PRAYER_MILESTONES_META: Record<PrayerMilestoneKey, MilestoneMeta> = {
  imsak: {
    key: 'imsak',
    titleFa: 'امساک',
    subtitleFa: 'پایان وقت سحری',
    iconName: 'Moon',
  },
  fajr: {
    key: 'fajr',
    titleFa: 'اذان صبح',
    subtitleFa: 'آغاز وقت نماز صبح',
    iconName: 'Sunrise',
  },
  sunrise: {
    key: 'sunrise',
    titleFa: 'طلوع آفتاب',
    subtitleFa: 'پایان وقت نماز صبح',
    iconName: 'SunMedium',
  },
  dhuhr: {
    key: 'dhuhr',
    titleFa: 'اذان ظهر',
    subtitleFa: 'آغاز وقت ظهرین',
    iconName: 'Sun',
  },
  asr: {
    key: 'asr',
    titleFa: 'اذان عصر',
    subtitleFa: 'فضیلت نماز عصر',
    iconName: 'SunDim',
  },
  sunset: {
    key: 'sunset',
    titleFa: 'غروب آفتاب',
    subtitleFa: 'غروب ظاهری خورشید',
    iconName: 'Sunset',
  },
  maghrib: {
    key: 'maghrib',
    titleFa: 'اذان مغرب',
    subtitleFa: 'آغاز وقت عشائین و افطار',
    iconName: 'CloudMoon',
  },
  isha: {
    key: 'isha',
    titleFa: 'اذان عشا',
    subtitleFa: 'فضیلت نماز عشا',
    iconName: 'MoonStar',
  },
  midnight: {
    key: 'midnight',
    titleFa: 'نیمه‌شب شرعی',
    subtitleFa: 'پایان وقت نماز عشا',
    iconName: 'Sparkles',
  },
};

export const PERSIAN_WEEKDAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
  'شنبه',
];

export const ISLAMIC_MONTH_NAMES_FA = [
  'محرم',
  'صفر',
  'ربیع‌الاول',
  'ربیع‌الثانی',
  'جمادی‌الاول',
  'جمادی‌الثانی',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذی‌القعده',
  'ذی‌الحجه',
];

export const PRAYER_SCREEN_CONTRACTS = {
  headerTitle: 'اوقات شرعی',
  cityModalTitle: 'انتخاب شهر',
  citySearchPlaceholder: 'جستجوی شهر...',
  minTouchTarget: 44,
  cardBorderRadius: 16,
  testIDs: {
    screen: 'prayer-sanctuary-screen',
    backButton: 'prayer-back-button',
    citySelector: 'prayer-city-selector',
    countdownCard: 'prayer-countdown-card',
    milestoneGrid: 'prayer-milestone-grid',
    milestones: {
      imsak: 'prayer-milestone-imsak',
      fajr: 'prayer-milestone-fajr',
      sunrise: 'prayer-milestone-sunrise',
      dhuhr: 'prayer-milestone-dhuhr',
      asr: 'prayer-milestone-asr',
      sunset: 'prayer-milestone-sunset',
      maghrib: 'prayer-milestone-maghrib',
      isha: 'prayer-milestone-isha',
      midnight: 'prayer-milestone-midnight',
    },
  },
} as const;

/**
 * Formats a Gregorian date into full Persian solar date with weekday (e.g. "یکشنبه ۱۲ مهر ۱۴۰۵").
 */
export function formatSolarFullDateFa(date: Date = new Date()): string {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  const weekday = PERSIAN_WEEKDAYS[safeDate.getDay()];
  const solarDate = formatPersianDate(
    safeDate.getFullYear(),
    safeDate.getMonth() + 1,
    safeDate.getDate(),
  );
  return `${weekday} ${solarDate}`;
}

/**
 * Converts Gregorian date to Islamic Lunar Hijri coordinates (Kuwaiti algorithmic approximation).
 */
export function gregorianToHijri(date: Date = new Date()): { hy: number; hm: number; hd: number } {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  let day = safeDate.getDate();
  let month = safeDate.getMonth();
  let year = safeDate.getFullYear();

  let m = month + 1;
  let y = year;
  if (m < 3) {
    y -= 1;
    m += 12;
  }

  const a = Math.floor(y / 100);
  let b = 2 - a + Math.floor(a / 4);
  if (y < 1583) b = 0;
  if (y === 1582) {
    if (m > 10) b = -10;
    if (m === 10) {
      b = 0;
      if (day > 4) b = -10;
    }
  }

  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + day + b - 1524;

  const iyear = 10631.0 / 30.0;
  const epochastro = 1948084;
  const shift1 = 8.01 / 60.0;

  let z = jd - epochastro;
  const cyc = Math.floor(z / 10631.0);
  z = z - 10631 * cyc;
  const j = Math.floor((z - shift1) / iyear);
  const iy = 30 * cyc + j;
  z = z - Math.floor(j * iyear + shift1);
  let im = Math.floor((z + 28.5001) / 29.5);
  if (im === 13) im = 12;
  const id = Math.max(1, Math.min(30, z - Math.floor(29.5001 * im - 29)));

  return { hy: iy, hm: im, hd: id };
}

/**
 * Formats a Gregorian date into localized Persian Islamic Hijri date (e.g. "۲۳ ربیع‌الثانی ۱۴۴۸ ه‍.ق.").
 */
export function formatHijriDateFa(date: Date = new Date()): string {
  const safeDate = date instanceof Date && !Number.isNaN(date.getTime()) ? date : new Date();
  try {
    const formatter = new Intl.DateTimeFormat('fa-IR-u-ca-islamic-umalqura', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const formatted = formatter.format(safeDate);
    if (formatted && formatted.length > 3) {
      return formatted;
    }
  } catch {
    // Fall back to algorithmic calculation
  }

  const { hy, hm, hd } = gregorianToHijri(safeDate);
  const monthName = ISLAMIC_MONTH_NAMES_FA[Math.max(0, Math.min(11, hm - 1))];
  return `${toPersianDigits(hd)} ${monthName} ${toPersianDigits(hy)} ه‍.ق.`;
}

export interface NextPrayerInfo {
  milestone: PrayerMilestone;
  previousMilestone: PrayerMilestone;
  remainingMs: number;
  countdownFa: string;
  progressFraction: number;
}

/**
 * Computes the upcoming next prayer milestone and remaining countdown from the current time.
 */
export function getNextPrayerMilestone(
  schedule: DayPrayerSchedule,
  now: Date = new Date(),
): NextPrayerInfo {
  const nowMs = (now instanceof Date && !Number.isNaN(now.getTime()) ? now : new Date()).getTime();
  const milestones = schedule.milestones;

  if (!milestones || milestones.length === 0) {
    const fallback = computeDayPrayerSchedule(now).milestones[0];
    return {
      milestone: fallback,
      previousMilestone: fallback,
      remainingMs: 0,
      countdownFa: 'هم‌اکنون',
      progressFraction: 1,
    };
  }

  // Find first milestone strictly in the future
  let nextIdx = milestones.findIndex((m) => m.timestamp > nowMs);

  let nextMilestone: PrayerMilestone;
  let prevMilestone: PrayerMilestone;

  if (nextIdx === -1) {
    // Current time is after all of today's milestones (after midnight)
    // The next prayer is tomorrow's imsak
    const tomorrow = new Date(nowMs + 24 * 3600 * 1000);
    const tomorrowSchedule = computeDayPrayerSchedule(tomorrow);
    nextMilestone = tomorrowSchedule.milestones[0];
    prevMilestone = milestones[milestones.length - 1];
  } else {
    nextMilestone = milestones[nextIdx];
    prevMilestone = nextIdx > 0 ? milestones[nextIdx - 1] : milestones[milestones.length - 1];
  }

  const remainingMs = Math.max(0, nextMilestone.timestamp - nowMs);
  const totalWindow = Math.max(1, nextMilestone.timestamp - prevMilestone.timestamp);
  const elapsed = Math.max(0, nowMs - prevMilestone.timestamp);
  const progressFraction = Math.min(1, Math.max(0, elapsed / totalWindow));

  const countdownFa = formatCountdownFa(remainingMs, nextMilestone.nameFa);

  return {
    milestone: nextMilestone,
    previousMilestone: prevMilestone,
    remainingMs,
    countdownFa,
    progressFraction,
  };
}

/**
 * Formats remaining duration into Persian text (e.g. "۴۲ دقیقه تا اذان ظهر").
 */
export function formatCountdownFa(remainingMs: number, prayerNameFa: string): string {
  if (remainingMs <= 0) {
    return 'هم‌اکنون';
  }

  const totalMinutes = Math.floor(remainingMs / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${toPersianDigits(hours)} ساعت و ${toPersianDigits(minutes)} دقیقه تا ${prayerNameFa}`;
  }
  if (hours > 0 && minutes === 0) {
    return `${toPersianDigits(hours)} ساعت تا ${prayerNameFa}`;
  }
  if (hours === 0 && minutes > 0) {
    return `${toPersianDigits(minutes)} دقیقه تا ${prayerNameFa}`;
  }
  return `کمتر از یک دقیقه تا ${prayerNameFa}`;
}

/**
 * Resolves an IranianCity by ID with fallback to Tehran.
 */
export function resolveCityOrDefault(cityId?: string | null): IranianCity {
  if (!cityId) return DEFAULT_CITY;
  const found = IRANIAN_PROVINCIAL_CAPITALS.find((c) => c.id === cityId);
  return found || DEFAULT_CITY;
}
