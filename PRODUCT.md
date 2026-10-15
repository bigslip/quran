# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary Audience:** Global Muslims reciting, listening to, and studying the Holy Quran daily.
- **Core Jobs-to-be-Done:**
  - Daily recitation and contemplation across Surahs, Juzs, and Mushaf pages.
  - In-depth study via multi-lingual translations, verse-by-verse tafsirs, reflections, and word-by-word linguistics.
  - Synchronized audio immersion and recitation following world-renowned reciters.
  - Personal growth through reading streaks, daily goals, bookmarks, notes, and pinned verses.

## Product Purpose

To provide a serene, authentic, and technologically sublime digital reading and listening sanctuary for the Holy Quran, making divine revelation accessible, comprehensible, and deeply engaging for believers and learners everywhere. Success is defined by daily habit retention, recitation clarity, reading comfort across all devices, and an uncompromised spiritual atmosphere.

## Positioning

**Modern Spiritual Sanctuary:** Unlike utilitarian or cluttered reference tools, Quran.ir blends sacred manuscript authenticity (Uthmani/IndoPak typography, verified glyphs) with state-of-the-art web performance, synchronized word-by-word audio, frosted glass elevation, and personal reading reflection workflows.

## Operating Context

- **Usage Environments:** Daily morning/evening recitation, prayer accompaniment, Ramadan reading challenges, commute listening, and classroom/scholarly study.
- **Form Factors:** Mobile handsets (one-thumb navigation), tablets (split translation/reading views), and wide desktop monitors (immersive recitation mode).
- **Network Modes:** High-speed streaming to offline local playback (via pre-cached/downloaded word-by-word audio assets and PWA service workers).

## Capabilities and Constraints

- **Script & Font Authenticity:** Absolute integrity of the sacred Quranic text across King Fahd Complex glyphs, Uthmani Hafs, IndoPak, and Madani fonts.
- **Bilingual & RTL Harmony:** Native bi-directional support (Arabic, English, Persian, Urdu, French, Indonesian, etc.) with CSS logical properties.
- **Audio Synchronization:** Real-time millisecond-level word and verse timing highlights with local asset resolution and CDN fallback.
- **Reading Modes:** Translation View (linear study), Reading View (Mushaf page simulation), and Study Mode (focused immersion).

## Brand Commitments

- **Tone & Voice:** Reverent, serene, respectful, elegant, and crystal-clear.
- **Visual Palette:** Royal Indigo, Celestial Cyan (`#00F2FE`), Emerald Oasis (`#05FFA1`), Obsidian Dark Glass, and warm Sepia parchment.
- **Accessibility:** WCAG AA/AAA contrast ratios, flexible font scaling (Arabic & Translation scales), and full keyboard navigation.

## Evidence on Hand

- **Authentic Sacred Data:** 114 Surahs, 6,236 Ayahs, 77,428 words, multiple tafsir collections, and verified translations in 40+ languages.
- **Audio Assets:** 72,944 word-by-word local pronunciation audio files stored in `public/audio/wbw/`.
- **Design Tokens:** Modern Spiritual Sanctuary theme system in `src/styles/themes/` (`_dark.scss`, `_light.scss`, `_sepia.scss`).

## Product Principles

1. **Sacred Text Primacy:** The Quranic Arabic script is the hero of every view; interface chrome, navigation, and controls must recede gracefully.
2. **Distraction-Free Serenity:** Avoid clutter, jarring animations, or intrusive popups; favor calm frosted glass, subtle luminous borders, and smooth transitions.
3. **Inclusive Multi-lingual Readability:** Provide effortless comprehension across scripts, translations, and reading proficiencies.
4. **Instantaneous & Resilient:** Sub-millisecond local audio response, client-side caching, and zero layout shift during recitation.

## Accessibility & Inclusion

- Adherence to WCAG 2.1 AA/AAA contrast standards.
- High-precision typography line-heights (`2.4` for Arabic diacritics) to prevent ligature clipping.
- Minimum `40x40px` touch targets for all interactive actions on touchscreens.
- Native screen-reader semantic markup with ARIA labels for audio playback and verse navigation.
