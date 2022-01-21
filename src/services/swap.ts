import BN from 'bn.js';
import Big from 'big.js';
import {
  percentLess,
  scientificNotationToString,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from '../utils/numbers';
import {
  executeMultipleTransactions,
  near,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
  Transaction,
  wallet,
} from './near';
import {
  calculateOptimalOutput,
  calculate_dx_float,
  calculate_dy_float,
  formatPoolNew,
} from './parallelSwapLogic';

import {
  ftGetStorageBalance,
  ftGetTokenMetadata,
  TokenMetadata,
} from './ft-contract';
import { getPoolsByTokens, getPoolByToken, parsePool, Pool } from './pool';
import {
  checkTokenNeedsStorageDeposit,
  getWhitelistedTokens,
  round,
} from './token';
import { JsonRpcProvider } from 'near-api-js/lib/providers';
import {
  storageDepositAction,
  STORAGE_TO_REGISTER_WITH_MFT,
} from './creators/storage';
import { registerTokenAction } from './creators/token';
import { BigNumber } from 'bignumber.js';
import _, { filter } from 'lodash';

// Big.strict = false;
const FEE_DIVISOR = 10000;
const LP_THERESHOLD = 0.001;
const MAXIMUM_NUMBER_OF_POOLS = 5;

export enum PoolMode {
  PARALLEL = 'parallel swap',
  SMART = 'smart routing',
}

interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  intl?: any;
  setLoadingData?: (loading: boolean) => void;
  loadingTrigger?: boolean;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
}

export interface EstimateSwapView {
  estimate: string;
  pool: Pool;
  intl?: any;
  status?: PoolMode;
  token?: TokenMetadata;
}

const getSinglePoolEstimate = (
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  pool: Pool,
  tokenInAmount: string
) => {
  const allocation = toReadableNumber(
    tokenIn.decimals,
    scientificNotationToString(tokenInAmount)
  );

  const amount_with_fee = Number(allocation) * (FEE_DIVISOR - pool.fee);
  const in_balance = toReadableNumber(
    tokenIn.decimals,
    pool.supplies[tokenIn.id]
  );
  const out_balance = toReadableNumber(
    tokenOut.decimals,
    pool.supplies[tokenOut.id]
  );
  const estimate = new BigNumber(
    (
      (amount_with_fee * Number(out_balance)) /
      (FEE_DIVISOR * Number(in_balance) + amount_with_fee)
    ).toString()
  ).toFixed();

  return {
    token: tokenIn,
    estimate,
    pool,
  };
};

