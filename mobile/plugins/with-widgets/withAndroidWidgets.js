const { withAndroidManifest, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const PACKAGE_NAME = 'ir.quran.app';
const WIDGETS_PACKAGE = 'ir.quran.app.widgets';

/**
 * Modifies AndroidManifest.xml by adding exact alarm permissions
 * and declaring the widget broadcast receivers.
 */
function modifyAndroidManifest(androidManifest) {
  const manifest = androidManifest.manifest;

  // 1. Ensure uses-permission array exists
  if (!manifest['uses-permission']) {
    manifest['uses-permission'] = [];
  }

  const existingPermissions = manifest['uses-permission'].map((p) => p.$['android:name']);

  const requiredPermissions = [
    'android.permission.SCHEDULE_EXACT_ALARM',
    'android.permission.USE_EXACT_ALARM',
  ];

  for (const perm of requiredPermissions) {
    if (!existingPermissions.includes(perm)) {
      manifest['uses-permission'].push({
        $: { 'android:name': perm },
      });
    }
  }

  // 2. Ensure application element exists
  const app = manifest.application?.[0];
  if (!app) {
    return androidManifest;
  }

  if (!app.receiver) {
    app.receiver = [];
  }

  const existingReceivers = app.receiver.map((r) => r.$['android:name']);

  const receiversToAdd = [
    {
      name: `${WIDGETS_PACKAGE}.PrayerWidgetProvider`,
      exported: 'true',
      metaDataName: 'android.appwidget.provider',
      metaDataResource: '@xml/widget_prayer_medium_info',
    },
    {
      name: `${WIDGETS_PACKAGE}.PrayerWidgetSmallProvider`,
      exported: 'true',
      metaDataName: 'android.appwidget.provider',
      metaDataResource: '@xml/widget_prayer_small_info',
    },
    {
      name: `${WIDGETS_PACKAGE}.DailyAyahWidgetProvider`,
      exported: 'true',
      metaDataName: 'android.appwidget.provider',
      metaDataResource: '@xml/widget_daily_ayah_medium_info',
    },
    {
      name: `${WIDGETS_PACKAGE}.LastReadWidgetProvider`,
      exported: 'true',
      metaDataName: 'android.appwidget.provider',
      metaDataResource: '@xml/widget_last_read_medium_info',
    },
    {
      name: `${WIDGETS_PACKAGE}.WidgetAlarmReceiver`,
      exported: 'false',
    },
  ];

  for (const rec of receiversToAdd) {
    if (!existingReceivers.includes(rec.name)) {
      const receiverXml = {
        $: {
          'android:name': rec.name,
          'android:exported': rec.exported,
        },
      };

      if (rec.metaDataName) {
        receiverXml['intent-filter'] = [
          {
            action: [
              {
                $: {
                  'android:name': 'android.appwidget.action.APPWIDGET_UPDATE',
                },
              },
            ],
          },
        ];
        receiverXml['meta-data'] = [
          {
            $: {
              'android:name': rec.metaDataName,
              'android:resource': rec.metaDataResource,
            },
          },
        ];
      }

      app.receiver.push(receiverXml);
    }
  }

  return androidManifest;
}

/**
 * Kotlin Template: PrayerWidgetProvider
 */
function generatePrayerWidgetProviderKt() {
  return `package ${WIDGETS_PACKAGE}

import android.app.AlarmManager
import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.widget.RemoteViews
import org.json.JSONObject

class PrayerWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private const val PREFS_NAME = "ir.quran.app.widget_data"
        private const val DATA_KEY = "widget_data"
        private const val DEFAULT_DEEP_LINK = "quranir://prayers"

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val packageName = context.packageName
            val layoutId = context.resources.getIdentifier("widget_prayer_medium", "layout", packageName)
            val views = RemoteViews(packageName, layoutId)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val rawJson = prefs.getString(DATA_KEY, null)

            var cityName = "تهران"
            var nextPrayerName = "اذان ظهر"
            var nextPrayerTime = "۱۲:۰۰"
            var countdownText = "هم‌اکنون"
            var nextMilestoneTimestamp = 0L

            if (!rawJson.isNullOrEmpty()) {
                try {
                    val root = JSONObject(rawJson)
                    val prayerTimes = root.optJSONObject("prayerTimes")
                    if (prayerTimes != null) {
                        cityName = prayerTimes.optString("cityNameFa", "تهران")
                        val scheduleArr = prayerTimes.optJSONArray("schedule")
                        if (scheduleArr != null && scheduleArr.length() > 0) {
                            val today = scheduleArr.getJSONObject(0)
                            val milestones = today.optJSONArray("milestones")
                            val now = System.currentTimeMillis()

                            if (milestones != null) {
                                for (i in 0 until milestones.length()) {
                                    val m = milestones.getJSONObject(i)
                                    val ts = m.optLong("timestamp", 0L)
                                    if (ts > now) {
                                        nextPrayerName = m.optString("nameFa", "نماز")
                                        nextPrayerTime = m.optString("timeFa", "")
                                        nextMilestoneTimestamp = ts
                                        val remainingMin = (ts - now) / 60000
                                        countdownText = "$remainingMin دقیقه تا $nextPrayerName"
                                        break
                                    }
                                }
                            }
                        }
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            val cityId = context.resources.getIdentifier("widget_prayer_city", "id", packageName)
            val nameId = context.resources.getIdentifier("widget_prayer_name", "id", packageName)
            val timeId = context.resources.getIdentifier("widget_prayer_time", "id", packageName)
            val countdownId = context.resources.getIdentifier("widget_prayer_countdown", "id", packageName)

            if (cityId != 0) views.setTextViewText(cityId, "افق $cityName")
            if (nameId != 0) views.setTextViewText(nameId, nextPrayerName)
            if (timeId != 0) views.setTextViewText(timeId, nextPrayerTime)
            if (countdownId != 0) views.setTextViewText(countdownId, countdownText)

            // Deep link on click
            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(DEFAULT_DEEP_LINK)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getActivity(context, 101, intent, flags)
            val containerId = context.resources.getIdentifier("widget_container", "id", packageName)
            if (containerId != 0) {
                views.setOnClickPendingIntent(containerId, pendingIntent)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)

            // Schedule milestone alarm
            if (nextMilestoneTimestamp > System.currentTimeMillis()) {
                scheduleNextAlarm(context, nextMilestoneTimestamp)
            }
        }

        private fun scheduleNextAlarm(context: Context, triggerAtMillis: Long) {
            val alarmManager = context.getSystemService(Context.ALARM_SERVICE) as? AlarmManager ?: return
            val intent = Intent(context, WidgetAlarmReceiver::class.java).apply {
                action = "ir.quran.app.ACTION_PRAYER_TICK"
            }
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getBroadcast(context, 201, intent, flags)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            } else {
                alarmManager.setExact(AlarmManager.RTC_WAKEUP, triggerAtMillis, pendingIntent)
            }
        }
    }
}
`;
}

/**
 * Kotlin Template: DailyAyahWidgetProvider
 */
function generateDailyAyahWidgetProviderKt() {
  return `package ${WIDGETS_PACKAGE}

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.widget.RemoteViews
import org.json.JSONObject

class DailyAyahWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private const val PREFS_NAME = "ir.quran.app.widget_data"
        private const val DATA_KEY = "widget_data"

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val packageName = context.packageName
            val layoutId = context.resources.getIdentifier("widget_daily_ayah_medium", "layout", packageName)
            val views = RemoteViews(packageName, layoutId)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val rawJson = prefs.getString(DATA_KEY, null)

            var arabicText = "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ"
            var translationFa = "خداوند هیچ معبودی جز او نیست؛ زنده و برپادارنده است."
            var citation = "سوره بقره • آیه ۲۵۵"
            var deepLinkUrl = "quranir://surah/2?verse=255&page=42"

            if (!rawJson.isNullOrEmpty()) {
                try {
                    val root = JSONObject(rawJson)
                    val ayahObj = root.optJSONObject("dailyAyah")
                    if (ayahObj != null) {
                        arabicText = ayahObj.optString("arabicText", arabicText)
                        translationFa = ayahObj.optString("translationFa", translationFa)
                        val surahName = ayahObj.optString("surahNameFa", "بقره")
                        val ayahNum = ayahObj.optInt("ayahNumber", 255)
                        citation = "سوره $surahName • آیه $ayahNum"
                        deepLinkUrl = ayahObj.optString("deepLinkUrl", deepLinkUrl)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            val arabicId = context.resources.getIdentifier("widget_ayah_arabic", "id", packageName)
            val transId = context.resources.getIdentifier("widget_ayah_translation", "id", packageName)
            val citeId = context.resources.getIdentifier("widget_ayah_citation", "id", packageName)

            if (arabicId != 0) views.setTextViewText(arabicId, arabicText)
            if (transId != 0) views.setTextViewText(transId, translationFa)
            if (citeId != 0) views.setTextViewText(citeId, citation)

            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUrl)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getActivity(context, 102, intent, flags)
            val containerId = context.resources.getIdentifier("widget_container", "id", packageName)
            if (containerId != 0) {
                views.setOnClickPendingIntent(containerId, pendingIntent)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
`;
}

/**
 * Kotlin Template: LastReadWidgetProvider
 */
function generateLastReadWidgetProviderKt() {
  return `package ${WIDGETS_PACKAGE}

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.widget.RemoteViews
import org.json.JSONObject

class LastReadWidgetProvider : AppWidgetProvider() {

    override fun onUpdate(context: Context, appWidgetManager: AppWidgetManager, appWidgetIds: IntArray) {
        for (appWidgetId in appWidgetIds) {
            updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }

    companion object {
        private const val PREFS_NAME = "ir.quran.app.widget_data"
        private const val DATA_KEY = "widget_data"

        fun updateAppWidget(context: Context, appWidgetManager: AppWidgetManager, appWidgetId: Int) {
            val packageName = context.packageName
            val layoutId = context.resources.getIdentifier("widget_last_read_medium", "layout", packageName)
            val views = RemoteViews(packageName, layoutId)

            val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            val rawJson = prefs.getString(DATA_KEY, null)

            var surahName = "یس"
            var metaText = "آیه ۱ • صفحه ۴۴۰ • جزء ۲۲"
            var deepLinkUrl = "quranir://surah/36?verse=1&page=440"

            if (!rawJson.isNullOrEmpty()) {
                try {
                    val root = JSONObject(rawJson)
                    val readObj = root.optJSONObject("lastRead")
                    if (readObj != null) {
                        surahName = readObj.optString("surahNameFa", "یس")
                        val ayahNum = readObj.optInt("ayahNumber", 1)
                        val pageNum = readObj.optInt("pageNumber", 1)
                        val juzNum = readObj.optInt("juzNumber", 1)
                        metaText = "آیه $ayahNum • صفحه $pageNum • جزء $juzNum"
                        deepLinkUrl = readObj.optString("deepLinkUrl", deepLinkUrl)
                    }
                } catch (e: Exception) {
                    e.printStackTrace()
                }
            }

            val surahId = context.resources.getIdentifier("widget_last_read_surah", "id", packageName)
            val metaId = context.resources.getIdentifier("widget_last_read_meta", "id", packageName)
            val actionId = context.resources.getIdentifier("widget_last_read_action", "id", packageName)

            if (surahId != 0) views.setTextViewText(surahId, "سوره $surahName")
            if (metaId != 0) views.setTextViewText(metaId, metaText)
            if (actionId != 0) views.setTextViewText(actionId, "ادامه تلاوت")

            val intent = Intent(Intent.ACTION_VIEW, Uri.parse(deepLinkUrl)).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            }
            val flags = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
            val pendingIntent = PendingIntent.getActivity(context, 103, intent, flags)
            val containerId = context.resources.getIdentifier("widget_container", "id", packageName)
            if (containerId != 0) {
                views.setOnClickPendingIntent(containerId, pendingIntent)
            }

            appWidgetManager.updateAppWidget(appWidgetId, views)
        }
    }
}
`;
}

/**
 * Kotlin Template: WidgetAlarmReceiver
 */
function generateWidgetAlarmReceiverKt() {
  return `package ${WIDGETS_PACKAGE}

import android.appwidget.AppWidgetManager
import android.content.BroadcastReceiver
import android.content.ComponentName
import android.content.Context
import android.content.Intent

class WidgetAlarmReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val appWidgetManager = AppWidgetManager.getInstance(context)
        val prayerComponent = ComponentName(context, PrayerWidgetProvider::class.java)
        val appWidgetIds = appWidgetManager.getAppWidgetIds(prayerComponent)

        for (appWidgetId in appWidgetIds) {
            PrayerWidgetProvider.updateAppWidget(context, appWidgetManager, appWidgetId)
        }
    }
}
`;
}

/**
 * XML Template: widget_prayer_medium.xml
 */
function generatePrayerMediumLayoutXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:layoutDirection="rtl"
    android:background="#041410"
    android:padding="12dp">

    <TextView
        android:id="@+id/widget_prayer_countdown"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:layout_alignParentStart="true"
        android:textColor="#F59E0B"
        android:textSize="12sp"
        android:text="۴۲ دقیقه تا اذان ظهر" />

    <TextView
        android:id="@+id/widget_prayer_city"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:layout_alignParentEnd="true"
        android:textColor="#10B981"
        android:textSize="12sp"
        android:text="افق تهران" />

    <LinearLayout
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_centerInParent="true"
        android:orientation="vertical"
        android:gravity="center">

        <TextView
            android:id="@+id/widget_prayer_name"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="#FFFFFF"
            android:textSize="20sp"
            android:textStyle="bold"
            android:text="اذان ظهر" />

        <TextView
            android:id="@+id/widget_prayer_time"
            android:layout_width="wrap_content"
            android:layout_height="wrap_content"
            android:textColor="#F59E0B"
            android:textSize="24sp"
            android:textStyle="bold"
            android:text="۱۱:۵۴" />
    </LinearLayout>
</RelativeLayout>
`;
}

/**
 * XML Template: widget_prayer_small.xml
 */
function generatePrayerSmallLayoutXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<LinearLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:layoutDirection="rtl"
    android:background="#041410"
    android:orientation="vertical"
    android:gravity="center"
    android:padding="8dp">

    <TextView
        android:id="@+id/widget_prayer_name"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textColor="#FFFFFF"
        android:textSize="16sp"
        android:textStyle="bold"
        android:text="اذان ظهر" />

    <TextView
        android:id="@+id/widget_prayer_time"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textColor="#F59E0B"
        android:textSize="22sp"
        android:textStyle="bold"
        android:text="۱۱:۵۴" />

    <TextView
        android:id="@+id/widget_prayer_countdown"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:textColor="#10B981"
        android:textSize="11sp"
        android:text="۴۲ دقیقه" />
</LinearLayout>
`;
}

