import React from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import ClickableHoverCard from './index';

const meta = {
  title: 'dls/ClickableHoverCard',
  component: ClickableHoverCard,
  tags: ['autodocs'],
} as Meta<typeof ClickableHoverCard>;
export default meta;

export const Default: StoryObj<typeof ClickableHoverCard> = {
  args: {
    children: 'Hover or click me',
    content: (
      <div style={{ padding: '1rem', width: '200px' }}>
        This works for hover on desktop, and click on mobile devices!
      </div>
    ),
  },
};
