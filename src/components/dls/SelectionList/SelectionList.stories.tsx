import React, { useState } from 'react';
import { Meta, StoryObj } from '@storybook/react';

import SelectionList from './index';

const meta: Meta<typeof SelectionList> = {
  title: 'dls/SelectionList',
  component: SelectionList,
  args: {
    id: 'selection-list-story',
    title: 'Select Options',
    items: [
      { id: '1', label: 'Option 1', value: 'opt1' },
      { id: '2', label: 'Option 2', value: 'opt2' },
      { id: '3', label: 'Option 3', value: 'opt3' },
    ],
    selectedValues: ['opt1'],
    isPortalled: false, // Easier to view in storybook without clipping sometimes
  },
};

export default meta;

type Story = StoryObj<typeof SelectionList>;

export const Default: Story = {
  render: (args) => {
    const [selectedValues, setSelectedValues] = useState<string[]>(args.selectedValues);
    return (
      <div style={{ height: '200px' }}>
        <SelectionList {...args} selectedValues={selectedValues} onChange={setSelectedValues} />
      </div>
    );
  },
};
