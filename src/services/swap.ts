import { refFiFunctionCall, refFiViewFunction } from './near';

interface EstimateSwapOptions {
  poolId: string;
  tokenInId: string;
  tokenOutId: string;
  amountIn: string;
}

export const estimateSwap = ({
  poolId,
  tokenInId,
  tokenOutId,
  amountIn,
}: EstimateSwapOptions) => {
  return refFiViewFunction({
    methodName: 'get_return',
    args: {
      pool_id: poolId,
      token_in: tokenInId,
      token_out: tokenOutId,
      amount_in: amountIn,
    },
  });
};

interface SwapOptions extends EstimateSwapOptions {
  minAmountOut: string;
}

export const swap = ({
  poolId,
  tokenInId,
  tokenOutId,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const swapAction = {
    pool_id: poolId,
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
