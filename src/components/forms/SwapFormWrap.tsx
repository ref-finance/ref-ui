import React, { useEffect, useState } from 'react';
import Alert from '../alert/Alert';
import SubmitButton from './SubmitButton';
import { FormattedMessage } from 'react-intl';
import SlippageSelector from './SlippageSelector';
import { SwapRefresh, CountdownTimer } from '~components/icon';
import { wallet } from '~services/near';

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
  };
  useNearBalance: string;
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
}: React.PropsWithChildren<SwapFormWrapProps>) {
  const [error, setError] = useState<Error>();
  const {
    loadingData,
    setLoadingData,
    loadingTrigger,
    setLoadingTrigger,
    loadingPause,
    setLoadingPause,
  } = loading;

  console.log(loadingPause);

  const [showSwapLoading, setShowSwapLoading] = useState<boolean>(false);

  useEffect(() => {
    loadingTrigger && setShowSwapLoading(true);
    !loadingTrigger && setShowSwapLoading(false);
  }, [loadingTrigger]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (wallet.isSignedIn()) {
      try {
        setShowSwapLoading(true);
        onSubmit(event);
      } catch (err) {
        setError(err);
      }
    }
  };

  return (
    <form
      className="overflow-y-auto bg-secondary shadow-2xl rounded-2xl p-7 bg-dark xs:rounded-lg md:rounded-lg"
      onSubmit={handleSubmit}
    >
      {title && (
        <>
          <h2 className="formTitle flex justify-between font-bold text-xl text-white text-left pb-2">
            <FormattedMessage id={title} defaultMessage={title} />
            <div className="flex items-center">
              <div
                onClick={() => {
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
              />
            </div>
          </h2>
        </>
      )}
      {error && <Alert level="error" message={error.message} />}
      {children}
      {showElseView && elseView ? (
        elseView
      ) : (
        <SubmitButton
          disabled={!canSubmit && !loadingTrigger}
          text={buttonText || title}
          info={info}
          loading={showSwapLoading}
        />
      )}
    </form>
  );
}
