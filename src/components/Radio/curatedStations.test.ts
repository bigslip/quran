import { describe, it, expect } from 'vitest';
import curatedStations from './curatedStations';

describe('curatedStations', () => {
  it('includes Surah An-Nas (Chapter 114) in popular reciter station', () => {
    const popularStation = curatedStations['1'];
    expect(popularStation).toBeDefined();
    const hasChapter114 = popularStation.audioTracks.some((track) => track.surah === '114');
    expect(hasChapter114).toBe(true);
  });

  it('includes Surah An-Nas (Chapter 114) in Juz Amma station', () => {
    const juzAmmaStation = curatedStations['4'];
    expect(juzAmmaStation).toBeDefined();
    const hasChapter114 = juzAmmaStation.audioTracks.some((track) => track.surah === '114');
    expect(hasChapter114).toBe(true);
    const hasChapter78 = juzAmmaStation.audioTracks.some((track) => track.surah === '78');
    expect(hasChapter78).toBe(true);
  });

  it('includes Surah Al-Kahf (Chapter 18) in Surah Al-Kahf station', () => {
    const kahfStation = curatedStations['3'];
    expect(kahfStation).toBeDefined();
    const allKahf = kahfStation.audioTracks.every((track) => track.surah === '18');
    expect(allKahf).toBe(true);
  });
});
