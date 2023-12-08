import {
  checkStatusAll,
  onChange,
  setBridgeParams,
  setEthProvider,
  setSignerProvider,
  setNearConnection,
  act,
} from '@near-eth/client';
import { BridgeConfig, EthereumConfig } from '../config';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import rainbowBridgeService from '../services/rainbowBridge';
import { useWalletConnectContext } from '../providers/walletConcent';
import { toast } from 'react-toastify';
import { WalletConnection } from 'near-api-js';
import { APPID } from '../config';
import { nearServices } from '../services/contract';

export default function useRainbowBridge(params?: {
  enableSubscribeUnclaimed?: boolean;
}) {
  const [actionLoading, setActionLoading] = useState(false);

  const wallet = useWalletConnectContext();

  const setupRainbowBridge = useCallback(() => {
    if (!wallet.ETH.isSignedIn && !wallet.NEAR.isSignedIn) return;
    setBridgeParams(BridgeConfig.Rainbow.bridgeParams);

    setNearConnection(
      new WalletConnection(nearServices.getNear(), APPID) as any
    );
    setEthProvider(
      new ethers.providers.InfuraProvider(
        EthereumConfig.network,
        EthereumConfig.infuraKey
      )
    );
    setSignerProvider(window.ethWeb3Provider);

    checkStatusAll({ loop: 15000 });

    console.log('bridge: setup rainbow');
  }, [wallet.ETH.isSignedIn, wallet.NEAR.isSignedIn]);

  const [unclaimedTransactions, setUnclaimedTransactions] = useState<
    BridgeModel.BridgeTransaction[]
  >([]);

  useEffect(() => {
    if (params?.enableSubscribeUnclaimed) {
      function onSubscribeUnclaimedTransactions() {
        rainbowBridgeService
          .query({ filter: (v) => v.status === 'action-needed' })
          .then((data) => setUnclaimedTransactions(data));
        onChange(() =>
          rainbowBridgeService
            .query({
              filter: (v) => v.status === 'action-needed',
            })
            .then((data) => setUnclaimedTransactions(data))
        );
      }
      onSubscribeUnclaimedTransactions();
    }
  }, [params?.enableSubscribeUnclaimed]);

  async function transfer(
    params: Omit<
      Parameters<typeof rainbowBridgeService.transfer>[number],
      'nearWalletSelector'
    >
  ) {
    setActionLoading(true);
    const result = await rainbowBridgeService
      .transfer({
        ...params,
        nearWalletSelector: wallet.NEAR.isSignedIn
          ? wallet?.NEAR?.selector
          : undefined,
      })
      .catch((err) => {
        console.error(err.message);
        toast.error(err.message.substring(0, 100), { theme: 'dark' });
      });
    setActionLoading(false);
    console.log('bridge: transfer result', result);
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

  return {
    setupRainbowBridge,
    actionLoading,
    transfer,
    callAction,
    unclaimedTransactions,
  };
}
