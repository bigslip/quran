<p align="center">
  <a href="https://quran.ir">
    <img src="public/logo.png" alt="Quran.ir Logo" width="100" height="100" />
  </a>
</p>

<h1 align="center">The Noble Quran — Quran.ir</h1>

<p align="center">
  A serene, high-performance, and accessible digital sanctuary for reading, listening to, searching, and studying the Holy Quran across Web and Mobile.
</p>

<p align="center">
  <strong>🌐 Language / زبان:</strong>
  &nbsp;🇬🇧 <strong>English</strong> &nbsp;|&nbsp; <a href="README.fa.md"><strong>🇮🇷 فارسی (Farsi)</strong></a>
</p>

<p align="center">
  <a href="https://quran.ir"><strong>Visit Quran.ir »</strong></a>
  <br />
  <br />
  <a href="https://github.com/bigslip/quran/issues">Report Issue</a>
  ·
  <a href="https://github.com/bigslip/quran/issues">Request Feature</a>
</p>

---

## ✨ Key Features

- **📖 Authentic Reading Sanctuary**:
  - Multiple sacred scripts and fonts including **Uthmani (King Fahd Complex V1/V2)**, **IndoPak
    Nastaleeq**, and **Tajweed** color-coded rendering.
  - Flexible **Translation View** (verse-by-verse study), **Reading View** (604-page Mushaf layout
    simulation), and distraction-free **Study Mode**.
  - Independent typographic scaling for Arabic script, translations, and Tafsir commentary.
- **🎙️ Synchronized Word-by-Word Audio Engine**:
  - Millisecond-accurate word and verse highlighting synchronized with world-renowned reciters.
  - Powered by an **XState** audio state machine with gapless playback, verse/range looping,
    playback speed controls, downloadable audio, and 72,900+ local word-by-word pronunciation
    assets.
