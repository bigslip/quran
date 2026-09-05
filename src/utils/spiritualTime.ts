export type TimeOfDayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface PrayerTimeMilestone {
  id: 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  nameKey: string;
  time: string;
  isNext?: boolean;
  isCurrent?: boolean;
}

export interface SpiritualTimeData {
  hijriDate: string;
  gregorianDate: string;
  nextPrayerName: string;
  nextPrayerRemaining: string;
  prayerMilestones: PrayerTimeMilestone[];
  isFriday: boolean;
  isNight: boolean;
  timeOfDay: TimeOfDayPeriod;
}

/**
 * Checks if the given date (or current date) is Friday (Jumu'ah).
 * In JavaScript, getDay() returns 5 for Friday.
 */
export const isFriday = (date: Date = new Date()): boolean => {
  return date.getDay() === 5;
};

/**
 * Checks if the current hour is evening/night (20:00 to 04:59).
 */
export const isNightTime = (date: Date = new Date()): boolean => {
  const hours = date.getHours();
  return hours >= 20 || hours < 5;
};

/**
 * Returns the current time of day period:
 * - 'morning': 05:00 - 11:59
 * - 'afternoon': 12:00 - 16:59
 * - 'evening': 17:00 - 19:59
 * - 'night': 20:00 - 04:59
 */
export const getTimeOfDayPeriod = (date: Date = new Date()): TimeOfDayPeriod => {
  const hours = date.getHours();
  if (hours >= 5 && hours < 12) {
    return 'morning';
  }
  if (hours >= 12 && hours < 17) {
    return 'afternoon';
  }
  if (hours >= 17 && hours < 20) {
    return 'evening';
  }
  return 'night';
};

/**
 * Formats the current Hijri date using Intl.DateTimeFormat with fallback.
 */
export const getFormattedHijriDate = (date: Date = new Date(), locale: string = 'en'): string => {
  try {
    const calendarLocale = locale.startsWith('ar') ? 'ar-SA-u-ca-islamic-umalqura' : 'en-u-ca-islamic-umalqura';
    const formatter = new Intl.DateTimeFormat(calendarLocale, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    return formatter.format(date);
  } catch {
    return '1448 AH';
  }
};

/**
 * Computes standard representative prayer times for the daily ribbon.
 */
export const getDailySpiritualData = (date: Date = new Date(), locale: string = 'en'): SpiritualTimeData => {
  const hijri = getFormattedHijriDate(date, locale);
  const gregorian = new Intl.DateTimeFormat(locale.startsWith('ar') ? 'ar' : 'en', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date);

  const hours = date.getHours();
  const minutes = date.getMinutes();
  const currentMinutesFromMidnight = hours * 60 + minutes;

  // Approximate solar prayer times in minutes from midnight for aesthetic display
  const prayerSchedule: { id: PrayerTimeMilestone['id']; nameKey: string; mins: number; timeStr: string }[] = [
    { id: 'fajr', nameKey: 'Fajr', mins: 5 * 60 + 12, timeStr: '05:12' },
    { id: 'sunrise', nameKey: 'Sunrise', mins: 6 * 60 + 35, timeStr: '06:35' },
    { id: 'dhuhr', nameKey: 'Dhuhr', mins: 12 * 60 + 48, timeStr: '12:48' },
    { id: 'asr', nameKey: 'Asr', mins: 16 * 60 + 20, timeStr: '16:20' },
    { id: 'maghrib', nameKey: 'Maghrib', mins: 19 * 60 + 5, timeStr: '19:05' },
    { id: 'isha', nameKey: 'Isha', mins: 20 * 60 + 30, timeStr: '20:30' },
  ];

  let nextPrayer = prayerSchedule[0];
  let remainingMins = 0;

  for (let i = 0; i < prayerSchedule.length; i += 1) {
    if (currentMinutesFromMidnight < prayerSchedule[i].mins) {
      nextPrayer = prayerSchedule[i];
      remainingMins = prayerSchedule[i].mins - currentMinutesFromMidnight;
      break;
    }
  }

  // If past Isha, next is Fajr tomorrow
  if (currentMinutesFromMidnight >= prayerSchedule[prayerSchedule.length - 1].mins) {
    nextPrayer = prayerSchedule[0];
    remainingMins = 24 * 60 - currentMinutesFromMidnight + prayerSchedule[0].mins;
  }

  const hoursRemaining = Math.floor(remainingMins / 60);
  const minsRemaining = remainingMins % 60;
  const remainingStr = `${hoursRemaining > 0 ? `${hoursRemaining}h ` : ''}${minsRemaining}m`;

  const prayerMilestones: PrayerTimeMilestone[] = prayerSchedule.map((p) => ({
    id: p.id,
    nameKey: p.nameKey,
    time: p.timeStr,
    isNext: p.id === nextPrayer.id,
  }));

  return {
    hijriDate: hijri,
    gregorianDate: gregorian,
    nextPrayerName: nextPrayer.nameKey,
    nextPrayerRemaining: remainingStr,
    prayerMilestones,
    isFriday: isFriday(date),
    isNight: isNightTime(date),
    timeOfDay: getTimeOfDayPeriod(date),
  };
};

