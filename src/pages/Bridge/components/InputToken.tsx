import React, { useEffect, useMemo, useState } from 'react';
import SvgIcon from './SvgIcon';
import Big from 'big.js';
import useBridgeForm from '../hooks/useBridgeForm';
import useBridgeToken from '../hooks/useBridgeToken';
import { useRequest } from '../hooks/useRequest';
import { formatBalance, formatDisplayBalance } from '../utils/format';

type Props = {
  model?:
    | BridgeModel.BridgeTransaction['from']
    | BridgeModel.BridgeTransaction['to'];
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  inputReadonly?: boolean;
  onChange?: (value: Props['model']) => void;
};

function GasFeeWarning({ className }: { className?: string }) {
  return (
    <div className={`flex items-center text-red-400 ${className ?? ''}`}>
      <SvgIcon name="IconWarning" className="mr-1" />
      Not enough gas (0.0035 ETH needed)
    </div>
  );
}

function InputToken({
  model,
  className,
  onChange,
  children,
  style,
  inputReadonly,
}: Props) {
  const [isInputFocus, setIsInputFocus] = useState(false);
  const { getTokenBalance } = useBridgeToken();

  const { data: balance, loading } = useRequest(
    () => getTokenBalance(model.chain, model.tokenMeta),
    {
      before: () => !!model?.chain && !!model?.tokenMeta?.symbol,
      refreshDeps: [model?.chain, model?.tokenMeta?.symbol],
    }
  );
  const formattedBalance = useMemo(
    () => formatBalance(balance, model?.tokenMeta?.decimals),
    [balance, model.tokenMeta?.decimals]
  );

  const isError = useMemo(() => {
    return (
      model.amount && new Big(model.amount).gte(formattedBalance) && !loading
    );
  }, [model.amount, formattedBalance, loading]);

  function handleAllAmount() {
    !inputReadonly &&
      onChange?.({
        ...model,
        amount: formattedBalance,
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
        <div className="w-full flex items-center justify-between text-xs">
          <span>$0.00</span>
          <span className="text-gray-400">
            Balance:
            <a
              className={`ml-1 ${
                formattedBalance && new Big(formattedBalance).gt(0)
                  ? !inputReadonly
                    ? 'hover:underline cursor-pointer text-white'
                    : 'text-white'
                  : ''
              }`}
              onClick={handleAllAmount}
            >
              {formatDisplayBalance(balance, model?.tokenMeta?.decimals)}
            </a>
          </span>
        </div>
      </div>
      {isError ? <GasFeeWarning className="mt-2" /> : null}
    </>
  );
}
export default InputToken;
