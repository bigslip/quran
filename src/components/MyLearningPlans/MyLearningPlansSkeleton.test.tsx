import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import MyLearningPlansSkeleton from './MyLearningPlansSkeleton';

expect.extend(matchers);

describe('MyLearningPlansSkeleton', () => {
  it('renders correctly', () => {
    render(<MyLearningPlansSkeleton data-testid="skeleton" aria-label="Loading plans" className="custom-class" />);
    
    // Should spread HTMLAttributes like data-testid
    expect(screen.getByTestId('skeleton')).toBeInTheDocument();
    
    // Should spread aria-label
    expect(screen.getByLabelText('Loading plans')).toBeInTheDocument();
    
    // Should append className
    expect(screen.getByTestId('skeleton')).toHaveClass('custom-class');
  });
});
