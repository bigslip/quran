import { toLocalizedNumber } from './locale';

/**
 * Get the juz number by the hiz number. One hizb is half a Juz.
 *
 * @param {number} hizb
 * @returns {number}
 */
export const getJuzNumberByHizb = (hizb: number): number => Math.ceil(hizb / 2);

/**
 * Whether the current juz is the first juz.
 *
 * @param {number} juzNumber
 * @returns {boolean}
 */
export const isFirstJuz = (juzNumber: number): boolean => juzNumber === 1;

/**
 * Whether the current juz is the last juz.
 *
 * @param {number} juzNumber
 * @returns {boolean}
 */
export const isLastJuz = (juzNumber: number): boolean => juzNumber === 30;

const TOTAL_QURAN_JUZ = 30;
const juzIdsCache: Record<string, Array<{ value: number; label: string }>> = {};

export const getJuzIds = (lang: string) => {
  if (!juzIdsCache[lang]) {
    juzIdsCache[lang] = [...Array(TOTAL_QURAN_JUZ)].map((_, index) => {
      const juz = index + 1;
      return {
        value: juz,
        label: toLocalizedNumber(juz, lang),
      };
    });
  }
  return juzIdsCache[lang];
};