/**
 * XML Template: widget_daily_ayah_medium.xml
 */
function generateDailyAyahLayoutXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:layoutDirection="rtl"
    android:background="#041410"
    android:padding="12dp">

    <TextView
        android:id="@+id/widget_ayah_citation"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:layout_alignParentStart="true"
        android:textColor="#10B981"
        android:textSize="12sp"
        android:text="سوره بقره • آیه ۲۵۵" />

    <TextView
        android:id="@+id/widget_ayah_arabic"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_below="@id/widget_ayah_citation"
        android:layout_marginTop="6dp"
        android:textColor="#FFFFFF"
        android:textSize="15sp"
        android:maxLines="2"
        android:ellipsize="end"
        android:text="اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ" />

    <TextView
        android:id="@+id/widget_ayah_translation"
        android:layout_width="match_parent"
        android:layout_height="wrap_content"
        android:layout_below="@id/widget_ayah_arabic"
        android:layout_marginTop="4dp"
        android:textColor="#D1D5DB"
        android:textSize="12sp"
        android:maxLines="2"
        android:ellipsize="end"
        android:text="خداوند هیچ معبودی جز او نیست؛ زنده و برپادارنده است." />
</RelativeLayout>
`;
}

/**
 * XML Template: widget_last_read_medium.xml
 */
function generateLastReadLayoutXml() {
  return `<?xml version="1.0" encoding="utf-8"?>
