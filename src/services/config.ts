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
          lavaRpc: {
            url: 'https://near.lava.build',
            simpleName: 'lava rpc',
          },
          betaRpc: {
            url: 'https://beta.rpc.mainnet.near.org',
            simpleName: 'official beta rpc',
          },
          fastnearRpc: {
            url: 'https://free.rpc.fastnear.com',
            simpleName: 'fastnear rpc',
          },
          // publicRpc: {
          //   url: 'https://public-rpc.blockpi.io/http/near',
          //   simpleName: 'blockpi rpc',
          // },
          // infuraRpc: {
          //   url: 'https://near-mainnet.infura.io/v3/391d915322284599936f0ee962399dc1',
          //   simpleName: 'infura rpc',
          // },
          // ankrRpc: {
          //   url: 'https://rpc.ankr.com/near',
          //   simpleName: 'ankr rpc',
          // },
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
          lavaRpc: {
            url: 'https://g.w.lavanet.xyz/gateway/neart/rpc-http/a6e88c7710da77f09430aacd6328efd6',
            simpleName: 'lava rpc',
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
          lavaRpc: {
            url: 'https://g.w.lavanet.xyz/gateway/neart/rpc-http/a6e88c7710da77f09430aacd6328efd6',
            simpleName: 'lava rpc',
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
          lavaRpc: {
            url: 'https://near.lava.build',
            simpleName: 'lava rpc',
          },
          betaRpc: {
            url: 'https://beta.rpc.mainnet.near.org',
            simpleName: 'official beta rpc',
          },
          fastnearRpc: {
            url: 'https://free.rpc.fastnear.com',
            simpleName: 'fastnear rpc',
          },
          // publicRpc: {
          //   url: 'https://public-rpc.blockpi.io/http/near',
          //   simpleName: 'blockpi rpc',
          // },
          // infuraRpc: {
          //   url: 'https://near-mainnet.infura.io/v3/391d915322284599936f0ee962399dc1',
          //   simpleName: 'infura rpc',
          // },
          // ankrRpc: {
          //   url: 'https://rpc.ankr.com/near',
          //   simpleName: 'ankr rpc',
          // },
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
  env: string = process.env.REACT_APP_NEAR_ENV
) {
  const RPC_LIST_system = getExtendConfig().RPC_LIST;
  const RPC_LIST_custom = getCustomConfig();
  const RPC_LIST = Object.assign(RPC_LIST_system, RPC_LIST_custom) as any;
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
        classicTestUrl: 'https://test.api.cclp.finance',
        networkId: 'mainnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.near.org',
        myNearWalletUrl: 'https://app.mynearwallet.com/',
        helperUrl: 'https://api.kitwallet.app',
        explorerUrl: 'https://nearblocks.io',
        pikespeakUrl: 'https://pikespeak.ai',
        nearExplorerUrl: 'https://explorer.near.org/',
        // indexerUrl: 'https://api.ref.finance',
        indexerUrl: 'https://mainnet-indexer.ref-finance.com',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        newSodakiApiUrl: 'https://api.data-service.ref.finance/api',
        txIdApiUrl: 'https://api3.nearblocks.io',
        memeRankApiUrl: 'https://api.ref.finance',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3', '2769#2'],
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'v2.ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.near',
        REF_TOKEN_ID: 'token.v2.ref-finance.near',
        USDC_TOKEN_ID:
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        USDT_TOKEN_ID: 'usdt.tether-token.near',
        USDCe_TOKEN_ID:
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        USDTe_TOKEN_ID:
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
        XREF_TOKEN_ID: 'xtoken.ref-finance.near',
        BRRR_TOKEN_ID: 'token.burrow.near',
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
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '2601011.25',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '3459276.03',

        BLACKLIST_POOL_IDS: [
          '3699',
          '3734',
          '3563',
          '3613',
          '3620',
          '3625',
          // '1923',
          // '2451',
          // '1559',
          // '3015',
          // '3398',
          // '2089',
          // '2121',
          // '4149',
          // '3383',
          // '3805',
          // '3907',
          // '4161',
          // '3021',
          // '3385',
          // '3046',
          // '3384',
          // '1820',
          // '4150',
          // '3466',
          // '3386',
          // '3087',
          // '2558',
          // '3587',
          // '3759',
          // '1904',
          // '1903',
          // '3850',
          // '1821',
          // '2975',
          // '3529',
          // '3676',
          // '1908',
          // '2450',
          // '1955',
          // '2781',
          // '3822',
          // '2161',
          // '2560',
          // '3091',
          // '2497',
          // '2194',
          // '2320',
          '4744',
          '5029',
        ],

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
        REF_UNI_V3_SWAP_CONTRACT_ID:
          process.env.REF_UNI_V3_SWAP_CONTRACT_ID || 'dclv2.ref-labs.near',
        REF_UNI_SWAP_CONTRACT_ID:
          process.env.REF_UNI_SWAP_CONTRACT_ID || 'dcl.ref-labs.near',
        switch_on_dcl_farms: 'off',
        DCL_POOL_BLACK_LIST: ['usdt.tether-token.near|wrap.near|2000'],
        BURROW_CONTRACT_ID: 'contract.main.burrow.near',
        USDTT_USDCC_USDT_USDC_POOL_ID:
          process.env.USDTT_USDCC_USDT_USDC_POOL_ID || 4179,
        USDT_USDC_POOL_ID: process.env.USDT_USDC_POOL_ID || 4513,
        FRAX_USDC_POOL_ID: process.env.FRAX_USDC_POOL_ID || 4514,
        USDT_USDC_TOKEN_IDS: [
          'usdt.tether-token.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        FRAX_USDC_TOKEN_IDS: [
          '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          'usdt.tether-token.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        ],
        BLACK_TOKEN_LIST: ['token.pembrock.near'],
        REF_MEME_FARM_CONTRACT_ID:
          process.env.REF_MEME_FARM_CONTRACT_ID ||
          'meme-farming_011.ref-labs.near',
        REF_TOKEN_LOCKER_CONTRACT_ID: 'token-locker.ref-labs.near',
      };
    case 'pub-testnet':
      return {
        classicTestUrl: 'https://test.api.cclp.finance',
        networkId: 'testnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.testnet.near.org',
        myNearWalletUrl: 'https://testnet.mynearwallet.com/',
        helperUrl: 'https://testnet-api.kitwallet.app',
        explorerUrl: 'https://testnet.nearblocks.io',
        pikespeakUrl: 'https://pikespeak.ai',
        nearExplorerUrl: 'https://explorer.testnet.near.org/',
        indexerUrl: 'https://testnet-indexer.ref-finance.com',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        newSodakiApiUrl: 'https://api.data-service.ref.finance/api',
        txIdApiUrl: 'https://api-testnet.nearblocks.io',
        memeRankApiUrl: 'https://test.api.cclp.finance',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3'],
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'ref-finance-101.testnet',
        WRAP_NEAR_CONTRACT_ID:
          process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.testnet',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.testnet',
        REF_TOKEN_ID: 'ref.fakes.testnet',
        USDC_TOKEN_ID:
          '3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af',
        USDT_TOKEN_ID: 'usdtt.fakes.testnet',
        USDCe_TOKEN_ID: 'usdc.fakes.testnet',
        USDTe_TOKEN_ID: 'usdt.fakes.testnet',
        BRRR_TOKEN_ID: 'brrr.ft.ref-labs.testnet',
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
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '2601011.25',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '3459276.03',
        BLACKLIST_POOL_IDS: ['1752', '1760'],
        REF_FARM_BOOST_CONTRACT_ID:
          process.env.REF_FARM_BOOST_CONTRACT_ID ||
          'boostfarm.ref-finance.testnet',
        FARM_LOCK_SWITCH: process.env.FARM_LOCK_SWITCH || 0,
        VotingGauge: ['10%', '10%'],
        kitWalletOn: true,
        DCL_POOL_BLACK_LIST: ['usdt.fakes.testnet|wrap.testnet|100'],
        REF_UNI_V3_SWAP_CONTRACT_ID:
          process.env.REF_UNI_V3_SWAP_CONTRACT_ID || 'dclv2.ref-dev.testnet',
        REF_UNI_SWAP_CONTRACT_ID:
          process.env.REF_UNI_SWAP_CONTRACT_ID || 'dclv1.ref-dev.testnet',
        FARM_BLACK_LIST_V2: process.env.FARM_BLACK_LIST_V2 || ['571'],
        boostBlackList: process.env.FARM__BOOST_BLACK_LIST || [
          '1760#0',
          '1760#1',
        ],
        switch_on_dcl_farms: 'on',
        BURROW_CONTRACT_ID: 'contract.1689937928.burrow.testnet',
        USDTT_USDCC_USDT_USDC_POOL_ID:
          process.env.USDTT_USDCC_USDT_USDC_POOL_ID || 1843,
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          'usdtt.fakes.testnet',
          '3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af',
          'usdt.fakes.testnet',
          'usdc.fakes.testnet',
        ],
        USDT_USDC_POOL_ID: process.env.USDT_USDC_POOL_ID,
        FRAX_USDC_POOL_ID: process.env.FRAX_USDC_POOL_ID,
        USDT_USDC_TOKEN_IDS: [],
        FRAX_USDC_TOKEN_IDS: [],
        BLACK_TOKEN_LIST: [],
        REF_MEME_FARM_CONTRACT_ID:
          process.env.REF_MEME_FARM_CONTRACT_ID ||
          'memefarm-dev2.ref-dev.testnet',
        REF_TOKEN_LOCKER_CONTRACT_ID: 'token-locker.ref-labs.testnet',
      };
    case 'testnet':
      return {
        classicTestUrl: 'https://test.api.cclp.finance',
        networkId: 'testnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.testnet.near.org',
        myNearWalletUrl: 'https://testnet.mynearwallet.com/',
        helperUrl: 'https://testnet-api.kitwallet.app',
        explorerUrl: 'https://testnet.nearblocks.io',
        pikespeakUrl: 'https://pikespeak.ai',
        nearExplorerUrl: 'https://explorer.testnet.near.org/',
        indexerUrl: 'https://dev-indexer.ref-finance.com',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        newSodakiApiUrl: 'https://api.data-service.ref.finance/api',
        txIdApiUrl: 'https://api-testnet.nearblocks.io',
        memeRankApiUrl: 'https://test.api.cclp.finance',
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
        USDC_TOKEN_ID:
          '3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af',
        USDT_TOKEN_ID: 'usdtt.fakes.testnet',
        USDCe_TOKEN_ID: 'usdc.fakes.testnet',
        USDTe_TOKEN_ID: 'usdt.fakes.testnet',
        BRRR_TOKEN_ID: '',
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
        DCL_POOL_BLACK_LIST: ['usdt.fakes.testnet|wrap.testnet|100'],

        TOTAL_PLATFORM_FEE_REVENUE:
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '2601011.25',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '3459276.03',
        BLACKLIST_POOL_IDS: ['686'],
        REF_FARM_BOOST_CONTRACT_ID:
          process.env.REF_FARM_BOOST_CONTRACT_ID ||
          'boostfarm-dev.ref-dev.testnet',
        FARM_LOCK_SWITCH: process.env.FARM_LOCK_SWITCH || 0,
        VotingGauge: ['5%', '10%'],
        REF_UNI_V3_SWAP_CONTRACT_ID:
          process.env.REF_UNI_V3_SWAP_CONTRACT_ID ||
          'refv2-dev.ref-dev.testnet',
        REF_UNI_SWAP_CONTRACT_ID:
          process.env.REF_UNI_SWAP_CONTRACT_ID || 'refv2-dev.ref-dev.testnet',
        kitWalletOn: true,
        FARM_BLACK_LIST_V2: process.env.FARM_BLACK_LIST_V2 || ['666'],
        boostBlackList: process.env.FARM__BOOST_BLACK_LIST || [''],
        switch_on_dcl_farms: 'on',
        BURROW_CONTRACT_ID: 'contract.1689937928.burrow.testnet',
        USDTT_USDCC_USDT_USDC_POOL_ID:
          process.env.USDTT_USDCC_USDT_USDC_POOL_ID || 711,
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          'usdtt.fakes.testnet',
          'usdcc.fakes.testnet',
          'usdt.fakes.testnet',
          'usdc.fakes.testnet',
        ],
        USDT_USDC_POOL_ID: process.env.USDT_USDC_POOL_ID,
        FRAX_USDC_POOL_ID: process.env.FRAX_USDC_POOL_ID,
        USDT_USDC_TOKEN_IDS: [],
        FRAX_USDC_TOKEN_IDS: [],
        BLACK_TOKEN_LIST: [],
        REF_MEME_FARM_CONTRACT_ID:
          process.env.REF_MEME_FARM_CONTRACT_ID ||
          'memefarm-dev2.ref-dev.testnet',
        REF_TOKEN_LOCKER_CONTRACT_ID: 'token-locker.testnet',
      };
    default:
      return {
        classicTestUrl: 'https://test.api.cclp.finance',
        networkId: 'mainnet',
        nodeUrl: RPC_LIST[endPoint].url,
        walletUrl: 'https://wallet.near.org',
        myNearWalletUrl: 'https://app.mynearwallet.com/',
        helperUrl: 'https://api.kitwallet.app',
        explorerUrl: 'https://nearblocks.io',
        pikespeakUrl: 'https://pikespeak.ai',
        nearExplorerUrl: 'https://explorer.near.org/',
        indexerUrl: 'https://api.ref.finance',
        // indexerUrl: 'https://apiself.cclp.finance',
        sodakiApiUrl: 'https://api.stats.ref.finance/api',
        newSodakiApiUrl: 'https://api.data-service.ref.finance/api',
        txIdApiUrl: 'https://api3.nearblocks.io',
        memeRankApiUrl: 'https://api.ref.finance',
        blackList: process.env.FARM_BLACK_LIST || ['1371#3', '2769#2'],
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'v2.ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.near',
        REF_TOKEN_ID: 'token.v2.ref-finance.near',
        USDC_TOKEN_ID:
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        USDT_TOKEN_ID: 'usdt.tether-token.near',
        USDCe_TOKEN_ID:
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        USDTe_TOKEN_ID:
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
        BRRR_TOKEN_ID: 'token.burrow.near',
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
          process.env.TOTAL_PLATFORM_FEE_REVENUE || '2601011.25',
        CUMULATIVE_REF_BUYBACK:
          process.env.CUMULATIVE_REF_BUYBACK || '3459276.03',

        BLACKLIST_POOL_IDS: [
          '3699',
          '3734',
          '3563',
          '3613',
          '3620',
          '3625',
          // '1923',
          // '2451',
          // '1559',
          // '3015',
          // '3398',
          // '2089',
          // '2121',
          // '4149',
          // '3383',
          // '3805',
          // '3907',
          // '4161',
          // '3021',
          // '3385',
          // '3046',
          // '3384',
          // '1820',
          // '4150',
          // '3466',
          // '3386',
          // '3087',
          // '2558',
          // '3587',
          // '3759',
          // '1904',
          // '1903',
          // '3850',
          // '1821',
          // '2975',
          // '3529',
          // '3676',
          // '1908',
          // '2450',
          // '1955',
          // '2781',
          // '3822',
          // '2161',
          // '2560',
          // '3091',
          // '2497',
          // '2194',
          // '2320',
          '4744',
          '5029',
        ],

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
        REF_UNI_V3_SWAP_CONTRACT_ID:
          process.env.REF_UNI_V3_SWAP_CONTRACT_ID || 'dclv2.ref-labs.near',
        REF_UNI_SWAP_CONTRACT_ID:
          process.env.REF_UNI_SWAP_CONTRACT_ID || 'dcl.ref-labs.near',
        switch_on_dcl_farms: 'off',
        DCL_POOL_BLACK_LIST: ['usdt.tether-token.near|wrap.near|2000'],
        BURROW_CONTRACT_ID: 'contract.main.burrow.near',
        USDTT_USDCC_USDT_USDC_POOL_ID:
          process.env.USDTT_USDCC_USDT_USDC_POOL_ID || 4179,
        USDT_USDC_POOL_ID: process.env.USDT_USDC_POOL_ID || 4513,
        FRAX_USDC_POOL_ID: process.env.FRAX_USDC_POOL_ID || 4514,
        USDT_USDC_TOKEN_IDS: [
          'usdt.tether-token.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        FRAX_USDC_TOKEN_IDS: [
          '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        USDTT_USDCC_USDT_USDC_TOKEN_IDS: [
          'usdt.tether-token.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        ],
        BLACK_TOKEN_LIST: ['token.pembrock.near'],
        REF_MEME_FARM_CONTRACT_ID:
          process.env.REF_MEME_FARM_CONTRACT_ID ||
          'meme-farming_011.ref-labs.near',
        REF_TOKEN_LOCKER_CONTRACT_ID: 'token-locker.ref-labs.near',
      };
  }
}

