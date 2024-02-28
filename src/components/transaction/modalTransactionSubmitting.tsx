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
import {
  constTransactionPage,
  useTranstionsExcuteDataStore,
} from 'src/stores/transtionsExcuteData';
import showToast from '../toast/showToast';
import {
  getCurrentWallet,
  walletsRejectError,
} from 'src/utils/wallets-integration';
import IconWithdrawWallet from '../../assets/svg/icon-withdraw-wallet.svg';
import { useWalletStore } from 'src/stores/loginAccountData';
import { CONST_MYNEAR_TRANSACTIONS } from 'src/constants/constLocalStorage';

const { explorerUrl } = getConfig();

export const ModalTransactionSubmitting = () => {
  const [transactionModals, setTransactionModals] = useState<any>({});
  const wallet = useWalletStore((state) => state.wallet);
  const transtionsExcuteDataStore = useTranstionsExcuteDataStore();
  const actionData = transtionsExcuteDataStore.getActionData();
  let actionData2 = actionData && JSON.parse(JSON.stringify(actionData));

  const { transactionId, status, transactionError, transactionResponse } =
    actionData || {};
  const isRedirectWalletPage =
    ['success', 'pending'].includes(actionData?.status) && !transactionResponse; // myNearWallet submitting

  if (wallet?.id === 'my-near-wallet' && isRedirectWalletPage) {
    actionData.status = 'pending';
    localStorage.setItem(CONST_MYNEAR_TRANSACTIONS, JSON.stringify(actionData));
  }

  const isShowingHereModal =
    wallet?.id === 'here-wallet' && actionData.status === 'pending';
  const disableTransactionModal = isShowingHereModal;

  useEffect(() => {
    if (transactionId && !disableTransactionModal) {
      if (['error', 'success'].includes(actionData?.status)) {
        if (wallet?.id === 'my-near-wallet') {
          const transactionsData = localStorage.getItem(
            CONST_MYNEAR_TRANSACTIONS
          );
          const parsedData = JSON.parse(transactionsData);
          if (parsedData) {
            actionData2 = actionData || {};
            actionData2.data = parsedData.data;
            localStorage.removeItem(CONST_MYNEAR_TRANSACTIONS);
          }
        }
      }

      setTransactionModals((d) => {
        return {
          ...d,
          [transactionId]: {
            transtionsExcuteDataStore,
            actionData: actionData2,
            isUserClose: !!d[transactionId]?.isUserClose,
          },
        };
      });
    }
  }, [transactionId, status, wallet]);

  const handleModalClose = (transactionId) => {
    setTransactionModals((d) => {
      delete d[transactionId];
      return { ...d };
    });
  };

  const handleUserCloseModal = (transactionId) => {
    setTransactionModals((d) => {
      d[transactionId] = {
        transtionsExcuteDataStore,
        actionData: actionData2,
        isUserClose: true,
      };
      return { ...d };
    });
  };

  const resetModalTransactions = () => {
    setTransactionModals({});
  };

  return Object.entries(transactionModals).map(
    ([key, value]: [any, any], i) => {
      const { transtionsExcuteDataStore, actionData, isUserClose } =
        value || {};
      return (
        <ModalTransactionContent
          {...{
            transtionsExcuteDataStore: value?.transtionsExcuteDataStore,
            actionData: value?.actionData,
            isUserClose: value?.isUserClose,
            currentTransaction: transactionModals,
            wallet,
            isOpen: !isUserClose,
            setIsOpen: () => {},
          }}
          key={i}
          onModalClose={() => handleModalClose(key)}
          onUserCloseModal={() => handleUserCloseModal(key)}
          onResetModalTransactions={resetModalTransactions}
        />
      );
    }
  );
};

