import React from 'react';
import { toast } from 'react-toastify';
import getConfig from '~services/config';
import { FormattedMessage } from 'react-intl';
import { CloseIcon } from '../icon/Actions';

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

  const txHashes = (
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.NEAR_WALLET) ||
    new URLSearchParams(search).get(TRANSACTION_WALLET_TYPE.SENDER_WALLET)
  )?.split(',');

  return { txHash: txHashes?.pop() || '', pathname, errorType };
};

export const swapToast = (txHash: string) => {
  toast(
    <a
      className="text-white"
      href={`${getConfig().explorerUrl}/transactions/${txHash}`}
      target="_blank"
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
      className="text-error"
      href={`${getConfig().explorerUrl}/transactions/${txHash}`}
      target="_blank"
    >
      <FormattedMessage
        id="transaction_failed"
        defaultMessage="Transaction failed"
      />
      {'. '}
      <FormattedMessage id="Type" defaultMessage="Type" />:{errorType}
      {'. '}
      <FormattedMessage id="click_to_view" defaultMessage="Click to view" />
    </a>,
    {
      autoClose: 8000,
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
