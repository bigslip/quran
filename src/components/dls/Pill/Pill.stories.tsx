import Pill, { PillSize } from './Pill';

export default {
  title: 'dls/Pill',
  component: Pill,
  argTypes: {
    size: {
      control: 'radio',
      options: Object.values(PillSize),
      description: 'The size of the pill',
      table: {
        category: 'Optional',
      },
    },
  },
};

const Template = (args) => <Pill {...args} />;

export const MediumSizedPill = Template.bind({});
MediumSizedPill.args = {
  children: 'COMPLETED',
  size: PillSize.MEDIUM,
};

export const SmallSizedPill = Template.bind({});
SmallSizedPill.args = {
  children: 'COMPLETED',
  size: PillSize.SMALL,
};
