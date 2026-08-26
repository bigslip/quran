import React from 'react';

import Link from '@/dls/Link/Link';
import { logButtonClick } from '@/utils/eventLogger';

interface Props extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string;
  text: string;
  isNewTab?: boolean;
}

const InlineLink: React.FC<Props> = ({ href, text, isNewTab = true, ...rest }) => {
  const onLinkClicked = () => {
    logButtonClick('ramadan_activities_link', { href });
  };
  return (
    <>
      {' '}
      <Link onClick={onLinkClicked} isNewTab={isNewTab} href={href} {...rest}>
        {text}
      </Link>{' '}
    </>
  );
};

export default InlineLink;
