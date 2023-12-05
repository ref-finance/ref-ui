import {
  checkStatusAll,
  onChange,
  setBridgeParams,
  setEthProvider,
  setSignerProvider,
  setNearConnection,
  act,
  decorate,
} from '@near-eth/client';
import { BridgeParams, EthereumConfig } from '../config';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { rainbowBridgeService } from '../services';
import { useWalletConnectContext } from '../providers/walletConcent';
import { toast } from 'react-toastify';

export default function useRainbowBridge(params?: {
  enableSubscribeUnclaimed?: boolean;
}) {
  const [actionLoading, setActionLoading] = useState(false);

  const wallet = useWalletConnectContext();

  const setupRainbowBridge = useCallback(() => {
    if (!wallet.ETH.isSignedIn && !wallet.NEAR.isSignedIn) return;
    setBridgeParams(BridgeParams);

    setNearConnection(window.walletNearConnection as any);
    setEthProvider(
      new ethers.providers.InfuraProvider(
        EthereumConfig.network,
        EthereumConfig.infuraKey
      )
    );
    setSignerProvider(window.ethWeb3Provider);

    checkStatusAll({ loop: 15000 });

    console.log('setup rainbow bridge');
  }, [wallet.ETH.isSignedIn, wallet.NEAR.isSignedIn]);

  const {
    checkApprove,
    approve,
    transfer: _transfer,
    query: queryTransactions,
  } = rainbowBridgeService;

  const [unclaimedTransactions, setUnclaimedTransactions] = useState<
    BridgeModel.BridgeTransaction[]
  >([]);

  useEffect(() => {
    if (params?.enableSubscribeUnclaimed) {
      function onSubscribeUnclaimedTransactions() {
        queryTransactions({ filter: (v) => v.status === 'action-needed' }).then(
          (data) => setUnclaimedTransactions(data)
        );
        onChange(() =>
          queryTransactions({
            filter: (v) => v.status === 'action-needed',
          }).then((data) => setUnclaimedTransactions(data))
        );
      }
      onSubscribeUnclaimedTransactions();
    }
  }, [params?.enableSubscribeUnclaimed]);

  async function transfer(
    params: Omit<Parameters<typeof _transfer>[number], 'nearWalletSelector'>
  ) {
    console.log('transfer params', params);
    setActionLoading(true);
    const result = await _transfer({
      ...params,
      nearWalletSelector: wallet.NEAR.selector,
    }).catch((err) => {
      console.error(err.message);
      toast.error(err.message.substring(0, 100), { theme: 'dark' });
    });
    setActionLoading(false);
    console.log('transfer result', result);
    return result as BridgeModel.BridgeTransaction;
  }
  async function callAction(id: string) {
    setActionLoading(true);
    const result = await act(id).catch((err) => {
      console.error(err.message);
      toast.error(err.message.substring(0, 100), { theme: 'dark' });
    });
    setActionLoading(false);
    return result;
  }

  function getDecodedTransaction(data: BridgeModel.BridgeTransaction) {
    const result = decorate(data, { locale: 'en_US' });
    return result;
  }

  return {
    setupRainbowBridge,
    actionLoading,
    transfer,
    callAction,
    checkApprove,
    approve,
    unclaimedTransactions,
    getDecodedTransaction,
  };
}
