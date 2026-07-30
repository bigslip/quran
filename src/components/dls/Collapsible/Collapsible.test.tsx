/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach } from 'vitest';

import Collapsible from './Collapsible';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('Collapsible', () => {
  it('renders title and allows toggling content', () => {
    render(
      <Collapsible title="More Info">
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(screen.getByText('More Info')).toBeInTheDocument();
    // Collapsed by default
    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /more info/i }));
    expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();
  });

  it('can be defaultOpen', () => {
    render(
      <Collapsible title="More Info" isDefaultOpen>
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );
    expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();
  });
});
