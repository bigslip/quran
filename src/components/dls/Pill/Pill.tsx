import React from 'react';

import classNames from 'classnames';

import styles from './Pill.module.scss';

export enum PillSize {
  SMALL = 'small',
  MEDIUM = 'medium',
}

type Props = {
  children: React.ReactNode;
  size?: PillSize;
  containerClassName?: string;
} & React.HTMLAttributes<HTMLDivElement>;

const Pill: React.FC<Props> = ({ children, size = PillSize.MEDIUM, containerClassName, className, ...props }) => {
  return (
    <div
      className={classNames(className, containerClassName, styles.container, {
        [styles.medium]: size === PillSize.MEDIUM,
        [styles.small]: size === PillSize.SMALL,
      })}
      {...props}
    >
      {children}
    </div>
  );
};

export default Pill;
