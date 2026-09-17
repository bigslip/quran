import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert';
import { audioPlayerService } from './audioPlayerService.ts';

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
