import React, { createContext, useEffect, useMemo } from 'react';
import {
  ACCOUNT_ID_KEY,
  useWalletSelector,
} from 'src/context/WalletSelectorContext';
export { WalletSelectorContextProvider as WalletConnectNearProvider } from 'src/context/WalletSelectorContext';
import { setupWeb3Onboard } from '../hooks/useWeb3Onboard';
import {
  Web3OnboardProvider,
  useConnectWallet,
  useSetChain,
} from '@web3-onboard/react';
import { ethers } from 'ethers';
import { EVMConfig } from '../config';

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

  useEffect(() => {
    async function initWallet() {
      const wallet = await window.selector.wallet();
      window.nearWallet = wallet;
    }
    isSignedIn && initWallet();
  }, [isSignedIn]);

  const walletNearHooks = {
    ...context,
    open: modal.show,
    close: modal.hide,
    accountId,
    isSignedIn,
    async disconnect() {
      try {
        const curWallet = await window.selector.wallet();
        await curWallet?.signOut();
        localStorage.removeItem(ACCOUNT_ID_KEY);
        window.location.reload();
      } catch (error) {
        console.error('disconnect error: ', error);
      }
    },
  };

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();

  const [{ connectedChain }, setChain] = useSetChain();
  const isEVMSignedIn = wallet && !connecting;
  const walletEvmHooks = {
    accountId: wallet?.accounts?.[0]?.address,
    isSignedIn: isEVMSignedIn,
    open: connect,
    chain: (Object.entries(EVMConfig).find(
      ([_, config]) =>
        typeof config === 'object' &&
        'chainId' in config &&
        config.chainId === parseInt(connectedChain?.id, 16)
    )?.[0] || 'Ethereum') as BridgeModel.BridgeSupportChain,
    setChain: (chainId: number) => {
      if (!isEVMSignedIn) return;
      const chainHex = '0x' + chainId.toString(16);
      if (chainHex !== connectedChain?.id) setChain({ chainId: chainHex });
    },
    disconnect: () => disconnect({ label: wallet.label }),
  };

  useEffect(() => {
    if (wallet?.provider && walletEvmHooks.accountId) {
      window.ethProvider = wallet?.provider;
      window.ethWeb3Provider = new ethers.providers.Web3Provider(
        wallet?.provider,
        'any'
      );
    }
  }, [wallet?.provider, walletEvmHooks.accountId]);

  const getWallet = (chain: string) => {
    if (chain === 'NEAR') {
      return walletNearHooks;
    } else {
      return walletEvmHooks;
    }
  };

  if (!context) {
    throw new Error(
      'useWalletConnectContext must be used within a WalletConnectProvider'
    );
  }

  return {
    NEAR: walletNearHooks,
    EVM: walletEvmHooks,
    getWallet,
  };
}
