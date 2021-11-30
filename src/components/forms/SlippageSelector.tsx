import React, { useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { Slider } from '../icon/Info';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMobile } from '~utils/device';
import { FaRegQuestionCircle } from 'react-icons/fa';
import { IoCloseOutline, IoWarning } from 'react-icons/io5';
import { SWAP_USE_NEAR_BALANCE_KEY } from '~components/swap/SwapCard';

export default function SlippageSelector({
  slippageTolerance,
  onChange,
  bindUseBalance,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  bindUseBalance: (useNearBalance: boolean) => void;
}) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const validSlippages = [0.1, 0.5, 1.0];
  const intl = useIntl();
  const slippageCopyId = isMobile() ? 'slippageCopyForMobile' : 'slippageCopy';
  const [showSlip, setShowSlip] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [warn, setWarn] = useState(false);
  const [symbolsArr] = useState(['e', 'E', '+', '-']);
  const useNearBalance =
    localStorage.getItem(SWAP_USE_NEAR_BALANCE_KEY) || 'true';

  const openToolTip = (e: any) => {
    e.nativeEvent.stopImmediatePropagation();
    setShowSlip(true);
  };
  const handleChange = (amount: string) => {
    if (Number(amount) > 0 && Number(amount) < 100) {
      if (Number(amount) > 1) {
        setWarn(true);
      } else {
        setWarn(false);
      }
      setInvalid(false);
      onChange(Number(amount));
    } else {
      setInvalid(true);
      setWarn(false);
    }
    ref.current.value = amount;
  };

  const closeToolTip = (e: any) => {
    if (!invalid) setShowSlip(false);
  };

  const handleBtnChange = (slippage: number) => {
    setInvalid(false);
    setWarn(false);
    onChange(slippage);
    ref.current.value = slippage.toString();
  };

  const handleBalanceOption = (useBalance: string) => {
    bindUseBalance(useBalance === 'wallet');
  };

  useEffect(() => {
    document.onclick = (e) => closeToolTip(e);
    if (showSlip) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.onclick = null;
    };
  }, [showSlip, invalid]);

  return (
    <div className="relative z-10">
      <div
        className="w-6 text-2xl text-white cursor-pointer"
        onClick={(e) => openToolTip(e)}
      >
        <Slider showSlip={showSlip} />
      </div>
      {showSlip && (
        <div
          className={`xs:fixed xs:z-10 xs:top-0 xs:left-0 xs:backdrop-filter xs:right-0 xs:bottom-0 xs:bg-black xs:bg-opacity-60`}
        >
          <fieldset
            className="absolute top-5 right-0 xs:relative xs:mx-5 xs:top-40 xs:right-0 px-4 py-6 bg-cardBg border shadow-4xl border-greenLight border-opacity-30 rounded-lg flex flex-col mb-4"
            onClick={(e) => {
              openToolTip(e);
            }}
          >
            <div>
              <label className=" text-base text-center text-white">
                <FormattedMessage
                  id="slippage_title"
                  defaultMessage="Transaction Settings"
                />
              </label>
            </div>
            <div className="flex items-center">
              <label className="text-sm py-5 text-center text-white">
                <FormattedMessage
                  id="slippage"
                  defaultMessage="Slippage tolerance"
                />
              </label>
              <div className="text-gray-400">
                <div
                  className="pl-1 text-white text-base"
                  data-type="dark"
                  data-place="right"
                  data-multiline={true}
                  data-tip={intl.formatMessage({ id: slippageCopyId })}
                >
                  <FaRegQuestionCircle />
                </div>
                <ReactTooltip
                  className="text-xs text-left shadow-4xl"
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                  textColor="#c6d1da"
                />
              </div>
            </div>

            <div className="flex text-white items-center">
              <div className="w-48 flex justify-between bg-slipBg bg-opacity-40 rounded">
                {validSlippages.map((slippage) => (
                  <button
                    key={slippage}
                    className={` w-14 h-7 text-center focus:outline-none text-sm hover:bg-gradientFrom rounded ${
                      slippage === slippageTolerance
                        ? 'text-chartBg bg-gradientFrom'
                        : ''
                    }`}
                    type="button"
                    onClick={() => handleBtnChange(slippage)}
                  >
                    {slippage}%
                  </button>
                ))}
              </div>
              <input
                ref={ref}
                max={99.99999}
                min={0.000001}
                defaultValue={slippageTolerance ? slippageTolerance : 0.5}
                onWheel={() => ref.current.blur()}
                step="any"
                className={`${
                  slippageTolerance && !invalid && !warn
                    ? 'border border-gradientFrom normal-input text-gradientFrom bg-opacity-0'
                    : ''
                } focus:text-gradientFrom focus:bg-opacity-0 w-14 h-7 text-center text-sm rounded mx-2 bg-gray-500 ${
                  invalid && !warn
                    ? 'border border-error text-error bg-opacity-0 invalid-input'
                    : ''
                } ${
                  warn
                    ? 'border border-warn text-warn bg-opacity-0 warn-input'
                    : ''
                }`}
                type="number"
                required={true}
                placeholder=""
                onChange={({ target }) => handleChange(target.value)}
                onKeyDown={(e) =>
                  symbolsArr.includes(e.key) && e.preventDefault()
                }
              />
              %
            </div>
            <div className={`${invalid || warn ? 'block' : 'hidden'}`}>
              {invalid ? (
                <div className="text-error text-xs py-3">
                  <IoWarning className="inline-block text-lg align-text-top mr-1" />
                  <FormattedMessage
                    id="slip_invalid"
                    defaultMessage="The slippage tolerance is invalid."
                  />
                </div>
              ) : (
                <div className="text-warn text-xs py-3">
                  <IoWarning className="inline-block text-lg align-text-top mr-1" />
                  <FormattedMessage
                    id="slip_wran"
                    defaultMessage="Be careful, please check the minimum you can receive."
                  />
                </div>
              )}
            </div>
            <div className="flex items-center">
              <label className="text-sm py-5 text-center text-white">
                <FormattedMessage
                  id="select_balance"
                  defaultMessage="Select Balance"
                />
              </label>
              <div className="text-gray-400">
                <div
                  className="pl-1 text-white text-base"
                  data-type="dark"
                  data-place="right"
                  data-multiline={true}
                  data-tip={intl.formatMessage({ id: 'selectBalanceCopy' })}
                >
                  <FaRegQuestionCircle />
                </div>
                <ReactTooltip
                  className="text-xs text-left shadow-4xl"
                  backgroundColor="#1D2932"
                  border
                  borderColor="#7e8a93"
                  effect="solid"
                  textColor="#c6d1da"
                />
              </div>
            </div>
            <div
              className="flex items-center"
              onChange={({ target }) => handleBalanceOption(target.value)}
            >
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  className="form-radio w-4 text-green-500"
                  name="useBalance"
                  value="wallet"
                  defaultChecked={useNearBalance === 'true'}
                  style={{ accentColor: '#00c6a2' }}
                />
                <span className="ml-2 text-sm w-18">
                  {intl.formatMessage({ id: 'near_wallet' })}
                </span>
              </label>
              <label className="inline-flex items-center ml-6">
                <input
                  type="radio"
                  className="form-radio w-4 text-green-500"
                  name="useBalance"
                  value="ref"
                  defaultChecked={useNearBalance === 'false'}
                  style={{ accentColor: '#00c6a2' }}
                />
                <span className="ml-2 text-sm w-18">
                  {intl.formatMessage({ id: 'ref_account' })}
                </span>
              </label>
            </div>
          </fieldset>
          {showSlip && (
            <IoCloseOutline
              className="absolute top-12 xs:top-48 xs:right-10 right-3 text-primaryText cursor-pointer"
              onClick={(e) => closeToolTip(e)}
            />
          )}
        </div>
      )}
    </div>
  );
}

