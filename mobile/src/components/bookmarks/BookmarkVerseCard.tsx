/* eslint-disable @typescript-eslint/naming-convention */
import React, { useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  StyleSheet,
  Share,
  StyleProp,
  ViewStyle,
  ScrollView,
} from 'react-native';
import {
  Play,
  Pause,
  BookOpen,
  Share2,
  Trash2,
  Edit3,
  Check,
  X,
  Plus,
  Quote,
  Clock,
} from 'lucide-react-native';
import {
  useThemeColors,
  type ColorTheme,
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  rtlRow,
  rtlTextAlign,
  rtlWritingDirection,
  isLatinText,
  formatRTLText,
} from '../../theme/index.ts';
import type { HydratedBookmark, Tag } from '../../types/bookmark.ts';
import { toPersianDigits } from '../catalog/catalogFormatters.ts';
import { formatAyahEndMarker } from '../reader/readerContracts.ts';
import { normalizeQuranArabic } from '../../utils/arabicTextSanitizer.ts';
import {
  BOOKMARK_COMPONENT_CONTRACTS,
  formatBookmarkChapterTitle,
  formatBookmarkAyahBadge,
  formatRelativeTimeFa,
  formatBookmarkShareText,
} from './bookmarkContracts.ts';
import { useReadingStore } from '../../stores/useReadingStore.ts';
import { useBookmarkStore } from '../../stores/useBookmarkStore.ts';
import { audioPlayerService } from '../../services/audio/audioPlayerService.ts';

