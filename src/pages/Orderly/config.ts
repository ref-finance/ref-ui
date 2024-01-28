// @ts-nocheck

export function getExtendConfig(env: string = process.env.REACT_APP_NEAR_ENV) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        RPC_LIST: {
          defaultRpc: {
            url: 'https://rpc.mainnet.near.org',
            simpleName: 'official rpc',
          },
          ankrRpc: {
            url: 'https://rpc.ankr.com/near',
            simpleName: 'ankr rpc',
          },
          oneRpc: {
            url: 'https://1rpc.io/near',
            simpleName: '1rpc',
          },
          fastNearRpc: {
            url: 'https://rpc.web4.near.page',
            simpleName: 'fast-near',
          },
        },
        pool_protocol: 'indexer',
      };
    case 'development':
    case 'pub-testnet':
      return {
        RPC_LIST: {
          defaultRpc: {
            url: 'https://rpc.testnet.near.org',
            simpleName: 'official rpc',
          },
          // publicRpc: {
          //   url: 'https://public-rpc.blockpi.io/http/near-testnet',
          //   simpleName: 'blockpi rpc',
          // },
        },
        pool_protocol: 'indexer',
      };
    case 'testnet':
      return {
        RPC_LIST: {
          defaultRpc: {
            url: 'https://rpc.testnet.near.org',
            simpleName: 'official rpc',
          },
          // publicRpc: {
          //   url: 'https://public-rpc.blockpi.io/http/near-testnet',
          //   simpleName: 'blockpi rpc',
          // },
        },
        pool_protocol: 'indexer',
      };
    default:
      return {
        RPC_LIST: {
          defaultRpc: {
            url: 'https://rpc.mainnet.near.org',
            simpleName: 'official rpc',
          },
          // publicRpc: {
          //   url: 'https://public-rpc.blockpi.io/http/near',
          //   simpleName: 'blockpi rpc',
          // },
          // infuraRpc: {
          //   url: 'https://near-mainnet.infura.io/v3/391d915322284599936f0ee962399dc1',
          //   simpleName: 'infura rpc',
          // },
          ankrRpc: {
            url: 'https://rpc.ankr.com/near',
            simpleName: 'ankr rpc',
          },
        },
        pool_protocol: 'indexer',
      };
  }
}
export function getCustomConfig() {
  let customRpcMapStr;
  try {
    customRpcMapStr = window.localStorage.getItem('customRpcList');
  } catch (error) {}

  let customRpcMap = {};
  if (customRpcMapStr) {
    try {
      customRpcMap = JSON.parse(customRpcMapStr);
    } catch (error) {}
  }
  return customRpcMap;
}
export default function getConfig(
  env: string = process.env.REACT_APP_NEAR_ENV ||
    process.env.REACT_APP_REACT_APP_NEAR_ENV
) {
  const RPC_LIST_system = getExtendConfig().RPC_LIST;
  const RPC_LIST_custom = getCustomConfig();
  const RPC_LIST = Object.assign(RPC_LIST_system, RPC_LIST_custom);
  let endPoint = 'defaultRpc';
  try {
    endPoint = window.localStorage.getItem('endPoint') || endPoint;
    if (!RPC_LIST[endPoint]) {
      endPoint = 'defaultRpc';
      localStorage.removeItem('endPoint');
    }
  } catch (error) {}
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.near.org',
        myNearWalletUrl: 'https://app.mynearwallet.com/',

        helperUrl: 'https://api.kitwallet.app',
        explorerUrl: 'https://nearblocks.io',
        indexerUrl: 'https://mainnet-indexer.ref-finance.com',
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
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '987635.62',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '1308109.404',
        BLACKLIST_POOL_IDS: ['3689', '3699'],
        FARM_LOCK_SWITCH: process.env.FARM_LOCK_SWITCH || 0,
        VotingGauge: ['10%', '10%'],
        REF_FARM_BOOST_CONTRACT_ID:
          process.env.REF_FARM_BOOST_CONTRACT_ID || 'boostfarm.ref-labs.near',
        FARM_BLACK_LIST_V2: process.env.FARM_BLACK_LIST_V2 || ['3612'],
        boostBlackList: process.env.FARM__BOOST_BLACK_LIST || [
          '3699#0',
          '3612#0',
          '3612#1',
        ],
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly-network.near',
      };
    case 'pub-testnet':
      return {
        networkId: 'testnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.testnet.near.org',
        myNearWalletUrl: 'https://testnet.mynearwallet.com/',
        helperUrl: 'https://testnet-api.kitwallet.app',
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
        REF_VE_CONTRACT_ID: 'v010.refve.testnet',
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
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '987635.62',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '1308109.404',
        BLACKLIST_POOL_IDS: ['1752', '1760'],
        REF_FARM_BOOST_CONTRACT_ID:
          process.env.REF_FARM_BOOST_CONTRACT_ID ||
          'boostfarm.ref-finance.testnet',
        FARM_LOCK_SWITCH: process.env.FARM_LOCK_SWITCH || 0,
        VotingGauge: ['10%', '10%'],
        kitWalletOn: true,
        REF_UNI_V3_SWAP_CONTRACT_ID:
          process.env.REF_UNI_V3_SWAP_CONTRACT_ID || 'dcl.ref-dev.testnet',
        FARM_BLACK_LIST_V2: process.env.FARM_BLACK_LIST_V2 || ['571'],
        boostBlackList: process.env.FARM__BOOST_BLACK_LIST || [
          '1760#0',
          '1760#1',
        ],
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly.testnet',
      };
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.testnet.near.org',
        myNearWalletUrl: 'https://testnet.mynearwallet.com/',
        helperUrl: 'https://testnet-api.kitwallet.app',
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
          process.env.REF_FARM_CONTRACT_ID || 'farm-dev.ref-dev.testnet',
        // REF_VE_CONTRACT_ID: 'dev-20220623151446-29039416013661',
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
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '987635.62',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '1308109.404',
        BLACKLIST_POOL_IDS: ['686'],
        REF_FARM_BOOST_CONTRACT_ID:
          process.env.REF_FARM_BOOST_CONTRACT_ID ||
          'boostfarm024.ref-dev.testnet',
        FARM_LOCK_SWITCH: process.env.FARM_LOCK_SWITCH || 0,
        VotingGauge: ['5%', '10%'],
        REF_UNI_V3_SWAP_CONTRACT_ID:
          process.env.REF_UNI_V3_SWAP_CONTRACT_ID || 'mock-dcl.ref-dev.testnet',
        kitWalletOn: true,
        FARM_BLACK_LIST_V2: process.env.FARM_BLACK_LIST_V2 || ['666'],
        boostBlackList: process.env.FARM__BOOST_BLACK_LIST || [''],
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly.testnet',
      };
    default:
      return {
        networkId: 'mainnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.near.org',
        myNearWalletUrl: 'https://app.mynearwallet.com/',
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
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '987635.62',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '1308109.404',
        BLACKLIST_POOL_IDS: ['3689', '3699'],
        FARM_LOCK_SWITCH: process.env.FARM_LOCK_SWITCH || 0,
        VotingGauge: ['10%', '10%'],
        REF_FARM_BOOST_CONTRACT_ID:
          process.env.REF_FARM_BOOST_CONTRACT_ID || 'boostfarm.ref-labs.near',
        FARM_BLACK_LIST_V2: process.env.FARM_BLACK_LIST_V2 || ['3612'],
        boostBlackList: process.env.FARM__BOOST_BLACK_LIST || [
          '3699#0',
          '3612#0',
          '3612#1',
        ],
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly-network.near',
      };
  }
}

