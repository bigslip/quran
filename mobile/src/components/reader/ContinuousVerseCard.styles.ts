import type { ViewStyle, TextStyle } from 'react-native';
import type { AppTheme, ColorTheme } from '../../theme/colors.ts';
import { themePalettes } from '../../theme/colors.ts';
import { spacing, borderRadius } from '../../theme/spacing.ts';
import { READER_COMPONENT_CONTRACTS } from './readerContracts.ts';

const fonts = {
  uiRegular: 'Vazirmatn-Regular',
  uiMedium: 'Vazirmatn-Medium',
  uiBold: 'Vazirmatn-Bold',
  quranHafs: 'UthmanicHafs',
} as const;

const fontSizes = {
  xs: 11,
  sm: 13,
} as const;

const rtlRow = 'row-reverse' as const;
const rtlTextAlign = 'right' as const;
const rtlFlexStart = 'flex-end' as const;
const rtlWritingDirection = 'rtl' as const;

/**
 * Builds precompiled static styles for ContinuousVerseCard according to the active theme palette.
 * Precompiled at module initialization time for 60fps FlatList scroll performance with zero runtime allocations.
 */
export function buildVerseCardStyles(c: ColorTheme) {
  return {
    cardContainer: {
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      padding: spacing.md,
      marginVertical: spacing.xs,
    } as ViewStyle,
    cardInactive: {
      backgroundColor: c.surfaceCard,
      borderColor: c.borderSubtle,
    } as ViewStyle,
    cardActive: {
      backgroundColor: c.surfaceFloating,
      borderColor: c.primary,
      shadowColor: c.primary,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 4,
    } as ViewStyle,
    cardHighlighted: {
      borderColor: '#F59E0B',
      borderWidth: 2,
      backgroundColor: 'rgba(245, 158, 11, 0.08)',
      shadowColor: '#F59E0B',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.35,
      shadowRadius: 10,
      elevation: 4,
    } as ViewStyle,
    headerBar: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    } as ViewStyle,
    badgeOuter: {
      width: READER_COMPONENT_CONTRACTS.verseCard.badgeOuterSize,
      height: READER_COMPONENT_CONTRACTS.verseCard.badgeOuterSize,
      borderRadius: borderRadius.circle,
      backgroundColor: c.surfaceFloating,
      borderWidth: 1,
      borderColor: c.borderIridescent,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    badgeInner: {
      width: READER_COMPONENT_CONTRACTS.verseCard.badgeInnerSize,
      height: READER_COMPONENT_CONTRACTS.verseCard.badgeInnerSize,
      borderRadius: borderRadius.circle,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    badgeText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: c.primary,
    } as TextStyle,
    actionBar: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.xs,
    } as ViewStyle,
    actionButton: {
      minWidth: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
      minHeight: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
      width: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
      height: READER_COMPONENT_CONTRACTS.verseCard.actionButtonSize,
      borderRadius: borderRadius.circle,
      backgroundColor: c.surfaceFloating,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    } as ViewStyle,
    actionButtonActive: {
      backgroundColor: c.primarySubtle,
      borderColor: c.primary,
    } as ViewStyle,
    actionButtonBookmarked: {
      backgroundColor: c.primarySubtle,
      borderColor: c.goldAccent,
    } as ViewStyle,
    arabicTextContainer: {
      width: '100%',
      paddingVertical: spacing.xs,
      marginBottom: spacing.sm,
      alignItems: rtlFlexStart,
    } as ViewStyle,
    arabicText: {
      color: c.textPrimary,
      textAlign: rtlTextAlign,
      writingDirection: rtlWritingDirection,
      width: '100%',
      flexShrink: 1,
    } as TextStyle,
    ayahEndMarker: {
      fontFamily: fonts.quranHafs,
      color: c.goldAccent,
    } as TextStyle,
    wbwFlowContainer: {
      flexDirection: rtlRow,
      flexWrap: 'wrap',
      gap: spacing.xs,
      marginVertical: spacing.sm,
      paddingTop: spacing.xs,
      paddingBottom: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.borderSeparator,
    } as ViewStyle,
    wbwItemCard: {
      backgroundColor: c.surfaceFloating,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: c.borderSubtle,
      paddingHorizontal: spacing.xs + 2,
      paddingVertical: spacing.xs,
      alignItems: 'center',
      justifyContent: 'center',
      maxWidth: '100%',
    } as ViewStyle,
    wbwArabicText: {
      color: c.textPrimary,
      textAlign: 'center',
    } as TextStyle,
    wbwGlossText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: c.textMuted,
      textAlign: 'center',
      marginTop: 2,
    } as TextStyle,
    translationsContainer: {
      marginTop: spacing.sm,
      paddingTop: spacing.sm,
      borderTopWidth: 1,
      borderTopColor: c.borderSeparator,
      gap: spacing.md,
    } as ViewStyle,
    translationBlock: {
      gap: spacing.xs,
      width: '100%',
    } as ViewStyle,
    translationHeaderRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '100%',
    } as ViewStyle,
    translatorChip: {
      backgroundColor: c.primarySubtle,
      borderWidth: 1,
      borderColor: c.primaryGlow,
      borderRadius: borderRadius.sm,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    } as ViewStyle,
    translatorChipText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: c.textSecondary,
    } as TextStyle,
    translationText: {
      fontFamily: fonts.uiRegular,
      fontSize: READER_COMPONENT_CONTRACTS.verseCard.translationFontSize,
      lineHeight: READER_COMPONENT_CONTRACTS.verseCard.translationLineHeight,
      color: c.textSecondary,
      textAlign: 'justify',
      writingDirection: rtlWritingDirection,
      width: '100%',
      flexShrink: 1,
    } as TextStyle,
  };
}

export type VerseCardStyles = ReturnType<typeof buildVerseCardStyles>;

export const verseCardThemeStyles: Record<AppTheme, VerseCardStyles> = {
  dark: buildVerseCardStyles(themePalettes.dark),
  emerald: buildVerseCardStyles(themePalettes.emerald),
  sepia: buildVerseCardStyles(themePalettes.sepia),
  light: buildVerseCardStyles(themePalettes.light),
};
