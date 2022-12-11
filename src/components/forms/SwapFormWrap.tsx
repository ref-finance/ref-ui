import React, { useEffect, useState, useContext } from 'react';
import Alert from '../alert/Alert';
import SubmitButton, { InsufficientButton } from './SubmitButton';
import { FormattedMessage } from 'react-intl';
import SlippageSelector, { StableSlipSelecter } from './SlippageSelector';
import { SwapRefresh, CountdownTimer } from '../../components/icon';
import { wallet } from '~services/near';
import {
  getCurrentWallet,
  WalletContext,
} from '../../utils/wallets-integration';
import { RequestingSmile } from '../icon/CrossSwapIcons';
import { SWAP_MODE } from '../../pages/SwapPage';
import SlippageSelectorForStable from './SlippageSelector';
import { useMyOrders } from '../../state/swapV3';
import { useHistory } from 'react-router-dom';
import { OrderIcon } from '../icon/V3';
import { EstimateSwapView } from '../../services/swap';

interface SwapFormWrapProps {
  title?: string;
  buttonText?: string;
  canSubmit?: boolean;
  slippageTolerance: number;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  info?: string | JSX.Element;
  showElseView?: boolean;
  swapTab?: JSX.Element;
  elseView?: JSX.Element;
  crossSwap?: boolean;
  requested?: boolean;
  tokensTitle?: JSX.Element;
  onChange: (slippage: number) => void;
  quoteDoneLimit?: boolean;
  selectTodos?: EstimateSwapView[];
  loading?: {
    loadingData: boolean;
    setLoadingData: (loading: boolean) => void;
    loadingTrigger: boolean;
    setLoadingTrigger: (loaidngTrigger: boolean) => void;
    loadingPause: boolean;
    setLoadingPause: (pause: boolean) => void;
    showSwapLoading: boolean;
    setShowSwapLoading: (swapLoading: boolean) => void;
  };
  useNearBalance: string;
  swapMode?: SWAP_MODE;
  supportLedger?: boolean;
  setSupportLedger?: (e?: any) => void;
  showAllResults?: boolean;
  reserves?: JSX.Element;
  wrapOperation?: boolean;
  isInsufficient?: boolean;
}

export default function SwapFormWrap({
  children,
  title,
  buttonText,
  slippageTolerance,
  canSubmit = true,
  onSubmit,
  info,
  crossSwap,
  showElseView,
  elseView,
  onChange,
  swapTab,
  loading,
  useNearBalance,
  swapMode,
  supportLedger,
  setSupportLedger,
  quoteDoneLimit,
  reserves,
  isInsufficient,
}: React.PropsWithChildren<SwapFormWrapProps>) {
  const [error, setError] = useState<Error>();

  const { activeOrder, historyOrder } = useMyOrders();

  const history = useHistory();

  const OrderButton = swapMode === SWAP_MODE.LIMIT && activeOrder && (
    <button
      onClick={(e) => {
        e.stopPropagation();
        e.preventDefault();
        history.push('/myOrder');
      }}
      className="w-full h-12 flex items-center justify-center bg-switchIconBgColor hover:bg-limitOrderButtonHover border border-limitOrderBorderColor hover:border-0 mt-4 rounded-lg text-greenColor text-base gotham_bold xsm:mr-1.5 xsm:mt-6"
    >
      <OrderIcon />
      <span className="mx-2 xs:mx-1 md:mx-1">
        {activeOrder.length > 0 ? activeOrder.length : null}
      </span>

      {<FormattedMessage id="orders" defaultMessage={'Order(s)'} />}
    </button>
  );

  const {
    loadingTrigger,
    setLoadingPause,
    showSwapLoading,
    setShowSwapLoading,
  } = loading || {};

  useEffect(() => {
    loadingTrigger && setShowSwapLoading && setShowSwapLoading(true);
    !loadingTrigger && setShowSwapLoading && setShowSwapLoading(false);
  }, [loadingTrigger]);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSignedIn) {
      try {
        setShowSwapLoading && setShowSwapLoading(true);
        setShowSwapLoading && setLoadingPause(true);
        onSubmit(event);
      } catch (err) {
        setError(err);
      }
    }
  };

  return (
    <form
      className={`overflow-y-visible  relative bg-swapCardGradient shadow-2xl rounded-2xl px-4 pt-6 pb-7 xsm:py-4 xsm:px-2.5 bg-dark  overflow-x-visible`}
      onSubmit={handleSubmit}
      noValidate
    >
      {title && (
        <>
          <h2 className="formTitle relative bottom-1 flex items-center xs:justify-end justify-between font-bold text-xl text-white text-left pb-4 xs:pb-2">
            {swapTab}
            {swapMode !== SWAP_MODE.LIMIT && (
              <SlippageSelector
                slippageTolerance={slippageTolerance}
                onChange={onChange}
                supportLedger={supportLedger}
                setSupportLedger={setSupportLedger}
                validSlippageList={
                  swapMode === SWAP_MODE.NORMAL ? null : [0.05, 0.1, 0.2]
                }
                swapMode={swapMode}
              />
            )}
          </h2>
        </>
      )}
      {error && <Alert level="warn" message={error.message} />}
      {children}
      {showElseView && elseView ? (
        elseView
      ) : (
        <div className="flex flex-col items-center xsm:flex-row-reverse">
          {!isInsufficient ? (
            <SubmitButton
              disabled={
                !canSubmit ||
                (swapMode === SWAP_MODE.LIMIT
                  ? !quoteDoneLimit || (showSwapLoading && !loadingTrigger)
                  : showSwapLoading)
              }
              label={buttonText || title}
              info={info}
              className={`h-12 ${swapMode == SWAP_MODE.NORMAL ? '-mt-0' : ''}`}
              loading={
                swapMode !== SWAP_MODE.LIMIT
                  ? showSwapLoading
                  : !quoteDoneLimit || (showSwapLoading && !loadingTrigger)
              }
            />
          ) : (
            <InsufficientButton divClassName="h-12 mt-6 w-full"></InsufficientButton>
          )}
          {OrderButton}
        </div>
      )}
      {reserves}
    </form>
  );
}

