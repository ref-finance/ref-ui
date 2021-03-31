import { refFiFunctionCall, refFiViewFunction } from './near';
import { getIdealSwapPool } from './pool';

interface EstimateSwapOptions {
  tokenInId: string;
  tokenOutId: string;
  amountIn: string;
}

export interface EstimateSwapView {
  estimate: string;
  poolId: number;
}
export const estimateSwap = async ({
  tokenInId,
  tokenOutId,
  amountIn,
}: EstimateSwapOptions): Promise<EstimateSwapView> => {
  const pool = await getIdealSwapPool({ tokenInId, tokenOutId, amountIn });
  const estimate = await refFiViewFunction({
    methodName: 'get_return',
    args: {
      pool_id: pool.id,
      token_in: tokenInId,
      token_out: tokenOutId,
      amount_in: amountIn,
    },
  });

  return {
    estimate,
    poolId: pool.id,
  };
};

interface SwapOptions extends EstimateSwapOptions {
  poolId: number;
  minAmountOut: string;
}

export const swap = async ({
  poolId,
  tokenInId,
  tokenOutId,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const swapAction = {
    pool_id: pool.id,
    token_in: tokenInId,
    token_out: tokenOutId,
    amount_in: amountIn,
    min_amount_out: minAmountOut,
  };
  return refFiFunctionCall({
    methodName: 'swap',
    args: { actions: [swapAction] },
  });
};
