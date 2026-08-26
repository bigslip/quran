import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import LearningPlansPage from './index';

expect.extend(matchers);

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/components/DataFetcher', () => ({
  default: ({ render }: any) => (
    <div data-testid="data-fetcher">
      {render({})}
    </div>
  ),
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
  it('renders the LearningPlansPage correctly', () => {
    const { getByTestId, getByText } = render(<LearningPlansPage />);
    expect(getByTestId('next-seo-wrapper')).toBeInTheDocument();
    
    // Verify it renders the layout and passes down props to the list
    expect(getByText('common:learning-plans')).toBeInTheDocument();
    const list = getByTestId('mock-courses-list');
    expect(list).toBeInTheDocument();
    expect(list).toHaveAttribute('data-ismycourses', 'false');
  });
});
