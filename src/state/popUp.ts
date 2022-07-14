import React, { useEffect } from 'react';
import {
  getURLInfo,
  usnBuyAndSellToast,
  swapToast,
} from '../components/layout/transactionTipPopUp';
import { checkTransaction } from '../services/stable-swap';
import {
  getErrorMessage,
  failToast,
} from '../components/layout/transactionTipPopUp';
import { senderSignedInToast } from '../components/layout/senderSignInPopUp';
import { removeSenderLoginRes } from '../utils/wallets-integration';

export const useGlobalPopUp = (globalState: any) => {
  const { txHash, pathname, errorType, signInErrorType } = getURLInfo();

  useEffect(() => {
    if (signInErrorType) {
      senderSignedInToast(signInErrorType);
      removeSenderLoginRes();
      window.history.replaceState({}, '', window.location.origin + pathname);
    }
  }, [signInErrorType]);
  // for usn start
  const isSignedIn = globalState.isSignedIn;
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash)
        .then((res: any) => {
          const slippageErrorPattern = /ERR_MIN_AMOUNT|slippage error/i;

          const isSlippageError = res.receipts_outcome.some((outcome: any) => {
            return slippageErrorPattern.test(
              outcome?.outcome?.status?.Failure?.ActionError?.kind
                ?.FunctionCallError?.ExecutionError
            );
          });
          const transaction = res.transaction;
          const methodName =
            transaction?.actions[0]?.['FunctionCall']?.method_name;
          return {
            isUSN: methodName == 'buy' || methodName == 'sell',
            isSlippageError,
            isNearWithdraw: methodName == 'near_withdraw',
            isNearDeposit: methodName == 'near_deposit',
          };
        })
        .then(({ isUSN, isSlippageError, isNearWithdraw, isNearDeposit }) => {
          if (isUSN || isNearWithdraw || isNearDeposit) {
            isUSN &&
              !isSlippageError &&
              !errorType &&
              usnBuyAndSellToast(txHash);
            (isNearWithdraw || isNearDeposit) &&
              !errorType &&
              swapToast(txHash);
            window.history.replaceState(
              {},
              '',
              window.location.origin + pathname
            );
          }
        });
    }
  }, [txHash, isSignedIn]);
  // for usn end
};
