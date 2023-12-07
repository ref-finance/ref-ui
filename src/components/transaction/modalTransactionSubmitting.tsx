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
  const actionStatus = transtionsExcuteDataStore.getActionStatus();
  const actionCallBackData = transtionsExcuteDataStore.getActionCallBackData();

  const { transactionResponse, transactionError } = actionCallBackData || {};

  let errorObj = transactionError;
  if (typeof transactionError === 'string') {
    errorObj = {
      message: transactionError,
    };
  }
  const { walletsTXError, message } = errorObj || {};

  useEffect(() => {
    console.info('ToastTransaction', actionStatus, actionCallBackData);
    if (actionStatus === 'success') {
      showToast({
        desc: 'Transaction Success',
      });
    }

    if (actionStatus === 'rejected' || actionStatus === 'none') {
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
      }
    }
  }, [actionStatus]);

  return null;
};

export const ModalTransactionSubmitting = () => {
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const actionStatus = transtionsExcuteDataStore.getActionStatus();
  const actionData = transtionsExcuteDataStore.getActionData();
  const actionCallBackData = transtionsExcuteDataStore.getActionCallBackData();

  const { setactionCallBackData, setActionData, setActionStatus } =
    transtionsExcuteDataStore || {};
  const { selectTrade } = actionData || {};
  const { transactionResponse } = actionCallBackData || {};
  const isComplete = actionStatus === 'resolved';
  const canClose = actionStatus === 'resolved';
  const isOpenModal = ['pending', 'resolved'].includes(actionStatus);

  useEffect(() => {
    console.info('ModalTransactionSubmitting', actionStatus, actionData);
    if (actionStatus === 'pending') {
      localStorage.setItem(CONST_TRANSACTION_SUBMITTING, '1');
    } else {
      localStorage.removeItem(CONST_TRANSACTION_SUBMITTING);
    }

    if (actionStatus === 'none') {
      setActionData(null);
      setactionCallBackData(null);
    }
  }, [actionStatus]);

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
    setActionStatus('none');
  };

  return (
    <CustomModal
      isOpen={isOpenModal}
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