export function getExtraStablePoolConfig(
  env: string = process.env.REACT_APP_NEAR_ENV ||
    process.env.REACT_APP_REACT_APP_NEAR_ENV
) {
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
        NEARX_POOL_ID: '3612',
        NEARXIDS: ['nearx.stader-labs.near', 'wrap.near'],
        NEARX_POOL_INDEX: {
          'nearx.stader-labs.near': 0,
          'wrap.near': 1,
        },
        NEW_NEARX_POOL_ID: '3688',
        NEW_NEARXIDS: ['v2-nearx.stader-labs.near', 'wrap.near'],
        NEW_NEARX_POOL_INDEX: {
          'v2-nearx.stader-labs.near': 0,
          'wrap.near': 1,
        },
        USDT_POOL_ID: '3689',
        USDTIDS: [
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
          'usdt.tether-token.near',
        ],
        USDT_POOL_INDEX: {
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 0,
          'usdt.tether-token.near': 1,
        },

        RATED_POOLS_IDS: ['3514', '3515', '3612', '3688', '3689'],
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
        NEARXIDS: ['nearx.staderlabs.testnet', 'wrap.testnet'],
        NEARX_POOL_ID: '1044',
        NEARX_POOL_INDEX: {
          'nearx.staderlabs.testnet': 0,
          'wrap.testnet': 1,
        },
        NEW_NEARX_POOL_ID: '1751',
        NEW_NEARXIDS: ['v2-nearx.staderlabs.testnet', 'wrap.testnet'],
        NEW_NEARX_POOL_INDEX: {
          'v2-nearx.staderlabs.testnet': 0,
          'wrap.testnet': 1,
        },

        RATED_POOLS_IDS: ['568', '571', '1044', '1751'],
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
        NEARX_POOL_ID: '666',
        STNEARIDS: ['meta-v2.pool.testnet', 'wrap.testnet'],
        LINEARIDS: ['linear-protocol.testnet', 'wrap.testnet'],
        NEARXIDS: ['nearx.staderlabs.testnet', 'wrap.testnet'],
        STNEAR_POOL_INDEX: {
          'meta-v2.pool.testnet': 0,
          'wrap.testnet': 1,
        },
        LINEAR_POOL_INDEX: {
          'linear-protocol.testnet': 0,
          'wrap.testnet': 1,
        },
        NEARX_POOL_INDEX: {
          'nearx.staderlabs.testnet': 0,
          'wrap.testnet': 1,
        },
        NEW_NEARX_POOL_ID: '685',
        NEW_NEARXIDS: ['v2-nearx.staderlabs.testnet', 'wrap.testnet'],
        NEW_NEARX_POOL_INDEX: {
          'v2-nearx.staderlabs.testnet': 0,
          'wrap.testnet': 1,
        },

        RATED_POOLS_IDS: ['621', '622', '666', '685'],
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
        NEARX_POOL_ID: '3612',
        NEARXIDS: ['nearx.stader-labs.near', 'wrap.near'],
        NEARX_POOL_INDEX: {
          'nearx.stader-labs.near': 0,
          'wrap.near': 1,
        },
        NEW_NEARX_POOL_ID: '3688',
        NEW_NEARXIDS: ['v2-nearx.stader-labs.near', 'wrap.near'],
        NEW_NEARX_POOL_INDEX: {
          'v2-nearx.stader-labs.near': 0,
          'wrap.near': 1,
        },
        USDT_POOL_ID: '3689',
        USDTIDS: [
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
          'usdt.tether-token.near',
        ],
        USDT_POOL_INDEX: {
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 0,
          'usdt.tether-token.near': 1,
        },

        RATED_POOLS_IDS: ['3514', '3515', '3612', '3688', '3689'],
      };
  }
}
export function getTransakConfig(
  accountId: string,
  env: string = process.env.REACT_APP_NEAR_ENV ||
    process.env.REACT_APP_REACT_APP_NEAR_ENV
) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        apiKey: 'bf2238a1-ff5d-4a8f-9e1b-af7892ed0123',
        environment: 'PRODUCTION',
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        hostURL: typeof window !== 'undefined' ? window.location.origin : ``,
        defaultCryptoCurrency: 'NEAR',
        cryptoCurrencyCode: 'NEAR',
        walletAddress: accountId || '',
      };
    case 'development':
    case 'pub-testnet':
      return {
        apiKey: '538c522e-474e-4d3b-a7a2-38a736cea747',
        environment: 'STAGING',
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        hostURL: typeof window !== 'undefined' ? window.location.origin : ``,
        defaultCryptoCurrency: 'NEAR',
        cryptoCurrencyCode: 'NEAR',
        walletAddress: accountId || '',
      };
    case 'testnet':
      return {
        apiKey: '538c522e-474e-4d3b-a7a2-38a736cea747',
        environment: 'STAGING',
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        cryptoCurrencyCode: 'NEAR',
        hostURL: typeof window !== 'undefined' ? window.location.origin : ``,
        defaultCryptoCurrency: 'NEAR',
        walletAddress: accountId || '',
      };
    default:
      return {
        apiKey: 'bf2238a1-ff5d-4a8f-9e1b-af7892ed0123',
        environment: 'PRODUCTION',
        widgetWidth: `500px`,
        widgetHeight: `600px`,
        themeColor: `#00C6A2`,
        hostURL: typeof window !== 'undefined' ? window.location.origin : ``,
        defaultCryptoCurrency: 'NEAR',
        cryptoCurrencyCode: 'NEAR',
        walletAddress: accountId || '',
      };
  }
}

