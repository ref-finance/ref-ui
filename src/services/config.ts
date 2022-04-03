export function getExtendConfig(env: string = process.env.NEAR_ENV) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        RPC_LIST: {
          defaultRpc: {
            url: 'https://rpc.mainnet.near.org',
            simpleName: 'official rpc',
          },
          publicRpc: {
            url: 'https://public-rpc.blockpi.io/http/near',
            simpleName: 'blockpi rpc',
          },
        },
      };
    case 'development':
    case 'testnet':
      return {
        RPC_LIST: {
          defaultRpc: {
            url: 'https://rpc.testnet.near.org',
            simpleName: 'official rpc',
          },
          publicRpc: {
            url: 'https://public-rpc.blockpi.io/http/near-testnet',
            simpleName: 'blockpi rpc',
          },
        },
      };
    default:
      return {
        RPC_LIST: {
          defaultRpc: {
            url: 'https://rpc.mainnet.near.org',
            simpleName: 'official rpc',
          },
          publicRpc: {
            url: 'https://public-rpc.blockpi.io/http/near',
            simpleName: 'blockpi rpc',
          },
        },
      };
  }
}
export default function getConfig(env: string = process.env.NEAR_ENV) {
  const RPC_LIST = getExtendConfig().RPC_LIST;
  let endPoint = 'defaultRpc';
  try {
    endPoint = window.localStorage.getItem('endPoint') || endPoint;
  } catch (error) {}
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        indexerUrl: 'https://indexer.ref-finance.net',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3'],
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'v2.ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.near',
        REF_TOKEN_ID: 'token.v2.ref-finance.near',
        XREF_TOKEN_ID: 'xtoken.ref-finance.near',
        REF_AIRDROP_CONTRACT_ID: 's01.ref-airdrop.near',
        TOP_POOLS_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 60,
        POOL_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 20,
        STABLE_POOL_ID: process.env.STABLE_POOL_ID || 1910,
        POOLS_BLACK_LIST: process.env.POOLS_BLACK_LIST || [3020],
        STABLE_TOKEN_IDS: [
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
          '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near',
        ],
        STABLE_TOKEN_INDEX: {
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 0,
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near': 1,
          '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near': 2,
        },
        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '242,633.0475',
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        indexerUrl: 'https://dev-indexer.ref-finance.com',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3'],
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'exchange.ref-dev.testnet',
        WRAP_NEAR_CONTRACT_ID:
          process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.testnet',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'farm110.ref-dev.testnet',
        REF_TOKEN_ID: 'ref.fakes.testnet',
        XREF_TOKEN_ID: 'xref.ref-dev.testnet',
        REF_AIRDROP_CONTRACT_ID: 'locker002.ref-dev.testnet',
        TOP_POOLS_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 60,
        POOL_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 20,
        STABLE_POOL_ID: process.env.STABLE_POOL_ID || 79,
        POOLS_BLACK_LIST: process.env.POOLS_BLACK_LIST || [506],
        STABLE_TOKEN_IDS: [
          'usdt.fakes.testnet',
          'usdc.fakes.testnet',
          'dai.fakes.testnet',
        ],
        STABLE_TOKEN_INDEX: {
          'usdt.fakes.testnet': 0,
          'usdc.fakes.testnet': 1,
          'dai.fakes.testnet': 2,
        },
        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '242,633.0475',
      };
    default:
      return {
        networkId: 'mainnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        indexerUrl: 'https://indexer.ref-finance.net',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3'],
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'v2.ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.near',
        REF_TOKEN_ID: 'token.v2.ref-finance.near',
        XREF_TOKEN_ID: 'xtoken.ref-finance.near',
        REF_AIRDROP_CONTRACT_ID: 's01.ref-airdrop.near',
        TOP_POOLS_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 60,
        POOL_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 20,
        STABLE_POOL_ID: process.env.STABLE_POOL_ID || 1910,
        POOLS_BLACK_LIST: process.env.POOLS_BLACK_LIST || [3020],
        STABLE_TOKEN_IDS: [
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
          '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near',
        ],
        STABLE_TOKEN_INDEX: {
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 0,
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near': 1,
          '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near': 2,
        },
        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '242,633.0475',
      };
  }
}
