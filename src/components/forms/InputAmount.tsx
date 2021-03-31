import React, { useRef } from 'react';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onMax?: (input: HTMLInputElement) => void;
}

export default function InputAmount({
  onMax,
  className,
  ...rest
}: InputAmountProps) {
  const ref = useRef();
  const v = { value: 'hi' };
  return (
    <fieldset className={`relative flex align-center my-4 ${className}`}>
      <input
        ref={ref}
        {...rest}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="number"
        placeholder="0.0"
      />
      {onMax && (
        <button
          className="absolute inset-y-0 right-0 items-center pr-2"
          type="button"
          onClick={() => onMax(ref.current)}
        >
          MAX
        </button>
      )}
    </fieldset>
  );
}