export function CrossSwapFormWrap({
  children,
  title,
  buttonText,
  slippageTolerance,
  canSubmit = true,
  onSubmit,
  info,
  crossSwap,
  showElseView,
  elseView,
  swapTab,
  onChange,
  loading,
  useNearBalance,
  supportLedger,
  tokensTitle,
  setSupportLedger,
  reserves,
  selectTodos,
  wrapOperation,
}: React.PropsWithChildren<SwapFormWrapProps>) {
  const [error, setError] = useState<Error>();
  const {
    loadingData,
    setLoadingData,
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
    setLoadingPause,
    showSwapLoading,
    setShowSwapLoading,
  } = loading || {};

  useEffect(() => {
    loadingTrigger && setShowSwapLoading && setShowSwapLoading(true);
    !loadingTrigger && setShowSwapLoading && setShowSwapLoading(false);
  }, [loadingTrigger]);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSignedIn) {
      try {
        setShowSwapLoading && setShowSwapLoading(true);
        setShowSwapLoading && setLoadingPause(true);
        onSubmit(event);
      } catch (err) {
        setError(err);
      }
    }
  };
  return (
    <form
      className={`overflow-y-visible  relative bg-swapCardGradient shadow-2xl rounded-2xl px-4 pt-6 pb-7 xsm:py-4 xsm:px-2.5 bg-dark  overflow-x-visible`}
      onSubmit={handleSubmit}
    >
      {title && (
        <>
          <h2 className="formTitle relative bottom-1 flex items-center xs:justify-end justify-between font-bold text-xl text-white text-left pb-2">
            {swapTab}

            <SlippageSelector
              slippageTolerance={slippageTolerance}
              onChange={onChange}
              supportLedger={supportLedger}
              setSupportLedger={setSupportLedger}
            />
          </h2>
          {tokensTitle}
        </>
      )}
      {error && <Alert level="warn" message={error.message} />}
      {children}

      <SubmitButton
        disabled={
          !canSubmit ||
          (wrapOperation
            ? false
            : typeof loadingTrigger !== 'undefined' && loadingTrigger)
        }
        label={buttonText || title}
        info={info}
        loading={wrapOperation ? false : showSwapLoading || loadingTrigger}
        className="py-3"
      />
      {reserves}
    </form>
  );
}
