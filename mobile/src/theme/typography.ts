import { TextStyle } from 'react-native';

export const fonts = {
  // UI & Translations
  uiRegular: 'Vazirmatn-Regular',
  // Sacred Quran Texts
  quranHafs: 'UthmanicHafs',
  quranIndoPak: 'IndoPakNastaleeq',
  // Typography aliases
  primary: 'Vazirmatn-Regular',
  primaryBold: 'Vazirmatn-Regular',
  uthmanicHafs: 'UthmanicHafs',
} as const;

export const fontSizes = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  jumbo: 34,
  quranTextDefault: 26,
  quranTextLarge: 32,
} as const;

export const textStyles: Record<string, TextStyle> = {
  heroTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.jumbo,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 44,
  },
  heroSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    textAlign: 'center',
    lineHeight: 22,
  },
  cardTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.lg,
    fontWeight: '600',
  },
  surahArabicTitle: {
    fontFamily: fonts.quranHafs,
    fontSize: fontSizes.xxl,
    textAlign: 'right',
  },
  ayahQuranText: {
    fontFamily: fonts.quranHafs,
    fontSize: fontSizes.quranTextDefault,
    lineHeight: 48,
    textAlign: 'right',
  },
  translationText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    lineHeight: 26,
    textAlign: 'right',
  },
  badgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
  },
};
