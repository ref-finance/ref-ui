import React from 'react';
import { FaRegQuestionCircle } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import copy from '../../utils/copy';

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
      <fieldset className="flex items-center mb-4">
        <label className="font-semibold text-center">Slippage: </label>
        <div>
          <FaRegQuestionCircle
            data-type="dark"
            data-place="bottom"
            data-multiline={true}
            data-tip={copy.slippageCopy}
            className="text-med ml-2 text-left"
          />
          <ReactTooltip />
        </div>
        {validSlippages.map((slippage) => (
          <button
            key={slippage}
            className={`hover:bg-buttonBg hover:text-buttonText rounded w-full p-2 mx-2 ${
              slippage === slippageTolerance &&
              'bg-buttonBg text-buttonText font-semibold'
            }`}
            type="button"
            onClick={() => onChange(slippage)}
          >
            {slippage}%
          </button>
        ))}
      </fieldset>
    </>
  );
}
