import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateTehranPrayers,
  computeDayPrayerSchedule,
  computeWeeklyPrayerSchedule,
} from './tehranPrayerEngine.ts';
import { IRANIAN_PROVINCIAL_CAPITALS, DEFAULT_CITY, getCityById } from './iranianCities.ts';

describe('Tehran Astronomical Prayer Engine Tests', () => {
  it('matches official Tehran Geophysics published times for Nowruz (2024-03-20)', () => {
    const res = calculateTehranPrayers(2024, 3, 20, 35.7, 51.42, 3.5);
    assert.strictEqual(res.fajr, '04:44');
    assert.strictEqual(res.sunrise, '06:08');
    assert.strictEqual(res.dhuhr, '12:12');
    assert.strictEqual(res.sunset, '18:16');
    assert.strictEqual(res.maghrib, '18:34');
    assert.strictEqual(res.midnight, '23:29');
  });

  it('matches official Tehran Geophysics for Summer Solstice (2024-06-21)', () => {
    const res = calculateTehranPrayers(2024, 6, 21, 35.7, 51.42, 3.5);
    assert.strictEqual(res.fajr, '03:02');
    assert.strictEqual(res.sunrise, '04:49');
    assert.strictEqual(res.dhuhr, '12:06');
    assert.strictEqual(res.sunset, '19:24');
    assert.strictEqual(res.maghrib, '19:45');
    assert.strictEqual(res.midnight, '23:13');
  });

  it('matches official Tehran Geophysics for Autumn Equinox (2024-09-22)', () => {
    const res = calculateTehranPrayers(2024, 9, 22, 35.7, 51.42, 3.5);
    assert.strictEqual(res.fajr, '04:29');
    assert.strictEqual(res.sunrise, '05:52');
    assert.strictEqual(res.dhuhr, '11:57');
    assert.strictEqual(res.sunset, '18:01');
    assert.strictEqual(res.maghrib, '18:19');
    assert.strictEqual(res.midnight, '23:15');
  });

  it('matches official Tehran Geophysics for Winter Solstice (2024-12-21)', () => {
    const res = calculateTehranPrayers(2024, 12, 21, 35.7, 51.42, 3.5);
    assert.strictEqual(res.fajr, '05:40');
    assert.strictEqual(res.sunrise, '07:10');
    assert.strictEqual(res.dhuhr, '12:03');
    assert.strictEqual(res.sunset, '16:55');
    assert.strictEqual(res.maghrib, '17:15');
    assert.strictEqual(res.midnight, '23:18');
  });

  it('calculates expected prayer milestones for October 4, 2026', () => {
    const res = calculateTehranPrayers(2026, 10, 4, 35.7, 51.42, 3.5);
    assert.strictEqual(res.imsak, '04:28');
    assert.strictEqual(res.fajr, '04:38');
    assert.strictEqual(res.sunrise, '06:01');
    assert.strictEqual(res.dhuhr, '11:53');
    assert.strictEqual(res.sunset, '17:44');
    assert.strictEqual(res.maghrib, '18:02');
    assert.strictEqual(res.midnight, '23:12');
  });

  it('verifies 31 Iranian provincial capitals exist with valid coordinates', () => {
    assert.ok(IRANIAN_PROVINCIAL_CAPITALS.length >= 31);
    const tehran = IRANIAN_PROVINCIAL_CAPITALS.find((c) => c.id === 'tehran');
    assert.ok(tehran);
    assert.strictEqual(tehran.nameFa, 'تهران');
    assert.strictEqual(tehran.latitude, 35.7);
    assert.strictEqual(tehran.longitude, 51.42);

    for (const city of IRANIAN_PROVINCIAL_CAPITALS) {
      assert.ok(city.id && typeof city.id === 'string');
      assert.ok(city.nameFa && typeof city.nameFa === 'string');
      assert.ok(city.nameEn && typeof city.nameEn === 'string');
      assert.ok(city.latitude >= 25 && city.latitude <= 40);
      assert.ok(city.longitude >= 44 && city.longitude <= 64);
      assert.ok(typeof city.elevation === 'number');
    }

    const fetched = getCityById('mashhad');
    assert.ok(fetched);
    assert.strictEqual(fetched.nameFa, 'مشهد');

    assert.strictEqual(DEFAULT_CITY.id, 'tehran');
    assert.strictEqual(getCityById('non-existent'), undefined);
  });

  it('computes single day prayer schedule with 9 localized milestones', () => {
    const schedule = computeDayPrayerSchedule(new Date(2026, 9, 4), 35.7, 51.42, 3.5);
    assert.strictEqual(schedule.dateIso, '2026-10-04');
    assert.ok(schedule.dateFa.length > 0);
    assert.strictEqual(schedule.milestones.length, 9);

    const keys = schedule.milestones.map((m) => m.key);
    assert.deepStrictEqual(keys, [
      'imsak',
      'fajr',
      'sunrise',
      'dhuhr',
      'asr',
      'sunset',
      'maghrib',
      'isha',
      'midnight',
    ]);

    for (const m of schedule.milestones) {
      assert.ok(m.nameFa.length > 0);
      assert.ok(typeof m.timestamp === 'number' && m.timestamp > 0);
      // timeFa should contain Persian numerals
      assert.match(m.timeFa, /^[۰-۹]{2}:[۰-۹]{2}$/);
    }
  });

  it('computes rolling 7-day schedule with 9 milestones per day', () => {
    const schedule = computeWeeklyPrayerSchedule(new Date(2026, 9, 4), 35.7, 51.42, 3.5);
    assert.strictEqual(schedule.length, 7);
    for (let i = 0; i < 7; i++) {
      assert.strictEqual(schedule[i].milestones.length, 9);
      assert.ok(schedule[i].dateIso);
      assert.ok(schedule[i].dateFa);
    }
    // Consecutive dates
    assert.strictEqual(schedule[0].dateIso, '2026-10-04');
    assert.strictEqual(schedule[1].dateIso, '2026-10-05');
    assert.strictEqual(schedule[6].dateIso, '2026-10-10');
  });
});
