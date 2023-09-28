import { IChartConfig, IChartItemConfig } from './interfaces';
export function get_custom_config_for_chart(): IChartConfig {
  const env: string = process.env.NEAR_ENV;
  if (env == 'pub-testnet') {
    return {};
  } else if (env == 'testnet') {
    return {
      'phoenix-bonds.testnet|wrap.testnet|2000': {
        bin: 2,
        range: 20,
        rangeGear: [100, 80, 60, 40, 20, 10],
        colors: ['#A36949', '#717C84'],
      },
      'usdc.fakes.testnet|wrap.testnet|2000': {
        bin: 10,
        range: 100,
        rangeGear: [180, 160, 140, 120, 100, 80, 60, 40, 20, 10],
        colors: ['#707C84', '#2775CA'],
      },
      'aurora.fakes.testnet|usdc.fakes.testnet|2000':
        // AURORA<>USDC.e@2000
        {
          bin: 10,
          range: 100,
          rangeGear: [180, 160, 140, 120, 100, 80, 60, 40, 20, 10],
          colors: ['#79BD84', '#2775CA'],
        },
      'eth.fakes.testnet|usdc.fakes.testnet|2000':
        // ETH<>USDC.e@2000
        {
          bin: 4,
          range: 50,
          rangeGear: [130, 110, 90, 70, 50, 30, 20, 10],
          colors: ['#626CA3', '#2775CA'],
        },
    };
  } else {
    return {
      'phoenix-bonds.near|wrap.near|2000':
        // pNEAR<>NEAR@20000
        {
          bin: 2,
          range: 20,
          rangeGear: [100, 80, 60, 40, 20, 10],
          colors: ['#A36949', '#717C84'],
        },
      'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|aurora|2000':
        // ETH<>USDC.e@2000
        {
          bin: 2,
          range: 50,
          rangeGear: [130, 110, 90, 70, 50, 30, 20, 10],
          colors: ['#626CA3', '#2775CA'],
        },
      'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|aaaaaa20d9e0e2461697782ef11675f668207961.factory.bridge.near|2000':
        // AURORA<>USDC.e@2000
        {
          bin: 5,
          range: 100,
          rangeGear: [180, 160, 140, 120, 100, 80, 60, 40, 20, 10],
          colors: ['#79BD84', '#2775CA'],
        },
      'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near|wrap.near|2000':
        // NEAR<>USDC.e@2000
        {
          bin: 5,
          range: 100,
          rangeGear: [180, 160, 140, 120, 100, 80, 60, 40, 20, 10],
          colors: ['#707C84', '#2775CA'],
        },
    };
  }
}
/**
 *
 * @returns
 * bin: 一个bin里slot的数量
 * range: 当前价格的百分比，获取以当前价格为中心点的左右range 默认
 * rangeGear: range 的档位，用来实现缩放
 */
export function get_default_config_for_chart(): IChartItemConfig {
  const env: string = process.env.NEAR_ENV;
  if (env == 'pub-testnet') {
    return {
      bin: 20,
      range: 40,
      rangeGear: [100, 80, 60, 40, 20, 10],
      colors: ['#707C84', '#2775CA'],
    };
  } else if (env == 'testnet') {
    return {
      bin: 10,
      range: 40,
      rangeGear: [100, 80, 60, 40, 20, 10],
      colors: ['#707C84', '#2775CA'],
    };
  } else {
    return {
      bin: 20,
      range: 40,
      rangeGear: [100, 80, 60, 40, 20, 10],
      colors: ['#707C84', '#2775CA'],
    };
  }
}

export const RADIUS_DEFAULT_NUMBER = 3;
export const max_nft_divisional_per_side = 3;
