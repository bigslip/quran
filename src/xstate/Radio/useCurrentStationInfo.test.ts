import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import useCurrentStationInfo from './useCurrentStationInfo';
import { StationType } from '@/components/Radio/types';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => key,
    lang: 'en',
  }),
}));

vi.mock('swr/immutable', () => ({
  default: () => ({ data: null }),
}));

describe('useCurrentStationInfo', () => {
  it('returns empty title and description when curated station id is undefined', () => {
    const context = {
      type: StationType.Curated,
      id: undefined as any,
    };

    const { result } = renderHook(() => useCurrentStationInfo(context as any));
    expect(result.current).toEqual({
      title: '',
      description: '',
    });
  });

  it('returns localized title and description when curated station id is valid', () => {
    const context = {
      type: StationType.Curated,
      id: '1',
    };

    const { result } = renderHook(() => useCurrentStationInfo(context as any));
    expect(result.current.title).toBe('curated-station.popular-recitations.title');
    expect(result.current.description).toBe('curated-station.popular-recitations.description');
  });
});