export function getExtraStablePoolConfig(
  env: string = process.env.REACT_APP_NEAR_ENV
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

        RATED_POOLS_IDS: [
          '3514',
          '3515',
          '3612',
          '3688',
          '3689',
          '4179',
          '4513',
          '4514',
        ],
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          'usdt.tether-token.near': 0,
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': 1,
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 2,
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near': 3,
        },
        USDT_USDC_POOL_INDEX: {
          'usdt.tether-token.near': 0,
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': 1,
        },
        FRAX_USDC_POOL_INDEX: {
          '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near': 0,
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': 1,
        },
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

        USDT_POOL_ID: '1752',
        USDTIDS: ['usdt.fakes.testnet', 'usdtt.fakes.testnet'],
        USDT_POOL_INDEX: {
          'usdt.fakes.testnet': 0,
          'usdtt.fakes.testnet': 1,
        },
        RATED_POOLS_IDS: ['568', '571', '1044', '1751', '1752', '1843'],
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          'usdtt.fakes.testnet': 0,
          '3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af': 1,
          'usdt.fakes.testnet': 2,
          'usdc.fakes.testnet': 3,
        },
        USDT_USDC_POOL_INDEX: {},
        FRAX_USDC_POOL_INDEX: {},
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
        USDT_POOL_ID: '686',
        USDTIDS: ['usdt.fakes.testnet', 'usdtt.fakes.testnet'],
        USDT_POOL_INDEX: {
          'usdt.fakes.testnet': 0,
          'usdtt.fakes.testnet': 1,
        },

        RATED_POOLS_IDS: ['621', '622', '666', '685', '686', '711'],
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          'usdtt.fakes.testnet': 0,
          'usdcc.fakes.testnet': 1,
          'usdt.fakes.testnet': 2,
          'usdc.fakes.testnet': 3,
        },
        USDT_USDC_POOL_INDEX: {},
        FRAX_USDC_POOL_INDEX: {},
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

        RATED_POOLS_IDS: [
          '3514',
          '3515',
          '3612',
          '3688',
          '3689',
          '4179',
          '4513',
          '4514',
        ],
        USDTT_USDCC_USDT_USDC_POOL_INDEX: {
          'usdt.tether-token.near': 0,
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': 1,
          'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near': 2,
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near': 3,
        },
        USDT_USDC_POOL_INDEX: {
          'usdt.tether-token.near': 0,
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': 1,
        },
        FRAX_USDC_POOL_INDEX: {
          '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near': 0,
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1': 1,
        },
      };
  }
}
export function getTransakConfig(
  accountId: string,
  env: string = process.env.REACT_APP_NEAR_ENV
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

function getIsNewHostName() {
  const env = process.env.REACT_APP_NEAR_ENV;
  switch (env) {
    case 'production':
    case 'mainnet':
      return location.hostname.includes('orderbook');
    case 'testnet':
    case 'pub-testnet':
      return location.hostname.includes('bookdev'); // https://bookdev.ref-finance.com/
    default:
      return location.hostname.includes('orderbook'); //  https://orderbook.ref.finance/
    // return location.hostname.includes('localhost'); //  https://orderbook.ref.finance/
  }
}
export const isNewHostName = getIsNewHostName();
