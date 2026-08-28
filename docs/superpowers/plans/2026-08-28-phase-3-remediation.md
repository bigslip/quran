# Phase 3 Audio Player Remediation Plan

**Goal:** Remediate all critical and important bugs identified during the multi-agent Phase 3 audit across Audio UI, XState Actors, and Audio Modals & Hotkeys.

---

## Tasks

### Task 1: Phase 3a — Audio UI & Controls Accessibility & Throttling
1. **Icon Button Accessible Names**:
   - `src/components/AudioPlayer/Buttons/PlayPauseButton.tsx`: Add `ariaLabel` matching tooltip to play and pause states.
   - `src/components/AudioPlayer/SeekButton.tsx`: Add `ariaLabel` matching tooltip.
   - `src/components/AudioPlayer/Buttons/CloseButton.tsx`: Add `ariaLabel={t('audio.player.close')}`.
   - `src/components/AudioPlayer/Buttons/CloseRadioButton.tsx`: Add `ariaLabel={t('audio.player.close')}`.
   - `src/components/AudioPlayer/Buttons/VolumeControl/index.tsx`: Add `ariaLabel` to mute/volume trigger button.
   - `src/components/AudioPlayer/AudioPlayerOverflowMenuTrigger.tsx`: Add `ariaLabel` to trigger.
2. **Audio Slider ARIA & Throttle**:
   - `src/components/AudioPlayer/AudioPlayerSlider.tsx`: Localize labels (`label={t('audio.player.seek-slider')}` vs progress).
   - `src/components/AudioPlayer/OverflowAudioPlayActionsMenuBody.tsx`: Format playback speed via `toLocalizedNumber(playbackRate, lang)`.
3. **Tests**: Run audio player unit tests and verify.

### Task 2: Phase 3b — XState Audio Actor Leaks & Safari Resilience
1. **Actor Teardown on `CLOSE`**:
   - `src/xstate/actors/audioPlayer/audioPlayerMachine.ts`: Add `stopRepeatActor` and `exitRadio` to `CLOSE` actions.
2. **Safari `.play()` Promise Rejection**:
   - `src/xstate/actors/audioPlayer/audioPlayerMachine.ts`: Catch unhandled rejection in `continueFromLastTimestamp`.
3. **MediaSession Teardown**:
   - `src/xstate/actors/audioPlayer/audioPlayerMachine.ts`: Return cleanup function from `initMediaSession` callback service.
4. **Range Cycle Skip**:
   - `src/xstate/actors/rangeCycle/rangeCycleMachine.ts`: Properly stop `verseCycleActor` and complete on skip beyond range.
5. **Tests**: Run XState tests and verify.

### Task 3: Phase 3c — Audio Modals, Radio Stations & Hotkey Guards
1. **`RepeatAudioModal` Single Verse Mode Crash**:
   - `src/components/AudioPlayer/RepeatAudioModal/RepeatAudioModal.tsx`: Fall back to `prevVerseRepetition.from ?? firstVerseKeyInThisChapter` when `selectedVerseKey` is undefined.
2. **`useCurrentStationInfo` Null Guard**:
   - `src/xstate/Radio/useCurrentStationInfo.ts`: Guard against undefined `stationState.id`.
3. **`curatedStations.ts` Chapter 114 Fix**:
   - `src/components/Radio/curatedStations.ts`: Use `range(1, 115)` so Surah An-Nas is included in popular reciter and Juz Amma stations.
4. **`AudioKeyboardListeners` Space Guard**:
   - `src/components/AudioPlayer/AudioKeyboardListeners.tsx`: Filter interactive elements (buttons, links, textboxes) so Space doesn't intercept standard button activation.
5. **`SelectRepetitionMode` Combobox Label**:
   - `src/components/AudioPlayer/RepeatAudioModal/SelectRepetitionMode.tsx`: Add accessible label to combobox.
6. **Tests**: Expand unit tests for `RepeatAudioModal`, `useCurrentStationInfo`, and `curatedStations`.

### Task 4: Full Codebase Verification
- Run `yarn --ignore-engines vitest run` across all test files.
- Run `npx tsc --noEmit`.
