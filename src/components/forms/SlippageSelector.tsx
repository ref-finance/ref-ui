import React from 'react';
import ReactTooltip from 'react-tooltip';
import { Info } from '../icon/Info';
import { FormattedMessage, useIntl } from 'react-intl';
import { isMobile } from '~utils/device';
import { FaQuestionCircle, FaRegQuestionCircle } from 'react-icons/fa';
import { toPrecision } from '~utils/numbers';

export default function SlippageSelector({
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
      <fieldset className="flex items-center justify-between mb-4 pt-2">
        <div className="flex items-center">
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
