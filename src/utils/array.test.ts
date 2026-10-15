import { describe, it, expect } from 'vitest';
import {
  areArraysEqual,
  numbersToStringsArray,
  stringsToNumbersArray,
  removeItemFromArray,
  mergeTwoArraysUniquely,
  pickRandom,
} from './array';

describe('array utilities', () => {
  describe('areArraysEqual', () => {
    it('returns true for identical arrays in same order', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
    });

    it('returns true for identical arrays in different order', () => {
      expect(areArraysEqual([1, 2, 3], [3, 1, 2])).toBe(true);
    });

    it('returns true for identical arrays with duplicates', () => {
      expect(areArraysEqual([1, 1, 2], [1, 2, 1])).toBe(true);
      expect(areArraysEqual(['a', 'b', 'a'], ['a', 'a', 'b'])).toBe(true);
    });

    it('returns false for arrays with different frequencies of duplicates', () => {
      expect(areArraysEqual([1, 1, 2], [1, 2, 2])).toBe(false);
    });

    it('returns false for arrays with different lengths', () => {
      expect(areArraysEqual([1, 2], [1, 2, 3])).toBe(false);
    });

    it('returns false for arrays with different elements', () => {
      expect(areArraysEqual([1, 2, 3], [1, 2, 4])).toBe(false);
    });

    it('handles empty arrays', () => {
      expect(areArraysEqual([], [])).toBe(true);
    });
  });

  describe('numbersToStringsArray', () => {
    it('converts numbers to strings', () => {
      expect(numbersToStringsArray([1, 2, 3])).toEqual(['1', '2', '3']);
    });
  });

  describe('stringsToNumbersArray', () => {
    it('converts strings to numbers', () => {
      expect(stringsToNumbersArray(['1', '2', '3'])).toEqual([1, 2, 3]);
    });
  });

  describe('removeItemFromArray', () => {
    it('removes the specified item', () => {
      expect(removeItemFromArray(2, [1, 2, 3])).toEqual([1, 3]);
    });
  });

  describe('mergeTwoArraysUniquely', () => {
    it('merges arrays without duplicates', () => {
      expect(mergeTwoArraysUniquely([1, 2], [2, 3, 4])).toEqual([1, 2, 3, 4]);
    });
  });

  describe('pickRandom', () => {
    it('returns null for empty or null array', () => {
      expect(pickRandom([])).toBeNull();
      expect(pickRandom(null)).toBeNull();
      expect(pickRandom(undefined)).toBeNull();
    });

    it('picks an item from array', () => {
      const items = ['a', 'b', 'c'];
      const picked = pickRandom(items);
      expect(items).toContain(picked);
    });
  });
});
