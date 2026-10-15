/**
 * Convert an array of numbers to an array of strings.
 *
 * @param {number[]} numbersArray
 * @returns {string[]}
 */
export const numbersToStringsArray = (numbersArray: number[]): string[] =>
  numbersArray.map((number) => String(number));

/**
 * Convert an array of strings to an array of numbers.
 *
 * @param {string[]} stringsArray
 * @returns {number[]}
 */
export const stringsToNumbersArray = (stringsArray: string[]): number[] =>
  stringsArray.map((string) => Number(string));

/**
 * Check whether 2 arrays are equal or not irrespective of
 * their order. We need to create a copy of both arrays first
 * since sort() overwrites the original array.
 *
 * @param {T[]} array1
 * @param {T[]} array2
 * @returns {boolean}
 */
export const areArraysEqual = <T>(array1: T[], array2: T[]): boolean => {
  if (array1?.length !== array2?.length) return false;
  if (!array1 && !array2) return true;
  if (!array1 || !array2) return false;

  const counts = new Map<T, number>();
  for (const item of array1) {
    counts.set(item, (counts.get(item) || 0) + 1);
  }

  for (const item of array2) {
    const count = counts.get(item);
    if (!count) return false;
    if (count === 1) {
      counts.delete(item);
    } else {
      counts.set(item, count - 1);
    }
  }

  return counts.size === 0;
};

/**
 * Remove `itemToRemove` from `array`
 *
 * @example
 * removeItemFromArray(1, [1,2,3]) // returns [2,3]
 *
 * @param {T} itemToRemove
 * @param {T[]} array
 * @returns {boolean}j
 */
export const removeItemFromArray = <T>(itemToRemove: T, array: T[]): T[] =>
  array.filter((item) => item !== itemToRemove);

/**
 * Merge items of two arrays where each item is unique.
 *
 * @param {T[]} array1
 * @param {T[]} array2
 * @returns {T[]}
 */
export const mergeTwoArraysUniquely = <T>(array1: T[], array2: T[]): T[] => {
  return Array.from(new Set(array1.concat(array2)));
};

/**
 * Pick a random item from an array.
 *
 * @param {T[] | null | undefined} array Optional array that can be null or undefined
 * @returns {T | null} Random item from array or null if array is null/undefined or empty
 */
export const pickRandom = <T>(array?: T[] | null): T | null => {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
};
