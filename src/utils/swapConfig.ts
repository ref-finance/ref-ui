const isTest = process.env.REACT_APP_NEAR_ENV == 'pub-testnet';
export const token_near_id = isTest ? 'wrap.testnet' : 'wrap.near';
export const token_usdt_id = isTest
  ? 'usdt.fakes.testnet'
  : 'usdt.tether-token.near';
export const token_usdc_id = isTest
  ? 'usdc.fakes.testnet'
  : '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1';
export const near_udsc_pool_id = isTest
  ? 'usdc.fakes.testnet|wrap.testnet|2000'
  : '17208628f84f5d6ad33f0da3bbbeb27ffcb398eac501a31bd6ad2011e36133a1|wrap.near|2000';
export const four_stable_pool_id = isTest ? 218 : 4179;
