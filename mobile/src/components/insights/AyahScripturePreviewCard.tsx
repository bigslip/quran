import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { ChevronDown, ChevronUp } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  useThemeColors,
  type ColorTheme,
} from '../../theme';
import type { WordLinguisticInfo } from '../../types/quran';
import {
  INSIGHTS_COMPONENT_CONTRACTS,
  formatArabicRoot,
  formatPartOfSpeechFa,
  formatWordPositionBadge,
} from './insightsContracts';
import { toPersianDigits } from '../catalog/catalogFormatters';
import { normalizeQuranArabic } from '@/utils/arabicTextSanitizer';

export interface AyahScripturePreviewCardProps {
  verseKey: string;
  textUthmani: string;
  textIndopak?: string;
  translationFa?: string;
  words: WordLinguisticInfo[];
  activeWordPosition: number;
  onSelectWord: (position: number) => void;
  quranFont?: 'hafs' | 'indopak';
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * AyahScripturePreviewCard renders the sacred Ayah scripture with word-level interactivity.
 *
 * Features:
 * - Active Word Banner Chip: calligraphic preview (24px), Persian gloss, Arabic root, and POS badge.
 * - Interactive Arabic Scripture flow: RTL wrap (`flexDirection: 'row-reverse'`) with emerald highlight for active word.
 * - Full accessibility and minimum touch target compliance (>= 44x44px).
 * - Persian translation text display below the sacred scripture.
 * - Sleek collapsible mode for maximizing exegesis reading sanctuary height.
 */
export const AyahScripturePreviewCard: React.FC<AyahScripturePreviewCardProps> = React.memo(
  ({
    verseKey,
    textUthmani,
    textIndopak,
    translationFa,
    words,
    activeWordPosition,
    onSelectWord,
    quranFont = 'hafs',
    isCollapsed = false,
    onToggleCollapse,
    style,
    testID = 'ayah-scripture-preview-card',
  }) => {
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [colors]);

    // Resolve active word from linguistic words array or default to first
    const activeWord = words.find((w) => w.position === activeWordPosition) || words[0] || null;

    const fontName = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;

    const rawActiveWordText = activeWord
      ? quranFont === 'indopak' && activeWord.text_indopak
        ? activeWord.text_indopak
        : activeWord.text_uthmani
      : '';
    const activeWordText =
      quranFont === 'hafs' ? normalizeQuranArabic(rawActiveWordText) : rawActiveWordText;

    if (isCollapsed) {
      const rawScripturePreview =
        quranFont === 'indopak' && textIndopak ? textIndopak : textUthmani;
      const scripturePreviewText =
        quranFont === 'hafs' ? normalizeQuranArabic(rawScripturePreview) : rawScripturePreview;

      return (
        <View style={[styles.compactContainer, style]} testID={`${testID}-compact`}>
          <TouchableOpacity
            testID={`${testID}-expand-button`}
            onPress={onToggleCollapse}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="نمایش متن و ترجمه کامل آیه"
            style={styles.compactExpandButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <ChevronDown size={16} color={colors.primaryLight} />
            <Text style={styles.compactExpandText}>مشاهده متن کامل آیه</Text>
          </TouchableOpacity>

          <Text
            style={[styles.compactScriptureText, { fontFamily: fontName }]}
            numberOfLines={1}
            ellipsizeMode="tail"
            testID={`${testID}-compact-text`}
            allowFontScaling={false}
          >
            {scripturePreviewText}
          </Text>
        </View>
      );
    }

    return (
      <View style={[styles.container, style]} testID={testID}>
        {/* Collapse Control Header (rendered when onToggleCollapse is provided) */}
        {Boolean(onToggleCollapse) && (
          <View style={styles.expandedHeaderRow}>
            <TouchableOpacity
              testID={`${testID}-collapse-button`}
              onPress={onToggleCollapse}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="بستن متن آیه"
              style={styles.collapseButton}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <ChevronUp size={16} color={colors.primaryLight} />
              <Text style={styles.collapseButtonText}>بستن آیه</Text>
            </TouchableOpacity>
            <Text style={styles.expandedHeaderTitle}>متن و ترجمه کامل آیه</Text>
          </View>
        )}

        {/* Active Word Banner Chip */}
        {activeWord && (
          <View
            style={styles.activeBanner}
            testID={`${testID}-active-banner`}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`واژه فعال: ${activeWord.text_uthmani}، معنی: ${activeWord.translation_fa}`}
          >
            <View style={styles.activeBannerTopRow}>
              {/* Calligraphic Sacred Word */}
              <Text
                style={[styles.activeWordCalligraphy, { fontFamily: fontName }]}
                testID={`${testID}-banner-word`}
                allowFontScaling={false}
              >
                {activeWordText}
              </Text>

              {/* Linguistic Tags: Position, Root, POS */}
              <View style={styles.badgeRow}>
                <View style={styles.positionBadge} testID={`${testID}-banner-position`}>
                  <Text style={styles.positionBadgeText}>
                    {formatWordPositionBadge(activeWord.position)}
                  </Text>
                </View>

                <View style={styles.rootChip} testID={`${testID}-banner-root`}>
                  <Text style={styles.rootChipText}>
                    {`ریشه: ${formatArabicRoot(activeWord.root_arabic)}`}
                  </Text>
                </View>

                <View style={styles.posBadge} testID={`${testID}-banner-pos`}>
                  <Text style={styles.posBadgeText}>
                    {formatPartOfSpeechFa(activeWord.part_of_speech)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Persian Gloss Translation */}
            {Boolean(activeWord.translation_fa) && (
              <Text style={styles.activeGlossText} testID={`${testID}-banner-gloss`}>
                {activeWord.translation_fa}
              </Text>
            )}
          </View>
        )}

        {/* Interactive Arabic Scripture Text Flow */}
        <View
          style={styles.scriptureFlowContainer}
          testID={`${testID}-scripture-flow`}
          accessible={false}
        >
          {words.map((word) => {
            const isActive = word.position === activeWordPosition;
            const rawWord =
              quranFont === 'indopak' && word.text_indopak ? word.text_indopak : word.text_uthmani;
            const wordText = quranFont === 'hafs' ? normalizeQuranArabic(rawWord) : rawWord;

            return (
              <TouchableOpacity
                key={`${verseKey}-${word.position}-${word.id || ''}`}
                testID={`${testID}-word-${word.position}`}
                onPress={() => onSelectWord(word.position)}
                activeOpacity={0.7}
                hitSlop={INSIGHTS_COMPONENT_CONTRACTS.wordHitSlop}
                accessible={true}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
                accessibilityLabel={`واژه ${toPersianDigits(word.position)}: ${wordText}`}
                style={[
                  styles.wordButton,
                  isActive ? styles.wordButtonActive : styles.wordButtonInactive,
                ]}
              >
                <Text
                  style={[
                    styles.scriptureWordText,
                    { fontFamily: fontName },
                    isActive ? styles.scriptureWordActive : styles.scriptureWordInactive,
                  ]}
                  allowFontScaling={false}
                >
                  {wordText}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Persian Translation Text Below Scripture */}
        {Boolean(translationFa) && (
          <View style={styles.translationContainer} testID={`${testID}-translation-container`}>
            <View style={styles.divider} />
            <Text style={styles.translationText} testID={`${testID}-translation`}>
              {translationFa}
            </Text>
          </View>
        )}
      </View>
    );
  },
);

AyahScripturePreviewCard.displayName = 'AyahScripturePreviewCard';

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceCard,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: INSIGHTS_COMPONENT_CONTRACTS.cardBorderRadius,
      padding: spacing.lg,
    },
    activeBanner: {
      minHeight: INSIGHTS_COMPONENT_CONTRACTS.activeChipHeight,
      backgroundColor: colors.surfaceFloating,
      borderColor: colors.borderIridescent,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      padding: spacing.md,
      marginBottom: spacing.md,
    },
    activeBannerTopRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: spacing.sm,
    },
    activeWordCalligraphy: {
      fontSize: INSIGHTS_COMPONENT_CONTRACTS.activeBannerFontSize,
      lineHeight: INSIGHTS_COMPONENT_CONTRACTS.activeBannerLineHeight,
      color: colors.goldAccent,
      textAlign: 'right',
    },
    badgeRow: {
      flexDirection: 'row-reverse',
      alignItems: 'center',
      gap: 6,
      flexWrap: 'wrap',
    },
    positionBadge: {
      backgroundColor: colors.surfaceCardHover,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    positionBadgeText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textMuted,
    },
    rootChip: {
      backgroundColor: colors.surfaceCardHover,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    rootChipText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textMuted,
    },
    posBadge: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.primary,
      borderWidth: 1,
      borderRadius: borderRadius.sm,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    posBadgeText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.primaryLight,
    },
    activeGlossText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      lineHeight: 22,
      color: colors.textSecondary,
      textAlign: 'right',
      marginTop: spacing.xs,
    },
    scriptureFlowContainer: {
      flexDirection: 'row-reverse',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'center',
      marginVertical: spacing.sm,
    },
    wordButton: {
      minWidth: INSIGHTS_COMPONENT_CONTRACTS.wordButtonMinWidth,
      minHeight: INSIGHTS_COMPONENT_CONTRACTS.wordButtonMinHeight,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      margin: spacing.xs,
      borderRadius: borderRadius.md,
      justifyContent: 'center',
      alignItems: 'center',
    },
    wordButtonActive: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.primary,
      borderWidth: INSIGHTS_COMPONENT_CONTRACTS.activeWordBorderWidth,
    },
    wordButtonInactive: {
      backgroundColor: 'transparent',
      borderColor: 'transparent',
      borderWidth: INSIGHTS_COMPONENT_CONTRACTS.activeWordBorderWidth,
    },
    scriptureWordText: {
      fontSize: INSIGHTS_COMPONENT_CONTRACTS.scriptureFontSize,
      lineHeight: INSIGHTS_COMPONENT_CONTRACTS.scriptureLineHeight,
      textAlign: 'center',
    },
    scriptureWordActive: {
      color: colors.primaryLight,
    },
    scriptureWordInactive: {
      color: colors.textPrimary,
    },
    translationContainer: {
      marginTop: spacing.sm,
    },
    divider: {
      height: 1,
      backgroundColor: colors.borderSeparator,
      marginBottom: spacing.md,
    },
    translationText: {
      fontFamily: fonts.uiRegular,
      fontSize: INSIGHTS_COMPONENT_CONTRACTS.translationFontSize,
      lineHeight: INSIGHTS_COMPONENT_CONTRACTS.translationLineHeight,
      color: colors.textSecondary,
      textAlign: 'justify',
      writingDirection: 'rtl',
    },
    // Compact Scripture Banner Styles
    compactContainer: {
      minHeight: INSIGHTS_COMPONENT_CONTRACTS.compactScriptureBannerMinHeight,
      backgroundColor: colors.surfaceFloating,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderRadius: borderRadius.md,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    compactExpandButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minHeight: INSIGHTS_COMPONENT_CONTRACTS.minTouchTarget,
      paddingHorizontal: spacing.xs,
    },
    compactExpandText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.primaryLight,
    },
    compactScriptureText: {
      flex: 1,
      fontSize: INSIGHTS_COMPONENT_CONTRACTS.compactScriptureFontSize,
      lineHeight: INSIGHTS_COMPONENT_CONTRACTS.compactScriptureLineHeight,
      color: colors.goldAccent,
      textAlign: 'right',
    },
    // Expanded Scripture Header Styles
    expandedHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    collapseButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minHeight: INSIGHTS_COMPONENT_CONTRACTS.minTouchTarget,
      paddingHorizontal: spacing.xs,
    },
    collapseButtonText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.primaryLight,
    },
    expandedHeaderTitle: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: 'right',
    },
  });
