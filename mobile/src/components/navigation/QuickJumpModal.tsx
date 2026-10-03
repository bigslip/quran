import React, { useState, useEffect, useMemo } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { X, Compass } from 'lucide-react-native';
import {
  useThemeColors,
  ColorTheme,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  rtlRow,
  rtlTextAlign,
  rtlWritingDirection,
} from '@/theme';
import { Chapter } from '@/types/quran';
import {
  JumpDestination,
  QuickJumpTabId,
  QuickJumpTabDefinition,
  QUICK_JUMP_TABS,
  QUICK_JUMP_MODAL_CONTRACTS,
  formatDestinationPreview,
} from '@/services/db/quickJumpContracts';
import {
  resolveAyahDestination,
  resolvePageDestination,
  resolveJuzDestination,
} from '@/services/db/quickJumpService';
import { SurahAyahJumpTab } from './SurahAyahJumpTab';
import { PageJumpTab } from './PageJumpTab';
import { JuzJumpTab } from './JuzJumpTab';

export type { QuickJumpTabId, QuickJumpTabDefinition };
export { QUICK_JUMP_TABS, QUICK_JUMP_MODAL_CONTRACTS };

export interface QuickJumpModalProps {
  visible: boolean;
  onClose: () => void;
  onJump: (destination: JumpDestination) => void;
  initialChapterId?: number;
  initialVerseNumber?: number;
  initialPageNumber?: number;
  initialTab?: QuickJumpTabId;
  surahs?: Chapter[];
  testID?: string;
}

/**
 * Universal "Go To" Quick Jump Modal for Quran.ir
 * Enables rapid jump navigation across Surah:Ayah, Page (1-604), and Juz (1-30).
 * Features keyboard avoidance, real-time Persian destination preview,
 * and context-aware synchronization across tabs.
 */
