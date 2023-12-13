export default function getConfig(
  env: string = process.env.REACT_APP_NEAR_ENV
) {
  switch (env) {
    case 'production':
    case 'mainnet':
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        NATIVE_TOKENS: [
          'usdt.tether-token.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        ORDRRBOOK_COLLATTERAL_TOKEN:
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        ONLY_LIMIT_ORDER_DCL_POOL_IDS: [''],
      };
    case 'pub-testnet':
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [
          '3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af',
        ],
        NATIVE_TOKENS: [
          'usdtt.fakes.testnet',
          '3e2210e1184b45b64c8a434c0a7e7b23cc04ea7eb7a6c3c32520d03d4afcb8af',
        ],
        ORDRRBOOK_COLLATTERAL_TOKEN: 'usdc.orderly.testnet',
        ONLY_LIMIT_ORDER_DCL_POOL_IDS: [],
      };
    case 'testnet':
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [],
        NATIVE_TOKENS: ['usdtt.fakes.testnet', 'usdcc.fakes.testnet'],
        ORDRRBOOK_COLLATTERAL_TOKEN: 'usdc.orderly.testnet',
        ONLY_LIMIT_ORDER_DCL_POOL_IDS: [],
      };
    default:
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        NATIVE_TOKENS: [
          'usdt.tether-token.near',
          '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1',
        ],
        ORDRRBOOK_COLLATTERAL_TOKEN:
          'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
        ONLY_LIMIT_ORDER_DCL_POOL_IDS: [''],
      };
  }
}