export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  setLoadingData,
  loadingTrigger,
  setLoadingTrigger,
}: EstimateSwapOptions): Promise<EstimateSwapView[]> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  if (!parsedAmountIn || !(Number(parsedAmountIn) > 0))
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  const pools = await getPoolsByTokens({
    tokenInId: tokenIn.id,
    tokenOutId: tokenOut.id,
    amountIn: parsedAmountIn,
    setLoadingData,
    setLoadingTrigger,
    loadingTrigger,
  });

  const getLiquidity = (pool: Pool) => {
    const amount1 = toReadableNumber(
      tokenIn.decimals,
      pool.supplies[tokenIn.id]
    );
    const amount2 = toReadableNumber(
      tokenOut.decimals,
      pool.supplies[tokenOut.id]
    );

    const lp = new Big(amount1).times(new Big(amount2));

    return Number(lp);
  };

  const maxLPPool = _.maxBy(pools, getLiquidity);

  const maxPoolLiquidity = maxLPPool
    ? new Big(getLiquidity(maxLPPool))
    : new Big(0);

  const filterFunc = (pool: Pool, i: number) =>
    maxPoolLiquidity.gt(0) &&
    new Big(getLiquidity(pool)).div(maxPoolLiquidity).gt(LP_THERESHOLD);

  const filteredPools = _.orderBy(pools, getLiquidity, ['desc'])
    .slice(0, MAXIMUM_NUMBER_OF_POOLS)
    .filter(filterFunc);

  console.log('filteredPools into algorithm ', filteredPools);

  const poolAllocations = calculateOptimalOutput(
    filteredPools,
    parsedAmountIn,
    tokenIn.id,
    tokenOut.id
  );

  console.log('allocations', poolAllocations);

  const parallelPoolsWithAllocation = filteredPools.map((pool, i) => ({
    ...pool,
    partialAmountIn: scientificNotationToString(poolAllocations[i].toString()),
  }));

  const parallelPools = parallelPoolsWithAllocation.filter(
    (paraPool) => Number(paraPool.partialAmountIn) > 0
  );

  // smart routing
  if (parallelPools.length < 1) {
    let pool1, pool2;
    let tokenMidId;

    const pools1 = (await getPoolByToken(tokenIn.id)).filter((p) => {
      const supplies = Object.values(p.supplies);

      return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
    });

    for (let i = 0; i < pools1.length; i++) {
      const tempPool1 = pools1[i];
      tokenMidId =
        tempPool1.tokenIds[0] === tokenIn.id
          ? tempPool1.tokenIds[1]
          : tempPool1.tokenIds[0];

      const pools2 = (await getPoolByToken(tokenMidId)).filter((p) => {
        const supplies = Object.values(p.supplies);

        return (
          new Big(supplies[0]).times(new Big(supplies[1])).gt(0) &&
          p.tokenIds.includes(tokenOut.id)
        );
      });

      if (pools2.length > 0) {
        pool2 = pools2[0];
        pool1 = tempPool1;
        break;
      }
    }

    if (pool1 && pool2) {
      const tokenMidMeta = await ftGetTokenMetadata(tokenMidId);

      const estimate1 = {
        ...getSinglePoolEstimate(tokenIn, tokenMidMeta, pool1, parsedAmountIn),
        status: PoolMode.SMART,
      };
      const estimate2 = {
        ...getSinglePoolEstimate(
          tokenMidMeta,
          tokenOut,
          pool2,
          toNonDivisibleNumber(tokenMidMeta.decimals, estimate1.estimate)
        ),
        status: PoolMode.SMART,
      };

      console.log(estimate1, estimate2);
      return [estimate1, estimate2];
    }

    throw new Error(
      `${intl.formatMessage({
        id: 'no_pool_available_to_make_a_swap_from',
      })} ${tokenIn.symbol} -> ${tokenOut.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  } else {
    // parallel swap
    try {
      const estimates = parallelPools.map((pool) => ({
        ...getSinglePoolEstimate(
          tokenIn,
          tokenOut,
          pool,
          pool.partialAmountIn.toString()
        ),
        status: PoolMode.PARALLEL,
      }));
      return estimates;
    } catch (err) {
      throw new Error(
        `${intl.formatMessage({
          id: 'no_pool_available_to_make_a_swap_from',
        })} ${tokenIn.symbol} -> ${tokenOut.symbol} ${intl.formatMessage({
          id: 'for_the_amount',
        })} ${amountIn} ${intl.formatMessage({
          id: 'no_pool_eng_for_chinese',
        })}`
      );
    }
  }
};

interface SwapOptions {
  useNearBalance?: boolean;
  swapsToDo: EstimateSwapView[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  slippageTolerance: number;
}

export const swap = async ({
  useNearBalance,
  tokenIn,
  tokenOut,
  swapsToDo,
  slippageTolerance,
  amountIn,
}: SwapOptions) => {
  if (swapsToDo) {
    if (useNearBalance) {
      await instantSwap({
        tokenIn,
        tokenOut,
        amountIn,
        swapsToDo,
        slippageTolerance,
      });
    } else {
      await depositSwap({
        tokenIn,
        tokenOut,
        amountIn,
        slippageTolerance,
        swapsToDo,
      });
    }
  }
};

export const instantSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: // minAmountOut,
SwapOptions) => {
  const transactions: Transaction[] = [];
  const tokenInActions: RefFiFunctionCallOptions[] = [];
  const tokenOutActions: RefFiFunctionCallOptions[] = [];

  const registerToken = async (token: TokenMetadata) => {
    const tokenRegistered = await ftGetStorageBalance(
      token.id,
      wallet.getAccountId()
    ).catch(() => {
      throw new Error(`${tokenOut.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      tokenOutActions.push({
        methodName: 'storage_deposit',
        args: {
          registration_only: true,
          account_id: wallet.getAccountId(),
        },
        gas: '30000000000000',
        amount: STORAGE_TO_REGISTER_WITH_MFT,
      });

      transactions.push({
        receiverId: tokenOut.id,
        functionCalls: tokenOutActions,
      });
    }
  };

  const isParallelSwap = swapsToDo.every(
    (estimate) => estimate.status === PoolMode.PARALLEL
  );

  if (wallet.isSignedIn()) {
    if (isParallelSwap) {
      const swapActions = swapsToDo.map((s2d) => {
        let dx_float = Number(s2d.pool.partialAmountIn);
        let fpool = formatPoolNew(s2d.pool, tokenIn.id, tokenOut.id);
        let dy_float = calculate_dy_float(
          dx_float,
          fpool,
          tokenIn.id,
          tokenOut.id
        );
        let tokenOutAmount = toReadableNumber(
          tokenOut.decimals,
          scientificNotationToString(dy_float.toString())
        );

        s2d.estimate = tokenOutAmount;
        let minTokenOutAmount = tokenOutAmount
          ? percentLess(slippageTolerance, tokenOutAmount)
          : '0';
        let allocation = toReadableNumber(
          tokenIn.decimals,
          scientificNotationToString(s2d.pool.partialAmountIn)
        );

        return {
          pool_id: s2d.pool.id,
          token_in: tokenIn.id,
          token_out: tokenOut.id,
          amount_in: round(
            tokenIn.decimals,
            toNonDivisibleNumber(tokenIn.decimals, allocation)
          ),
          min_amount_out: round(
            tokenOut.decimals,
            toNonDivisibleNumber(tokenOut.decimals, minTokenOutAmount)
          ),
        };
      });

      await registerToken(tokenOut);

      tokenInActions.push({
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: REF_FI_CONTRACT_ID,
          amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
          msg: JSON.stringify({
            force: 0,
            actions: swapActions,
          }),
        },
        gas: '180000000000000',
        amount: ONE_YOCTO_NEAR,
      });

      transactions.push({
        receiverId: tokenIn.id,
        functionCalls: tokenInActions,
      });

      return executeMultipleTransactions(transactions);
    } else {
      const tokenMid = swapsToDo[1].token;

      await Promise.all(
        [tokenMid, tokenOut].map(async (token) => {
          await registerToken(token);
        })
      );

      transactions.push({
        receiverId: tokenIn.id,
        functionCalls: [
          {
            methodName: 'ft_transfer_call',
            args: {
              receiver_id: REF_FI_CONTRACT_ID,
              amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
              msg: JSON.stringify({
                force: 0,
                actions: [
                  {
                    pool_id: swapsToDo[0].pool.id,
                    token_in: tokenIn.id,
                    token_out: tokenMid.id,
                    amountIn: round(
                      tokenIn.decimals,
                      toNonDivisibleNumber(tokenIn.decimals, amountIn)
                    ),
                    min_amount_out: '0',
                  },
                  {
                    pool_id: swapsToDo[1].pool.id,
                    token_in: tokenMid.id,
                    token_out: tokenOut.id,
                    min_amount_out: round(
                      tokenOut.decimals,
                      toNonDivisibleNumber(
                        tokenOut.decimals,
                        percentLess(slippageTolerance, swapsToDo[1].estimate)
                      )
                    ),
                  },
                ],
              }),
            },
            gas: '180000000000000',
            amount: ONE_YOCTO_NEAR,
          },
        ],
      });

      return executeMultipleTransactions(transactions);
    }
  }
};

