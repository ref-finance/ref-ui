import React, { useEffect, useState, useContext } from 'react';
import { USNIcon } from '~components/icon/Common';
import { FormattedMessage } from 'react-intl';
import { GetUSNHover, GetUSNDefault, GetUSNMobile } from '../icon/Nav';
import { isClientMobie, useClientMobile } from '../../utils/device';

export default function USNBuyComponent({
  hover,
  onClick,
}: {
  hover?: boolean;
  onClick?: any;
}) {
  const isMobie = useClientMobile();

  return (
    <button onClick={onClick}>
      {isMobie ? <GetUSNMobile /> : hover ? <GetUSNHover /> : <GetUSNDefault />}
    </button>
  );
}
