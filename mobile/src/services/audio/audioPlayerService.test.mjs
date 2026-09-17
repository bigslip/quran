import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { audioPlayerService } from './audioPlayerService.ts';
import {
  createExpoAudioDriver,
  createLegacyExpoAvDriver,
  createMockAudioDriver,
  getDefaultAudioDriver,
} from './audioDriver.ts';

describe('Audio Player Service Unit & Lifecycle Tests', () => {
  let mockDriverCalls = [];
  let finishCallback = null;

  const mockDriver = {
    playSound: async (url, onFinish) => {
      mockDriverCalls.push({ action: 'play', url });
      finishCallback = onFinish;
    },
    pauseSound: async () => {
      mockDriverCalls.push({ action: 'pause' });
    },
    resumeSound: async () => {
      mockDriverCalls.push({ action: 'resume' });
    },
    stopSound: async () => {
      mockDriverCalls.push({ action: 'stop' });
      finishCallback = null;
    },
    isPlaying: () => mockDriverCalls.some((c) => c.action === 'play' || c.action === 'resume'),
  };

  beforeEach(() => {
    mockDriverCalls = [];
    finishCallback = null;
    audioPlayerService.setDriver(mockDriver);
    audioPlayerService.stop();
    mockDriverCalls = [];
  });

  it('should play verse audio with generated URL for active reciter', async () => {
    await audioPlayerService.playVerse(201, 1, 1);

    assert.strictEqual(mockDriverCalls.length, 1);
    assert.strictEqual(mockDriverCalls[0].action, 'play');
    assert.strictEqual(
      mockDriverCalls[0].url,
      'https://everyayah.com/data/Parhizgar_48kbps/001001.mp3'
    );

    const current = audioPlayerService.getCurrentlyPlayingVerse();
    assert.deepStrictEqual(current, {
      reciterId: 201,
      chapterId: 1,
      verseNumber: 1,
      verseKey: '1:1',
    });
  });

  it('should pause and resume currently active audio', async () => {
    await audioPlayerService.playVerse(7, 18, 28);
    assert.strictEqual(mockDriverCalls[0].action, 'play');

    await audioPlayerService.pause();
    assert.ok(mockDriverCalls.some((c) => c.action === 'pause'));

    await audioPlayerService.resume();
    assert.ok(mockDriverCalls.some((c) => c.action === 'resume'));
  });

  it('should stop audio and reset state', async () => {
    await audioPlayerService.playVerse(201, 1, 1);
    await audioPlayerService.stop();

    assert.ok(mockDriverCalls.some((c) => c.action === 'stop'));
    assert.strictEqual(audioPlayerService.getCurrentlyPlayingVerse(), null);
  });

  it('should trigger onFinish callback when audio finishes', async () => {
    let finished = false;
    await audioPlayerService.playVerse(201, 1, 1, () => {
      finished = true;
    });

    assert.strictEqual(finished, false);
    assert.ok(finishCallback !== null);

    // Simulate playback finish
    finishCallback();
    assert.strictEqual(finished, true);
  });
});

