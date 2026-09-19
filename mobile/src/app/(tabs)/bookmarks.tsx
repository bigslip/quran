import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import {
  Bookmark,
  Search,
  X,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  Check,
  SearchX,
} from 'lucide-react-native';
import { colors, fonts, fontSizes, spacing, borderRadius, rtlRow, rtlTextAlign } from '@/theme';
import { AmbientGlow } from '@/components/common/AmbientGlow';
import { BookmarkVerseCard } from '@/components/bookmarks/BookmarkVerseCard';
import {
  BOOKMARK_COMPONENT_CONTRACTS,
  SORT_OPTIONS,
  calculateTagCounts,
  SortOptionItem,
} from '@/components/bookmarks/bookmarkContracts';
import { useBookmarkStore, selectFilteredBookmarks } from '@/stores/useBookmarkStore';
import { useReadingStore } from '@/stores/useReadingStore';
import { audioPlayerService } from '@/services/audio/audioPlayerService';
import { toPersianDigits } from '@/components/catalog/catalogFormatters';
import type { HydratedBookmark } from '@/types/bookmark';

export default function BookmarksScreen() {
  const router = useRouter();

  // Bookmark store state & actions
  const {
    bookmarks,
    tags,
    selectedTagId,
    searchQuery,
    sortBy,
    recentlyDeleted,
    loadBookmarks,
    setSelectedTagId,
    setSearchQuery,
    setSortBy,
    deleteBookmark,
    undoDelete,
    clearUndo,
    updateNote,
    setTagsForBookmark,
  } = useBookmarkStore();

  const selectedReciterId = useReadingStore((state) => state.selectedReciterId);

  // Local state
  const [isSortModalOpen, setIsSortModalOpen] = useState(false);
  const [playingVerseKey, setPlayingVerseKey] = useState<string | null>(null);

  // Load bookmarks on mount
  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  // Refresh bookmarks on tab focus and stop audio when losing tab focus
  useFocusEffect(
    useCallback(() => {
      loadBookmarks();
      return () => {
        audioPlayerService.stop();
        setPlayingVerseKey(null);
      };
    }, [loadBookmarks]),
  );

  // Stop audio recitation on screen unmount
  useEffect(() => {
    return () => {
      audioPlayerService.stop();
      setPlayingVerseKey(null);
    };
  }, []);

  // Filtered bookmarks derived from store selector
  const filteredBookmarks = useMemo(
    () => selectFilteredBookmarks({ bookmarks, selectedTagId, searchQuery }),
    [bookmarks, selectedTagId, searchQuery],
  );

  // Live tag counts map
  const tagCountMap = useMemo(() => calculateTagCounts(tags, bookmarks), [tags, bookmarks]);

  // 4-second auto-dismiss for undo snackbar
  useEffect(() => {
    if (recentlyDeleted) {
      const timer = setTimeout(() => {
        clearUndo();
      }, BOOKMARK_COMPONENT_CONTRACTS.undoSnackbar.autoDismissMs);
      return () => clearTimeout(timer);
    }
  }, [recentlyDeleted, clearUndo]);

  // Audio Playback toggle handler
  const handleTogglePlay = useCallback(
    (item: HydratedBookmark) => {
      if (playingVerseKey === item.verse_key) {
        audioPlayerService.stop();
        setPlayingVerseKey(null);
      } else {
        audioPlayerService.stop();
        setPlayingVerseKey(item.verse_key);
        const reciterId = selectedReciterId || 201;
        audioPlayerService.playVerse(
          reciterId,
          item.chapter_id,
          item.verse_number,
          () => setPlayingVerseKey(null),
          () => setPlayingVerseKey(null),
        );
      }
    },
    [playingVerseKey, selectedReciterId],
  );

  // Deep-link to reader
  const handlePressRead = useCallback(
    (item: HydratedBookmark) => {
      audioPlayerService.stop();
      setPlayingVerseKey(null);
      router.push(`/surah/${item.chapter_id}?verse=${item.verse_number}` as any);
    },
    [router],
  );

  // Render individual bookmark card
  const renderItem = useCallback(
    ({ item }: { item: HydratedBookmark }) => (
      <BookmarkVerseCard
        bookmark={item}
        onPressRead={handlePressRead}
        onDelete={deleteBookmark}
        onUpdateNote={updateNote}
        onUpdateTags={setTagsForBookmark}
        isPlaying={playingVerseKey === item.verse_key}
        onTogglePlay={() => handleTogglePlay(item)}
        availableTags={tags}
      />
    ),
    [
      handlePressRead,
      deleteBookmark,
      updateNote,
      setTagsForBookmark,
      playingVerseKey,
      handleTogglePlay,
      tags,
    ],
  );

  const currentSortLabel = SORT_OPTIONS.find((opt) => opt.id === sortBy)?.label || 'جدیدترین';

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      testID="bookmarks-screen"
    >
      <AmbientGlow height={220} />

      {/* Top Header: Title, Count Badge, Sort Button */}
      <View style={styles.header}>
        <View style={styles.titleGroup}>
          <Text style={styles.title}>نشانه‌ها و یادداشت‌ها</Text>
          <View style={styles.countBadge} testID="bookmarks-count-badge">
            <Text style={styles.countBadgeText}>
              {toPersianDigits(filteredBookmarks.length)} آیه
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.sortButton}
          onPress={() => setIsSortModalOpen(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={`مرتب‌سازی: ${currentSortLabel}`}
          testID="btn-open-sort-modal"
        >
          <SlidersHorizontal size={18} color={colors.primaryLight} />
          <Text style={styles.sortButtonText}>{currentSortLabel}</Text>
        </TouchableOpacity>
      </View>

      {/* Search Input Bar */}
      <View style={styles.searchBarContainer}>
        <View style={styles.searchBar}>
          <Search size={18} color={colors.textFaded} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="جستجو در متن آیات، ترجمه و یادداشت‌ها..."
            placeholderTextColor={colors.textFaded}
            textAlign="right"
            testID="bookmarks-search-input"
          />
          {searchQuery ? (
            <TouchableOpacity
              style={styles.clearSearchButton}
              onPress={() => setSearchQuery('')}
              accessibilityRole="button"
              accessibilityLabel="پاک کردن جستجو"
              testID="btn-clear-search"
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <X size={16} color={colors.textFaded} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Horizontal Tag Filter Chips Bar */}
      <View style={styles.tagFilterBar}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagFilterContent}
        >
          {/* 'All' (همه) Chip */}
          <TouchableOpacity
            style={[styles.tagFilterChip, selectedTagId === null && styles.tagFilterChipActive]}
            onPress={() => setSelectedTagId(null)}
            activeOpacity={0.7}
            accessibilityRole="button"
            accessibilityLabel="نمایش همه نشانه‌ها"
            testID="tag-filter-all"
            hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
          >
            <Text
              style={[
                styles.tagFilterChipText,
                selectedTagId === null && styles.tagFilterChipTextActive,
              ]}
            >
              همه ({toPersianDigits(bookmarks.length)})
            </Text>
          </TouchableOpacity>

          {/* Individual Tag Chips */}
          {tags.map((tag) => {
            const isActive = selectedTagId === tag.id;
            const count = tagCountMap.get(tag.id) || 0;
            return (
              <TouchableOpacity
                key={`filter-tag-${tag.id}`}
                style={[styles.tagFilterChip, isActive && styles.tagFilterChipActive]}
                onPress={() => setSelectedTagId(isActive ? null : tag.id)}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel={`فیلتر بر اساس برچسب ${tag.name}`}
                testID={`tag-filter-${tag.id}`}
                hitSlop={{ top: 8, bottom: 8, left: 6, right: 6 }}
              >
                <View
                  style={[styles.tagColorDot, { backgroundColor: tag.color || colors.primary }]}
                />
                <Text
                  style={[styles.tagFilterChipText, isActive && styles.tagFilterChipTextActive]}
                >
                  {tag.name} ({toPersianDigits(count)})
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Bookmarks List or Empty State */}
      {filteredBookmarks.length > 0 ? (
        <FlatList
          data={filteredBookmarks}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={[
            styles.listContent,
            recentlyDeleted ? styles.listContentWithSnackbar : null,
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          testID="bookmarks-list"
        />
      ) : bookmarks.length === 0 ? (
        // Global Empty State: No bookmarks at all
        <View style={styles.emptyContainer} testID="bookmarks-empty-global">
          <View style={styles.emptyIconHalo}>
            <Bookmark size={44} color={colors.goldAccent} />
          </View>
          <Text style={styles.emptyTitle}>هنوز نشانه‌ای ذخیره نکرده‌اید</Text>
          <Text style={styles.emptyDesc}>
            در حین تلاوت قرآن، با لمس آیکون نشانه می‌توانید آیات دلخواه خود را برای مطالعه، تدبر و
            دسترسی سریع ذخیره کنید.
          </Text>
          <TouchableOpacity
            style={styles.emptyPrimaryButton}
            onPress={() => router.push('/(tabs)/surahs' as any)}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="مشاهده فهرست سوره‌ها"
            testID="btn-explore-surahs"
          >
            <BookOpen size={18} color="#041410" />
            <Text style={styles.emptyPrimaryButtonText}>مشاهده سوره‌ها</Text>
          </TouchableOpacity>
        </View>
      ) : (
        // Filter Empty State: Query or Tag returned 0 matches
        <View style={styles.emptyContainer} testID="bookmarks-empty-filtered">
          <View style={styles.emptyIconHaloFaded}>
            <SearchX size={44} color={colors.textFaded} />
          </View>
          <Text style={styles.emptyTitle}>موردی یافت نشد</Text>
          <Text style={styles.emptyDesc}>
            هیچ نشانه‌ای با فیلتر برچسب یا عبارت جستجوی فعلی مطابقت ندارد.
          </Text>
          <TouchableOpacity
            style={styles.emptySecondaryButton}
            onPress={() => {
              setSearchQuery('');
              setSelectedTagId(null);
            }}
            activeOpacity={0.8}
            accessibilityRole="button"
            accessibilityLabel="پاک کردن فیلترها و جستجو"
            testID="btn-reset-filters"
          >
            <Text style={styles.emptySecondaryButtonText}>پاک کردن فیلترها</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Undo Snackbar */}
      {recentlyDeleted ? (
        <View style={styles.snackbarContainer} testID="bookmarks-undo-snackbar">
          <View style={styles.snackbarContent}>
            <Text style={styles.snackbarText}>آیه از نشانه‌ها حذف شد</Text>
            <TouchableOpacity
              style={styles.snackbarUndoButton}
              onPress={undoDelete}
              activeOpacity={0.7}
              accessibilityRole="button"
              accessibilityLabel="بازگردانی آیه حذف شده"
              testID="btn-undo-delete"
            >
              <RotateCcw size={15} color={colors.primary} />
              <Text style={styles.snackbarUndoText}>بازگردانی</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {/* Sort Selector Modal */}
      <Modal
        visible={isSortModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsSortModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard} testID="sort-selector-modal">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>مرتب‌سازی نشانه‌ها</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setIsSortModalOpen(false)}
                accessibilityRole="button"
                accessibilityLabel="بستن پنجره مرتب‌سازی"
                testID="btn-close-sort-modal"
              >
                <X size={20} color={colors.textFaded} />
              </TouchableOpacity>
            </View>

            <View style={styles.sortOptionsContainer}>
              {SORT_OPTIONS.map((option: SortOptionItem) => {
                const isSelected = sortBy === option.id;
                return (
                  <TouchableOpacity
                    key={`sort-opt-${option.id}`}
                    style={[styles.sortOptionRow, isSelected && styles.sortOptionRowActive]}
                    onPress={async () => {
                      await setSortBy(option.id);
                      setIsSortModalOpen(false);
                    }}
                    activeOpacity={0.7}
                    accessibilityRole="radio"
                    accessibilityState={{ selected: isSelected }}
                    testID={`sort-option-${option.id}`}
                  >
                    <Text
                      style={[styles.sortOptionLabel, isSelected && styles.sortOptionLabelActive]}
                    >
                      {option.label}
                    </Text>
                    {isSelected ? (
                      <Check size={18} color={colors.primary} strokeWidth={2.5} />
                    ) : null}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 54,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  titleGroup: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.sm,
  },
  title: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xl,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  countBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.pill,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.25)',
  },
  countBadgeText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primary,
  },
  sortButton: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
  },
  sortButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '600',
    color: colors.primaryLight,
  },
  searchBarContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xs,
  },
  searchBar: {
    flexDirection: rtlRow,
    alignItems: 'center',
    backgroundColor: colors.surfaceFloating,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    paddingHorizontal: spacing.sm,
    height: 44,
  },
  searchIcon: {
    marginHorizontal: 4,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearchButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tagFilterBar: {
    paddingVertical: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagFilterContent: {
    flexDirection: rtlRow,
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  tagFilterChip: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: borderRadius.pill,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    minHeight: 34,
  },
  tagFilterChipActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.16)',
    borderColor: colors.primary,
  },
  tagFilterChipText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    color: colors.textFaded,
  },
  tagFilterChipTextActive: {
    color: colors.primary,
    fontWeight: '700',
  },
  tagColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.mega,
  },
  listContentWithSnackbar: {
    paddingBottom: spacing.mega + 60,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.mega,
    gap: spacing.sm,
  },
  emptyIconHalo: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderWidth: 1.5,
    borderColor: 'rgba(245, 158, 11, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyIconHaloFaded: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(148, 163, 184, 0.08)',
    borderWidth: 1.5,
    borderColor: 'rgba(148, 163, 184, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  emptyDesc: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textFaded,
    textAlign: 'center',
    lineHeight: 24,
  },
  emptyPrimaryButton: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: 12,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    minHeight: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
  },
  emptyPrimaryButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '700',
    color: '#041410',
  },
  emptySecondaryButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: 10,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
    backgroundColor: colors.surfaceFloating,
    marginTop: spacing.md,
    minHeight: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptySecondaryButtonText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  snackbarContainer: {
    position: 'absolute',
    bottom: 20,
    left: spacing.md,
    right: spacing.md,
    zIndex: 99,
  },
  snackbarContent: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#062019',
    borderRadius: BOOKMARK_COMPONENT_CONTRACTS.undoSnackbar.borderRadius,
    borderWidth: 1,
    borderColor: colors.borderActive,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: BOOKMARK_COMPONENT_CONTRACTS.undoSnackbar.minHeight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  snackbarText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  snackbarUndoButton: {
    flexDirection: rtlRow,
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
  },
  snackbarUndoText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    fontWeight: '700',
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
    backgroundColor: '#062019',
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
  modalTitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.md,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: rtlTextAlign,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sortOptionsContainer: {
    gap: spacing.xs,
  },
  sortOptionRow: {
    flexDirection: rtlRow,
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceFloating,
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: BOOKMARK_COMPONENT_CONTRACTS.minTouchTarget,
  },
  sortOptionRowActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.14)',
    borderColor: colors.primary,
  },
  sortOptionLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.sm,
    color: colors.textPrimary,
  },
  sortOptionLabelActive: {
    color: colors.primary,
    fontWeight: '700',
  },
});
