import type { Meta, StoryObj } from '@storybook/react';
import HoverCard from './index';

const meta = {
  title: 'dls/HoverCard',
  component: HoverCard,
  tags: ['autodocs'],
} as Meta<typeof HoverCard>;
export default meta;

export const Default: StoryObj<typeof HoverCard> = {
  args: {
    children: <span style={{ textDecoration: 'underline', cursor: 'pointer', padding: '2rem' }}>Hover over me</span>,
    content: (
      <div style={{ maxWidth: '200px' }}>
        <h4 style={{ margin: '0 0 0.5rem 0' }}>Detailed Info</h4>
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--color-text-faded)' }}>
          This is the hidden content that gets revealed when you hover over the trigger element.
        </p>
      </div>
    ),
  },
};
