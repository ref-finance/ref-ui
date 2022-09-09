import React, { useEffect, useState, useContext } from 'react';
import Alert from '../alert/Alert';
import SubmitButton from './SubmitButton';
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
  requestingTrigger?: boolean;
  quoteDoneLimit?: boolean;
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
}: React.PropsWithChildren<SwapFormWrapProps>) {
  const [error, setError] = useState<Error>();

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
      className={`overflow-y-visible  relative bg-swapCardGradient shadow-2xl rounded-2xl px-7 pt-6 pb-7  bg-dark xs:rounded-lg md:rounded-lg overflow-x-visible`}
      onSubmit={handleSubmit}
    >
      {title && (
        <>
          <h2 className="formTitle flex items-center justify-between font-bold text-xl text-white text-left pb-4">
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
        <SubmitButton
          disabled={
            !canSubmit ||
            (swapMode === SWAP_MODE.LIMIT &&
              (!quoteDoneLimit || (showSwapLoading && !loadingTrigger)))
          }
          label={buttonText || title}
          info={info}
          loading={
            swapMode !== SWAP_MODE.LIMIT
              ? showSwapLoading
              : !quoteDoneLimit || (showSwapLoading && !loadingTrigger)
          }
        />
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
  showAllResults,
  onChange,
  loading,
  useNearBalance,
  requestingTrigger,
  supportLedger,
  requested,
  tokensTitle,
  setSupportLedger,
  reserves,
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

    if (isSignedIn || !requested) {
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
      className={`overflow-visible relative bg-swapCardGradient shadow-2xl rounded-2xl px-7 pt-6 pb-7 bg-dark xs:rounded-lg md:rounded-lg `}
      onSubmit={handleSubmit}
    >
      {!requestingTrigger ? null : (
        <div className="absolute w-full h-full flex items-center justify-center bg-cardBg right-0 top-0 rounded-2xl z-30">
          <div className="flex flex-col items-center">
            <RequestingSmile />
            <span
              className="pt-6"
              style={{
                color: '#c4c4c4',
              }}
            >
              <span className="crossSwap-requesting-loading">
                <FormattedMessage id="requesting" defaultMessage="Requesting" />
              </span>
            </span>
          </div>
        </div>
      )}
      {title && (
        <h2 className="formTitle flex items-center justify-between  font-bold text-xl text-white text-left pb-4 pt-1.5">
          {tokensTitle}
          <div className="flex self-start items-center">
            {requested ? null : swapTab}
            {!requested ? null : (
              <div
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  if (loadingPause) {
                    setLoadingPause(false);
                    setLoadingTrigger(true);
                    setLoadingData(true);
                  } else {
                    setLoadingPause(true);
                    setLoadingTrigger(false);
                  }
                }}
                className="mx-4 cursor-pointer"
              >
                <CountdownTimer
                  loadingTrigger={loadingTrigger}
                  loadingPause={loadingPause}
                />
              </div>
            )}
            <SlippageSelector
              slippageTolerance={slippageTolerance}
              onChange={onChange}
              supportLedger={supportLedger}
              setSupportLedger={setSupportLedger}
            />
          </div>
        </h2>
      )}
      {error && <Alert level="warn" message={error.message} />}
      {children}

      <div>
        <SubmitButton
          signedInConfig={!requested}
          disabled={
            !canSubmit ||
            (typeof loadingTrigger !== 'undefined' && loadingTrigger)
          }
          label={buttonText || title}
          info={info}
          loading={showSwapLoading}
        />
      </div>
      {reserves}
    </form>
  );
}
