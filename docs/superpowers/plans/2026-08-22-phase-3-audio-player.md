# Phase 3 Audio Player Prop Forwarding Plan

**Goal:** Ensure all core AudioPlayer components accept and forward standard React HTML attributes and WAI-ARIA properties to their root DOM elements to support progress overlays and accessibility attributes.

**Components to Update:**
1. `src/components/AudioPlayer/AudioPlayer.tsx`
2. `src/components/AudioPlayer/AudioPlayerSlider.tsx`
3. `src/components/AudioPlayer/PlaybackControls.tsx`
4. `src/components/AudioPlayer/RadioPlaybackControl.tsx`

**Steps for each component:**
1. Check if the component props already extend `React.HTMLAttributes<HTMLElement>` (or the appropriate DOM node).
2. If not, extend the Props interface.
3. Extract `className` and `...props` from the props object.
4. Pass `className` into the `classNames` utility on the root element.
5. Spread `...props` onto the root element.
6. Write a unit test ensuring the attributes are properly spread.

We will execute this inline.
