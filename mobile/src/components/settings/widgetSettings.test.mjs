import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { IRANIAN_PROVINCIAL_CAPITALS, DEFAULT_CITY } from '../../services/prayer/iranianCities.ts';
import { PRAYER_STORAGE_CITY_KEY } from '../../services/prayer/prayerScreenContracts.ts';
import { getCachedWidgetData, syncWidgetData } from '../../services/widgets/widgetSyncService.ts';
import {
  computeDayPrayerSchedule,
  toPersianDigits,
} from '../../services/prayer/tehranPrayerEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const widgetSectionFilePath = path.resolve(__dirname, 'WidgetSettingsSection.tsx');
const settingsScreenFilePath = path.resolve(__dirname, '../../app/(tabs)/settings.tsx');

describe('Widget Settings Section & In-App Previewer Tests', () => {
  it('verifies WidgetSettingsSection.tsx exists and exports valid React component', () => {
    assert.ok(fs.existsSync(widgetSectionFilePath), 'WidgetSettingsSection.tsx must exist');
    const content = fs.readFileSync(widgetSectionFilePath, 'utf8');
    assert.ok(
      content.includes('export function WidgetSettingsSection') ||
        content.includes('export default function WidgetSettingsSection'),
    );
  });

  it('contains all required testIDs for widgets settings and interactive previewer', () => {
    const content = fs.readFileSync(widgetSectionFilePath, 'utf8');
    const requiredTestIDs = [
      'widget-settings-section',
      'widget-city-picker-button',
      'widget-sync-now-button',
      'widget-preview-tab-prayer',
      'widget-preview-tab-daily-ayah',
      'widget-preview-tab-last-read',
      'widget-preview-card',
      'widget-guide-button',
    ];

    for (const testID of requiredTestIDs) {
      assert.ok(
        content.includes(`testID="${testID}"`),
        `WidgetSettingsSection must contain testID="${testID}"`,
      );
    }
  });

  it('enforces touch targets >= 44x44 pt across interactive elements', () => {
    const content = fs.readFileSync(widgetSectionFilePath, 'utf8');
    assert.ok(
      content.includes('minHeight: 44') || content.includes('minHeight: 48'),
      'Interactive controls must have minHeight >= 44 pt',
    );
  });

  it('verifies all 31 Iranian provincial capitals can be selected and resolve to valid schedules', () => {
    assert.strictEqual(IRANIAN_PROVINCIAL_CAPITALS.length, 31);
    for (const city of IRANIAN_PROVINCIAL_CAPITALS) {
      const schedule = computeDayPrayerSchedule(
        new Date(2026, 9, 5),
        city.latitude,
        city.longitude,
        3.5,
      );
      assert.ok(schedule.milestones.length >= 9);
      assert.ok(city.nameFa.length > 0);
    }
  });

  it('verifies syncWidgetData updates cached data with selected city', async () => {
    const mashhad = IRANIAN_PROVINCIAL_CAPITALS.find((c) => c.id === 'mashhad');
    assert.ok(mashhad);

    const synced = await syncWidgetData({
      cityId: 'mashhad',
      force: true,
      coords: { lat: mashhad.latitude, lng: mashhad.longitude },
    });

    assert.ok(synced);
    assert.strictEqual(synced.prayerTimes.cityNameFa, 'مشهد');
    const fajr = synced.prayerTimes.schedule[0].milestones.find((m) => m.key === 'fajr');
    assert.ok(fajr && fajr.timeFa.length > 0);
    assert.ok(synced.dailyAyah.arabicText.length > 0);
    assert.ok(synced.lastRead.surahNameFa.length > 0);

    const cached = getCachedWidgetData();
    assert.ok(cached);
    assert.strictEqual(cached.prayerTimes.cityNameFa, 'مشهد');
  });

  it('verifies settings.tsx integrates WidgetSettingsSection', () => {
    assert.ok(fs.existsSync(settingsScreenFilePath), 'settings.tsx must exist');
    const content = fs.readFileSync(settingsScreenFilePath, 'utf8');
    assert.ok(
      content.includes('WidgetSettingsSection'),
      'settings.tsx must import and render WidgetSettingsSection',
    );
  });
});
