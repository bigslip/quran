/**
 * AudioDriver interface and runtime platform adapters.
 * Manages low-level audio device interactions through Expo's modern expo-audio in React Native (SDK 57+),
 * with legacy expo-av fallback and safe mock fallbacks for testing and environments without native audio.
 */

export interface AudioDriver {
  playSound: (url: string, onFinish?: () => void, onError?: (err: Error) => void) => Promise<void>;
  pauseSound: () => Promise<void>;
  resumeSound: () => Promise<void>;
  stopSound: () => Promise<void>;
  isPlaying: () => boolean;
}

if (typeof (globalThis as any).__DEV__ === 'undefined') {
  (globalThis as any).__DEV__ = process.env.NODE_ENV !== 'production';
}

/**
 * Mock driver used for unit tests and environments where native audio is unavailable.
 */
export function createMockAudioDriver(): AudioDriver {
  let playing = false;
  return {
    playSound: async (_url: string, _onFinish?: () => void) => {
      playing = true;
    },
    pauseSound: async () => {
      playing = false;
    },
    resumeSound: async () => {
      playing = true;
    },
    stopSound: async () => {
      playing = false;
    },
    isPlaying: () => playing,
  };
}

/**
 * Modern Expo Audio driver utilizing `expo-audio` (standard in Expo SDK 57+).
 * Handles silent mode bypass on iOS, continuous playback via player.replace(),
 * background audio playback, and status updates.
 */
