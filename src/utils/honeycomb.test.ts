import { describe, it, expect } from 'vitest';

import { chunkToHoneycomb } from './honeycomb';

describe('chunkToHoneycomb', () => {
  it('chunks items into alternating pattern [4, 3] by default', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    const rows = chunkToHoneycomb(items);
    expect(rows).toEqual([
      [1, 2, 3, 4],
      [5, 6, 7],
      [8, 9, 10, 11],
    ]);
  });

  it('chunks items into custom alternating pattern [3, 2]', () => {
    const items = [1, 2, 3, 4, 5, 6, 7, 8];
    const rows = chunkToHoneycomb(items, [3, 2]);
    expect(rows).toEqual([
      [1, 2, 3],
      [4, 5],
      [6, 7, 8],
    ]);
  });

  it('chunks items into custom alternating pattern [2, 1]', () => {
    const items = ['a', 'b', 'c', 'd', 'e'];
    const rows = chunkToHoneycomb(items, [2, 1]);
    expect(rows).toEqual([['a', 'b'], ['c'], ['d', 'e']]);
  });

  it('handles empty, null, or undefined arrays gracefully', () => {
    expect(chunkToHoneycomb([])).toEqual([]);
    expect(chunkToHoneycomb(null as unknown as number[])).toEqual([]);
    expect(chunkToHoneycomb(undefined as unknown as number[])).toEqual([]);
  });

  it('handles single item arrays gracefully', () => {
    expect(chunkToHoneycomb([1])).toEqual([[1]]);
    expect(chunkToHoneycomb([1], [3, 2])).toEqual([[1]]);
  });

  it('handles partial rows gracefully when item count does not fill a chunk', () => {
    const items = [1, 2, 3, 4, 5];
    expect(chunkToHoneycomb(items, [4, 3])).toEqual([[1, 2, 3, 4], [5]]);
  });

  it('handles empty pattern gracefully', () => {
    expect(chunkToHoneycomb([1, 2, 3], [])).toEqual([[1, 2, 3]]);
  });

  it('handles single number pattern', () => {
    expect(chunkToHoneycomb([1, 2, 3, 4], [2])).toEqual([
      [1, 2],
      [3, 4],
    ]);
  });

  it('handles zero or negative pattern values gracefully without infinite loop', () => {
    expect(chunkToHoneycomb([1, 2, 3], [0])).toEqual([]);
  });
});
