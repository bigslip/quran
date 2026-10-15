// Safely resolve I18nManager without breaking Node.js test environments
let isRtlNative = false;
try {
  if (typeof require === 'function') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const rn = require('react-native');
    if (rn?.I18nManager) {
      isRtlNative = Boolean(rn.I18nManager.isRTL);
    }
  }
} catch {
  isRtlNative = false;
}

export const isRTL: boolean = isRtlNative;

/** Flex direction that always flows Right-to-Left (first child on the physical right). */
export const rtlRow: 'row' | 'row-reverse' = 'row-reverse';

/** Flex direction that flows Left-to-Right (first child on the physical left). */
export const rtlRowReverse: 'row' | 'row-reverse' = 'row';

/** Text alignment that always aligns to the physical Right across both Android and iOS. */
export const rtlTextAlign: 'left' | 'right' = 'right';

/** Text alignment that always aligns to the physical Left across both Android and iOS. */
export const ltrTextAlign: 'left' | 'right' = 'left';

/** Cross-axis flex alignment that aligns to the physical Right in column layouts. */
export const rtlFlexStart: 'flex-start' | 'flex-end' = 'flex-end';

/** Cross-axis flex alignment that aligns to the physical Left in column layouts. */
export const rtlFlexEnd: 'flex-start' | 'flex-end' = 'flex-start';

/** Safe writing direction for RTL text components across iOS and Android. */
export const rtlWritingDirection: 'rtl' = 'rtl';

/**
 * Detects whether a string is predominantly Right-to-Left (Persian, Arabic).
 * If the string contains any Persian/Arabic Unicode characters, it is classified as RTL.
 */
export const isRTLText = (text: string | null | undefined): boolean => {
  if (!text) return true;
  return /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/.test(text);
};

/**
 * Detects whether a string is Latin/Left-to-Right (e.g. English translation).
 * Returns true only if it contains Latin characters and no Arabic/Persian letters.
 */
export const isLatinText = (text: string | null | undefined): boolean => {
  if (!text) return false;
  return !isRTLText(text) && /[a-zA-Z]/.test(text);
};

/**
 * Ensures Persian/Arabic text has a strong RTL marker at the start so that
 * native text engines (iOS CoreText & Android StaticLayout) resolve paragraph
 * direction to RTL and correctly justify with right-anchored last lines,
 * even when the text begins with neutral characters like `(`, `"`, `[`, or digits.
 */
export const formatRTLText = (text: string | null | undefined): string => {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('\u200F') || isLatinText(trimmed)) {
    return trimmed;
  }
  if (isRTLText(trimmed)) {
    return `\u200F${trimmed}`;
  }
  return trimmed;
};
