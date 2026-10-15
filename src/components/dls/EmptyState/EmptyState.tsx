import React from 'react';

import classNames from 'classnames';

import styles from './EmptyState.module.scss';

export interface EmptyStateProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  title: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  isCompact?: boolean;
  isTransparent?: boolean;
  className?: string;
  testId?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  isCompact = false,
  isTransparent = false,
  className,
  testId,
  children,
  ...rest
}) => {
  return (
    <div
      className={classNames(
        styles.container,
        {
          [styles.compact]: isCompact,
          [styles.transparent]: isTransparent,
        },
        className,
      )}
      data-testid={testId}
      {...rest}
    >
      {icon && <div className={styles.iconWrapper}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      {(primaryAction || secondaryAction || children) && (
        <div className={styles.actions}>
          {primaryAction}
          {secondaryAction}
          {children}
        </div>
      )}
    </div>
  );
};

export default EmptyState;
