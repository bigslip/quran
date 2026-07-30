/* eslint-disable i18next/no-literal-string, import/no-extraneous-dependencies, jsx-a11y/no-static-element-interactions */
import * as matchers from '@testing-library/jest-dom/matchers';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, expect, it, afterEach, vi } from 'vitest';

import Collapsible, { CollapsibleDirection } from './Collapsible';

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

  it('toggles content when clicking or pressing keys on suffix with shouldSuffixTrigger=true', () => {
    render(
      <Collapsible title="More Info" suffix={<span>Suffix Icon</span>} shouldSuffixTrigger>
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();

    const suffixButton = screen.getByRole('button', { name: /suffix icon/i });
    expect(suffixButton).toHaveAttribute('tabIndex', '0');

    // Toggle open via keydown Enter
    fireEvent.keyDown(suffixButton, { key: 'Enter' });
    expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();

    // Toggle closed via click
    fireEvent.click(suffixButton);
    expect(screen.queryByText('Hidden content revealed')).not.toBeInTheDocument();

    // Toggle open via keydown Space
    fireEvent.keyDown(suffixButton, { key: ' ' });
    expect(screen.getByText('Hidden content revealed')).toBeInTheDocument();
  });

  it('attaches role="button" and tabIndex=0 to suffix container only when shouldSuffixTrigger=true', () => {
    const { rerender } = render(
      <Collapsible
        title="More Info"
        suffix={<span data-testid="suffix-icon">Suffix Icon</span>}
        shouldSuffixTrigger
      >
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    const suffixIcon = screen.getByTestId('suffix-icon');
    const suffixContainer = suffixIcon.parentElement;
    expect(suffixContainer).toHaveAttribute('role', 'button');
    expect(suffixContainer).toHaveAttribute('tabIndex', '0');

    rerender(
      <Collapsible
        title="More Info"
        suffix={<span data-testid="suffix-icon">Suffix Icon</span>}
        shouldSuffixTrigger={false}
      >
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(suffixContainer).not.toHaveAttribute('role');
    expect(suffixContainer).not.toHaveAttribute('tabIndex');
  });

  it('renders suffix when direction is CollapsibleDirection.Right', () => {
    render(
      <Collapsible
        title="More Info"
        direction={CollapsibleDirection.Right}
        suffix={<span data-testid="right-suffix">Right Suffix</span>}
      >
        {({ isOpen }) => <div>{isOpen ? 'Hidden content revealed' : 'Collapsed'}</div>}
      </Collapsible>,
    );

    expect(screen.getByTestId('right-suffix')).toBeInTheDocument();
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
});
