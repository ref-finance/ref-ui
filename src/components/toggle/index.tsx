import React, { useEffect, useState } from 'react';

export interface RadioProps {
  opts: Array<{ label: string; value: string }>;
  value: string;
  onChange?: (v: string) => void;
}

export function Toggle({ opts, value, onChange }: RadioProps) {
  const [v, setV] = useState<string>(value);
  return (
    <div
      className={`m-toggle rounded-full bg-inputDarkBg select-none inline-flex items-center cursor-pointer text-sm text-white`}
    >
      {opts.map((item) => {
        const active = item.value === v;
        return (
          <div
            key={item.value}
            className={`item rounded-full py-0.5 px-4 ${
              active ? 'bg-green-500' : ''
            } ${active ? 'text-white' : ''} `}
            onClick={() => {
              const vv = item.value;
              setV(vv);
              if (onChange) onChange(vv);
            }}
          >
            {item.label}
          </div>
        );
      })}
    </div>
  );
}
