import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  MapPin,
  RotateCw,
  HelpCircle,
  Check,
  Search,
  X,
  Clock,
  BookOpen,
  Sparkles,
  ChevronLeft,
} from 'lucide-react-native';

import {
  fonts,
  fontSizes,
  spacing,
  borderRadius,
  useThemeColors,
  formatRTLText,
  rtlTextAlign,
} from '@/theme';
import {
  IRANIAN_PROVINCIAL_CAPITALS,
  DEFAULT_CITY,
  IranianCity,
} from '@/services/prayer/iranianCities';
import {
  PRAYER_STORAGE_CITY_KEY,
  resolveCityOrDefault,
  getNextPrayerMilestone,
} from '@/services/prayer/prayerScreenContracts';
import { computeDayPrayerSchedule, toPersianDigits } from '@/services/prayer/tehranPrayerEngine';
import { readingStorage } from '@/stores/readingStorage';
import { useReadingStore } from '@/stores/useReadingStore';
import { syncWidgetData, getCachedWidgetData } from '@/services/widgets/widgetSyncService';
import type { WidgetSharedData } from '@/services/widgets/widgetContracts';

type PreviewTab = 'prayer' | 'daily-ayah' | 'last-read';

export function WidgetSettingsSection() {
  const colors = useThemeColors();
  const lastReadSurah = useReadingStore((s) => s.lastReadSurah);
  const lastReadAyah = useReadingStore((s) => s.lastReadAyah);
  const lastReadPage = useReadingStore((s) => s.lastReadPage);
  const lastReadJuz = useReadingStore((s) => s.lastReadJuz);

  const [selectedCity, setSelectedCity] = useState<IranianCity>(DEFAULT_CITY);
  const [activeTab, setActiveTab] = useState<PreviewTab>('prayer');
  const [widgetData, setWidgetData] = useState<WidgetSharedData | null>(null);
  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);

  // Initialize selected city from readingStorage
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const storedCityId = await readingStorage.getItem(PRAYER_STORAGE_CITY_KEY);
        const resolved = resolveCityOrDefault(storedCityId);
        if (isMounted) {
          setSelectedCity(resolved);
        }
      } catch {
        // Fallback to default city
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  // Synchronize widget data on load or when city changes
  const loadWidgetData = useCallback(async (city: IranianCity, force = false) => {
    try {
      const cached = getCachedWidgetData();
      if (cached && !force && cached.prayerTimes.cityNameFa === city.nameFa) {
        setWidgetData(cached);
        return;
      }
      const fresh = await syncWidgetData({
        cityId: city.id,
        force,
        coords: { lat: city.latitude, lng: city.longitude },
      });
      setWidgetData(fresh);
    } catch {
      // Graceful fallback
    }
  }, []);

  useEffect(() => {
    loadWidgetData(selectedCity);
  }, [selectedCity, loadWidgetData]);

  // Handle City Change
  const handleSelectCity = async (city: IranianCity) => {
    setSelectedCity(city);
    setIsCityModalVisible(false);
    setSearchQuery('');
    try {
      await readingStorage.setItem(PRAYER_STORAGE_CITY_KEY, city.id);
    } catch {
      // Non-fatal storage write
    }
    await loadWidgetData(city, true);
  };

  // Handle Immediate Sync
  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await loadWidgetData(selectedCity, true);
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 2500);
    } catch {
      // Non-fatal
    } finally {
      setIsSyncing(false);
    }
  };

  // Filtered Cities for Search Modal
  const filteredCities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return IRANIAN_PROVINCIAL_CAPITALS;
    return IRANIAN_PROVINCIAL_CAPITALS.filter(
      (c) =>
        c.nameFa.includes(q) ||
        c.nameEn.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Calculated schedule for prayer preview
  const todaySchedule = useMemo(() => {
    return computeDayPrayerSchedule(new Date(), selectedCity.latitude, selectedCity.longitude, 3.5);
  }, [selectedCity]);

  const nextPrayer = useMemo(() => {
    return getNextPrayerMilestone(todaySchedule, new Date());
  }, [todaySchedule]);

  const milestoneTimes = useMemo(() => {
    const map: Record<string, string> = {};
    for (const m of todaySchedule.milestones) {
      map[m.key] = m.timeFa;
    }
    return map;
  }, [todaySchedule]);

  return (
    <View testID="widget-settings-section" style={styles.sectionContainer}>
      {/* Section Header */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionHeaderTitleRow}>
          <Sparkles size={20} color={colors.primary} />
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            {formatRTLText('ویجت‌های صفحه اصلی')}
          </Text>
        </View>
        <Text style={[styles.sectionSubtitle, { color: colors.textFaded }]}>
          {formatRTLText(
            'نمایش اوقات شرعی، آیه روز و آخرین وضعیت تلاوت بر روی صفحه اصلی گوشی (iOS و Android)',
          )}
        </Text>
      </View>

      {/* City Selector Row */}
      <View
        style={[
          styles.cardBox,
          {
            backgroundColor: colors.surfaceCard,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.rowBetween}>
          <TouchableOpacity
            testID="widget-city-picker-button"
            style={[
              styles.cityPickerButton,
              {
                backgroundColor: colors.surfaceFloating,
                borderColor: colors.borderSubtle,
              },
            ]}
            onPress={() => setIsCityModalVisible(true)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`تغییر شهر محاسبات شرعی: ${selectedCity.nameFa}`}
          >
            <ChevronLeft size={16} color={colors.primary} />
            <Text style={[styles.cityNameText, { color: colors.textPrimary }]}>
              {formatRTLText(selectedCity.nameFa)}
            </Text>
            <MapPin size={16} color={colors.primary} />
          </TouchableOpacity>

          <View style={styles.cityInfoGroup}>
            <Text style={[styles.cityRowLabel, { color: colors.textPrimary }]}>
              {formatRTLText('موقعیت افق شرعی')}
            </Text>
            <Text style={[styles.cityRowSub, { color: colors.textFaded }]}>
              {formatRTLText('محاسبه دقیق با استاندارد ژئوفیزیک دانشگاه تهران')}
            </Text>
          </View>
        </View>
      </View>

      {/* Live Widget Preview Card */}
      <View
        style={[
          styles.previewOuterContainer,
          {
            backgroundColor: colors.surfaceCard,
            borderColor: colors.borderSubtle,
          },
        ]}
      >
        <View style={styles.previewHeaderRow}>
          <Text style={[styles.previewSectionTitle, { color: colors.textPrimary }]}>
            {formatRTLText('پیش‌نمایش زنده ویجت‌ها')}
          </Text>

          {/* Segmented Control */}
          <View
            style={[
              styles.segmentedTabsTrack,
              {
                backgroundColor: colors.surfaceFloating,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <TouchableOpacity
              testID="widget-preview-tab-last-read"
              onPress={() => setActiveTab('last-read')}
              style={[
                styles.segmentedTab,
                activeTab === 'last-read' && {
                  backgroundColor: colors.primary,
                },
              ]}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.segmentedTabText,
                  {
                    color: activeTab === 'last-read' ? colors.textInverse : colors.textFaded,
                  },
                ]}
              >
                {formatRTLText('ادامه تلاوت')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="widget-preview-tab-daily-ayah"
              onPress={() => setActiveTab('daily-ayah')}
              style={[
                styles.segmentedTab,
                activeTab === 'daily-ayah' && {
                  backgroundColor: colors.primary,
                },
              ]}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.segmentedTabText,
                  {
                    color: activeTab === 'daily-ayah' ? colors.textInverse : colors.textFaded,
                  },
                ]}
              >
                {formatRTLText('آیه روز')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              testID="widget-preview-tab-prayer"
              onPress={() => setActiveTab('prayer')}
              style={[
                styles.segmentedTab,
                activeTab === 'prayer' && {
                  backgroundColor: colors.primary,
                },
              ]}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="button"
            >
              <Text
                style={[
                  styles.segmentedTabText,
                  {
                    color: activeTab === 'prayer' ? colors.textInverse : colors.textFaded,
                  },
                ]}
              >
                {formatRTLText('اوقات شرعی')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* The Live Rendered Widget Preview */}
        <View
          testID="widget-preview-card"
          style={[
            styles.widgetPreviewCard,
            {
              backgroundColor: '#071811', // Dark emerald theme
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          {activeTab === 'prayer' && (
            <View style={styles.previewPrayerContent}>
              <View style={styles.previewCardTopRow}>
                <View style={styles.previewBadge}>
                  <Text style={[styles.previewBadgeText, { color: colors.goldAccent }]}>
                    {toPersianDigits(nextPrayer.milestone.timeFa)}
                  </Text>
                </View>
                <View style={styles.previewCardTitleGroup}>
                  <Text style={[styles.previewNextPrayerTitle, { color: colors.textPrimary }]}>
                    {formatRTLText(nextPrayer.milestone.nameFa)}
                  </Text>
                  <Text style={[styles.previewCountdownText, { color: colors.goldAccent }]}>
                    {formatRTLText(nextPrayer.countdownFa)}
                  </Text>
                </View>
              </View>

              <View style={styles.previewCityTagRow}>
                <Text style={[styles.previewCityTag, { color: colors.textFaded }]}>
                  {formatRTLText(`افق ${selectedCity.nameFa}`)}
                </Text>
                <Clock size={12} color={colors.textFaded} />
              </View>

              <View style={[styles.milestonesStrip, { borderColor: 'rgba(255, 255, 255, 0.08)' }]}>
                <View style={styles.milestoneMiniItem}>
                  <Text style={[styles.miniTime, { color: colors.textSecondary }]}>
                    {toPersianDigits(milestoneTimes.fajr || '')}
                  </Text>
                  <Text style={[styles.miniLabel, { color: colors.textFaded }]}>صبح</Text>
                </View>
                <View style={styles.milestoneMiniItem}>
                  <Text style={[styles.miniTime, { color: colors.textSecondary }]}>
                    {toPersianDigits(milestoneTimes.sunrise || '')}
                  </Text>
                  <Text style={[styles.miniLabel, { color: colors.textFaded }]}>طلوع</Text>
                </View>
                <View style={styles.milestoneMiniItem}>
                  <Text style={[styles.miniTime, { color: colors.textSecondary }]}>
                    {toPersianDigits(milestoneTimes.dhuhr || '')}
                  </Text>
                  <Text style={[styles.miniLabel, { color: colors.textFaded }]}>ظهر</Text>
                </View>
                <View style={styles.milestoneMiniItem}>
                  <Text style={[styles.miniTime, { color: colors.textSecondary }]}>
                    {toPersianDigits(milestoneTimes.maghrib || '')}
                  </Text>
                  <Text style={[styles.miniLabel, { color: colors.textFaded }]}>مغرب</Text>
                </View>
                <View style={styles.milestoneMiniItem}>
                  <Text style={[styles.miniTime, { color: colors.textSecondary }]}>
                    {toPersianDigits(milestoneTimes.midnight || '')}
                  </Text>
                  <Text style={[styles.miniLabel, { color: colors.textFaded }]}>نیمه‌شب</Text>
                </View>
              </View>
            </View>
          )}

          {activeTab === 'daily-ayah' && (
            <View style={styles.previewAyahContent}>
              <View style={styles.previewCardTopRow}>
                <View style={styles.previewBadge}>
                  <Text style={[styles.previewBadgeText, { color: colors.goldAccent }]}>
                    {formatRTLText('آیه امروز')}
                  </Text>
                </View>
                <Text style={[styles.previewAyahCitation, { color: colors.primary }]}>
                  {formatRTLText(
                    widgetData?.dailyAyah?.surahNameFa
                      ? `${widgetData.dailyAyah.surahNameFa} • آیه ${toPersianDigits(
                          widgetData.dailyAyah.ayahNumber,
                        )}`
                      : 'سوره بقره • آیه ۲۵۵',
                  )}
                </Text>
              </View>

              <Text
                style={[styles.previewArabicScripture, { color: colors.textPrimary }]}
                numberOfLines={2}
              >
                {widgetData?.dailyAyah?.arabicText ||
                  'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ'}
              </Text>

              <Text
                style={[styles.previewTranslationText, { color: colors.textSecondary }]}
                numberOfLines={2}
              >
                {formatRTLText(
                  widgetData?.dailyAyah?.translationFa ||
                    'خداوند هیچ معبودی جز او نیست؛ زنده و برپادارنده است؛ نه خوابی سبک او را فرو می‌گیرد و نه خوابی گران.',
                )}
              </Text>
            </View>
          )}

          {activeTab === 'last-read' && (
            <View style={styles.previewLastReadContent}>
              <View style={styles.previewCardTopRow}>
                <View style={styles.previewBadge}>
                  <BookOpen size={12} color={colors.goldAccent} />
                  <Text style={[styles.previewBadgeText, { color: colors.goldAccent }]}>
                    {formatRTLText('آخرین تلاوت')}
                  </Text>
                </View>
                <Text style={[styles.previewLastReadSurah, { color: colors.primary }]}>
                  {formatRTLText(
                    widgetData?.lastRead?.surahNameFa
                      ? `سوره ${widgetData.lastRead.surahNameFa}`
                      : 'سوره یس',
                  )}
                </Text>
              </View>

              <View style={styles.previewLastReadBody}>
                <Text style={[styles.previewLastReadMeta, { color: colors.textPrimary }]}>
                  {formatRTLText(
                    `آیه ${toPersianDigits(lastReadAyah || 1)} • صفحه ${toPersianDigits(
                      lastReadPage || 1,
                    )} • جزء ${toPersianDigits(lastReadJuz || 1)}`,
                  )}
                </Text>
                <Text style={[styles.previewLastReadPrompt, { color: colors.textFaded }]}>
                  {formatRTLText('لمس ویجت برای ورود مستقیم به آیه در قرآن')}
                </Text>
              </View>

              <View
                style={[
                  styles.previewContinuePill,
                  { backgroundColor: colors.surfaceFloating, borderColor: colors.primary },
                ]}
              >
                <ChevronLeft size={14} color={colors.primary} />
                <Text style={[styles.previewContinueText, { color: colors.primary }]}>
                  {formatRTLText('ادامه تلاوت')}
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Action Controls */}
        <View style={styles.previewActionsRow}>
          <TouchableOpacity
            testID="widget-sync-now-button"
            style={[
              styles.actionBtn,
              {
                backgroundColor: syncSuccess ? colors.primarySubtle : colors.surfaceFloating,
                borderColor: syncSuccess ? colors.primary : colors.borderSubtle,
              },
            ]}
            onPress={handleSyncNow}
            disabled={isSyncing}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="بروزرسانی داده‌های ویجت صفحه اصلی"
          >
            {isSyncing ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : syncSuccess ? (
              <>
                <Check size={16} color={colors.primary} />
                <Text style={[styles.actionBtnText, { color: colors.primary }]}>
                  {formatRTLText('همگام‌سازی شد')}
                </Text>
              </>
            ) : (
              <>
                <RotateCw size={16} color={colors.textSecondary} />
                <Text style={[styles.actionBtnText, { color: colors.textSecondary }]}>
                  {formatRTLText('بروزرسانی فوری')}
                </Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            testID="widget-guide-button"
            style={[
              styles.actionBtn,
              {
                backgroundColor: colors.surfaceFloating,
                borderColor: colors.borderSubtle,
              },
            ]}
            onPress={() => setIsGuideModalVisible(true)}
            activeOpacity={0.7}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="راهنمای افزودن ویجت به صفحه اصلی"
          >
            <HelpCircle size={16} color={colors.primary} />
            <Text style={[styles.actionBtnText, { color: colors.primary }]}>
              {formatRTLText('راهنمای نصب ویجت')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* City Picker Modal */}
      <Modal
        visible={isCityModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsCityModalVisible(false)}
                style={styles.modalCloseButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="بستن"
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {formatRTLText('انتخاب مرکز استان')}
              </Text>
            </View>

            {/* Search Input */}
            <View
              style={[
                styles.modalSearchContainer,
                {
                  backgroundColor: colors.surfaceFloating,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="جستجوی شهر..."
                placeholderTextColor={colors.textFaded}
                style={[
                  styles.modalSearchInput,
                  { color: colors.textPrimary, fontFamily: fonts.uiMedium },
                ]}
                autoCorrect={false}
              />
              <Search size={16} color={colors.textFaded} />
            </View>

            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cityListContent}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedCity.id;
                return (
                  <TouchableOpacity
                    style={[
                      styles.cityListItem,
                      {
                        backgroundColor: isSelected ? colors.primarySubtle : 'transparent',
                        borderColor: isSelected ? colors.primary : colors.borderSubtle,
                      },
                    ]}
                    onPress={() => handleSelectCity(item)}
                    activeOpacity={0.7}
                    accessible={true}
                    accessibilityRole="button"
                    accessibilityState={{ selected: isSelected }}
                    accessibilityLabel={item.nameFa}
                  >
                    {isSelected && <Check size={16} color={colors.primary} />}
                    <Text
                      style={[
                        styles.cityListItemName,
                        {
                          color: isSelected ? colors.primary : colors.textPrimary,
                          fontFamily: isSelected ? fonts.uiBold : fonts.uiMedium,
                        },
                      ]}
                    >
                      {formatRTLText(item.nameFa)}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* Guide Modal */}
      <Modal
        visible={isGuideModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsGuideModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor: colors.surfaceCard,
                borderColor: colors.borderSubtle,
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setIsGuideModalVisible(false)}
                style={styles.modalCloseButton}
                accessible={true}
                accessibilityRole="button"
                accessibilityLabel="بستن راهنما"
              >
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {formatRTLText('راهنمای افزودن ویجت')}
              </Text>
            </View>

            <View style={styles.guideBody}>
              <View
                style={[
                  styles.guideSectionBox,
                  {
                    backgroundColor: colors.surfaceFloating,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.guidePlatformTitle, { color: colors.primary }]}>
                  {formatRTLText('نصب در آیفون (iOS)')}
                </Text>
                <Text style={[styles.guideStepText, { color: colors.textSecondary }]}>
                  {formatRTLText(
                    '۱. انگشت خود را روی یک بخش خالی از صفحه اصلی نگه دارید تا آیکون‌ها بلرزند.\n۲. دکمه «+» در گوشه بالا را لمس کنید.\n۳. برنامه «Quran.ir» را پیدا کرده و اندازه ویجت مورد نظر را انتخاب و دکمه «Add Widget» را بزنید.',
                  )}
                </Text>
              </View>

              <View
                style={[
                  styles.guideSectionBox,
                  {
                    backgroundColor: colors.surfaceFloating,
                    borderColor: colors.borderSubtle,
                  },
                ]}
              >
                <Text style={[styles.guidePlatformTitle, { color: colors.primary }]}>
                  {formatRTLText('نصب در اندروید (Android)')}
                </Text>
                <Text style={[styles.guideStepText, { color: colors.textSecondary }]}>
                  {formatRTLText(
                    '۱. انگشت خود را روی فضای خالی صفحه اصلی نگه دارید.\n۲. گزینه «Widgets» یا «ابزارک‌ها» را انتخاب نمایید.\n۳. عنوان «قرآن کریم» را یافته و ویجت اوقات شرعی یا آیه روز را بکشید و در صفحه رها کنید.',
                  )}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionContainer: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  sectionHeaderRow: {
    gap: spacing.xs,
  },
  sectionHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    textAlign: rtlTextAlign,
  },
  sectionSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    textAlign: rtlTextAlign,
    lineHeight: 18,
  },
  cardBox: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
  },
  rowBetween: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 48,
  },
  cityPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 100,
    gap: spacing.xs,
  },
  cityNameText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
  },
  cityInfoGroup: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: spacing.sm,
  },
  cityRowLabel: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    textAlign: rtlTextAlign,
  },
  cityRowSub: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    textAlign: rtlTextAlign,
  },
  previewOuterContainer: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  previewHeaderRow: {
    gap: spacing.sm,
  },
  previewSectionTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    textAlign: rtlTextAlign,
  },
  segmentedTabsTrack: {
    flexDirection: 'row',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: 3,
    minHeight: 44,
  },
  segmentedTab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.sm,
    minHeight: 38,
  },
  segmentedTabText: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.xs,
  },
  widgetPreviewCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  previewPrayerContent: {
    gap: spacing.sm,
  },
  previewCardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(217, 180, 99, 0.12)',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: borderRadius.pill,
  },
  previewBadgeText: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
  },
  previewCardTitleGroup: {
    alignItems: 'flex-end',
  },
  previewNextPrayerTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.md,
    textAlign: rtlTextAlign,
  },
  previewCountdownText: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.xs,
    textAlign: rtlTextAlign,
  },
  previewCityTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  previewCityTag: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
  },
  milestonesStrip: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    paddingTop: spacing.xs,
    marginTop: spacing.xs,
  },
  milestoneMiniItem: {
    alignItems: 'center',
  },
  miniTime: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
  },
  miniLabel: {
    fontFamily: fonts.uiRegular,
    fontSize: 10,
  },
  previewAyahContent: {
    gap: spacing.xs,
  },
  previewAyahCitation: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
  },
  previewArabicScripture: {
    fontFamily: fonts.quranHafs,
    fontSize: fontSizes.md,
    lineHeight: 28,
    textAlign: 'right',
  },
  previewTranslationText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    lineHeight: 18,
    textAlign: 'right',
  },
  previewLastReadContent: {
    gap: spacing.xs,
  },
  previewLastReadSurah: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
  },
  previewLastReadBody: {
    gap: 2,
    alignItems: 'flex-end',
  },
  previewLastReadMeta: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.xs,
  },
  previewLastReadPrompt: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
  },
  previewContinuePill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
  },
  previewContinueText: {
    fontFamily: fonts.uiBold,
    fontSize: 11,
  },
  previewActionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.xs,
  },
  actionBtnText: {
    fontFamily: fonts.uiMedium,
    fontSize: fontSizes.xs,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalSheet: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },
  modalTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.md,
    textAlign: rtlTextAlign,
  },
  modalCloseButton: {
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    minHeight: 44,
  },
  modalSearchInput: {
    flex: 1,
    textAlign: 'right',
    fontSize: fontSizes.sm,
    minHeight: 44,
  },
  cityListContent: {
    gap: spacing.xs,
    paddingVertical: spacing.xs,
  },
  cityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 44,
  },
  cityListItemName: {
    fontSize: fontSizes.sm,
  },
  guideBody: {
    gap: spacing.md,
  },
  guideSectionBox: {
    borderRadius: borderRadius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.xs,
  },
  guidePlatformTitle: {
    fontFamily: fonts.uiBold,
    fontSize: fontSizes.sm,
    textAlign: rtlTextAlign,
  },
  guideStepText: {
    fontFamily: fonts.uiRegular,
    fontSize: fontSizes.xs,
    lineHeight: 22,
    textAlign: rtlTextAlign,
  },
});
