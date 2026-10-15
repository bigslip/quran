import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import CourseDetails from './index';
import { Course } from '@/types/auth/Course';

expect.extend(matchers);

vi.mock('@/icons/collection.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/developers.svg', () => ({ default: () => <div /> }));
vi.mock('@/icons/west.svg', () => ({ default: () => <div /> }));

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: '/',
    query: {},
  }),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('@/components/Course/Buttons/RepeatLearningPlan', () => ({
  default: () => <div data-testid="repeat-learning-plan" />,
}));

vi.mock('@/components/Course/Buttons/StartOrContinueLearning', () => ({
  default: () => <div data-testid="start-continue-learning" />,
}));

vi.mock('@/utils/auth/useCourseEnrollment', () => ({
  default: () => ({
    enroll: vi.fn(),
    isEnrolling: false,
  }),
}));

vi.mock('@/utils/eventLogger', () => ({
  logEvent: vi.fn(),
  logButtonClick: vi.fn(),
}));

const mockCourse: Course = {
  id: '1',
  title: 'Test Course',
  slug: 'test-course',
  image: '/test.jpg',
  isCompleted: false,
  isUserEnrolled: false,
  authors: [],
  editors: [],
  lessons: [],
  allowGuestAccess: true,
} as unknown as Course;

describe('CourseDetails', () => {
  it('renders enrollment state for unenrolled user', () => {
    render(<CourseDetails course={mockCourse} />);
    // Should show start button from StatusHeader CTA
    expect(screen.getAllByTestId('learning-plan-enroll-button')).toHaveLength(2); // One in top section, one in CTA
  });

  it('renders progress and continue button for enrolled user', () => {
    render(<CourseDetails course={{ ...mockCourse, isUserEnrolled: true }} />);
    // Should show start or continue learning button
    expect(screen.getAllByTestId('start-continue-learning').length).toBeGreaterThan(0);
  });

  it('renders certificates or completed state for completed course', () => {
    render(<CourseDetails course={{ ...mockCourse, isCompleted: true }} />);
    expect(screen.getByText('completed')).toBeInTheDocument();
    expect(screen.getByTestId('repeat-learning-plan')).toBeInTheDocument();
  });
});
