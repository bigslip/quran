<p align="center">
  <a href="https://quran.ir">
    <img src="public/logo.png" alt="Quran.ir Logo" width="100" height="100" />
  </a>
</p>

<h1 align="center">The Noble Quran</h1>

<p align="center">
  A high-performance, accessible, and modern web application for reading, listening, searching, and studying the Holy Quran.
</p>

<p align="center">
  <a href="https://quran.ir"><strong>Visit Quran.ir »</strong></a>
  <br />
  <br />
  <a href="https://discord.gg/SpEeJ5bWEQ">Discord Community</a>
  ·
  <a href="https://github.com/bigslip/quran/issues">Report Issue</a>
  ·
  <a href="https://github.com/bigslip/quran/issues">Request Feature</a>
  ·
  <a href="https://quran.github.io/quran.ir-frontend-next/storybook/master">Storybook</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Node-20%2B-green?logo=node.js" alt="Node 20+" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</p>

---

## ✨ Features

- **📖 Immersive Reading Experience**: Multiple Quranic fonts and scripts (Uthmani, IndoPak, Madani
  V1/V2, Tajweed) with customizable font sizes and Mushaf layouts.
- **🎙️ Advanced Audio Player**: Word-by-word synchronized highlighting and playback controls with a
  diverse selection of reciters, powered by robust XState state machines.
- **📚 Translations & Tafsir**: Multi-language translations and comprehensive Tafsir engines,
  including prominent Persian commentaries (Nemouneh, Al-Mizan, and more).
- **🔍 Intelligent Search & Navigation**: Rapid search across the Quran with seamless navigation by
  Surah, Ayah, Juz, Hizb, Rub, or Page.
- **🌐 Comprehensive Internationalization (i18n)**: Native support for 18+ languages with full
  Right-to-Left (RTL) layout support.
- **🎨 Design Language System (DLS) & Themes**: Modern, accessible UI supporting Light, Dark, and
  Sepia themes tailored for comfortable prolonged reading.
- **⚡ PWA & Offline Support**: Progressive Web App capabilities for smooth performance across
  desktop, tablet, and mobile browsers.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (Pages Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **UI & State Management**:
  - [React 18](https://react.dev/)
  - [Redux Toolkit](https://redux-toolkit.js.org/) with
    [redux-persist](https://github.com/rt2zz/redux-persist)
  - [XState](https://xstate.js.org/) for complex state machines (audio engine)
- **Styling**: SCSS Modules & centralized Design System tokens
- **Testing**:
  - [Vitest](https://vitest.dev/) & React Testing Library (Unit tests)
  - [Playwright](https://playwright.dev/) (End-to-end & integration tests)
- **Component Development**: [Storybook](https://storybook.js.org/)
- **Internationalization**: [next-translate](https://github.com/aralroca/next-translate)

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `>=20.9.0` (Node 20+ LTS recommended)
- **Package Manager**: [Yarn](https://yarnpkg.com/) (`npm install -g yarn`)

### 1. Clone the Repository

```bash
git clone git@github.com:bigslip/quran.git
cd quran
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Setup Environment Variables

Copy the example environment configuration to `.env.local`:

```bash
cp .env.example .env.local
```

Configure any necessary API keys or endpoints in `.env.local` as needed.

### 4. Run the Development Server

```bash
yarn dev
```

For HTTPS local development (e.g. testing features requiring secure origin):

```bash
yarn dev:https
```

Open [http://localhost:3000](http://localhost:3000) in your browser to view the application.

---

## 📜 Available Scripts

| Command                 | Description                                         |
| :---------------------- | :-------------------------------------------------- |
| `yarn dev`              | Start the local Next.js development server          |
| `yarn dev:https`        | Start the local development server with HTTPS       |
| `yarn build`            | Build the optimized production application          |
| `yarn start`            | Run the built production application locally        |
| `yarn analyze`          | Build and analyze bundle sizes                      |
| `yarn test`             | Execute unit tests via Vitest                       |
| `yarn test:watch`       | Run unit tests in interactive watch mode            |
| `yarn test:coverage`    | Generate unit test coverage report                  |
| `yarn test:integration` | Run integration tests using Playwright              |
| `yarn lint`             | Lint code using ESLint                              |
| `yarn lint:fix`         | Fix ESLint issues automatically                     |
| `yarn lint:scss`        | Lint and fix SCSS stylesheets                       |
| `yarn storybook`        | Start Storybook UI component catalog on port `6006` |
| `yarn build-storybook`  | Build static Storybook documentation                |

---

## 📁 Project Structure

```text
├── locales/              # Translation files (18+ languages)
├── public/               # Static assets, fonts, icons, and manifest
├── scripts/              # Utility, build, and data scripts
├── src/
│   ├── components/       # Feature-specific React components
│   │   └── dls/          # Design Language System (reusable UI primitives)
│   ├── hooks/            # Reusable custom React hooks
│   ├── pages/            # Next.js Pages Router routes and API endpoints
│   ├── redux/            # Redux store, slices, and middleware
│   ├── styles/           # Global styles, variables, mixins, and theme tokens
│   ├── utils/            # Domain-specific helpers, auth, and API utilities
│   └── xstate/           # State machines (e.g. audio player)
├── types/                # TypeScript type declarations
├── .env.example          # Environment variables template
└── next.config.mjs       # Next.js build and runtime configuration
```

---

## 🎨 Design Language System (DLS) & Storybook

To maintain visual consistency and scalability across the application, all reusable UI components
live in `src/components/dls/`.

Every component is developed with companion Storybook stories (`*.stories.tsx`). You can view and
test components independently by running:

```bash
yarn storybook
```

---

## 🤝 Contributing

Contributions to improve Quran.ir are welcomed and appreciated.

1. **Check Issues**: Take a look at existing [issues](https://github.com/bigslip/quran/issues) or
   create a new one to propose changes.
2. **Branching Strategy**:
   - Create a feature branch off `main` for new features or bug fixes (`feature/your-feature-name`
     or `fix/your-fix-name`).
   - Production releases target the `production` branch.
3. **Quality Checks**:
   - Ensure tests pass: `yarn test`
   - Run linters: `yarn lint && yarn lint:scss`
4. **Submit PR**: Open a Pull Request detailing your changes, motivation, and testing steps.

---

## 📄 License & Acknowledgments

- **License**: This project is licensed under the [MIT License](LICENSE).
- **Localization**: Translation and localization workflows are supported by
  [Lokalise](https://lokalise.com/).
