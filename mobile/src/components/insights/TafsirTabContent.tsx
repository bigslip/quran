import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Sparkles, DownloadCloud, X } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { colors, fonts, fontSizes, spacing, borderRadius } from '../../theme';
import type { TafsirExcerpt } from '../../types/quran';
import { INSIGHTS_COMPONENT_CONTRACTS, formatTafsirPillTitle } from './insightsContracts';
import { TAFSIR_NUDGE_BANNER_CONTRACTS, shouldShowTafsirNudgeBanner } from './tafsirNudgeContracts';
import { useReadingStore } from '../../stores/useReadingStore';
import {
  AVAILABLE_DOWNLOADABLE_TAFSIRS,
  isTafsirDownloaded,
} from '../../services/db/tafsirDownloadService';

export interface TafsirTabContentProps {
  tafsirs: TafsirExcerpt[];
  selectedTafsirId: string;
  onSelectTafsir: (id: string) => void;
  contemplativeTheme?: string;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * TafsirTabContent renders Persian exegesis excerpts with segmented source switching,
 * an ambient contemplative theme highlight card, and structured bullet takeaways.
 */
export const TafsirTabContent: React.FC<TafsirTabContentProps> = React.memo(
  ({
    tafsirs = [],
    selectedTafsirId,
    onSelectTafsir,
    contemplativeTheme,
    style,
    testID = 'tafsir-tab-content',
  }) => {
    // Resolve active tafsir or default to the first available excerpt
    const activeTafsir = tafsirs.find((t) => t.id === selectedTafsirId) || tafsirs[0] || null;

    // Reading store integration for usage tracking and dismissal state
    const tafsirOpenCount = useReadingStore((state) => state.tafsirOpenCount);
    const isTafsirNudgeDismissed = useReadingStore((state) => state.isTafsirNudgeDismissed);
    const incrementTafsirOpenCount = useReadingStore((state) => state.incrementTafsirOpenCount);
    const dismissTafsirNudge = useReadingStore((state) => state.dismissTafsirNudge);

    const [isAllTafsirDownloaded, setIsAllTafsirDownloaded] = useState<boolean>(false);

    // Increment usage count upon mounting or entering the Tafsir tab
    useEffect(() => {
      incrementTafsirOpenCount();
    }, [incrementTafsirOpenCount]);

    // Check if all authentic downloadable Persian Tafsirs are downloaded
    useEffect(() => {
      let isMounted = true;
      async function checkDownloaded() {
        try {
          const statuses = await Promise.all(
            AVAILABLE_DOWNLOADABLE_TAFSIRS.map((t) => isTafsirDownloaded(t.slug)),
          );
          if (isMounted) {
            setIsAllTafsirDownloaded(statuses.every(Boolean));
          }
        } catch {
          if (isMounted) {
            setIsAllTafsirDownloaded(false);
          }
        }
      }
      checkDownloaded();
      return () => {
        isMounted = false;
      };
    }, []);

    const showNudgeBanner = shouldShowTafsirNudgeBanner({
      tafsirOpenCount,
      isTafsirNudgeDismissed,
      isAllTafsirDownloaded,
    });

    const handleNavigateSettings = useCallback(() => {
      try {
        const router = useRouter();
        router.push(TAFSIR_NUDGE_BANNER_CONTRACTS.settingsRoute as any);
      } catch {
        // In non-router or test environments, fail gracefully
      }
    }, []);

    return (
      <View style={[styles.container, style]} testID={testID}>
        {/* 0. Frequent-User Offline Tafsir Download Nudge Banner */}
        {showNudgeBanner && (
          <View
            style={styles.nudgeBannerCard}
            testID={`${testID}-nudge-banner`}
            accessible={true}
            accessibilityRole="alert"
            accessibilityLabel={TAFSIR_NUDGE_BANNER_CONTRACTS.bannerTitle}
          >
            <View style={styles.nudgeBannerHeaderRow}>
              <TouchableOpacity
                testID={`${testID}-nudge-dismiss-button`}
                onPress={dismissTafsirNudge}
                activeOpacity={0.7}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonLabel}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                style={styles.nudgeDismissButton}
              >
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>

              <View style={styles.nudgeTitleContainer}>
                <View style={styles.nudgeIconWrapper}>
                  <DownloadCloud size={18} color={colors.primary} />
                </View>
                <Text style={styles.nudgeTitleText}>
                  {TAFSIR_NUDGE_BANNER_CONTRACTS.bannerTitle}
                </Text>
              </View>
            </View>

            <Text style={styles.nudgeDescriptionText}>
              {TAFSIR_NUDGE_BANNER_CONTRACTS.bannerDescription}
            </Text>

            <View style={styles.nudgeActionRow}>
              <TouchableOpacity
                testID={`${testID}-nudge-cta-button`}
                onPress={handleNavigateSettings}
                activeOpacity={0.8}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonLabel}
                style={styles.nudgeCtaButton}
              >
                <Text style={styles.nudgeCtaButtonText}>
                  {TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 1. Contemplative Theme Card (rendered when contemplativeTheme exists) */}
        {Boolean(contemplativeTheme && contemplativeTheme.trim()) && (
          <View
            style={styles.themeCard}
            testID={`${testID}-contemplative-theme-card`}
            accessible={true}
            accessibilityRole="summary"
            accessibilityLabel={`پیام کلیدی و تم تدبری: ${contemplativeTheme}`}
          >
            <View style={styles.themeHeaderRow}>
              <View style={styles.themeIconWrapper}>
                <Sparkles size={16} color={colors.primary} />
              </View>
              <Text style={styles.themeTitleText}>«پیام کلیدی و تم تدبری»</Text>
            </View>
            <Text style={styles.themeContentText} testID={`${testID}-theme-text`}>
              {contemplativeTheme}
            </Text>
          </View>
        )}

        {/* 2. Source Selector Segmented Pills */}
        {tafsirs.length > 0 && (
          <View style={styles.sourceSelectorContainer} testID={`${testID}-source-selector`}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pillsScrollContent}
              accessibilityRole="tablist"
            >
              {tafsirs.map((tafsir) => {
                const isActive = activeTafsir?.id === tafsir.id;
                const pillLabel = formatTafsirPillTitle(tafsir);

                return (
                  <TouchableOpacity
                    key={tafsir.id}
                    testID={`${testID}-pill-${tafsir.id}`}
                    onPress={() => onSelectTafsir(tafsir.id)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={`تفسیر ${pillLabel}`}
                    style={[
                      styles.pillButton,
                      isActive ? styles.pillButtonActive : styles.pillButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillButtonText,
                        isActive ? styles.pillButtonTextActive : styles.pillButtonTextInactive,
                      ]}
                    >
                      {pillLabel}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* 3. Selected Tafsir Exegesis Card */}
        {activeTafsir ? (
          <View style={styles.exegesisCard} testID={`${testID}-exegesis-card`}>
            {/* Header Row: Author Chip & Exegesis Title */}
            <View style={styles.exegesisHeader}>
              <View style={styles.authorBadge} testID={`${testID}-author-badge`}>
                <Text style={styles.authorBadgeText}>{activeTafsir.author_name}</Text>
              </View>
              <Text style={styles.tafsirTitle} testID={`${testID}-tafsir-title`}>
                {activeTafsir.title}
              </Text>
            </View>

            {/* Expository Exegesis Body */}
            <Text style={styles.tafsirBodyText} testID={`${testID}-tafsir-text`}>
              {activeTafsir.text}
            </Text>

            {/* Key Takeaways & Contemplation Points */}
            {Boolean(activeTafsir.points && activeTafsir.points.length > 0) && (
              <View style={styles.takeawaysSection} testID={`${testID}-takeaways-section`}>
                <View style={styles.takeawaysHeaderRow}>
                  <Text style={styles.takeawaysTitle}>نکات کلیدی و تدبری</Text>
                </View>

                <View style={styles.takeawaysList}>
                  {activeTafsir.points!.map((point, index) => (
                    <View
                      key={index}
                      style={styles.takeawayItemRow}
                      testID={`${testID}-takeaway-item-${index}`}
                    >
                      <View style={styles.bulletContainer}>
                        <Text style={styles.bulletDot}>◆</Text>
                      </View>
                      <Text style={styles.takeawayText}>{point}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        ) : (
          /* Empty State */
          <View style={styles.emptyCard} testID={`${testID}-empty-card`}>
            <Text style={styles.emptyText}>تفسیر و بیانی برای این بخش ثبت نشده است.</Text>
          </View>
        )}
      </View>
    );
  },
);

TafsirTabContent.displayName = 'TafsirTabContent';

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: spacing.md,
  },
  // Contemplative Theme Card
  themeCard: {
    backgroundColor: colors.surfaceFloating,
    borderColor: colors.primary,
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  themeHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  themeIconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeTitleText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.primaryLight,
    textAlign: 'right',
  },
  themeContentText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    lineHeight: 22,
    textAlign: 'right',
  },
  // Source Selector Segmented Pills
  sourceSelectorContainer: {
    width: '100%',
    marginBottom: spacing.xs,
  },
  pillsScrollContent: {
    flexDirection: 'row-reverse',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  pillButton: {
    minHeight: INSIGHTS_COMPONENT_CONTRACTS.tafsirPillMinHeight,
    minWidth: INSIGHTS_COMPONENT_CONTRACTS.tafsirPillMinWidth,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillButtonActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
    borderWidth: 1.5,
  },
  pillButtonInactive: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
  },
  pillButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  pillButtonTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  pillButtonTextInactive: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  // Exegesis Sanctuary Card
  exegesisCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.lg,
  },
  exegesisHeader: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  authorBadge: {
    backgroundColor: colors.goldGlow,
    borderColor: colors.goldAccent,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    alignSelf: 'flex-end',
  },
  authorBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.goldAccent,
    textAlign: 'right',
  },
  tafsirTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
    lineHeight: 28,
  },
  tafsirBodyText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    lineHeight: INSIGHTS_COMPONENT_CONTRACTS.tafsirBodyLineHeight,
    textAlign: 'right',
  },
  // Takeaways Section
  takeawaysSection: {
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSeparator,
  },
  takeawaysHeaderRow: {
    marginBottom: spacing.sm,
    alignItems: 'flex-end',
  },
  takeawaysTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.goldAccent,
    textAlign: 'right',
  },
  takeawaysList: {
    gap: spacing.sm,
  },
  takeawayItemRow: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  bulletContainer: {
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bulletDot: {
    color: colors.primary,
    fontSize: 10,
  },
  takeawayText: {
    flex: 1,
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    lineHeight: 22,
    textAlign: 'right',
  },
  // Empty State Card
  emptyCard: {
    backgroundColor: colors.surfaceCard,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    color: colors.textFaded,
    textAlign: 'center',
  },
  // Frequent-User Offline Tafsir Download Nudge Banner
  nudgeBannerCard: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderIridescent,
    borderWidth: 1.5,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  nudgeBannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nudgeTitleContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  nudgeIconWrapper: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.primarySubtle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nudgeTitleText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'right',
  },
  nudgeDismissButton: {
    minWidth: TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonMinWidth,
    minHeight: TAFSIR_NUDGE_BANNER_CONTRACTS.dismissButtonMinHeight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nudgeDescriptionText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textSecondary,
    lineHeight: 20,
    textAlign: 'right',
  },
  nudgeActionRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  nudgeCtaButton: {
    minHeight: TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonMinHeight,
    minWidth: TAFSIR_NUDGE_BANNER_CONTRACTS.ctaButtonMinWidth,
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  nudgeCtaButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '700',
    color: colors.textInverse,
    textAlign: 'center',
  },
});
