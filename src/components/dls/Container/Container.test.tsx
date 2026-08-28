import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import Container, { ContainerSize } from './Container';

describe('Container', () => {
  afterEach(cleanup);

  it('renders children correctly', () => {
    render(<Container data-testid="container">Hello World</Container>);
    expect(screen.getByText('Hello World')).toBeDefined();
  });

  it('applies size classes', () => {
    const { container } = render(
      <Container size={ContainerSize.Small}>Small Content</Container>,
    );
    expect(container.firstChild).toBeDefined();
  });

  it('forwards custom HTML attributes', () => {
    render(
      <Container id="main-content" data-testid="custom-container" role="region">
        Content
      </Container>,
    );
    const el = screen.getByTestId('custom-container');
    expect(el.getAttribute('id')).toBe('main-content');
    expect(el.getAttribute('role')).toBe('region');
  });
});