export function getOrderlyConfig(
  env: string = process.env.REACT_APP_NEAR_ENV ||
    process.env.REACT_APP_REACT_APP_NEAR_ENV
) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly-network.near',
        OFF_CHAIN_END_POINT: 'https://api.orderly.org',
        ORDERLY_WS_ENDPOINT: 'wss://ws.orderly.org/ws/stream',
        ORDERLY_WS_ENDPOINT_PRIVATE:
          'wss://ws-private.orderly.org/v2/ws/private/stream',
      };
    case 'development':
    case 'pub-testnet':
      return {
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly.testnet',
        OFF_CHAIN_END_POINT: 'https://testnet-api.orderly.org',
        ORDERLY_WS_ENDPOINT: 'wss://testnet-ws.orderly.org/ws/stream',
        ORDERLY_WS_ENDPOINT_PRIVATE:
          'wss://testnet-ws-private.orderly.org/v2/ws/private/stream',
      };
    case 'testnet':
      return {
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly.testnet',
        OFF_CHAIN_END_POINT: 'https://testnet-api.orderly.org',
        ORDERLY_WS_ENDPOINT: 'wss://testnet-ws.orderly.org/ws/stream',
        ORDERLY_WS_ENDPOINT_PRIVATE:
          'wss://testnet-ws-private.orderly.org/v2/ws/private/stream',
      };
    default:
      return {
        ORDERLY_ASSET_MANAGER: 'asset-manager.orderly-network.near',
        OFF_CHAIN_END_POINT: 'https://api.orderly.org',
        ORDERLY_WS_ENDPOINT: 'wss://ws.orderly.org/ws/stream',
        ORDERLY_WS_ENDPOINT_PRIVATE:
          'wss://ws-private.orderly.org/v2/ws/private/stream',
      };
  }
}
