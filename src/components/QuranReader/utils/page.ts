import LookupRecord from 'types/LookupRecord';

/**
 * Get the page number by adding the first page number of the current
 * resource e.g. chapter to the item (page) index from the virtualized list.
 *
 * @param {number} pageIndex
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @param {number} [fallbackFirstPage=1]
 * @returns {number}
 */
export const getPageNumberByPageIndex = (
  pageIndex: number,
  pagesVersesRange: Record<number, LookupRecord>,
  fallbackFirstPage = 1,
): number => {
  const keys = Object.keys(pagesVersesRange || {});
  const firstKey = keys.length > 0 ? Number(keys[0]) : fallbackFirstPage;
  const basePage = Number.isNaN(firstKey) ? fallbackFirstPage : firstKey;
  return basePage + pageIndex;
};

/**
 * Get the page index by the page number.
 *
 * @param {number} pageNumber
 * @param {Record<number, LookupRecord>} pagesVersesRange
 * @param {number} [fallbackFirstPage=1]
 * @returns {number}
 */
export const getPageIndexByPageNumber = (
  pageNumber: number,
  pagesVersesRange: Record<number, LookupRecord>,
  fallbackFirstPage = 1,
): number => {
  const keys = Object.keys(pagesVersesRange || {});
  const firstKey = keys.length > 0 ? Number(keys[0]) : fallbackFirstPage;
  const basePage = Number.isNaN(firstKey) ? fallbackFirstPage : firstKey;
  return Number(pageNumber) - basePage;
};

/**
 * Get the number of pages of the current resource e.g. chapter.
 *
 * @param {number} numberOfVerses
 * @param {number} versesPerPage
 * @returns {number}
 */
export const getNumberOfPages = (numberOfVerses: number, versesPerPage: number): number =>
  Math.ceil(numberOfVerses / versesPerPage);

/**
 * Convert a verse index to a page number by dividing the index
 * by how many items there are in a page.
 *
 * @param {number} verseNumber
 * @param {number} versesPerPage
 * @returns {number}
 */
export const verseIndexToApiPageNumber = (verseNumber: number, versesPerPage: number): number =>
  Math.floor(verseNumber / versesPerPage) + 1;
