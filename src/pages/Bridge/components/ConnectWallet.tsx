import React, { useState } from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';
import { formatSortAddress } from '../utils/format';
import Button from './Button';
import SvgIcon from './SvgIcon';
import CopyToClipboard from 'react-copy-to-clipboard';
import { useAutoResetState } from '../hooks/useHooks';

type Props = {
  currentChain: BridgeModel.BridgeSupportChain;
  className?: string;
  onChangeChain?: (chain: BridgeModel.BridgeSupportChain) => void;
};

const chainList: { label: string; value: BridgeModel.BridgeSupportChain }[] = [
  { label: 'Ethereum', value: 'ETH' },
  { label: 'NEAR', value: 'NEAR' },
];

function ConnectWallet({ currentChain, className, onChangeChain }: Props) {
  const {
    [currentChain]: { isSignedIn, accountId, open, disconnect },
  } = useWalletConnectContext();

  const [showToast, setShowToast] = useAutoResetState(false, 2000);

  return (
    <div className={`inline-flex items-center ${className}`}>
      <select
        className="bg-transparent text-white mr-3"
        value={currentChain}
        onChange={(e) =>
          onChangeChain?.(e.target.value as BridgeModel.BridgeSupportChain)
        }
        onFocus={(e) => e.target.blur()}
      >
        {chainList.map(({ label, value }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>
      {isSignedIn ? (
        <Button
          rounded
          size="small"
          // onClick={() => currentChain === 'ETH' && open({ view: 'Account' })}
        >
          <span className="inline-flex w-2 h-2 rounded-full bg-primary mr-2"></span>
          <span className="relative text-white mr-2">
            <CopyToClipboard text={accountId} onCopy={() => setShowToast(true)}>
              <span> {formatSortAddress(accountId)}</span>
            </CopyToClipboard>
            {showToast && (
              <span className="text-xs text-white rounded-lg px-2.5 py-1.5 absolute -top-10 left-0 bg-black z-50">
                Copied!
              </span>
            )}
          </span>
          {
            <div
              className="inline-flex transform hover:opacity-80 hover:shadow-lg hover:scale-125"
              onClick={(e) => {
                e.stopPropagation();
                disconnect();
              }}
            >
              <SvgIcon name="IconDisconnect" />
            </div>
          }
        </Button>
      ) : (
        <Button type="primary" text onClick={() => open()}>
          Connect
        </Button>
      )}
    </div>
  );
}

export default ConnectWallet;
