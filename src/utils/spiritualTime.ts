export type TimeOfDayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

/**
 * Checks if the given date (or current date) is Friday (Jumu'ah).
 * In JavaScript, getDay() returns 5 for Friday.
 *
 * @param {Date} [date=new Date()]
 * @returns {boolean}
 */
export const isFriday = (date: Date = new Date()): boolean => {
  return date.getDay() === 5;
};

/**
 * Checks if the current hour is evening/night (20:00 to 04:59).
 *
 * @param {Date} [date=new Date()]
 * @returns {boolean}
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
 *
 * @param {Date} [date=new Date()]
 * @returns {TimeOfDayPeriod}
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
