import React, { useEffect, useState } from 'react';

export interface RadioProps {
  opts: Array<{ label: string; value: string }>;
  value: string;
  onChange?: (v: string) => void;
}

export function Toggle({ opts, value, onChange }: RadioProps) {
  const [v, setV] = useState<string>(value);
  return (
    <div className="flex xs:flex-col md:flex-col xs:items-end md:items-end">
      <div
        className={`m-toggle rounded bg-slipBg select-none inline-flex items-center cursor-pointer text-xs text-white`}
      >
        {opts.map((item) => {
          const active = Number(item.value) === Number(v);
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
      <div className="xs:mt-3 md:mt-3">
        <div className="inline-block w-16 ml-2 border border-gradientFrom bg-inputDarkBg p-1 px-3 rounded">
          <input
            className="text-right text-white"
            type="number"
            value={v}
            onChange={(evt) => {
              const vv = evt.target.value;
              setV(vv);
              if (onChange) onChange(vv);
            }}
          />
        </div>
        <label className="inline-block text-white ml-1">%</label>
      </div>
    </div>
  );
}
