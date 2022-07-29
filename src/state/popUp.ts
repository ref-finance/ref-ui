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
import { NEAR_WITHDRAW_KEY } from '../components/forms/WrapNear';

export const useGlobalPopUp = (globalState: any) => {
  const { txHash, pathname, errorType, signInErrorType, txHashes } =
    getURLInfo();
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res) => {
        let displayErrorMessage = errorType;
        const errorMessasge = getErrorMessage(res);

        if (errorMessasge) displayErrorMessage = errorMessasge;

        if (displayErrorMessage) {
          failToast(txHash, displayErrorMessage);

          window.history.replaceState(
            {},
            '',
            window.location.origin + pathname
          );
        }
      });
    }

    if (signInErrorType) {
      senderSignedInToast(signInErrorType);
      removeSenderLoginRes();
      window.history.replaceState({}, '', window.location.origin + pathname);
    }
  }, [signInErrorType, txHash, isSignedIn]);
  // for usn start
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

          const fromWrapNear =
            sessionStorage.getItem(NEAR_WITHDRAW_KEY) === '1';

          sessionStorage.removeItem(NEAR_WITHDRAW_KEY);
          return {
            isUSN: methodName == 'buy' || methodName == 'sell',
            isSlippageError,
            isNearWithdraw:
              methodName == 'near_withdraw' &&
              fromWrapNear &&
              txHashes.length === 1,
            isNearDeposit:
              methodName == 'near_deposit' && txHashes.length === 1,
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
