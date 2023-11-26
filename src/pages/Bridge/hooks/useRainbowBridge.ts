import {
  setBridgeParams,
  setEthProvider,
  setSignerProvider,
} from '@near-eth/client';
import { keyStores, Near, WalletConnection } from 'near-api-js';
import { setNearConnection } from '@near-eth/client';
import { APPID, RainbowBridgeParams } from '../config';
import getConfig from 'src/services/config';
import { ethers } from 'ethers';
import { useEffect } from 'react';
import { rainbowBridgeService } from '../services';

export default function useRainbowBridge() {
  const { networkId, helperUrl, walletUrl, nodeUrl } = getConfig();

  useEffect(() => {
    function setupRainbowBridge() {
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
      setNearConnection(nearConnection);

      setEthProvider(
        new ethers.providers.JsonRpcProvider('https://rpc.ankr.com/eth')
      );
      setSignerProvider(
        new ethers.providers.Web3Provider(window.ethereum, 'any')
      );
    }
    setBridgeParams(RainbowBridgeParams);
    setupRainbowBridge();
  }, [helperUrl, networkId, nodeUrl, walletUrl]);

  const transfer = rainbowBridgeService.transfer;

  return { transfer };
}
