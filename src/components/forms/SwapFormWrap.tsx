import React, { useEffect, useState, useContext } from 'react';
import Alert from '../alert/Alert';
import SubmitButton, { InsufficientButton } from './SubmitButton';
import { FormattedMessage, useIntl } from 'react-intl';
import SlippageSelector, { StableSlipSelecter } from './SlippageSelector';
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
import { PoolInfo } from '~services/swapV3';
import { OutLinkIcon } from '../../components/icon/Common';
import { REF_FI_POOL_ACTIVE_TAB } from '../../pages/pools/LiquidityPage';
import ReactTooltip from 'react-tooltip';

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
  mostPoolDetail?: PoolInfo;
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
  mostPoolDetail,
}: React.PropsWithChildren<SwapFormWrapProps>) {
  const [error, setError] = useState<Error>();

  const { activeOrder, historyOrder } = useMyOrders();
  const [viewPoolHover, setViewPoolHover] = useState(false);

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

      {<FormattedMessage id="orders" defaultMessage={'Orders'} />}
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
  function goPoolsPage() {
    const poolId = mostPoolDetail?.pool_id;
    if (poolId) {
      const newPoolId = poolId.replace(/\|/g, '@');
      window.open(`/poolV2/${newPoolId}`);
    } else {
      localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, 'v2');
      window.open('/pools');
    }
  }

  const intl = useIntl();

  return (
    <form
      className={`overflow-y-visible  relative bg-swapCardGradient shadow-2xl rounded-2xl px-4 pt-6 pb-7 xsm:py-4 xsm:px-2.5 bg-dark  overflow-x-visible`}
      onSubmit={handleSubmit}
      noValidate
    >
      {title && (
        <>
          <h2 className="formTitle relative bottom-1 z-50 flex items-center xs:justify-end justify-between font-bold text-xl text-white text-left pb-4 xs:pb-2">
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
            {swapMode == SWAP_MODE.LIMIT && (
              <div
                onMouseEnter={() => {
                  setViewPoolHover(true);
                }}
                onMouseLeave={() => {
                  setViewPoolHover(false);
                }}
                onClick={goPoolsPage}
                className={`flex items-center justify-center bg-viewPoolBgColor rounded-md px-3.5 xsm:px-2 py-1 cursor-pointer ${
                  viewPoolHover ? 'text-white' : 'text-primaryText'
                }`}
              >
                <span className="text-xs whitespace-nowrap xsm:hidden">
                  <FormattedMessage
                    id={`${mostPoolDetail?.pool_id ? 'view_pool' : 'v2_pools'}`}
                  ></FormattedMessage>
                </span>
                <span className="text-xs whitespace-nowrap lg:hidden">
                  {mostPoolDetail?.pool_id ? 'Detail' : 'Pools'}
                </span>
                <OutLinkIcon className="ml-2 xsm:ml-1.5"></OutLinkIcon>
              </div>
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
            <div
              className={`ml-1 text-xs w-full ${
                swapMode === SWAP_MODE.LIMIT ? 'mt-6' : ''
              }  `}
              data-type="info"
              data-place="top"
              data-multiline={true}
              data-class="reactTip"
              data-html={true}
              data-tip={`
              <div class="text-xs opacity-50">
                <div 
                  style="font-weight:400",
                >
                ${intl.formatMessage({
                  id: 'v2_paused',

                  defaultMessage: 'REF V2 has been paused for maintenance',
                })}
                </div>
              </div>
            `}
              data-for="v2_paused_pool_tip"
            >
              <SubmitButton
                disabled={
                  !canSubmit ||
                  (swapMode === SWAP_MODE.LIMIT
                    ? !quoteDoneLimit || (showSwapLoading && !loadingTrigger)
                    : showSwapLoading)
                }
                // disabled={
                //   !canSubmit ||
                //   (swapMode === SWAP_MODE.LIMIT ? true : showSwapLoading)
                // }
                label={buttonText || title}
                info={info}
                className={`h-12 ${
                  swapMode == SWAP_MODE.NORMAL ? '-mt-0' : ''
                }`}
                loading={
                  swapMode !== SWAP_MODE.LIMIT
                    ? showSwapLoading
                    : !quoteDoneLimit || (showSwapLoading && !loadingTrigger)
                }
              />
              {/* {swapMode === SWAP_MODE.LIMIT && (
                <ReactTooltip
                  className="w-20"
                  id="v2_paused_pool_tip"
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  textColor="#C6D1DA"
                  effect="solid"
                />
              )} */}
            </div>
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

  const [wrapLoading, setWrapLoading] = useState(false);

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

        setWrapLoading(true);

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
          <h2 className="formTitle relative bottom-1 z-50 flex items-center xs:justify-end justify-between font-bold text-xl text-white text-left pb-2">
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
            ? wrapLoading
            : typeof loadingTrigger !== 'undefined' && loadingTrigger)
        }
        label={buttonText || title}
        info={info}
        loading={
          wrapOperation ? wrapLoading : showSwapLoading || loadingTrigger
        }
        className="py-3 mt-6"
      />
      {reserves}
    </form>
  );
}
