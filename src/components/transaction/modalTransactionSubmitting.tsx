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

const { explorerUrl } = getConfig();
export const modalTransactionSubmitting = () => {
  const [transactionSubmitting, setTransactionSubmitting] = useState(false);

  useEffect(() => {
    if (getTransactionSubmitting()) {
      setTransactionSubmitting(true);
      updateTransactionSubmitting(false);
    }
  }, []);

  const updateTransactionSubmitting = (status: boolean) => {
    if (status) {
      localStorage.setItem(CONST_TRANSACTION_SUBMITTING, '1');
      setTransactionSubmitting(true);
    } else {
      localStorage.removeItem(CONST_TRANSACTION_SUBMITTING);
      setTransactionSubmitting(false);
    }
  };

  const getTransactionSubmitting = () => {
    return localStorage.getItem(CONST_TRANSACTION_SUBMITTING);
  };

  return { transactionSubmitting, updateTransactionSubmitting };
};

export const ModalTransactionSubmitting = ({ isOpen, onClose, data }) => {
  const { selectTrade, transactionResponse, isSuccess } = data || {};

  let node;
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
  if (isSuccess) {
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

  const canClose = isSuccess;
  return (
    <CustomModal
      isOpen={isOpen}
      onClose={canClose && onClose}
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
