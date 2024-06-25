import React, { useContext, useEffect, useRef, useState } from 'react';
import { Slider } from '../icon/Info';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMobile } from '../../utils/device';
import { IoWarning } from '../reactIcons';
import { QuestionTip } from '../../components/layout/TipWrapper';
import { SUPPORT_LEDGER_KEY } from '../swap/SwapCard';
import { SWAP_MODE, SWAP_TYPE, SwapProContext } from '../../pages/SwapPage';
import {
  Inch1IconAndAurora,
  TriAndAurora,
} from '../../components/icon/CrossSwapIcons';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import { SupportLedgerGuide } from '../../components/layout/SupportLedgerGuide';
import { TriAndAuroraLedger } from '../icon/CrossSwapIcons';

export function CustomSwitch({
  isOpen,
  setIsOpen,
  storageKey,
}: {
  isOpen: boolean;
  setIsOpen: (e?: any) => void;
  storageKey?: string;
}) {
  return (
    <div
      className={`ml-3 cursor-pointer ${
        isOpen ? 'bg-gradientFrom' : 'bg-farmSbg'
      }  p-0.5 flex items-center`}
      style={{
        height: '16px',
        width: '29px',
        borderRadius: '20px',
      }}
      onClick={() => {
        if (isOpen) {
          setIsOpen(false);
          localStorage.removeItem(storageKey || SUPPORT_LEDGER_KEY);
        } else {
          setIsOpen(true);
          localStorage.setItem(storageKey || SUPPORT_LEDGER_KEY, '1');
        }
      }}
    >
      <div
        className={`rounded-full bg-white transition-all ${
          isOpen ? 'transform translate-x-3 relative left-px' : ''
        }`}
        style={{
          width: '12px',
          height: '12px',
        }}
      ></div>
    </div>
  );
}

