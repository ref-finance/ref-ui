import { toNonDivisibleNumber, toReadableNumber } from '~utils/numbers';
import { refFiFunctionCall, refFiViewFunction } from './near';
import { getIdealSwapPool, Pool } from './pool';
import { TokenMetadata } from './token';

interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
}

export interface EstimateSwapView {
  estimate: string;
  pool: Pool;
}
export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
}: EstimateSwapOptions): Promise<EstimateSwapView> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);
  console.log(parsedAmountIn);

  const pool = await getIdealSwapPool({
    tokenInId: tokenIn.id,
    tokenOutId: tokenOut.id,
    amountIn: parsedAmountIn,
  });

  if (!pool)
    throw new Error(
      `No pool available to make a swap from ${tokenIn.symbol} -> ${tokenOut.symbol} for the amount ${amountIn}`
    );

  const estimate = await refFiViewFunction({
    methodName: 'get_return',
    args: {
      pool_id: pool.id,
      token_in: tokenIn.id,
      token_out: tokenOut.id,
      amount_in: parsedAmountIn,
    },
  });

  return {
    estimate: toReadableNumber(tokenOut.decimals, estimate),
    pool,
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
    pool_id: poolId,
    token_in: tokenInId,
    token_out: tokenOutId,
    amount_in: amountIn,
    min_amount_out: minAmountOut,
  };
  return refFiFunctionCall({
    methodName: 'swap',
    args: { actions: [swapAction] },
    amount: '0.000000000000000000000001',
  });
};
