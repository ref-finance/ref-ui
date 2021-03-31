import React, { useRef } from 'react';

interface InputAmountProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onMax: (input: HTMLInputElement) => void;
}

export default function InputAmount({ onMax, ...rest }: InputAmountProps) {
  const ref = useRef();
  const v = { value: 'hi' };
  return (
    <>
      <input ref={ref} {...rest} type="number" placeholder="0.0" />
      <button type="button" onClick={() => onMax(ref.current)}>
        MAX
      </button>
    </>
  );
}
