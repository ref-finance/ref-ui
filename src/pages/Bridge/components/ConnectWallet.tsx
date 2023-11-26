import React from 'react';

import { useWalletConnectContext } from '../providers/walletConcent';
import { formatSortAddress } from '../utils/format';
import Button from './Button';
import SvgIcon from './SvgIcon';

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

  return (
    <div className={`inline-flex items-center ${className}`}>
      <select
        className="bg-transparent text-white mr-3"
        value={currentChain}
        onChange={(e) =>
          onChangeChain?.(e.target.value as BridgeModel.BridgeSupportChain)
        }
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
          onClick={() => currentChain === 'ETH' && open({ view: 'Account' })}
        >
          <span className="inline-flex w-2 h-2 rounded-full bg-primary mr-2"></span>
          <span className="text-white mr-2">
            {formatSortAddress(accountId)}
          </span>
          {currentChain === 'ETH' && (
            <div
              className="inline-flex transform hover:opacity-80 hover:shadow-lg hover:scale-125"
              onClick={(e) => {
                e.stopPropagation();
                disconnect();
              }}
            >
              <SvgIcon name="IconDisconnect" />
            </div>
          )}
        </Button>
      ) : (
        <Button
          type="primary"
          text
          onClick={() =>
            currentChain === 'NEAR' ? open() : open({ view: 'Connect' })
          }
        >
          Connect
        </Button>
      )}
    </div>
  );
}

export default ConnectWallet;
