import React, { useEffect, useState, useContext } from 'react';
import Alert from '../alert/Alert';
import SubmitButton from './SubmitButton';
import { FormattedMessage } from 'react-intl';
import SlippageSelector, { StableSlipSelecter } from './SlippageSelector';
import { SwapRefresh, CountdownTimer } from '../../components/icon';
import { wallet } from '~services/near';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';
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
  elseView?: JSX.Element;
  crossSwap?: boolean;
  requested?: boolean;
  tokensTitle?: JSX.Element;
  onChange: (slippage: number) => void;
  bindUseBalance: (useNearBalance: boolean) => void;
  requestingTrigger?: boolean;
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
  bindUseBalance,
  loading,
  useNearBalance,
  swapMode,
  supportLedger,
  setSupportLedger,
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
      className={`overflow-y-visible bg-secondary shadow-2xl rounded-2xl p-7 ${
        swapMode === SWAP_MODE.STABLE ? 'pb-16' : ''
      } bg-dark xs:rounded-lg md:rounded-lg overflow-x-visible`}
      onSubmit={handleSubmit}
    >
      {title && (
        <>
          <h2 className="formTitle flex justify-end font-bold text-xl text-white text-left pb-4">
            <div className="flex items-center">
              {crossSwap ? null : (
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

              {swapMode === SWAP_MODE.NORMAL ? (
                <SlippageSelector
                  slippageTolerance={slippageTolerance}
                  onChange={onChange}
                  bindUseBalance={bindUseBalance}
                  useNearBalance={useNearBalance}
                  supportLedger={supportLedger}
                  setSupportLedger={setSupportLedger}
                />
              ) : null}
              {swapMode === SWAP_MODE.STABLE ? (
                <SlippageSelectorForStable
                  slippageTolerance={slippageTolerance}
                  onChange={onChange}
                  validSlippageList={[0.05, 0.1, 0.2]}
                  useNearBalance={useNearBalance}
                  bindUseBalance={bindUseBalance}
                  supportLedger={supportLedger}
                  setSupportLedger={setSupportLedger}
                />
              ) : null}
            </div>
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
            (typeof loadingTrigger !== 'undefined' && loadingTrigger)
          }
          label={buttonText || title}
          info={info}
          loading={showSwapLoading}
        />
      )}
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
  showAllResults,
  onChange,
  bindUseBalance,
  loading,
  useNearBalance,
  requestingTrigger,
  supportLedger,
  requested,
  tokensTitle,
  setSupportLedger,
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
      className={`overflow-visible relative bg-secondary shadow-2xl rounded-2xl p-7 bg-dark xs:rounded-lg md:rounded-lg  ${
        showAllResults && requested ? 'pb-14' : ''
      }`}
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
        <>
          <h2 className="formTitle flex justify-end  font-bold text-xl text-white text-left pb-4">
            <div className="flex items-center">
              {tokensTitle}
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
                bindUseBalance={bindUseBalance}
                useNearBalance={useNearBalance}
                supportLedger={supportLedger}
                setSupportLedger={setSupportLedger}
              />
            </div>
          </h2>
        </>
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
    </form>
  );
}
