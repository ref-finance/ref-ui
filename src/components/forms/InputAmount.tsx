import React, { useRef } from 'react';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  max?: string;
}

export default function InputAmount({
  max,
  className,
  ...rest
}: InputAmountProps) {
  const ref = useRef<HTMLInputElement>();
  return (
    <fieldset className={`relative flex align-center my-4 ${className}`}>
      <input
        ref={ref}
        {...rest}
        min="0"
        max={max}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
        type="number"
        placeholder="0.0"
      />
      {max ? (
        <button
          className="absolute inset-y-0 right-0 items-center pr-2"
          type="button"
          onClick={() => (ref.current.value = max)}
        >
          MAX
        </button>
      ) : null}
    </fieldset>
  );
}
