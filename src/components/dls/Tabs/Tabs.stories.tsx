import type { Meta, StoryObj } from '@storybook/react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './Tabs';

const meta = {
  title: 'dls/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} as Meta<typeof Tabs>;
export default meta;

export const Default: StoryObj<typeof Tabs> = {
  render: () => (
    <Tabs defaultValue="account" style={{ width: '400px' }}>
      <TabsList aria-label="Manage your account">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here. Click save when you're done.
      </TabsContent>
      <TabsContent value="password">
        Change your password here. After saving, you'll be logged out.
      </TabsContent>
      <TabsContent value="settings">
        Manage your personal settings.
      </TabsContent>
    </Tabs>
  ),
};