export const depositSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  slippageTolerance,
  swapsToDo,
}: // minAmountOut,
SwapOptions) => {
  const isParallelSwap = swapsToDo.every(
    (estimate) => estimate.status === PoolMode.PARALLEL
  );

  if (isParallelSwap) {
    const swapActions = swapsToDo.map((s2d) => {
      let dx_float = Number(s2d.pool.partialAmountIn);
      let fpool = formatPoolNew(s2d.pool, tokenIn.id, tokenOut.id);
      let dy_float = calculate_dy_float(
        dx_float,
        fpool,
        tokenIn.id,
        tokenOut.id
      );
      let tokenOutAmount = toReadableNumber(
        tokenOut.decimals,
        scientificNotationToString(dy_float.toString())
      );

      s2d.estimate = tokenOutAmount;
      let minTokenOutAmount = tokenOutAmount
        ? percentLess(slippageTolerance, tokenOutAmount)
        : '0';
      let allocation = toReadableNumber(
        tokenIn.decimals,
        scientificNotationToString(s2d.pool.partialAmountIn)
      );

      return {
        pool_id: s2d.pool.id,
        token_in: tokenIn.id,
        token_out: tokenOut.id,
        amount_in: round(
          tokenIn.decimals,
          toNonDivisibleNumber(tokenIn.decimals, allocation)
        ),
        min_amount_out: round(
          tokenOut.decimals,
          toNonDivisibleNumber(tokenOut.decimals, minTokenOutAmount)
        ),
      };
    });

    const actions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'swap',
        args: { actions: swapActions },
        amount: ONE_YOCTO_NEAR,
      },
    ];

    const whitelist = await getWhitelistedTokens();
    if (!whitelist.includes(tokenOut.id)) {
      actions.unshift(registerTokenAction(tokenOut.id));
    }

    const neededStorage = await checkTokenNeedsStorageDeposit();
    if (neededStorage) {
      actions.unshift(storageDepositAction({ amount: neededStorage }));
    }

    return refFiManyFunctionCalls(actions);
  } else {
    const whitelist = await getWhitelistedTokens();
    const tokenMid = swapsToDo[1].token;
    const actions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'swap',
        amount: ONE_YOCTO_NEAR,
        args: {
          actions: [
            {
              pool_id: swapsToDo[0].pool.id,
              token_in: tokenIn.id,
              token_out: tokenMid.id,
              amount_in: round(
                tokenIn.decimals,
                toNonDivisibleNumber(tokenIn.decimals, amountIn)
              ),
              min_amount_out: '0',
            },
            {
              pool_id: swapsToDo[1].pool.id,
              token_in: tokenMid.id,
              token_out: tokenOut.id,
              amount_in: round(
                tokenMid.decimals,
                toNonDivisibleNumber(tokenMid.decimals, swapsToDo[0].estimate)
              ),
              min_amount_out: round(
                tokenOut.decimals,
                toNonDivisibleNumber(
                  tokenOut.decimals,
                  percentLess(slippageTolerance, swapsToDo[1].estimate)
                )
              ),
            },
          ],
        },
      },
    ];
    if (!whitelist.includes(tokenOut.id)) {
      actions.unshift(registerTokenAction(tokenOut.id));
    }
    if (!whitelist.includes(tokenMid.id)) {
      actions.unshift(registerTokenAction(tokenMid.id));
    }

    const neededStorage = await checkTokenNeedsStorageDeposit();
    if (neededStorage) {
      actions.unshift(storageDepositAction({ amount: neededStorage }));
    }

    return refFiManyFunctionCalls(actions);
  }
};

export const checkTransaction = (txHash: string) => {
  return (near.connection.provider as JsonRpcProvider).sendJsonRpc(
    'EXPERIMENTAL_tx_status',
    [txHash, wallet.getAccountId()]
  );
};
