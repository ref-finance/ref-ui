import React, { createContext, useEffect, useMemo } from 'react';
import { useWalletSelector } from 'src/context/WalletSelectorContext';
export { WalletSelectorContextProvider as WalletConnectNearProvider } from 'src/context/WalletSelectorContext';
import { setupWeb3Onboard } from '../hooks/useWeb3Onboard';
import {
  Web3OnboardProvider,
  useConnectWallet,
  useNotifications,
} from '@web3-onboard/react';

const WalletConnectContext = createContext(null);

export function WalletConnectProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const web3Onboard = setupWeb3Onboard();
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

  const walletNearHooks = {
    ...context,
    open: modal.show,
    close: modal.hide,
    accountId,
    isSignedIn,
    disconnect: modal.show,
  };

  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet();
  const walletEthHooks = {
    accountId: wallet?.accounts?.[0]?.address,
    isSignedIn: wallet && !connecting,
    open: connect,
    disconnect: () => disconnect({ label: wallet.label }),
  };

  const [
    notifications, // the list of all notifications that update when notifications are added, updated or removed
    customNotification, // a function that takes a customNotification object and allows custom notifications to be shown to the user, returns an update and dismiss callback
    updateNotify, // a function that takes a Notify object to allow updating of the properties
    preflightNotifications, // a function that takes a PreflightNotificationsOption to create preflight notifications
  ] = useNotifications();

  // View notifications as they come in if you would like to handle them independent of the notification display
  useEffect(() => {
    console.log('notifications', notifications);
  }, [notifications]);

  if (!context) {
    throw new Error(
      'useWalletConnectContext must be used within a WalletConnectProvider'
    );
  }
  return {
    NEAR: walletNearHooks,
    ETH: walletEthHooks,
    ethProvider: wallet?.provider,
  };
}
