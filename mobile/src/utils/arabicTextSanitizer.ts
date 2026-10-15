/**
 * Quranic Arabic Text Normalizer & Sanitizer
 *
 * Resolves King Fahd Complex Uthmanic font glyph discrepancies where certain
 * Unicode combining marks (such as U+06DF ARABIC SMALL HIGH ROUNDED ZERO)
 * erroneously map to full-width ornamental Ayah end rosette glyphs (uni0600)
 * rather than combining sukun / zero marks.
 *
 * Normalizing these characters to standard Arabic Sukun (U+0652) preserves authentic
 * recitation marks while ensuring clean, beautiful non-spacing rendering across all
 * platforms (iOS CoreText, Android HarfBuzz, Web).
 */

export const INCORRECT_SUKUN_REGEX: RegExp = /[\u06DF\u06E3\u06EB\u06EE\u06EF]/g;

/**
 * Normalizes Quranic Arabic text to eliminate broken sukun / rounded zero glyphs
 * that render as giant rosettes or detached circles in Uthmanic Hafs fonts.
 *
 * @param text - The raw Arabic scripture string
 * @returns Clean, normalized Quranic text
 */
export function normalizeQuranArabic(text?: string | null): string {
  if (!text) return '';
  return text.replace(INCORRECT_SUKUN_REGEX, '\u0652');
}