function CustomSwitchSwap({
  isOpen,
  setIsOpen,
  storageKey,
  forLedger,
}: {
  isOpen: boolean;
  setIsOpen?: (e?: any) => void;
  storageKey?: string;
  forLedger?: boolean;
}) {
  return (
    <div
      className={`ml-3 ${!setIsOpen ? '' : 'cursor-pointer'}  ${
        isOpen ? 'bg-gradientFromHover' : 'bg-black bg-opacity-20'
      }  p-0.5 flex items-center`}
      style={{
        height: '16px',
        width: '29px',
        borderRadius: '20px',
      }}
      onClick={() => {
        if (!setIsOpen) return;
        if (isOpen) {
          setIsOpen(false);
          if (forLedger) {
            localStorage.removeItem(storageKey || SUPPORT_LEDGER_KEY);
          }
        } else {
          setIsOpen(true);
          if (forLedger) {
            localStorage.setItem(storageKey || SUPPORT_LEDGER_KEY, '1');
          }
        }
      }}
    >
      <div
        className={`rounded-full ${
          !setIsOpen ? 'bg-limitOrderInputColor' : 'bg-white'
        } transition-all ${
          isOpen ? 'transform translate-x-3 relative left-px' : ''
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
  validSlippageList,
  supportLedger,
  setSupportLedger,
  swapMode,
  setReEstimateTrigger,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  validSlippageList?: number[];
  supportLedger?: boolean;
  setSupportLedger?: (e?: any) => void;
  swapMode?: SWAP_MODE;
  setReEstimateTrigger?: (e?: any) => void;
}) {
  const ref = useRef<HTMLInputElement>();
  const validSlippages = validSlippageList || [0.1, 0.5, 1.0];
  const slippageCopyId = isMobile() ? 'slippageCopyForMobile' : 'slippageCopy';
  const [showSlip, setShowSlip] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [warn, setWarn] = useState(false);
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const { enableTri, setEnableTri, swapType } = useContext(SwapProContext);
  const { isLedger } = useWalletSelector();

  const [ledgerGuide, setLedgerGuide] = useState<boolean>(false);

  useEffect(() => {
    let timer: any;

    if (isLedger && !supportLedger) {
      setShowSlip(true);
      setLedgerGuide(true);
      localStorage.setItem(SUPPORT_LEDGER_KEY, '1');

      timer = setTimeout(() => {
        setSupportLedger(true);
        setReEstimateTrigger(true);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [isLedger, swapType]);

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
    // ref.current.value = amount;
  };

  const closeToolTip = (e: any) => {
    if (!invalid) {
      setLedgerGuide(false);
      setShowSlip(false);
    }
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
  }, [swapMode]);

  const [hoverSlider, setHoverSlider] = useState(false);
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  const trisDisbaled =
    selectedWalletId === 'near-snap' ||
    selectedWalletId === 'near-mobile-wallet' ||
    selectedWalletId === 'okx-wallet' ||
    selectedWalletId === 'mintbase-wallet';
  useEffect(() => {
    if (trisDisbaled) {
      setEnableTri(false);
    }
  }, [trisDisbaled]);
  return (
    <div className="relative z-50 font-normal">
      <div
        className="p-1  xsm:border xsm:rounded-lg xsm:border-limitOrderFeeTiersBorderColor hover:bg-v3SwapGray flex items-center justify-center hover:bg-opacity-10  rounded-lg text-2xl text-white cursor-pointer"
        onClick={(e) => openToolTip(e)}
        onMouseEnter={() => setHoverSlider(true)}
        onMouseLeave={() => setHoverSlider(false)}
        style={{
          height: '26px',
          width: '26px',
        }}
      >
        <Slider shrink showSlip={showSlip || hoverSlider} />
      </div>
      {showSlip && (
        <div
          className={`xs:fixed xs:z-50 xs:top-0 xs:left-0 xs:backdrop-filter xs:right-0 xs:bottom-0 xs:bg-black xs:bg-opacity-60`}
        >
          <fieldset
            className="absolute top-10 text-newSlippageColor right-0 xs:relative xs:mx-5 xs:top-40 xs:right-0 px-4 py-6 bg-cardBg rounded-lg flex flex-col mb-4"
            style={{
              background: '#2E3D47',
              border: '1px solid rgba(126, 138, 147, 0.2)',
              boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.25)',
              borderRadius: '12px',
            }}
            onClick={(e) => {
              openToolTip(e);
            }}
          >
            <div
              className="text-newSlippageColor"
              style={{
                color: '',
              }}
            >
              <label className=" text-base font-bold text-center ">
                <FormattedMessage id="settings" defaultMessage="Settings" />
              </label>
            </div>
            <div className="flex items-center">
              <label className="text-sm py-5 text-text-newSlippageColor text-center ">
                <FormattedMessage
                  id="slippage"
                  defaultMessage="Slippage tolerance"
                />
              </label>
              <QuestionTip
                id={slippageCopyId}
                width="w-60"
                uniquenessId="slippageId3Id"
              />
            </div>

            <div className="flex text-newSlippageColor items-center">
              <div className="w-48 flex p-0.5 justify-between bg-black  bg-opacity-20 rounded-lg">
                {validSlippages.map((slippage) => (
                  <button
                    key={slippage}
                    className={` w-14 h-6 text-center focus:outline-none text-sm hover:bg-gradientFrom hover:text-chartBg rounded-lg ${
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
              <div
                className={`${
                  slippageTolerance && !invalid && !warn
                    ? 'border border-primaryText border-opacity-20 normal-input text-gradientFrom bg-opacity-0'
                    : ''
                }   flex   px-2 items-center bg-black bg-opacity-20 rounded-lg text-newSlippageColor h-7 text-center  text-sm  ml-2  ${
                  invalid && !warn
                    ? 'border border-error text-error bg-opacity-0 invalid-input'
                    : ''
                } ${
                  warn
                    ? 'border border-warn text-warn bg-opacity-0 warn-input'
                    : ''
                }`}
              >
                <input
                  ref={ref}
                  max={99.99999}
                  min={0}
                  inputMode="decimal"
                  defaultValue={slippageTolerance ? slippageTolerance : 0.5}
                  onWheel={() => ref.current.blur()}
                  step="any"
                  type="number"
                  required={true}
                  placeholder=""
                  className="w-6"
                  onChange={({ target }) => handleChange(target.value)}
                  onKeyDown={(e) =>
                    symbolsArr.includes(e.key) && e.preventDefault()
                  }
                />
                <span className="ml-2">%</span>
              </div>
            </div>

            {swapType === SWAP_TYPE.Pro && (
              <>
                <div className="text-sm mt-3 text-newSlippageColor">
                  <FormattedMessage
                    id="cross_chain_options"
                    defaultMessage={'Cross chain options'}
                  ></FormattedMessage>
                </div>

                <div className="frcb w-full my-2 text-sm">
                  <div className="frcs">
                    <TriAndAuroraLedger
                      className={`${trisDisbaled ? 'opacity-50' : ''}`}
                    />

                    <span
                      className={`ml-2  text-sm ${
                        trisDisbaled ? 'text-primaryText' : 'text-white'
                      }`}
                    >
                      Trisolaris
                    </span>
                  </div>
                  {trisDisbaled ? (
                    <CustomSwitchSwap isOpen={false} />
                  ) : (
                    <CustomSwitchSwap
                      isOpen={enableTri}
                      setIsOpen={setEnableTri}
                    />
                  )}
                </div>

                <div className="frcb w-full  text-sm">
                  <div className="frcs">
                    <Inch1IconAndAurora></Inch1IconAndAurora>

                    <span className="ml-2 text-primaryText text-sm">
                      1 inch
                    </span>
                  </div>

                  <CustomSwitchSwap isOpen={false} />
                </div>
              </>
            )}

            <div
              className={
                'flex items-center relative text-newSlippageColor mt-6 justify-between text-sm'
              }
            >
              {ledgerGuide && (
                <SupportLedgerGuide
                  handleClose={() => {
                    setLedgerGuide(false);
                  }}
                />
              )}
              <div className="flex items-center">
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
                  uniquenessId="supportId"
                  width="w-60"
                />
              </div>

              <CustomSwitchSwap
                forLedger
                isOpen={supportLedger}
                setIsOpen={setSupportLedger}
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
          <label className="text-sm text-center text-primaryText">
            <FormattedMessage
              id="slippage"
              defaultMessage="Slippage tolerance"
            />
          </label>
          <div className="text-primaryText">
            <QuestionTip
              id={slippageCopyId}
              width="w-60"
              uniquenessId="slippageId"
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
export function PoolSlippageSelectorV3({
  slippageTolerance,
  onChange,
  textColor,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  textColor?: string;
}) {
  const validSlippages = [0.1, 0.5, 1.0];
  const intl = useIntl();
  const slippageCopyId = isMobile() ? 'slippageCopyForMobile' : 'slippageCopy';

  return (
    <>
      <fieldset className="flex lg:items-center flex-wrap justify-between mb-4 pt-2">
        <div className="flex items-center md:mb-4 xs:mb-4">
          <label
            className={`text-sm text-center ${textColor || 'text-primaryText'}`}
          >
            <FormattedMessage
              id="slippage"
              defaultMessage="Slippage tolerance"
            />
          </label>
          <div className="text-primaryText">
            <QuestionTip
              id={slippageCopyId}
              width="w-60"
              uniquenessId="slippageId"
            />
          </div>
        </div>

        <div className="flex text-white items-center">
          {validSlippages.map((slippage) => (
            <div
              key={slippage}
              className={`flex items-center justify-center cursor-pointer w-12 rounded-lg text-xs border  hover:border-gradientFromHover  py-1 px-2 mx-1 ${
                slippage === slippageTolerance
                  ? 'text-black bg-gradientFromHover border-gradientFromHover hover:text-black'
                  : 'text-farmText border-maxBorderColor hover:text-gradientFromHover'
              }`}
              onClick={() => onChange(slippage)}
            >
              {slippage}%
            </div>
          ))}
        </div>
      </fieldset>
    </>
  );
}

export function StableSlipSelector({
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
    // ref.current.value = amount;
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
    <div className="relative z-50">
      <div className="flex justify-between xs:flex-col md:flex-col lg:flex-row">
        <div className="flex items-center text-primaryText">
          <label className="text-xs text-center xs:py-2 md:py-2 lg:py-5">
            <FormattedMessage
              id="slippage"
              defaultMessage="Slippage tolerance"
            />
          </label>
          <div className="">
            <QuestionTip
              id={slippageCopyId}
              width="w-60"
              uniquenessId="slippageId2Id"
            />
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
                    : 'text-primaryText'
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
            min={0}
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
            inputMode="decimal"
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
