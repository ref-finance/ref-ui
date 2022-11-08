import React, { useEffect } from 'react';
import {
  getURLInfo,
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
import { failToastAccount } from '../components/layout/transactionTipPopUp';

export const useGlobalPopUp = (globalState: any) => {
  const { txHash, pathname, errorType, signInErrorType, txHashes } =
    getURLInfo();
  const isSignedIn = globalState.isSignedIn;

  const isWalletsTXError = !!sessionStorage.getItem('WALLETS_TX_ERROR');

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
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash)
        .then((res: any) => {
          const transaction = res.transaction;
          const methodName =
            transaction?.actions[0]?.['FunctionCall']?.method_name;

          const isWrapNearNeth = res?.receipts?.some((r: any) => {
            const method_name =
              r?.receipt?.Action?.actions?.[0]?.FunctionCall?.method_name;

            return (
              method_name === 'near_deposit' || method_name === 'near_withdraw'
            );
          });

          const fromWrapNear =
            sessionStorage.getItem(NEAR_WITHDRAW_KEY) === '1';

          const isWrapNear =
            fromWrapNear &&
            (methodName === 'wrap_near' ||
              methodName === 'near_deposit' ||
              isWrapNearNeth) &&
            txHashes?.length === 1;

          sessionStorage.removeItem(NEAR_WITHDRAW_KEY);

          return {
            isWrapNear,
          };
        })
        .then(({ isWrapNear }) => {
          if (isWrapNear) {
            !errorType && swapToast(txHash);
            window.history.replaceState(
              {},
              '',
              window.location.origin + pathname
            );
          }
        });
    }
  }, [txHash, isSignedIn]);

  useEffect(() => {
    if (isWalletsTXError) {
      failToastAccount();
      sessionStorage.removeItem('WALLETS_TX_ERROR');
    }
  }, [isWalletsTXError]);
};
