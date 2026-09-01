import { getWordByWordAudioUrl, getWordByWordCdnAudioUrl } from '@/utils/audio';
import { logEvent } from '@/utils/eventLogger';
import Word from 'types/Word';

const playWordAudio = (word: Word) => {
  const [chapterId, verseId, wordId] = word.location.split(':');
  const localAudioUrl = getWordByWordAudioUrl(Number(chapterId), Number(verseId), Number(wordId), true);
  const cdnFallbackUrl = getWordByWordCdnAudioUrl(Number(chapterId), Number(verseId), Number(wordId));
  playWordByWordAudio(localAudioUrl, cdnFallbackUrl);
};

export default playWordAudio;

/**
 * Given an audio url and an optional fallback url:
 * 1) Stop word-by-word player if currently playing
 * 2) Attempt playback from primary URL (local project static audio `/audio/wbw/...`)
 * 3) If local audio is not yet downloaded, automatically fallback to CDN
 * 4) Clean up DOM audio listeners upon completion
 *
 * @param {string} url
 * @param {string} [fallbackUrl]
 */
const playWordByWordAudio = (url: string, fallbackUrl?: string) => {
  if (window.wordByWordAudioPlayerEl) {
    window.wordByWordAudioPlayerEl.pause();
    window.wordByWordAudioPlayerEl.remove();
    window.wordByWordAudioPlayerEl = null;
  }

  const removeDOM = () => {
    if (window.wordByWordAudioPlayerEl) {
      window.wordByWordAudioPlayerEl.removeEventListener('ended', removeDOM);
      window.wordByWordAudioPlayerEl.remove();
      window.wordByWordAudioPlayerEl = null;
    }
  };

  const audio = new Audio(url);
  window.wordByWordAudioPlayerEl = audio;
  logEvent('load_audio_file', { audioUrl: url });

  if (fallbackUrl && fallbackUrl !== url) {
    const handleLocalError = () => {
      audio.removeEventListener('error', handleLocalError);
      if (window.wordByWordAudioPlayerEl === audio) {
        audio.src = fallbackUrl;
        audio.play()?.catch(() => {});
      }
    };
    audio.addEventListener('error', handleLocalError, { once: true });
  }

  audio.play()?.catch(() => {});
  audio.addEventListener('ended', removeDOM);
};

