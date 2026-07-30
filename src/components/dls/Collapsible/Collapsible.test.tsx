/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies, jsx-a11y/no-static-element-interactions */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach, vi } from 'vitest';

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

  it('does not toggle content when clicking child in suffix with shouldSuffixTrigger=false', () => {
    const onSuffixClick = vi.fn();
    render(
      <Collapsible
        title="More Info"
        suffix={
          <button type="button" onClick={onSuffixClick}>
            Suffix Button
          </button>
        }
        shouldSuffixTrigger={false}
      >
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Suffix Button'));

    expect(onSuffixClick).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();
  });

  it('toggles content when clicking suffix with shouldSuffixTrigger=true', () => {
    render(
      <Collapsible title="More Info" suffix={<span>Suffix Icon</span>} shouldSuffixTrigger>
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Suffix Icon'));
    expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();
  });

  it('does not render nested role="button" or tabIndex on suffix container', () => {
    render(
      <Collapsible
        title="More Info"
        suffix={<span data-testid="suffix-icon">Suffix Icon</span>}
        shouldSuffixTrigger
      >
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    const suffixContainer = screen.getByTestId('suffix-icon').parentElement;
    expect(suffixContainer).not.toHaveAttribute('role', 'button');
    expect(suffixContainer).not.toHaveAttribute('tabIndex');
  });

  it('supports controlled open state via shouldOpen prop', () => {
    const { rerender } = render(
      <Collapsible title="More Info" shouldOpen={false}>
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();

    rerender(
      <Collapsible title="More Info" shouldOpen>
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();
  });

  it('allows non-trigger keydown events to propagate when shouldSuffixTrigger is false', () => {
    const onParentKeyDown = vi.fn();
    render(
      <div onKeyDown={onParentKeyDown}>
        <Collapsible
          title="More Info"
          suffix={<input data-testid="suffix-input" type="text" />}
          shouldSuffixTrigger={false}
        >
          {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
        </Collapsible>
      </div>,
    );

    const input = screen.getByTestId('suffix-input');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(onParentKeyDown).toHaveBeenCalledTimes(1);

    fireEvent.keyDown(input, { key: 'Enter' });
    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();
  });
});
