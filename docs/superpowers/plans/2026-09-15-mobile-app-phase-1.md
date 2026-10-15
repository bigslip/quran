# Mobile App Phase 1 Implementation Plan: Foundation & Home Dashboard

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Establish the solid React Native Expo foundation, offline SQLite data pipeline, design tokens, and implement the Sanctuary Home Dashboard screen matching Figma node `0:1`.

**Architecture:** Monorepo architecture (`apps/mobile` or shared workspace), React Native with Expo SDK 52+, OP-SQLite with pre-indexed offline database, and TypeScript models shared from the web application.

**Tech Stack:** React Native, Expo, TypeScript, Expo Router, OP-SQLite / Expo SQLite, MMKV, React Native Track Player.

---

## Global Constraints
- Target Platforms: iOS 15+ & Android 10+ (API 29+)
- Orientation: Portrait primary
- Directionality: RTL primary (Persian/Arabic) with LTR support (English)
- Typography: Vazirmatn (UI), KFGQPC Uthmanic Hafs (Quran), IndoPak Nastaliq (Quran)
- Offline First: Zero network dependency for core reading and search

---

## Figma Screen References
1. **Home Screen**: [https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=0-1](https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=0-1) (`0:1`)
2. **Surah List**: [https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=1-289](https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=1-289) (`1:289`)
3. **Surah View**: [https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=1-673](https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=1-673) (`1:673`)
4. **Ayah Insights**: [https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=1-995](https://www.figma.com/design/bjazbvmSGAXdNebD3ctv36/AppHome?node-id=1-995) (`1:995`)

---

## Tasks

### Task 1: Scaffolding Mobile Project & Design System Tokens
- Setup Expo app in `mobile/` or `apps/mobile/` with TypeScript and Expo Router.
- Port Sanctuary color tokens (emerald gradients, celestial glows, surface card borders, dark/light themes).
- Setup font loaders for Vazirmatn and Uthmanic Hafs.

### Task 2: Embedded Offline SQLite & Data Engine
- Build offline pre-bundler script generating `quran.db` from `data/qdc/` (all 114 Surahs, verses, translations, and word-by-word data).
- Configure SQLite service with FTS5 search.

### Task 3: Home Dashboard Screen (`node-id=0:1`)
- Ambient radial emerald header with time-based Persian greeting (*صبح بخیر / روز بخیر / عصر بخیر*).
- Resume Reading ribbon with progress ring and continue button.
- Quick navigation pills (سوره بقره، یس، الرحمن، جزء ۳۰).
- Daily Ayah card with translation and audio quick-play.
- Bottom Navigation Bar with Sanctuary active glow.

### Task 4: Testing & Verification
- Unit and snapshot tests with Jest / React Native Testing Library.
- Typecheck verification (`tsc --noEmit`).
