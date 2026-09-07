/**
 * Chunks a 1D array into alternating row sizes based on a repeating pattern
 * to create an interlocking honeycomb tapestry.
 *
 * @template T - The element type of the items array
 * @param {T[]} items - List of items to partition into rows
 * @param {number[]} [pattern=[4, 3]] - Array of alternating row lengths (e.g. [4, 3])
 * @returns {T[][]} Array of chunked rows
 *
 * @example
 * chunkToHoneycomb([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11], [4, 3]);
 * // Returns [[1, 2, 3, 4], [5, 6, 7], [8, 9, 10, 11]]
 */
export const chunkToHoneycomb = <T>(items: T[], pattern: number[] = [4, 3]): T[][] => {
  if (!items || items.length === 0) return [];
  if (!pattern || pattern.length === 0) return [items];

  const rows: T[][] = [];
  let currentIndex = 0;
  let patternIndex = 0;

  while (currentIndex < items.length) {
    const chunkSize = pattern[patternIndex % pattern.length];
    if (chunkSize <= 0) {
      break;
    }
    const nextIndex = Math.min(currentIndex + chunkSize, items.length);
    rows.push(items.slice(currentIndex, nextIndex));
    currentIndex = nextIndex;
    patternIndex += 1;
  }

  return rows;
};