export const ModalTransactionContent = ({
  onModalClose,
  transtionsExcuteDataStore,
  actionData,
  onUserCloseModal,
  onResetModalTransactions,
  isUserClose,
  wallet,
}: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [tokensData, setTokensData] =
    useState<{ token: any; amount?: string | number; symbol?: string }[]>();
  const [transactionData, setTransactionData] = useState();
  const { setActionData, removeActionData } = transtionsExcuteDataStore || {};

  const {
    status,
    page,
    data,
    transactionResponse,
    transactionError,
    transactionId,
    onClose,
  } = actionData || {};
  const { callbackUrl } = transactionResponse || {};
  const {
    selectTrade,
    prefix,
    suffix,
    tokens,
    transactionType,
    headerText,
    className,
  } = data || {};

  const isRedirectWalletPage =
    actionData?.status === 'success' && !transactionResponse; // myNearWallet
  const isComplete = actionData?.status === 'success';
  const canClose =
    true || (actionData?.status === 'success' && transactionResponse);

  const isSkipModal = callbackUrl?.includes('orderbook');
  const isHereSubmitting = wallet?.id === 'here-wallet' && !transactionResponse;

  useEffect(() => {
    console.info(
      'statusChanged==>',
      status,
      isComplete,
      transactionId,
      transactionResponse?.transactionId,
      actionData,
      tokens
    );

    if (status) {
      if (status === 'pending' || isRedirectWalletPage) {
        !isHereSubmitting && setIsOpen(true);
        // setIsUserCloseModal(false);
        setTokensData(tokens);
        setTransactionData(actionData);
      }

      if (['error'].includes(status)) {
        isOpen && setIsOpen(false);
        showTransactionToast(actionData, transactionData);
        onModalClose();
      }

      if (status === 'success') {
        if (isUserClose) {
          showTransactionToast(actionData, transactionData);
        } else if (!isSkipModal) {
          setIsOpen(true);
        }
      }
    }
    if (status === null) {
      setIsOpen(false);
      onModalClose();
    }
  }, [status]);

  const handleClose = () => {
    removeActionData();
    setIsOpen(false);
    // setIsUserCloseModal(true);
    onUserCloseModal();
    if (status === 'success') {
      onResetModalTransactions();
    }
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  let node = null;
  const headerNode = headerText || getHeaderText(transactionType, status);
  let footerNode = <div>Confirm the transaction in your wallet.</div>;
  let loadingNode = <BlueCircleLoading />;

  if (transactionType === 'claimFee') {
    node = (
      <ClaimFeeLayout tokensData={tokensData?.length ? tokensData : tokens} />
    );
  } else if (transactionType === 'withdraw') {
    node = (
      <WithdrawLayout tokensData={tokensData?.length ? tokensData : tokens} />
    );
  } else {
    node = (
      <CommonLayout tokensData={tokensData?.length ? tokensData : tokens} />
    );
  }

  if (isComplete) {
    if (transactionType === 'withdraw') {
      loadingNode = <IconWithdrawWallet />;
    } else if (transactionType === 'claimFee') {
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
            rel="noreferrer"
          >
            Nearblocks
            <TbExternalLink style={{ fontSize: 16 }} />
          </a>
        </div>
      );
    }
  }

  return (
    <CustomModal
      isOpen={isOpen}
      onClose={canClose && handleClose}
      className={`modal-transaction-submitting gantari_font ${className || ''}`}
    >
      <div className={'-loading-info'}>
        <div className={'mb-8'}>{loadingNode}</div>
        <div className={'gantari_font'} style={{ fontSize: 20 }}>
          {headerNode}
        </div>
      </div>

      <div className={'flex flex-col justify-between flex-1 w-full'}>
        <div
          className={'flex justify-center items-center -token-info gap-2 mb-5'}
          style={{ maxWidth: 500 }}
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

const WithdrawLayout = ({ tokensData }: any) => {
  const node = tokensData?.map((d, i) => {
    const { token, amount } = d || {};
    return (
      <div className="flex gap-1 display-token" key={i}>
        <DisplayIcon token={token} height={'20px'} width={'20px'} /> {amount}{' '}
        {token?.symbol}
      </div>
    );
  });

  return (
    <div
      className={`grid ${
        tokensData?.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
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
      switch (status) {
        case 'pending':
          node = 'Transaction Confirming';
          break;
        case 'success':
          node = 'Transaction Complete';
          break;
        case 'error':
          node = 'Transaction Failed';
          break;
      }
  }

  return node;
};

const ClaimFeeLayout = ({ tokensData }: any) => {
  const node = tokensData?.map((d, i) => {
    const { token, amount, symbol } = d || {};
    if (symbol === '+') {
      return <HiOutlinePlusSm key={i} />;
    }
    if (symbol === '>') {
      return <BsArrowRight key={i} />;
    }
    return (
      <div className="flex gap-1 items-center display-token" key={i}>
        <DisplayIcon token={token} height={'20px'} width={'20px'} /> {amount}{' '}
        {token?.symbol}
      </div>
    );
  });

  return (
    <div className="flex flex-wrap justify-center items-center gap-1">
      {node}
    </div>
  );
};

const CommonLayout = ({ tokensData }: any) => {
  const node = tokensData?.map((d, i) => {
    const { token, amount, symbol, tokenGroup } = d || {};
    if (Array.isArray(tokenGroup)) {
      return (
        <div className="flex items-center" key={i}>
          {tokenGroup.map((d, i2) => (
            <DisplayIcon
              key={i2}
              token={d}
              height={'20px'}
              width={'20px'}
              className="-ml-1"
            />
          ))}
        </div>
      );
    }

    if (symbol === '+') {
      return <HiOutlinePlusSm key={i} />;
    }
    if (symbol === '>') {
      return <BsArrowRight key={i} />;
    }
    return (
      <div
        className="flex gap-1 items-center display-token"
        key={token?.symbol + amount}
      >
        <DisplayIcon
          token={token}
          height={'20px'}
          width={'20px'}
          style={{ marginTop: -3 }}
        />{' '}
        {amount} {token?.symbol}
      </div>
    );
  });

  return <div className="flex items-center gap-1">{node}</div>;
};

const showTransactionToast = (actionData, transactionData) => {
  const { transactionError, status, data } = actionData;
  const { transactionType } = transactionData?.data || {};

  let errorObj = transactionError;
  if (typeof transactionError === 'string') {
    errorObj = {
      message: transactionError,
    };
  }
  const { walletsTXError, message } = errorObj || {};

  if (status === 'success') {
    let title = 'Transaction Success';
    if (transactionType === 'claimFee') {
      title = 'Claim Successfully!';
    }
    if (transactionType === 'withdraw') {
      title = 'Withdrawal Successfully!';
    }
    showToast({
      title,
    });
  } else if (status === 'error') {
    let errorMsg = walletsTXError || message;
    if (typeof errorMsg === 'string') {
      const isUserRejected =
        errorMsg.toLowerCase().startsWith('user reject') ||
        walletsRejectError.includes(errorMsg);
      if (isUserRejected && errorMsg.length > 50) {
        errorMsg = 'User rejected the request';
      }
      const toast = {
        title: 'Error',
        desc: errorMsg,
        isError: true,
        isWarning: false,
        className: 'toast-with-desc',
      };

      if (isUserRejected) {
        toast.isError = false;
        toast.isWarning = true;
        // toast.desc =
        //   'User rejected the request. Details: \n' +
        //   'NearWallet Tx Signature: User denied transaction signature. ';
      }

      showToast(toast);
      //transtionsExcuteDataStore.removeActionData();
      sessionStorage.removeItem('WALLETS_TX_ERROR');
    }
  }
};
