import React, { useEffect, useState, useContext } from 'react';
import Alert from '../alert/Alert';
import { FormattedMessage, useIntl } from 'react-intl';
import SlippageSelector from './SlippageSelector';
import { CountdownTimer } from '../../components/icon';
import { SWAP_MODE } from '../../pages/SwapPage';
import QuestionMark from 'src/components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { IoClose } from '../reactIcons';
import { isMobile } from 'src/utils/device';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

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
    loadingTrigger: boolean;
    setLoadingTrigger?: (loaidngTrigger: boolean) => void;
    loadingPause: boolean;
    setLoadingPause: (pause: boolean) => void;
  };
  useNearBalance: string;
  swapMode?: SWAP_MODE;
  closeFun?: any;
}

export default function USNFormWrap({
  children,
  slippageTolerance,
  onChange,
  bindUseBalance,
  loading,
  useNearBalance,
  closeFun,
}: React.PropsWithChildren<USNFormWrapProps>) {
  const [error, setError] = useState<Error>();
  const intl = useIntl();
  const { loadingTrigger, loadingPause, setLoadingPause, setLoadingTrigger } =
    loading;

  function buy_nsn_tip() {
    const tip = intl.formatMessage({ id: 'buy_nsn_tip' });
    let result: string = `<div class="text-navHighLightText text-xs w-52 text-left font-normal">${tip}</div>`;
    return result;
  }
  return (
    <form
      style={{
        height: isMobile() ? '510px' : '',
        overflow: isMobile() ? 'auto' : '',
      }}
      className={`overflow-y-visible bg-secondary shadow-2xl rounded-2xl p-7 bg-dark xs:rounded-lg md:rounded-lg overflow-x-visible border-gradientFrom border border-opacity-50`}
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
            data-tooltip-html={buy_nsn_tip()}
            data-tooltip-id="buyUSNTip"
          >
            <QuestionMark />
            <CustomTooltip className="w-20" id="buyUSNTip" />
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
          />
          <IoClose
            onClick={closeFun}
            className="text-primaryText cursor-pointer ml-2"
          />
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
    </form>
  );
}