export interface BookmarkVerseCardProps {
  bookmark: HydratedBookmark;
  onPressRead: (bookmark: HydratedBookmark) => void;
  onDelete: (id: string) => void;
  onUpdateNote: (verseKey: string, note: string) => void;
  onUpdateTags: (id: string, tagIds: string[]) => void;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  availableTags?: Tag[];
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

export const BookmarkVerseCard: React.FC<BookmarkVerseCardProps> = React.memo(
  ({
    bookmark,
    onPressRead,
    onDelete,
    onUpdateNote,
    onUpdateTags,
    isPlaying = false,
    onTogglePlay,
    availableTags,
    style,
    testID = 'bookmark-verse-card',
  }) => {
    const colors = useThemeColors();
    const styles = useMemo(() => createStyles(colors), [colors]);
    // Reading preferences
    const { quranFont, fontScale, activeTranslation, selectedTranslationIds, selectedReciterId } =
      useReadingStore();

    // All tags from store if availableTags prop not explicitly provided
    const storeTags = useBookmarkStore((state) => state.tags);
    const tagList = availableTags && availableTags.length > 0 ? availableTags : storeTags;

    // Local state for inline note editor and tag selector modal
    const [isEditingNote, setIsEditingNote] = useState<boolean>(false);
    const [noteInput, setNoteInput] = useState<string>(bookmark.note || '');
    const [isTagModalOpen, setIsTagModalOpen] = useState<boolean>(false);

    // Scaled Quranic typography
    const scaledQuranFontSize = Math.round(
      BOOKMARK_COMPONENT_CONTRACTS.card.arabicFontSize * (fontScale || 1.0),
    );
    const scaledQuranLineHeight = Math.round(
      BOOKMARK_COMPONENT_CONTRACTS.card.arabicLineHeight * (fontScale || 1.0),
    );
    const arabicFontFamily = quranFont === 'indopak' ? fonts.quranIndoPak : fonts.quranHafs;
    const rawArabicText =
      quranFont === 'indopak' && bookmark.text_indopak
        ? bookmark.text_indopak
        : bookmark.text_uthmani;
    const arabicText = quranFont === 'hafs' ? normalizeQuranArabic(rawArabicText) : rawArabicText;

    // Titles & badges
    const chapterTitle = formatBookmarkChapterTitle(bookmark.chapter_name_fa);
    const ayahBadgeText = formatBookmarkAyahBadge(bookmark.verse_number);
    const relativeDateText = formatRelativeTimeFa(bookmark.created_at);

    // Translations to display
    const translations = useMemo(() => {
      const list: { id: number; title: string; text: string }[] = [];

      // Check if multi-translation IDs are set
      if (selectedTranslationIds && selectedTranslationIds.length > 0) {
        if (selectedTranslationIds.includes(841) && bookmark.translation_fa_makarem) {
          list.push({ id: 841, title: 'مکارم شیرازی', text: bookmark.translation_fa_makarem });
        }
        if (selectedTranslationIds.includes(842) && bookmark.translation_fa_ansarian) {
          list.push({ id: 842, title: 'حسین انصاریان', text: bookmark.translation_fa_ansarian });
        }
        if (selectedTranslationIds.includes(131) && bookmark.translation_en_saheeh) {
          list.push({
            id: 131,
            title: 'Saheeh International',
            text: bookmark.translation_en_saheeh,
          });
        }
      }

      // Fallback to activeTranslation setting if list is still empty
      if (list.length === 0) {
        if (
          (activeTranslation === 'makarem' || activeTranslation === 'both') &&
          bookmark.translation_fa_makarem
        ) {
          list.push({ id: 841, title: 'مکارم شیرازی', text: bookmark.translation_fa_makarem });
        }
        if (
          (activeTranslation === 'ansarian' || activeTranslation === 'both') &&
          bookmark.translation_fa_ansarian
        ) {
          list.push({ id: 842, title: 'حسین انصاریان', text: bookmark.translation_fa_ansarian });
        }
      }

      // Ensure at least one translation shows if available
      if (list.length === 0) {
        if (bookmark.translation_fa_makarem) {
          list.push({ id: 841, title: 'مکارم شیرازی', text: bookmark.translation_fa_makarem });
        } else if (bookmark.translation_fa_ansarian) {
          list.push({ id: 842, title: 'حسین انصاریان', text: bookmark.translation_fa_ansarian });
        } else if (bookmark.translation_en_saheeh) {
          list.push({
            id: 131,
            title: 'Saheeh International',
            text: bookmark.translation_en_saheeh,
          });
        }
      }

      return list;
    }, [selectedTranslationIds, activeTranslation, bookmark]);

    const showTranslatorChips = translations.length > 1;

    // Audio recitation handler
    const handleTogglePlay = useCallback(() => {
      if (onTogglePlay) {
        onTogglePlay();
      } else {
        if (isPlaying) {
          audioPlayerService.stop();
        } else {
          const reciter = selectedReciterId || 201;
          audioPlayerService.playVerse(reciter, bookmark.chapter_id, bookmark.verse_number);
        }
      }
    }, [onTogglePlay, isPlaying, selectedReciterId, bookmark]);

    // Share handler
    const handleShare = useCallback(async () => {
      try {
        const primaryTrans = translations.length > 0 ? translations[0].text : '';
        const shareMessage = formatBookmarkShareText(bookmark, primaryTrans);
        await Share.share({
          message: shareMessage,
        });
      } catch (err) {
        console.warn('[BookmarkVerseCard] Share failed:', err);
      }
    }, [bookmark, translations]);

    // Note save & cancel
    const handleSaveNote = useCallback(() => {
      onUpdateNote(bookmark.verse_key, noteInput.trim());
      setIsEditingNote(false);
    }, [bookmark.verse_key, noteInput, onUpdateNote]);

    const handleCancelNote = useCallback(() => {
      setNoteInput(bookmark.note || '');
      setIsEditingNote(false);
    }, [bookmark.note]);

    // Tag toggle inside tag selector modal
    const handleToggleTag = useCallback(
      (tagId: string) => {
        const currentTagIds = (bookmark.tags || []).map((t) => t.id);
        const exists = currentTagIds.includes(tagId);
        const nextTagIds = exists
          ? currentTagIds.filter((id) => id !== tagId)
          : [...currentTagIds, tagId];
        onUpdateTags(bookmark.id, nextTagIds);
      },
      [bookmark.id, bookmark.tags, onUpdateTags],
    );

    const currentTagIdSet = useMemo(
      () => new Set((bookmark.tags || []).map((t) => t.id)),
      [bookmark.tags],
    );

    return (
      <View
        testID={testID}
        style={[
          styles.cardContainer,
          { backgroundColor: colors.surfaceCard, borderColor: colors.borderSubtle },
          isPlaying && styles.cardPlaying,
          style,
        ]}
      >
        {/* 1. Header Bar: Chapter Title, Ayah Rosette, and Relative Time */}
        <View style={styles.headerRow} testID={`${testID}-header`}>
          <View style={styles.headerInfoGroup}>
            <Text
              style={[styles.chapterTitleText, { color: colors.textPrimary }]}
              testID={`${testID}-chapter-title`}
            >
              {chapterTitle}
            </Text>
            <View
              style={[
                styles.ayahRosetteBadge,
                { backgroundColor: colors.goldGlow, borderColor: colors.goldAccent },
              ]}
              testID={`${testID}-ayah-badge`}
            >
              <Text style={[styles.ayahRosetteText, { color: colors.goldAccent }]}>
                {ayahBadgeText}
              </Text>
            </View>
          </View>

          {relativeDateText ? (
            <View style={styles.relativeDateGroup} testID={`${testID}-date`}>
              <Clock size={12} color={colors.textFaded} />
              <Text style={[styles.relativeDateText, { color: colors.textFaded }]}>
                {relativeDateText}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 2. Sacred Arabic Quranic Text */}
        <View style={styles.arabicContainer} testID={`${testID}-arabic-container`}>
          <Text
            style={[
              styles.arabicText,
              {
                color: colors.textPrimary,
                fontFamily: arabicFontFamily,
                fontSize: scaledQuranFontSize,
                lineHeight: scaledQuranLineHeight,
              },
            ]}
            testID={`${testID}-arabic-text`}
            allowFontScaling={false}
          >
            {arabicText}
            <Text
              style={[
                styles.ayahEndMarker,
                { color: colors.goldAccent, fontSize: scaledQuranFontSize },
              ]}
            >
              {formatAyahEndMarker(bookmark.verse_number)}
            </Text>
          </Text>
        </View>

        {/* 3. Persian & English Translation Section */}
        {translations.length > 0 ? (
          <View
            style={[styles.translationsContainer, { borderTopColor: colors.borderSeparator }]}
            testID={`${testID}-translations`}
          >
            {translations.map((item) => {
              const isLatin = item.id === 131 || isLatinText(item.text);
              return (
                <View key={`trans-${item.id}`} style={styles.translationBlock}>
                  {showTranslatorChips ? (
                    <View
                      style={[
                        styles.translationHeaderRow,
                        isLatin && styles.translationHeaderRowLatin,
                      ]}
                    >
                      <View
                        style={[styles.translatorChip, { backgroundColor: colors.primarySubtle }]}
                      >
                        <Text style={[styles.translatorChipText, { color: colors.primary }]}>
                          {item.title}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                  <Text
                    style={[
                      styles.translationText,
                      { color: colors.textSecondary },
                      isLatin && styles.translationTextLatin,
                    ]}
                    testID={`${testID}-translation-${item.id}`}
                  >
                    {formatRTLText(item.text)}
                  </Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {/* 4. User Personal Note Section */}
        {isEditingNote ? (
          <View
            style={[
              styles.noteEditorContainer,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderActive },
            ]}
            testID={`${testID}-note-editor`}
          >
            <TextInput
              style={[styles.noteTextInput, { color: colors.textPrimary }]}
              value={noteInput}
              onChangeText={setNoteInput}
              placeholder="یادداشت خود را اینجا بنویسید..."
              placeholderTextColor={colors.textFaded}
              multiline
              scrollEnabled={false}
              textAlign="right"
              testID={`${testID}-note-input`}
            />
            <View style={styles.noteEditorActions}>
              <TouchableOpacity
                style={[styles.noteSaveButton, { backgroundColor: colors.primary }]}
                onPress={handleSaveNote}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="ذخیره یادداشت"
                testID={`${testID}-btn-save-note`}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Check size={16} color={colors.textInverse} />
                <Text style={styles.noteSaveButtonText}>ذخیره</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.noteCancelButton, { borderColor: colors.borderSubtle }]}
                onPress={handleCancelNote}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="انصراف از ویرایش یادداشت"
                testID={`${testID}-btn-cancel-note`}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Text style={[styles.noteCancelButtonText, { color: colors.textFaded }]}>
                  انصراف
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : bookmark.note ? (
          <View
            style={[
              styles.noteContainer,
              { backgroundColor: colors.goldGlow, borderColor: colors.goldAccent },
            ]}
            testID={`${testID}-note-container`}
          >
            <View style={styles.noteHeader}>
              <View style={styles.noteLabelRow}>
                <Quote size={13} color={colors.goldAccent} />
                <Text style={[styles.noteLabelText, { color: colors.goldAccent }]}>
                  یادداشت شما
                </Text>
              </View>
              <TouchableOpacity
                style={styles.noteEditIconButton}
                onPress={() => {
                  setNoteInput(bookmark.note || '');
                  setIsEditingNote(true);
                }}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="ویرایش یادداشت"
                testID={`${testID}-btn-edit-note`}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Edit3 size={15} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text
              style={[styles.noteDisplayText, { color: colors.textPrimary }]}
              testID={`${testID}-note-text`}
            >
              {bookmark.note}
            </Text>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.addNotePromptButton}
            onPress={() => setIsEditingNote(true)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="افزودن یادداشت"
            testID={`${testID}-btn-add-note-prompt`}
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Plus size={13} color={colors.primary} />
            <Text style={[styles.addNotePromptText, { color: colors.primary }]}>
              افزودن یادداشت
            </Text>
          </TouchableOpacity>
        )}

        {/* 5. Tag Pills Row with + برچسب Button */}
        <View style={styles.tagsSection} testID={`${testID}-tags-section`}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tagsScrollViewContent}
          >
            {bookmark.tags && bookmark.tags.length > 0
              ? bookmark.tags.map((tag) => (
                  <View
                    key={`tag-${tag.id}`}
                    style={[
                      styles.tagPill,
                      {
                        borderColor: tag.color || colors.primary,
                        backgroundColor: colors.surfaceFloating,
                      },
                    ]}
                    testID={`${testID}-tag-${tag.id}`}
                  >
                    <View
                      style={[styles.tagColorDot, { backgroundColor: tag.color || colors.primary }]}
                    />
                    <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>
                      {tag.name}
                    </Text>
                  </View>
                ))
              : null}

            <TouchableOpacity
              style={[
                styles.addTagButton,
                { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
              ]}
              onPress={() => setIsTagModalOpen(true)}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="مدیریت برچسب‌های آیه"
              testID={`${testID}-btn-open-tags`}
              hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
            >
              <Plus size={13} color={colors.textSecondary} />
              <Text style={[styles.addTagButtonText, { color: colors.textSecondary }]}>برچسب</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        {/* 6. Action Bar: Play, Read in Surah, Share, Delete */}
        <View
          style={[styles.actionBar, { borderTopColor: colors.borderSeparator }]}
          testID={`${testID}-actions`}
        >
          {/* Play Recitation Button */}
          <TouchableOpacity
            style={[
              styles.actionIconButton,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
              isPlaying && [
                styles.actionIconButtonActive,
                { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
              ],
            ]}
            onPress={handleTogglePlay}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel={isPlaying ? 'توقف تلاوت آیه' : 'پخش صوتی آیه'}
            testID={`${testID}-btn-play`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            {isPlaying ? (
              <Pause
                size={BOOKMARK_COMPONENT_CONTRACTS.actionButton.iconSize}
                color={colors.primary}
              />
            ) : (
              <Play
                size={BOOKMARK_COMPONENT_CONTRACTS.actionButton.iconSize}
                color={colors.textSecondary}
              />
            )}
          </TouchableOpacity>

          {/* Read in Surah Primary Action */}
          <TouchableOpacity
            style={[
              styles.readInSurahButton,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
            ]}
            onPress={() => onPressRead(bookmark)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="مشاهده آیه در متن کامل سوره"
            testID={`${testID}-btn-read`}
          >
            <BookOpen size={16} color={colors.primary} />
            <Text style={[styles.readInSurahButtonText, { color: colors.primary }]}>
              مشاهده در سوره
            </Text>
          </TouchableOpacity>

          {/* Share Button */}
          <TouchableOpacity
            style={[
              styles.actionIconButton,
              { backgroundColor: colors.surfaceFloating, borderColor: colors.borderSubtle },
            ]}
            onPress={handleShare}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="اشتراک‌گذاری آیه و ترجمه"
            testID={`${testID}-btn-share`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Share2
              size={BOOKMARK_COMPONENT_CONTRACTS.actionButton.iconSize}
              color={colors.textSecondary}
            />
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[styles.actionIconButton, styles.deleteIconButton]}
            onPress={() => onDelete(bookmark.id)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="حذف نشانه"
            testID={`${testID}-btn-delete`}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Trash2
              size={BOOKMARK_COMPONENT_CONTRACTS.actionButton.iconSize}
              color={colors.error}
            />
          </TouchableOpacity>
        </View>

        {/* Tag Selection Modal */}
        <Modal
          visible={isTagModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsTagModalOpen(false)}
        >
          <View style={styles.modalOverlay}>
            <View
              style={[
                styles.modalCard,
                { backgroundColor: colors.backgroundElevated, borderColor: colors.borderSubtle },
              ]}
              testID={`${testID}-tag-modal`}
            >
              <View style={[styles.modalHeader, { borderBottomColor: colors.borderSeparator }]}>
                <View style={styles.modalTitleGroup}>
                  <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                    مدیریت برچسب‌ها
                  </Text>
                  <Text style={[styles.modalSubtitle, { color: colors.textSecondary }]}>
                    {chapterTitle} • {ayahBadgeText}
                  </Text>
                </View>
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setIsTagModalOpen(false)}
                  accessibilityRole="button"
                  accessibilityLabel="بستن پنجره برچسب‌ها"
                  testID={`${testID}-btn-close-tags`}
                >
                  <X size={20} color={colors.textFaded} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.tagOptionsList}>
                {tagList.map((tag) => {
                  const isSelected = currentTagIdSet.has(tag.id);
                  return (
                    <TouchableOpacity
                      key={`modal-tag-${tag.id}`}
                      style={[
                        styles.tagOptionRow,
                        { backgroundColor: colors.surfaceFloating },
                        isSelected && [
                          styles.tagOptionRowSelected,
                          { backgroundColor: colors.primarySubtle, borderColor: colors.primary },
                        ],
                      ]}
                      onPress={() => handleToggleTag(tag.id)}
                      activeOpacity={0.7}
                      accessibilityRole="checkbox"
                      accessibilityState={{ checked: isSelected }}
                      testID={`${testID}-modal-tag-${tag.id}`}
                    >
                      <View style={styles.tagOptionInfo}>
                        <View
                          style={[
                            styles.tagColorDotLarge,
                            { backgroundColor: tag.color || colors.primary },
                          ]}
                        />
                        <Text style={[styles.tagOptionName, { color: colors.textPrimary }]}>
                          {tag.name}
                        </Text>
                      </View>

                      <View style={[styles.tagCheckbox, isSelected && styles.tagCheckboxChecked]}>
                        {isSelected ? (
                          <Check size={14} color={colors.textInverse} strokeWidth={3} />
                        ) : null}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <TouchableOpacity
                style={[styles.modalDoneButton, { backgroundColor: colors.primary }]}
                onPress={() => setIsTagModalOpen(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneButtonText}>تأیید و بستن</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    );
  },
);

const createStyles = (colors: ColorTheme) =>
  StyleSheet.create({
    cardContainer: {
      borderRadius: BOOKMARK_COMPONENT_CONTRACTS.card.borderRadius,
      borderWidth: BOOKMARK_COMPONENT_CONTRACTS.card.borderWidth,
      borderColor: BOOKMARK_COMPONENT_CONTRACTS.card.borderColor,
      backgroundColor: BOOKMARK_COMPONENT_CONTRACTS.card.baseBackground,
      padding: BOOKMARK_COMPONENT_CONTRACTS.card.padding,
      marginVertical: spacing.xs,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 2,
    },
    cardPlaying: {
      borderColor: BOOKMARK_COMPONENT_CONTRACTS.card.emeraldAccent,
      shadowColor: BOOKMARK_COMPONENT_CONTRACTS.card.emeraldAccent,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.3,
      shadowRadius: 10,
      elevation: 4,
    },
    headerRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.sm,
    },
    headerInfoGroup: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.xs,
    },
    chapterTitleText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
    },
    ayahRosetteBadge: {
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
      borderRadius: borderRadius.sm,
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.3)',
    },
    ayahRosetteText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.goldAccent,
    },
    relativeDateGroup: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: 4,
    },
    relativeDateText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
    },
    arabicContainer: {
      marginVertical: spacing.sm,
    },
    arabicText: {
      textAlign: 'right',
      writingDirection: 'rtl',
      color: colors.textPrimary,
    },
    ayahEndMarker: {
      fontFamily: fonts.quranHafs,
      color: colors.goldAccent,
      marginHorizontal: 4,
    },
    translationsContainer: {
      borderTopWidth: 1,
      borderTopColor: colors.borderSeparator,
      paddingTop: spacing.sm,
      marginTop: spacing.xs,
      gap: spacing.xs,
    },
    translationBlock: {
      marginBottom: spacing.xs,
    },
    translationHeaderRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      marginBottom: 4,
    },
    translationHeaderRowLatin: {
      flexDirection: 'row',
    },
    translatorChip: {
      backgroundColor: 'rgba(16, 185, 129, 0.1)',
      borderRadius: borderRadius.sm,
      paddingHorizontal: 6,
      paddingVertical: 2,
      alignSelf: 'flex-start',
    },
    translatorChipText: {
      fontFamily: fonts.uiRegular,
      fontSize: 11,
      color: colors.textMuted,
    },
    translationText: {
      fontFamily: fonts.uiRegular,
      fontSize: BOOKMARK_COMPONENT_CONTRACTS.card.translationFontSize,
      lineHeight: BOOKMARK_COMPONENT_CONTRACTS.card.translationLineHeight,
      color: colors.textSecondary,
      textAlign: 'justify',
      writingDirection: rtlWritingDirection,
    },
    translationTextLatin: {
      textAlign: 'left',
      writingDirection: 'ltr',
    },
    noteContainer: {
      backgroundColor: 'rgba(245, 158, 11, 0.07)',
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.22)',
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
    noteHeader: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    noteLabelRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: 4,
    },
    noteLabelText: {
      fontFamily: fonts.uiMedium,
      fontSize: fontSizes.xs,
      color: colors.goldAccent,
    },
    noteEditIconButton: {
      minWidth: 32,
      minHeight: 32,
      alignItems: 'center',
      justifyContent: 'center',
    },
    noteDisplayText: {
      fontFamily: fonts.uiRegular,
      fontSize: BOOKMARK_COMPONENT_CONTRACTS.card.noteFontSize,
      lineHeight: BOOKMARK_COMPONENT_CONTRACTS.card.noteLineHeight,
      color: colors.textPrimary,
      textAlign: rtlTextAlign,
      writingDirection: 'rtl',
    },
    addNotePromptButton: {
      flexDirection: rtlRow,
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 4,
      paddingVertical: 6,
      paddingHorizontal: 8,
      marginTop: spacing.xs,
    },
    addNotePromptText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.primaryLight,
    },
    noteEditorContainer: {
      backgroundColor: colors.surfaceFloating,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.borderActive,
      padding: spacing.sm,
      marginTop: spacing.sm,
    },
    noteTextInput: {
      fontFamily: fonts.uiRegular,
      fontSize: 14,
      color: colors.textPrimary,
      minHeight: 64,
      textAlignVertical: 'top',
    },
    noteEditorActions: {
      flexDirection: rtlRow,
      justifyContent: 'flex-end',
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
    noteSaveButton: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: 4,
      backgroundColor: colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: borderRadius.sm,
    },
    noteSaveButtonText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.textInverse,
    },
    noteCancelButton: {
      paddingHorizontal: spacing.md,
      paddingVertical: 6,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
    },
    noteCancelButtonText: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textFaded,
    },
    tagsSection: {
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    tagsScrollViewContent: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.xs,
    },
    tagPill: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.pill,
      backgroundColor: 'rgba(16, 185, 129, 0.08)',
      borderWidth: 1,
    },
    tagColorDot: {
      width: 6,
      height: 6,
      borderRadius: 3,
    },
    tagPillText: {
      fontFamily: fonts.uiRegular,
      fontSize: 12,
      color: colors.textSecondary,
    },
    addTagButton: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: borderRadius.pill,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      backgroundColor: colors.surfaceFloating,
    },
    addTagButtonText: {
      fontFamily: fonts.uiRegular,
      fontSize: 12,
      color: colors.textSecondary,
    },
    actionBar: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing.sm,
      marginTop: spacing.xs,
      borderTopWidth: 1,
      borderTopColor: colors.borderSeparator,
    },
    actionIconButton: {
      width: BOOKMARK_COMPONENT_CONTRACTS.actionButton.size,
      height: BOOKMARK_COMPONENT_CONTRACTS.actionButton.size,
      minWidth: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
      minHeight: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
      borderRadius: BOOKMARK_COMPONENT_CONTRACTS.actionButton.borderRadius,
      backgroundColor: colors.surfaceFloating,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      alignItems: 'center',
      justifyContent: 'center',
    },
    actionIconButtonActive: {
      backgroundColor: colors.primarySubtle,
      borderColor: colors.primary,
    },
    deleteIconButton: {
      borderColor: 'rgba(239, 68, 68, 0.25)',
      backgroundColor: 'rgba(239, 68, 68, 0.08)',
    },
    readInSurahButton: {
      flex: 1,
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      height: BOOKMARK_COMPONENT_CONTRACTS.actionButton.size,
      minHeight: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderWidth: 1,
      borderColor: 'rgba(16, 185, 129, 0.3)',
      borderRadius: borderRadius.md,
      marginHorizontal: spacing.xs,
    },
    readInSurahButtonText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.primary,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.lg,
    },
    modalCard: {
      width: '100%',
      maxHeight: '75%',
      backgroundColor: colors.surfaceCard,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderSubtle,
      padding: spacing.md,
    },
    modalHeader: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: spacing.sm,
      borderBottomWidth: 1,
      borderBottomColor: colors.borderSeparator,
      marginBottom: spacing.sm,
    },
    modalTitleGroup: {
      flex: 1,
    },
    modalTitle: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.md,
      color: colors.textPrimary,
      textAlign: 'right',
    },
    modalSubtitle: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.xs,
      color: colors.textFaded,
      textAlign: 'right',
      marginTop: 2,
    },
    modalCloseButton: {
      width: 44,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagOptionsList: {
      maxHeight: 280,
    },
    tagOptionRow: {
      flexDirection: rtlRow,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.sm,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: 'transparent',
      marginBottom: 4,
      minHeight: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
    },
    tagOptionRowSelected: {
      backgroundColor: 'rgba(16, 185, 129, 0.12)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
    },
    tagOptionInfo: {
      flexDirection: rtlRow,
      alignItems: 'center',
      gap: spacing.sm,
    },
    tagColorDotLarge: {
      width: 12,
      height: 12,
      borderRadius: 6,
    },
    tagOptionName: {
      fontFamily: fonts.uiRegular,
      fontSize: fontSizes.sm,
      color: colors.textPrimary,
    },
    tagCheckbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.textFaded,
      alignItems: 'center',
      justifyContent: 'center',
    },
    tagCheckboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    modalDoneButton: {
      backgroundColor: colors.primary,
      borderRadius: borderRadius.md,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.md,
    },
    modalDoneButtonText: {
      fontFamily: fonts.uiBold,
      fontSize: fontSizes.sm,
      color: colors.textInverse,
    },
  });
