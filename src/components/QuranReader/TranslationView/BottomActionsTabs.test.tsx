import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import BottomActionsTabs from './BottomActionsTabs';

vi.mock('next-translate/useTranslation', () => ({
  default: () => ({ lang: 'en', t: (k: string) => k }),
}));

vi.mock('next/router', () => ({
  useRouter: () => ({
    locale: 'en',
    pathname: '/',
  }),
}));

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

vi.mock('@/icons/chevron-left.svg', () => ({
  default: () => <svg data-testid="chevron-left" />,
}));

vi.mock('@/icons/chevron-right.svg', () => ({
  default: () => <svg data-testid="chevron-right" />,
}));

describe('BottomActionsTabs', () => {
  afterEach(cleanup);

  const mockTabs = [
    {
      id: 'tafsir',
      label: 'Tafsir',
      icon: <span>📖</span>,
      onClick: vi.fn(),
    },
    {
      id: 'reflections',
      label: 'Reflections',
      icon: <span>💭</span>,
      onClick: vi.fn(),
    },
  ];

  it('renders tabs with labels and icons', () => {
    render(<BottomActionsTabs tabs={mockTabs} isTranslationView={true} />);

    expect(screen.getByText('Tafsir')).toBeDefined();
    expect(screen.getByText('Reflections')).toBeDefined();
  });

  it('triggers onClick on mouse click', () => {
    const handleClick = vi.fn();
    const tabs = [{ id: 'test', label: 'Test Tab', icon: <span>✨</span>, onClick: handleClick }];
    render(<BottomActionsTabs tabs={tabs} isTranslationView={true} />);

    fireEvent.click(screen.getByRole('button', { name: 'Test Tab' }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('triggers onClick on Enter and Space keys only, and NOT on Tab key', () => {
    const handleClick = vi.fn();
    const tabs = [{ id: 'test', label: 'Test Tab', icon: <span>✨</span>, onClick: handleClick }];
    render(<BottomActionsTabs tabs={tabs} isTranslationView={true} />);

    const tabBtn = screen.getByRole('button', { name: 'Test Tab' });

    // Pressing Tab should NOT trigger onClick
    fireEvent.keyDown(tabBtn, { key: 'Tab' });
    expect(handleClick).not.toHaveBeenCalled();

    // Pressing Enter should trigger onClick
    fireEvent.keyDown(tabBtn, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);

    // Pressing Space should trigger onClick
    fireEvent.keyDown(tabBtn, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(2);
  });
});
