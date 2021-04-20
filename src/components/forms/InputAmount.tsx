import React, { useRef } from 'react';
import { toPrecision } from '../../utils/numbers';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
  onChangeAmount?: (amount: string) => void;
}

export default function InputAmount({
  max,
  className,
  onChangeAmount,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);
    ref.current.value = amount;
  };

  return (
    <>
      {max && (
        <p className="bg-inputBg col-span-12 p-2 text-right">
          Balance: {toPrecision(max || '0', 4, true)}
        </p>
      )}
      <fieldset className={className}>
        <div className="relative flex align-center items-center">
          <input
            ref={ref}
            {...rest}
            step="any"
            min="0"
            max={max}
            className="focus:outline-none bg-inputBg appearance-none rounded border-opacity-30 w-full py-2 px-3 text-2xl text-inputText leading-tight"
            type="number"
            placeholder="0.0"
            onChange={({ target }) => handleChange(target.value)}
          />
          {max ? (
            <button
              className="border rounded-lg right-0 items-center py-2 px-3 hover:text-primaryScale-600 hover:border-primaryScale-500 m-auto focus:outline-none"
              type="button"
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
