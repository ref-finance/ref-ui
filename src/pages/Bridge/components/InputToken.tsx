import React, { useEffect, useMemo, useState } from 'react';
import SvgIcon from './SvgIcon';
import Big from 'big.js';
import { formatNumber } from '../utils/format';
import { useWalletConnectContext } from '../providers/walletConcent';
import ConnectWallet from './ConnectWallet';

type Props = {
  model?:
    | BridgeModel.BridgeTransferFormData['from']
    | BridgeModel.BridgeTransferFormData['to'];
  balance?: string;
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  inputReadonly?: boolean;
  errorMessage?: string;
  onChange?: (value: Props['model']) => void;
};

function ErrorMessage({
  className,
  text,
}: {
  className?: string;
  text: string;
}) {
  return (
    <div className={`flex items-center text-danger ${className ?? ''}`}>
      <SvgIcon name="IconWarning" className="mr-1" />
      {text}
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
  errorMessage,
}: Props) {
  const { getWallet } = useWalletConnectContext();

  const [isInputFocus, setIsInputFocus] = useState(false);

  function handleAllAmount() {
    if (!inputReadonly) {
      const amount = new Big(balance).round(8, Big.roundDown).toString();
      onChange?.({
        ...model,
        amount,
      });
    }
  }

  return (
    <div className="relative">
      <div
        className={`bridge-input bridge-input-token ${[
          errorMessage && 'is-error',
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
      {errorMessage ? (
        <ErrorMessage className="animate-fadeIn mt-2" text={errorMessage} />
      ) : null}
      {!getWallet(model.chain).isSignedIn && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center backdrop-filter backdrop-blur-md bg-black bg-opacity-10 bridge-input bridge-input-token">
          
          <ConnectWallet
            currentChain={model.chain}
            connectPlaceholder={`Connect to ${model.chain}`}
            hideChainSelector={true}
          />
         
        </div>
      )}
    </div>
  );
}
export default InputToken;