export function createExpoAudioDriver(ExpoAudio: any): AudioDriver {
  let player: any = null;
  let isSoundPlaying = false;
  let currentLoadedUrl: string | null = null;
  let isAudioModeSet = false;
  let statusSubscription: any = null;
  let hasFinishedCurrent = false;
  let activeOnFinish: (() => void) | null = null;
  let activeOnError: ((err: Error) => void) | null = null;
  let opId = 0;

  const ensureMode = async () => {
    if (!isAudioModeSet && ExpoAudio?.setAudioModeAsync) {
      try {
        await ExpoAudio.setAudioModeAsync({
          playsInSilentMode: true,
          shouldPlayInBackground: true,
          interruptionMode: 'doNotMix',
        });
        isAudioModeSet = true;
      } catch (err) {
        console.warn('[AudioDriver:expo-audio] Failed to configure audio mode:', err);
      }
    }
  };

  const setupStatusSubscription = (targetPlayer: any) => {
    if (statusSubscription) {
      try {
        statusSubscription.remove();
      } catch {
        // ignore
      }
      statusSubscription = null;
    }

    statusSubscription = targetPlayer.addListener('playbackStatusUpdate', (status: any) => {
      if (!status) return;

      if (typeof status.playing === 'boolean') {
        isSoundPlaying = status.playing;
      }

      if (status.error) {
        console.error('[AudioDriver:expo-audio] Playback error status:', status.error);
        isSoundPlaying = false;
        try {
          targetPlayer.pause();
        } catch {
          // ignore
        }
        activeOnError?.(new Error(status.error));
      } else if (status.didJustFinish && !hasFinishedCurrent) {
        if (__DEV__) {
          console.log('[AudioDriver:expo-audio] Playback finished for:', currentLoadedUrl);
        }
        hasFinishedCurrent = true;
        isSoundPlaying = false;
        try {
          targetPlayer.pause();
        } catch {
          // ignore
        }
        activeOnFinish?.();
      }
    });
  };

  return {
    playSound: async (url: string, onFinish?: () => void, onError?: (err: Error) => void) => {
      const myOpId = ++opId;
      if (__DEV__) {
        console.log('[AudioDriver:expo-audio] playSound called with url:', url);
      }
      await ensureMode();
      if (opId !== myOpId) {
        return;
      }

      activeOnFinish = onFinish || null;
      activeOnError = onError || null;

      // 1. If resuming or replaying same audio URL that is already loaded
      if (player && currentLoadedUrl === url) {
        try {
          if (
            hasFinishedCurrent ||
            player.playing ||
            (typeof (player as any).currentTime === 'number' && (player as any).currentTime > 0)
          ) {
            if (typeof (player as any).seekTo === 'function') {
              (player as any).seekTo(0);
            }
          }
          player.play();
          isSoundPlaying = true;
          hasFinishedCurrent = false;
          return;
        } catch (e) {
          console.warn(
            '[AudioDriver:expo-audio] Failed to resume/replay existing player, re-creating:',
            e,
          );
        }
      }

      hasFinishedCurrent = false;
      currentLoadedUrl = url;

      // 2. If player already exists, reuse it via player.replace() to prevent native audio session reset
      if (player && typeof player.replace === 'function') {
        try {
          player.replace(url);
          player.play();
          isSoundPlaying = true;
          if (__DEV__) {
            console.log('[AudioDriver:expo-audio] Seamlessly replaced track with:', url);
          }
          return;
        } catch (err) {
          console.warn(
            '[AudioDriver:expo-audio] player.replace failed, falling back to createAudioPlayer:',
            err,
          );
          try {
            player.pause();
            player.remove();
          } catch {
            // ignore
          }
          player = null;
        }
      }

      // 3. First-time initialization of player with keepAudioSessionActive
      try {
        player = ExpoAudio.createAudioPlayer(url, {
          updateInterval: 250,
          keepAudioSessionActive: true,
        });

        setupStatusSubscription(player);

        player.play();
        isSoundPlaying = true;
        if (__DEV__) {
          console.log('[AudioDriver:expo-audio] Successfully started playback for:', url);
        }
      } catch (err: any) {
        isSoundPlaying = false;
        console.error('[AudioDriver:expo-audio] Failed to create or play audio:', err);
        onError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },

    pauseSound: async () => {
      if (player) {
        try {
          player.pause();
          isSoundPlaying = false;
        } catch (e) {
          console.warn('[AudioDriver:expo-audio] Failed to pause player:', e);
        }
      }
    },

    resumeSound: async () => {
      if (player) {
        try {
          player.play();
          isSoundPlaying = true;
        } catch (e) {
          console.warn('[AudioDriver:expo-audio] Failed to resume player:', e);
        }
      }
    },

    stopSound: async () => {
      ++opId;
      activeOnFinish = null;
      activeOnError = null;
      hasFinishedCurrent = true;

      if (statusSubscription) {
        try {
          statusSubscription.remove();
        } catch {
          // ignore
        }
        statusSubscription = null;
      }

      if (player) {
        try {
          player.pause();
          player.remove();
        } catch {
          // ignore
        }
        player = null;
        currentLoadedUrl = null;
        isSoundPlaying = false;
      }
    },

    isPlaying: () => isSoundPlaying,
  };
}

/**
 * Legacy Expo AV driver utilizing `expo-av` for environments where expo-av native module is available.
 */
export function createLegacyExpoAvDriver(AudioModule: any): AudioDriver {
  let soundObject: any = null;
  let isSoundPlaying = false;
  let currentLoadedUrl: string | null = null;
  let isAudioModeSet = false;
  let activeOnFinish: (() => void) | null = null;
  let activeOnError: ((err: Error) => void) | null = null;
  let opId = 0;

  const ensureMode = async () => {
    if (!isAudioModeSet && AudioModule?.setAudioModeAsync) {
      try {
        await AudioModule.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: true,
        });
        isAudioModeSet = true;
      } catch (err) {
        console.warn('[AudioDriver:expo-av] Failed to configure audio mode:', err);
      }
    }
  };

  return {
    playSound: async (url: string, onFinish?: () => void, onError?: (err: Error) => void) => {
      const myOpId = ++opId;
      await ensureMode();
      if (opId !== myOpId) {
        return;
      }

      activeOnFinish = onFinish || null;
      activeOnError = onError || null;

      // If resuming or replaying same audio URL that is already loaded
      if (soundObject && currentLoadedUrl === url) {
        try {
          const status = await soundObject.getStatusAsync();
          if (opId !== myOpId) {
            return;
          }
          if (status.isLoaded) {
            if (typeof soundObject.setPositionAsync === 'function') {
              await soundObject.setPositionAsync(0);
              if (opId !== myOpId) {
                return;
              }
            }
            await soundObject.playAsync();
            if (opId !== myOpId) {
              return;
            }
            isSoundPlaying = true;
            return;
          }
        } catch {
          // Fall through to re-create
        }
      }

      // Stop and unload previous sound before playing new sound
      if (soundObject) {
        const prevSound = soundObject;
        soundObject = null;
        try {
          await prevSound.stopAsync();
          await prevSound.unloadAsync();
        } catch {
          // ignore
        }
      }

      if (opId !== myOpId) {
        return;
      }

      currentLoadedUrl = url;

      try {
        const { sound } = await AudioModule.Sound.createAsync(
          { uri: url },
          { shouldPlay: true, progressUpdateIntervalMillis: 250 },
          (status: any) => {
            if (status.isLoaded) {
              isSoundPlaying = status.isPlaying;
              if (status.didJustFinish) {
                isSoundPlaying = false;
                activeOnFinish?.();
              }
            } else if (status.error) {
              isSoundPlaying = false;
              activeOnError?.(new Error(status.error));
            }
          },
        );
        if (opId !== myOpId) {
          try {
            await sound.stopAsync();
            await sound.unloadAsync();
          } catch {
            // ignore
          }
          return;
        }
        soundObject = sound;
        isSoundPlaying = true;
      } catch (err: any) {
        if (opId !== myOpId) {
          return;
        }
        isSoundPlaying = false;
        activeOnError?.(err instanceof Error ? err : new Error(String(err)));
      }
    },

    pauseSound: async () => {
      if (soundObject) {
        try {
          await soundObject.pauseAsync();
          isSoundPlaying = false;
        } catch {
          // ignore
        }
      }
    },

    resumeSound: async () => {
      if (soundObject) {
        try {
          await soundObject.playAsync();
          isSoundPlaying = true;
        } catch {
          // ignore
        }
      }
    },

    stopSound: async () => {
      ++opId;
      activeOnFinish = null;
      activeOnError = null;
      currentLoadedUrl = null;
      isSoundPlaying = false;
      if (soundObject) {
        const prevSound = soundObject;
        soundObject = null;
        try {
          await prevSound.stopAsync();
          await prevSound.unloadAsync();
        } catch {
          // ignore
        }
      }
    },

    isPlaying: () => isSoundPlaying,
  };
}

