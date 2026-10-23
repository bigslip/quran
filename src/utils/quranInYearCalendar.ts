import { getVerseAndChapterNumbersFromKey } from './verse';

import ayahOfTheDayData from '@/data/ayah_of_the_day.json';

// Convert array to Map for O(1) lookups instead of O(n) Array.find()
const ayahDataMap = new Map(ayahOfTheDayData.map((entry) => [entry.date, entry.verseKey]));
const dayMonthDataMap = new Map(
  ayahOfTheDayData.map((entry) => [entry.date.slice(0, 6), entry.verseKey]),
);

// Cache for today's result to avoid repeated date formatting and lookups
let cachedDate: string | null = null;
let cachedResult: { chapter: number; verse: number } | null = null;

/**
 * Get the Ayah that corresponds to the current date based on the Ayah of the Day data.
 * Uses GMT/UTC timing to ensure consistency across different timezones.
 * Looks up the current date in the ayah_of_the_day.json file.
 * Optimized with Map lookup (O(1)) and daily caching.
 *
 * @returns {object} Object containing chapter and verse number, or null if no data found
 */
const getCurrentDayAyah = (): { chapter: number; verse: number } | null => {
  // Get current date in GMT/UTC
  const now = new Date();
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Format today's date as DD/MM/YYYY to match the JSON format
  const day = String(today.getUTCDate()).padStart(2, '0');
  const month = String(today.getUTCMonth() + 1).padStart(2, '0'); // Months are 0-indexed
  const year = today.getUTCFullYear();
  const todayString = `${day}/${month}/${year}`;

  // Return cached result if we already computed it for today
  if (cachedDate === todayString && cachedResult !== null) {
    return cachedResult;
  }

  // Look up the verse key in the Map (O(1) operation), falling back to DD/MM/ prefix or day-of-year modulo
  let verseKey = ayahDataMap.get(todayString) ?? dayMonthDataMap.get(`${day}/${month}/`);

  if (!verseKey && ayahOfTheDayData.length > 0) {
    const startOfYear = Date.UTC(year, 0, 0);
    const dayOfYear = Math.floor((today.getTime() - startOfYear) / (1000 * 60 * 60 * 24));
    verseKey = ayahOfTheDayData[Math.abs(dayOfYear) % ayahOfTheDayData.length]?.verseKey;
  }

  if (!verseKey) {
    cachedDate = todayString;
    cachedResult = null;
    return null;
  }

  // Parse the verseKey (format: "chapter:verse") to get chapter and verse numbers
  const [chapterStr, verseStr] = getVerseAndChapterNumbersFromKey(verseKey);

  const result = {
    chapter: Number(chapterStr),
    verse: Number(verseStr),
  };

  // Cache the result for today
  cachedDate = todayString;
  cachedResult = result;

  return result;
};

export default getCurrentDayAyah;
