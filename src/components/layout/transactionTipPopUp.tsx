import React from 'react';
import { toast } from 'react-toastify';
import getConfig from '../../services/config';
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

export const senderSignedInToast = (errorType?: string) => {
  toast(
    <div
      className="text-error w-full h-full pl-1.5 py-1"
      style={{
        lineHeight: '20px',
      }}
    >
      <FormattedMessage id="sign_in_error" defaultMessage="Sign in error" />
      {'. '}
      <FormattedMessage id="Type" defaultMessage="Type" />: {` `}
      {errorType} <br />
      <FormattedMessage
        id="please_check_your_account_state"
        defaultMessage="Please check your account state"
      />
    </div>,
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
