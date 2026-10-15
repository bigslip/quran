import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import Sorter, { ArrowDirection } from './Sorter';

const meta: Meta<typeof Sorter> = {
  title: 'dls/Sorter',
  component: Sorter,
  args: {
    options: [
      { id: 'recent', label: 'Recently Added', direction: ArrowDirection.Down },
      { id: 'alpha', label: 'Alphabetical', direction: ArrowDirection.Up },
      { id: 'popular', label: 'Popularity' },
    ],
    selectedOptionId: 'recent',
  },
};

export default meta;

type Story = StoryObj<typeof Sorter>;

export const Default: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<string>(args.selectedOptionId as string);
    return (
      <div style={{ padding: '20px', display: 'flex', justifyContent: 'center' }}>
        <Sorter {...args} selectedOptionId={selected} onChange={setSelected} />
      </div>
    );
  },
};
