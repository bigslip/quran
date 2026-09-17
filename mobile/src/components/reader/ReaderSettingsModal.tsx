import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import {
  colors,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  shadows,
  rtlRow,
  rtlTextAlign,
  rtlWritingDirection,
} from '@/theme';
import {
  READER_COMPONENT_CONTRACTS,
  SettingsTabId,
  SETTINGS_TABS,
} from './readerContracts';
import {
  DisplayFontSection,
  ReciterSelectionSection,
  TranslationSelectionSection,
  WordByWordSection,
} from './settings';

export type { SettingsTabId };

export interface ReaderSettingsModalProps {
  visible: boolean;
  onClose: () => void;
  initialTab?: SettingsTabId;
  testID?: string;
  // Backward compatibility props for reader view & typography
  fontScale?: number;
  onChangeFontScale?: (scale: number) => void;
  viewMode?: 'continuous' | 'mushaf';
  onChangeViewMode?: (mode: 'continuous' | 'mushaf') => void;
  quranFont?: 'hafs' | 'indopak';
  onChangeQuranFont?: (font: 'hafs' | 'indopak') => void;
  activeTranslation?: 'makarem' | 'ansarian' | 'both';
  onChangeActiveTranslation?: (translation: 'makarem' | 'ansarian' | 'both') => void;
  showWordByWord?: boolean;
  onToggleWordByWord?: (show: boolean) => void;
  showTranslation?: boolean;
  onToggleShowTranslation?: (show: boolean) => void;
  // Audio reciter & translation multi-select props
  selectedReciterId?: number;
  onSelectReciter?: (id: number) => void;
  selectedTranslationIds?: number[];
  onToggleTranslation?: (id: number) => void;
}

/**
 * ReaderSettingsModal provides a comprehensive Sanctuary drawer/modal for reader preferences.
 * Hosts 4 modular settings sections under a modern tabbed bottom sheet navigation structure matching web:
 * 1. قلم و نمایش (Display & Fonts): View mode, Quran font, font scale stepper with live Arabic preview.
 * 2. قاری قرآن (Reciter Selection): Reciter list with search and style filter pills.
 * 3. ترجمه‌ها (Translations): Multi-selection translation list with language filter pills and counter badge.
 * 4. واژه به واژه (Word-by-Word): Linguistic configuration, display modes, and transliteration toggles.
 *
 * Guarantees WCAG touch targets >= 44x44px, accessibilityRole="tab", and Persian accessibility labels.
 */
export const ReaderSettingsModal: React.FC<ReaderSettingsModalProps> = React.memo(({
  visible,
  onClose,
  initialTab = 'display',
  testID = 'reader-settings-modal',
  fontScale,
  onChangeFontScale,
  viewMode,
  onChangeViewMode,
  quranFont,
  onChangeQuranFont,
  activeTranslation,
  onChangeActiveTranslation,
  showWordByWord,
  onToggleWordByWord,
  showTranslation,
  onToggleShowTranslation,
  selectedReciterId,
  onSelectReciter,
  selectedTranslationIds,
  onToggleTranslation,
}) => {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);

  // Synchronize active tab when initialTab changes or modal becomes visible
  useEffect(() => {
    if (visible && initialTab) {
      setActiveTab(initialTab);
    }
  }, [visible, initialTab]);

  const renderActiveSection = () => {
    switch (activeTab) {
      case 'display':
        return (
          <DisplayFontSection
            viewMode={viewMode}
            onChangeViewMode={onChangeViewMode}
            quranFont={quranFont}
            onChangeQuranFont={onChangeQuranFont}
            fontScale={fontScale}
            onChangeFontScale={onChangeFontScale}
            testID={`${testID}-display-section`}
          />
        );
      case 'reciter':
        return (
          <ReciterSelectionSection
            selectedReciterId={selectedReciterId}
            onSelectReciter={onSelectReciter}
            testID={`${testID}-reciter-section`}
          />
        );
      case 'translations':
        return (
          <TranslationSelectionSection
            selectedTranslationIds={selectedTranslationIds}
            onToggleTranslation={onToggleTranslation}
            testID={`${testID}-translation-section`}
          />
        );
      case 'wbw':
        return (
          <WordByWordSection
            showWordByWord={showWordByWord}
            onToggleWordByWord={onToggleWordByWord}
            testID={`${testID}-wbw-section`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      testID={testID}
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        {/* Backdrop dismissable touchable area */}
        <TouchableWithoutFeedback
          testID={`${testID}-backdrop`}
          onPress={onClose}
          accessible={true}
          accessibilityRole="button"
          accessibilityLabel="بستن پنجره تنظیمات"
        >
          <View style={styles.backdrop} />
        </TouchableWithoutFeedback>

        {/* Bottom Sheet Card Container */}
        <View testID={`${testID}-sheet`} style={styles.sheetContainer}>
          {/* Sheet Header */}
          <View testID={`${testID}-header`} style={styles.header}>
            <Text style={styles.headerTitle}>تنظیمات مطالعه قرآن</Text>
            <TouchableOpacity
              testID={`${testID}-close`}
              onPress={onClose}
              activeOpacity={0.7}
              style={styles.closeButton}
              accessible={true}
              accessibilityRole="button"
              accessibilityLabel="بستن تنظیمات"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X
                size={READER_COMPONENT_CONTRACTS.settingsModal.closeIconSize}
                color={colors.textSecondary}
                strokeWidth={2}
              />
            </TouchableOpacity>
          </View>

          {/* 4 Segmented Tab Navigation Bar */}
          <View testID={`${testID}-tabs`} style={styles.tabsRow}>
            {SETTINGS_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <TouchableOpacity
                  key={tab.id}
                  testID={`${testID}-tab-${tab.id}`}
                  onPress={() => setActiveTab(tab.id)}
                  activeOpacity={0.7}
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
                    numberOfLines={1}
                    adjustsFontSizeToFit={true}
                  >
                    {tab.label}
                  </Text>
                  {isActive && <View style={styles.activeIndicator} />}
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Dynamic Scrollable Section Content */}
          <ScrollView
            testID={`${testID}-content`}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            {renderActiveSection()}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
});

ReaderSettingsModal.displayName = 'ReaderSettingsModal';

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
    paddingTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
    ...shadows.card,
  },
  header: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSeparator,
  },
  headerTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.lg,
    fontWeight: '600',
    color: colors.textPrimary,
    textAlign: rtlTextAlign,
    writingDirection: rtlWritingDirection,
  },
  closeButton: {
    minWidth: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    minHeight: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    width: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    height: READER_COMPONENT_CONTRACTS.settingsModal.closeButtonSize,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.circle,
  },
  tabsRow: {
    flexDirection: rtlRow,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    marginTop: spacing.md,
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  tabButton: {
    flex: 1,
    minHeight: READER_COMPONENT_CONTRACTS.minTouchTarget,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.xs,
    position: 'relative',
  },
  tabButtonActive: {
    backgroundColor: colors.primarySubtle,
    borderColor: colors.borderActive,
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    textAlign: 'center',
  },
  tabTextActive: {
    color: colors.primaryLight,
    fontWeight: '700',
  },
  tabTextInactive: {
    color: colors.textSecondary,
    fontWeight: '400',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 3,
    left: spacing.sm,
    right: spacing.sm,
    height: 2,
    backgroundColor: colors.primaryLight,
    borderRadius: 1,
  },
  scrollContent: {
    paddingTop: spacing.xs,
    paddingBottom: spacing.lg,
  },
});
