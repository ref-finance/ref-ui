import React, { useRef } from 'react';
import { useForm } from 'react-hook-form';

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
    <fieldset className={`relative flex align-center my-4 ${className}`}>
      <input
        ref={ref}
        {...rest}
        step="any"
        min="0"
        max={max}
        className="focus:outline-none shadow bg-gray-500 appearance-none border rounded border-opacity-30 w-full py-2 px-3 text-3xl text-white leading-tight"
        type="number"
        placeholder="0.0"
        onChange={({ target }) => handleChange(target.value)}
      />
      {max ? (
        <button
          className="absolute inset-y-0 right-0 items-center pr-2"
          type="button"
          onClick={() => handleChange(max)}
        >
          MAX
        </button>
      ) : null}
    </fieldset>
  );
}
