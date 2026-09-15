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

  it('renders IndoPak font class correctly when font is text_indopak', () => {
    render(
      <TextWord 
        text="بِسۡمِ" 
        font="text_indopak" 
        charType={CharType.Word} 
        data-testid="indopak-word" 
      />
    );
    const el = screen.getByTestId('indopak-word');
    expect(el.textContent).toBe('بِسۡمِ');
    expect(el.className).toContain('IndoPak');
  });

  it('renders IndoPak font class for end markers when font is text_indopak', () => {
    render(
      <TextWord 
        text="١" 
        font="text_indopak" 
        charType={CharType.End} 
        data-testid="indopak-end" 
      />
    );
    const el = screen.getByTestId('indopak-end');
    expect(el.textContent).toBe('١');
    expect(el.className).toContain('IndoPak');
  });
});
