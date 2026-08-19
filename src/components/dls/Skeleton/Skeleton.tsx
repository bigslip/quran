import React from 'react';
import classNames from 'classnames';

import styles from './Skeleton.module.scss';

type SkeletonProps = React.HTMLAttributes<HTMLSpanElement> & {
  children?: React.ReactNode;
  isRounded?: boolean;
  isSquared?: boolean;
  isActive?: boolean;
  className?: string;
};

const Skeleton = ({
  children,
  isRounded,
  isSquared,
  isActive = true,
  className,
  ...props
}: SkeletonProps) => {
  return (
    <span
      aria-hidden="true"
      {...props}
      className={classNames(styles.skeleton, {
        [styles.baseSize]: !children && !className,
        [styles.active]: isActive,
        [styles.rounded]: isRounded,
        [styles.squared]: isSquared,
        [className]: className,
      })}
    >
      {children && <span className={styles.content}>{children}</span>}
    </span>
  );
};

export default Skeleton;
