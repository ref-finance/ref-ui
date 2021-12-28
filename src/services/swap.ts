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

import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import { getPoolsByTokens, Pool } from './pool';
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

Big.DP = 40;
// Big.strict = false;
const FEE_DIVISOR = 10000;
const LP_THERESHOLD = 0.001;
const MAXIMUM_NUMBER_OF_POOLS = 5;
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
}

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
  if (!parsedAmountIn)
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

  const filterFunc = (pool: Pool, i: number) =>
    new Big(getLiquidity(maxLPPool)).gt(0) &&
    new Big(getLiquidity(pool))
      .div(new Big(getLiquidity(maxLPPool)))
      .gt(LP_THERESHOLD);

  const filteredPools = _.orderBy(pools, getLiquidity, ['desc'])
    .slice(0, MAXIMUM_NUMBER_OF_POOLS)
    .filter(filterFunc);

  console.log('filtered pools', filteredPools, 'pools', pools);

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

  if (parallelPools.length < 1) {
    throw new Error(
      `${intl.formatMessage({ id: 'no_pool_available_to_make_a_swap_from' })} ${
        tokenIn.symbol
      } -> ${tokenOut.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  }

  try {
    const estimates = await Promise.all(
      parallelPools.map((pool) => {
        const allocation = toReadableNumber(
          tokenIn.decimals,
          scientificNotationToString(pool.partialAmountIn.toString())
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

        return Promise.resolve(estimate)
          .then((estimate) => ({
            estimate,
            status: 'success',
            pool,
          }))
          .catch(() => ({ status: 'error', estimate: '0', pool }));
      })
    );
    return estimates;
  } catch (err) {
    throw new Error(
      `${intl.formatMessage({ id: 'no_pool_available_to_make_a_swap_from' })} ${
        tokenIn.symbol
      } -> ${tokenOut.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  }
};

interface SwapOptions extends EstimateSwapOptions {
  pool: Pool;
  minAmountOut: string;
}

interface InstantSwapOption extends SwapOptions {
  useNearBalance: boolean;
}

interface ParaSwapOptions {
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
}: ParaSwapOptions) => {
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
  // pool,
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: // minAmountOut,
ParaSwapOptions) => {
  const swapActions = swapsToDo.map((s2d) => {
    let dx_float = Number(s2d.pool.partialAmountIn);
    let fpool = formatPoolNew(s2d.pool, tokenIn.id, tokenOut.id);
    let dy_float = calculate_dy_float(dx_float, fpool, tokenIn.id, tokenOut.id);
    let tokenOutAmount = toReadableNumber(
      tokenOut.decimals,
      scientificNotationToString(dy_float.toString())
    );
    // dy_float
    //   .div(Big(10).pow(tokenOut.decimals))
    //   .toString();
    s2d.estimate = tokenOutAmount;
    let minTokenOutAmount = tokenOutAmount
      ? percentLess(slippageTolerance, tokenOutAmount)
      : '0';
    let allocation = toReadableNumber(
      tokenIn.decimals,
      scientificNotationToString(s2d.pool.partialAmountIn)
    );
    // s2d.pool.partialAmountIn
    //   .div(Big(10).pow(tokenIn.decimals))
    //   .toString();
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

  // const swapAction = {
  //   pool_id: pool?.id,
  //   token_in: tokenIn?.id,
  //   token_out: tokenOut?.id,
  //   min_amount_out: round(
  //     tokenIn.decimals,
  //     toNonDivisibleNumber(tokenOut.decimals, minAmountOut)
  //   ),
  // };

  const transactions: Transaction[] = [];
  const tokenInActions: RefFiFunctionCallOptions[] = [];
  const tokenOutActions: RefFiFunctionCallOptions[] = [];

  if (wallet.isSignedIn()) {
    const tokenOutRegistered = await ftGetStorageBalance(
      tokenOut.id,
      wallet.getAccountId()
    ).catch(() => {
      throw new Error(`${tokenOut.id} doesn't exist.`);
    });

    if (tokenOutRegistered === null) {
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
      gas: '150000000000000',
      amount: ONE_YOCTO_NEAR,
    });

    transactions.push({
      receiverId: tokenIn.id,
      functionCalls: tokenInActions,
    });

    return executeMultipleTransactions(transactions);
  }
};

export const depositSwap = async ({
  // pool,
  tokenIn,
  tokenOut,
  amountIn,
  slippageTolerance,
  swapsToDo,
}: // minAmountOut,
ParaSwapOptions) => {
  const swapActions = swapsToDo.map((s2d) => {
    let dx_float = Number(s2d.pool.partialAmountIn);
    let fpool = formatPoolNew(s2d.pool, tokenIn.id, tokenOut.id);
    let dy_float = calculate_dy_float(dx_float, fpool, tokenIn.id, tokenOut.id);
    let tokenOutAmount = toReadableNumber(
      tokenOut.decimals,
      scientificNotationToString(dy_float.toString())
    );
    // dy_float
    //   .div(Big(10).pow(tokenOut.decimals))
    //   .toString();
    s2d.estimate = tokenOutAmount;
    let minTokenOutAmount = tokenOutAmount
      ? percentLess(slippageTolerance, tokenOutAmount)
      : '0';
    let allocation = toReadableNumber(
      tokenIn.decimals,
      scientificNotationToString(s2d.pool.partialAmountIn)
    );
    // s2d.pool.partialAmountIn
    //   .div(Big(10).pow(tokenIn.decimals))
    //   .toString();
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
};

export const checkTransaction = (txHash: string) => {
  return (near.connection.provider as JsonRpcProvider).sendJsonRpc(
    'EXPERIMENTAL_tx_status',
    [txHash, wallet.getAccountId()]
  );
};
