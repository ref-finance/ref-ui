declare module 'comlink-loader!*' {
  class WebpackWorker extends Worker {
    constructor();

    getStableSmart(params: {
      pools: import('./../../store/RefDatabase').PoolsTokens[];
      inputToken: string;
      outputToken: string;
      totalInput: string;
      slippageTolerance?: string;
    }): string;
  }

  export = WebpackWorker;
}
