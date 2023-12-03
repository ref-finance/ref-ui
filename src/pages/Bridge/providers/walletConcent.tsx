import React, { createContext, useEffect, useMemo } from 'react';
import { useWalletSelector } from 'src/context/WalletSelectorContext';
export { WalletSelectorContextProvider as WalletConnectNearProvider } from 'src/context/WalletSelectorContext';
import { setupWeb3Onboard } from '../hooks/useWeb3Onboard';
import { Web3OnboardProvider, useConnectWallet } from '@web3-onboard/react';
import { ethers } from 'ethers';
import getConfig from 'src/services/config';
import { Near, WalletConnection, keyStores } from 'near-api-js';
import { APPID } from '../config';

const WalletConnectContext = createContext(null);

const web3Onboard = setupWeb3Onboard();

export function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletConnectContext.Provider value={null}>
      <Web3OnboardProvider web3Onboard={web3Onboard}>
        {children}
      </Web3OnboardProvider>
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnectContext() {
  const { accountId, modal, ...context } = useWalletSelector();
  const isSignedIn = useMemo(() => !!accountId, [accountId]);

  const { networkId, helperUrl, walletUrl, nodeUrl } = getConfig();
  window.Near = new Near({
    keyStore: new keyStores.BrowserLocalStorageKeyStore(),
    networkId,
    nodeUrl,
    helperUrl,
    walletUrl,
    headers: {},
  });

  window.walletNearConnection = new WalletConnection(window.Near, APPID);

  const walletNearHooks = {
    ...context,
    open: modal.show,
    close: modal.hide,
    accountId,
    isSignedIn,
    disconnect: window.near?.signOut,
  };

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const walletEthHooks = {
    accountId: wallet?.accounts?.[0]?.address,
    isSignedIn: wallet && !connecting,
    open: connect,
    disconnect: () => disconnect({ label: wallet.label }),
  };

  useEffect(() => {
    if (wallet?.provider && walletEthHooks.accountId) {
      window.ethProvider = wallet?.provider;
      window.ethWeb3Provider = new ethers.providers.Web3Provider(
        wallet?.provider,
        'any'
      );
    }
  }, [wallet?.provider, walletEthHooks.accountId]);

  if (!context) {
    throw new Error(
      'useWalletConnectContext must be used within a WalletConnectProvider'
    );
  }
  return {
    NEAR: walletNearHooks,
    ETH: walletEthHooks,
  };
}
