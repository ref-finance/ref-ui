import React from 'react';
import { Eth, Usdc, Usdt, Banana, Dai } from './icons';

export let farmConfig: {
  [farmId: string]: {
    poolId: number;
    icon: React.FC<any>;
    name: string;
    description: string;
  };
};
const env: string = process.env.NEAR_ENV;
switch (env) {
  case 'mainnet':
    farmConfig = {};
  case 'testnet':
    farmConfig = {
      'ref-finance.testnet@6#0': {
        poolId: 6,
        icon: Eth,
        name: 'ETH-NEAR',
        description: 'About ETH farm',
      },
      'ref-finance.testnet@9#0': {
        poolId: 9,
        icon: Usdc,
        name: 'USDC-NEAR',
        description: 'About USDC farm',
      },
      'ref-finance.testnet@11#0': {
        poolId: 11,
        icon: Usdt,
        name: 'USDT-NEAR',
        description: 'About USDT farm',
      },
      'ref-finance.testnet@19#0': {
        poolId: 19,
        icon: Banana,
        name: 'BANANA-NEAR',
        description: 'About BANANA farm',
      },
      'ref-finance.testnet@20#0': {
        poolId: 20,
        icon: Dai,
        name: 'DAI-NEAR',
        description: 'About DAI farm',
      },
    };
  default:
    farmConfig = {
      'ref-finance.testnet@6#0': {
        poolId: 6,
        icon: Eth,
        name: 'ETH-NEAR',
        description: 'About ETH farm',
      },
      'ref-finance.testnet@9#0': {
        poolId: 9,
        icon: Usdc,
        name: 'USDC-NEAR',
        description: 'About USDC farm',
      },
      'ref-finance.testnet@11#0': {
        poolId: 11,
        icon: Usdt,
        name: 'USDT-NEAR',
        description: 'About USDT farm',
      },
      'ref-finance.testnet@19#0': {
        poolId: 19,
        icon: Banana,
        name: 'BANANA-NEAR',
        description: 'About BANANA farm',
      },
      'ref-finance.testnet@20#0': {
        poolId: 20,
        icon: Dai,
        name: 'DAI-NEAR',
        description: 'About DAI farm',
      },
    };
}
