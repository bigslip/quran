import React from 'react';
import Card, { CardSize } from '../dls/Card/Card';

import styles from './RecitersList.module.scss';

import Link from '@/dls/Link/Link';
import { makeCDNUrl } from '@/utils/cdn';
import { getReciterNavigationUrl } from '@/utils/navigation';
import Reciter from 'types/Reciter';

type RecitersListProps = {
  reciters: Reciter[];
} & React.HTMLAttributes<HTMLDivElement>;

const RecitersList = ({ reciters, ...props }: RecitersListProps) => {
  return (
    <div className={styles.container} {...props}>
      {reciters.map((reciter) => {
        return (
          <Link key={reciter.id} href={getReciterNavigationUrl(reciter.id.toString())}>
            <Card
              imgSrc={makeCDNUrl(reciter.profilePicture)}
              key={reciter.id}
              title={reciter.translatedName.name}
              imgAlt={reciter.translatedName.name}
              description={reciter.style.name}
              size={CardSize.Medium}
            />
          </Link>
        );
      })}
    </div>
  );
};

export default RecitersList;
