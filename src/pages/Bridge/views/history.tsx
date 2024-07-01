import React, { useState } from 'react';

import Button from '../components/Button';
import ConnectWallet from '../components/ConnectWallet';
import HistoryTable from '../components/HistoryTable';
import { useRequest } from '../hooks/useHooks';
import bridgeHistoryService from '../services/history';
import SvgIcon from '../components/SvgIcon';
import { useRouter } from '../hooks/useRouter';
import { useWalletConnectContext } from '../providers/walletConcent';

type BridgeHistoryFilter = {
  chain: BridgeModel.BridgeSupportChain;
  hash?: string;
  onlyUnclaimed: boolean;
};

function BridgeTransactionHistory() {
  const [historyFilter, setHistoryFilter] = useState<BridgeHistoryFilter>({
    chain: 'Ethereum',
    onlyUnclaimed: false,
  });
  const { getWallet } = useWalletConnectContext();

  const {
    data,
    loading,
    run: refresh,
  } = useRequest(
    () =>
      bridgeHistoryService.query({
        ...historyFilter,
        accountAddress: getWallet(historyFilter.chain)?.accountId,
      }),
    { refreshDeps: [historyFilter], debounceOptions: 1000 }
  );

  const router = useRouter();
  function handleOpenHistory() {
    router.goBack();
  }
  return (
    <div className="bridge-history-container">
      <div className="bridge-plane shadow-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center ">
            <Button text onClick={handleOpenHistory}>
              <SvgIcon name="IconArrowDown" className="transform rotate-90" />
              <span className="text-base ml-2">Bridge Transaction History</span>
            </Button>
          </div>
          <input
            className="bridge-input w-1/2"
            placeholder="Transaction Hash"
            value={historyFilter.hash}
            onChange={(e) =>
              setHistoryFilter({ ...historyFilter, hash: e.target.value })
            }
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="mr-2">Account</span>
            <ConnectWallet
              currentChain={historyFilter.chain}
              onChangeChain={(val) => {
                setHistoryFilter({ ...historyFilter, chain: val });
              }}
            />
          </div>
          <div className="flex items-center">
            Unclaimed only
            <input
              type="checkbox"
              className="bridge-checkbox ml-2"
              checked={historyFilter.onlyUnclaimed}
              onChange={(e) =>
                setHistoryFilter({
                  ...historyFilter,
                  onlyUnclaimed: e.target.checked,
                })
              }
            />
          </div>
        </div>
        <div className="bg-dark-800 rounded">
          <HistoryTable data={data} loading={loading} onRefresh={refresh} />
        </div>
      </div>
    </div>
  );
}

export default BridgeTransactionHistory;
