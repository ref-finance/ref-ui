import React, { useContext, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { CloseIconBold } from '../../components/icon/Actions';
import { isMobile } from '../../utils/device';
import { SWAP_TYPE, SwapProContext } from '../../pages/SwapPage';

export function AnchorDot() {
  return (
    <div className="w-6 h-6 rounded-full relative flex items-center justify-center bg-gradientFromHover bg-opacity-20">
      <div
        className=" rounded-full bg-gradientFromHover"
        style={{
          height: '14px',
          width: '14px',
        }}
      ></div>
    </div>
  );
}

export function AnchorDash() {
  return (
    <div className="xs:transform xs:rotate-90 xs:w-8 xs:top-2 xs:left-1.5 w-11 h-1 relative top-2 border-b border-dashed border-gradientFromHover"></div>
  );
}

export function AnchorText({ handleClose }: { handleClose?: () => any }) {
  return (
    <div
      className="
    
      px-3 pb-3 gotham_font text-sm xs:absolute relative lg:bottom-6 xs:top-12 pt-5 bg-gradientFromHover rounded-2xl 
      text-black
    "
      style={{
        width: isMobile() ? '90vw' : '275px',
        left: isMobile() ? '-5vw' : '',
      }}
    >
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleClose && handleClose();
        }}
        className="absolute right-3 top-3"
      >
        <CloseIconBold></CloseIconBold>
      </button>
      <FormattedMessage
        id="ledger_guide_tip_zh"
        defaultMessage={' '}
      ></FormattedMessage>
      <FormattedMessage
        id="ledger_guide_tip_1"
        defaultMessage={' '}
      ></FormattedMessage>{' '}
      <FormattedMessage id="ledger_guide_tip_quote" defaultMessage={' '} />
      <span className="gotham_bold">
        <FormattedMessage id="support_ledger_tip_new" defaultMessage={' '} />
      </span>
      <FormattedMessage id="ledger_guide_tip_quote" defaultMessage={' '} />{' '}
      <FormattedMessage
        id="ledger_guide_tip_2"
        defaultMessage={' '}
      ></FormattedMessage>
      <span className="gotham_bold mx-1">
        <FormattedMessage id="ledger_guide_tip_3" defaultMessage={' '} />
      </span>
      <FormattedMessage id="ledger_guide_tip_4" defaultMessage={' '} />
      <span className="gotham_bold ml-1">
        <FormattedMessage id="ledger_guide_tip_5" defaultMessage={' '} />
      </span>
      <FormattedMessage id="ledger_guide_tip_6" defaultMessage={' '} />
    </div>
  );
}

export function SupportLedgerGuide({
  handleClose,
}: {
  handleClose?: () => any;
}) {
  const { swapType } = useContext(SwapProContext);

  return (
    <div
      className={`flex xs:items-end xs:flex-col xs:right-0 xs:top-8 top-0 absolute ${
        swapType === SWAP_TYPE.Pro ? 'flex-row' : 'flex-row-reverse'
      } `}
      style={{
        right: swapType === SWAP_TYPE.Pro ? '265px' : '',
        left: swapType === SWAP_TYPE.LITE ? '265px' : '',
      }}
    >
      <AnchorText handleClose={handleClose} />
      <AnchorDash />

      <AnchorDot />
    </div>
  );
}
