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
import {
  removeSenderLoginRes,
  walletsRejectError,
} from '../utils/wallets-integration';
import { NEAR_WITHDRAW_KEY } from '../components/forms/WrapNear';
import { useTranstionsExcuteDataStore } from 'src/stores/transtionsExcuteData';

export const useGlobalPopUp = (globalState: any) => {
  const {
    txHash,
    pathname,
    errorType,
    errorCode,
    errorMessage,
    signInErrorType,
    txHashes,
  } = getURLInfo();
  const processTransactionSuccess = useTranstionsExcuteDataStore(
    (state) => state.processTransactionSuccess
  );
  const processTransactionError = useTranstionsExcuteDataStore(
    (state) => state.processTransactionError
  );

  const isSignedIn = globalState.isSignedIn;

  const walletsTXError = sessionStorage.getItem('WALLETS_TX_ERROR');

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
          if (!errorType) {
            let transactionId = sessionStorage.getItem('TRANSACTION_ID');
            if (transactionId === 'undefined' || !transactionId) {
              transactionId = 'redirectId';
            }
            processTransactionSuccess({
              transactionResponse: {
                response: {},
                txHash,
                callbackUrl: window.location.origin + pathname,
              },
              transactionId: transactionId,
            });
            window.history.replaceState(
              {},
              '',
              window.location.origin + pathname
            );
            sessionStorage.removeItem('TRANSACTION_ID');
          }

          // if (isWrapNear) {
          //   !errorType && swapToast(txHash);
          //   window.history.replaceState(
          //     {},
          //     '',
          //     window.location.origin + pathname
          //   );
          // }
        });
    }
  }, [txHash, isSignedIn]);

  useEffect(() => {
    let txError = walletsTXError;
    if (errorCode) {
      txError =
        (errorMessage && decodeURI(errorMessage)) || errorCode || errorType;
    }

    if (txError) {
      let transactionId = sessionStorage.getItem('TRANSACTION_ID');
      if (transactionId === 'undefined' || !transactionId) {
        transactionId = 'redirectId';
      }
      processTransactionError({
        error: {
          message: txError,
        },
        transactionId: transactionId,
      });
      sessionStorage.removeItem('WALLETS_TX_ERROR');
    }
  }, [walletsTXError, errorCode]);
};
