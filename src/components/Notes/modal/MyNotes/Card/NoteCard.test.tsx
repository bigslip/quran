import '@testing-library/jest-dom/vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';

import NoteCard from './NoteCard';
import { NoteWithRecentReflection } from '@/components/Notes/modal/type';

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('@/components/dls/Tooltip', () => ({
  default: ({ children }: any) => <>{children}</>,
  ContentSide: { BOTTOM: 'bottom' },
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

vi.mock('@/components/Notes/modal/MyNotes/QrButton', () => ({
  default: () => <button data-testid="qr-btn" />,
}));

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock DataContext to avoid missing provider issues
vi.mock('@/contexts/DataContext', () => ({
  default: React.createContext({}),
}));

const mockNote: NoteWithRecentReflection = {
  id: 'note-1',
  body: 'This is a test note that spans multiple lines to test the see more feature. But since we are rendering it, we will just check if the body is there.',
  createdAt: '2023-01-01T00:00:00.000Z',
  updatedAt: '2023-01-01T00:00:00.000Z',
  ranges: ['2:1-2:3'],
  postUrl: '',
};

afterEach(cleanup);

describe('NoteCard', () => {
  it('renders note content and title', () => {
    render(
      <NoteCard
        note={mockNote}
        onEdit={vi.fn()}
        onPostToQr={vi.fn()}
        onDelete={vi.fn()}
        isDeletingNote={false}
      />
    );

    expect(screen.getByText(/This is a test note/i)).toBeInTheDocument();
  });

  it('triggers onEdit callback when edit button is clicked', () => {
    const onEdit = vi.fn();
    const { getByTestId } = render(
      <NoteCard
        note={mockNote}
        onEdit={onEdit}
        onPostToQr={vi.fn()}
        onDelete={vi.fn()}
        isDeletingNote={false}
      />
    );

    const editBtn = getByTestId('edit-note-button');
    fireEvent.click(editBtn);
    expect(onEdit).toHaveBeenCalledWith(mockNote);
  });

  it('spreads HTMLAttributes correctly', () => {
    const { container } = render(
      <NoteCard
        note={mockNote}
        onEdit={vi.fn()}
        onPostToQr={vi.fn()}
        onDelete={vi.fn()}
        isDeletingNote={false}
        aria-hidden="true"
        className="extra-class"
      />
    );

    const noteCard = container.querySelector('.extra-class');
    expect(noteCard).toBeInTheDocument();
    expect(noteCard).toHaveAttribute('aria-hidden', 'true');
  });
});