<RelativeLayout xmlns:android="http://schemas.android.com/apk/res/android"
    android:id="@+id/widget_container"
    android:layout_width="match_parent"
    android:layout_height="match_parent"
    android:layoutDirection="rtl"
    android:background="#041410"
    android:padding="12dp">

    <TextView
        android:id="@+id/widget_last_read_surah"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentTop="true"
        android:layout_alignParentStart="true"
        android:textColor="#FFFFFF"
        android:textSize="18sp"
        android:textStyle="bold"
        android:text="سوره یس" />

    <TextView
        android:id="@+id/widget_last_read_meta"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_below="@id/widget_last_read_surah"
        android:layout_marginTop="4dp"
        android:textColor="#D1D5DB"
        android:textSize="13sp"
        android:text="آیه ۱ • صفحه ۴۴۰ • جزء ۲۲" />

    <TextView
        android:id="@+id/widget_last_read_action"
        android:layout_width="wrap_content"
        android:layout_height="wrap_content"
        android:layout_alignParentBottom="true"
        android:layout_alignParentStart="true"
        android:textColor="#10B981"
        android:textSize="12sp"
        android:text="ادامه تلاوت ←" />
</RelativeLayout>
`;
}

/**
 * Provider Info XML Generators
 */
function generateWidgetInfoXml(options) {
  const { minWidth, minHeight, updatePeriodMillis = 1800000, layoutRes } = options;
  return `<?xml version="1.0" encoding="utf-8"?>
