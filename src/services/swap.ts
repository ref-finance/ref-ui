import BN from 'bn.js';
import { toNonDivisibleNumber, toReadableNumber } from '../utils/numbers';
import {
  near,
  ONE_YOCTO_NEAR,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
  refFiViewFunction,
  wallet,
} from './near';
import { TokenMetadata } from './ft-contract';
import { getPoolsByTokens, Pool } from './pool';
import {
  checkTokenNeedsStorageDeposit,
  getWhitelistedTokens,
  round,
} from './token';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import { storageDepositForTokenAction } from './creators/storage';
import { registerTokenAction } from './creators/token';

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
  if (!parsedAmountIn)
    throw new Error(`${amountIn} is not a valid swap amount`);

  const pools = await getPoolsByTokens({
    tokenInId: tokenIn.id,
    tokenOutId: tokenOut.id,
    amountIn: parsedAmountIn,
  });

  if (pools.length < 1) {
    throw new Error(
      `No pool available to make a swap from ${tokenIn.symbol} -> ${tokenOut.symbol} for the amount ${amountIn}`
    );
  }

  try {
    const estimates = await Promise.all(
      pools.map((pool) => {
        return refFiViewFunction({
          methodName: 'get_return',
          args: {
            pool_id: pool.id,
            token_in: tokenIn.id,
            token_out: tokenOut.id,
            amount_in: parsedAmountIn,
          },
        })
          .then((estimate) => ({
            estimate,
            status: 'success',
            pool,
          }))
          .catch(() => ({ status: 'error', estimate: '0', pool }));
      })
    );

    const { estimate, pool } = estimates
      .filter(({ status }) => status === 'success')
      .sort((a, b) => (new BN(b.estimate).gt(new BN(a.estimate)) ? 1 : -1))[0];

    return {
      estimate: toReadableNumber(tokenOut.decimals, estimate),
      pool,
    };
  } catch {
    throw new Error(
      `No pool available to make a swap from ${tokenIn.symbol} -> ${tokenOut.symbol} for the amount ${amountIn}`
    );
  }
};

interface SwapOptions extends EstimateSwapOptions {
  pool: Pool;
  minAmountOut: string;
}

export const swap = async ({
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const swapAction = {
    pool_id: pool.id,
    token_in: tokenIn.id,
    token_out: tokenOut.id,
    amount_in: round(
      tokenIn.decimals,
      toNonDivisibleNumber(tokenIn.decimals, amountIn)
    ),
    min_amount_out: round(
      tokenIn.decimals,
      toNonDivisibleNumber(tokenOut.decimals, minAmountOut)
    ),
  };

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'swap',
      args: { actions: [swapAction] },
      amount: ONE_YOCTO_NEAR,
    },
  ];

  const whitelist = await getWhitelistedTokens();
  if (!whitelist.includes(tokenOut.id)) {
    actions.unshift(registerTokenAction(tokenOut.id));
  }

  const needsStorageDeposit = await checkTokenNeedsStorageDeposit(tokenOut.id);
  if (needsStorageDeposit) {
    actions.unshift(storageDepositForTokenAction());
  }

  return refFiManyFunctionCalls(actions);
};

export const checkSwap = (txHash: string) => {
  return (near.connection.provider as JsonRpcProvider).sendJsonRpc('tx', [
    txHash,
    wallet.getAccountId(),
  ]);
};
