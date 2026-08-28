import * as SeparatorPrimitive from '@radix-ui/react-separator';
import classNames from 'classnames';

import styles from './Separator.module.scss';

export enum SeparatorWeight {
  Bold = 'bold',
  SemiBold = 'semiBold',
}

export type SeparatorProps = React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root> & {
  isVertical?: boolean;
  className?: string;
  weight?: SeparatorWeight;
};

const Separator = ({
  isVertical = false,
  className,
  weight = SeparatorWeight.SemiBold,
  orientation,
  ...props
}: SeparatorProps) => (
  <SeparatorPrimitive.Separator
    orientation={orientation || (isVertical ? 'vertical' : 'horizontal')}
    className={classNames(styles.base, styles[weight], {
      [className]: className,
    })}
    {...props}
  />
);

export default Separator;
