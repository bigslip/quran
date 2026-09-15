/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';

import * as matchers from '@testing-library/jest-dom/matchers';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import LearningPlansPage from '@/pages/learning-plans';

expect.extend(matchers);

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

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/components/DataFetcher', () => ({
  default: ({ render: renderProp }: any) => <div data-testid="data-fetcher">{renderProp({})}</div>,
}));

vi.mock('@/components/Course/CoursesList', () => ({
  default: ({ isMyCourses }: any) => (
    <div data-testid="mock-courses-list" data-ismycourses={String(!!isMyCourses)} />
  ),
}));

vi.mock('@/components/NextSeoWrapper', () => ({
  default: () => <div data-testid="next-seo-wrapper" />,
}));

describe('LearningPlansPage', () => {
  it('renders the LearningPlansPage correctly with Sanctuary hero and course list', () => {
    const { getByTestId, getByText } = render(<LearningPlansPage />);
    expect(getByTestId('next-seo-wrapper')).toBeInTheDocument();

    // Verify it renders the sanctuary hero title and badge
    expect(getByText('learn:hero-title')).toBeInTheDocument();
    expect(getByText('learn:sanctuary-badge')).toBeInTheDocument();

    // Verify it renders the layout and passes down props to the list
    const list = getByTestId('mock-courses-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('data-ismycourses', 'false');
  });
});
