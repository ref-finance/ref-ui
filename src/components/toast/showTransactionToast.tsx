import { walletsRejectError } from 'src/utils/wallets-integration';
import showToast from 'src/components/toast/showToast';

export const showTransactionErrorToast = (errorMsg, title = 'Error') => {
  let toast = {
    title,
    desc: errorMsg,
    isError: true,
    isWarning: false,
  };

  if (walletsRejectError.includes(errorMsg)) {
    toast.isError = false;
    toast.isWarning = true;
    // toast.desc =
    //   'User rejected the request. Details: \n' +
    //   'NearWallet Tx Signature: User denied transaction signature. ';
  }
  showToast(toast);
};
