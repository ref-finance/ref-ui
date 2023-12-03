import {
  setBridgeParams,
  setEthProvider,
  setSignerProvider,
} from '@near-eth/client';
import { setNearConnection } from '@near-eth/client';
import { APPID, BridgeParams } from '../config';
import { ethers } from 'ethers';
import { useCallback, useState } from 'react';
import { rainbowBridgeService } from '../services';
import { useWalletConnectContext } from '../providers/walletConcent';
import getConfig from 'src/services/config';
import { Near, WalletConnection, keyStores } from 'near-api-js';
import { toast } from 'react-toastify';

export default function useRainbowBridge() {
  const wallet = useWalletConnectContext();

  const setupRainbowBridge = useCallback(() => {
    if (!wallet.ETH.accountId) return;
    setBridgeParams(BridgeParams);

    setNearConnection(window.walletNearConnection as any);
    setEthProvider(
      new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
    );
    setSignerProvider(window.ethWeb3Provider);
  }, [wallet.ETH.accountId]);

  const [transferLoading, setTransferLoading] = useState(false);

  const { checkApprove, approve, transfer: _transfer } = rainbowBridgeService;

  async function transfer(
    params: Omit<Parameters<typeof _transfer>[number], 'nearWalletSelector'>
  ) {
    // if (params.from === 'NEAR') {
    //   const [sender] = await window.ethProvider?.request({
    //     method: 'eth_requestAccounts',
    //   });
    //   params.sender = sender;
    // }

    console.log('params', params);
    setTransferLoading(true);
    const result = await _transfer({
      ...params,
      nearWalletSelector: wallet.NEAR.selector,
    }).catch((err) => {
      console.error(err.message);
      toast.error(err.message.substring(0, 100), { theme: 'dark' });
    });
    console.log('result', result);
    setTransferLoading(false);
    return result;
  }

  return {
    setupRainbowBridge,
    transferLoading,
    transfer,
    checkApprove,
    approve,
  };
}
