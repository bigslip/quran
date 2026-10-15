import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Tabs, TabsContent, TabsList, TabsTrigger } from './Tabs';

vi.mock('@/hooks/useDirection', () => ({
  default: () => 'ltr',
}));

describe('Tabs', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders tabs and switches content on click', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList aria-label="manage account">
          <TabsTrigger value="tab1">Account</TabsTrigger>
          <TabsTrigger value="tab2">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Account settings</TabsContent>
        <TabsContent value="tab2">Change your password</TabsContent>
      </Tabs>,
    );

    expect(screen.getByText('Account settings')).toBeDefined();
    expect(screen.queryByText('Change your password')).toBeNull();

    const passwordTab = screen.getByRole('tab', { name: /password/i });
    fireEvent.mouseDown(passwordTab);
    fireEvent.click(passwordTab);

    expect(screen.queryByText('Account settings')).toBeNull();
    expect(screen.getByText('Change your password')).toBeDefined();
  });

  it('renders with custom dir and disabled tab', () => {
    render(
      <Tabs defaultValue="tab1" dir="rtl">
        <TabsList>
          <TabsTrigger value="tab1">First</TabsTrigger>
          <TabsTrigger value="tab2" disabled>
            Disabled
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">First content</TabsContent>
        <TabsContent value="tab2">Disabled content</TabsContent>
      </Tabs>,
    );

    const disabledTab = screen.getByRole('tab', { name: /disabled/i });
    expect((disabledTab as HTMLButtonElement).disabled).toBe(true);
  });
});
