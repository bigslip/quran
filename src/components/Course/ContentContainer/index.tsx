import React from 'react';

import styles from './ContentContainer.module.scss';

import classNames from 'classnames';

type Props = {
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>;

const ContentContainer: React.FC<Props> = ({ children, className, ...props }) => {
  return (
    <div {...props} className={classNames(styles.container, className)}>
      {children}
    </div>
  );
};

export default ContentContainer;
