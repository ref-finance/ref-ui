import React, { useState } from 'react';

import Button from '../components/Button';
import ConnectWallet from '../components/ConnectWallet';
import HistoryTable from '../components/HistoryTable';
import { useRequest, useStorageState } from '../hooks/useHooks';
import bridgeHistoryService from '../services/history';
import SvgIcon from '../components/SvgIcon';
import { useRouter } from '../hooks/useRouter';
import { useWalletConnectContext } from '../providers/walletConcent';
import { SupportChains } from '../config';
import { storageStore } from '../utils/common';
import { isMobile } from 'src/utils/device';

type BridgeHistoryFilter = {
  chain: BridgeModel.BridgeSupportChain;
  hash?: string;
  onlyUnclaimed: boolean;
};

function BridgeTransactionHistory() {
  const [historyFilter, setHistoryFilter] = useState<BridgeHistoryFilter>({
    chain:
      storageStore().get<BridgeModel.BridgeTransferFormData['from']>(
        'bridgeFromValue'
      )?.chain || SupportChains?.[0],
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
    {
      refreshDeps: [historyFilter, getWallet(historyFilter.chain)?.accountId],
      before: () => getWallet(historyFilter.chain).isSignedIn,
      debounceOptions: { wait: 500, leading: true },
    }
  );

  const router = useRouter();
  function handleOpenHistory() {
    router.replace('/bridge');
  }
  return (
    <div className="bridge-history-container">
      <div className="bridge-plane shadow-4xl">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-6 ">
          <div className="flex items-center ">
            <Button text onClick={handleOpenHistory}>
              <SvgIcon name="IconArrowDown" className="transform rotate-90" />
              <span className="text-base ml-2">
                {isMobile() ? 'History' : 'Bridge Transaction History'}
              </span>
            </Button>
          </div>
          <div className="relative  w-1/2">
            <input
              className="bridge-input"
              placeholder="Tx Hash"
              value={historyFilter.hash}
              onChange={(e) =>
                setHistoryFilter({ ...historyFilter, hash: e.target.value })
              }
            />
            {historyFilter.hash && (
              <div
                className="absolute top-1/2 right-3 transform -translate-y-1/2 cursor-pointer bg-gray-700 hover:bg-gray-500 hover:text-white w-5 h-5 text-xs flex items-center justify-center rounded-full"
                onClick={() => setHistoryFilter({ ...historyFilter, hash: '' })}
              >
                <SvgIcon name="IconClose" className="transform scale-75" />
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span>Account</span>
            <ConnectWallet
              currentChain={historyFilter.chain}
              onChangeChain={(val) => {
                setHistoryFilter({ ...historyFilter, chain: val });
              }}
            />
          </div>
          {/* <div className="flex items-center">
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
          </div> */}
        </div>
        <div className="bg-dark-800 rounded">
          <HistoryTable
            data={data?.list || []}
            loading={loading}
            onRefresh={refresh}
          />
        </div>
      </div>
    </div>
  );
}

export default BridgeTransactionHistory;
