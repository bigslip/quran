import React from 'react';
import classNames from 'classnames';

import styles from './Container.module.scss';

export enum ContainerSize {
  Small = 'sm',
  Medium = 'md',
  Large = 'lg',
  XLarge = 'xl',
  Fluid = 'fluid',
}

export type ContainerProps = React.HTMLAttributes<HTMLDivElement> & {
  size?: ContainerSize;
  className?: string;
  children: React.ReactNode;
};

const Container = ({
  size = ContainerSize.Large,
  className,
  children,
  ...props
}: ContainerProps) => (
  <div
    className={classNames(styles.container, styles[size], className)}
    {...props}
  >
    {children}
  </div>
);

export default Container;
