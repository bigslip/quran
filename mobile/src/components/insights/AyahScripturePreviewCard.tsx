import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import type { WordLinguisticInfo } from '../../types/quran';
import {
  INSIGHTS_COMPONENT_CONTRACTS,
  formatArabicRoot,
  formatPartOfSpeechFa,
  formatWordPositionBadge,
} from './insightsContracts';
import { toPersianDigits } from '../catalog/catalogFormatters';

export interface AyahScripturePreviewCardProps {
  verseKey: string;
  textUthmani: string;
  textIndopak?: string;
  translationFa?: string;
  words: WordLinguisticInfo[];
  activeWordPosition: number;
  onSelectWord: (position: number) => void;
  quranFont?: 'hafs' | 'indopak';
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
    style,
    testID = 'ayah-scripture-preview-card',
  }) => {
    // Resolve active word from linguistic words array or default to first
    const activeWord = words.find((w) => w.position === activeWordPosition) || words[0] || null;

    const fontName = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;

    const activeWordText = activeWord
      ? quranFont === 'indopak' && activeWord.text_indopak
        ? activeWord.text_indopak
        : activeWord.text_uthmani
      : '';

    return (
      <View style={[styles.container, style]} testID={testID}>
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
            const wordText =
              quranFont === 'indopak' && word.text_indopak ? word.text_indopak : word.text_uthmani;

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

const styles = StyleSheet.create({
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
    textAlign: 'right',
  },
});
