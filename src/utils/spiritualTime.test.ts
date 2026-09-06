import { describe, it, expect } from 'vitest';

import { isFriday, isNightTime, getTimeOfDayPeriod } from './spiritualTime';

describe('spiritualTime', () => {
  describe('isFriday', () => {
    it('returns true on Friday', () => {
      // 2026-09-04 is a Friday
      const friday = new Date(2026, 8, 4, 10, 0, 0);
      expect(friday.getDay()).toBe(5);
      expect(isFriday(friday)).toBe(true);
    });

    it('returns false on other days of the week', () => {
      // 2026-09-03 is a Thursday
      const thursday = new Date(2026, 8, 3, 10, 0, 0);
      // 2026-09-05 is a Saturday
      const saturday = new Date(2026, 8, 5, 10, 0, 0);
      // 2026-09-06 is a Sunday
      const sunday = new Date(2026, 8, 6, 10, 0, 0);

      expect(isFriday(thursday)).toBe(false);
      expect(isFriday(saturday)).toBe(false);
      expect(isFriday(sunday)).toBe(false);
    });
  });

  describe('isNightTime', () => {
    it('returns true for hours >= 20 or < 5', () => {
      const at20 = new Date(2026, 8, 3, 20, 0, 0);
      const at23 = new Date(2026, 8, 3, 23, 59, 0);
      const atMidnight = new Date(2026, 8, 3, 0, 0, 0);
      const at4am = new Date(2026, 8, 3, 4, 59, 0);

      expect(isNightTime(at20)).toBe(true);
      expect(isNightTime(at23)).toBe(true);
      expect(isNightTime(atMidnight)).toBe(true);
      expect(isNightTime(at4am)).toBe(true);
    });

    it('returns false during daytime (05:00 - 19:59)', () => {
      const at5am = new Date(2026, 8, 3, 5, 0, 0);
      const atNoon = new Date(2026, 8, 3, 12, 0, 0);
      const at19pm = new Date(2026, 8, 3, 19, 59, 0);

      expect(isNightTime(at5am)).toBe(false);
      expect(isNightTime(atNoon)).toBe(false);
      expect(isNightTime(at19pm)).toBe(false);
    });
  });

  describe('getTimeOfDayPeriod', () => {
    it('returns "morning" for 05:00 - 11:59', () => {
      const morningStart = new Date(2026, 8, 3, 5, 0, 0);
      const morningEnd = new Date(2026, 8, 3, 11, 59, 59);

      expect(getTimeOfDayPeriod(morningStart)).toBe('morning');
      expect(getTimeOfDayPeriod(morningEnd)).toBe('morning');
    });

    it('returns "afternoon" for 12:00 - 16:59', () => {
      const noon = new Date(2026, 8, 3, 12, 0, 0);
      const afternoonEnd = new Date(2026, 8, 3, 16, 59, 59);

      expect(getTimeOfDayPeriod(noon)).toBe('afternoon');
      expect(getTimeOfDayPeriod(afternoonEnd)).toBe('afternoon');
    });

    it('returns "evening" for 17:00 - 19:59', () => {
      const eveningStart = new Date(2026, 8, 3, 17, 0, 0);
      const eveningEnd = new Date(2026, 8, 3, 19, 59, 59);

      expect(getTimeOfDayPeriod(eveningStart)).toBe('evening');
      expect(getTimeOfDayPeriod(eveningEnd)).toBe('evening');
    });

    it('returns "night" for 20:00 - 04:59', () => {
      const nightStart = new Date(2026, 8, 3, 20, 0, 0);
      const midnight = new Date(2026, 8, 3, 0, 0, 0);
      const nightEnd = new Date(2026, 8, 3, 4, 59, 59);

      expect(getTimeOfDayPeriod(nightStart)).toBe('night');
      expect(getTimeOfDayPeriod(midnight)).toBe('night');
      expect(getTimeOfDayPeriod(nightEnd)).toBe('night');
    });
  });

  describe('defensive Date handling', () => {
    it('handles invalid dates gracefully without throwing', () => {
      const invalidDate = new Date('invalid');
      expect(() => isFriday(invalidDate)).not.toThrow();
      expect(() => isNightTime(invalidDate)).not.toThrow();
      expect(() => getTimeOfDayPeriod(invalidDate)).not.toThrow();
    });
  });
});
