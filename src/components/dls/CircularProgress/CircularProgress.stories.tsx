import { Meta, StoryObj } from '@storybook/react';
import CircularProgressbar from './index';

const meta: Meta<typeof CircularProgressbar> = {
  title: 'dls/CircularProgress',
  component: CircularProgressbar,
  tags: ['autodocs'],
  args: {
    value: 50,
    minValue: 0,
    maxValue: 100,
    strokeWidth: 8,
    counterClockwise: false,
    background: false,
    backgroundPadding: 0,
    circleRatio: 1,
    ariaLabel: 'Loading progress',
  },
  argTypes: {
    value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
    strokeWidth: { control: { type: 'range', min: 1, max: 50, step: 1 } },
    circleRatio: { control: { type: 'range', min: 0, max: 1, step: 0.1 } },
  },
};

export default meta;

type Story = StoryObj<typeof CircularProgressbar>;

export const Default: Story = {
  args: {
    value: 50,
  },
  render: (args) => (
    <div style={{ width: '100px', height: '100px' }}>
      <CircularProgressbar {...args} />
    </div>
  ),
};

export const WithText: Story = {
  args: {
    value: 75,
    text: '75%',
  },
  render: (args) => (
    <div style={{ width: '100px', height: '100px' }}>
      <CircularProgressbar {...args} />
    </div>
  ),
};

export const WithBackground: Story = {
  args: {
    value: 60,
    background: true,
    backgroundPadding: 5,
  },
  render: (args) => (
    <div style={{ width: '100px', height: '100px' }}>
      <CircularProgressbar {...args} />
    </div>
  ),
};
