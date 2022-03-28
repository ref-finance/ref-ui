import React, { useEffect, useState, useContext } from 'react';
import Alert from '../alert/Alert';
import SubmitButton from './SubmitButton';
import { FormattedMessage } from 'react-intl';
import SlippageSelector from './SlippageSelector';
import { SwapRefresh, CountdownTimer } from '../../components/icon';
import { wallet } from '~services/near';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';

interface SwapFormWrapProps {
  title?: string;
  buttonText?: string;
  canSubmit?: boolean;
  slippageTolerance: number;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  info?: string | JSX.Element;
  showElseView?: boolean;
  elseView?: JSX.Element;
  onChange: (slippage: number) => void;
  bindUseBalance: (useNearBalance: boolean) => void;
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
  supportLedger?: boolean;
  setSupportLedger?: (e?: any) => void;
}

export default function SwapFormWrap({
  children,
  title,
  buttonText,
  slippageTolerance,
  canSubmit = true,
  onSubmit,
  info,
  showElseView,
  elseView,
  onChange,
  bindUseBalance,
  loading,
  useNearBalance,
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
  } = loading;

  useEffect(() => {
    loadingTrigger && setShowSwapLoading(true);
    !loadingTrigger && setShowSwapLoading(false);
  }, [loadingTrigger]);

  const { signedInState } = useContext(WalletContext);
  const isSignedIn = signedInState.isSignedIn;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (isSignedIn) {
      try {
        setShowSwapLoading(true);
        setLoadingPause(true);
        onSubmit(event);
      } catch (err) {
        setError(err);
      }
    }
  };

  return (
    <form
      className="overflow-y-auto bg-secondary shadow-2xl rounded-2xl p-7 bg-dark xs:rounded-lg md:rounded-lg overflow-x-hidden"
      onSubmit={handleSubmit}
    >
      {title && (
        <>
          <h2 className="formTitle flex justify-between font-bold text-xl text-white text-left pb-4">
            <FormattedMessage id={title} defaultMessage={title} />
            <div className="flex items-center">
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

              <SlippageSelector
                slippageTolerance={slippageTolerance}
                onChange={onChange}
                bindUseBalance={bindUseBalance}
                useNearBalance={useNearBalance}
                normalSwap
                supportLedger={supportLedger}
                setSupportLedger={setSupportLedger}
              />
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
          disabled={!canSubmit || loadingTrigger}
          text={buttonText || title}
          info={info}
          loading={showSwapLoading}
        />
      )}
    </form>
  );
}
