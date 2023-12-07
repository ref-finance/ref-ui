import {
  failToast,
  getErrorMessage,
  getURLInfo,
  parsedTransactionSuccessValue,
} from 'src/components/layout/transactionTipPopUp';
import { useEffect, useState } from 'react';
import { checkTransaction } from 'src/services/stable-swap';

type ResultProps = {
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string;
  errorCode?: string;
};

export const useTransactionCallbackUrlResult = () => {
  const [transactionResult, setTransactionResult] = useState<ResultProps>();
  const urlInfo = getURLInfo();
  const {
    txHash,
    pathname,
    errorType,
    errorCode,
    errorMessage,
    signInErrorType,
    txHashes,
  } = urlInfo;

  useEffect(() => {
    if (txHash) {
      parseTransactionResult(txHash, urlInfo).then((r) => {
        setTransactionResult(r);
      });
    }
    // else if (errorType || errorCode || errorMessage) {
    //   setTransactionResult({
    //     errorMessage:
    //       (errorMessage && decodeURI(errorMessage)) || errorCode || errorType,
    //     isError: true,
    //   });
    // }
  }, [txHash, errorType, errorCode, errorMessage]);

  return { transactionResult };
};

const parseTransactionResult = async (txHash, urlInfo) => {
  try {
    let { txHash, errorMessage, errorType, errorCode, txHashes } =
      urlInfo || {};
    const response = await checkTransaction(txHash);
    const result: any = response;

    if (errorMessage) {
      errorMessage = decodeURI(errorMessage);
    }
    if (errorCode) {
      result.errorCode = errorCode;
    }
    result.errorMessage =
      getErrorMessage(response) || errorMessage || errorCode || errorType;
    if (result.errorMessage) {
      result.isError = true;
    } else {
      const successValue = parsedTransactionSuccessValue(response);
      if (successValue && successValue !== '0') {
        result.isSuccess = true;
      }
    }

    return result;
  } catch (e) {
    throw e;
  }
};
