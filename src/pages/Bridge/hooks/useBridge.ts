import {
  checkStatusAll,
  onChange,
  setBridgeParams,
  setEthProvider,
  setSignerProvider,
  setNearConnection,
  act,
} from '@near-eth/client';
import { BridgeConfig, EVMConfig } from '../config';
import { ethers } from 'ethers';
import { useCallback, useEffect, useState } from 'react';
import { useWalletConnectContext } from '../providers/walletConcent';
import { toast } from 'react-toastify';
import { Near, WalletConnection } from 'near-api-js';
import { APPID } from '../config';
import { evmServices, nearServices } from '../services/contract';
import bridgeServices, { BridgeTransferParams } from '../services/bridge';
import rainbowBridgeService from '../services/bridge/rainbow';
import { useRequest } from './useHooks';
import { logger } from '../utils/common';

export default function useBridge(params?: {
  enableSubscribeUnclaimed?: boolean;
}) {
  const [actionLoading, setActionLoading] = useState(false);

  const wallet = useWalletConnectContext();

  const setupRainbowBridge = useCallback(() => {
    if (!wallet.EVM.isSignedIn && !wallet.NEAR.isSignedIn) return;
    setBridgeParams(BridgeConfig.Rainbow.bridgeParams);

    setNearConnection(
      new WalletConnection(
        new Near(nearServices.getNearConnectionConfig()),
        APPID
      ) as any
    );
    setEthProvider(
      new ethers.providers.InfuraProvider(
        EVMConfig.Ethereum.network,
        EVMConfig.Ethereum.infuraKey
      )
    );
    setSignerProvider(window.ethWeb3Provider);

    wallet.EVM.chain === 'Ethereum' && checkStatusAll({ loop: 15000 });

    logger.log('bridge: setup rainbow');
  }, [wallet.EVM.isSignedIn, wallet.NEAR.isSignedIn, wallet.EVM.chain]);

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

  async function transfer(params: BridgeTransferParams) {
    try {
      setActionLoading(true);
      const res = await bridgeServices.transfer({
        ...params,
        nearWalletSelector: wallet.NEAR.isSignedIn
          ? wallet?.NEAR?.selector
          : undefined,
      });
      return res;
    } catch (error) {
      console.error(error.message);
      toast.error(error.message.substring(0, 100), { theme: 'dark' });
    } finally {
      setActionLoading(false);
    }
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
