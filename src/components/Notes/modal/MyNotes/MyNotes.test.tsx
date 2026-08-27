import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import useSWR from 'swr';

import MyNotes from './MyNotes';

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('@/components/dls/Tooltip', () => ({
  default: ({ children }: any) => <>{children}</>,
  ContentSide: { BOTTOM: 'bottom' },
}));

vi.mock('@/icons/plus.svg', () => ({
  default: () => <svg data-testid="plus-icon" />,
}));
vi.mock('@/icons/edit.svg', () => ({
  default: () => <svg data-testid="edit-icon" />,
}));
vi.mock('@/icons/trash.svg', () => ({
  default: () => <svg data-testid="trash-icon" />,
}));
vi.mock('@/icons/delete.svg', () => ({
  default: () => <svg data-testid="delete-icon" />,
}));
vi.mock('@/icons/qr-colored.svg', () => ({
  default: () => <svg data-testid="qr-colored-icon" />,
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

vi.mock('swr', () => ({
  default: vi.fn(),
}));

const mockNotes = [
  {
    id: 'note-1',
    body: 'Test Note 1',
    createdAt: '2023-01-01T00:00:00.000Z',
    updatedAt: '2023-01-01T00:00:00.000Z',
    ranges: ['1:1-1:1'],
    postUrl: '',
  },
];

afterEach(cleanup);

describe('MyNotes', () => {
  it('renders loading state correctly and spreads HTML attributes', () => {
    (useSWR as any).mockReturnValue({
      data: undefined,
      error: undefined,
    });

    render(
      <MyNotes
        onAddNote={vi.fn()}
        onEditNote={vi.fn()}
        verseKey="1:1"
        deletingNoteId={undefined}
        processingNoteId={undefined}
        onPostToQrClick={vi.fn()}
        onDeleteNoteClick={vi.fn()}
        data-testid="my-notes-container"
      />
    );

    expect(screen.getByTestId('my-notes-container')).toBeInTheDocument();
    // Assuming the loading state renders a spinner or skeleton.
  });

  it('renders a list of notes', () => {
    (useSWR as any).mockReturnValue({
      data: mockNotes,
      error: undefined,
    });

    render(
      <MyNotes
        onAddNote={vi.fn()}
        onEditNote={vi.fn()}
        verseKey="1:1"
        deletingNoteId={undefined}
        processingNoteId={undefined}
        onPostToQrClick={vi.fn()}
        onDeleteNoteClick={vi.fn()}
      />
    );

    expect(screen.getByText('Test Note 1')).toBeInTheDocument();
  });
});
