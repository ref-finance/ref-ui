import React, { useRef, useState } from 'react';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
  maxBorder?: boolean;
  showMaxAsBalance?: boolean;
  onChangeAmount?: (amount: string) => void;
}

export default function OldInputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);
    ref.current.value = amount;
  };

  return (
    <>
      <fieldset className={className}>
        <div
          className={`relative flex align-center items-center h-11`}
        >
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            {...rest}
            step="any"
            className={`w-full h-full px-4 bg-black bg-opacity-20 text-sm font-bold focus:outline-non appearance-none rounded leading-tight ${
              disabled
                ? 'text-gray-400 placeholder-gray-400'
                : 'text-greenLight'
            }`}
            type="number"
            placeholder="0.0"
            onChange={({ target }) => handleChange(target.value)}
            disabled={disabled}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
          />
          {max ? (
            <a
              className={`flex justify-center items-center bg-black bg-opacity-20 h-full px-3.5 alifocus:outline-none font-semibold
             ${
               disabled
                 ? 'text-gray-400 hover:text-gray-400'
                 : 'text-greenLight'
             }`}
              style={{ lineHeight: 'unset', cursor: 'pointer' }}
              onClick={() => handleChange(max)}
            >
              <label className="text-xs border border-framBorder rounded-sm px-1 cursor-pointer" style={{zoom: 0.8}}>MAX</label>
            </a>
          ) : null}
        </div>
      </fieldset>
    </>
  );
}
