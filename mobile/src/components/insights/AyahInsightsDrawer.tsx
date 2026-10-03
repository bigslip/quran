import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  ActivityIndicator,
  Share,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Copy, Share2, Bookmark, Play, X } from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, shadows } from '../../theme';
import type { Verse, AyahInsight } from '../../types/quran';
import {
  INSIGHTS_COMPONENT_CONTRACTS,
  INSIGHTS_DRAWER_TABS,
  InsightDrawerTabId,
  formatInsightAyahHeader,
  formatJuzAndPageBadge,
} from './insightsContracts';
import { AyahScripturePreviewCard } from './AyahScripturePreviewCard';
import { WordLinguisticBreakdownCard } from './WordLinguisticBreakdownCard';
import { TafsirTabContent } from './TafsirTabContent';
import { PersonalReflectionCard } from './PersonalReflectionCard';
import {
  getAyahInsight,
  getPersonalReflection,
  savePersonalReflection,
} from '../../services/db/ayahInsightsService';

export interface AyahInsightsDrawerProps {
  visible: boolean;
  verse: Verse | null;
  chapterNameFa?: string;
  onClose: () => void;
  onPlayVerse?: (verse: Verse) => void;
  onBookmarkVerse?: (verse: Verse) => void;
  onToggleBookmark?: (verse: Verse) => void;
  isBookmarked?: boolean;
  quranFont?: 'hafs' | 'indopak';
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

/**
 * AyahInsightsDrawer renders the main sanctuary sheet for deep Ayah contemplation (Figma Node 1:995).
 *
 * Features:
 * - Transparent React Native Modal with darkened backdrop dismiss (rgba(0, 0, 0, 0.65)).
 * - Sanctuary bottom sheet container with rounded corners and drag handle.
 * - RTL Header Bar with Surah & Ayah title, Juz & Page badge in Persian digits, and 5 action buttons.
 * - Sticky Scripture Preview with active word calligraphic banner and interactive word selection.
 * - Segmented 3-tab switcher (Tafsir & Tadabbur, Linguistic Vocabulary, Personal Notes).
 * - Scrollable Tab Body rendering TafsirTabContent, WordLinguisticBreakdownCard list, or PersonalReflectionCard.
 * - Fully accessible with touch targets >= 44x44px throughout.
 */
export const AyahInsightsDrawer: React.FC<AyahInsightsDrawerProps> = React.memo(
  ({
    visible,
    verse,
    chapterNameFa,
    onClose,
    onPlayVerse,
    onBookmarkVerse,
    onToggleBookmark,
    isBookmarked = false,
    quranFont = 'hafs',
    style,
    testID = 'ayah-insights-drawer',
  }) => {
    const [activeTab, setActiveTab] = useState<InsightDrawerTabId>('tafsir');
    const [isScriptureCollapsed, setIsScriptureCollapsed] = useState<boolean>(true);
    const [activeWordPosition, setActiveWordPosition] = useState<number>(1);
    const [selectedTafsirId, setSelectedTafsirId] = useState<string>('nemouneh');
    const [insight, setInsight] = useState<AyahInsight | null>(null);
    const [reflectionNote, setReflectionNote] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(true);
    const [isCopied, setIsCopied] = useState<boolean>(false);

    const handleTabChange = useCallback((tab: InsightDrawerTabId) => {
      setActiveTab(tab);
      if (tab === 'vocabulary') {
        setIsScriptureCollapsed(false);
      } else {
        setIsScriptureCollapsed(true);
      }
    }, []);

    // Load Ayah insights and personal reflection from database
    useEffect(() => {
      if (!visible || !verse) {
        return;
      }

      let isMounted = true;
      setLoading(true);
      setActiveWordPosition(1);
      setIsScriptureCollapsed(activeTab !== 'vocabulary');

      async function loadData() {
        if (!verse) return;
        try {
          const [loadedInsight, loadedReflection] = await Promise.all([
            getAyahInsight(verse.verse_key),
            getPersonalReflection(verse.verse_key),
          ]);

          if (isMounted) {
            setInsight(loadedInsight);
            setReflectionNote(loadedReflection || '');
            if (loadedInsight.tafsirs && loadedInsight.tafsirs.length > 0) {
              setSelectedTafsirId(loadedInsight.tafsirs[0].id);
            }
          }
        } catch (err) {
          console.error('Failed to load Ayah insight:', err);
        } finally {
          if (isMounted) {
            setLoading(false);
          }
        }
      }

      loadData();

      return () => {
        isMounted = false;
      };
    }, [visible, verse?.verse_key]);

    // Copy Arabic scripture + translation
    const handleCopy = useCallback(async () => {
      if (!verse) return;
      const translation = verse.translation_fa_makarem || verse.translation_fa_ansarian || '';
      const textToCopy = `${verse.text_uthmani}\n\n${translation}`.trim();

      try {
        // Best-effort Clipboard access across environments
        const RN = require('react-native');
        if (RN.Clipboard && typeof RN.Clipboard.setString === 'function') {
          RN.Clipboard.setString(textToCopy);
        }
      } catch {
        // Fallback
      }

      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }, [verse]);

    // Share Ayah text and translation
    const handleShare = useCallback(async () => {
      if (!verse) return;
      const translation = verse.translation_fa_makarem || verse.translation_fa_ansarian || '';
      const header = formatInsightAyahHeader(chapterNameFa || '', verse.verse_number);
      const textToShare = `${verse.text_uthmani}\n\n${translation}\n(${header})`.trim();

      try {
        await Share.share({ message: textToShare });
      } catch {
        // Dismissed or cancelled
      }
    }, [verse, chapterNameFa]);

    const handleToggleBookmark = onToggleBookmark || onBookmarkVerse;

    // Bookmark toggle
    const handleBookmark = useCallback(() => {
      if (verse && handleToggleBookmark) {
        handleToggleBookmark(verse);
      }
    }, [verse, handleToggleBookmark]);

    // Audio Play
    const handlePlay = useCallback(() => {
      if (verse && onPlayVerse) {
        onPlayVerse(verse);
      }
    }, [verse, onPlayVerse]);

    // Save personal reflection
    const handleSaveReflection = useCallback(
      async (note: string) => {
        if (!verse) return;
        await savePersonalReflection(verse.verse_key, note);
        setReflectionNote(note);
      },
      [verse],
    );

    if (!verse) {
      return null;
    }

    const ayahTitle = formatInsightAyahHeader(chapterNameFa || '', verse.verse_number);
    const juzBadgeText = formatJuzAndPageBadge(verse.juz_number, verse.page_number);
    const verseTranslation = verse.translation_fa_makarem || verse.translation_fa_ansarian || '';

    return (
      <Modal
        testID={testID}
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay} testID={`${testID}-overlay`}>
          {/* Darkened backdrop with touchable dismiss */}
          <TouchableWithoutFeedback
            testID={`${testID}-backdrop`}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="بستن پنجره تدبر"
          >
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Bottom sheet container */}
          <View style={[styles.sheetContainer, style]} testID={`${testID}-sheet`}>
            {/* Drag handle indicator */}
            <View style={styles.dragHandleContainer} testID={`${testID}-drag-handle-container`}>
              <View style={styles.dragHandle} testID={`${testID}-drag-handle`} />
            </View>

            {/* Header Bar (RTL) */}
            <View style={styles.headerBar} testID={`${testID}-header-bar`}>
              {/* Title & Juz/Page Badge */}
              <View style={styles.headerTitleContainer} testID={`${testID}-header-title-container`}>
                <Text style={styles.ayahTitleText} testID={`${testID}-ayah-title`}>
                  {ayahTitle}
                </Text>
                {Boolean(juzBadgeText) && (
                  <View style={styles.juzBadge} testID={`${testID}-juz-badge`}>
                    <Text style={styles.juzBadgeText}>{juzBadgeText}</Text>
                  </View>
                )}
              </View>

              {/* Header Action toolbar (5 buttons) */}
              <View style={styles.actionBar} testID={`${testID}-action-bar`}>
                {/* 1. Copy button */}
                <TouchableOpacity
                  testID={`${testID}-action-copy`}
                  onPress={handleCopy}
                  activeOpacity={0.7}
                  style={styles.actionButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="کپی متن و ترجمه آیه"
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Copy
                    size={INSIGHTS_COMPONENT_CONTRACTS.drawerActionIconSize}
                    color={isCopied ? colors.primaryLight : colors.textSecondary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                {/* 2. Share button */}
                <TouchableOpacity
                  testID={`${testID}-action-share`}
                  onPress={handleShare}
                  activeOpacity={0.7}
                  style={styles.actionButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="اشتراکگذاری آیه"
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Share2
                    size={INSIGHTS_COMPONENT_CONTRACTS.drawerActionIconSize}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                {/* 3. Bookmark button */}
                <TouchableOpacity
                  testID={`${testID}-action-bookmark`}
                  onPress={handleBookmark}
                  activeOpacity={0.7}
                  style={styles.actionButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="نشانکردن آیه"
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Bookmark
                    size={INSIGHTS_COMPONENT_CONTRACTS.drawerActionIconSize}
                    color={isBookmarked ? colors.goldAccent : colors.textSecondary}
                    fill={isBookmarked ? colors.goldAccent : 'transparent'}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                {/* 4. Play button */}
                <TouchableOpacity
                  testID={`${testID}-action-play`}
                  onPress={handlePlay}
                  activeOpacity={0.7}
                  style={styles.actionButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="پخش صوتی آیه"
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <Play
                    size={INSIGHTS_COMPONENT_CONTRACTS.drawerActionIconSize}
                    color={colors.primary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>

                {/* 5. Close button */}
                <TouchableOpacity
                  testID={`${testID}-action-close`}
                  onPress={onClose}
                  activeOpacity={0.7}
                  style={styles.actionButton}
                  accessible={true}
                  accessibilityRole="button"
                  accessibilityLabel="بستن پنجره تدبر"
                  hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
                >
                  <X
                    size={INSIGHTS_COMPONENT_CONTRACTS.drawerActionIconSize}
                    color={colors.textSecondary}
                    strokeWidth={2}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Sticky Scripture Preview */}
            <AyahScripturePreviewCard
              testID={`${testID}-scripture-preview`}
              verseKey={verse.verse_key}
              textUthmani={verse.text_uthmani}
              textIndopak={verse.text_indopak}
              translationFa={verseTranslation}
              words={insight?.words || []}
              activeWordPosition={activeWordPosition}
              onSelectWord={setActiveWordPosition}
              quranFont={quranFont}
              isCollapsed={isScriptureCollapsed}
              onToggleCollapse={() => setIsScriptureCollapsed((prev) => !prev)}
              style={styles.scripturePreview}
            />

            {/* Segmented 3-Tab Switcher */}
            <View
              style={styles.tabsContainer}
              testID={`${testID}-tabs`}
              accessibilityRole="tablist"
            >
              {INSIGHTS_DRAWER_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    testID={`${testID}-tab-${tab.id}`}
                    onPress={() => handleTabChange(tab.id)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={tab.label}
                    style={[
                      styles.tabButton,
                      isActive ? styles.tabButtonActive : styles.tabButtonInactive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.tabButtonText,
                        isActive ? styles.tabButtonTextActive : styles.tabButtonTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Tab Body (inside a ScrollView) */}
            <ScrollView
              testID={`${testID}-tab-body-scroll`}
              style={styles.scrollBody}
              contentContainerStyle={styles.scrollBodyContent}
              showsVerticalScrollIndicator={false}
            >
              {loading ? (
                <View style={styles.loadingContainer} testID={`${testID}-loading`}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>در حال بارگذاری تدبر و معارف آیه...</Text>
                </View>
              ) : (
                <>
                  {activeTab === 'tafsir' && (
                    <TafsirTabContent
                      testID={`${testID}-tafsir-content`}
                      tafsirs={insight?.tafsirs || []}
                      selectedTafsirId={selectedTafsirId}
                      onSelectTafsir={setSelectedTafsirId}
                      contemplativeTheme={insight?.contemplative_theme}
                    />
                  )}

                  {activeTab === 'vocabulary' && (
                    <View style={styles.vocabularyList} testID={`${testID}-vocabulary-list`}>
                      {(insight?.words || []).map((word) => (
                        <WordLinguisticBreakdownCard
                          key={`${verse.verse_key}-${word.position}-${word.id || ''}`}
                          testID={`${testID}-word-card-${word.position}`}
                          word={word}
                          isActive={word.position === activeWordPosition}
                          onPress={() => setActiveWordPosition(word.position)}
                          quranFont={quranFont}
                        />
                      ))}
                    </View>
                  )}

                  {activeTab === 'reflection' && (
                    <PersonalReflectionCard
                      testID={`${testID}-reflection-content`}
                      verseKey={verse.verse_key}
                      initialReflection={reflectionNote}
                      onSaveReflection={handleSaveReflection}
                    />
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  },
);

AyahInsightsDrawer.displayName = 'AyahInsightsDrawer';

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  sheetContainer: {
    backgroundColor: colors.surfaceCard,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    height: '92%',
    maxHeight: '94%', // maxHeight: '90%' expanded to 94%
    flexDirection: 'column',
    ...shadows.card,
  },
  dragHandleContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xs,
    marginVertical: spacing.xs,
  },
  dragHandle: {
    width: INSIGHTS_COMPONENT_CONTRACTS.dragHandleWidth,
    height: INSIGHTS_COMPONENT_CONTRACTS.dragHandleHeight,
    backgroundColor: colors.borderSubtle,
    borderRadius: borderRadius.pill,
  },
  headerBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSeparator,
    marginBottom: spacing.sm,
  },
  headerTitleContainer: {
    alignItems: 'flex-end',
    flexShrink: 1,
    gap: 2,
  },
  ayahTitleText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.md,
    color: colors.textPrimary,
    textAlign: 'right',
  },
  juzBadge: {
    backgroundColor: colors.surfaceCardHover,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    paddingHorizontal: 8,
    paddingVertical: 2,
    alignSelf: 'flex-end',
  },
  juzBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.goldAccent,
    textAlign: 'right',
  },
  actionBar: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 2,
  },
  actionButton: {
    minWidth: INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinWidth,
    minHeight: INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinHeight,
    width: INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinWidth,
    height: INSIGHTS_COMPONENT_CONTRACTS.headerButtonMinHeight,
    borderRadius: borderRadius.circle,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scripturePreview: {
    marginVertical: spacing.xs,
  },
  tabsContainer: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.sm,
  },
  tabButton: {
    flex: 1,
    minHeight: INSIGHTS_COMPONENT_CONTRACTS.tabButtonMinHeight,
    minWidth: INSIGHTS_COMPONENT_CONTRACTS.tabButtonMinWidth,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.xs,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
  },
  tabButtonActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.primary,
  },
  tabButtonInactive: {
    backgroundColor: colors.surfaceCardHover,
    borderColor: colors.borderSubtle,
  },
  tabButtonText: {
    fontSize: fontSizes.sm,
    textAlign: 'center',
  },
  tabButtonTextActive: {
    fontFamily: fonts.uiBold,
    color: colors.primaryLight,
  },
  tabButtonTextInactive: {
    fontFamily: fonts.uiMedium,
    color: colors.textSecondary,
  },
  scrollBody: {
    flex: 1,
  },
  scrollBodyContent: {
    paddingVertical: spacing.xs,
    paddingBottom: spacing.xxl,
  },
  loadingContainer: {
    paddingVertical: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  loadingText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  vocabularyList: {
    gap: spacing.xs,
  },
});
