import React, { useEffect, useMemo, useState } from 'react';
import SvgIcon from './SvgIcon';
import Big from 'big.js';
import { formatNumber } from '../utils/format';

type Props = {
  model?:
    | BridgeModel.BridgeTransferFormData['from']
    | BridgeModel.BridgeTransferFormData['to'];
  balance?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  inputReadonly?: boolean;
  isError?: boolean;
  onChange?: (value: Props['model']) => void;
};

function GasFeeWarning({ className }: { className?: string }) {
  return (
    <div className={`flex items-center text-danger ${className ?? ''}`}>
      <SvgIcon name="IconWarning" className="mr-1" />
      Not enough gas fee
    </div>
  );
}

function InputToken({
  model,
  balance,
  className,
  onChange,
  children,
  style,
  inputReadonly,
  isError,
}: Props) {
  const [isInputFocus, setIsInputFocus] = useState(false);

  function handleAllAmount() {
    !inputReadonly &&
      onChange?.({
        ...model,
        amount: balance,
      });
  }

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
            min={0}
            className="text-white text-xl bg-transparent flex-1"
            placeholder="0"
            readOnly={inputReadonly}
            value={model.amount || ''}
            onChange={(e) =>
              onChange?.({
                ...model,
                amount: e.target.value,
              })
            }
            onFocus={() => setIsInputFocus(true)}
            onBlur={() => setIsInputFocus(false)}
          />
          {children}
        </div>
        <div className="w-full flex items-center justify-end text-xs">
          {/* <span>$0.00</span> */}
          <span className="text-gray-400">
            Balance:
            <a
              className={`ml-1 ${
                balance && new Big(balance).gt(0)
                  ? !inputReadonly
                    ? 'hover:underline cursor-pointer text-white'
                    : 'text-white'
                  : ''
              }`}
              onClick={handleAllAmount}
            >
              {formatNumber(balance, { rm: Big.roundDown })}
            </a>
          </span>
        </div>
      </div>
      {isError ? <GasFeeWarning className="animate-fadeIn mt-2" /> : null}
    </>
  );
}
export default InputToken;
