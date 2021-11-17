export default function getConfig(env: string = process.env.NEAR_ENV) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        indexerUrl: 'https://indexer.ref-finance.net',
        sodakiApiUrl: 'https://sodaki.com/api',
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'v2.ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.near',
        REF_TOKEN_ID: 'token.ref-finance.near',
        REF_AIRDROP_CONTRACT_ID: 's01.ref-airdrop.near',
        POOL_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 10,
        MULTI_MINING_POOLS: [79, 377, 2, 4],
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        indexerUrl: 'https://dev-indexer.ref-finance.com',
        sodakiApiUrl: 'https://sodaki.com/api',
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'exchange.ref-dev.testnet',
        WRAP_NEAR_CONTRACT_ID:
          process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.testnet',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'farm102.ref-dev.testnet',

        REF_TOKEN_ID: 'token.ref-finance.testnet',
        REF_AIRDROP_CONTRACT_ID: 'locker002.ref-dev.testnet',
        POOL_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 10,
        MULTI_MINING_POOLS: [79, 377, 2, 4],
      };
    default:
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        indexerUrl: 'https://indexer.ref-finance.net',
        sodakiApiUrl: 'https://sodaki.com/api',
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'v2.ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'v2.ref-farming.near',
        REF_TOKEN_ID: 'token.ref-finance.near',
        REF_AIRDROP_CONTRACT_ID: 's01.ref-airdrop.near',
        POOL_TOKEN_REFRESH_INTERVAL:
          process.env.POOL_TOKEN_REFRESH_INTERVAL || 10,
        MULTI_MINING_POOLS: [79, 377, 2, 4],
      };
  }
}
