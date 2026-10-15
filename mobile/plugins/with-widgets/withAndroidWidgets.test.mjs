import { describe, it } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const pluginFilePath = path.resolve(__dirname, 'withAndroidWidgets.js');

describe('Android AppWidget Config Plugin & Kotlin/RemoteViews Templates Tests', () => {
  it('verifies withAndroidWidgets.js exists and exports plugin function and generators', async () => {
    assert.ok(fs.existsSync(pluginFilePath), 'withAndroidWidgets.js must exist');
    const plugin = await import('./withAndroidWidgets.js');
    assert.strictEqual(typeof plugin.default, 'function', 'Default export must be a function');
    assert.strictEqual(
      typeof plugin.withAndroidWidgets,
      'function',
      'Named export withAndroidWidgets must exist',
    );
    assert.strictEqual(typeof plugin.generatePrayerWidgetProviderKt, 'function');
    assert.strictEqual(typeof plugin.generateDailyAyahWidgetProviderKt, 'function');
    assert.strictEqual(typeof plugin.generateLastReadWidgetProviderKt, 'function');
    assert.strictEqual(typeof plugin.generateWidgetAlarmReceiverKt, 'function');
    assert.strictEqual(typeof plugin.generatePrayerMediumLayoutXml, 'function');
    assert.strictEqual(typeof plugin.generatePrayerSmallLayoutXml, 'function');
    assert.strictEqual(typeof plugin.generateDailyAyahLayoutXml, 'function');
    assert.strictEqual(typeof plugin.generateLastReadLayoutXml, 'function');
  });

  it('modifies AndroidManifest with widget receivers and exact alarm permissions', async () => {
    const { modifyAndroidManifest } = await import('./withAndroidWidgets.js');
    const mockManifest = {
      manifest: {
        $: { 'xmlns:android': 'http://schemas.android.com/apk/res/android' },
        'uses-permission': [],
        application: [
          {
            $: { 'android:name': '.MainApplication' },
            receiver: [],
          },
        ],
      },
    };

    const modified = modifyAndroidManifest(mockManifest);
    const permissions = modified.manifest['uses-permission'].map((p) => p.$['android:name']);
    assert.ok(permissions.includes('android.permission.SCHEDULE_EXACT_ALARM'));
    assert.ok(permissions.includes('android.permission.USE_EXACT_ALARM'));

    const receivers = modified.manifest.application[0].receiver;
    assert.ok(receivers.length >= 4);

    const prayerReceiver = receivers.find((r) =>
      r.$['android:name'].includes('PrayerWidgetProvider'),
    );
    assert.ok(prayerReceiver, 'PrayerWidgetProvider receiver must exist');
    assert.strictEqual(prayerReceiver.$['android:exported'], 'true');

    const ayahReceiver = receivers.find((r) =>
      r.$['android:name'].includes('DailyAyahWidgetProvider'),
    );
    assert.ok(ayahReceiver, 'DailyAyahWidgetProvider receiver must exist');

    const lastReadReceiver = receivers.find((r) =>
      r.$['android:name'].includes('LastReadWidgetProvider'),
    );
    assert.ok(lastReadReceiver, 'LastReadWidgetProvider receiver must exist');

    const alarmReceiver = receivers.find((r) =>
      r.$['android:name'].includes('WidgetAlarmReceiver'),
    );
    assert.ok(alarmReceiver, 'WidgetAlarmReceiver must exist');
  });

  it('generates PrayerWidgetProvider.kt with SharedPreferences, JSON parsing, and AlarmManager', async () => {
    const { generatePrayerWidgetProviderKt } = await import('./withAndroidWidgets.js');
    const kt = generatePrayerWidgetProviderKt();

    assert.ok(kt.includes('class PrayerWidgetProvider : AppWidgetProvider()'));
    assert.ok(kt.includes('"ir.quran.app.widget_data"'));
    assert.ok(kt.includes('quranir://prayers'));
    assert.ok(kt.includes('AlarmManager.RTC_WAKEUP') || kt.includes('setExactAndAllowWhileIdle'));
    assert.ok(kt.includes('RemoteViews'));
    assert.ok(kt.includes('PendingIntent.FLAG_IMMUTABLE') || kt.includes('FLAG_UPDATE_CURRENT'));
  });

  it('generates DailyAyahWidgetProvider.kt with deep link to reader and verse data', async () => {
    const { generateDailyAyahWidgetProviderKt } = await import('./withAndroidWidgets.js');
    const kt = generateDailyAyahWidgetProviderKt();

    assert.ok(kt.includes('class DailyAyahWidgetProvider : AppWidgetProvider()'));
    assert.ok(kt.includes('"ir.quran.app.widget_data"'));
    assert.ok(kt.includes('dailyAyah'));
    assert.ok(kt.includes('quranir://surah/'));
  });

  it('generates LastReadWidgetProvider.kt with deep link to resume position', async () => {
    const { generateLastReadWidgetProviderKt } = await import('./withAndroidWidgets.js');
    const kt = generateLastReadWidgetProviderKt();

    assert.ok(kt.includes('class LastReadWidgetProvider : AppWidgetProvider()'));
    assert.ok(kt.includes('"ir.quran.app.widget_data"'));
    assert.ok(kt.includes('lastRead'));
    assert.ok(kt.includes('quranir://surah/'));
  });

  it('generates WidgetAlarmReceiver.kt for waking and updating widgets on milestone transitions', async () => {
    const { generateWidgetAlarmReceiverKt } = await import('./withAndroidWidgets.js');
    const kt = generateWidgetAlarmReceiverKt();

    assert.ok(kt.includes('class WidgetAlarmReceiver : BroadcastReceiver()'));
    assert.ok(kt.includes('onReceive'));
    assert.ok(kt.includes('PrayerWidgetProvider.updateAppWidget'));
  });

  it('generates XML layouts with RTL direction and Dark Emerald color palette', async () => {
    const {
      generatePrayerMediumLayoutXml,
      generatePrayerSmallLayoutXml,
      generateDailyAyahLayoutXml,
      generateLastReadLayoutXml,
    } = await import('./withAndroidWidgets.js');

    const prayerMedium = generatePrayerMediumLayoutXml();
    assert.ok(prayerMedium.includes('android:layoutDirection="rtl"'));
    assert.ok(prayerMedium.includes('#041410') || prayerMedium.includes('#071811'));
    assert.ok(prayerMedium.includes('@+id/widget_prayer_countdown'));
    assert.ok(prayerMedium.includes('@+id/widget_prayer_city'));

    const prayerSmall = generatePrayerSmallLayoutXml();
    assert.ok(prayerSmall.includes('android:layoutDirection="rtl"'));
    assert.ok(prayerSmall.includes('@+id/widget_prayer_name'));
    assert.ok(prayerSmall.includes('@+id/widget_prayer_time'));

    const dailyAyah = generateDailyAyahLayoutXml();
    assert.ok(dailyAyah.includes('android:layoutDirection="rtl"'));
    assert.ok(dailyAyah.includes('@+id/widget_ayah_arabic'));
    assert.ok(dailyAyah.includes('@+id/widget_ayah_translation'));

    const lastRead = generateLastReadLayoutXml();
    assert.ok(lastRead.includes('android:layoutDirection="rtl"'));
    assert.ok(lastRead.includes('@+id/widget_last_read_surah'));
    assert.ok(lastRead.includes('@+id/widget_last_read_action'));
  });
});
