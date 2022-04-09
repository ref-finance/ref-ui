import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import getConfig from '../../services/config';
import { FormattedMessage } from 'react-intl';
import { CloseIcon } from '../icon/Actions';
import { isMobile } from '../../utils/device';

export enum TRANSACTION_WALLET_TYPE {
  NEAR_WALLET = 'transactionHashes',
  SENDER_WALLET = 'transactionHashesSender',
}

export enum TRANSACTION_STATE {
  SUCCESS = 'success',
  FAIL = 'fail',
}

export const getURLInfo = () => {
  const search = window.location.search;

  const pathname = window.location.pathname;

  const errorType = new URLSearchParams(search).get('errorType');

  const errorCode = new URLSearchParams(search).get('errorCode');

  const signInErrorType = new URLSearchParams(search).get('signInErrorType');

  const txHashes = (
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.NEAR_WALLET) ||
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.SENDER_WALLET)
  )?.split(',');

  return {
    txHash: txHashes?.pop() || '',
    pathname,
    errorType,
    signInErrorType,
    errorCode,
  };
};

export const swapToast = (txHash: string) => {
  toast(
    <a
      className="text-white w-full h-full pl-1.5"
      href={`${getConfig().explorerUrl}/transactions/${txHash}`}
      target="_blank"
      style={{
        lineHeight: '48px',
      }}
    >
      <FormattedMessage
        id="swap_successful_click_to_view"
        defaultMessage="Swap successful. Click to view"
      />
    </a>,
    {
      autoClose: 8000,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: <CloseIcon />,
      progressStyle: {
        background: '#00FFD1',
        borderRadius: '8px',
      },
      style: {
        background: '#1D2932',
        boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
      },
    }
  );
};

export const failToast = (txHash: string, errorType?: string) => {
  toast(
    <a
      className="text-error w-full h-full pl-1.5 py-1"
      href={`${getConfig().explorerUrl}/transactions/${txHash}`}
      target="_blank"
      style={{
        lineHeight: '20px',
      }}
    >
      <FormattedMessage
        id="transaction_failed"
        defaultMessage="Transaction failed"
      />
      {'. '}
      <br />
      <FormattedMessage id="Type" defaultMessage="Type" />: {` `}
      {errorType}
      {'. '}
      <FormattedMessage id="click_to_view" defaultMessage="Click to view" />
    </a>,
    {
      autoClose: false,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: <CloseIcon />,
      progressStyle: {
        background: '#FF7575',
        borderRadius: '8px',
      },
      style: {
        background: '#1D2932',
        boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
      },
    }
  );
};

export const checkAccountTip = () => {
  toast(
    <span
      className="w-full h-full pl-1.5 text-base"
      style={{
        color: '#C4C4C4',
        width: '286px',
      }}
    >
      <FormattedMessage
        id="ref_account_balance_tip"
        defaultMessage="It seems like an error occurred while adding/removing liquidity to the pool"
      />
    </span>,
    {
      autoClose: false,
      closeOnClick: true,
      hideProgressBar: false,
      closeButton: <CloseIcon />,
      progressStyle: {
        background: '#00FFD1',
        borderRadius: '8px',
      },
      style: {
        background: '#1D2932',
        boxShadow: '0px 0px 10px 10px rgba(0, 0, 0, 0.15)',
        borderRadius: '8px',
        minHeight: '60px',
        margin: 'auto',
        marginTop: isMobile() ? '20px' : 'none',
        width: isMobile() ? '320px' : 'none',
      },
    }
  );
};
