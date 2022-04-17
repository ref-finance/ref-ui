import React, { useEffect, useRef, useState } from 'react';
import { Slider } from '../icon/Info';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMobile } from '../../utils/device';
import { IoCloseOutline, IoWarning } from 'react-icons/io5';
import { QuestionTip } from '../../components/layout/TipWrapper';
import { SUPPORT_LEDGER_KEY } from '../swap/SwapCard';

function SupportLedgerSwitch({
  supportLedger,
  setSupportLedger,
}: {
  supportLedger: boolean;
  setSupportLedger: (e?: any) => void;
}) {
  return (
    <div
      className={`ml-4 cursor-pointer ${
        supportLedger ? 'bg-gradientFrom' : 'bg-farmSbg'
      }  p-0.5 flex items-center`}
      style={{
        height: '16px',
        width: '29px',
        borderRadius: '20px',
      }}
      onClick={() => {
        if (supportLedger) {
          setSupportLedger(false);
          localStorage.removeItem(SUPPORT_LEDGER_KEY);
        } else {
          setSupportLedger(true);
          localStorage.setItem(SUPPORT_LEDGER_KEY, '1');
        }
      }}
    >
      <div
        className={`rounded-full bg-white transition-all ${
          supportLedger ? 'transform translate-x-3 relative left-px' : ''
        }`}
        style={{
          width: '12px',
          height: '12px',
        }}
      ></div>
    </div>
  );
}

export default function SlippageSelector({
  slippageTolerance,
  onChange,
  bindUseBalance,
  useNearBalance,
  validSlippageList,
  normalSwap,
  supportLedger,
  setSupportLedger,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  bindUseBalance: (useNearBalance: boolean) => void;
  useNearBalance: string;
  validSlippageList?: number[];
  normalSwap?: boolean;
  supportLedger?: boolean;
  setSupportLedger?: (e?: any) => void;
}) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const validSlippages = validSlippageList || [0.1, 0.5, 1.0];
  const intl = useIntl();
  const slippageCopyId = isMobile() ? 'slippageCopyForMobile' : 'slippageCopy';
  const [showSlip, setShowSlip] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [warn, setWarn] = useState(false);
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

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

  useEffect(() => {
    if (slippageTolerance > 0 && slippageTolerance < 100) {
      if (slippageTolerance > 1) {
        setWarn(true);
      } else {
        setWarn(false);
      }
      setInvalid(false);
    } else {
      setInvalid(true);
      setWarn(false);
    }
  }, []);

  return (
    <div className="relative z-10 font-normal">
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
              <QuestionTip id={slippageCopyId} />
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

            <div
              className={
                normalSwap ? 'flex items-center mt-6 text-sm' : 'hidden'
              }
            >
              <label>
                <FormattedMessage
                  id="support_ledger"
                  defaultMessage={'Support Ledger'}
                />
              </label>

              <QuestionTip
                id="support_ledger_tip"
                defaultMessage="By design, Ledger cannot handle large transactions (i.e. Auto Router: trade across multiple pools at once) because of its memory limitation. When activated, the 'Support Ledger' option will limit transactions to their simplest form (to the detriment of better prices), so transactions of a reasonable size can be signed."
                dataPlace="bottom"
                width="xs:w-80 md:w-80"
              />
              <SupportLedgerSwitch
                supportLedger={supportLedger}
                setSupportLedger={setSupportLedger}
              />
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
                    id="slip_warn"
                    defaultMessage="Be careful, please check the minimum you can receive."
                  />
                </div>
              )}
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
        <div className="flex items-center md:mb-4 xs:mb-4">
          <label className="text-sm text-center text-white">
            <FormattedMessage
              id="slippage"
              defaultMessage="Slippage tolerance"
            />
          </label>
          <div className="text-gray-400">
            <QuestionTip id={slippageCopyId} />
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

export function StableSlipSelecter({
  slippageTolerance,
  onChange,
  setInvalid,
  invalid,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  setInvalid: (status: boolean) => void;
  invalid: boolean;
}) {
  const ref = useRef<HTMLInputElement>();
  const validSlippages = [0.05, 0.1, 0.2];
  const intl = useIntl();
  const slippageCopyId = isMobile() ? 'slippageCopyForMobile' : 'slippageCopy';
  const [showSlip, setShowSlip] = useState(false);
  const [warn, setWarn] = useState(false);
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

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
  useEffect(() => {
    handleChange(slippageTolerance.toString());
  }, []);

  return (
    <div className="relative z-10">
      <div className="flex justify-between xs:flex-col md:flex-col lg:flex-row">
        <div className="flex items-center text-primaryText">
          <label className="text-xs text-center xs:py-2 md:py-2 lg:py-5">
            <FormattedMessage
              id="slippage"
              defaultMessage="Slippage tolerance"
            />
          </label>
          <div className="">
            <QuestionTip id={slippageCopyId} />
          </div>
        </div>
        <div className="flex text-white items-center">
          <div className="w-40 flex justify-between bg-slipBg bg-opacity-40 rounded">
            {validSlippages.map((slippage) => (
              <button
                key={slippage}
                className={` w-12 h-6 text-center focus:outline-none text-xs hover:bg-gradientFrom rounded ${
                  slippage === slippageTolerance
                    ? 'text-chartBg bg-gradientFrom'
                    : 'text-gray-400'
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
            defaultValue={slippageTolerance ? slippageTolerance : 0.1}
            onWheel={() => ref.current.blur()}
            step="any"
            className={`${
              slippageTolerance && !invalid && !warn
                ? 'border border-gradientFrom normal-input text-gradientFrom bg-opacity-0'
                : ''
            } focus:text-gradientFrom focus:bg-opacity-0 w-14 h-7 text-center text-xs rounded mx-2 bg-gray-500 ${
              invalid && !warn
                ? 'border border-error text-error bg-opacity-0 invalid-input'
                : ''
            } ${
              warn ? 'border border-warn text-warn bg-opacity-0 warn-input' : ''
            }`}
            type="number"
            required={true}
            placeholder=""
            onChange={({ target }) => handleChange(target.value)}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
          />
          <span className="text-white">%</span>
        </div>
      </div>
      <div
        className={`${invalid || warn ? 'block' : 'hidden'} flex justify-end`}
      >
        {invalid ? (
          <div className="text-error text-xs py-2">
            <IoWarning className="inline-block text-lg align-text-top mr-1" />
            <FormattedMessage
              id="slip_invalid"
              defaultMessage="The slippage tolerance is invalid."
            />
          </div>
        ) : (
          <div className="text-warn text-xs py-2">
            <IoWarning className="inline-block text-lg align-text-top mr-1" />
            <FormattedMessage
              id="slip_warn"
              defaultMessage="Be careful, please check the minimum you can receive."
            />
          </div>
        )}
      </div>
    </div>
  );
}
