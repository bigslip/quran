import React, { HTMLAttributes } from 'react';

import classNames from 'classnames';

import styles from './Section.module.scss';

interface SectionProps extends HTMLAttributes<HTMLDivElement> {
  title: string;
  children: React.ReactNode;
  dataTestId?: string;
}

const Section: React.FC<SectionProps> = ({ title, children, dataTestId, className, ...props }) => {
  return (
    <div className={classNames(styles.section, className)} data-testid={dataTestId} {...props}>
      <h2 className={styles.title}>{title}</h2>
      {children}
    </div>
  );
};

export default Section;