- **📚 Comprehensive Translations & Persian Tafsir Engine**:
  - **40+ verified translations** across multiple languages, including prominent Persian
    translations (Fooladvand, Makarem Shirazi, Ansarian, Khorramdel, Khorramshahi, Elahi Ghomshei,
    Bahrampour, and more).
  - Full-text **Persian Tafsir Engine** featuring complete offline-ready editions of **Tafsir
    Nemouneh** (_تفسیر نمونه_) and **Tafsir Noor** (_تفسیر نور_), alongside classical Arabic,
    English, Urdu, Bengali, Russian, and Kurdish commentaries (Ibn Kathir, Al-Tabari, Al-Qurtubi,
    Al-Sa'di, Ma'arif al-Qur'an, etc.).
  - Word-by-word translations, transliteration, morphology/layers, related verses, Qira'at
    variations, and Hadith references.
- **⚡ In-Process Local Data & Search Engine**:
  - Self-contained canonical Quran data engine (`data/qdc/` & `src/utils/localDataEngine.ts`)
    indexing all **114 Surahs**, **604 Mushaf pages**, **30 Juzs**, **60 Hizbs**, **240 Rub el
    Hizbs**, **6,236 Ayahs**, and **77,428 words** in memory for instant SSR/ISR and zero external
    API latency.
  - Intelligent full-text search across Arabic roots/diacritics, translations, and quick navigation
    queries (e.g., `2:255`, `Yasin`, `Juz 30`, `Page 604`).
- **🕌 Spiritual Prayer Times & Qibla (`SpiritualPrayerRibbon`)**:
  - Real-time astronomical prayer time calculations, next-prayer countdowns, Qibla direction, and
    contextual daily spiritual virtues integrated into the homepage.
- **🎯 Personal Growth, Notes & Learning Plans**:
  - **Reading Goals & Streaks**: Customizable daily time, page, or verse-range goals with progress
    tracking and Hijri/Quranic calendar integration.
  - **My Quran (`/my-quran`)**: Bookmarks, custom collections, last-read tracking, and rich-text
    personal notes (`@milkdown`) synced across sessions.
  - **Learning Plans & Reflections**: Structured Quranic courses (`/learning-plans`) and community
    reflections.
- **📻 Quran Radio & 🎬 Media Maker Studio**:
  - **Quran Radio (`/radio`)**: Curated 24/7 continuous recitation stations by theme and reciter.
  - **Media Maker (`/media`)**: Built-in Quranic video and social media reel generator powered by
    **Remotion 4**.
  - **Embeddable Ayah Widget (`/embed`)**: Customizable widget for embedding interactive Quran
    verses on external websites.
- **🌐 19 Interface Languages & Native RTL Architecture**:
  - Full localization across 19 locales (`en`, `ar`, `fa`, `ur`, `tr`, `fr`, `es`, `id`, `ms`, `bn`,
    `ru`, `nl`, `it`, `pt`, `sq`, `th`, `zh`, `sw`, `vi`) using CSS logical properties enforced via
    Stylelint.
- **🎨 Design Language System (DLS) & Themes**:
  - Crafted around the _Modern Spiritual Sanctuary_ aesthetic with **Light**, **Dark**, and
    **Sepia** themes, WCAG AA/AAA contrast compliance, and full keyboard accessibility.
- **📱 Companion Native Mobile App (`mobile/`)**:
  - Cross-platform iOS and Android app built with **Expo SDK 57 (React Native)** and **SQLite FTS**
    for 100% offline reading, Tafsir database downloads, background audio, prayer times, and native
    home screen widgets.

---

## 🛠️ Tech Stack

### Web Application (`/`)

- **Framework**: [Next.js 16](https://nextjs.org/) (Pages Router, SSR/ISR, API Routes, Middleware)
- **Language**: [TypeScript 5.5](https://www.typescriptlang.org/) (Strict mode)
- **UI & Components**:
  - [React 18](https://react.dev/)
  - [Radix UI](https://www.radix-ui.com/) accessible primitives (Dialog, Popover, Dropdown, Tabs,
    Slider, Tooltip, etc.)
  - [Milkdown](https://milkdown.dev/) for Markdown note-taking
  - [React Virtuoso](https://virtuoso.dev/) for virtualized long-Surah rendering
  - [GSAP](https://gsap.com/) for fluid animations
- **State Management & Data Fetching**:
  - [Redux Toolkit](https://redux-toolkit.js.org/) +
    [redux-persist](https://github.com/rt2zz/redux-persist) (reading preferences, theme, bookmarks,
    audio settings)
  - [XState](https://stately.ai/docs/xstate) (audio player state machine)
  - [SWR](https://swr.vercel.app/) (`useSWR` / `useSWRImmutable`) for client caching and optimistic
    updates
- **Media & Content**:
  - [Remotion 4](https://www.remotion.dev/) (programmatic Quranic video/audio rendering)
  - [Sanity](https://www.sanity.io/) (CMS integration for editorial pages & product updates)
  - [Fuse.js](https://www.fusejs.io/) & custom local search engine
- **Styling & i18n**:
  - SCSS Modules + CSS custom property theme tokens (`src/styles/themes/`)
  - [next-translate](https://github.com/aralroca/next-translate) + Lokalise integration
- **Quality, Testing & Observability**:
  - [Vitest](https://vitest.dev/) & React Testing Library (Unit & component tests)
  - [Playwright](https://playwright.dev/) (End-to-end & integration tests with Page Object Model)
  - [Storybook 8](https://storybook.js.org/) (Isolated UI component development & a11y auditing)
  - [Sentry](https://sentry.io/) (`@sentry/nextjs`) for error tracking and performance monitoring
  - [next-pwa](https://github.com/shadowwalker/next-pwa) for service worker caching & offline PWA
    support

### Companion Mobile Application (`mobile/`)

- **Framework**: [Expo SDK 57](https://expo.dev/) & [React Native 0.86](https://reactnative.dev/)
  ([React 19](https://react.dev/))
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (Typed file-based
  routing)
- **State & Storage**: [Zustand 5](https://zustand-demo.pmnd.rs/),
  `@react-native-async-storage/async-storage`, and `expo-sqlite` (with Full-Text Search enabled)
- **Audio & Native Capabilities**: `expo-audio`, `expo-av`, background playback services, and custom
  native widgets plugin (`./plugins/with-widgets`)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>=20.9.0` (Node 20 LTS recommended)
- **Package Manager**: [Yarn](https://classic.yarnpkg.com/) (`npm install -g yarn`)

### 1. Clone the Repository

```bash
git clone git@github.com:bigslip/quran.git
cd quran
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Configure Environment Variables

Copy the example environment template to `.env.local`:

```bash
cp .env.example .env.local
```

The app runs out-of-the-box using the built-in local data engine (`data/qdc/`). Optional
integrations (Sentry, Sanity, Novu, Firebase, Lokalise) can be configured in `.env.local`.

### 4. Start the Development Server

```bash
yarn dev
```

For HTTPS local development (useful for testing PWA service workers, clipboard, or Web Audio
features requiring a secure context):

```bash
yarn dev:https
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Running the Mobile App (Optional)

```bash
cd mobile
yarn install
yarn build:db   # Build the bundled offline SQLite database from canonical data
yarn start      # Launch Expo Dev Server (press 'i' for iOS simulator, 'a' for Android)
```

---

## 📜 Available Scripts

### Web Application (`package.json`)

| Command                   | Description                                                          |
| :------------------------ | :------------------------------------------------------------------- |
| `yarn dev`                | Start the Next.js development server (Webpack mode) on port `3000`   |
| `yarn dev:https`          | Start the local HTTPS development server (`server.js`)               |
| `yarn build`              | Build the production application and generate sitemaps (`postbuild`) |
| `yarn start`              | Start the Next.js production server                                  |
| `yarn prod`               | Start the custom HTTP production server (`server-http.js`)           |
| `yarn analyze`            | Build production bundle with `@next/bundle-analyzer`                 |
| `yarn test`               | Run unit tests once via Vitest                                       |
| `yarn test:watch`         | Run unit tests in interactive watch mode                             |
| `yarn test:coverage`      | Run unit tests and generate V8 coverage report                       |
| `yarn snapshots:update`   | Update Vitest snapshot assertions                                    |
| `yarn test:integration`   | Run end-to-end integration tests with Playwright                     |
| `yarn lint`               | Lint TypeScript/JavaScript source files with ESLint                  |
| `yarn lint:fix`           | Automatically fix ESLint issues                                      |
| `yarn lint:scss`          | Lint and fix SCSS stylesheets (enforces logical RTL properties)      |
| `yarn storybook`          | Start Storybook 8 component catalog on port `6006`                   |
| `yarn build-storybook`    | Build static Storybook documentation                                 |
| `yarn media-maker:studio` | Launch Remotion Studio for Quranic video templates                   |
| `yarn media-maker:deploy` | Deploy Remotion media-maker bundle                                   |
| `yarn browser:audit`      | Run automated Chrome console, network, and hydration health audit    |
| `yarn browser:monitor`    | Run persistent live Chrome monitoring during development             |
| `yarn ai:sync`            | Sync AI agent instructions and compatibility symlinks                |
| `yarn ai:check`           | Verify AI agent symlinks and canonical markdown links                |

---

## 📁 Project Structure

```text
├── .agents/              # Canonical AI agent standards, skills, and review workflows
├── configs/              # HTTP security headers and runtime configurations
├── data/                 # Canonical local datasets
│   ├── chapters/         # Chapter metadata and mappings (Juz, Hizb, Rub, Page)
│   └── qdc/              # Local Quran Data Engine corpus (604 pages, tafsirs, translations, WBW, timestamps)
├── docs/                 # Architecture decision records & feature documentation
├── locales/              # i18n translation catalogs across 19 languages
├── mobile/               # Companion Expo / React Native mobile application (iOS & Android)
│   ├── plugins/          # Expo config plugins (e.g., native home screen widgets)
│   └── src/              # Mobile app routes (Expo Router), SQLite services, Zustand stores, and UI
├── public/               # Static assets, Quranic fonts (Uthmani, IndoPak, V4), icons, WBW audio, and PWA manifest
├── scripts/              # Data ingestion pipelines (Tafsir Nemouneh/Noor, Tanzil, WBW), SQLite builder, and audits
├── src/
│   ├── audioInput/       # Web Audio API worklets for voice/recitation processing
│   ├── components/       # Feature-organized React components (QuranReader, AudioPlayer, Search, HomePage, MediaMaker, etc.)
│   │   └── dls/          # Design Language System (reusable UI primitives & Storybook stories)
│   ├── contexts/         # React contexts
│   ├── hooks/            # Custom reusable React hooks
│   ├── lib/              # Third-party integrations (Sentry, Sanity, Firebase, OpenGraph)
│   ├── pages/            # Next.js Pages Router routes and `/api/proxy` local data endpoints
│   ├── redux/            # Redux Toolkit store, persisted slices, selectors, and middleware
│   ├── services/         # Domain service layers
│   ├── styles/           # Global SCSS, CSS variable theme tokens (_light, _dark, _sepia), breakpoints, and mixins
│   ├── utils/            # Local Data Engine, Search Engine, auth API helpers, verse/font utilities, and validators
│   └── xstate/           # XState machines and actors (AudioPlayer state management)
├── tests/                # Playwright integration specs, Page Object Models (POM), and test IDs
├── types/                # Global TypeScript domain interfaces and type definitions
├── i18n.json             # next-translate locale and namespace routing configuration
└── next.config.js        # Next.js build, PWA, security headers, redirects, and Sentry configuration
```

---

## 📚 Architecture & Documentation

Detailed technical documentation is available in the [`docs/`](docs/) directory:

- **[Authentication System](docs/authentication-system.md)**: JWT/refresh token flow, `withAuth`
  HOC, and profile synchronization.
- **[Bookmarks & Collections](docs/BOOKMARKS_AND_COLLECTIONS.md)**: Guest bookmark migration,
  optimistic updates, and collection architecture.
- **[Navbar Architecture](docs/NAVBAR-ARCHITECTURE.md)** &
  **[Test Plan](docs/NAVBAR-TEST-PLAN.md)**: Navigation bar state, scroll listeners, and drawer
  flows.
- **[Embeddable Ayah Widget](docs/embed-widget.md)**: Configuration and integration guide for
  `/embed` and `/api/ayah-widget`.
- **[SWR vs. SWR Immutable](docs/SWR_IMMUTABLE_VS_SWR.md)**: Caching strategies for static Quranic
  data versus user-specific state.
- **[Common Mistakes](docs/COMMON_MISTAKES.md)** &
  **[Code Standards](.agents/quran/standards/core-standards.md)**: Repository engineering standards,
  RTL rules, and pitfalls to avoid.
- **[Playwright Testing Guide](docs/playwright-test.md)**: Writing reliable end-to-end tests using
  Page Object Models.

---

## 🤝 Contributing

Contributions to improve **Quran.ir** are warmly welcomed.

1. **Check Issues**: Browse existing [Issues](https://github.com/bigslip/quran/issues) or open a new
   issue to discuss your proposed feature or bug fix.
2. **Branching Strategy**:
   - Create your feature or bugfix branch from `main` (e.g., `feature/your-feature` or
     `fix/your-fix`).
   - Production releases target the `production` branch.
3. **Coding Standards**:
   - Use **TypeScript** strictly (avoid `any`, define explicit prop and return types).
   - Use **logical CSS properties** (`margin-inline-start`, `padding-inline-end`) instead of
     physical left/right properties to preserve seamless RTL/LTR support.
   - Localize all user-facing strings via `next-translate` (`useTranslation`).
4. **Quality Verification**:
   - Run unit tests: `yarn test`
   - Run linters: `yarn lint && yarn lint:scss`
5. **Submit a Pull Request**: Include a clear summary of changes, screenshots for UI updates, and
   your verification steps.

---

## 📄 License

This project is licensed under the **[MIT License](LICENSE)**.
