import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
import Breadcrumb from './Breadcrumb';

expect.extend(matchers);

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
});
