import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import SegmentedControl from './SegmentedControl';

const meta = {
  title: 'dls/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
} as Meta<typeof SegmentedControl>;
export default meta;

export const Default: StoryObj<typeof SegmentedControl> = {
  render: () => {
    const [view, setView] = useState('grid');
    return (
      <SegmentedControl
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
