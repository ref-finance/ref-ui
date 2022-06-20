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
    case 'pub-testnet':
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
        helperUrl: 'https://api.kitwallet.app',
        explorerUrl: 'https://nearblocks.io',
        indexerUrl: 'https://indexer.ref.finance',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3', '2769#2'],
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
        STABLE_POOL_USN_ID: process.env.STABLE_POOL_USN_ID || 3020,
        STABLE_TOKEN_USN_IDS: [
          'usn',
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
        ],
        STABLE_TOKEN_USN_INDEX: {
          usn: 0,
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 1,
        },
        STABLE_POOL_ID: process.env.STABLE_POOL_ID || 1910,
        STABLE_POOL_IDS: process.env.STABLE_POOL_IDS || [
          '1910',
          '3020',
          '3364',
          '3433',
        ],
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
        USN_ID: 'usn',
        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '105561.75',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '132011.3147',
        BLACKLIST_POOL_IDS: [''],
      };
    case 'pub-testnet':
      return {
        networkId: 'testnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://testnet.nearblocks.io',
        indexerUrl: 'https://testnet-indexer.ref-finance.com',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3'],
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'ref-finance-101.testnet',
        WRAP_NEAR_CONTRACT_ID:
          process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.testnet',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.testnet',
        REF_TOKEN_ID: 'ref.fakes.testnet',
        XREF_TOKEN_ID: 'xref.ref-finance.testnet',
        REF_AIRDROP_CONTRACT_ID: 'locker002.ref-dev.testnet',
        TOP_POOLS_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 60,
        POOL_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 20,
        STABLE_POOL_ID: process.env.STABLE_POOL_ID || 218,
        STABLE_POOL_IDS: process.env.STABLE_POOL_IDS || [
          '218',
          '356',
          '456',
          '494',
        ],
        USN_ID: 'usdn.testnet',
        STABLE_POOL_USN_ID: process.env.STABLE_POOL_USN_ID || 356,
        STABLE_TOKEN_IDS: [
          'usdt.fakes.testnet',
          'usdc.fakes.testnet',
          'dai.fakes.testnet',
        ],
        STABLE_TOKEN_USN_IDS: ['usdn.testnet', 'usdt.fakes.testnet'],
        STABLE_TOKEN_USN_INDEX: {
          'usdn.testnet': 0,
          'usdt.fakes.testnet': 1,
        },
        STABLE_TOKEN_INDEX: {
          'usdt.fakes.testnet': 0,
          'usdc.fakes.testnet': 1,
          'dai.fakes.testnet': 2,
        },
        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '105561.75',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '132011.3147',
        BLACKLIST_POOL_IDS: [''],
      };
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://testnet.nearblocks.io',
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
        STABLE_POOL_IDS: process.env.STABLE_POOL_IDS || [
          '79',
          '603',
          '604',
          '608',
        ],
        USN_ID: 'usdn.testnet',
        STABLE_POOL_USN_ID: process.env.STABLE_POOL_USN_ID || 603,
        STABLE_TOKEN_IDS: [
          'usdt.fakes.testnet',
          'usdc.fakes.testnet',
          'dai.fakes.testnet',
        ],
        STABLE_TOKEN_USN_IDS: ['usdn.testnet', 'usdt.fakes.testnet'],
        STABLE_TOKEN_USN_INDEX: {
          'usdn.testnet': 0,
          'usdt.fakes.testnet': 1,
        },
        STABLE_TOKEN_INDEX: {
          'usdt.fakes.testnet': 0,
          'usdc.fakes.testnet': 1,
          'dai.fakes.testnet': 2,
        },
        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '105561.75',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '132011.3147',
        BLACKLIST_POOL_IDS: [''],
      };
    default:
      return {
        networkId: 'mainnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://api.kitwallet.app',
        explorerUrl: 'https://nearblocks.io',
        indexerUrl: 'https://indexer.ref.finance',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3', '2769#2'],
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
        BTC_POOL_ID: '3364',
        BTCIDS: [
          '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near',
          '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near',
        ],
        BTC_IDS_INDEX: {
          '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near': 0,
          '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near': 1,
        },
        STABLE_POOL_USN_ID: process.env.STABLE_POOL_USN_ID || 3020,
        STABLE_TOKEN_USN_IDS: [
          'usn',
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
        ],
        STABLE_TOKEN_USN_INDEX: {
          usn: 0,
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 1,
        },
        STABLE_POOL_ID: process.env.STABLE_POOL_ID || 1910,
        STABLE_POOL_IDS: process.env.STABLE_POOL_IDS || [
          '1910',
          '3020',
          '3364',
          '3433',
        ],
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
        USN_ID: 'usn',
        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '105561.75',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '132011.3147',
        BLACKLIST_POOL_IDS: [''],
      };
  }
}

