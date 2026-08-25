import '@testing-library/jest-dom/vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';
import NotesTabContent from './NotesTabContent';

afterEach(cleanup);

vi.mock('next/router', () => ({
  useRouter: () => ({ locale: 'en' }),
}));
vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));
vi.mock('react-virtuoso', () => ({
  Virtuoso: ({ data, itemContent }: any) => (
    <div data-testid="virtuoso">
      {data.map((item: any, i: number) => (
        <div key={i}>{itemContent(i, item)}</div>
      ))}
    </div>
  ),
}));
vi.mock('@/components/Notes/modal/MyNotes/Card/NoteCard', () => ({
  default: () => <div data-testid="note-card" />
}));

describe('NotesTabContent', () => {
  it('renders with aria-busy when loading', () => {
    render(
      <NotesTabContent 
        notes={[]} 
        isLoading={true} 
        isValidating={false} 
        error={null} 
        loadMore={vi.fn()} 
        mutateCache={vi.fn()} 
        data-testid="notes-content"
      />
    );
    const element = screen.getByTestId('notes-content');
    expect(element).toHaveAttribute('aria-busy', 'true');
  });
  
  it('renders empty state', () => {
    render(
      <NotesTabContent 
        notes={[]} 
        isLoading={false} 
        isValidating={false} 
        error={null} 
        loadMore={vi.fn()} 
        mutateCache={vi.fn()} 
        data-testid="notes-content"
      />
    );
    expect(screen.getByText('empty-notes')).toBeInTheDocument();
  });

  it('renders populated state', () => {
    render(
      <NotesTabContent 
        notes={[{ id: 1, text: 'First Note' } as any]} 
        isLoading={false} 
        isValidating={false} 
        error={null} 
        loadMore={vi.fn()} 
        mutateCache={vi.fn()} 
        data-testid="notes-content"
      />
    );
    expect(screen.getByTestId('note-card')).toBeInTheDocument();
    expect(screen.getByTestId('notes-content')).not.toHaveAttribute('aria-busy', 'true');
  });
});
