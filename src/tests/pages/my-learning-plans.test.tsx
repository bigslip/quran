/* eslint-disable import/no-extraneous-dependencies */
import React from 'react';

import * as matchers from '@testing-library/jest-dom/matchers';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import MyLearningPlanPage from '@/pages/my-learning-plans';

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

vi.mock('@/components/Auth/withAuth', () => ({
  default: (Component: any) => Component,
}));

vi.mock('@/components/DataFetcher', () => ({
  default: ({ render: renderProp }: any) => <div data-testid="data-fetcher">{renderProp({})}</div>,
}));

vi.mock('@/components/Course/CoursesList', () => ({
  default: ({ isMyCourses }: any) => (
    <div data-testid="mock-courses-list" data-ismycourses={String(!!isMyCourses)} />
  ),
}));

vi.mock('@/components/MyLearningPlans/MyLearningPlansSkeleton', () => ({
  default: () => <div data-testid="my-learning-plans-skeleton" />,
}));

vi.mock('@/components/NextSeoWrapper', () => ({
  default: () => <div data-testid="next-seo-wrapper" />,
}));

describe('MyLearningPlanPage', () => {
  it('renders the MyLearningPlanPage correctly', () => {
    const { getByTestId, getByText } = render(<MyLearningPlanPage />);
    expect(getByTestId('next-seo-wrapper')).toBeInTheDocument();

    // Verify it renders the layout and passes down props to the list
    expect(getByText('common:my-learning-plans')).toBeInTheDocument();
    const list = getByTestId('mock-courses-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('data-ismycourses', 'true');
  });
});
