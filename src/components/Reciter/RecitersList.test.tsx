import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import RecitersList from './RecitersList';
import Reciter from 'types/Reciter';

expect.extend(matchers);

describe('RecitersList', () => {
  it('renders a list of reciters and spreads HTML attributes', () => {
    const mockReciters = [
      {
        id: 1,
        name: 'Mishary',
        translatedName: { name: 'Mishary Rashid', languageName: 'en' },
        style: { name: 'Murattal' },
        profilePicture: 'mishary.jpg',
      },
    ] as Partial<Reciter>[] as Reciter[];

    render(
      <RecitersList reciters={mockReciters} data-testid="reciters-list" aria-label="List of reciters" />
    );

    const root = screen.getByTestId('reciters-list');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'List of reciters');
    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
  });
});
