import BN from 'bn.js';
import { toNonDivisibleNumber, toReadableNumber } from '../utils/numbers';
import {
  executeMultipleTransactions,
  near,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
  refFiViewFunction,
  Transaction,
  wallet,
} from './near';
import { TokenMetadata } from './ft-contract';
import { getPoolsByTokens, Pool } from './pool';
import {
  checkTokenNeedsStorageDeposit,
  getTokenBalance,
  getWhitelistedTokens,
  round,
} from './token';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import {
  storageDepositAction,
  storageDepositForTokenAction,
} from './creators/storage';
import { registerTokenAction, withdrawAction } from './creators/token';
import {
  nearMetadata,
  NEW_ACCOUNT_STORAGE_COST,
  WRAP_NEAR_CONTRACT_ID,
  wrapNear,
  wnearMetadata,
} from '~services/wrap-near';
import { utils } from 'near-api-js';

interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  ts?: string;
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
  const maxTokenInAmount = await getTokenBalance(tokenIn?.id);

  if (
    Number(maxTokenInAmount) <
    Number(toNonDivisibleNumber(tokenIn.decimals, amountIn))
  ) {
    await directSwap({
      pool,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
    });
  } else {
    await depositSwap({
      pool,
      tokenIn,
      tokenOut,
      amountIn,
      minAmountOut,
    });
  }
};

export const directSwap = async ({
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
    min_amount_out: round(
      tokenIn.decimals,
      toNonDivisibleNumber(tokenOut.decimals, minAmountOut)
    ),
  };

  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit(tokenIn.id);
  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const actions: RefFiFunctionCallOptions[] = [];

  if (tokenIn.symbol === wnearMetadata.symbol) {
    actions.push({
      methodName: 'near_deposit',
      args: {},
      amount: amountIn,
    });
  } else {
    actions.push({
      methodName: 'storage_deposit',
      args: {},
      gas: '100000000000000',
      amount: NEW_ACCOUNT_STORAGE_COST,
    });
  }

  actions.push({
    methodName: 'ft_transfer_call',
    args: {
      receiver_id: REF_FI_CONTRACT_ID,
      amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
      msg: JSON.stringify({
        force: 0,
        actions: [swapAction],
      }),
    },
    gas: '100000000000000',
    amount: ONE_YOCTO_NEAR,
  });

  transactions.push({
    receiverId: tokenIn.id,
    functionCalls: actions,
  });

  if (tokenOut.symbol === wnearMetadata.symbol) {
    transactions.push({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_withdraw',
          args: { amount: utils.format.parseNearAmount(minAmountOut) },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }

  const whitelist = await getWhitelistedTokens();
  if (!whitelist.includes(tokenOut.id)) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [registerTokenAction(tokenOut.id)],
    });
  }

  return executeMultipleTransactions(transactions);
};

export const depositSwap = async ({
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
