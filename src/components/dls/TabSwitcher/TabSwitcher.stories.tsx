import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import TabSwitcher from './TabSwitcher';

const meta = {
  title: 'dls/TabSwitcher',
  component: TabSwitcher,
  tags: ['autodocs'],
} as Meta<typeof TabSwitcher>;
export default meta;

export const Default: StoryObj<typeof TabSwitcher> = {
  render: () => {
    const [view, setView] = useState('grid');
    return (
      <TabSwitcher
        value={view}
        onChange={setView}
        options={[
          { label: 'Grid', value: 'grid' },
          { label: 'List', value: 'list' },
          { label: 'Map', value: 'map' },
        ]}
      />
    );
  },
};
