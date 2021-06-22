import React, { useRef } from 'react';
import { toPrecision } from '../../utils/numbers';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
  maxBorder?: boolean;
  showMaxAsBalance?: boolean;
  onChangeAmount?: (amount: string) => void;
}

export default function InputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);
    ref.current.value = amount;
  };

  return (
    <>
      <fieldset className={className}>
        <div
          className={`relative flex align-center items-center border-solid border-gray-200 ${
            maxBorder ? 'border-r' : ''
          }`}
        >
          <input
            ref={ref}
            {...rest}
            step="any"
            min="0"
            max={max}
            className={`text-sm font-bold focus:outline-none bg-inputBg appearance-none rounded border-opacity-30 w-full py-3 px-3 leading-tight ${
              disabled
                ? 'text-gray-400 placeholder-gray-400'
                : 'text-greenLight'
            }`}
            type="number"
            placeholder="0.0"
            onChange={({ target }) => handleChange(target.value)}
          />
          {max ? (
            <button
              className={`rounded-lg right-0 items-center py-3 px-3 m-auto focus:outline-none font-semibold text-xs
             ${
               disabled
                 ? 'text-gray-400 hover:text-gray-400'
                 : 'text-greenLight'
             }`}
              style={{ lineHeight: 'unset' }}
              onClick={() => handleChange(max)}
            >
              MAX
            </button>
          ) : null}
        </div>
      </fieldset>
    </>
  );
}
