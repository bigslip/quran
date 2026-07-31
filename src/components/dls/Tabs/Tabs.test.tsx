import * as matchers from '@testing-library/jest-dom/matchers';
import { describe, expect, it, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});

describe('Tabs', () => {
  it('renders tabs and switches content on click', () => {
    render(
      <Tabs defaultValue="tab1">
        <TabsList aria-label="manage account">
          <TabsTrigger value="tab1">Account</TabsTrigger>
          <TabsTrigger value="tab2">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">Account settings</TabsContent>
        <TabsContent value="tab2">Change your password</TabsContent>
      </Tabs>
    );
    
    expect(screen.getByText('Account settings')).toBeInTheDocument();
    expect(screen.queryByText('Change your password')).not.toBeInTheDocument();
    
    const passwordTab = screen.getByRole('tab', { name: /password/i });
    fireEvent.mouseDown(passwordTab);
    fireEvent.click(passwordTab);
    
    expect(screen.queryByText('Account settings')).not.toBeInTheDocument();
    expect(screen.getByText('Change your password')).toBeInTheDocument();
  });
});
