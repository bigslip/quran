import { toPersianDigits } from '../../components/catalog/catalogFormatters.ts';

/**
 * Dimensions, layout standards, and touch targets for Settings Tafsir Manager.
 */
export const SETTINGS_TAFSIR_CONTRACTS = {
  minTouchTarget: 44,
  actionButtonMinHeight: 44,
  actionButtonMinWidth: 44,
  cardMinHeight: 72,
  cardBorderRadius: 16,
  progressBarHeight: 6,
  sectionTitle: 'تفاسیر قرآن کریم و استفاده آفلاین',
  downloadActionLabel: 'دانلود برای استفاده آفلاین',
  deleteActionLabel: 'حذف فایل آفلاین',
  downloadedBadgeLabel: 'بارگیری‌شده',
} as const;

export type TafsirItemState = 'not_downloaded' | 'downloading' | 'downloaded';

/**
 * Formats approximate Tafsir size in megabytes using Persian numerals.
 */
export function formatTafsirSizeFa(sizeMb: number): string {
  return `${toPersianDigits(sizeMb)} مگابایت`;
}

/**
 * Formats a download progress ratio (0.0 to 1.0) as a Persian percentage string.
 */
export function formatDownloadProgressFa(progress: number): string {
  const percent = Math.min(100, Math.max(0, Math.round(progress * 100)));
  return `${toPersianDigits(percent)}٪`;
}

/**
 * Formats total storage consumed (in bytes) into an appropriate Persian representation.
 */
export function formatTotalStorageFa(totalBytes: number): string {
  if (totalBytes <= 0) {
    return '۰ مگابایت';
  }
  const megabytes = Math.round(totalBytes / (1024 * 1024));
  return `${toPersianDigits(megabytes)} مگابایت`;
}

/**
 * Determines the current download/lifecycle state for a given Tafsir slug.
 */
export function getTafsirItemState(
  slug: string,
  downloadedSlugs: string[],
  activeDownloads: Set<string>,
): TafsirItemState {
  if (activeDownloads.has(slug)) {
    return 'downloading';
  }
  if (downloadedSlugs.includes(slug)) {
    return 'downloaded';
  }
  return 'not_downloaded';
}
