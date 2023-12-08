import React, { useEffect, useState } from 'react';
import { CONST_TRANSACTION_SUBMITTING } from 'src/constants/constSwap';
import CustomModal from 'src/components/customModal/customModal';
import { BlueCircleLoading } from 'src/components/layout/Loading';
import './modalTransaction.css';
import { DisplayIcon } from 'src/components/tokens/Icon';
import {
  BsArrowRight,
  IoIosCheckmarkCircleOutline,
} from 'src/components/reactIcons';
import getConfig from 'src/services/config';
import { useTranstionsExcuteDataStore } from 'src/stores/transtionsExcuteData';
import showToast from '../toast/showToast';
import { walletsRejectError } from 'src/utils/wallets-integration';

const { explorerUrl } = getConfig();

export const ToastTransaction = () => {
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const actionData = transtionsExcuteDataStore.getActionData();

  const { transactionResponse, transactionError, status } = actionData || {};

  let errorObj = transactionError;
  if (typeof transactionError === 'string') {
    errorObj = {
      message: transactionError,
    };
  }
  const { walletsTXError, message } = errorObj || {};

  useEffect(() => {
    if (status === 'success') {
      showToast({
        desc: 'Transaction Success',
      });
    }

    if (status === 'error') {
      const errorMsg = walletsTXError || message;
      if (errorMsg) {
        let toast = {
          title: 'Error',
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
        transtionsExcuteDataStore.removeActionData();
        sessionStorage.removeItem('WALLETS_TX_ERROR');
      }
    }
  }, [status]);

  return null;
};

export const ModalTransactionSubmitting = () => {
  const [isOpen, setIsOpen] = useState(false);

  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const actionData = transtionsExcuteDataStore.getActionData();
  const actionCallBackData = transtionsExcuteDataStore.getActionCallBackData();
  const { setActionData, removeActionData } = transtionsExcuteDataStore || {};
  const { status, page, data, transactionResponse, onClose } = actionData || {};
  const { selectTrade } = data || {};

  const isRedirectWalletPage = status === 'success' && !transactionResponse; // myNearWallet
  const isComplete = status === 'success' && transactionResponse;
  const canClose = status === 'success' && transactionResponse;

  useEffect(() => {
    const isOpenModal = ['pending', 'success'].includes(status);
    const isCloseModal = ['error', undefined].includes(status);
    if (isOpenModal) {
      setIsOpen(true);
    }
    if (isOpen && isCloseModal) {
      setIsOpen(false);
    }

    if (status === 'pending') {
      console.info('ModalTransactionSubmitting', status, actionData);
      localStorage.setItem(CONST_TRANSACTION_SUBMITTING, '1');
    } else {
      console.info('ModalTransactionDone', status);
      localStorage.removeItem(CONST_TRANSACTION_SUBMITTING);
    }
  }, [status]);

  let node = null;
  let headerNode = 'Transaction Confirming';
  let footerNode = <div>Confirm the transaction in your wallet.</div>;
  let loadingNode = <BlueCircleLoading />;

  if (selectTrade) {
    node = (
      <>
        <div className={'flex gap-1 items-center'}>
          <DisplayIcon
            token={selectTrade.tokenIn}
            height={'20px'}
            width={'20px'}
          />
          <div>{selectTrade.tokenInAmount}</div>
          <div>{selectTrade.tokenIn.symbol}</div>
        </div>
        <BsArrowRight />
        <div className={'flex gap-1 items-center'}>
          <DisplayIcon
            token={selectTrade.tokenOut}
            height={'20px'}
            width={'20px'}
          />
          <div>{selectTrade.tokenOutAmount}</div>
          <div>{selectTrade.tokenOut.symbol}</div>
        </div>
      </>
    );
  }
  if (isComplete) {
    headerNode = 'Transaction Complete';
    loadingNode = (
      <div className={'text-greenColor'} style={{ fontSize: 60 }}>
        <IoIosCheckmarkCircleOutline />
      </div>
    );
    footerNode = <div>Success</div>;
  }
  if (transactionResponse) {
    console.log('=>transactionResponse', transactionResponse);
    const hash = Array.isArray(transactionResponse)
      ? transactionResponse[0].transaction?.hash
      : transactionResponse?.transaction?.hash;
    footerNode = (
      <div>
        View on{' '}
        <a className={'underline'} href={`${explorerUrl}/txns/${hash}`}>
          Nearblock
        </a>
      </div>
    );
  }

  const handleClose = () => {
    removeActionData();
    setIsOpen(false);
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={canClose && handleClose}
      className={'modal-transaction-submitting'}
    >
      <div className={'-loading-info'}>
        <div className={'mb-4'}>{loadingNode}</div>
        <div>{headerNode}</div>
      </div>

      <div className={'flex flex-col justify-between flex-1 w-full'}>
        <div className={'flex justify-evenly items-center -token-info gap-2'}>
          {node}
        </div>
        <div
          className={'text-center text-primaryText'}
          style={{ fontSize: 14 }}
        >
          {footerNode}
        </div>
      </div>
    </CustomModal>
  );
};
