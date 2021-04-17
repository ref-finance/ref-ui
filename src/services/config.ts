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
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'ref-finance.near',
        WRAP_NEAR_CONTRACT_ID: process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.near',
      };
    case 'development':
    case 'testnet':
    default:
      return {
        networkId: 'testnet',
        nodeUrl: 'https://rpc.testnet.near.org',
        walletUrl: 'https://wallet.testnet.near.org',
        helperUrl: 'https://helper.testnet.near.org',
        explorerUrl: 'https://explorer.testnet.near.org',
        REF_FI_CONTRACT_ID:
          process.env.REF_FI_CONTRACT_ID || 'ref-finance.testnet',
        WRAP_NEAR_CONTRACT_ID:
          process.env.WRAP_NEAR_CONTRACT_ID || 'wrap.testnet',
      };
  }
}
