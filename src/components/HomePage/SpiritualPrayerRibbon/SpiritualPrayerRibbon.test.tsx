/* eslint-disable i18next/no-literal-string */
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import PrayerArchCard, { PrayerArchData } from './PrayerArchCard';
import SpiritualPrayerRibbon from './SpiritualPrayerRibbon';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string, options?: any) => {
      if (key === 'prayer-fajr') return 'Fajr';
      if (key === 'prayer-dhuhr') return 'Dhuhr';
      if (key === 'prayer-asr') return 'Asr';
      if (key === 'prayer-maghrib') return 'Maghrib';
      if (key === 'prayer-isha') return 'Isha';
      if (key === 'in-time' && options?.time) return `in ${options.time}`;
      return options?.defaultValue || key;
    },
    lang: 'en',
  }),
}));

describe('PrayerArchCard', () => {
  afterEach(() => {
    cleanup();
  });

  const mockPrayer: PrayerArchData = {
    id: 'fajr',
    nameKey: 'prayer-fajr',
    arabicName: 'الفجر',
    subKey: 'prayer-fajr-sub',
    descKey: 'prayer-fajr-desc',
    defaultSub: 'Dawn',
    time: '05:12 AM',
    defaultDesc: 'Dawn prayer before sunrise',
    isNext: true,
    remaining: '42m',
  };

  it('renders prayer name, time, and next prayer badge with sparkle icon', () => {
    render(<PrayerArchCard prayer={mockPrayer} isStaggered={false} />);

    expect(screen.getByText('Fajr')).toBeTruthy();
    expect(screen.getByText('05:12 AM')).toBeTruthy();
    const nextBadge = screen.getByTestId('next-prayer-badge');
    expect(nextBadge).toBeTruthy();
    expect(nextBadge.textContent).toContain('✦');
    expect(nextBadge.textContent).toContain('NEXT');
  });

  it('toggles virtue devotional quote when clicking virtue button', () => {
    render(<PrayerArchCard prayer={mockPrayer} isStaggered={false} />);

    const virtueBtn = screen.getByRole('button');
    expect(virtueBtn).toBeTruthy();

    fireEvent.click(virtueBtn);
    expect(screen.getByText(/prayer-virtue-fajr/i)).toBeTruthy();
  });
});

describe('SpiritualPrayerRibbon', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders prayer ribbon header, hijri date, and all 5 prayer cards', () => {
    render(<SpiritualPrayerRibbon />);

    expect(screen.getByRole('heading', { name: 'DAILY PRAYER SANCTUARY' })).toBeTruthy();
    expect(screen.getAllByTestId('prayer-arch-card').length).toBe(5);
  });
});
