import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  FlatList,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  ChevronRight,
  ChevronDown,
  MapPin,
  Clock,
  Sparkles,
  Check,
  X,
  Search,
  Calendar,
} from 'lucide-react-native';

import {
  PRAYER_SCREEN_CONTRACTS,
  PRAYER_MILESTONES_META,
  PRAYER_MILESTONES_ORDER,
  formatSolarFullDateFa,
  formatHijriDateFa,
  getNextPrayerMilestone,
  resolveCityOrDefault,
} from '@/services/prayer/prayerScreenContracts';

export const PRAYER_STORAGE_CITY_KEY = 'quran_selected_city_id';
import {
  computeDayPrayerSchedule,
  DayPrayerSchedule,
  PrayerMilestone,
  PrayerMilestoneKey,
} from '@/services/prayer/tehranPrayerEngine';
import { IRANIAN_PROVINCIAL_CAPITALS, IranianCity } from '@/services/prayer/iranianCities';
import { syncWidgetData } from '@/services/widgets/widgetSyncService';
import { readingStorage } from '@/stores/readingStorage';
import { useThemeColors } from '@/theme/useThemeColors';
import { fonts } from '@/theme/typography';
import { spacing, borderRadius } from '@/theme/spacing';
import { formatRTLText } from '@/theme/rtl';

const MILESTONE_TEST_IDS: Record<PrayerMilestoneKey, string> = {
  imsak: 'prayer-milestone-imsak',
  fajr: 'prayer-milestone-fajr',
  sunrise: 'prayer-milestone-sunrise',
  dhuhr: 'prayer-milestone-dhuhr',
  asr: 'prayer-milestone-asr',
  sunset: 'prayer-milestone-sunset',
  maghrib: 'prayer-milestone-maghrib',
  isha: 'prayer-milestone-isha',
  midnight: 'prayer-milestone-midnight',
};

export default function DailyPrayerSanctuaryScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  const [selectedCity, setSelectedCity] = useState<IranianCity>(() => {
    try {
      const persisted = readingStorage.getItem(PRAYER_STORAGE_CITY_KEY);
      if (typeof persisted === 'string' && persisted) {
        return resolveCityOrDefault(persisted);
      }
    } catch {
      // Default fallback
    }
    return resolveCityOrDefault();
  });

  const [isCityModalVisible, setIsCityModalVisible] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState<Date>(() => new Date());

  // Load persisted city asynchronously if needed on mount
  useEffect(() => {
    const loadPersistedCity = async () => {
      try {
        const persisted = await readingStorage.getItem(PRAYER_STORAGE_CITY_KEY);
        if (typeof persisted === 'string' && persisted) {
          setSelectedCity(resolveCityOrDefault(persisted));
        }
      } catch {
        // Ignore
      }
    };
    loadPersistedCity();
  }, []);

  // Update current time every 30 seconds for real-time countdown accuracy
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  // Compute daily schedule for the selected city and current date
  const schedule: DayPrayerSchedule = useMemo(() => {
    return computeDayPrayerSchedule(
      currentTime,
      selectedCity.latitude,
      selectedCity.longitude,
      3.5,
    );
  }, [currentTime, selectedCity.latitude, selectedCity.longitude]);

  // Compute upcoming next prayer milestone and remaining countdown
  const nextInfo = useMemo(() => {
    return getNextPrayerMilestone(schedule, currentTime);
  }, [schedule, currentTime]);

  // Filtered provincial capitals for city picker modal
  const filteredCities = useMemo(() => {
    const query = citySearchQuery.trim();
    if (!query) return IRANIAN_PROVINCIAL_CAPITALS;
    return IRANIAN_PROVINCIAL_CAPITALS.filter(
      (c) => c.nameFa.includes(query) || c.nameEn.toLowerCase().includes(query.toLowerCase()),
    );
  }, [citySearchQuery]);

  // Handle city selection & widget sync
  const handleSelectCity = useCallback(async (city: IranianCity) => {
    setSelectedCity(city);
    setIsCityModalVisible(false);
    setCitySearchQuery('');

    // 1. Persist to readingStorage
    try {
      readingStorage.setItem(PRAYER_STORAGE_CITY_KEY, city.id);
    } catch {
      // Ignore
    }

    // 2. Persist to AsyncStorage if available
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const AsyncStorageMod = require('@react-native-async-storage/async-storage');
      const asyncStorage = AsyncStorageMod.default || AsyncStorageMod;
      if (asyncStorage && typeof asyncStorage.setItem === 'function') {
        await asyncStorage.setItem(PRAYER_STORAGE_CITY_KEY, city.id);
      }
    } catch {
      // Ignore
    }

    // 3. Immediately trigger background widget synchronization
    try {
      await syncWidgetData({ cityId: city.id, force: true });
    } catch {
      // Ignore
    }
  }, []);

  // Handle back navigation safely
  const handleBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/');
    }
  }, [router]);

  const solarDateFa = useMemo(() => formatSolarFullDateFa(currentTime), [currentTime]);
  const hijriDateFa = useMemo(() => formatHijriDateFa(currentTime), [currentTime]);

  return (
    <View
      testID="prayer-sanctuary-screen"
      style={[
        styles.container,
        {
          backgroundColor: colors.background,
          paddingTop: Math.max(insets.top, 12),
        },
      ]}
    >
      {/* Top Navigation Bar */}
      <View style={[styles.topBar, { borderBottomColor: colors.borderSubtle }]}>
        <TouchableOpacity
          testID="prayer-back-button"
          accessibilityRole="button"
          accessibilityLabel="بازگشت"
          onPress={handleBack}
          style={[styles.iconButton, { backgroundColor: colors.surfaceCard }]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronRight size={22} color={colors.textPrimary} />
        </TouchableOpacity>

        <Text style={[styles.screenTitle, { color: colors.textPrimary }]}>
          {formatRTLText(PRAYER_SCREEN_CONTRACTS.headerTitle)}
        </Text>

        <TouchableOpacity
          testID="prayer-city-selector"
          accessibilityRole="button"
          accessibilityLabel="انتخاب شهر"
          onPress={() => setIsCityModalVisible(true)}
          style={[
            styles.citySelectorButton,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderSubtle,
            },
          ]}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <ChevronDown size={16} color={colors.primary} />
          <Text style={[styles.citySelectorText, { color: colors.textPrimary }]}>
            {formatRTLText(selectedCity.nameFa)}
          </Text>
          <MapPin size={16} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 16 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Date & Spiritual Header Card */}
        <View
          style={[
            styles.dateCard,
            {
              backgroundColor: colors.surfaceCard,
              borderColor: colors.borderSubtle,
            },
          ]}
        >
          <View style={styles.dateRow}>
            <Calendar size={18} color={colors.primary} style={styles.dateIcon} />
            <Text style={[styles.solarDateText, { color: colors.textPrimary }]}>
              {formatRTLText(solarDateFa)}
            </Text>
          </View>
          <View style={styles.dateSeparator} />
          <Text style={[styles.hijriDateText, { color: colors.textMuted }]}>
            {formatRTLText(hijriDateFa)}
          </Text>
        </View>

        {/* Next Prayer Hero Card / Ribbon */}
        <View
          testID="prayer-countdown-card"
          style={[
            styles.countdownCard,
            {
              backgroundColor: colors.surfaceCardHover || colors.surfaceCard,
              borderColor: colors.borderActive,
            },
          ]}
        >
          <View style={styles.countdownHeaderRow}>
            <View style={[styles.countdownBadge, { backgroundColor: colors.primarySubtle }]}>
              <Sparkles size={14} color={colors.primary} />
              <Text style={[styles.countdownBadgeText, { color: colors.primary }]}>
                {formatRTLText('هنگام شرعی پیش‌رو')}
              </Text>
            </View>
            <View style={styles.prayerTitleRow}>
              <Text style={[styles.nextPrayerTitle, { color: colors.textPrimary }]}>
                {formatRTLText(nextInfo.milestone.nameFa)}
              </Text>
              <Clock size={20} color={colors.primary} style={styles.clockIcon} />
            </View>
          </View>

          <View style={styles.countdownTimeRow}>
            <Text style={[styles.nextPrayerTimeFa, { color: colors.goldAccent || colors.primary }]}>
              {nextInfo.milestone.timeFa}
            </Text>
            <Text style={[styles.countdownRemainingText, { color: colors.textSecondary }]}>
              {formatRTLText(nextInfo.countdownFa)}
            </Text>
          </View>

          {/* Visual Progress Bar */}
          <View style={[styles.progressBarContainer, { backgroundColor: colors.borderSubtle }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${Math.round(nextInfo.progressFraction * 100)}%`,
                  backgroundColor: colors.primary,
                },
              ]}
            />
          </View>
        </View>

        {/* Milestones List Header */}
        <View style={styles.sectionHeaderRow}>
          <Text style={[styles.sectionSubtitle, { color: colors.textFaded }]}>
            {formatRTLText(`مبنا: افق شرعی ${selectedCity.nameFa} (دانشگاه تهران)`)}
          </Text>
          <Text style={[styles.sectionTitle, { color: colors.textPrimary }]}>
            {formatRTLText('اوقات شرعی شبانه‌روز')}
          </Text>
        </View>

        {/* 9 Milestones Grid / List */}
        <View testID="prayer-milestone-grid" style={styles.milestonesList}>
          {PRAYER_MILESTONES_ORDER.map((key) => {
            const milestone = schedule.milestones.find((m) => m.key === key);
            const meta = PRAYER_MILESTONES_META[key];
            const isNext = nextInfo.milestone.key === key;

            if (!milestone) return null;

            return (
              <View
                key={key}
                testID={MILESTONE_TEST_IDS[key]}
                style={[
                  styles.milestoneCard,
                  {
                    backgroundColor: isNext
                      ? colors.surfaceCardHover || colors.surfaceCard
                      : colors.surfaceCard,
                    borderColor: isNext ? colors.borderActive : colors.borderSubtle,
                    borderWidth: isNext ? 1.5 : 1,
                  },
                ]}
              >
                <View style={styles.milestoneLeftCol}>
                  <Text
                    style={[
                      styles.milestoneTime,
                      {
                        color: isNext ? colors.goldAccent || colors.primary : colors.textPrimary,
                      },
                    ]}
                  >
                    {milestone.timeFa}
                  </Text>
                </View>

                <View style={styles.milestoneRightCol}>
                  <View style={styles.milestoneTitleContainer}>
                    {isNext && (
                      <View
                        style={[styles.activeIndicatorDot, { backgroundColor: colors.primary }]}
                      />
                    )}
                    <Text
                      style={[
                        styles.milestoneTitle,
                        {
                          color: isNext ? colors.primary : colors.textPrimary,
                        },
                      ]}
                    >
                      {formatRTLText(meta.titleFa)}
                    </Text>
                  </View>
                  <Text style={[styles.milestoneSubtitle, { color: colors.textFaded }]}>
                    {formatRTLText(meta.subtitleFa)}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* Iranian Provincial Capitals Selection Modal */}
      <Modal
        visible={isCityModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsCityModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalSheet,
              {
                backgroundColor:
                  colors.surfaceFloating || colors.backgroundElevated || colors.background,
                borderColor: colors.borderSubtle,
                paddingBottom: Math.max(insets.bottom, 20),
              },
            ]}
          >
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.borderSubtle }]}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="بستن"
                onPress={() => setIsCityModalVisible(false)}
                style={[styles.modalCloseButton, { backgroundColor: colors.surfaceCard }]}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <X size={20} color={colors.textPrimary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.textPrimary }]}>
                {formatRTLText(PRAYER_SCREEN_CONTRACTS.cityModalTitle)}
              </Text>
            </View>

            {/* City Search Bar */}
            <View
              style={[
                styles.searchBoxContainer,
                {
                  backgroundColor: colors.surfaceCard,
                  borderColor: colors.borderSubtle,
                },
              ]}
            >
              <Search size={18} color={colors.textFaded} style={styles.searchIcon} />
              <TextInput
                style={[styles.searchInput, { color: colors.textPrimary }]}
                placeholder={PRAYER_SCREEN_CONTRACTS.citySearchPlaceholder}
                placeholderTextColor={colors.textFaded}
                value={citySearchQuery}
                onChangeText={setCitySearchQuery}
                textAlign="right"
                autoCorrect={false}
              />
              {citySearchQuery.length > 0 && (
                <TouchableOpacity
                  onPress={() => setCitySearchQuery('')}
                  style={styles.clearSearchButton}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color={colors.textFaded} />
                </TouchableOpacity>
              )}
            </View>

            {/* Cities List */}
            <FlatList
              data={filteredCities}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.cityListContent}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item.id === selectedCity.id;
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={item.nameFa}
                    onPress={() => handleSelectCity(item)}
                    style={[
                      styles.cityListItem,
                      {
                        backgroundColor: isSelected ? colors.primarySubtle : colors.surfaceCard,
                        borderColor: isSelected ? colors.primary : colors.borderSubtle,
                      },
                    ]}
                  >
                    <View style={styles.cityItemLeft}>
                      {isSelected ? (
                        <Check size={20} color={colors.primary} />
                      ) : (
                        <Text style={[styles.cityNameEn, { color: colors.textFaded }]}>
                          {item.nameEn}
                        </Text>
                      )}
                    </View>

                    <View style={styles.cityItemRight}>
                      <Text
                        style={[
                          styles.cityNameFa,
                          {
                            color: isSelected ? colors.primary : colors.textPrimary,
                            fontFamily: isSelected ? fonts.uiBold : fonts.uiMedium,
                          },
                        ]}
                      >
                        {formatRTLText(item.nameFa)}
                      </Text>
                      <MapPin
                        size={16}
                        color={isSelected ? colors.primary : colors.textFaded}
                        style={styles.cityItemPin}
                      />
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    minHeight: 56,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  screenTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 18,
    textAlign: 'center',
  },
  citySelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.pill,
    borderWidth: 1,
    minHeight: 44,
    minWidth: 44,
    gap: 6,
  },
  citySelectorText: {
    fontFamily: fonts.uiBold,
    fontSize: 14,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
  },
  dateCard: {
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateIcon: {
    marginRight: 4,
  },
  solarDateText: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    textAlign: 'center',
  },
  dateSeparator: {
    height: 1,
    width: '60%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginVertical: 6,
  },
  hijriDateText: {
    fontFamily: fonts.uiMedium,
    fontSize: 13,
    textAlign: 'center',
  },
  countdownCard: {
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    ...Platform.select({
      ios: {
        shadowColor: '#10b981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  countdownHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  countdownBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm + 2,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: 4,
  },
  countdownBadgeText: {
    fontFamily: fonts.uiMedium,
    fontSize: 12,
  },
  prayerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  nextPrayerTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 17,
  },
  clockIcon: {
    marginLeft: 2,
  },
  countdownTimeRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  nextPrayerTimeFa: {
    fontFamily: fonts.uiBold,
    fontSize: 32,
    letterSpacing: 1,
  },
  countdownRemainingText: {
    fontFamily: fonts.uiMedium,
    fontSize: 15,
  },
  progressBarContainer: {
    height: 6,
    borderRadius: borderRadius.pill,
    overflow: 'hidden',
    width: '100%',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: borderRadius.pill,
  },
  sectionHeaderRow: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 16,
    textAlign: 'right',
  },
  sectionSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: 11,
    textAlign: 'left',
  },
  milestonesList: {
    gap: spacing.sm + 2,
  },
  milestoneCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.lg,
    minHeight: 56,
  },
  milestoneLeftCol: {
    alignItems: 'flex-start',
  },
  milestoneTime: {
    fontFamily: fonts.uiBold,
    fontSize: 18,
    letterSpacing: 0.5,
  },
  milestoneRightCol: {
    alignItems: 'flex-end',
  },
  milestoneTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  activeIndicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  milestoneTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 15,
    textAlign: 'right',
  },
  milestoneSubtitle: {
    fontFamily: fonts.uiRegular,
    fontSize: 12,
    textAlign: 'right',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontFamily: fonts.uiBold,
    fontSize: 17,
  },
  modalCloseButton: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 44,
    minHeight: 44,
  },
  searchBoxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    height: 48,
    minHeight: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: fonts.uiRegular,
    fontSize: 14,
    height: '100%',
  },
  clearSearchButton: {
    padding: spacing.xs,
    minHeight: 44,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cityListContent: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  cityListItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    minHeight: 48,
  },
  cityItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cityItemPin: {
    marginLeft: 4,
  },
  cityNameFa: {
    fontSize: 15,
  },
  cityItemLeft: {
    alignItems: 'flex-start',
  },
  cityNameEn: {
    fontFamily: fonts.uiRegular,
    fontSize: 12,
  },
});
