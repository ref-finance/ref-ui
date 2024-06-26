import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import SvgIcon from './SvgIcon';

function SlippageSelector({
  slippageTolerance,
  onChange,
  validSlippageList,
  children,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
  validSlippageList?: number[];
  children?: React.ReactNode;
}) {
  const ref = useRef<HTMLInputElement>();
  const validSlippages = validSlippageList || [0.1, 0.5, 1.0];
  const [show, setShow] = useState(false);

  const [innerValue, setInnerValue] = useState(slippageTolerance ?? 0.5);

  const [isInputFocus, setIsInputFocus] = useState(false);

  const symbolsArr = ['e', 'E', '+', '-'];

  const showStatus = useMemo(() => {
    if (innerValue > 0 && innerValue <= 1) return 'normal';
    else if (innerValue > 1 && innerValue < 100) return 'warn';
    else return 'invalid';
  }, [innerValue]);

  const handleChange = (amount: string | number) => {
    setInnerValue(Number(amount));
    if (showStatus === 'invalid') return;
    onChange(Number(amount));
  };

  useEffect(() => {
    function hideModal() {
      show && setShow(false);
    }
    document.addEventListener('click', hideModal);
    return () => {
      document.removeEventListener('click', hideModal);
    };
  }, [show]);

  return (
    <div className="relative z-50 font-normal">
      <div
        className="cursor-pointer"
        onClick={(e) => {
          e.stopPropagation();
          setShow(true);
        }}
      >
        {children}
      </div>
      {show && (
        <div
          className={`xs:fixed xs:z-50 xs:top-0 xs:left-0 xs:backdrop-filter xs:right-0 xs:bottom-0 xs:bg-black xs:bg-opacity-60`}
        >
          <div
            className="bridge-modal absolute top-6 right-0 xs:relative xs:mx-5 xs:top-40 xs:right-0"
            style={{ width: '280px', backgroundColor: '#2E3D47' }}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <div className="text-base font-bold ">
              <FormattedMessage id="settings" defaultMessage="Settings" />
            </div>
            <div className="text-sm py-4">
              <FormattedMessage
                id="slippage"
                defaultMessage="Slippage tolerance"
              />
            </div>

            <div className="flex  items-center">
              <div className="flex flex-1 gap-2 p-0.5 justify-between bg-black  bg-opacity-20 rounded-md mr-2">
                {validSlippages.map((slippage) => (
                  <span
                    key={slippage}
                    className={`inline-flex justify-center items-center w-12 rounded-md cursor-pointer py-0.5 ${
                      slippage === innerValue
                        ? `bg-primary text-black`
                        : `hover:bg-black`
                    }`}
                    onClick={() => {
                      ref.current.value = slippage.toString();
                      handleChange(slippage);
                    }}
                  >
                    {slippage}%
                  </span>
                ))}
              </div>
              <div
                className={[
                  'bridge-input',
                  'small',
                  isInputFocus && 'is-focus',
                  showStatus === 'warn' && 'is-warning',
                  showStatus === 'invalid' && 'is-error',
                ]
                  .filter((v) => !!v)
                  .join(' ')}
              >
                <input
                  ref={ref}
                  className="w-10 px-2"
                  min={0}
                  max={99.99999}
                  inputMode="decimal"
                  pattern="d\+\.\d\d$"
                  defaultValue={innerValue}
                  onWheel={() => ref.current.blur()}
                  step="any"
                  type="number"
                  required={true}
                  placeholder=""
                  onChange={({ target }) => handleChange(target.value)}
                  onFocus={() => setIsInputFocus(true)}
                  onBlur={() => setIsInputFocus(false)}
                  onKeyDown={(e) =>
                    symbolsArr.includes(e.key) && e.preventDefault()
                  }
                />
                <span>%</span>
              </div>
            </div>
            {showStatus !== 'normal' &&
              (showStatus === 'invalid' ? (
                <div className="flex items-center text-error text-xs py-3">
                  <SvgIcon name="IconWarning" className="mr-1" />
                  <FormattedMessage
                    id="slip_invalid"
                    defaultMessage="The slippage tolerance is invalid."
                  />
                </div>
              ) : (
                <div className="flex items-center text-warn text-xs py-3">
                  <SvgIcon name="IconWarning" className="mr-1" />
                  <FormattedMessage
                    id="slip_warn"
                    defaultMessage="Be careful, please check the minimum you can receive."
                  />
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default SlippageSelector;
