import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import * as matchers from '@testing-library/jest-dom/matchers';
import ReciterInfo from './ReciterInfo';
import Reciter from 'types/Reciter';

expect.extend(matchers);

vi.mock('src/xstate/AudioPlayerMachineContext', () => ({
  AudioPlayerMachineContext: {},
}));

vi.mock('@xstate/react', () => ({
  useSelector: vi.fn(() => false),
}));

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ t: (key: string) => key, lang: 'en' }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
  }),
}));

vi.mock('@/icons/play-arrow.svg', () => ({
  default: () => <svg data-testid="play-icon" />,
}));

describe('ReciterInfo', () => {
  it('renders reciter info and spreads HTML attributes', () => {
    const mockReciter = {
      id: 1,
      translatedName: { name: 'Mishary Rashid' },
      bio: 'A famous reciter',
      profilePicture: 'mishary.jpg',
    } as Partial<Reciter> as Reciter;

    render(
      <ReciterInfo
        selectedReciter={mockReciter}
        data-testid="reciter-info"
        aria-label="Reciter Info"
      />
    );

    const root = screen.getByTestId('reciter-info');
    expect(root).toBeInTheDocument();
    expect(root).toHaveAttribute('aria-label', 'Reciter Info');
    expect(screen.getByText('Mishary Rashid')).toBeInTheDocument();
  });
});
