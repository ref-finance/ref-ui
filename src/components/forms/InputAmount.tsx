import React, { useEffect, useRef, useState } from 'react';
import { TokenMetadata } from '~services/ft-contract';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
  maxBorder?: boolean;
  showMaxAsBalance?: boolean;
  onChangeAmount?: (amount: string) => void;
  iserror?: boolean;
}

export default function InputAmount({
  max,
  className,
  onChangeAmount,
  disabled = false,
  maxBorder = true,
  iserror,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  const field = useRef<HTMLFieldSetElement>();
  const [symbolsArr] = useState(['e', 'E', '+', '-']);
  const cachedError = useRef(null);

  const handleChange = (amount: string) => {
    if (onChangeAmount) onChangeAmount(amount);

    ref.current.value = amount;
  };

  const handleFocus = () => {
    field.current.className = className + ' border border-greenLight rounded';
  };

  const handleFocusOut = () => {
    field.current.className = className + ' border border-transparent rounded';
  };

  useEffect(() => {
    if (iserror) {
      field.current.className =
        className + ' border border-transparent rounded';
      cachedError.current = iserror;
    } else if (!iserror && cachedError.current) {
      field.current.className = className + ' border border-greenLight rounded';
    }
  }, [iserror]);

  return (
    <>
      <fieldset className={className} ref={field}>
        <div
          className={`relative flex align-center items-center ${
            iserror ? 'bg-error bg-opacity-30' : 'bg-inputDarkBg'
          }  rounded`}
        >
          <input
            ref={ref}
            max={max}
            min="0"
            onWheel={() => ref.current.blur()}
            {...rest}
            step="any"
            className={`xs:text-sm text-lg font-bold w-full p-2 ${
              disabled
                ? 'text-gray-200 placeholder-gray-200'
                : iserror
                ? 'text-error'
                : 'text-white'
            }`}
            type="number"
            placeholder="0.0"
            onChange={({ target }) => handleChange(target.value)}
            disabled={disabled}
            onKeyDown={(e) => symbolsArr.includes(e.key) && e.preventDefault()}
            onFocus={() => handleFocus()}
            onBlur={() => handleFocusOut()}
          />
          {max ? (
            <a
              className={`rounded border  items-center px-1 mr-2 m-auto focus:outline-none text-xs ${
                disabled || max === rest.value
                  ? 'text-gray-400 hover:text-gray-400 border-gray-400'
                  : 'text-greenLight border-greenLight'
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
