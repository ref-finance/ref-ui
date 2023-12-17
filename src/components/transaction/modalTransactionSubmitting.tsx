import React, { useEffect, useState } from 'react';
import { CONST_TRANSACTION_SUBMITTING } from 'src/constants/constSwap';
import CustomModal from 'src/components/customModal/customModal';
import { BlueCircleLoading } from 'src/components/layout/Loading';
import './modalTransaction.css';
import { DisplayIcon } from 'src/components/tokens/Icon';
import {
  BsArrowRight,
  HiOutlinePlusSm,
  IoArrowUpCircleOutline,
  IoIosCheckmarkCircleOutline,
  TbExternalLink,
} from 'src/components/reactIcons';
import getConfig from 'src/services/config';
import { useTranstionsExcuteDataStore } from 'src/stores/transtionsExcuteData';
import showToast from '../toast/showToast';
import { walletsRejectError } from 'src/utils/wallets-integration';
import IconWithdrawWallet from '../../assets/svg/icon-withdraw-wallet.svg';

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
    // if (status === 'success') {
    //   showToast({
    //     title: 'Transaction Success',
    //   });
    // }

    if (status === 'error') {
      let errorMsg = walletsTXError || message;
      if (typeof errorMsg === 'string') {
        const isUserRejected =
          errorMsg.toLowerCase().startsWith('user reject') ||
          walletsRejectError.includes(errorMsg);
        if (isUserRejected && errorMsg.length > 50) {
          errorMsg = 'User rejected the request';
        }
        let toast = {
          title: 'Error',
          desc: errorMsg,
          isError: true,
          isWarning: false,
        };

        if (isUserRejected) {
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
  const [tokensData, setTokensData] =
    useState<{ token: any; amount?: string | number; symbol?: string }[]>();

  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const actionData = transtionsExcuteDataStore.getActionData();
  const { setActionData, removeActionData } = transtionsExcuteDataStore || {};
  const { status, page, data, transactionResponse, onClose } = actionData || {};
  const { callbackUrl } = transactionResponse || {};
  const { selectTrade, prefix, suffix, tokens, transactionType, headerText } =
    data || {};

  const isRedirectWalletPage = status === 'success' && !transactionResponse; // myNearWallet
  const isComplete = status === 'success' && transactionResponse;
  const canClose = status === 'success' && transactionResponse;
  const isOpenModal =
    ['pending', 'success'].includes(status) || isRedirectWalletPage;
  const isCloseModal = ['error', undefined, null].includes(status);
  const isSkipModal = callbackUrl?.includes('orderbook');
  const transactionTypesToSaveTokens = ['claimFee'];

  useEffect(() => {
    if (isOpenModal && !isSkipModal) {
      setIsOpen(true);
    }
    if (isOpen && isCloseModal) {
      setIsOpen(false);
    }

    if (status === 'pending' || isRedirectWalletPage) {
      console.info('ModalTransactionSubmitting', status, actionData);
      if (
        transactionTypesToSaveTokens.includes(transactionType) &&
        tokens !== undefined
      ) {
        setTokensData(tokens);
      }
      localStorage.setItem(CONST_TRANSACTION_SUBMITTING, '1');
    } else {
      console.info('ModalTransactionDone', status);
      localStorage.removeItem(CONST_TRANSACTION_SUBMITTING);
    }
  }, [status]);

  let node = null;
  let headerNode = headerText || getHeaderText(transactionType, status);
  let footerNode = <div>Confirm the transaction in your wallet.</div>;
  let loadingNode = <BlueCircleLoading />;

  if (transactionType === 'claimFee') {
    node = <ClaimFeeLayout tokensData={tokensData} />;
  } else if (selectTrade) {
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
  } else if (Array.isArray(tokens)) {
    if (transactionType === 'withdraw') {
      node = <WithdrawLayout tokens={tokens} />;
    } else {
      node = tokens.map((d) => {
        const { token, amount, tokenGroup } = d;
        if (d?.node) {
          return d.node;
        } else {
          let tokenNode;
          if (token) {
            tokenNode = (
              <div className={'flex gap-1 items-center'}>
                <DisplayIcon token={token} height={'20px'} width={'20px'} />
                {amount && <div>{amount}</div>}
                <div>{token?.symbol}</div>
              </div>
            );
          }
          if (Array.isArray(tokenGroup)) {
            tokenNode = (
              <div className="flex items-center">
                {tokenGroup.map((d) => (
                  <DisplayIcon
                    token={d}
                    height={'20px'}
                    width={'20px'}
                    className="-ml-1"
                  />
                ))}
              </div>
            );
          }
          return <div>{tokenNode}</div>;
        }
      });
    }
  }

  if (isComplete) {
    if (transactionType === 'withdraw') {
      loadingNode = <IconWithdrawWallet />;
    }
    if (transactionType === 'claimFee') {
      loadingNode = (
        <IoArrowUpCircleOutline
          className={'text-greenColor'}
          style={{ fontSize: 60 }}
        />
      );
    } else {
      loadingNode = (
        <IoIosCheckmarkCircleOutline
          className={'text-greenColor'}
          style={{ fontSize: 60 }}
        />
      );
    }
    footerNode = <div>Success</div>;
  }

  if (transactionResponse) {
    let hash;
    if (transactionResponse?.txHash) {
      hash = transactionResponse?.txHash;
    } else if (Array.isArray(transactionResponse)) {
      hash = transactionResponse[0].transaction?.hash;
    } else if (transactionResponse?.transaction?.hash) {
      hash = transactionResponse?.transaction?.hash;
    }

    if (hash) {
      footerNode = (
        <div className="flex items-center justify-center">
          View on{' '}
          <a
            className={'ml-2 text-baseGreen flex items-center gap-1'}
            href={`${explorerUrl}/txns/${hash}`}
            target="_blank"
          >
            Nearblock
            <TbExternalLink style={{ fontSize: 16 }} />
          </a>
        </div>
      );
    }
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
        <div className={'mb-8'}>{loadingNode}</div>
        <div>{headerNode}</div>
      </div>

      <div className={'flex flex-col justify-between flex-1 w-full'}>
        <div
          className={'flex justify-center items-center -token-info gap-2 mb-5'}
        >
          {prefix}
          {node}
          {suffix}
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

const WithdrawLayout = ({ tokens }) => {
  const node = tokens?.map((d) => {
    const { token, amount } = d || {};
    return (
      <div className="flex gap-1">
        <DisplayIcon token={token} height={'20px'} width={'20px'} /> {amount}{' '}
        {token?.symbol}
      </div>
    );
  });

  return (
    <div
      className={`grid ${
        tokens?.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
      } gap-2`}
    >
      {node}
    </div>
  );
};

const getHeaderText = (transactionType, status) => {
  let node;
  switch (transactionType) {
    case 'claimFee':
      node = 'Claim Fees';
      break;
    case 'withdraw':
      node = 'Withdraw Farm Rewards';
      break;
    default:
      node =
        status === 'pending'
          ? 'Transaction Confirming'
          : 'Transaction Complete';
  }

  return node;
};

const ClaimFeeLayout = ({ tokensData }) => {
  const node = tokensData?.map((d) => {
    const { token, amount, symbol } = d || {};
    if (symbol === '+') {
      return <HiOutlinePlusSm />;
    }
    return (
      <div className="flex gap-1 items-center">
        <DisplayIcon token={token} height={'20px'} width={'20px'} /> {amount}{' '}
        {token?.symbol}
      </div>
    );
  });

  return <div className="flex items-center gap-1">{node}</div>;
};