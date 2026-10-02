import { TextStyle, Platform } from 'react-native';

/**
 * Single source of truth for font family names loaded in _layout.tsx
 */
export const fonts = {
  // UI & Translations (Persian & Latin)
  uiRegular: 'Vazirmatn-Regular',
  uiMedium: 'Vazirmatn-Medium',
  uiBold: 'Vazirmatn-Bold',

  // Sacred Quran Texts (Calligraphic Arabic)
  quranHafs: 'UthmanicHafs',
  quranIndoPak: 'IndoPakNastaleeq',

  // Legacy compatibility aliases
  primary: 'Vazirmatn-Regular',
  primaryMedium: 'Vazirmatn-Medium',
  primaryBold: 'Vazirmatn-Bold',
  uthmanicHafs: 'UthmanicHafs',
} as const;

/**
 * Semantic weight mapper guarantees Android/iOS Typeface stability
 */
export const fontFamilies = {
  ui: {
    regular: fonts.uiRegular,
    medium: fonts.uiMedium,
    bold: fonts.uiBold,
  },
  quran: {
    hafs: fonts.quranHafs,
    indoPak: fonts.quranIndoPak,
  },
} as const;

/**
 * Standardized typography scale with zero magic numbers
 */
export const fontSizes = {
  xxs: 10,
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 32,
  jumbo: 34,
  quranTextDefault: 26,
  quranTextLarge: 32,
} as const;

/**
 * Calibrated line heights preventing Arabic diacritic clipping
 */
export const lineHeights = {
  tight: 1.25,
  snug: 1.35,
  normal: 1.5,
  relaxed: 1.75,
  quranic: 2.0,
} as const;

/**
 * Platform font settings for Android Persian/Arabic metrics
 */
const platformFontProps: TextStyle = Platform.select({
  android: {
    includeFontPadding: false,
    textAlignVertical: 'center',
  },
  default: {},
});

/**
 * Semantic Typography Tokens — strictly NO conflicting `fontWeight`
 */
export const typography = {
  // Display & Headers
  heroTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.jumbo,
    lineHeight: 44,
    textAlign: 'center',
    ...platformFontProps,
  } as TextStyle,

  heroSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    lineHeight: 22,
    textAlign: 'center',
    ...platformFontProps,
  } as TextStyle,

  sectionHeader: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.lg,
    lineHeight: 26,
    ...platformFontProps,
  } as TextStyle,

  cardTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.md,
    lineHeight: 22,
    ...platformFontProps,
  } as TextStyle,

  // Body & Content
  bodyRegular: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    lineHeight: 24,
    ...platformFontProps,
  } as TextStyle,

  bodyMedium: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.md,
    lineHeight: 24,
    ...platformFontProps,
  } as TextStyle,

  translationText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    lineHeight: 28,
    textAlign: 'right',
    ...platformFontProps,
  } as TextStyle,

  // Badges, Chips & Labels
  badgeBold: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
    lineHeight: 16,
    ...platformFontProps,
  } as TextStyle,

  badgeMedium: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.xs,
    lineHeight: 16,
    ...platformFontProps,
  } as TextStyle,

  captionRegular: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    lineHeight: 16,
    ...platformFontProps,
  } as TextStyle,

  // Interactive Tabs & Switchers
  tabLabelActive: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    ...platformFontProps,
  } as TextStyle,

  tabLabelInactive: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.sm,
    ...platformFontProps,
  } as TextStyle,

  // Sacred Quran Texts (Calligraphic)
  surahArabicTitle: {
    fontFamily: fonts.quranHafs,
    fontSize: fontSizes.xxl,
    lineHeight: 48,
    textAlign: 'right',
  } as TextStyle,

  ayahQuranText: {
    fontFamily: fonts.quranHafs,
    fontSize: fontSizes.quranTextDefault,
    lineHeight: 52, // 2.0x breathing room for complex diacritics
    textAlign: 'right',
  } as TextStyle,
} as const;

// Backward-compatible alias for textStyles
export const textStyles: Record<string, TextStyle> = {
  heroTitle: typography.heroTitle,
  heroSubtitle: typography.heroSubtitle,
  cardTitle: typography.cardTitle,
  surahArabicTitle: typography.surahArabicTitle,
  ayahQuranText: typography.ayahQuranText,
  translationText: typography.translationText,
  badgeText: typography.badgeBold,
};
