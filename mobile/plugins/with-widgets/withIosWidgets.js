const { withEntitlementsPlist, withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const APP_GROUP_ID = 'group.ir.quran.app';

/**
 * Modifies iOS entitlements to include the shared App Group.
 */
function modifyEntitlements(entitlements) {
  if (!entitlements['com.apple.security.application-groups']) {
    entitlements['com.apple.security.application-groups'] = [];
  }

  const groups = entitlements['com.apple.security.application-groups'];
  if (!groups.includes(APP_GROUP_ID)) {
    groups.push(APP_GROUP_ID);
  }

  return entitlements;
}

/**
 * Swift Template: QuranWidgetsBundle
 */
function generateQuranWidgetsBundleSwift() {
  return `import WidgetKit
import SwiftUI

@main
struct QuranWidgetsBundle: WidgetBundle {
    var body: some Widget {
        PrayerWidget()
        DailyAyahWidget()
        LastReadWidget()
    }
}
`;
}

/**
 * Swift Template: PrayerWidget (with dynamic relative countdown)
 */
function generatePrayerWidgetSwift() {
  return `import WidgetKit
import SwiftUI

struct PrayerEntry: TimelineEntry {
    let date: Date
    let targetDate: Date
    let prayerNameFa: String
    let timeFa: String
    let cityNameFa: String
    let isPast: Bool
}

struct PrayerTimelineProvider: TimelineProvider {
    typealias Entry = PrayerEntry

    private let appGroup = "${APP_GROUP_ID}"
    private let dataKey = "widget_data"

    func placeholder(in context: Context) -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            targetDate: Date().addingTimeInterval(2520),
            prayerNameFa: "اذان ظهر",
            timeFa: "۱۱:۵۴",
            cityNameFa: "تهران",
            isPast: false
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (PrayerEntry) -> Void) {
        completion(createCurrentEntry())
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<PrayerEntry>) -> Void) {
        var entries: [PrayerEntry] = []
        let userDefaults = UserDefaults(suiteName: "group.ir.quran.app")
        let rawJson = userDefaults?.string(forKey: dataKey)
        let now = Date()

        if let rawJson = rawJson, let data = rawJson.data(using: .utf8) {
            do {
                if let root = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let prayerTimes = root["prayerTimes"] as? [String: Any],
                   let cityName = prayerTimes["cityNameFa"] as? String,
                   let schedule = prayerTimes["schedule"] as? [[String: Any]] {

                    for day in schedule {
                        if let milestones = day["milestones"] as? [[String: Any]] {
                            for m in milestones {
                                if let ts = m["timestamp"] as? Double,
                                   let nameFa = m["nameFa"] as? String,
                                   let timeFa = m["timeFa"] as? String {
                                    let milestoneDate = Date(timeIntervalSince1970: ts / 1000.0)
                                    if milestoneDate > now {
                                        entries.append(PrayerEntry(
                                            date: entries.isEmpty ? now : milestoneDate.addingTimeInterval(-1800),
                                            targetDate: milestoneDate,
                                            prayerNameFa: nameFa,
                                            timeFa: timeFa,
                                            cityNameFa: cityName,
                                            isPast: false
                                        ))
                                    }
                                }
                            }
                        }
                    }
                }
            } catch {
                // Fallback
            }
        }

        if entries.isEmpty {
            entries.append(createCurrentEntry())
        }

        let nextUpdate = entries.first?.targetDate.addingTimeInterval(60) ?? now.addingTimeInterval(1800)
        let timeline = Timeline(entries: entries, policy: .after(nextUpdate))
        completion(timeline)
    }

    private func createCurrentEntry() -> PrayerEntry {
        PrayerEntry(
            date: Date(),
            targetDate: Date().addingTimeInterval(2520),
            prayerNameFa: "اذان ظهر",
            timeFa: "۱۱:۵۴",
            cityNameFa: "تهران",
            isPast: false
        )
    }
}

struct PrayerWidgetEntryView: View {
    var entry: PrayerTimelineProvider.Entry
    @Environment(\\.widgetFamily) var family

    var body: some View {
        ZStack {
            Color(red: 4.0/255.0, green: 20.0/255.0, blue: 16.0/255.0)

            if family == .systemSmall {
                VStack(spacing: 6) {
                    Text(entry.prayerNameFa)
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)

                    Text(entry.timeFa)
                        .font(.system(size: 22, weight: .bold))
                        .foregroundColor(Color(red: 245.0/255.0, green: 158.0/255.0, blue: 11.0/255.0))

                    Text(entry.targetDate, style: .relative)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(Color(red: 16.0/255.0, green: 185.0/255.0, blue: 129.0/255.0))
                }
                .padding()
            } else {
                HStack {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(entry.prayerNameFa)
                            .font(.system(size: 20, weight: .bold))
                            .foregroundColor(.white)

                        Text(entry.timeFa)
                            .font(.system(size: 26, weight: .bold))
                            .foregroundColor(Color(red: 245.0/255.0, green: 158.0/255.0, blue: 11.0/255.0))

                        Text(entry.targetDate, style: .relative)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(Color(red: 16.0/255.0, green: 185.0/255.0, blue: 129.0/255.0))
                    }

                    Spacer()

                    VStack(alignment: .trailing, spacing: 8) {
                        Text("افق " + entry.cityNameFa)
                            .font(.system(size: 13, weight: .medium))
                            .foregroundColor(Color(red: 16.0/255.0, green: 185.0/255.0, blue: 129.0/255.0))

                        Text("اوقات شرعی")
                            .font(.system(size: 11))
                            .foregroundColor(.gray)
                    }
                }
                .padding()
            }
        }
        .widgetURL(URL(string: "quranir://prayers"))
    }
}

struct PrayerWidget: Widget {
    let kind: String = "PrayerWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: PrayerTimelineProvider()) { entry in
            PrayerWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("اوقات شرعی")
        .description("نمایش اذان‌های یومیه و شمارش معکوس به وقت افق انتخابی.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
`;
}

/**
 * Swift Template: DailyAyahWidget
 */
function generateDailyAyahWidgetSwift() {
  return `import WidgetKit
import SwiftUI

struct DailyAyahEntry: TimelineEntry {
    let date: Date
    let surahNameFa: String
    let ayahNumber: Int
    let arabicText: String
    let translationFa: String
    let deepLinkUrl: String
}

struct DailyAyahTimelineProvider: TimelineProvider {
    typealias Entry = DailyAyahEntry
    private let appGroup = "${APP_GROUP_ID}"
    private let dataKey = "widget_data"

    func placeholder(in context: Context) -> DailyAyahEntry {
        DailyAyahEntry(
            date: Date(),
            surahNameFa: "بقره",
            ayahNumber: 255,
            arabicText: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
            translationFa: "خداوند هیچ معبودی جز او نیست؛ زنده و برپادارنده است.",
            deepLinkUrl: "quranir://surah/2?verse=255&page=42"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (DailyAyahEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<DailyAyahEntry>) -> Void) {
        let userDefaults = UserDefaults(suiteName: "group.ir.quran.app")
        let rawJson = userDefaults?.string(forKey: dataKey)
        var entry = placeholder(in: context)

        if let rawJson = rawJson, let data = rawJson.data(using: .utf8) {
            do {
                if let root = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let dailyAyah = root["dailyAyah"] as? [String: Any] {
                    let surah = dailyAyah["surahNameFa"] as? String ?? "بقره"
                    let ayah = dailyAyah["ayahNumber"] as? Int ?? 255
                    let arabic = dailyAyah["arabicText"] as? String ?? ""
                    let trans = dailyAyah["translationFa"] as? String ?? ""
                    let link = dailyAyah["deepLinkUrl"] as? String ?? "quranir://surah/2?verse=255&page=42"

                    entry = DailyAyahEntry(
                        date: Date(),
                        surahNameFa: surah,
                        ayahNumber: ayah,
                        arabicText: arabic,
                        translationFa: trans,
                        deepLinkUrl: link
                    )
                }
            } catch {
                // Fallback
            }
        }

        let nextMidnight = Calendar.current.nextDate(
            after: Date(),
            matching: DateComponents(hour: 0, minute: 1),
            matchingPolicy: .nextTime
        ) ?? Date().addingTimeInterval(86400)

        let timeline = Timeline(entries: [entry], policy: .after(nextMidnight))
        completion(timeline)
    }
}

struct DailyAyahWidgetEntryView: View {
    var entry: DailyAyahTimelineProvider.Entry

    var body: some View {
        ZStack {
            Color(red: 4.0/255.0, green: 20.0/255.0, blue: 16.0/255.0)

            VStack(alignment: .trailing, spacing: 6) {
                HStack {
                    Text("آیه روز")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(red: 245.0/255.0, green: 158.0/255.0, blue: 11.0/255.0))
                    Spacer()
                    Text("سوره " + entry.surahNameFa + " • آیه " + String(entry.ayahNumber))
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(Color(red: 16.0/255.0, green: 185.0/255.0, blue: 129.0/255.0))
                }

                Text(entry.arabicText)
                    .font(.system(size: 14, weight: .regular))
                    .foregroundColor(.white)
                    .lineLimit(2)
                    .multilineTextAlignment(.trailing)

                Text(entry.translationFa)
                    .font(.system(size: 11, weight: .regular))
                    .foregroundColor(Color(red: 209.0/255.0, green: 213.0/255.0, blue: 219.0/255.0))
                    .lineLimit(2)
                    .multilineTextAlignment(.trailing)
            }
            .padding()
        }
        .widgetURL(URL(string: entry.deepLinkUrl))
    }
}

struct DailyAyahWidget: Widget {
    let kind: String = "DailyAyahWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: DailyAyahTimelineProvider()) { entry in
            DailyAyahWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("آیه روز")
        .description("تلاوت و تدبر در یک آیه نورانی به همراه ترجمه فارسی در هر روز.")
        .supportedFamilies([.systemMedium])
    }
}
`;
}

/**
 * Swift Template: LastReadWidget
 */
function generateLastReadWidgetSwift() {
  return `import WidgetKit
import SwiftUI

struct LastReadEntry: TimelineEntry {
    let date: Date
    let surahNameFa: String
    let ayahNumber: Int
    let pageNumber: Int
    let juzNumber: Int
    let deepLinkUrl: String
}

struct LastReadTimelineProvider: TimelineProvider {
    typealias Entry = LastReadEntry
    private let appGroup = "${APP_GROUP_ID}"
    private let dataKey = "widget_data"

    func placeholder(in context: Context) -> LastReadEntry {
        LastReadEntry(
            date: Date(),
            surahNameFa: "یس",
            ayahNumber: 1,
            pageNumber: 440,
            juzNumber: 22,
            deepLinkUrl: "quranir://surah/36?verse=1&page=440"
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (LastReadEntry) -> Void) {
        completion(placeholder(in: context))
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<LastReadEntry>) -> Void) {
        let userDefaults = UserDefaults(suiteName: "group.ir.quran.app")
        let rawJson = userDefaults?.string(forKey: dataKey)
        var entry = placeholder(in: context)

        if let rawJson = rawJson, let data = rawJson.data(using: .utf8) {
            do {
                if let root = try JSONSerialization.jsonObject(with: data) as? [String: Any],
                   let lastRead = root["lastRead"] as? [String: Any] {
                    let surah = lastRead["surahNameFa"] as? String ?? "یس"
                    let ayah = lastRead["ayahNumber"] as? Int ?? 1
                    let page = lastRead["pageNumber"] as? Int ?? 1
                    let juz = lastRead["juzNumber"] as? Int ?? 1
                    let link = lastRead["deepLinkUrl"] as? String ?? "quranir://surah/36?verse=1&page=440"

                    entry = LastReadEntry(
                        date: Date(),
                        surahNameFa: surah,
                        ayahNumber: ayah,
                        pageNumber: page,
                        juzNumber: juz,
                        deepLinkUrl: link
                    )
                }
            } catch {
                // Fallback
            }
        }

        let timeline = Timeline(entries: [entry], policy: .atEnd)
        completion(timeline)
    }
}

struct LastReadWidgetEntryView: View {
    var entry: LastReadTimelineProvider.Entry

    var body: some View {
        ZStack {
            Color(red: 4.0/255.0, green: 20.0/255.0, blue: 16.0/255.0)

            VStack(alignment: .trailing, spacing: 6) {
                HStack {
                    Text("آخرین تلاوت")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(Color(red: 245.0/255.0, green: 158.0/255.0, blue: 11.0/255.0))
                    Spacer()
                    Text("سوره " + entry.surahNameFa)
                        .font(.system(size: 14, weight: .bold))
                        .foregroundColor(.white)
                }

                Text("آیه " + String(entry.ayahNumber) + " • صفحه " + String(entry.pageNumber) + " • جزء " + String(entry.juzNumber))
                    .font(.system(size: 12))
                    .foregroundColor(Color(red: 209.0/255.0, green: 213.0/255.0, blue: 219.0/255.0))

                Spacer()

                HStack {
                    Spacer()
                    Text("ادامه تلاوت ←")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(Color(red: 16.0/255.0, green: 185.0/255.0, blue: 129.0/255.0))
                }
            }
            .padding()
        }
        .widgetURL(URL(string: entry.deepLinkUrl))
    }
}

struct LastReadWidget: Widget {
    let kind: String = "LastReadWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: LastReadTimelineProvider()) { entry in
            LastReadWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("ادامه تلاوت")
        .description("دسترسی سریع به آخرین صفحه و آیه خوانده شده در مصحف شریف.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
`;
}

/**
 * Expo Config Plugin implementation for iOS WidgetKit
 */
function withIosWidgets(config, options = {}) {
  // 1. Add App Group Entitlement
  config = withEntitlementsPlist(config, (config) => {
    config.modResults = modifyEntitlements(config.modResults);
    return config;
  });

  // 2. Dangerous Mod to write Swift widget files into ios directory
  config = withDangerousMod(config, [
    'ios',
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosRoot = path.join(projectRoot, 'ios');

      if (!fs.existsSync(iosRoot)) {
        // Not in prebuild / bare environment, skip file generation
        return config;
      }

      const widgetDir = path.join(iosRoot, 'QuranWidgetsExtension');
      fs.mkdirSync(widgetDir, { recursive: true });

      fs.writeFileSync(
        path.join(widgetDir, 'QuranWidgetsBundle.swift'),
        generateQuranWidgetsBundleSwift(),
      );
      fs.writeFileSync(path.join(widgetDir, 'PrayerWidget.swift'), generatePrayerWidgetSwift());
      fs.writeFileSync(
        path.join(widgetDir, 'DailyAyahWidget.swift'),
        generateDailyAyahWidgetSwift(),
      );
      fs.writeFileSync(path.join(widgetDir, 'LastReadWidget.swift'), generateLastReadWidgetSwift());

      return config;
    },
  ]);

  return config;
}

module.exports = withIosWidgets;
module.exports.default = withIosWidgets;
module.exports.withIosWidgets = withIosWidgets;
module.exports.modifyEntitlements = modifyEntitlements;
module.exports.generateQuranWidgetsBundleSwift = generateQuranWidgetsBundleSwift;
module.exports.generatePrayerWidgetSwift = generatePrayerWidgetSwift;
module.exports.generateDailyAyahWidgetSwift = generateDailyAyahWidgetSwift;
module.exports.generateLastReadWidgetSwift = generateLastReadWidgetSwift;
