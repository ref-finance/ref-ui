import React from 'react';
import { init } from '@web3-onboard/react';
import injectedModule, { ProviderLabel } from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';
import { APP_HOST, EVMConfig } from '../config';

const WALLET_CONNECT_OPTION: Parameters<
  typeof walletConnectModule | typeof ledgerModule
>[number] = {
  projectId: EVMConfig.walletConnectProjectId,
  requiredChains: [
    EVMConfig.chains.ethereum.chainId,
    EVMConfig.chains.arbitrum.chainId,
  ],
  dappUrl: APP_HOST,
};

export function setupWeb3Onboard() {
  const injected = injectedModule({
    displayUnavailable: [
      ProviderLabel.MathWallet,
      ProviderLabel.Coinbase,
      ProviderLabel.OKXWallet,
      ProviderLabel.Trust,
      ProviderLabel.Binance,
    ],
    sort: (wallets) => {
      const metaMask = wallets.find(
        ({ label }) => label === ProviderLabel.MetaMask
      );

      return [
        metaMask,
        ...wallets.filter(({ label }) => label !== ProviderLabel.MetaMask),
      ].filter((wallet) => wallet);
    },
  });
  const walletConnect = walletConnectModule(WALLET_CONNECT_OPTION);
  const ledger = ledgerModule({
    ...WALLET_CONNECT_OPTION,
    walletConnectVersion: 2,
  });

  const chains = Object.values(EVMConfig.chains).map(
    ({ id, token, label, rpcUrl }) => ({ id, token, label, rpcUrl })
  );

  return init({
    wallets: [injected, walletConnect, ledger],
    chains,
    theme: 'dark',
    appMetadata: {
      name: 'Ref Finance',
      icon: `data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTIzLjg3MDkgMjIuNTgwNlYzMC45Njc3SDMyLjI1OEwyMy44NzA5IDIyLjU4MDZaTTE2LjYxMjkgMTUuMzIyNUwxOS45MDMyIDE4LjYxMjhMMjMuMjI1OCAxNS4yOTAzVjkuMTkzNDlIMTYuNjEyOVYxNS4zMjI1Wk0xNi42MTI5IDE4LjI4ODZWMzAuOTY3N0gyMy4yMjU4VjE4LjI1NjRMMTkuOTAzMiAyMS41NzlMMTYuNjEyOSAxOC4yODg2Wk0yNC4yNzQyIDkuMTkzNDlIMjMuODcwOVYxNC42NDY3TDI4LjA5MDMgMTAuNDI1N0MyNi45OCA5LjYyMjk2IDI1LjY0NDMgOS4xOTE2NyAyNC4yNzQyIDkuMTkzNDlaTTkuMDMyMjMgMjAuODM3VjMwLjk2NzdIMTUuOTY3N1YxNy42NDUxTDE0LjA5NjcgMTUuNzcyNUw5LjAzMjIzIDIwLjgzN1pNOS4wMzIyMyAxNy44NzI1TDE0LjA5NjcgMTIuODA4TDE1Ljk2NzcgMTQuNjc3NFY5LjE5MzQ5SDkuMDMyMjNWMTcuODcyNVpNMzAuODA2NCAxNS43MjU3QzMwLjgwODIgMTQuMzU1NiAzMC4zNzY5IDEzLjAxOTkgMjkuNTc0MiAxMS45MDk2TDIzLjg3MDkgMTcuNjExMlYyMi4yNThIMjQuMjc0MkMyNi4wMDY2IDIyLjI1OCAyNy42NjgxIDIxLjU2OTggMjguODkzMiAyMC4zNDQ3QzMwLjExODIgMTkuMTE5NyAzMC44MDY0IDE3LjQ1ODIgMzAuODA2NCAxNS43MjU3WiIgZmlsbD0id2hpdGUiLz4KPHBhdGggZD0iTTI3LjkwMzIgNy43NDE5NEwzMi4yNTggMTIuMDk2OFY3Ljc0MTk0SDI3LjkwMzJaIiBmaWxsPSIjMDBDMDhCIi8+Cjwvc3ZnPgo=`,
      description: 'Where your DeFi journey on NEAR starts',
      explore: APP_HOST,
    },
    accountCenter: { desktop: { enabled: false }, mobile: { enabled: false } },
    connect: {
      /**
       * If set to true, the most recently connected wallet will store in
       * local storage. Then on init, onboard will try to reconnect to
       * that wallet with no modals displayed
       */
      autoConnectLastWallet: true,
    },
  });
}
