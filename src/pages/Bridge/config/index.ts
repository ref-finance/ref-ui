import erc20Abi from './../abi/erc20.json';
import erc20LockerAbi from './../abi/erc20Locker.json';
import nearOnEthClientAbi from './../abi/nearOnEthClient.json';
import auroraErc20Abi from './../abi/auroraErc20.json';
import etherCustodianAbi from './../abi/etherCustodian.json';
import eNEARAbi from './../abi/eNEAR.json';
import { formatFileUrl } from '../utils/format';

export const APPID = 'ref-finance';
export const APP_HOST = 'https://app.ref.finance';

export const IS_MAINNET = !['testnet', 'pub-testnet'].includes(
  process.env.REACT_APP_NEAR_ENV
);
export const IS_TESTNET = ['testnet', 'pub-testnet'].includes(
  process.env.REACT_APP_NEAR_ENV
);

const INFURA_KEY = '45ad2962c1b5465bb6fe62db0d35b42f';
const EVM_NETWORK = IS_MAINNET ? 'mainnet' : 'testnet';
export const EVMConfig = {
  Ethereum: {
    network: IS_MAINNET ? 'mainnet' : 'sepolia',
    infuraKey: INFURA_KEY,
    explorerUrl: IS_MAINNET
      ? 'https://etherscan.io'
      : 'https://sepolia.etherscan.io',
    chainId: IS_MAINNET ? 1 : 11155111,
  },
  Arbitrum: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://arbiscan.io',
    chainId: 42161,
  },

  walletConnectProjectId: '669d1b9f59163a92d90a3c1ff78a7326',
  chains: [
    {
      id: IS_MAINNET ? '0x1' : '0xaa36a7',
      token: 'ETH',
      label: `Ethereum ${EVM_NETWORK}`,
      rpcUrl: `https://${EVM_NETWORK}.infura.io/v3/${INFURA_KEY}`,
    },
    {
      id: '0x2105',
      token: 'ETH',
      label: 'Base',
      rpcUrl: `https://${EVM_NETWORK}.base.org`,
    },
    {
      id: '0xA4B1',
      token: 'ARB-ETH',
      label: 'Arbitrum',
      rpcUrl: 'https://rpc.ankr.com/arbitrum',
    },
  ],
};

export const NearConfig = {
  explorerUrl: IS_MAINNET
    ? 'https://nearblocks.io'
    : 'https://testnet.nearblocks.io',
};

export const SupportChains: BridgeModel.BridgeSupportChain[] = [
  'Ethereum',
  'Arbitrum',
  'NEAR',
];

const RainbowBridgeDefaultParams = {
  nearEventRelayerMargin: 10, // blocks
  sendToNearSyncInterval: 60000, // check light client sync interval (ms)
  sendToEthereumSyncInterval: 60000, // check light client sync interval (ms)
  maxFindEthProofInterval: 600000, // check finalization status max interval (ms)
  erc20Abi,
  erc20LockerAbi,
  ethClientAbi: nearOnEthClientAbi,
  auroraErc20Abi,
  etherCustodianAbi,
  auroraEvmAccount: 'aurora',
  auroraRelayerAccount: 'relay.aurora',
  etherExitToEthereumPrecompile: '0xb0bD02F6a392aF548bDf1CfAeE5dFa0EefcC8EaB',
  etherExitToNearPrecompile: '0xE9217BC70B7ED1f598ddD3199e80b093fA71124F',
  eNEARAbi,
  ethChainId: EVMConfig.Ethereum.chainId,
};
export const BridgeConfig = {
  Rainbow: {
    /** estimated 20 minutes */
    wait: 20,
    bridgeParams: IS_MAINNET
      ? {
          ...RainbowBridgeDefaultParams,
          auroraChainId: 1313161554,
          erc20LockerAddress: '0x23ddd3e3692d1861ed57ede224608875809e127f',
          nep141Factory: 'factory.bridge.near',
          etherCustodianAddress: '0x6BFaD42cFC4EfC96f529D786D643Ff4A8B89FA52',
          ethClientAddress: '0x0151568af92125fb289f1dd81d9d8f7484efc362',
          nearClientAccount: 'client.bridge.near',
          eNEARAddress: '0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4',
          nativeNEARLockerAddress: 'e-near.near',
          wNearNep141: 'wrap.near',
          eventRelayerAccount: 'event-relayer.near',
        }
      : {
          ...RainbowBridgeDefaultParams,
          auroraChainId: 1313161555,
          erc20LockerAddress: '0xC115851CA60Aed2CCc6EE3D5343F590834e4a3aB',
          nep141Factory: 'factory.goerli.testnet',
          etherCustodianAddress: '0x84a82Bb39c83989D5Dc07e1310281923D2544dC2',
          ethClientAddress: '0x37C2d89b55Bfd95532637554711441017eFabFef',
          nearClientAccount: 'client-eth2.goerli.testnet',
          eNEARAddress: '0xe6b7C088Da1c2BfCf84aaE03fd6DE3C4f28629dA',
          nativeNEARLockerAddress: 'enear.goerli.testnet',
          wNearNep141: 'wrap.testnet',
          eventRelayerAccount: 'event-relayer.goerli.testnet',
        },
  },
  Stargate: {
    wait: 5,
    bridgeParams: {
      Arbitrum: {
        send: '0x9affc062e3cbe2806334355b92059e3d8f4c4657',
        pool: {
          USDC: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
        },
        eid: '30110',
      },
      Ethereum: {
        send: '0x3B693e0F2f5f5e0b819e669b60A715858dCb6C07',
        pool: {
          USDC: '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
        },
        eid: '30101',
      },
      Aurora: {
        pool: {
          USDC: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
        },
        eid: '30211',
      },
      EndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
      auroraReceive: '0xBafAB363F04A4D2E7239f9E3942E768d76Baf0f3',
    },
  },
} as const;

