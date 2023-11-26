import {
  createWeb3Modal,
  defaultWagmiConfig,
  useWeb3Modal,
} from '@web3modal/wagmi/react';
import React, { createContext, useMemo } from 'react';
import { useWalletSelector } from 'src/context/WalletSelectorContext';
import { arbitrum, mainnet } from 'viem/chains';
import { useAccount, useDisconnect, WagmiConfig } from 'wagmi';

export { WalletSelectorContextProvider as WalletConnectNearProvider } from 'src/context/WalletSelectorContext';

const WalletConnectContext = createContext(null);

// 1. Get projectId
const projectId = '669d1b9f59163a92d90a3c1ff78a7326';

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

const chains = [mainnet, arbitrum];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains, defaultChain: mainnet });

export function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletConnectContext.Provider value={null}>
      <WagmiConfig config={wagmiConfig}>{children}</WagmiConfig>
    </WalletConnectContext.Provider>
  );
}

export function useWalletConnectContext() {
  const { accountId, modal, ...context } = useWalletSelector();
  const isSignedIn = useMemo(() => !!accountId, [accountId]);

  const web3ModalHooks = useWeb3Modal();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  const walletNearHooks = {
    ...context,
    open: modal.show,
    close: modal.hide,
    accountId,
    isSignedIn,
    disconnect: modal.show,
  };

  const walletEthHooks = {
    ...web3ModalHooks,
    accountId: address,
    isSignedIn: isConnected,
    disconnect,
  };

  if (!context || !web3ModalHooks) {
    throw new Error(
      'useWalletConnectContext must be used within a WalletConnectProvider'
    );
  }
  return { NEAR: walletNearHooks, ETH: walletEthHooks };
}