<appwidget-provider xmlns:android="http://schemas.android.com/apk/res/android"
    android:minWidth="${minWidth}dp"
    android:minHeight="${minHeight}dp"
    android:updatePeriodMillis="${updatePeriodMillis}"
    android:initialLayout="@layout/${layoutRes}"
    android:resizeMode="horizontal|vertical"
    android:widgetCategory="home_screen" />
`;
}

/**
 * Expo Config Plugin implementation for Android OS Widgets
 */
function withAndroidWidgets(config, options = {}) {
  // 1. Modify AndroidManifest.xml
  config = withAndroidManifest(config, (config) => {
    config.modResults = modifyAndroidManifest(config.modResults);
    return config;
  });

  // 2. Dangerous Mod to write native Kotlin and XML files into android directory
  config = withDangerousMod(config, [
    'android',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const androidRoot = path.join(projectRoot, 'android');

      if (!fs.existsSync(androidRoot)) {
        // Not in prebuild / bare environment, skip file generation
        return config;
      }

      const javaDir = path.join(androidRoot, 'app/src/main/java/ir/quran/app/widgets');
      const resDir = path.join(androidRoot, 'app/src/main/res');
      const layoutDir = path.join(resDir, 'layout');
      const xmlDir = path.join(resDir, 'xml');

      fs.mkdirSync(javaDir, { recursive: true });
      fs.mkdirSync(layoutDir, { recursive: true });
      fs.mkdirSync(xmlDir, { recursive: true });

      // Write Kotlin Providers
      fs.writeFileSync(
        path.join(javaDir, 'PrayerWidgetProvider.kt'),
        generatePrayerWidgetProviderKt(),
      );
      fs.writeFileSync(
        path.join(javaDir, 'DailyAyahWidgetProvider.kt'),
        generateDailyAyahWidgetProviderKt(),
      );
      fs.writeFileSync(
        path.join(javaDir, 'LastReadWidgetProvider.kt'),
        generateLastReadWidgetProviderKt(),
      );
      fs.writeFileSync(
        path.join(javaDir, 'WidgetAlarmReceiver.kt'),
        generateWidgetAlarmReceiverKt(),
      );

      // Write Layout XMLs
      fs.writeFileSync(
        path.join(layoutDir, 'widget_prayer_medium.xml'),
        generatePrayerMediumLayoutXml(),
      );
      fs.writeFileSync(
        path.join(layoutDir, 'widget_prayer_small.xml'),
        generatePrayerSmallLayoutXml(),
      );
      fs.writeFileSync(
        path.join(layoutDir, 'widget_daily_ayah_medium.xml'),
        generateDailyAyahLayoutXml(),
      );
      fs.writeFileSync(
        path.join(layoutDir, 'widget_last_read_medium.xml'),
        generateLastReadLayoutXml(),
      );

      // Write Provider Info XMLs
      fs.writeFileSync(
        path.join(xmlDir, 'widget_prayer_medium_info.xml'),
        generateWidgetInfoXml({
          minWidth: 250,
          minHeight: 110,
          layoutRes: 'widget_prayer_medium',
        }),
      );
      fs.writeFileSync(
        path.join(xmlDir, 'widget_prayer_small_info.xml'),
        generateWidgetInfoXml({
          minWidth: 110,
          minHeight: 110,
          layoutRes: 'widget_prayer_small',
        }),
      );
      fs.writeFileSync(
        path.join(xmlDir, 'widget_daily_ayah_medium_info.xml'),
        generateWidgetInfoXml({
          minWidth: 250,
          minHeight: 110,
          layoutRes: 'widget_daily_ayah_medium',
        }),
      );
      fs.writeFileSync(
        path.join(xmlDir, 'widget_last_read_medium_info.xml'),
        generateWidgetInfoXml({
          minWidth: 250,
          minHeight: 110,
          layoutRes: 'widget_last_read_medium',
        }),
      );

      return config;
    },
  ]);

  return config;
}

module.exports = withAndroidWidgets;
module.exports.default = withAndroidWidgets;
module.exports.withAndroidWidgets = withAndroidWidgets;
module.exports.modifyAndroidManifest = modifyAndroidManifest;
module.exports.generatePrayerWidgetProviderKt = generatePrayerWidgetProviderKt;
module.exports.generateDailyAyahWidgetProviderKt = generateDailyAyahWidgetProviderKt;
module.exports.generateLastReadWidgetProviderKt = generateLastReadWidgetProviderKt;
module.exports.generateWidgetAlarmReceiverKt = generateWidgetAlarmReceiverKt;
module.exports.generatePrayerMediumLayoutXml = generatePrayerMediumLayoutXml;
module.exports.generatePrayerSmallLayoutXml = generatePrayerSmallLayoutXml;
module.exports.generateDailyAyahLayoutXml = generateDailyAyahLayoutXml;
module.exports.generateLastReadLayoutXml = generateLastReadLayoutXml;
module.exports.generateWidgetInfoXml = generateWidgetInfoXml;
