import React, { MouseEvent } from 'react';
import useTranslation from 'next-translate/useTranslation';

import Button, { ButtonSize, ButtonVariant } from '@/dls/Button/Button';
import CloseIcon from '@/icons/close.svg';

interface Props {
  isClearable: boolean;
  isSelected: boolean;
  commandKey: number | string;
  onRemoveCommandClicked: (event: MouseEvent<Element>, key: number | string) => void;
}

const CommandControl: React.FC<Props> = ({
  isClearable,
  onRemoveCommandClicked,
  commandKey,
  isSelected,
}) => {
  const { t } = useTranslation('common');
  if (isClearable) {
    return (
      <Button
        variant={ButtonVariant.Ghost}
        size={ButtonSize.Small}
        ariaLabel={t('remove')}
        onClick={(e) => onRemoveCommandClicked(e, commandKey)}
      >
        <CloseIcon />
      </Button>
    );
  }
  if (isSelected) {
    return null;
  }
  return null;
};

export default CommandControl;
