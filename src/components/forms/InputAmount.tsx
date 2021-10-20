import React, { useRef, useState } from 'react';

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
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);
    ref.current.value = amount;
  };

  return (
    <>
      <fieldset className={className}>
        <div
          className={`relative flex align-center items-center pr-3 rounded`}
          style={{
            background: 'rgba(0, 0, 0, 0.2)',
          }}
        >
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            {...rest}
            step="any"
            className={`text-2xl focus:outline-none appearance-none border-opacity-30 w-full p-3 leading-tight ${
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
              className={`rounded p-0.5 items-center m-auto focus:outline-none border border-green-500 text-xs
             ${
               disabled
                 ? 'text-gray-400 hover:text-gray-400'
                 : 'text-greenLight'
             }`}
              style={{ lineHeight: 'unset', cursor: 'pointer' }}
              onClick={() => handleChange(max)}
            >
              MAX
            </a>
          ) : null}
        </div>
      </fieldset>
    </>
  );
}
