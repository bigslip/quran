import { useState, useEffect } from 'react';

import type { Meta, StoryObj } from '@storybook/react';

import Progress from './index';

const meta = {
  title: 'dls/Progress',
  component: Progress,
  tags: ['autodocs'],
  argTypes: {
    size: { control: 'select', options: ['small', 'medium', 'large'] },
  },
} as Meta<typeof Progress>;
export default meta;

export const Default: StoryObj<typeof Progress> = {
  args: {
    value: 65,
    size: 'medium',
  },
};

const AnimatedProgress = () => {
  const [progress, setProgress] = useState(10);
  useEffect(() => {
    const timer = setTimeout(() => setProgress(85), 500);
    return () => clearTimeout(timer);
  }, []);
  return <Progress value={progress} />;
};

export const Animated: StoryObj<typeof Progress> = {
  render: () => <AnimatedProgress />,
};
