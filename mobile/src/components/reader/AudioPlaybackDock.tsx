import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { Play, Pause, SkipBack, SkipForward, Repeat, X } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  useThemeColors,
  themePalettes,
  AppTheme,
} from '@/theme';
import {
  READER_COMPONENT_CONTRACTS,
  formatAudioDockTitle,
  getSurahNameFa,
} from './readerContracts';
import { getReciterById } from '@/services/audio/reciterService';

export interface AudioPlaybackDockProps {
  isPlaying: boolean;
  activeVerseKey: string | null;
  surahName?: string;
  verseNumber?: number;
  reciterName?: string;
  selectedReciterId?: number;
  theme?: AppTheme;
  onPlayPause?: () => void;
  onNextAyah?: () => void;
  onPrevAyah?: () => void;
  onToggleRepeat?: () => void;
  isRepeating?: boolean;
  onPressDock?: () => void;
  onCloseDock?: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * AudioPlaybackDock renders a floating Sanctuary bottom bar for synchronized Quranic recitation.
 *
 * Features:
 * - Returns null when activeVerseKey is null (dismissed or inactive).
 * - Floating glassmorphic surface with emerald luminescence and iridescent border.
 * - Formatted Persian Ayah title (e.g. 'سوره الفاتحه • آیه ۱') and Reciter chip subtitle.
 * - RTL audio controls: Repeat toggle, Previous Ayah, prominent 48px Play/Pause, Next Ayah, and Close button.
 * - All interactive touch targets >= 44x44px conforming to Sanctuary and WCAG accessibility standards.
 */
export const AudioPlaybackDock: React.FC<AudioPlaybackDockProps> = React.memo(
  ({
    isPlaying,
    activeVerseKey,
    surahName,
    verseNumber,
    reciterName = READER_COMPONENT_CONTRACTS.audioDock.defaultReciter,
    selectedReciterId,
    theme,
    onPlayPause,
    onNextAyah,
    onPrevAyah,
    onToggleRepeat,
    isRepeating = false,
    onPressDock,
    onCloseDock,
    style,
    testID = 'audio-playback-dock',
  }) => {
    const activeColors = useThemeColors();
    const colors = theme ? themePalettes[theme] ?? activeColors : activeColors;

    if (!activeVerseKey) {
      return null;
    }

    // Resolve Surah name and verse number from activeVerseKey ('ch:v') if not explicitly passed
    let resolvedSurahName = surahName;
    let resolvedVerseNumber = verseNumber;

    if (!resolvedSurahName || resolvedVerseNumber === undefined) {
      const parts = activeVerseKey.split(':');
      const chId = parseInt(parts[0], 10);
      const vNum = parseInt(parts[1], 10);
      if (!resolvedSurahName && !isNaN(chId)) {
        resolvedSurahName = getSurahNameFa(chId);
      }
      if (resolvedVerseNumber === undefined && !isNaN(vNum)) {
        resolvedVerseNumber = vNum;
      }
    }

    const ayahTitle =
      formatAudioDockTitle(resolvedSurahName, resolvedVerseNumber) || `آیه ${activeVerseKey}`;
    const resolvedReciter =
      (selectedReciterId !== undefined ? getReciterById(selectedReciterId)?.nameFa : undefined) ||
      reciterName ||
      READER_COMPONENT_CONTRACTS.audioDock.defaultReciter;

    return (
      <View
        testID={testID}
        style={[
          styles.dockContainer,
          {
            backgroundColor: colors.surfaceFloating,
            borderColor: colors.borderSubtle,
          },
          style,
        ]}
        accessible={true}
        accessibilityRole="toolbar"
        accessibilityLabel={`نوار پخش صوت: ${ayahTitle}، قاری: ${resolvedReciter}`}
      >
        {/* Active Ayah Information & Reciter Subtitle */}
        <TouchableOpacity
          testID={`${testID}-info`}
          onPress={onPressDock}
          disabled={!onPressDock}
          activeOpacity={0.7}
          style={styles.infoArea}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel={`مشاهده آیه ${ayahTitle}، قاری: ${resolvedReciter}`}
        >
          <Text
            testID={`${testID}-title`}
            style={[styles.ayahTitle, { color: colors.textPrimary }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {ayahTitle}
          </Text>
          <View
            testID={`${testID}-reciter`}
            style={[
              styles.reciterChip,
              {
                backgroundColor: colors.primarySubtle,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <Text style={[styles.reciterText, { color: colors.textSecondary }]} numberOfLines={1}>
              {resolvedReciter}
            </Text>
          </View>
        </TouchableOpacity>

        {/* RTL Audio Controls Toolbar */}
        <View testID={`${testID}-controls`} style={styles.controlsToolbar}>
          {/* 1. Repeat Toggle Button */}
          <TouchableOpacity
            testID={`${testID}-repeat`}
            onPress={onToggleRepeat}
            activeOpacity={0.7}
            style={styles.controlButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isRepeating ? 'غیرفعال‌سازی تکرار آیه' : 'تکرار آیه'}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Repeat
              size={READER_COMPONENT_CONTRACTS.audioDock.iconSize}
              color={isRepeating ? colors.primary : colors.textFaded}
              strokeWidth={isRepeating ? 2.5 : 2}
            />
          </TouchableOpacity>

          {/* 2. Previous Ayah Button */}
          <TouchableOpacity
            testID={`${testID}-prev`}
            onPress={onPrevAyah}
            activeOpacity={0.7}
            style={styles.controlButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="آیه قبلی"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SkipBack
              size={READER_COMPONENT_CONTRACTS.audioDock.iconSize}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* 3. Prominent Circular Play/Pause Button */}
          <TouchableOpacity
            testID={`${testID}-play-pause`}
            onPress={onPlayPause}
            activeOpacity={0.8}
            style={[styles.playPauseButton, { backgroundColor: colors.primary }]}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'توقف پخش صوت' : 'پخش صوت'}
            hitSlop={{ top: 4, bottom: 4, left: 4, right: 4 }}
          >
            {isPlaying ? (
              <Pause
                size={READER_COMPONENT_CONTRACTS.audioDock.primaryIconSize}
                color={colors.textInverse}
                strokeWidth={2.5}
              />
            ) : (
              <Play
                size={READER_COMPONENT_CONTRACTS.audioDock.primaryIconSize}
                color={colors.textInverse}
                strokeWidth={2.5}
              />
            )}
          </TouchableOpacity>

          {/* 4. Next Ayah Button */}
          <TouchableOpacity
            testID={`${testID}-next`}
            onPress={onNextAyah}
            activeOpacity={0.7}
            style={styles.controlButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="آیه بعدی"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <SkipForward
              size={READER_COMPONENT_CONTRACTS.audioDock.iconSize}
              color={colors.textPrimary}
              strokeWidth={2}
            />
          </TouchableOpacity>

          {/* 5. Close / Dismiss Dock Button */}
          <TouchableOpacity
            testID={`${testID}-close`}
            onPress={onCloseDock}
            activeOpacity={0.7}
            style={styles.controlButton}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="بستن پخش صوتی"
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <X
              size={READER_COMPONENT_CONTRACTS.audioDock.iconSize}
              color={colors.textSecondary}
              strokeWidth={2}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  },
);

const styles = StyleSheet.create({
  dockContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceFloating,
    borderColor: colors.borderIridescent,
    borderWidth: 1,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: READER_COMPONENT_CONTRACTS.audioDock.minHeight,
    ...shadows.card,
    elevation: 8,
  },
  infoArea: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    paddingLeft: spacing.sm,
    minHeight: READER_COMPONENT_CONTRACTS.minTouchTarget,
  },
  ayahTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  reciterChip: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  reciterText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    textAlign: 'right',
  },
  controlsToolbar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
  },
  controlButton: {
    minWidth: READER_COMPONENT_CONTRACTS.audioDock.secondaryButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.audioDock.secondaryButtonSize,
    width: READER_COMPONENT_CONTRACTS.audioDock.secondaryButtonSize,
    height: READER_COMPONENT_CONTRACTS.audioDock.secondaryButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.circle,
  },
  playPauseButton: {
    minWidth: READER_COMPONENT_CONTRACTS.audioDock.primaryButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.audioDock.primaryButtonSize,
    width: READER_COMPONENT_CONTRACTS.audioDock.primaryButtonSize,
    height: READER_COMPONENT_CONTRACTS.audioDock.primaryButtonSize,
    borderRadius: READER_COMPONENT_CONTRACTS.audioDock.primaryButtonSize / 2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.glow,
    elevation: 4,
  },
});
