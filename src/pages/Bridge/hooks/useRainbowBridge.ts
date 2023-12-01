import {
  setBridgeParams,
  setEthProvider,
  setSignerProvider,
} from '@near-eth/client';
import { keyStores, Near, WalletConnection } from 'near-api-js';
import { setNearConnection } from '@near-eth/client';
import { APPID, BridgeParams } from '../config';
import getConfig from 'src/services/config';
import { ethers } from 'ethers';
import { useEffect, useCallback } from 'react';
import { rainbowBridgeService } from '../services';
import { useWalletConnectContext } from '../providers/walletConcent';

export default function useRainbowBridge() {
  const { networkId, helperUrl, walletUrl, nodeUrl } = getConfig();
  const { ethProvider, ...wallet } = useWalletConnectContext();

  const setupRainbowBridge = useCallback(() => {
    if (!ethProvider) return;
    setBridgeParams(BridgeParams);
    const nearConnection = new WalletConnection(
      new Near({
        keyStore: new keyStores.BrowserLocalStorageKeyStore(),
        networkId,
        nodeUrl,
        helperUrl,
        walletUrl,
        headers: {},
      }),
      APPID
    );
    setNearConnection(nearConnection as any);

    setEthProvider(
      new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
    );

    const ethWeb3Provider = new ethers.providers.Web3Provider(
      ethProvider,
      'any'
    );
    window.ethWeb3Provider = setSignerProvider(
      ethWeb3Provider
    ) as ethers.providers.Web3Provider;
    console.log('ethersProvider: ', window.ethWeb3Provider);
  }, [ethProvider, helperUrl, networkId, nodeUrl, walletUrl]);

  const { checkApprove, approve, transfer: _transfer } = rainbowBridgeService;

  async function transfer(
    params: Omit<Parameters<typeof _transfer>[number], 'nearWalletSelector'>
  ) {
    if (params.from === 'NEAR') {
      const [sender] = await ethProvider.request({
        method: 'eth_requestAccounts',
      });
      params.sender = sender;
    }
    return _transfer({ ...params, nearWalletSelector: wallet.NEAR.selector });
  }

  return {
    setupRainbowBridge,
    transfer,
    checkApprove,
    approve,
  };
}
