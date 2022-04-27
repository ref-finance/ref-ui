import React, { useEffect, useState, useContext } from 'react';
import Alert from '../alert/Alert';
import SubmitButton from './SubmitButton';
import { FormattedMessage, useIntl } from 'react-intl';
import SlippageSelector, { StableSlipSelecter } from './SlippageSelector';
import { SwapRefresh, CountdownTimer } from '../../components/icon';
import { wallet } from '~services/near';
import { getCurrentWallet, WalletContext } from '../../utils/sender-wallet';
import { SWAP_MODE } from '../../pages/SwapPage';
import SlippageSelectorForStable from './SlippageSelector';
import QuestionMark from '~components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';

interface USNFormWrapProps {
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
  swapMode?: SWAP_MODE;
  supportLedger?: boolean;
  setSupportLedger?: (e?: any) => void;
}

export default function USNFormWrap({
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
  swapMode,
  supportLedger,
  setSupportLedger,
}: React.PropsWithChildren<USNFormWrapProps>) {
  const [error, setError] = useState<Error>();
  const intl = useIntl();
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
  function buy_nsn_tip() {
    const tip = intl.formatMessage({ id: 'buy_nsn_tip' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left">${tip}</div>`;
    return result;
  }
  return (
    <form
      className={`overflow-y-visible bg-secondary shadow-2xl rounded-2xl p-7 ${
        swapMode === SWAP_MODE.STABLE ? 'pb-16' : ''
      } bg-dark xs:rounded-lg md:rounded-lg overflow-x-visible`}
      onSubmit={handleSubmit}
    >
      <h2 className="formTitle flex justify-between items-center font-bold text-xl text-white text-left pb-4">
        <div className="flex items-center text-2xl text-white">
          <FormattedMessage id="buy_nsn"></FormattedMessage>
          <div
            className="ml-2 text-sm"
            data-type="info"
            data-place="right"
            data-multiline={true}
            data-class="reactTip"
            data-html={true}
            data-tip={buy_nsn_tip()}
            data-for="buyUSNTip"
          >
            <QuestionMark />
            <ReactTooltip
              className="w-20"
              id="buyUSNTip"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
            />
          </div>
        </div>
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
      <div className=" text-primaryText text-sm mb-5">
        <FormattedMessage
          id="usn_tip_one"
          defaultMessage="USN allows you to trade on REF. Make sure to "
        />
        <span className=" text-white">
          <FormattedMessage
            id="wrapnear_tip_two"
            defaultMessage="leave 1 NEAR"
          />
        </span>

        <FormattedMessage
          id="wrapnear_tip_three"
          defaultMessage=" for gas fees."
        />
      </div>
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
