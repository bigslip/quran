/**
 * AudioDriver interface and runtime platform adapters.
 * Manages low-level audio device interactions through expo-av in React Native,
 * with safe mock fallbacks for testing and environments where native audio is unavailable.
 */

export interface AudioDriver {
  playSound: (url: string, onFinish?: () => void, onError?: (err: Error) => void) => Promise<void>;
  pauseSound: () => Promise<void>;
  resumeSound: () => Promise<void>;
  stopSound: () => Promise<void>;
  isPlaying: () => boolean;
}

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

export function createExpoAudioDriver(AudioModule: any): AudioDriver {
  let soundObject: any = null;
  let isSoundPlaying = false;
  let currentLoadedUrl: string | null = null;
  let isAudioModeSet = false;

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
        console.warn('Failed to configure audio mode:', err);
      }
    }
  };

  return {
    playSound: async (url: string, onFinish?: () => void, onError?: (err: Error) => void) => {
      await ensureMode();

      // If resuming same audio URL that is already loaded and paused
      if (soundObject && currentLoadedUrl === url) {
        try {
          const status = await soundObject.getStatusAsync();
          if (status.isLoaded && !status.isPlaying) {
            await soundObject.playAsync();
            isSoundPlaying = true;
            return;
          }
        } catch {
          // Fall through to re-create
        }
      }

      // Stop and unload previous sound before playing new sound
      if (soundObject) {
        try {
          await soundObject.stopAsync();
          await soundObject.unloadAsync();
        } catch {
          // ignore
        }
        soundObject = null;
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
                onFinish?.();
              }
            } else if (status.error) {
              isSoundPlaying = false;
              onError?.(new Error(status.error));
            }
          }
        );
        soundObject = sound;
        isSoundPlaying = true;
      } catch (err: any) {
        isSoundPlaying = false;
        onError?.(err instanceof Error ? err : new Error(String(err)));
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
      if (soundObject) {
        try {
          await soundObject.stopAsync();
          await soundObject.unloadAsync();
        } catch {
          // ignore
        }
        soundObject = null;
        currentLoadedUrl = null;
        isSoundPlaying = false;
      }
    },

    isPlaying: () => isSoundPlaying,
  };
}

let defaultDriver: AudioDriver | null = null;

export function getDefaultAudioDriver(): AudioDriver {
  if (defaultDriver) {
    return defaultDriver;
  }

  try {
    // Dynamically require expo-av in React Native runtime
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const expoAv = require('expo-av');
    if (expoAv && expoAv.Audio) {
      defaultDriver = createExpoAudioDriver(expoAv.Audio);
      return defaultDriver;
    }
  } catch {
    // Node.js test environment or non-native environment
  }

  defaultDriver = createMockAudioDriver();
  return defaultDriver;
}
