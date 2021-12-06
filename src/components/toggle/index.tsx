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
      className={`m-toggle rounded bg-slipBg select-none inline-flex items-center cursor-pointer text-xs text-white`}
    >
      {opts.map((item) => {
        const active = item.value === v;
        return (
          <div
            key={item.value}
            className={`item rounded py-1 px-2 ${
              active ? 'text-chartBg bg-gradientFrom' : ''
            }`}
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