export const BridgeTokenList: (BridgeModel.BridgeTokenMeta & {
  supportChannels?: BridgeModel.BridgeSupportChannel[];
})[] = [
  {
    symbol: 'NEAR',
    decimals: 24,
    addresses: {
      Ethereum: IS_MAINNET
        ? '0x85F17Cf997934a597031b2E18a9aB6ebD4B9f6a4'
        : '0xe6b7C088Da1c2BfCf84aaE03fd6DE3C4f28629dA',

      NEAR: IS_MAINNET ? 'wrap.near' : 'wrap.testnet',
    },
    icon: formatFileUrl('/crypto/near.svg'),
  },
  {
    symbol: 'ETH',
    decimals: 18,
    addresses: {
      Ethereum: '',
      NEAR: 'aurora',
    },
    icon: formatFileUrl('/crypto/eth.svg'),
  },
  {
    symbol: 'USDT',
    decimals: 6,
    icon: formatFileUrl('/crypto/usdt.svg'),
    addresses: {
      NEAR: IS_MAINNET ? 'usdt.tether-token.near' : 'usdtt.fakes.testnet',
      Ethereum: IS_MAINNET ? '0xdAC17F958D2ee523a2206206994597C13D831ec7' : '',
    },
  },
  {
    symbol: 'USDT.e',
    decimals: 6,
    addresses: {
      Ethereum: IS_MAINNET ? '0xdAC17F958D2ee523a2206206994597C13D831ec7' : '',
      NEAR: IS_MAINNET
        ? 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near'
        : 'usdt.fakes.testnet',
    },
    icon: formatFileUrl('/crypto/usdt.e.svg'),
  },
  {
    symbol: 'USDC',
    decimals: 6,
    icon: formatFileUrl('/crypto/usdc.svg'),
    addresses: {
      NEAR: IS_MAINNET
        ? '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1'
        : '',
      Ethereum: IS_MAINNET ? '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' : '',
      Arbitrum: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
      Aurora: '0x368EBb46ACa6b8D0787C96B2b20bD3CC3F2c45F7',
    },
  },
  {
    symbol: 'USDC.e',
    decimals: 6,
    addresses: {
      NEAR: IS_MAINNET
        ? 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near'
        : 'usdc.fakes.testnet',
      // Ethereum: IS_MAINNET ? '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' : '',
    },
    icon: formatFileUrl('/crypto/usdc.e.svg'),
  },
  {
    symbol: 'DAI',
    decimals: 18,
    addresses: {
      Ethereum: IS_MAINNET ? '0x6B175474E89094C44Da98b954EedeAC495271d0F' : '',
      NEAR: IS_MAINNET
        ? '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near'
        : 'dai.fakes.testnet',
    },
    icon: formatFileUrl('/crypto/DAI.svg'),
  },
  {
    symbol: 'WBTC',
    decimals: 8,
    addresses: {
      Ethereum: IS_MAINNET ? '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599' : '',
      NEAR: IS_MAINNET
        ? '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near'
        : 'wbtc.fakes.testnet',
    },
    icon: formatFileUrl('/crypto/wbtc.svg'),
  },
  {
    symbol: 'OCT',
    decimals: 18,
    addresses: {
      Ethereum: IS_MAINNET ? '0xf5cfbc74057c610c8ef151a439252680ac68c6dc' : '',
      NEAR: IS_MAINNET
        ? 'f5cfbc74057c610c8ef151a439252680ac68c6dc.factory.bridge.near'
        : 'oct.fakes.testnet',
    },
    icon: formatFileUrl('/crypto/OCT.svg'),
  },
  {
    symbol: 'WOO',
    decimals: 18,
    addresses: {
      Ethereum: IS_MAINNET ? '0x4691937a7508860f876c9c0a2a617e7d9e945d4b' : '',
      NEAR: IS_MAINNET
        ? '4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near'
        : 'woo.fakes.testnet',
    },
    icon: formatFileUrl('/crypto/woo.png'),
  },
];

export const BridgeTokenRoutes: {
  from: BridgeModel.BridgeSupportChain;
  to: BridgeModel.BridgeSupportChain;
  channel: BridgeModel.BridgeSupportChannel;
  symbols: string[];
}[] = [
  {
    from: 'NEAR',
    to: 'Ethereum',
    channel: 'Rainbow',
    symbols: ['NEAR', 'ETH', 'USDT.e', 'USDC.e', 'DAI', 'WBTC', 'OCT', 'WOO'],
  },
  { from: 'NEAR', to: 'Ethereum', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'NEAR', to: 'Arbitrum', channel: 'Stargate', symbols: ['USDC'] },
  {
    from: 'Ethereum',
    to: 'NEAR',
    channel: 'Rainbow',
    symbols: ['NEAR', 'ETH', 'USDT.e', 'USDC.e', 'DAI', 'WBTC', 'OCT', 'WOO'],
  },
  { from: 'Ethereum', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'Arbitrum', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
];

export const BridgeTokenSortRule = [
  'USDC',
  'USDT.e',
  'USDC.e',
  'NEAR',
  'ETH',
  'WBTC',
  'DAI',
  'OCT',
  'WOO',
];