export const QuickJumpModal: React.FC<QuickJumpModalProps> = React.memo(
  ({
    visible,
    onClose,
    onJump,
    initialChapterId = 1,
    initialVerseNumber = 1,
    initialPageNumber = 1,
    initialTab = 'surah_ayah',
    surahs,
    testID = 'quick-jump-modal',
  }) => {
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [colors]);

    const [activeTab, setActiveTab] = useState<QuickJumpTabId>(initialTab);
    const [selectedChapterId, setSelectedChapterId] = useState<number>(initialChapterId);
    const [selectedVerseNumber, setSelectedVerseNumber] = useState<number>(initialVerseNumber);
    const [selectedPageNumber, setSelectedPageNumber] = useState<number>(initialPageNumber);
    const [selectedJuzNumber, setSelectedJuzNumber] = useState<number>(1);
    const [destination, setDestination] = useState<JumpDestination | null>(null);

    // Synchronize state with incoming initial props when modal opens
    useEffect(() => {
      if (visible) {
        setActiveTab(initialTab);
        setSelectedChapterId(initialChapterId);
        setSelectedVerseNumber(initialVerseNumber);
        setSelectedPageNumber(initialPageNumber);
      }
    }, [visible, initialTab, initialChapterId, initialVerseNumber, initialPageNumber]);

    // Dynamic destination resolution for Surah & Ayah Tab
    useEffect(() => {
      if (!visible || activeTab !== 'surah_ayah') return;
      let isMounted = true;

      resolveAyahDestination(selectedChapterId, selectedVerseNumber)
        .then((dest) => {
          if (isMounted) {
            setDestination(dest);
            setSelectedPageNumber(dest.pageNumber);
            setSelectedJuzNumber(dest.juzNumber);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }, [visible, activeTab, selectedChapterId, selectedVerseNumber]);

    // Dynamic destination resolution for Page Tab
    useEffect(() => {
      if (!visible || activeTab !== 'page') return;
      let isMounted = true;

      resolvePageDestination(selectedPageNumber)
        .then((dest) => {
          if (isMounted) {
            setDestination(dest);
            setSelectedChapterId(dest.chapterId);
            setSelectedVerseNumber(dest.verseNumber);
            setSelectedJuzNumber(dest.juzNumber);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }, [visible, activeTab, selectedPageNumber]);

    // Dynamic destination resolution for Juz Tab
    useEffect(() => {
      if (!visible || activeTab !== 'juz') return;
      let isMounted = true;

      resolveJuzDestination(selectedJuzNumber)
        .then((dest) => {
          if (isMounted) {
            setDestination(dest);
            setSelectedChapterId(dest.chapterId);
            setSelectedVerseNumber(dest.verseNumber);
            setSelectedPageNumber(dest.pageNumber);
          }
        })
        .catch(() => {});

      return () => {
        isMounted = false;
      };
    }, [visible, activeTab, selectedJuzNumber]);

    // Primary action button handler: jumps to destination and dismisses modal
    const handleJump = async () => {
      let target = destination;
      if (!target) {
        try {
          if (activeTab === 'surah_ayah') {
            target = await resolveAyahDestination(selectedChapterId, selectedVerseNumber);
          } else if (activeTab === 'page') {
            target = await resolvePageDestination(selectedPageNumber);
          } else {
            target = await resolveJuzDestination(selectedJuzNumber);
          }
        } catch {
          target = {
            chapterId: selectedChapterId,
            verseNumber: selectedVerseNumber,
            pageNumber: selectedPageNumber,
            juzNumber: selectedJuzNumber,
            verseKey: `${selectedChapterId}:${selectedVerseNumber}`,
            chapterNameArabic: '',
            chapterNameFa: '',
            totalVerses: 286,
          };
        }
      }

      if (target) {
        onJump(target);
        onClose();
      }
    };

    const previewString = destination
      ? formatDestinationPreview(destination)
      : 'در حال بارگذاری مقصد...';

    return (
      <Modal
        testID={testID}
        visible={visible}
        transparent={true}
        animationType="slide"
        onRequestClose={onClose}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          {/* Backdrop Dismiss Area */}
          <TouchableWithoutFeedback
            testID={`${testID}-backdrop`}
            onPress={onClose}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="بستن پنجره پرش سریع"
          >
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Bottom Sheet Card Container */}
          <View testID={`${testID}-sheet`} style={styles.sheetContainer}>
            {/* Header */}
            <View testID={`${testID}-header`} style={styles.header}>
              <Text style={styles.headerTitle}>{QUICK_JUMP_MODAL_CONTRACTS.modalTitle}</Text>
              <TouchableOpacity
                testID={`${testID}-close`}
                onPress={onClose}
                activeOpacity={0.7}
                style={styles.closeButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="بستن پرش سریع"
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color={colors.textSecondary} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            {/* Segmented 3-Tab Bar */}
            <View testID={`${testID}-tabs`} style={styles.tabsRow}>
              {QUICK_JUMP_TABS.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <TouchableOpacity
                    key={tab.id}
                    testID={`${testID}-tab-${tab.id}`}
                    onPress={() => setActiveTab(tab.id)}
                    activeOpacity={0.75}
                    style={[
                      styles.tabButton,
                      isActive ? styles.tabButtonActive : styles.tabButtonInactive,
                    ]}
                    accessible={true}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: isActive }}
                    accessibilityLabel={tab.label}
                  >
                    <Text
                      style={[
                        styles.tabText,
                        isActive ? styles.tabTextActive : styles.tabTextInactive,
                      ]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sub-Tab View Content */}
            <View testID={`${testID}-tab-content`} style={styles.tabContentWrapper}>
              {activeTab === 'surah_ayah' && (
                <SurahAyahJumpTab
                  selectedChapterId={selectedChapterId}
                  selectedVerseNumber={selectedVerseNumber}
                  onSelectSurah={(chapterId) => {
                    setSelectedChapterId(chapterId);
                  }}
                  onSelectVerse={(verseNumber) => {
                    setSelectedVerseNumber(verseNumber);
                  }}
                  surahs={surahs}
                  onConfirmJump={handleJump}
                  testID={`${testID}-surah-ayah-tab`}
                />
              )}

              {activeTab === 'page' && (
                <PageJumpTab
                  selectedPageNumber={selectedPageNumber}
                  onSelectPage={(pageNumber) => {
                    setSelectedPageNumber(pageNumber);
                  }}
                  previewText={destination ? formatDestinationPreview(destination) : undefined}
                  testID={`${testID}-page-tab`}
                />
              )}

              {activeTab === 'juz' && (
                <JuzJumpTab
                  selectedJuzNumber={selectedJuzNumber}
                  onSelectJuz={(juzNumber) => {
                    setSelectedJuzNumber(juzNumber);
                  }}
                  testID={`${testID}-juz-tab`}
                />
              )}
            </View>

            {/* Footer Area: Dynamic Destination Preview + Action Button */}
            <View testID={`${testID}-footer`} style={styles.footer}>
              {/* Real-time Persian Destination Preview Badge */}
              <View testID={`${testID}-preview-banner`} style={styles.previewBanner}>
                <Compass size={16} color={colors.goldAccent} style={styles.previewIcon} />
                <Text
                  testID={`${testID}-preview-text`}
                  style={styles.previewText}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                >
                  {previewString}
                </Text>
              </View>

              {/* Primary Action Button: مشاهده و شروع تلاوت */}
              <TouchableOpacity
                testID={`${testID}-action-button`}
                onPress={handleJump}
                activeOpacity={0.8}
                style={[styles.actionButton, !destination && styles.actionButtonDisabled]}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel={QUICK_JUMP_MODAL_CONTRACTS.actionButtonLabel}
                accessibilityHint="به این آیه یا صفحه هدایت می‌شوید"
              >
                <Compass
                  size={20}
                  color="#FFFFFF"
                  strokeWidth={2.2}
                  style={styles.actionButtonIcon}
                />
                <Text style={styles.actionButtonText}>
                  {QUICK_JUMP_MODAL_CONTRACTS.actionButtonLabel}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    );
  },
);

QuickJumpModal.displayName = 'QuickJumpModal';

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    modalOverlay: {
      flex: 1,
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
    },
    backdrop: {
      ...StyleSheet.absoluteFill,
    },
    sheetContainer: {
      backgroundColor: colors.background,
      borderColor: colors.borderSubtle,
      borderWidth: 1,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      paddingTop: spacing.md,
      paddingHorizontal: spacing.md,
      paddingBottom: Platform.OS === 'ios' ? spacing.xl : spacing.md,
      height: '82%',
      maxHeight: '90%',
      width: '100%',
      ...shadows.card,
    },
    header: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSeparator,
    },
    headerTitle: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.lg,
      color: colors.textPrimary,
      textAlign: rtlTextAlign,
      writingDirection: rtlWritingDirection,
    },
    closeButton: {
      minWidth: QUICK_JUMP_MODAL_CONTRACTS.closeButtonSize,
      minHeight: QUICK_JUMP_MODAL_CONTRACTS.closeButtonSize,
      width: QUICK_JUMP_MODAL_CONTRACTS.closeButtonSize,
      height: QUICK_JUMP_MODAL_CONTRACTS.closeButtonSize,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.circle,
      backgroundColor: colors.surfaceCardHover,
    },
    tabsRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
      marginBottom: spacing.sm,
    },
    tabButton: {
      flex: 1,
      minHeight: QUICK_JUMP_MODAL_CONTRACTS.minTouchTarget,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: borderRadius.pill,
      paddingHorizontal: spacing.xs,
      paddingVertical: spacing.xs,
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
    tabText: {
      fontSize: fontSizes.sm,
      textAlign: 'center',
    },
    tabTextActive: {
      fontFamily: fonts.uiBold,
      color: colors.primaryLight,
    },
    tabTextInactive: {
      fontFamily: fonts.uiMedium,
      color: colors.textSecondary,
    },
    tabContentWrapper: {
      flex: 1,
      width: '100%',
      overflow: 'hidden',
    },
    footer: {
      marginTop: spacing.xs,
      paddingTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.borderSeparator,
      gap: spacing.xs,
      backgroundColor: colors.background,
    },
    previewBanner: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderIridescent,
      paddingHorizontal: spacing.sm,
      paddingVertical: spacing.xs,
      minHeight: 38,
    },
    previewIcon: {
      marginEnd: spacing.xs,
    },
    previewText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.textSecondary,
      textAlign: rtlTextAlign,
    },
    actionButton: {
      minHeight: QUICK_JUMP_MODAL_CONTRACTS.buttonMinHeight,
      backgroundColor: colors.primary,
      borderRadius: borderRadius.lg,
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      shadowColor: colors.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    actionButtonDisabled: {
      opacity: 0.6,
    },
    actionButtonIcon: {
      marginEnd: spacing.sm,
    },
    actionButtonText: {
      fontFamily: fonts.primaryBold,
      fontSize: fontSizes.md,
      color: '#FFFFFF',
      textAlign: 'center',
    },
  });
