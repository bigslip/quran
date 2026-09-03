import React from 'react';

import classNames from 'classnames';
import Link from 'next/link';

import styles from '../HomePageApps.module.scss';

import ArrowIcon from '@/icons/arrow.svg';

export interface AppItem {
  id: string;
  name: string;
  description: string;
  iconSrc: string;
  iconAlt: string;
  href: string;
}

interface CompanionAppCardProps {
  app: AppItem;
  onClick: (appId: string) => void;
}

const CompanionAppCard: React.FC<CompanionAppCardProps> = ({ app, onClick }) => {
  return (
    <Link
      className={classNames(styles.appCard, styles[app.id])}
      onClick={() => onClick(app.id)}
      href={app.href}
      target="_blank"
      rel="noopener noreferrer"
    >
      <div className={styles.iconContainer}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={app.iconSrc} alt={app.iconAlt} className={styles.appIconImage} />
      </div>
      <div className={styles.appInfo}>
        <h4 className={styles.appName}>{app.name}</h4>
        <p className={styles.appDescription}>{app.description}</p>
      </div>
      <ArrowIcon className={styles.appCardArrow} />
    </Link>
  );
};

export default CompanionAppCard;
