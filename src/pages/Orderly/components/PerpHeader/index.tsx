import React, { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { useClientMobile, isMobile } from '../../../../utils/device';

import { IoMdClose } from '../../../../components/reactIcons';

export function PerpOrderlyTip() {
  return (
    <div
      className="w-screen px-10  xs:pb-7 h-10 xs:rounded-2xl lg:relative    xs:bottom-0 bg-lightReBgColor text-redwarningColor  frcc "
      style={{
        fontSize: '13px',
        zIndex: isMobile ? 10 : '',
      }}
    >
      <FormattedMessage
        id="perpTipDown"
        defaultMessage={`Orderly has shut down and no longer supports Spot and Perps. {link} and  withdraw your assets. New Spot and Perps are coming soon—stay tuned!`}
        values={{
          link: (
            <a
              className="underline cursor-pointer mx-1"
              target="_blank"
              href="https://app.orderly.network/near"
              rel="noreferrer"
            >
              Click
            </a>
          ),
        }}
      />
    </div>
  );
}

export function PerpOrderlyTipMobile() {
  return (
    <div
      className="w-screen px-4 xs:pr-8 xs:py-2  xs:rounded-2xl   xs:bottom-0 bg-lightReBgColor  text-redwarningColor lg:frcc "
      style={{
        fontSize: '14px',
        top: isMobile ? '0px' : '-48px',
        zIndex: isMobile ? 10 : '',
      }}
    >
      <FormattedMessage
        id="perpTipDown"
        defaultMessage={`Orderly has shut down and no longer supports Spot and Perps. {link} and  withdraw your assets. New Spot and Perps are coming soon—stay tuned!`}
        values={{
          link: (
            <a
              className="underline cursor-pointer mx-1"
              target="_blank"
              href="https://app.orderly.network/near"
              rel="noreferrer"
            >
              Click
            </a>
          ),
        }}
      />
    </div>
  );
}
