import React, { useEffect, useState } from 'react';

import { FormattedMessage } from 'react-intl';
import { useClientMobile, isMobile } from '../../../../utils/device';

import { IoMdClose } from '../../../../components/reactIcons';
import { REF_ORDERLY_PERP_TIP_SIG } from '~pages/Orderly/OrderlyPerpetual';

export function PerpOrderlyTip() {
  const [show, setShow] = useState<boolean>(
    !!localStorage.getItem(REF_ORDERLY_PERP_TIP_SIG) ? false : true
  );

  const isMobile = useClientMobile();

  if (!show) return null;

  return (
    <div
      className="w-screen px-4  xs:pb-7 h-9 xs:rounded-2xl lg:relative    xs:bottom-0 bg-gradientFromHover  frcc "
      style={{
        fontSize: '13px',
        color: '#111F29',
        zIndex: isMobile ? 999999 : '',
      }}
    >
      <FormattedMessage
        id="perpTip"
        defaultMessage={
          'Welcome to Perpetual Futures trading! Please  read {perpTipLink} docs to get start!'
        }
        values={{
          perpTipLink: (
            <a
              className="font-gothamBold mx-1 underline"
              rel="noopener noreferrer nofollow"
              target="_blank"
              href="https://docs.orderly.network/perpetual-futures/introduction"
            >
              {isMobile && <br />}
              <FormattedMessage
                id="perpTipLink"
                defaultMessage="[Perpetual-futures Introduction]"
              />
            </a>
          ),
        }}
      />

      <div
        className="absolute right-3 cursor-pointer top-1 "
        onClick={() => {
          setShow(false);

          localStorage.setItem(REF_ORDERLY_PERP_TIP_SIG, '1');
        }}
        style={{
          color: '#0E1D28',
        }}
      >
        <IoMdClose size={22}></IoMdClose>
      </div>
    </div>
  );
}

export function PerpOrderlyTipMobile() {
  const [show, setShow] = useState<boolean>(
    !!localStorage.getItem(REF_ORDERLY_PERP_TIP_SIG) ? false : true
  );

  const isMobile = useClientMobile();

  if (!show) return null;

  return (
    <div
      className="w-screen px-4 xs:pr-8 xs:pb-20 xs:pt-2 h-9 xs:rounded-2xl   xs:bottom-0 bg-gradientFromHover  lg:frcc "
      style={{
        fontSize: '13px',
        color: '#111F29',
        top: isMobile ? 'none' : '-48px',
        zIndex: isMobile ? 51 : '',
        position: 'fixed',
      }}
    >
      <FormattedMessage
        id="perpTip"
        defaultMessage={
          'Welcome to Perpetual Futures trading! Please  read {perpTipLink} docs to get start!'
        }
        values={{
          perpTipLink: (
            <a
              className="font-gothamBold mx-1 underline"
              rel="noopener noreferrer nofollow"
              target="_blank"
              href="https://docs.orderly.network/perpetual-futures/introduction"
            >
              {/* {isMobile && <br />} */}
              <FormattedMessage
                id="perpTipLink"
                defaultMessage="[Perpetual-futures Introduction]"
              />
            </a>
          ),
        }}
      />

      <div
        className="absolute right-3 top-1 "
        onClick={() => {
          setShow(false);
          localStorage.setItem(REF_ORDERLY_PERP_TIP_SIG, '1');
        }}
        style={{
          color: '#0E1D28',
        }}
      >
        <IoMdClose size={22}></IoMdClose>
      </div>
    </div>
  );
}
