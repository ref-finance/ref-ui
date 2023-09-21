export default function getConfig(env: string = process.env.NEAR_ENV) {
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
      };
    case 'pub-testnet':
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [],
        NATIVE_TOKENS: ['usdtt.fakes.testnet', 'usdcc.fakes.testnet'],
      };
    case 'testnet':
      return {
        NO_REQUIRED_REGISTRATION_TOKEN_IDS: [],
        NATIVE_TOKENS: ['usdtt.fakes.testnet', 'usdcc.fakes.testnet'],
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
      };
  }
}