let defaultDriver: AudioDriver | null = null;

export function resetDefaultAudioDriver(): void {
  defaultDriver = null;
}

export function getDefaultAudioDriver(): AudioDriver {
  if (defaultDriver) {
    return defaultDriver;
  }

  // 1. Try modern Expo SDK 57 expo-audio
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const expoAudio = require('expo-audio');
    const mod = expoAudio.createAudioPlayer ? expoAudio : expoAudio.default;
    if (mod && typeof mod.createAudioPlayer === 'function') {
      if (__DEV__) {
        console.log('[AudioDriver] Successfully initialized modern expo-audio driver');
      }
      defaultDriver = createExpoAudioDriver(mod);
      return defaultDriver;
    }
  } catch (err: any) {
    // Node.js test environment or environments without native expo-audio
  }

  // 2. Try legacy expo-av fallback
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const expoAv = require('expo-av');
    const mod = expoAv.Audio || expoAv.default?.Audio;
    if (mod && typeof mod.Sound?.createAsync === 'function') {
      if (__DEV__) {
        console.log('[AudioDriver] Successfully initialized legacy expo-av driver');
      }
      defaultDriver = createLegacyExpoAvDriver(mod);
      return defaultDriver;
    }
  } catch (err: any) {
    // Node.js test environment or environments without native expo-av
  }

  // 3. Fallback to mock driver for tests or headless environments
  defaultDriver = createMockAudioDriver();
  return defaultDriver;
}