describe('Expo Audio Driver (Modern SDK 57 expo-audio) Tests', () => {
  it('should initialize silent mode bypass and play audio through createAudioPlayer', async () => {
    let modeConfig = null;
    let createdSource = null;
    let createdOptions = null;
    let playCalled = false;
    let statusListener = null;

    const mockExpoAudio = {
      setAudioModeAsync: async (mode) => {
        modeConfig = mode;
      },
      createAudioPlayer: (source, options) => {
        createdSource = source;
        createdOptions = options;
        return {
          playing: false,
          play: () => {
            playCalled = true;
          },
          pause: () => {
            playCalled = false;
          },
          remove: () => {},
          addListener: (event, cb) => {
            if (event === 'playbackStatusUpdate') {
              statusListener = cb;
            }
            return { remove: () => {} };
          },
        };
      },
    };

    const driver = createExpoAudioDriver(mockExpoAudio);
    let finished = false;
    await driver.playSound('https://everyayah.com/data/Parhizgar_48kbps/001001.mp3', () => {
      finished = true;
    });

    assert.deepStrictEqual(modeConfig, {
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
    });
    assert.strictEqual(createdSource, 'https://everyayah.com/data/Parhizgar_48kbps/001001.mp3');
    assert.deepStrictEqual(createdOptions, {
      updateInterval: 250,
      keepAudioSessionActive: true,
    });
    assert.strictEqual(playCalled, true);
    assert.strictEqual(driver.isPlaying(), true);

    // Simulate playback completion event
    assert.ok(statusListener !== null);
    statusListener({ didJustFinish: true, playing: false });
    await new Promise((r) => setTimeout(r, 30));
    assert.strictEqual(finished, true);
    assert.strictEqual(driver.isPlaying(), false);
  });

  it('should seamlessly replace track when player already exists and supports replace', async () => {
    let replacedUrl = null;
    let playCount = 0;
    const mockExpoAudio = {
      setAudioModeAsync: async () => {},
      createAudioPlayer: (url, opts) => ({
        playing: true,
        replace: (newUrl) => {
          replacedUrl = newUrl;
        },
        play: () => {
          playCount++;
        },
        pause: () => {},
        remove: () => {},
        addListener: () => ({ remove: () => {} }),
      }),
    };

    const driver = createExpoAudioDriver(mockExpoAudio);
    await driver.playSound('https://everyayah.com/data/Parhizgar_48kbps/001001.mp3');
    assert.strictEqual(playCount, 1);

    // Play next verse
    await driver.playSound('https://everyayah.com/data/Parhizgar_48kbps/001002.mp3');
    assert.strictEqual(replacedUrl, 'https://everyayah.com/data/Parhizgar_48kbps/001002.mp3');
    assert.strictEqual(playCount, 2);
    assert.strictEqual(driver.isPlaying(), true);
  });

  it('should handle playback status error and trigger onError callback', async () => {
    let statusListener = null;
    const mockExpoAudio = {
      setAudioModeAsync: async () => {},
      createAudioPlayer: () => ({
        playing: true,
        play: () => {},
        pause: () => {},
        remove: () => {},
        addListener: (event, cb) => {
          if (event === 'playbackStatusUpdate') {
            statusListener = cb;
          }
          return { remove: () => {} };
        },
      }),
    };

    const driver = createExpoAudioDriver(mockExpoAudio);
    let capturedError = null;
    await driver.playSound('https://example.com/bad.mp3', undefined, (err) => {
      capturedError = err;
    });

    statusListener({ error: 'Network connection lost', playing: false });
    assert.ok(capturedError !== null);
    assert.strictEqual(capturedError.message, 'Network connection lost');
    assert.strictEqual(driver.isPlaying(), false);
  });

  it('should pause and resume player cleanly', async () => {
    let playCount = 0;
    let pauseCount = 0;
    const mockExpoAudio = {
      setAudioModeAsync: async () => {},
      createAudioPlayer: () => ({
        playing: true,
        play: () => {
          playCount++;
        },
        pause: () => {
          pauseCount++;
        },
        remove: () => {},
        addListener: () => ({ remove: () => {} }),
      }),
    };

    const driver = createExpoAudioDriver(mockExpoAudio);
    await driver.playSound('https://everyayah.com/data/Parhizgar_48kbps/001001.mp3');
    assert.strictEqual(playCount, 1);

    await driver.pauseSound();
    assert.strictEqual(pauseCount, 1);

    await driver.resumeSound();
    assert.strictEqual(playCount, 2);

    await driver.stopSound();
    assert.strictEqual(pauseCount, 2);
    assert.strictEqual(driver.isPlaying(), false);
  });
});

describe('Legacy Expo AV Driver Tests', () => {
  it('should support Sound.createAsync and playback controls', async () => {
    let soundCreated = false;
    let modeSet = false;

    const mockAudioModule = {
      setAudioModeAsync: async () => {
        modeSet = true;
      },
      Sound: {
        createAsync: async (source, initialStatus, onPlaybackStatusUpdate) => {
          soundCreated = true;
          return {
            sound: {
              getStatusAsync: async () => ({ isLoaded: true, isPlaying: true }),
              playAsync: async () => {},
              pauseAsync: async () => {},
              stopAsync: async () => {},
              unloadAsync: async () => {},
            },
            status: { isLoaded: true },
          };
        },
      },
    };

    const driver = createLegacyExpoAvDriver(mockAudioModule);
    await driver.playSound('https://example.com/test.mp3');

    assert.strictEqual(modeSet, true);
    assert.strictEqual(soundCreated, true);
    assert.strictEqual(driver.isPlaying(), true);

    await driver.pauseSound();
    assert.strictEqual(driver.isPlaying(), false);
  });
});
