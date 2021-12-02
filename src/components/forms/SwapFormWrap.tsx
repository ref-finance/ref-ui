import React, { useState } from 'react';
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
  };
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
}: React.PropsWithChildren<SwapFormWrapProps>) {
  const [error, setError] = useState<Error>();
  const { loadingData, setLoadingData, loadingTrigger, setLoadingTrigger } =
    loading;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (wallet.isSignedIn()) {
      try {
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
                  setLoadingData(true);
                  setLoadingTrigger(true);
                }}
                className="mx-2 cursor-pointer"
              >
                <div className="circle_process flex justify-center items-center">
                  <div className=" w-4 h-4 bg-cardBg rounded-full inline-block"></div>
                  <div className="wrapper right">
                    <div
                      className={`circle ${
                        !loadingTrigger ? 'rightcircle' : ''
                      }`}
                    ></div>
                  </div>

                  <div className="wrapper left">
                    <div
                      className={`circle ${
                        !loadingTrigger ? 'leftcircle' : ''
                      }`}
                      id="leftcircle"
                    ></div>
                  </div>
                </div>
                {/* <CountdownTimer size={16} loadingTrigger={loadingTrigger} /> */}
              </div>

              <SlippageSelector
                slippageTolerance={slippageTolerance}
                onChange={onChange}
                bindUseBalance={bindUseBalance}
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
          disabled={!canSubmit}
          text={buttonText || title}
          info={info}
        />
      )}
    </form>
  );
}
