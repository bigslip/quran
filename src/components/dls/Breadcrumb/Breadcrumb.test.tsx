import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import Breadcrumb from './Breadcrumb';

expect.extend(matchers);
afterEach(cleanup);

describe('Breadcrumb', () => {
  it('renders breadcrumb items and separators', () => {
    render(
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Surahs', href: '/surahs' },
          { label: 'Al-Fatihah' },
        ]}
      />
    );
    
    expect(screen.getByText('Home')).toHaveAttribute('href', '/');
    expect(screen.getByText('Surahs')).toHaveAttribute('href', '/surahs');
    expect(screen.getByText('Al-Fatihah')).not.toHaveAttribute('href');
  });

  it('renders nothing when items array is empty', () => {
    const { container } = render(<Breadcrumb items={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders correctly with a single item', () => {
    render(<Breadcrumb items={[{ label: 'Home' }]} />);
    
    const home = screen.getByText('Home');
    expect(home).not.toHaveAttribute('href');
    expect(home).toHaveAttribute('aria-current', 'page');
  });
});
