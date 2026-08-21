import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import TextWord from './TextWord';
import { CharType } from 'types/Word';

describe('TextWord', () => {
  afterEach(cleanup);
  it('renders text and spreads props', () => {
    render(
      <TextWord 
        text="بسم" 
        font="qpcUthmaniHafs" 
        charType={CharType.Word} 
        data-testid="text-word" 
        aria-hidden="true" 
      />
    );
    const el = screen.getByTestId('text-word');
    expect(el.textContent).toBe('بسم');
    expect(el.getAttribute('aria-hidden')).toBe('true');
  });
});
