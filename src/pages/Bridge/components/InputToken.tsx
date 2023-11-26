import React, { useMemo, useState } from 'react';
import SvgIcon from './SvgIcon';

type Props = {
  model:
    | BridgeModel.BridgeTransaction['from']
    | BridgeModel.BridgeTransaction['to'];
  className?: string;
  onChange?: (value: Props['model']) => void;
  children?: React.ReactNode;
  style?: React.CSSProperties;
};

function GasFeeWarning({ className }: { className?: string }) {
  return (
    <div className={`flex items-center text-red-400 ${className ?? ''}`}>
      <SvgIcon name="IconWarning" className="mr-1" />
      Not enough gas (0.0035 ETH needed)
    </div>
  );
}

function InputToken({ model, className, onChange, children, style }: Props) {
  const [isInputFocus, setIsInputFocus] = useState(false);
  const isError = useMemo(
    () => model.amount && model.amount > 1000,
    [model.amount]
  );

  return (
    <>
      <div
        className={`bridge-input bridge-input-token ${[
          isError && 'is-error',
          isInputFocus && 'is-focus',
          className,
        ].join(' ')}`}
        style={style}
      >
        <div className="w-full flex items-center mb-3">
          <input
            type="number"
            inputMode="decimal"
            className="text-white text-xl bg-transparent flex-1"
            placeholder="0"
            value={model.amount || ''}
            onChange={(e) =>
              onChange?.({ ...model, amount: Number(e.target.value) })
            }
            onFocus={() => setIsInputFocus(true)}
            onBlur={() => setIsInputFocus(false)}
          />
          {children}
        </div>
        <div className="w-full flex items-center justify-between text-xs">
          <span>$0.00</span>
          <span className="text-gray-400">Balance: </span>
        </div>
      </div>
      {isError ? <GasFeeWarning className="mt-2" /> : null}
    </>
  );
}
export default InputToken;
