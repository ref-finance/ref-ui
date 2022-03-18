import React, { useEffect, useRef, useState } from 'react';
import { TokenMetadata } from '~services/ft-contract';
import { TokenBalancesView } from '~services/token';
import { tokenPrice } from './SelectToken';
import { multiply } from '../../utils/numbers';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
  maxBorder?: boolean;
  showMaxAsBalance?: boolean;
  onChangeAmount?: (amount: string, balances?: TokenBalancesView) => void;
  forSwap?: boolean;
  price?: string | null;
}

export default function InputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  forSwap = false,
  price,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const [symbolsArr] = useState(['e', 'E', '+', '-']);

  const [isFocus, setIsFocus] = useState<boolean>(false);

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);

    ref.current.value = amount;
  };

  return (
    <>
      <fieldset
        className={`${className} ${
          isFocus
            ? ' border border-greenLight rounded'
            : ' border border-transparent rounded'
        }`}
        ref={field}
      >
        <div
          className={`relative flex align-center items-center bg-inputDarkBg rounded`}
        >
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            {...rest}
            step="any"
            className={`xs:text-sm text-lg font-bold w-full p-2 ${
              disabled ? 'text-gray-200 placeholder-gray-200' : 'text-white'
            }`}
            type="number"
            placeholder="0.0"
            onChange={({ target }) => handleChange(target.value)}
            disabled={disabled}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onFocus={() => {
              setIsFocus(true);
            }}
            onBlur={() => {
              setIsFocus(false);
            }}
          />
          {max && !forSwap ? (
            <a
              className={`rounded border  items-center px-1 mr-2 m-auto focus:outline-none text-xs ${
                disabled || max === rest.value
                  ? 'text-gray-400 hover:text-gray-400 border-gray-400'
                  : 'text-greenColor border-greenColor'
              }`}
              style={{ lineHeight: 'unset', cursor: 'pointer' }}
              onClick={() => handleChange(max)}
            >
              MAX
            </a>
          ) : null}

          {forSwap ? <span className="mr-3">{tokenPrice(price)}</span> : null}
        </div>
      </fieldset>
    </>
  );
}
