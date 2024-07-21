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
  Aurora: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://explorer.aurora.dev',
    chainId: 1313161554,
  },
  Avalanche: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://cchain.explorer.avax.network',
    chainId: 43114,
  },
  Base: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://explorer.base.org',
    chainId: 8453,
  },
  Mantle: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://explorer.mantle.xyz',
    chainId: 5000,
  },
  Optimism: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://optimistic.etherscan.io',
    chainId: 10,
  },
  Polygon: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://polygonscan.com',
    chainId: 137,
  },
  Scroll: {
    network: 'mainnet',
    infuraKey: INFURA_KEY,
    explorerUrl: 'https://scrollscan.com',
    chainId: 534352,
  },

  walletConnectProjectId: '669d1b9f59163a92d90a3c1ff78a7326',
  chains: [
    {
      id: IS_MAINNET ? '0x1' : '0xaa36a7',
      token: 'ETH',
      label: `Ethereum`,
      rpcUrl: IS_MAINNET
        ? 'https://eth.drpc.org/'
        : `https://testnet.infura.io/v3/${INFURA_KEY}`,
    },
    {
      id: '0xA4B1',
      token: 'ARB-ETH',
      label: 'Arbitrum',
      rpcUrl: 'https://rpc.ankr.com/arbitrum',
    },
    //Aurora
    {
      id: '0x4e454152',
      token: 'ETH',
      label: 'Aurora',
      rpcUrl: 'https://mainnet.aurora.dev',
    },
    //Base
    {
      id: '0x2105',
      token: 'ETH',
      label: 'Base',
      rpcUrl: 'https://mainnet.base.org',
    },
    //Optimism
    {
      id: '0xa',
      token: 'ETH',
      label: 'Optimism',
      rpcUrl: 'https://mainnet.optimism.io',
    },
    //Scroll
    {
      id: '0x82750',
      token: 'ETH',
      label: 'Scroll',
      rpcUrl: 'https://rpc.ankr.com/scroll',
    },
    //Polygon
    {
      id: '0x89',
      token: 'MATIC',
      label: 'Polygon',
      rpcUrl: 'https://polygon.drpc.org',
    },
    //Avalanche
    {
      id: '0xa86a',
      token: 'AVAX',
      label: 'Avalanche',
      rpcUrl: 'https://avalanche.drpc.org',
    },
    //Mantle
    {
      id: '0x1388',
      token: 'MNT',
      label: 'Mantle',
      rpcUrl: 'https://rpc.ankr.com/mantle',
    },
  ],
};

export const NearConfig = {
  explorerUrl: IS_MAINNET
    ? 'https://nearblocks.io'
    : 'https://testnet.nearblocks.io',
};

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
    wait: 3,
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
        send: '',
        receive: '0x7D500416d295E08A3894Ae41de34b0cFD7443D5c',
        pool: {
          USDC: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
        },
        eid: '30211',
      },
      Avalanche: {
        send: '0x8cE17C7A6E7c53EbD8919D7C6E54a68BA3D1d3Ad',
        pool: {
          USDC: '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
        },
        eid: '30106',
      },
      Base: {
        send: '0x5149434074bC009C8269376390ca722a552A8F47',
        pool: {
          USDC: '0x27a16dc786820B16E5c9028b75B99F6f604b5d26',
        },
        eid: '30184',
      },
      Mantle: {
        send: '0x78F942F8F9110067c08183183c45903e5Dc2763A',
        pool: {
          USDC: '0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC',
        },
        eid: '30181',
      },
      Optimism: {
        send: '0xd560B0782bB20356F2892828022D328a1ACe2566',
        pool: {
          USDC: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
        },
        eid: '30111',
      },
      Polygon: {
        send: '0x9571566D7ECb2fc899477bF295248a20FF4Adb61',
        pool: {
          USDC: '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
        },
        eid: '30109',
      },
      Scroll: {
        send: '0xC929F538632f4F813c29b3Cc54Beb67bE25F65FB',
        pool: {
          USDC: '0x3Fc69CC4A842838bCDC9499178740226062b14E4',
        },
        eid: '30214',
      },
      EndpointV2: '0x1a44076050125825900e736c501f859c50fE728c',
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
      Avalanche: '0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E',
      Base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
      Mantle: '0x09Bc4E0D864854c6aFB6eB9A9cdF58aC190D0dF9',
      Optimism: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
      Polygon: '0x3c499c542cef5e3811e1192ce70d8cc03d5c3359',
      Scroll: '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4',
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
  // {
  //   from: 'NEAR',
  //   to: 'Ethereum',
  //   channel: 'Rainbow',
  //   symbols: ['NEAR', 'ETH', 'USDT.e', 'USDC.e', 'DAI', 'WBTC', 'OCT', 'WOO'],
  // },
  // { from: 'NEAR', to: 'Ethereum', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'NEAR', to: 'Arbitrum', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'NEAR', to: 'Ethereum', channel: 'Stargate', symbols: ['USDC'] },
  // { from: 'NEAR', to: 'Avalanche', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'NEAR', to: 'Base', channel: 'Stargate', symbols: ['USDC'] },
  // { from: 'NEAR', to: 'Mantle', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'NEAR', to: 'Optimism', channel: 'Stargate', symbols: ['USDC'] },
  // { from: 'NEAR', to: 'Polygon', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'NEAR', to: 'Scroll', channel: 'Stargate', symbols: ['USDC'] },
  // {
  //   from: 'Ethereum',
  //   to: 'NEAR',
  //   channel: 'Rainbow',
  //   symbols: ['NEAR', 'ETH', 'USDT.e', 'USDC.e', 'DAI', 'WBTC', 'OCT', 'WOO'],
  // },
  // { from: 'Ethereum', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'Arbitrum', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'Ethereum', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  // { from: 'Avalanche', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'Base', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  // { from: 'Mantle', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'Optimism', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  // { from: 'Polygon', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
  { from: 'Scroll', to: 'NEAR', channel: 'Stargate', symbols: ['USDC'] },
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

export const SupportChains = BridgeTokenRoutes.reduce((acc, v) => {
  if (!acc.includes(v.from)) acc.push(v.from);
  if (!acc.includes(v.to)) acc.push(v.to);
  return acc;
}, [] as BridgeModel.BridgeSupportChain[]);
