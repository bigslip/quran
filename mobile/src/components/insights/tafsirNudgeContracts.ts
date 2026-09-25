/**
 * Contracts and layout parameters for the Tafsir frequent-user offline nudge banner.
 *
 * Designed to strictly adhere to touch target guidelines (>= 44x44pt)
 * and provide clean Persian localization.
 */
export const TAFSIR_NUDGE_BANNER_CONTRACTS = {
  minTouchTarget: 44,
  ctaButtonMinHeight: 44,
  ctaButtonMinWidth: 88,
  dismissButtonMinHeight: 44,
  dismissButtonMinWidth: 44,
  cardBorderRadius: 16,
  triggerThreshold: 5,
  bannerTitle: 'مطالعه آفلاین تفاسیر قرآن',
  bannerDescription:
    'با دانلود تفاسیر نمونه و نور، در هر زمان و بدون نیاز به اینترنت به معارف آیات دسترسی داشته باشید.',
  ctaButtonLabel: 'دانلود تفاسیر',
  dismissButtonLabel: 'بستن پیام پیشنهاد دانلود تفاسیر',
  settingsRoute: '/(tabs)/settings',
} as const;

export interface ShouldShowNudgeBannerParams {
  tafsirOpenCount: number;
  isTafsirNudgeDismissed: boolean;
  isAllTafsirDownloaded: boolean;
}

/**
 * Pure decision function to determine if the frequent-user offline Tafsir banner
 * should be rendered.
 *
 * Rules:
 * 1. tafsirOpenCount >= triggerThreshold (default 5)
 * 2. User has NOT dismissed the nudge (isTafsirNudgeDismissed === false)
 * 3. Not all downloadable authentic Persian Tafsirs are downloaded yet (isAllTafsirDownloaded === false)
 */
export function shouldShowTafsirNudgeBanner(params: ShouldShowNudgeBannerParams): boolean {
  const { tafsirOpenCount, isTafsirNudgeDismissed, isAllTafsirDownloaded } = params;
  if (isTafsirNudgeDismissed) return false;
  if (isAllTafsirDownloaded) return false;
  return (tafsirOpenCount ?? 0) >= TAFSIR_NUDGE_BANNER_CONTRACTS.triggerThreshold;
}
