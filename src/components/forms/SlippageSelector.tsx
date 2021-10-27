import React, { useEffect, useRef, useState } from 'react';
import ReactTooltip from 'react-tooltip';
import { Slider } from '../icon/Info';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMobile } from '~utils/device';
import { FaRegQuestionCircle } from 'react-icons/fa';

export default function SlippageSelector({
  slippageTolerance,
  onChange,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
}) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const validSlippages = [0.1, 0.5, 1.0];
  const intl = useIntl();
  const slippageCopyId = isMobile() ? 'slippageCopyForMobile' : 'slippageCopy';
  const [showSlip, setShowSlip] = useState(false);
  const [symbolsArr] = useState(['e', 'E', '+', '-']);
  const openToolTip = (e: any) => {
    e.nativeEvent.stopImmediatePropagation();
    setShowSlip(true);
  };
  const handleChange = (amount: string) => {
    onChange(Number(amount));
    ref.current.value = amount;
  };

  const closeToolTip = (e: any) => {
    setShowSlip(false);
  };

  useEffect(() => {
    document.onclick = (e) => closeToolTip(e);
    return () => {
      document.onclick = null;
    };
  }, [showSlip]);

  return (
    <div className=" relative">
      <div className=" w-7 text-2xl text-white" onClick={(e) => openToolTip(e)}>
        <Slider showSlip={showSlip} />
      </div>
      {showSlip && (
        <fieldset
          className="z-10 absolute top-5 right-0 xs:-right-4 px-4 py-6 bg-cardBg border shadow-4xl border-greenLight border-opacity-30 rounded-lg flex flex-col mb-4"
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
              <ReactTooltip />
            </div>
          </div>

          <div className="flex text-white items-center">
            {validSlippages.map((slippage) => (
              <button
                key={slippage}
                className={` w-14 h-7 text-center focus:outline-none text-sm hover:bg-gradientFrom rounded mx-2 ${
                  slippage === slippageTolerance
                    ? 'text-chartBg bg-gradientFrom'
                    : 'bg-gray-500'
                }`}
                type="button"
                onClick={() => onChange(slippage)}
              >
                {slippage}%
              </button>
            ))}
            <input
              ref={ref}
              max={100}
              min="0"
              defaultValue={slippageTolerance ? slippageTolerance : 0.5}
              onWheel={() => ref.current.blur()}
              step="any"
              className="w-14 h-7 text-center focus:outline-none text-sm rounded mx-2 bg-gray-500"
              type="number"
              placeholder=""
              onChange={({ target }) => handleChange(target.value)}
              onKeyDown={(e) =>
                symbolsArr.includes(e.key) && e.preventDefault()
              }
            />
            %
          </div>
        </fieldset>
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
              <FaRegQuestionCircle />
            </div>
            <ReactTooltip />
          </div>
        </div>

        <div className="flex text-white items-center">
          {validSlippages.map((slippage) => (
            <button
              key={slippage}
              className={`w-12 focus:outline-none text-sm hover:bg-gradientFrom  rounded py-1 px-2 mx-2 ${
                slippage === slippageTolerance
                  ? 'text-chartBg bg-gradientFrom'
                  : 'bg-gray-500'
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
