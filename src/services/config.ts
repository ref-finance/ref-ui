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
        indexerUrl: 'https://mainnet-indexer.ref-finance.com',
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'ref-farming.near',
        REF_TOKEN_ID: 'token.ref-finance.near',
        REF_AIRDROP_CONTRACT_ID: 'ref-airdrop-lockup.near',
      };
    case 'development':
    case 'testnet':
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        indexerUrl: 'https://testnet-indexer.ref-finance.com',
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'ref-finance.testnet',
        WRAP_NEAR_CONTRACT_ID:
          process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.testnet',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'ref-farming.testnet',
        REF_TOKEN_ID: 'dev-1625652363313-84818027641724',
        REF_AIRDROP_CONTRACT_ID: 'ref-airdrop-lockup.testnet',
      };
    default:
      return {
        networkId: 'mainnet',
        nodeUrl: 'https://rpc.mainnet.near.org',
        walletUrl: 'https://wallet.near.org',
        helperUrl: 'https://helper.mainnet.near.org',
        explorerUrl: 'https://explorer.mainnet.near.org',
        indexerUrl: 'https://mainnet-indexer.ref-finance.com',
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
        REF_ADBOARD_CONTRACT_ID: 'ref-adboard.near',
        REF_FARM_CONTRACT_ID:
          process.env.REF_FARM_CONTRACT_ID || 'ref-farming.near',
        REF_TOKEN_ID: 'token.ref-finance.near',
        REF_AIRDROP_CONTRACT_ID: 'ref-airdrop-lockup.near',
      };
  }
}
