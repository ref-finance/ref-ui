import React from 'react';
import { toast, ToastContainer } from 'react-toastify';
import getConfig from '../../services/config';
import { FormattedMessage } from 'react-intl';
import { CloseIcon } from '../icon/Actions';
import { isMobile } from '../../utils/device';
import { checkTransaction } from '../../services/swap';
import { getCurrentWallet } from '~utils/sender-wallet';

export enum TRANSACTION_WALLET_TYPE {
  NEAR_WALLET = 'transactionHashes',
  SENDER_WALLET = 'transactionHashesSender',
}

export enum TRANSACTION_ERROR_TYPE {
  SLIPPAGE_VIOLATION = 'Slippage Violation',
  INVALID_PARAMS = 'Invalid Params',
}

const ERROR_PATTERN = {
  slippageErrorPattern: /ERR_MIN_AMOUNT|slippage error/i,
  invaliParamsErrorPattern: /invalid params/i,
};

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
    txHash:
      txHashes && txHashes.length > 0 ? txHashes[txHashes.length - 1] : '',
    pathname,
    errorType,
    signInErrorType,
    errorCode,
    txHashes,
  };
};

export const swapToast = (txHash: string) => {
  toast(
    <a
      className="text-white w-full h-full pl-1.5"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
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
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
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

export const checkCrossSwapTransactions = async (txHashes: string[]) => {
  const lastTx = txHashes.pop();
  const txDetail: any = await checkTransaction(lastTx);

  if (txHashes.length > 0) {
    // judge if aurora call
    const isAurora = txDetail.transaction?.receiver_id === 'aurora';

    const ifCall =
      txDetail.transaction?.actions?.length === 1 &&
      txDetail.transaction?.actions?.[0]?.FunctionCall?.method_name === 'call';

    if (isAurora && ifCall) {
      const parsedOut = parsedTransactionSuccessValue(txDetail);

      const erc20FailPattern = /burn amount exceeds balance/i;

      if (
        erc20FailPattern.test(parsedOut) ||
        (parsedOut.toString().trim().length === 14 &&
          parsedOut.toString().trim().indexOf('|R') !== -1)
      ) {
        return {
          hash: lastTx,
          status: false,
          errorType: 'Withdraw Failed',
        };
      } else {
        const secondLastHash = txHashes.pop();
        const secondDetail = await checkTransaction(secondLastHash);

        const slippageErrprReg = /INSUFFICIENT_OUTPUT_AMOUNT/i;
        const expiredErrorReg = /EXPIRED/i;

        const parsedOutput = parsedTransactionSuccessValue(secondDetail);

        if (slippageErrprReg.test(parsedOutput)) {
          return {
            hash: secondLastHash,
            status: false,
            errorType: 'Slippage Violation',
          };
        } else if (expiredErrorReg.test(parsedOutput)) {
          return {
            hash: secondLastHash,
            status: false,
            errorType: 'Expired',
          };
        } else {
          return {
            hash: lastTx,
            status: true,
          };
        }
      }
    } else {
      // normal swap judgement

      const errorMessasge = getErrorMessage(txDetail);

      if (errorMessasge)
        return {
          status: false,
          hash: lastTx,
          errorType: errorMessasge,
        };
      else {
        return {
          status: true,
          hash: lastTx,
        };
      }
    }

    // validate if last tx is success
  } else {
    const errorMessasge = getErrorMessage(txDetail);

    if (errorMessasge)
      return {
        status: false,
        hash: lastTx,
        errorType: errorMessasge,
      };
    else {
      return {
        status: true,
        hash: lastTx,
      };
    }
  }
};

export const parsedTransactionSuccessValue = (res: any) => {
  const status: any = res.status;

  const data: string | undefined = status.SuccessValue;

  if (data) {
    const buff = Buffer.from(data, 'base64');
    const parsedData = buff.toString('ascii');
    return parsedData;
  }
};
export const usnBuyAndSellToast = (txHash: string) => {
  toast(
    <a
      className="text-white w-full h-full pl-1.5"
      href={`${getConfig().explorerUrl}/txns/${txHash}`}
      target="_blank"
      style={{
        lineHeight: '48px',
      }}
    >
      <FormattedMessage
        id="usn_successful_click_to_view"
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

export const getErrorMessage = (res: any) => {
  const isSlippageError = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.slippageErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  const isInvalidAmountError = res.receipts_outcome.some((outcome: any) => {
    return ERROR_PATTERN.invaliParamsErrorPattern.test(
      outcome?.outcome?.status?.Failure?.ActionError?.kind?.FunctionCallError
        ?.ExecutionError
    );
  });

  if (isSlippageError) {
    return TRANSACTION_ERROR_TYPE.SLIPPAGE_VIOLATION;
  } else if (isInvalidAmountError) {
    return TRANSACTION_ERROR_TYPE.INVALID_PARAMS;
  } else {
    return null;
  }
};
