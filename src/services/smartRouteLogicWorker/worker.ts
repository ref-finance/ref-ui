import { expose } from 'comlink';

import { stableSmart } from './smartRouteLogicSimple.js';

export type StableSmartParams = {
  pools: import('./../../store/RefDatabase').PoolsTokens[];
  inputToken: string;
  outputToken: string;
  totalInput: string;
  slippageTolerance?: string;
};
const worker = {
  async getStableSmart({
    pools,
    inputToken,
    outputToken,
    totalInput,
    slippageTolerance,
  }: StableSmartParams) {
    const result = await stableSmart({
      pools,
      inputToken,
      outputToken,
      totalInput,
      slippageTolerance,
    });
    // console.log('swap smart route logic result', result);
    return JSON.stringify(result);
  },
};

expose(worker);

export default worker;
