import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginFilePath = path.resolve(__dirname, 'withIosWidgets.js');

describe('iOS WidgetKit Config Plugin & SwiftUI Templates Tests', () => {
  it('verifies withIosWidgets.js exists and exports plugin function and generators', async () => {
    assert.ok(fs.existsSync(pluginFilePath), 'withIosWidgets.js must exist');
    const plugin = await import('./withIosWidgets.js');
    assert.strictEqual(typeof plugin.default, 'function', 'Default export must be a function');
    assert.strictEqual(
      typeof plugin.withIosWidgets,
      'function',
      'Named export withIosWidgets must exist',
    );
    assert.strictEqual(typeof plugin.modifyEntitlements, 'function');
    assert.strictEqual(typeof plugin.generateQuranWidgetsBundleSwift, 'function');
    assert.strictEqual(typeof plugin.generatePrayerWidgetSwift, 'function');
    assert.strictEqual(typeof plugin.generateDailyAyahWidgetSwift, 'function');
    assert.strictEqual(typeof plugin.generateLastReadWidgetSwift, 'function');
  });

  it('modifies iOS entitlements with App Group group.ir.quran.app', async () => {
    const { modifyEntitlements } = await import('./withIosWidgets.js');
    const mockEntitlements = {};

    const modified = modifyEntitlements(mockEntitlements);
    const groups = modified['com.apple.security.application-groups'];
    assert.ok(Array.isArray(groups), 'App groups must be an array');
    assert.ok(groups.includes('group.ir.quran.app'), 'Must contain group.ir.quran.app');

    // Idempotent test
    const reModified = modifyEntitlements(modified);
    assert.strictEqual(reModified['com.apple.security.application-groups'].length, 1);
  });

  it('generates QuranWidgetsBundleSwift with @main and 3 widget definitions', async () => {
    const { generateQuranWidgetsBundleSwift } = await import('./withIosWidgets.js');
    const swift = generateQuranWidgetsBundleSwift();

    assert.ok(swift.includes('import WidgetKit'));
    assert.ok(swift.includes('import SwiftUI'));
    assert.ok(swift.includes('@main'));
    assert.ok(swift.includes('struct QuranWidgetsBundle: WidgetBundle'));
    assert.ok(swift.includes('PrayerWidget()'));
    assert.ok(swift.includes('DailyAyahWidget()'));
    assert.ok(swift.includes('LastReadWidget()'));
  });

  it('generates PrayerWidget.swift with relative dynamic countdown and App Group storage', async () => {
    const { generatePrayerWidgetSwift } = await import('./withIosWidgets.js');
    const swift = generatePrayerWidgetSwift();

    assert.ok(swift.includes('UserDefaults(suiteName: "group.ir.quran.app")'));
    assert.ok(swift.includes('Text(entry.targetDate, style: .relative)'));
    assert.ok(swift.includes('quranir://prayers'));
    assert.ok(swift.includes('.supportedFamilies([.systemSmall, .systemMedium])'));
    assert.ok(swift.includes('TimelineProvider'));
    assert.ok(swift.includes('TimelineEntry'));
  });

  it('generates DailyAyahWidget.swift with calligraphy, translation, and reader deep link', async () => {
    const { generateDailyAyahWidgetSwift } = await import('./withIosWidgets.js');
    const swift = generateDailyAyahWidgetSwift();

    assert.ok(swift.includes('UserDefaults(suiteName: "group.ir.quran.app")'));
    assert.ok(swift.includes('dailyAyah'));
    assert.ok(
      swift.includes('.widgetURL(URL(string: entry.deepLinkUrl))') || swift.includes('widgetURL'),
    );
    assert.ok(swift.includes('arabicText'));
    assert.ok(swift.includes('translationFa'));
  });

  it('generates LastReadWidget.swift with resume citation and deep link', async () => {
    const { generateLastReadWidgetSwift } = await import('./withIosWidgets.js');
    const swift = generateLastReadWidgetSwift();

    assert.ok(swift.includes('UserDefaults(suiteName: "group.ir.quran.app")'));
    assert.ok(swift.includes('lastRead'));
    assert.ok(swift.includes('surahNameFa'));
    assert.ok(
      swift.includes('.widgetURL(URL(string: entry.deepLinkUrl))') || swift.includes('widgetURL'),
    );
  });
});