export function getExtraStablePoolConfig(env: string = process.env.NEAR_ENV) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        BTCIDS: [
          '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near',
          '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near',
        ],
        BTC_STABLE_POOL_INDEX: {
          '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near': 0,
          '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near': 1,
        },
        BTC_STABLE_POOL_ID: '3364',
        CUSDIDS: ['usn', 'cusd.token.a11bd.near'],
        CUSD_STABLE_POOL_INDEX: {
          usn: 0,
          'cusd.token.a11bd.near': 1,
        },
        CUSD_STABLE_POOL_ID: '3433',
        STNEAR_POOL_ID: '3514',
        LINEAR_POOL_ID: '3515',
        STNEARIDS: ['meta-pool.near', 'wrap.near'],
        LINEARIDS: ['linear-protocol.near', 'wrap.near'],
        STNEAR_POOL_INDEX: {
          'meta-pool.near': 0,
          'wrap.near': 1,
        },
        LINEAR_POOL_INDEX: {
          'linear-protocol.near': 0,
          'wrap.near': 1,
        },
        RATED_POOLS_IDS: ['3514', '3515'],
      };
    case 'development':
    case 'pub-testnet':
      return {
        BTCIDS: ['wbtc.fakes.testnet', 'hbtc.fakes.testnet'],
        BTC_STABLE_POOL_INDEX: {
          'wbtc.fakes.testnet': 0,
          'hbtc.fakes.testnet': 1,
        },
        BTC_STABLE_POOL_ID: '456',
        CUSDIDS: ['usdn.testnet', 'cusd.fakes.testnet'],
        CUSD_STABLE_POOL_INDEX: {
          'usdn.testnet': 0,
          'cusd.fakes.testnet': 1,
        },
        CUSD_STABLE_POOL_ID: '494',
        STNEAR_POOL_ID: '568',
        LINEAR_POOL_ID: '571',
        STNEARIDS: ['meta-v2.pool.testnet', 'wrap.testnet'],
        LINEARIDS: ['linear-protocol.testnet', 'wrap.testnet'],
        STNEAR_POOL_INDEX: {
          'meta-v2.pool.testnet': 0,
          'wrap.testnet': 1,
        },
        LINEAR_POOL_INDEX: {
          'linear-protocol.testnet': 0,
          'wrap.testnet': 1,
        },
        RATED_POOLS_IDS: ['568', '571'],
      };
    case 'testnet':
      return {
        BTCIDS: ['wbtc.fakes.testnet', 'hbtc.fakes.testnet'],
        BTC_STABLE_POOL_INDEX: {
          'wbtc.fakes.testnet': 0,
          'hbtc.fakes.testnet': 1,
        },
        BTC_STABLE_POOL_ID: '604',
        CUSDIDS: ['usdn.testnet', 'cusd.fakes.testnet'],
        CUSD_STABLE_POOL_INDEX: {
          'usdn.testnet': 0,
          'cusd.fakes.testnet': 1,
        },
        CUSD_STABLE_POOL_ID: '608',
        STNEAR_POOL_ID: '621',
        LINEAR_POOL_ID: '622',
        STNEARIDS: ['meta-v2.pool.testnet', 'wrap.testnet'],
        LINEARIDS: ['linear-protocol.testnet', 'wrap.testnet'],
        STNEAR_POOL_INDEX: {
          'meta-v2.pool.testnet': 0,
          'wrap.testnet': 1,
        },
        LINEAR_POOL_INDEX: {
          'linear-protocol.testnet': 0,
          'wrap.testnet': 1,
        },
        RATED_POOLS_IDS: ['621', '622'],
      };
    default:
      return {
        BTCIDS: [
          '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near',
          '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near',
        ],
        BTC_STABLE_POOL_INDEX: {
          '2260fac5e5542a773aa44fbcfedf7c193bc2c599.factory.bridge.near': 0,
          '0316eb71485b0ab14103307bf65a021042c6d380.factory.bridge.near': 1,
        },
        BTC_STABLE_POOL_ID: '3364',
        CUSDIDS: ['usn', 'cusd.token.a11bd.near'],
        CUSD_STABLE_POOL_INDEX: {
          usn: 0,
          'cusd.token.a11bd.near': 1,
        },
        CUSD_STABLE_POOL_ID: '3433',
        STNEAR_POOL_ID: '3514',
        LINEAR_POOL_ID: '3515',
        STNEARIDS: ['meta-pool.near', 'wrap.near'],
        LINEARIDS: ['linear-protocol.near', 'wrap.near'],
        STNEAR_POOL_INDEX: {
          'meta-pool.near': 0,
          'wrap.near': 1,
        },
        LINEAR_POOL_INDEX: {
          'linear-protocol.near': 0,
          'wrap.near': 1,
        },
        RATED_POOLS_IDS: ['3514', '3515'],
      };
  }
}