export function PoolSlippageSelector({
  slippageTolerance,
  onChange,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
}) {
  const validSlippages = [0.1, 0.5, 1.0];
  const intl = useIntl();
  const slippageCopyId = isMobile() ? 'slippageCopyForMobile' : 'slippageCopy';

  return (
    <>
      <fieldset className="flex lg:items-center md:flex-col xs:flex-col justify-between mb-4 pt-2">
        <div className="flex items-center md:mb-4 xs:mb-4 ml-2">
          <label className="text-sm text-center text-white">
            <FormattedMessage
              id="slippage"
              defaultMessage="Slippage tolerance"
            />
          </label>
          <div className="text-gray-400">
            <div
              className="pl-1"
              data-type="dark"
              data-place="right"
              data-multiline={true}
              data-tip={intl.formatMessage({ id: slippageCopyId })}
            >
              <FaRegQuestionCircle className="text-sm" />
            </div>
            <ReactTooltip
              className="text-xs text-left shadow-4xl"
              backgroundColor="#1D2932"
              border
              borderColor="#7e8a93"
              effect="solid"
              textColor="#c6d1da"
            />
          </div>
        </div>

        <div className="flex text-white items-center">
          {validSlippages.map((slippage) => (
            <button
              key={slippage}
              className={`w-12 focus:outline-none text-sm hover:bg-gradientFrom  rounded py-1 px-2 mx-2 ${
                slippage === slippageTolerance
                  ? 'text-chartBg bg-gradientFrom'
                  : 'bg-slipBg'
              }`}
              type="button"
              onClick={() => onChange(slippage)}
            >
              {slippage}%
            </button>
          ))}
        </div>
      </fieldset>
    </>
  );
}
