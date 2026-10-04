# Quran.ir Home Screen Widgets & Offline Prayer Engine — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development
> (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build cross-platform Home Screen Widgets (OS Widgets) for iOS (WidgetKit/SwiftUI) and
Android (AppWidget/RemoteViews) along with a sub-minute precision offline Tehran Geophysics prayer
calculation engine, Daily Ayah selector, and in-app widget previewer for Quran.ir.

**Architecture:** Pure TypeScript calculation engines (Jean Meeus solar position equations and
SQLite-backed daily verse curation) serialize a rolling 7-day schedule (< 200 KB) into native shared
storage (iOS App Group `UserDefaults` and Android `SharedPreferences`). Native widgets consume this
lightweight payload with zero database overhead, utilizing SwiftUI live timers on iOS and
`AlarmManager` milestone transitions on Android.

**Tech Stack:** React Native 0.86, Expo SDK 57, TypeScript, Node.js test runner (`node --test`),
Expo Config Plugins, Swift/SwiftUI (WidgetKit), Kotlin/XML (Android RemoteViews).

---

## Global Constraints

- **Exact Precision**: Offline prayer calculation must match the official Calendar Center of the
  Institute of Geophysics, University of Tehran within $\le 4$ seconds across all dates (0 whole
  minutes error when rounded).
- **Timezone Law**: Iran operates on permanent IRST (UTC+3:30). Clocks do NOT shift for DST in
  Farvardin. International locations compute in UTC and format via local IANA timezone.
- **RTL & Justification**: All Persian widget text must flow Right-to-Left with proper typography
  and formatting via `formatRTLText()` and `normalizeQuranArabic()`.
- **Memory Limit**: iOS WidgetKit strictly limits memory to 30 MB. The widget must NEVER load
  `quran.db` directly; it reads only the pre-compiled JSON payload from the App Group.
- **Deep Linking**: All deep links must resolve cleanly in Expo Router without unhandled route
  crashes (`quranir://prayers` and `quranir://surah/{id}?verse={num}&page={page}`).
- **Testing**: Zero test regressions across existing 480 unit tests. All new code must be 100%
  covered by automated tests.

---

### Task 1: Tehran Astronomical Prayer Engine & Benchmarking

**Files:**

- Create: `mobile/src/services/prayer/tehranPrayerEngine.ts`
- Create: `mobile/src/services/prayer/iranianCities.ts`
- Test: `mobile/src/services/prayer/tehranPrayerEngine.test.mjs`

**Interfaces:**

- Consumes: Standard JavaScript `Date` and math primitives.
- Produces:

  ```typescript
  export interface PrayerMilestone {
    key:
      | 'imsak'
      | 'fajr'
      | 'sunrise'
      | 'dhuhr'
      | 'asr'
      | 'sunset'
      | 'maghrib'
      | 'isha'
      | 'midnight';
    nameFa: string;
    timestamp: number;
    timeFa: string;
  }
  export interface DayPrayerSchedule {
    dateIso: string;
    dateFa: string;
    milestones: PrayerMilestone[];
  }
  export function calculateTehranPrayers(
    year: number,
    month: number,
    day: number,
    lat?: number,
    lng?: number,
    tzOffset?: number,
  ): Record<string, string>;
  export function computeDayPrayerSchedule(
    date: Date,
    lat?: number,
    lng?: number,
    tzOffset?: number,
  ): DayPrayerSchedule;
  export function computeWeeklyPrayerSchedule(
    startDate: Date,
    lat?: number,
    lng?: number,
    tzOffset?: number,
  ): DayPrayerSchedule[];
  ```

- [ ] **Step 1: Write failing test with ground-truth Tehran Geophysics benchmarks**

Create `mobile/src/services/prayer/tehranPrayerEngine.test.mjs` testing Spring Equinox (Nowruz
2024-03-20), Summer Solstice (2024-06-21), Autumn Equinox (2024-09-22), Winter Solstice
(2024-12-21), and October 2026 for Tehran (`35.70° N, 51.42° E`):

```javascript
import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  calculateTehranPrayers,
  computeDayPrayerSchedule,
  computeWeeklyPrayerSchedule,
} from './tehranPrayerEngine.ts';
import { IRANIAN_PROVINCIAL_CAPITALS } from './iranianCities.ts';

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

  it('verifies 31 Iranian provincial capitals exist with valid coordinates', () => {
    assert.ok(IRANIAN_PROVINCIAL_CAPITALS.length >= 31);
    const tehran = IRANIAN_PROVINCIAL_CAPITALS.find((c) => c.id === 'tehran');
    assert.ok(tehran);
    assert.strictEqual(tehran.nameFa, 'تهران');
  });

  it('computes rolling 7-day schedule with 9 milestones per day', () => {
    const schedule = computeWeeklyPrayerSchedule(new Date(2026, 9, 4), 35.7, 51.42, 3.5);
    assert.strictEqual(schedule.length, 7);
    assert.strictEqual(schedule[0].milestones.length, 9);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** Run:
      `node --experimental-sqlite mobile/src/services/prayer/tehranPrayerEngine.test.mjs` Expected:
      FAIL (modules not found).

- [ ] **Step 3: Implement Iranian cities database & Jean Meeus engine** Create
      `mobile/src/services/prayer/iranianCities.ts` containing the 31 provincial capitals with
      latitude, longitude, and elevation. Create `mobile/src/services/prayer/tehranPrayerEngine.ts`
      implementing the verified 2-pass Jean Meeus equations with:
- Fajr: $-17.7^\circ$
- Sunrise: $-0.8333^\circ$
- Dhuhr: Solar Transit
- Asr: Shadow ratio 1.0 (Jafari standard)
- Sunset: $-0.8333^\circ$
- Maghrib: $-4.5^\circ$
- Isha: $-14.0^\circ$
- Midnight: $\frac{\text{Sunset} + \text{Fajr}_{\text{next}} + 24}{2} \pmod{24}$
- Imsak: 10 minutes before Fajr
- Localized Persian digit formatter (`toPersianDigits`).

- [ ] **Step 4: Run test to verify it passes** Run:
      `node --experimental-sqlite mobile/src/services/prayer/tehranPrayerEngine.test.mjs` Expected:
      PASS (all benchmark tests passing).

- [ ] **Step 5: Commit**

```bash
git add mobile/src/services/prayer/
git commit -m "feat(prayer): implement offline Tehran Geophysics prayer engine with benchmark tests"
```

---

### Task 2: Daily Ayah Curation Service & Last Read Serializer

**Files:**

- Create: `mobile/src/services/widgets/widgetContracts.ts`
- Create: `mobile/src/services/widgets/dailyAyahService.ts`
- Test: `mobile/src/services/widgets/dailyAyahService.test.mjs`

**Interfaces:**

- Consumes: Local SQLite `quran.db` through `mobile/src/services/db/databaseAdapter.ts`.
- Produces:

  ```typescript
  export interface DailyAyahPayload {
    surahId: number;
    ayahNumber: number;
    surahNameFa: string;
    pageNumber: number;
    arabicText: string;
    translationFa: string;
    translationAuthorFa: string;
    dateKey: string;
    deepLinkUrl: string;
  }
  export function getDailyAyahForDate(date: Date): Promise<DailyAyahPayload>;
  export function getFallbackDailyAyah(date: Date): DailyAyahPayload;
  ```

- [ ] **Step 1: Write failing test for Daily Ayah selection** Create
      `mobile/src/services/widgets/dailyAyahService.test.mjs`: Verify deterministic verse selection
      for a given date, character length bounds, presence of `normalizeQuranArabic`, and valid
      `quranir://` deep links.

- [ ] **Step 2: Run test to verify it fails** Run:
      `node --experimental-sqlite mobile/src/services/widgets/dailyAyahService.test.mjs` Expected:
      FAIL.

- [ ] **Step 3: Implement Daily Ayah engine and contracts** Create
      `mobile/src/services/widgets/widgetContracts.ts` defining `WidgetSharedData`,
      `DayPrayerSchedule`, and `DailyAyahPayload`. Create
      `mobile/src/services/widgets/dailyAyahService.ts` with curated spiritual verses (2:255,
      3:190-191, 13:28, 24:35, 39:53, 59:22-24, etc.) and fallback algorithm.

- [ ] **Step 4: Run test to verify it passes** Run:
      `node --experimental-sqlite mobile/src/services/widgets/dailyAyahService.test.mjs` Expected:
      PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/services/widgets/
git commit -m "feat(widgets): implement Daily Ayah curation service and contracts"
```

---

### Task 3: Shared Storage Bridge & Native Widget Sync Service

**Files:**

- Create: `mobile/src/services/widgets/widgetSyncService.ts`
- Modify: `mobile/src/stores/useReadingStore.ts`
- Test: `mobile/src/services/widgets/widgetSyncService.test.mjs`

**Interfaces:**

- Consumes: `tehranPrayerEngine.ts`, `dailyAyahService.ts`, and `useReadingStore.ts`.
- Produces:

  ```typescript
  export async function syncWidgetData(options?: { force?: boolean }): Promise<WidgetSharedData>;
  export function getCachedWidgetData(): WidgetSharedData | null;
  ```

- [ ] **Step 1: Write failing test for widget sync service** Create
      `mobile/src/services/widgets/widgetSyncService.test.mjs`: Verify that calling
      `syncWidgetData()` compiles the 7-day prayer schedule, gets the daily ayah, grabs the
      last-read position from reading store, and produces a valid JSON string under 200 KB.

- [ ] **Step 2: Run test to verify it fails** Run:
      `node --experimental-sqlite mobile/src/services/widgets/widgetSyncService.test.mjs` Expected:
      FAIL.

- [ ] **Step 3: Implement `widgetSyncService.ts` and integrate with Reading Store** Implement
      `syncWidgetData()` writing to `AsyncStorage` and native App Group / SharedPrefs when
      available. Subscribe to `useReadingStore` so updating reading progress automatically triggers
      an asynchronous background sync of `lastRead`.

- [ ] **Step 4: Run test to verify it passes** Run:
      `node --experimental-sqlite mobile/src/services/widgets/widgetSyncService.test.mjs` Expected:
      PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/services/widgets/widgetSyncService.ts mobile/src/services/widgets/widgetSyncService.test.mjs mobile/src/stores/useReadingStore.ts
git commit -m "feat(widgets): implement native widget synchronization service and store subscriber"
```

---

### Task 4: Dedicated Prayer Sanctuary Screen & Deep Link Route

**Files:**

- Create: `mobile/src/app/prayers.tsx`
- Test: `mobile/src/app/prayers.test.mjs`

**Interfaces:**

- Handles: `quranir://prayers`
- Renders: Full-screen Daily Prayer Sanctuary displaying all 9 milestones, Hijri & Solar dates, and
  active prayer interval ribbon.

- [ ] **Step 1: Write failing test for prayers screen** Create `mobile/src/app/prayers.test.mjs`:
      Verify that `prayers.tsx` exports a default React component, renders all 9 prayer milestones,
      displays Persian numerals, and contains back navigation.

- [ ] **Step 2: Run test to verify it fails** Run:
      `node --experimental-sqlite mobile/src/app/prayers.test.mjs` Expected: FAIL.

- [ ] **Step 3: Implement `mobile/src/app/prayers.tsx`** Build the screen with:
- Top bar with back button and city name.
- Solar date (e.g. `۱۳ مهر ۱۴۰۵`) and Hijri date.
- Arc ribbon with countdown to next prayer.
- 9-card milestone grid (Imsak, Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha, Midnight).
- Touch target $\ge 44 \times 44$ pt.

- [ ] **Step 4: Run test to verify it passes** Run:
      `node --experimental-sqlite mobile/src/app/prayers.test.mjs` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/app/prayers.tsx mobile/src/app/prayers.test.mjs
git commit -m "feat(reader): add dedicated Daily Prayer Sanctuary screen for widget deep linking"
```

---

### Task 5: In-App Widget Previewer & City Selector in Settings

**Files:**

- Create: `mobile/src/components/settings/WidgetSettingsSection.tsx`
- Modify: `mobile/src/app/(tabs)/settings.tsx`
- Test: `mobile/src/components/settings/widgetSettings.test.mjs`

**Interfaces:**

- Renders inside Settings tab.
- Allows user to change city (from 31 provincial capitals), toggle GPS, and see live interactive
  previews of the 3 widgets (Prayer Times, Daily Ayah, Last Read).

- [ ] **Step 1: Write failing test for WidgetSettingsSection** Create
      `mobile/src/components/settings/widgetSettings.test.mjs`: Verify city selector triggers
      schedule recalculation, interactive preview cards render in Dark Emerald theme, and 1-tap pin
      button exists.

- [ ] **Step 2: Run test to verify it fails** Run:
      `node --experimental-sqlite mobile/src/components/settings/widgetSettings.test.mjs` Expected:
      FAIL.

- [ ] **Step 3: Implement `WidgetSettingsSection.tsx` & integrate in `settings.tsx`** Create the
      component with:
- City picker dropdown/modal with search.
- GPS auto-locate switch.
- Tabbed live preview (Prayer Times Medium/Small, Daily Ayah, Last Read).
- Android 1-tap pin button and iOS visual guide.

- [ ] **Step 4: Run test to verify it passes** Run:
      `node --experimental-sqlite mobile/src/components/settings/widgetSettings.test.mjs` Expected:
      PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/src/components/settings/WidgetSettingsSection.tsx mobile/src/app/(tabs)/settings.tsx mobile/src/components/settings/widgetSettings.test.mjs
git commit -m "feat(settings): add in-app widget previewer and Iranian city selector"
```

---

### Task 6: Native Android AppWidget & RemoteViews Provider

**Files:**

- Create: `mobile/plugins/with-widgets/withAndroidWidgets.js`
- Create templates for `PrayerWidgetProvider.kt`, `DailyAyahWidgetProvider.kt`,
  `LastReadWidgetProvider.kt`.
- Create RemoteViews XML layouts: `widget_prayer_medium.xml`, `widget_prayer_small.xml`,
  `widget_daily_ayah_medium.xml`, `widget_last_read_medium.xml`.
- Test: `mobile/plugins/with-widgets/withAndroidWidgets.test.mjs`

**Interfaces:**

- Config Plugin modifies `AndroidManifest.xml` and adds native widget files to Android project.

- [ ] **Step 1: Write failing test for Android config plugin** Create
      `mobile/plugins/with-widgets/withAndroidWidgets.test.mjs`: Verify that plugin adds AppWidget
      receivers, permissions, and layout assets to Android project.

- [ ] **Step 2: Run test to verify it fails** Run:
      `node mobile/plugins/with-widgets/withAndroidWidgets.test.mjs` Expected: FAIL.

- [ ] **Step 3: Implement Android widget plugin & Kotlin templates** Implement
      `withAndroidWidgets.js` configuring:
- `PrayerWidgetProvider.kt` with `AlarmManager.setExactAndAllowWhileIdle()` milestone alarms.
- XML layouts with RTL support and Dark Emerald background.
- Deep link `PendingIntent` for `quranir://`.

- [ ] **Step 4: Run test to verify it passes** Run:
      `node mobile/plugins/with-widgets/withAndroidWidgets.test.mjs` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/plugins/with-widgets/
git commit -m "feat(widgets): add Android AppWidget config plugin and RemoteViews templates"
```

---

### Task 7: Native iOS WidgetKit Extension (SwiftUI) & App Group

**Files:**

- Create: `mobile/plugins/with-widgets/withIosWidgets.js`
- Create templates for `QuranWidgetsExtension.swift`, `PrayerWidgetView.swift`,
  `DailyAyahWidgetView.swift`, `LastReadWidgetView.swift`.
- Test: `mobile/plugins/with-widgets/withIosWidgets.test.mjs`

**Interfaces:**

- Config Plugin configures iOS App Group `group.ir.quran.app`, creates Widget extension target in
  Xcode project, and sets up SwiftUI views.

- [ ] **Step 1: Write failing test for iOS config plugin** Create
      `mobile/plugins/with-widgets/withIosWidgets.test.mjs`: Verify that plugin adds
      `com.apple.security.application-groups` entitlement, sets up App Group `group.ir.quran.app`,
      and configures Widget extension target.

- [ ] **Step 2: Run test to verify it fails** Run:
      `node mobile/plugins/with-widgets/withIosWidgets.test.mjs` Expected: FAIL.

- [ ] **Step 3: Implement iOS WidgetKit plugin & SwiftUI templates** Implement `withIosWidgets.js`
      with:
- `QuranWidgetsExtension.swift` implementing `TimelineProvider` generating 48-hour timeline entries.
- `PrayerWidgetView.swift` using `Text(date, style: .relative)` dynamic timer.
- Dark Emerald styling tokens and Vazirmatn font support.

- [ ] **Step 4: Run test to verify it passes** Run:
      `node mobile/plugins/with-widgets/withIosWidgets.test.mjs` Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add mobile/plugins/with-widgets/withIosWidgets.js mobile/plugins/with-widgets/withIosWidgets.test.mjs
git commit -m "feat(widgets): add iOS WidgetKit config plugin and SwiftUI templates"
```

---

### Task 8: End-to-End Verification, Typecheck, and Test Suite

**Files:**

- Modify: `mobile/app.json` (register `with-widgets` plugin)
- Verify: Full mobile test suite and TypeScript typecheck

- [ ] **Step 1: Register plugin in `mobile/app.json`** Add `./plugins/with-widgets` to `plugins`
      array in `mobile/app.json`.

- [ ] **Step 2: Run full mobile test suite** Run: `yarn --cwd mobile test` Expected: 100% PASS (all
      existing 480 tests + all new widget tests passing).

- [ ] **Step 3: Run TypeScript typecheck** Run: `yarn --cwd mobile typecheck` Expected:
      `tsc --noEmit` exits with 0 errors.

- [ ] **Step 4: Test Metro bundle compilation** Run:
      `curl -s "http://localhost:8081/index.bundle?platform=ios&dev=true&minify=false" > /dev/null && echo "Bundle Success"`
      Expected: "Bundle Success".

- [ ] **Step 5: Commit**

```bash
git add mobile/app.json
git commit -m "feat(widgets): activate widgets config plugin and complete end-to-end verification"
```
