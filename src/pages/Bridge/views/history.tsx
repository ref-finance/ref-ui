import React, { useState } from 'react';

import Button from '../components/Button';
import ConnectWallet from '../components/ConnectWallet';
import HistoryTable from '../components/HistoryTable';
import { useRequest } from '../hooks/useRequest';
import { bridgeHistoryService } from '../services';
import SvgIcon from '../components/SvgIcon';
import { useRouter } from '../hooks/useRouter';

type BridgeHistoryFilter = {
  chain: BridgeModel.BridgeSupportChain;
  onlyUnclaimed: boolean;
};

function BridgeTransactionHistory() {
  const [historyFilter, setHistoryFilter] = useState<BridgeHistoryFilter>({
    chain: 'ETH',
    onlyUnclaimed: false,
  });

  const { data, loading, run } = useRequest(
    () => bridgeHistoryService.query(historyFilter),
    { refreshDeps: [historyFilter] }
  );

  const router = useRouter();
  function handleOpenHistory() {
    router.goBack();
  }
  return (
    <div className="bridge-history-container">
      <div className="bridge-plane shadow-4xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center text-white text-base ">
            <Button className="mr-2" text onClick={handleOpenHistory}>
              <SvgIcon name="IconArrowDown" className="transform rotate-90" />
            </Button>
            Bridge Transaction History
          </div>
          <input
            className="bridge-input w-1/2"
            placeholder="Transaction Hash"
          />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <span className="mr-2">Account</span>
            <ConnectWallet
              currentChain={historyFilter.chain}
              onChangeChain={(val) => {
                console.log(val);
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
          <HistoryTable data={data} />
        </div>
      </div>
    </div>
  );
}

export default BridgeTransactionHistory;
