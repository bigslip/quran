import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';

import CircularProgressbar from './index';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('CircularProgressbar', () => {
  it('should render the progressbar with proper ARIA attributes', () => {
    render(<CircularProgressbar value={50} aria-label="Loading progress" />);

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toBeInTheDocument();
    expect(progressbar).toHaveAttribute('aria-valuenow', '50');
    expect(progressbar).toHaveAttribute('aria-valuemin', '0'); // default
    expect(progressbar).toHaveAttribute('aria-valuemax', '100'); // default
    expect(progressbar).toHaveAttribute('aria-label', 'Loading progress');
  });

  it('should render correct valuenow with custom bounds', () => {
    render(
      <CircularProgressbar value={150} minValue={100} maxValue={200} aria-label="Custom progress" />,
    );

    const progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '150');
    expect(progressbar).toHaveAttribute('aria-valuemin', '100');
    expect(progressbar).toHaveAttribute('aria-valuemax', '200');
  });

  it('should bound aria-valuenow within minValue and maxValue', () => {
    const { rerender } = render(<CircularProgressbar value={300} minValue={100} maxValue={200} />);
    let progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '200'); // bounded to maxValue

    rerender(<CircularProgressbar value={50} minValue={100} maxValue={200} />);
    progressbar = screen.getByRole('progressbar');
    expect(progressbar).toHaveAttribute('aria-valuenow', '100'); // bounded to minValue
  });

  it('should render text when provided', () => {
    render(<CircularProgressbar value={75} text="75%" />);
    const textElement = screen.getByText('75%');
    expect(textElement).toBeInTheDocument();
  });

  it('should render background circle when background is true', () => {
    const { container } = render(<CircularProgressbar value={50} background={true} />);
    const circles = container.querySelectorAll('circle');
    // It should render 1 circle for the background (path is rendered using path elements)
    expect(circles.length).toBe(1);
  });
});
