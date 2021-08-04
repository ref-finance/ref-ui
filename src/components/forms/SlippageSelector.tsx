import React from 'react';
import ReactTooltip from 'react-tooltip';
import copy from '../../utils/copy';
import { Info } from '../icon/Info';

export default function SlippageSelector({
  slippageTolerance,
  onChange,
}: {
  slippageTolerance: number;
  onChange: (slippage: number) => void;
}) {
  const validSlippages = [0.1, 0.5, 1];

  return (
    <>
      <fieldset className="flex items-center mb-4 pt-2">
        <label className="font-semibold text-xs text-center">Slippage: </label>
        <div>
          <div
            className="pl-1"
            data-type="dark"
            data-place="top"
            data-multiline={true}
            data-tip={copy.slippageCopy}
          >
            <Info />
          </div>
          <ReactTooltip />
        </div>
        <div className="border flex rounded-full ml-16 border-1 text-gray-400 border-gray-200">
          {validSlippages.map((slippage) => (
            <button
              key={slippage}
              className={`focus:outline-none text-xs hover:text-greenLight font-semibold rounded w-full py-1 px-2 mx-2 ${
                slippage === slippageTolerance && 'text-greenLight'
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
