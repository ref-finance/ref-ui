import React from 'react';
import { Eth, Usdc, Usdt, Banana, Dai } from './icons';

export let farmConfig: {
  [farmId: string]: {
    icon: React.FC<any>;
    name: string;
  };
};
const env: string = process.env.NEAR_ENV;
switch (env) {
  case 'mainnet':
    farmConfig = {};
  case 'testnet':
    farmConfig = {
      'ref-finance.testnet@6#0': {
        icon: Eth,
        name: 'ETH-NEAR',
      },
      'ref-finance.testnet@9#0': {
        icon: Usdc,
        name: 'USDC-NEAR',
      },
      'ref-finance.testnet@11#0': {
        icon: Usdt,
        name: 'USDT-NEAR',
      },
      'ref-finance.testnet@19#0': {
        icon: Banana,
        name: 'BANANA-NEAR',
      },
      'ref-finance.testnet@20#0': {
        icon: Dai,
        name: 'DAI-NEAR',
      },
    };
  default:
    farmConfig = {
      'ref-finance.testnet@6#0': {
        icon: Eth,
        name: 'ETH-NEAR',
      },
      'ref-finance.testnet@9#0': {
        icon: Usdc,
        name: 'USDC-NEAR',
      },
      'ref-finance.testnet@11#0': {
        icon: Usdt,
        name: 'USDT-NEAR',
      },
      'ref-finance.testnet@19#0': {
        icon: Banana,
        name: 'BANANA-NEAR',
      },
      'ref-finance.testnet@20#0': {
        icon: Dai,
        name: 'DAI-NEAR',
      },
    };
}
