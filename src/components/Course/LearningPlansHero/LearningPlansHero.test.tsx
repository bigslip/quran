/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable max-lines */
import React from 'react';

import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import LearningPlansHero from './LearningPlansHero';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('@/icons/search.svg', () => ({
  default: () => <svg data-testid="search-icon" />,
}));

vi.mock('@/icons/close.svg', () => ({
  default: () => <svg data-testid="close-icon" />,
}));

const mockTranslations: Record<string, string> = {
  'learn:sanctuary-badge': 'Structured Quran Learning Plans',
  'learn:hero-title': 'Quran Learning Plans',
  'learn:hero-subtitle': 'Explore curated, structured tracks',
  'learn:search-placeholder': 'Search learning plans and courses...',
  'learn:filter-all': 'All Plans',
  'learn:filter-tajweed': 'Tajweed & Recitation',
  'learn:filter-tafsir': 'Tafsir & Reflection',
  'learn:filter-arabic': 'Arabic & Vocabulary',
  'common:clear': 'Clear',
  'common:my-learning-plans': 'My Learning Plans',
};

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({
    t: (key: string) => mockTranslations[key] || key,
    lang: 'fa',
  }),
}));

describe('LearningPlansHero', () => {
  it('renders hero title, badge, search input, and filter category pills', () => {
    const onSearchQueryChange = vi.fn();
    const onFilterChange = vi.fn();

    render(
      <LearningPlansHero
        searchQuery=""
        onSearchQueryChange={onSearchQueryChange}
        activeFilter="all"
        onFilterChange={onFilterChange}
        totalCount={8}
      />,
    );

    expect(screen.getByText('Structured Quran Learning Plans')).toBeInTheDocument();
    expect(screen.getByText('Quran Learning Plans')).toBeInTheDocument();
    expect(screen.getByText('Explore curated, structured tracks')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Search learning plans and courses...')).toBeInTheDocument();
    expect(screen.getByText('All Plans')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('Tajweed & Recitation')).toBeInTheDocument();
    expect(screen.getByText('Tafsir & Reflection')).toBeInTheDocument();
    expect(screen.getByText('Arabic & Vocabulary')).toBeInTheDocument();
  });

  it('renders My Learning Plans title when isMyCourses is true', () => {
    render(<LearningPlansHero searchQuery="" onSearchQueryChange={vi.fn()} isMyCourses />);

    expect(screen.getByText('My Learning Plans')).toBeInTheDocument();
  });

  it('triggers onSearchQueryChange when typing in search input', () => {
    const onSearchQueryChange = vi.fn();
    render(<LearningPlansHero searchQuery="" onSearchQueryChange={onSearchQueryChange} />);

    const input = screen.getByPlaceholderText('Search learning plans and courses...');
    fireEvent.change(input, { target: { value: 'tajweed' } });
    expect(onSearchQueryChange).toHaveBeenCalledWith('tajweed');
  });

  it('triggers onFilterChange when clicking filter pills', () => {
    const onFilterChange = vi.fn();
    render(
      <LearningPlansHero
        searchQuery=""
        onSearchQueryChange={vi.fn()}
        activeFilter="all"
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.click(screen.getByText('Tajweed & Recitation'));
    expect(onFilterChange).toHaveBeenCalledWith('tajweed');

    fireEvent.click(screen.getByText('Tafsir & Reflection'));
    expect(onFilterChange).toHaveBeenCalledWith('tafsir');
  });

  it('clears search input when clear button is clicked or Escape is pressed', () => {
    const onSearchQueryChange = vi.fn();
    const { rerender } = render(
      <LearningPlansHero searchQuery="test" onSearchQueryChange={onSearchQueryChange} />,
    );

    const clearButton = screen.getByTestId('close-icon').closest('button');
    expect(clearButton).toBeInTheDocument();
    if (clearButton) {
      fireEvent.click(clearButton);
      expect(onSearchQueryChange).toHaveBeenCalledWith('');
    }

    rerender(<LearningPlansHero searchQuery="test" onSearchQueryChange={onSearchQueryChange} />);

    const input = screen.getByPlaceholderText('Search learning plans and courses...');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onSearchQueryChange).toHaveBeenCalledWith('');
  });
});
