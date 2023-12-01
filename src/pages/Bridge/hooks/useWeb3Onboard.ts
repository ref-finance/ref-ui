import React from 'react';
import { init } from '@web3-onboard/react';
import injectedModule from '@web3-onboard/injected-wallets';
import walletConnectModule from '@web3-onboard/walletconnect';
import ledgerModule from '@web3-onboard/ledger';

const INFURA_KEY = '45ad2962c1b5465bb6fe62db0d35b42f';
const WALLET_CONNECT_OPTION: Parameters<
  typeof walletConnectModule | typeof ledgerModule
>[number] = {
  projectId: '669d1b9f59163a92d90a3c1ff78a7326',
  requiredChains: [1, 56, 137],
  dappUrl: 'https://app.ref.finance',
};
const CHAINS = [
  {
    id: '0x1',
    token: 'ETH',
    label: 'Ethereum Mainnet',
    rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
  },
  {
    id: 42161,
    token: 'ARB-ETH',
    label: 'Arbitrum One',
    rpcUrl: 'https://rpc.ankr.com/arbitrum',
  },
  {
    id: '0xa4ba',
    token: 'ARB',
    label: 'Arbitrum Nova',
    rpcUrl: 'https://nova.arbitrum.io/rpc',
  },
  {
    id: '0x2105',
    token: 'ETH',
    label: 'Base',
    rpcUrl: 'https://mainnet.base.org',
  },
];

export function setupWeb3Onboard() {
  const injected = injectedModule();
  const walletConnect = walletConnectModule(WALLET_CONNECT_OPTION);
  const ledger = ledgerModule({
    ...WALLET_CONNECT_OPTION,
    walletConnectVersion: 2,
  });

  return init({
    wallets: [injected, walletConnect, ledger],
    chains: CHAINS,
    theme: 'dark',
    appMetadata: {
      name: 'Ref Finance',
      icon: `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='16 24 248 248' style='background: %23000'%3E%3Cpath d='M164,164v52h52Zm-45-45,20.4,20.4,20.6-20.6V81H119Zm0,18.39V216h41V137.19l-20.6,20.6ZM166.5,81H164v33.81l26.16-26.17A40.29,40.29,0,0,0,166.5,81ZM72,153.19V216h43V133.4l-11.6-11.61Zm0-18.38,31.4-31.4L115,115V81H72ZM207,121.5h0a40.29,40.29,0,0,0-7.64-23.66L164,133.19V162h2.5A40.5,40.5,0,0,0,207,121.5Z' fill='%23fff'/%3E%3Cpath d='M189 72l27 27V72h-27z' fill='%2300c08b'/%3E%3C/svg%3E%0A`,
      description: 'Where your DeFi journey on NEAR starts',
      explore: 'https://app.ref.finance',
    },
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
