import Big from 'big.js';
import db from '../store/RefDatabase';

import { getLiquidity } from '../utils/pool';

import {
  ONLY_ZEROS,
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
  STABLE_TOKEN_IDS,
  BTCIDS,
  BTC_STABLE_POOL_ID,
} from './near';
import {
  calculateOptimalOutput,
  calculate_dx_float,
  calculate_dy_float,
  formatPoolNew,
  checkIntegerSumOfAllocations,
} from './parallelSwapLogic';

import {
  ftGetStorageBalance,
  ftGetTokenMetadata,
  ftGetTokensMetadata,
  TokenMetadata,
} from './ft-contract';
import {
  getPoolsByTokens,
  StablePool,
  getRefPoolsByToken1ORToken2,
  getPoolsByTokensAurora,
} from './pool';
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
import { registerTokenAction, registerAccountOnToken } from './creators/token';
import { BigNumber } from 'bignumber.js';
import _ from 'lodash';
import { getSwappedAmount, restShare } from './stable-swap';
import { isStablePool, isStableToken } from './near';
import { SWAP_MODE, SwapContractType, SwapMarket } from '../pages/SwapPage';
import { STABLE_TOKEN_USN_IDS, STABLE_POOL_USN_ID } from './near';
import { STABLE_LP_TOKEN_DECIMALS } from '../components/stableswap/AddLiquidity';
import {
  getSmartRouteSwapActions,
  stableSmart,
  getExpectedOutputFromActions,
  //@ts-ignore
} from './smartRouteLogic';
import { getCurrentWallet } from '../utils/wallets-integration';
import {
  multiply,
  separateRoutes,
  toRoundedReadableNumber,
} from '../utils/numbers';
import { auroraSwapTransactions } from './aurora/aurora';
import {
  getAllStablePoolsFromCache,
  Pool,
  getStablePoolFromCache,
} from './pool';
import {
  WRAP_NEAR_CONTRACT_ID,
  nearWithdraw,
  nearMetadata,
  nearDepositTransaction,
  nearWithdrawTransaction,
} from './wrap-near';
import { getStablePoolDecimal } from '../pages/stable/StableSwapEntry';
import { percentLess, percent } from '../utils/numbers';
import { getTokenFlow } from './indexer';
import getConfig from './config';
export const REF_FI_SWAP_SIGNAL = 'REF_FI_SWAP_SIGNAL_KEY';

// Big.strict = false;
const FEE_DIVISOR = 10000;

export enum PoolMode {
  PARALLEL = 'parallel swap',
  SMART = 'smart routing',
  SMART_V2 = 'stableSmart',
  STABLE = 'stable swap',
}

interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  intl?: any;
  setLoadingData?: (loading: boolean) => void;
  loadingTrigger?: boolean;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  swapMode?: SWAP_MODE;
  supportLedger?: boolean;
  swapPro?: boolean;
  setSwapsToDoTri?: (todos: EstimateSwapView[]) => void;
  setSwapsToDoRef?: (todos: EstimateSwapView[]) => void;
  proGetCachePool?: boolean;
}

export interface ReservesMap {
  [index: string]: string;
}

export interface RoutePool {
  amounts: string[];
  fee: number;
  id: number;
  reserves: ReservesMap;
  shares: string;
  token0_ref_price: string;
  token1Id: string;
  token1Supply: string;
  token2Id: string;
  token2Supply: string;
  updateTime: number;
  partialAmountIn?: string | number | Big;
  gamma_bps?: Big;
  supplies?: ReservesMap;
  tokenIds?: string[];
  x?: string;
  y?: string;
}

export interface EstimateSwapView {
  estimate: string;
  pool: Pool | null;
  intl?: any;
  partialAmountIn?: string;
  dy?: string;
  status?: PoolMode;
  token?: TokenMetadata;
  noFeeAmountOut?: string;
  inputToken?: string;
  outputToken?: string;
  nodeRoute?: string[];
  tokens?: TokenMetadata[];
  routeInputToken?: string;
  routeOutputToken?: string;
  route?: RoutePool[];
  allRoutes?: RoutePool[][];
  allNodeRoutes?: string[][];
  totalInputAmount?: string;
  overallPriceImpact?: string;
  contract?: SwapContractType;
  percent?: string;
}

const getStablePoolEstimate = ({
  tokenIn,
  tokenOut,
  amountIn,
  stablePoolInfo,
  stablePool,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  stablePoolInfo: StablePool;
  stablePool: Pool;
}) => {
  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(stablePool.id);

  const [amount_swapped, fee, dy] = getSwappedAmount(
    tokenIn.id,
    tokenOut.id,
    amountIn,
    stablePoolInfo
  );

  const amountOut =
    amount_swapped < 0
      ? '0'
      : toPrecision(scientificNotationToString(amount_swapped.toString()), 0);

  const dyOut =
    amount_swapped < 0
      ? '0'
      : toPrecision(scientificNotationToString(dy.toString()), 0);

  return {
    estimate: toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amountOut),
    noFeeAmountOut: toReadableNumber(STABLE_LP_TOKEN_DECIMALS, dyOut),
    pool: { ...stablePool, Dex: 'ref' },
    token: tokenIn,
    outputToken: tokenOut.id,
    inputToken: tokenIn.id,
  };
};

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
    outputToken: tokenOut.id,
    inputToken: tokenIn.id,
  };
};

export const getPoolEstimate = async ({
  tokenIn,
  tokenOut,
  amountIn,
  Pool,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  Pool: Pool;
}) => {
  if (isStablePool(Pool.id)) {
    const stablePoolInfo = (
      await getStablePoolFromCache(Pool.id.toString())
    )[1];

    return getStablePoolEstimate({
      tokenIn,
      tokenOut,
      amountIn: toReadableNumber(tokenIn.decimals, amountIn),
      stablePoolInfo,
      stablePool: Pool,
    });
  } else {
    return getSinglePoolEstimate(tokenIn, tokenOut, Pool, amountIn);
  }
};

export const getStablePoolThisPair = ({
  tokenInId,
  tokenOutId,
  stablePools,
}: {
  tokenInId: string;
  tokenOutId: string;
  stablePools: Pool[];
}) => {
  return stablePools.filter(
    (p) =>
      p.tokenIds.includes(tokenInId) &&
      p.tokenIds.includes(tokenOutId) &&
      tokenInId !== tokenOutId
  );
};

export const getStablePoolInfoThisPair = ({
  tokenInId,
  tokenOutId,
  stablePoolsInfo,
}: {
  tokenInId: string;
  tokenOutId: string;
  stablePoolsInfo: StablePool[];
}) => {
  return stablePoolsInfo.filter(
    (p) =>
      p.token_account_ids.includes(tokenInId) &&
      p.token_account_ids.includes(tokenOutId)
  );
};

export const estimateSwapFlow = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  supportLedger,
}: EstimateSwapOptions): Promise<{
  estimates: EstimateSwapView[];
}> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  if (ONLY_ZEROS.test(parsedAmountIn))
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  const throwNoPoolError = () => {
    throw new Error(
      `${intl.formatMessage({
        id: 'no_pool_available_to_make_a_swap_from',
      })} ${tokenIn?.symbol} -> ${tokenOut?.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  };

  const tokenFlow = await getTokenFlow({
    tokenInAmount: amountIn,
    tokenInId: tokenIn.id,
    tokenOutId: tokenOut.id,
    ledger: supportLedger,
  });

  //@ts-ignore
  if (tokenFlow?.data === null || tokenFlow === null) throwNoPoolError();

  // const res = await Promise.all(
  //   tokenFlow
  //     .map((flow) => {
  //       return flow.pool_ids.map(async (pool_id, i) => {
  //         const pool = isStablePool(pool_id)
  //           ? (await getStablePoolFromCache(pool_id.toString()))[0]
  //           : await db
  //               .queryTopPoolsByIds({
  //                 poolIds: [pool_id],
  //               })
  //               .then((pools) => pools?.[0]);

  //         return {
  //           estimate:
  //             i === flow.pool_ids.length - 1
  //               ? new Big(flow.amount).toFixed(tokenOut.decimals)
  //               : '',
  //           inputToken: flow.all_tokens[i],
  //           outputToken: flow.all_tokens[i + 1],
  //           tokens: await Promise.all(
  //             flow.all_tokens.map((t) => ftGetTokenMetadata(t))
  //           ),
  //           percent: flow.swap_ratio.toString(),
  //           partialAmountIn:
  //             i === 0
  //               ? new Big(parsedAmountIn)
  //                   .mul(new Big(flow.swap_ratio))
  //                   .div(100)
  //                   .toFixed(0, 0)
  //               : '',
  //           pool: pool,
  //         } as EstimateSwapView;
  //       });
  //     })
  //     .flat()
  // );

  return { estimates: [] };
};
export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  setLoadingData,
  loadingTrigger,
  supportLedger,
  proGetCachePool,
}: EstimateSwapOptions): Promise<{
  estimates: EstimateSwapView[];
  tag: string;
}> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  sessionStorage.setItem('loadingTrigger', loadingTrigger.toString());

  const tag = `${tokenIn.id}-${parsedAmountIn}-${tokenOut.id}`;

  if (ONLY_ZEROS.test(parsedAmountIn))
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  const throwNoPoolError = () => {
    throw new Error(
      `${intl.formatMessage({
        id: 'no_pool_available_to_make_a_swap_from',
      })} ${tokenIn?.symbol} -> ${tokenOut?.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  };

  let pools = (
    await getPoolsByTokens({
      tokenInId: tokenIn.id,
      tokenOutId: tokenOut.id,
      amountIn: parsedAmountIn,
      setLoadingData,
      loadingTrigger,
      tokenIn,
      tokenOut,
      proGetCachePool,
    })
  ).filter((p) => {
    return getLiquidity(p, tokenIn, tokenOut) > 0;
  });

  if (supportLedger) {
    const { supportLedgerRes } = await getOneSwapActionResult(
      pools,
      loadingTrigger,
      tokenIn,
      tokenOut,
      supportLedger,
      throwNoPoolError,
      amountIn,
      parsedAmountIn
    );

    return { estimates: supportLedgerRes, tag };
  }

  const orpools = await getRefPoolsByToken1ORToken2(tokenIn.id, tokenOut.id);

  let stableSmartActionsV2 = await stableSmart(
    orpools.filter((p) => !p?.Dex || p.Dex !== 'tri'),
    tokenIn.id,
    tokenOut.id,
    parsedAmountIn
  );

  let res = stableSmartActionsV2;

  let smartRouteV2OutputEstimate = stableSmartActionsV2
    .filter((a: any) => a.outputToken == a.routeOutputToken)
    .map((a: any) => new Big(a.estimate))
    .reduce((a: any, b: any) => a.plus(b), new Big(0))
    .toString();

  // hybrid smart routing
  if (isStableToken(tokenIn.id) || isStableToken(tokenOut.id)) {
    let hybridStableSmart = await getHybridStableSmart(
      tokenIn,
      tokenOut,
      amountIn,
      loadingTrigger
    );

    let hybridStableSmartOutputEstimate = hybridStableSmart.estimate.toString();

    if (
      new Big(
        hybridStableSmartOutputEstimate === 'NaN'
          ? '0'
          : hybridStableSmartOutputEstimate
      ).gt(new Big(smartRouteV2OutputEstimate))
    ) {
      res = hybridStableSmart.actions;
    } else {
      res = stableSmartActionsV2;
    }
  }

  if (!res?.length) {
    throwNoPoolError();
  }

  return { estimates: res, tag };
};

export const estimateSwapAurora = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  setLoadingData,
  loadingTrigger,
  swapPro,
  proGetCachePool,
}: EstimateSwapOptions): Promise<{
  estimates: EstimateSwapView[];
}> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  if (ONLY_ZEROS.test(parsedAmountIn))
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  const throwNoPoolError = () => {
    throw new Error(
      `${intl.formatMessage({
        id: 'no_pool_available_to_make_a_swap_from',
      })} ${tokenIn?.symbol} -> ${tokenOut?.symbol} ${intl.formatMessage({
        id: 'for_the_amount',
      })} ${amountIn} ${intl.formatMessage({
        id: 'no_pool_eng_for_chinese',
      })}`
    );
  };

  let pools = (
    await getPoolsByTokensAurora({
      tokenInId: tokenIn.id,
      tokenOutId: tokenOut.id,
      amountIn: parsedAmountIn,
      setLoadingData,
      loadingTrigger,
      crossSwap: swapPro,
      tokenIn,
      tokenOut,
      proGetCachePool,
    })
  ).filter((p) => {
    return getLiquidity(p, tokenIn, tokenOut) > 0;
  });

  let { triTodos } = await getOneSwapActionResultAurora(
    pools,
    tokenIn,
    tokenOut,
    throwNoPoolError,
    parsedAmountIn
  );

  return { estimates: triTodos };
};

export const getOneSwapActionResultAurora = async (
  poolsOneSwap: Pool[],
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  throwNoPoolError: (p?: any) => void,
  parsedAmountIn: string
) => {
  let triTodos;
  let pools: Pool[] = poolsOneSwap;

  const triPoolThisPair = pools.find(
    (p) =>
      p.Dex === 'tri' &&
      p.tokenIds &&
      p.tokenIds.includes(tokenIn.id) &&
      p.tokenIds.includes(tokenOut.id)
  );

  if (!triPoolThisPair || !pools || pools.length === 0) {
    throwNoPoolError();
  }

  if (triPoolThisPair) {
    const triPoolEstimateRes = getSinglePoolEstimate(
      tokenIn,
      tokenOut,
      triPoolThisPair,
      parsedAmountIn
    );

    triTodos = [
      {
        ...triPoolEstimateRes,
        status: PoolMode.PARALLEL,
        routeInputToken: tokenIn.id,
        totalInputAmount: parsedAmountIn,
        pool: {
          ...triPoolThisPair,
          partialAmountIn: parsedAmountIn,
        },
        tokens: [tokenIn, tokenOut],
        inputToken: tokenIn.id,
        outputToken: tokenOut.id,
      },
    ];
  }

  return {
    triTodos,
  };
};

export const getOneSwapActionResult = async (
  poolsOneSwap: Pool[],
  loadingTrigger: boolean,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  supportLedger: boolean,
  throwNoPoolError: (p?: any) => void,
  amountIn: string,
  parsedAmountIn: string
) => {
  const { allStablePoolsById, allStablePools } =
    await getAllStablePoolsFromCache(loadingTrigger);

  let supportLedgerRes;

  /**
   * for swap pro, we need to calculate the result on tri pool
   * to do price comparison on tri result and ref result
   *
   */

  let pools: Pool[] = poolsOneSwap;

  if (isStableToken(tokenIn.id) && isStableToken(tokenOut.id)) {
    pools = pools.concat(
      getStablePoolThisPair({
        tokenInId: tokenIn.id,
        tokenOutId: tokenOut.id,
        stablePools: allStablePools,
      })
    );
  }

  /**s
   *  single swap action estimate for support ledger and swap pro mode
   *
   */
  if (supportLedger) {
    if (pools.length === 0 && supportLedger) {
      throwNoPoolError();
    }

    if (pools.length > 0) {
      const bestPricePool =
        pools.length === 1
          ? pools[0]
          : _.maxBy(pools, (p) => {
              if (isStablePool(p.id)) {
                return Number(
                  getStablePoolEstimate({
                    tokenIn,
                    tokenOut,
                    stablePool: allStablePoolsById[p.id][0],
                    stablePoolInfo: allStablePoolsById[p.id][1],
                    amountIn,
                  }).estimate
                );
              }
              return Number(
                getSinglePoolEstimate(tokenIn, tokenOut, p, parsedAmountIn)
                  .estimate
              );
            });

      const estimateRes = await getPoolEstimate({
        tokenIn,
        tokenOut,
        amountIn: parsedAmountIn,
        Pool: bestPricePool,
      });

      const res = [
        {
          ...estimateRes,
          status: PoolMode.PARALLEL,
          routeInputToken: tokenIn.id,
          totalInputAmount: parsedAmountIn,
          pool: {
            ...bestPricePool,
            partialAmountIn: parsedAmountIn,
          },
          tokens: [tokenIn, tokenOut],
          inputToken: tokenIn.id,
          outputToken: tokenOut.id,
        },
      ];

      supportLedgerRes = res;
    }

    // get result on tri pools but just one swap action
  }

  return {
    supportLedgerRes,
  };
};

// hybrid stable pool
export async function getHybridStableSmart(
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  amountIn: string,
  loadingTrigger: boolean
) {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  let pool1: Pool, pool2: Pool;

  let pools1: Pool[] = [];
  let pools2: Pool[] = [];

  let pools1Right: Pool[] = [];
  let pools2Right: Pool[] = [];

  const { allStablePools, allStablePoolsById, allStablePoolsInfo } =
    await getAllStablePoolsFromCache(loadingTrigger);

  let candidatePools: Pool[][] = [];

  /**
   * find possible routes for this pair
   *
   *
   */
  if (isStableToken(tokenIn.id)) {
    // first hop will be through stable pool.
    pools1 = allStablePools.filter((pool) =>
      pool.tokenIds.includes(tokenIn.id)
    );

    const otherStables = pools1
      .map((pool) => pool.tokenIds.filter((id) => id !== tokenIn.id))
      .flat();

    for (var otherStable of otherStables) {
      let stablePools = getStablePoolThisPair({
        tokenInId: otherStable,
        tokenOutId: tokenOut.id,
        stablePools: allStablePools,
      });

      let tmpPools = await getPoolsByTokens({
        tokenInId: otherStable,
        tokenOutId: tokenOut.id,
        amountIn: parsedAmountIn,
        loadingTrigger: false,
      });
      const tobeAddedPools = tmpPools.concat(stablePools);
      pools2.push(
        ...tobeAddedPools.filter((p) => {
          const supplies = Object.values(p.supplies);
          return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
        })
      );
    }
  }

  if (isStableToken(tokenOut.id)) {
    // second hop will be through stable pool.
    pools2Right = allStablePools.filter((pool) =>
      pool.tokenIds.includes(tokenOut.id)
    );

    const otherStables = pools2Right
      .map((pool) => pool.tokenIds.filter((id) => id !== tokenOut.id))
      .flat();
    for (var otherStable of otherStables) {
      let stablePools = getStablePoolThisPair({
        tokenInId: tokenIn.id,
        tokenOutId: otherStable,
        stablePools: allStablePools,
      });

      let tmpPools = await getPoolsByTokens({
        tokenInId: tokenIn.id,
        tokenOutId: otherStable,
        amountIn: parsedAmountIn,
        loadingTrigger: false,
      });

      const tobeAddedPools = tmpPools.concat(stablePools);

      pools1Right.push(
        ...tobeAddedPools.filter((p) => {
          const supplies = Object.values(p.supplies);
          return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
        })
      );
    }
  }

  // find candidate pools

  for (let p1 of pools1) {
    let middleTokens = p1.tokenIds.filter((id: string) => id !== tokenIn.id);
    for (let middleToken of middleTokens) {
      let p2s = pools2.filter(
        (p) =>
          p.tokenIds.includes(middleToken) &&
          p.tokenIds.includes(tokenOut.id) &&
          middleToken !== tokenOut.id
      );
      let p2 = _.maxBy(p2s, (p) =>
        Number(
          new Big(toReadableNumber(tokenOut.decimals, p.supplies[tokenOut.id]))
        )
      );

      if (middleToken === tokenOut.id) {
        p2 = p1;
      }

      if (p1 && p2) {
        if (p1.id === p2.id) candidatePools.push([p1]);
        else candidatePools.push([p1, p2]);
      }
    }
  }
  for (let p1 of pools1Right) {
    let middleTokens = p1.tokenIds.filter((id: string) => id !== tokenIn.id);
    for (let middleToken of middleTokens) {
      let p2s = pools2Right.filter(
        (p) =>
          p.tokenIds.includes(middleToken) &&
          p.tokenIds.includes(tokenOut.id) &&
          middleToken !== tokenOut.id
      );
      let p2 = _.maxBy(p2s, (p) =>
        Number(
          new Big(toReadableNumber(tokenOut.decimals, p.supplies[tokenOut.id]))
        )
      );

      if (middleToken === tokenOut.id) {
        p2 = p1;
      }

      if (p1 && p2) {
        if (p1.id === p2.id) candidatePools.push([p1]);
        else candidatePools.push([p1, p2]);
      }
    }
  }

  if (candidatePools.length > 0) {
    const tokensMedata = await ftGetTokensMetadata(
      candidatePools.map((cp) => cp.map((p) => p.tokenIds).flat()).flat()
    );

    const BestPoolPair =
      candidatePools.length === 1
        ? candidatePools[0]
        : _.maxBy(candidatePools, (poolPair) => {
            // only one pool case, only for stable tokens
            if (poolPair.length === 1) {
              if (isStablePool(poolPair[0].id)) {
                return Number(
                  getStablePoolEstimate({
                    tokenIn,
                    tokenOut,
                    stablePool: getStablePoolThisPair({
                      tokenInId: tokenIn.id,
                      tokenOutId: tokenOut.id,
                      stablePools: allStablePools,
                    })[0],
                    amountIn,
                    stablePoolInfo: getStablePoolInfoThisPair({
                      tokenInId: tokenIn.id,
                      tokenOutId: tokenOut.id,
                      stablePoolsInfo: allStablePoolsInfo,
                    })[0],
                  }).estimate
                );
              } else {
                return Number(
                  getSinglePoolEstimate(
                    tokenIn,
                    tokenOut,
                    poolPair[0],
                    parsedAmountIn
                  ).estimate
                );
              }
            }

            const [tmpPool1, tmpPool2] = poolPair;
            const tokenMidId = poolPair[0].tokenIds.find((t: string) =>
              poolPair[1].tokenIds.includes(t)
            );

            const tokenMidMeta = tokensMedata[tokenMidId];

            const estimate1 = {
              ...(isStablePool(tmpPool1.id)
                ? getStablePoolEstimate({
                    tokenIn,
                    tokenOut: tokenMidMeta,
                    amountIn,
                    stablePoolInfo: allStablePoolsById[tmpPool1.id][1],
                    stablePool: allStablePoolsById[tmpPool1.id][0],
                  })
                : getSinglePoolEstimate(
                    tokenIn,
                    tokenMidMeta,
                    tmpPool1,
                    parsedAmountIn
                  )),
              status: PoolMode.SMART,
            };

            const estimate2 = {
              ...(isStablePool(tmpPool2.id)
                ? getStablePoolEstimate({
                    tokenIn: tokenMidMeta,
                    tokenOut,
                    amountIn: estimate1.estimate,
                    stablePoolInfo: allStablePoolsById[tmpPool2.id][1],
                    stablePool: allStablePoolsById[tmpPool2.id][0],
                  })
                : getSinglePoolEstimate(
                    tokenMidMeta,
                    tokenOut,
                    tmpPool2,
                    toNonDivisibleNumber(
                      tokenMidMeta.decimals,
                      estimate1.estimate
                    )
                  )),
              status: PoolMode.SMART,
            };

            return Number(estimate2.estimate);
          });

    // one pool case only get best price

    if (!BestPoolPair) return { actions: [], estimate: '0' };

    if (BestPoolPair.length === 1) {
      const bestPool = BestPoolPair[0];
      const estimate = await getPoolEstimate({
        tokenIn,
        tokenOut,
        amountIn: parsedAmountIn,
        Pool: bestPool,
      });

      estimate.pool.partialAmountIn = parsedAmountIn;

      return {
        actions: [
          {
            ...estimate,
            status: PoolMode.STABLE,
            tokens: [tokenIn, tokenOut],
            inputToken: tokenIn.id,
            outputToken: tokenOut.id,
            totalInputAmount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
          },
        ],
        estimate: estimate.estimate,
      };
    }

    // two pool case get best price
    [pool1, pool2] = BestPoolPair;

    const tokenMidId = BestPoolPair[0].tokenIds.find((t: string) =>
      BestPoolPair[1].tokenIds.includes(t)
    );

    const tokenMidMeta = await ftGetTokenMetadata(tokenMidId);

    const estimate1 = {
      ...(isStablePool(pool1.id)
        ? getStablePoolEstimate({
            tokenIn,
            tokenOut: tokenMidMeta,
            amountIn,
            stablePoolInfo: allStablePoolsById[pool1.id][1],
            stablePool: allStablePoolsById[pool1.id][0],
          })
        : getSinglePoolEstimate(tokenIn, tokenMidMeta, pool1, parsedAmountIn)),
      status: PoolMode.SMART,
      tokens: [tokenIn, tokenMidMeta, tokenOut],
      inputToken: tokenIn.id,
      outputToken: tokenMidMeta.id,
      totalInputAmount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
    };

    estimate1.pool.partialAmountIn = parsedAmountIn;

    const estimate2 = {
      ...(isStablePool(pool2.id)
        ? getStablePoolEstimate({
            tokenIn: tokenMidMeta,
            tokenOut,
            amountIn: estimate1.estimate,
            stablePoolInfo: allStablePoolsById[pool2.id][1],
            stablePool: allStablePoolsById[pool2.id][0],
          })
        : getSinglePoolEstimate(
            tokenMidMeta,
            tokenOut,
            pool2,
            toNonDivisibleNumber(tokenMidMeta.decimals, estimate1.estimate)
          )),

      status: PoolMode.SMART,
      tokens: [tokenIn, tokenMidMeta, tokenOut],
      inputToken: tokenMidMeta.id,
      outputToken: tokenOut.id,
      totalInputAmount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
    };

    return { actions: [estimate1, estimate2], estimate: estimate2.estimate };
  }

  return { actions: [], estimate: '0' };
}

interface SwapOptions {
  useNearBalance?: boolean;
  swapsToDo: EstimateSwapView[];
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  slippageTolerance: number;
  swapMarket?: SwapMarket;
}

export const swap = async ({
  tokenIn,
  tokenOut,
  swapsToDo,
  slippageTolerance,
  amountIn,
  swapMarket,
}: SwapOptions) => {
  if (swapsToDo) {
    await instantSwap({
      tokenIn,
      tokenOut,
      amountIn,
      swapsToDo,
      slippageTolerance,
      swapMarket,
    });
  }
};

export const instantSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
  swapMarket,
}: SwapOptions) => {
  if (swapMarket === 'ref') {
    localStorage.setItem(REF_FI_SWAP_SIGNAL, 'ref');
    return nearInstantSwap({
      tokenIn,
      tokenOut,
      amountIn,
      swapsToDo,
      slippageTolerance,
    });
  } else if (swapMarket === 'tri') {
    localStorage.setItem(REF_FI_SWAP_SIGNAL, 'tri');
    return crossInstantSwap({
      tokenIn,
      tokenOut,
      amountIn,
      swapsToDo,
      slippageTolerance,
    });
  }
};

export const nearInstantSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: // minAmountOut,
SwapOptions) => {
  const transactions: Transaction[] = [];
  const tokenOutActions: RefFiFunctionCallOptions[] = [];

  const registerToken = async (token: TokenMetadata) => {
    const tokenRegistered = await ftGetStorageBalance(token.id).catch(() => {
      throw new Error(`${token.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      tokenOutActions.push({
        methodName: 'storage_deposit',
        args: {
          registration_only: true,
          account_id: getCurrentWallet()?.wallet?.getAccountId(),
        },
        gas: '30000000000000',
        amount: STORAGE_TO_REGISTER_WITH_MFT,
      });

      transactions.push({
        receiverId: token.id,
        functionCalls: tokenOutActions,
      });
    }
  };

  if (tokenOut.id !== swapsToDo[swapsToDo.length - 1].outputToken) {
    return window.location.reload();
  }

  //making sure all actions get included.
  await registerToken(tokenOut);
  const actionsList = [];
  const allSwapsTokens = swapsToDo.map((s) => [s.inputToken, s.outputToken]); // to get the hop tokens

  for (let i in allSwapsTokens) {
    const swapTokens = allSwapsTokens[i];
    if (swapTokens[0] == tokenIn.id && swapTokens[1] == tokenOut.id) {
      // direct pool
      actionsList.push({
        pool_id: swapsToDo[i].pool.id,
        token_in: tokenIn.id,
        token_out: tokenOut.id,
        amount_in: swapsToDo[i].partialAmountIn,
        min_amount_out: round(
          tokenOut.decimals,
          toNonDivisibleNumber(
            tokenOut.decimals,
            percentLess(slippageTolerance, swapsToDo[i].estimate)
          )
        ),
      });
    } else if (swapTokens[1] == tokenOut.id) {
      // other hops
      actionsList.push({
        pool_id: swapsToDo[i].pool.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        min_amount_out: round(
          tokenOut.decimals,
          toNonDivisibleNumber(
            tokenOut.decimals,
            percentLess(slippageTolerance, swapsToDo[i].estimate)
          )
        ),
      });
    } else if (swapTokens[0] === tokenIn.id) {
      // first hop
      actionsList.push({
        pool_id: swapsToDo[i].pool.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        amount_in: swapsToDo[i].partialAmountIn,
        min_amount_out: '0',
      });
    } else {
      // middle hop
      actionsList.push({
        pool_id: swapsToDo[i].pool.id,
        token_in: swapTokens[0],
        token_out: swapTokens[1],
        min_amount_out: '0',
      });
    }
  }

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
            actions: actionsList,
          }),
        },
        gas: '180000000000000',
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  if (tokenIn.id === WRAP_NEAR_CONTRACT_ID && tokenIn?.symbol == 'NEAR') {
    transactions.unshift(nearDepositTransaction(amountIn));
  }
  if (tokenOut.id === WRAP_NEAR_CONTRACT_ID) {
    let outEstimate = new Big(0);
    const routes = separateRoutes(swapsToDo, tokenOut.id);

    const bigEstimate = routes.reduce((acc, cur) => {
      const curEstimate = round(
        24,
        toNonDivisibleNumber(
          24,
          percentLess(slippageTolerance, cur[cur.length - 1].estimate)
        )
      );
      return acc.plus(curEstimate);
    }, outEstimate);

    const minAmountOut = toReadableNumber(
      24,
      scientificNotationToString(bigEstimate.toString())
    );

    if (tokenOut.symbol == 'NEAR') {
      transactions.push(nearWithdrawTransaction(minAmountOut));
    }
  }

  if (tokenIn.id === WRAP_NEAR_CONTRACT_ID) {
    const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
    if (registered === null) {
      transactions.unshift({
        receiverId: WRAP_NEAR_CONTRACT_ID,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }

  return executeMultipleTransactions(transactions);
};

export const crossInstantSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: SwapOptions) => {
  const transactions: Transaction[] = [];

  const { wallet } = getCurrentWallet();

  // to register actiosn

  const registerToken = async (tokenId: string) => {
    const tokenRegistered = await ftGetStorageBalance(tokenId).catch(() => {
      throw new Error(`${tokenId} doesn't exist.`);
    });
    const tokenOutActions: RefFiFunctionCallOptions[] = [];

    if (tokenRegistered === null) {
      tokenOutActions.push({
        methodName: 'storage_deposit',
        args: {
          registration_only: true,
          account_id: getCurrentWallet()?.wallet?.getAccountId(),
        },
        gas: '30000000000000',
        amount: STORAGE_TO_REGISTER_WITH_MFT,
      });

      transactions.push({
        receiverId: tokenId,
        functionCalls: tokenOutActions,
      });
    }
  };

  // await registerToken(tokenOut.id);

  const routes = separateRoutes(swapsToDo, tokenOut.id);

  const forceRegisterTokens: string[] = [];

  for (let i = 0; i < routes.length; i++) {
    const curRoute = routes[i];

    if (curRoute[curRoute.length - 1].pool.Dex === 'tri') {
      forceRegisterTokens.push(
        curRoute[0].tokens[curRoute[0].tokens.length - 1].id
      );
    } else if (
      curRoute.length === 2 &&
      curRoute[0].pool.Dex === 'tri' &&
      curRoute[1].pool.Dex !== 'tri'
    ) {
      forceRegisterTokens.push(curRoute[0].tokens[1].id);
    }
  }

  // force register
  new Array(...new Set(forceRegisterTokens)).map(
    (id) =>
      id !== 'usn' &&
      transactions.push({
        receiverId: id,
        functionCalls: [registerAccountOnToken()],
      })
  );

  const validateRegisterTokens: string[] = [];

  for (let i = 0; i < routes.length; i++) {
    const curRoute = routes[i];

    if (curRoute[curRoute.length - 1].pool.Dex === 'ref') {
      validateRegisterTokens.push(
        curRoute[0].tokens[curRoute[0].tokens.length - 1].id
      );
    } else if (
      curRoute.length === 2 &&
      curRoute[0].pool.Dex !== 'tri' &&
      curRoute[1].pool.Dex === 'tri'
    ) {
      validateRegisterTokens.push(curRoute[0].tokens[1].id);
    }
  }

  await Promise.all(
    new Array(...new Set(validateRegisterTokens))
      .filter((id) => !forceRegisterTokens.includes(id) && id !== 'usn')
      .map((token) => registerToken(token))
  );

  if (wallet.isSignedIn()) {
    const routes = separateRoutes(swapsToDo, tokenOut.id);

    for (let i = 0; i < routes.length; i++) {
      const todosThisRoute = routes[i];

      if (todosThisRoute.length === 1) {
        const curTransactions = await parallelSwapCase({
          tokenIn,
          tokenOut,
          amountIn,
          swapsToDo: todosThisRoute,
          slippageTolerance,
        });

        curTransactions.forEach((t) => transactions.push(t));
      } else {
        const curTransactions = await smartRouteSwapCase({
          tokenIn,
          tokenOut,
          amountIn:
            routes.length === 1
              ? amountIn
              : toReadableNumber(
                  tokenIn.decimals,
                  todosThisRoute[0].pool.partialAmountIn
                ),
          swapsToDo: todosThisRoute,
          slippageTolerance,
        });
        curTransactions.forEach((t) => transactions.push(t));
      }
    }
    if (tokenIn.id === WRAP_NEAR_CONTRACT_ID && tokenIn.symbol == 'NEAR') {
      transactions.unshift(nearDepositTransaction(amountIn));
    }
    if (tokenOut.id === WRAP_NEAR_CONTRACT_ID) {
      let outEstimate = new Big(0);
      const routes = separateRoutes(swapsToDo, tokenOut.id);

      const bigEstimate = routes.reduce((acc, cur) => {
        const curEstimate = cur[cur.length - 1].estimate;
        return acc.plus(curEstimate);
      }, outEstimate);

      const minAmountOut = percentLess(
        slippageTolerance,

        scientificNotationToString(bigEstimate.toString())
      );
      if (tokenOut.symbol == 'NEAR') {
        transactions.push(nearWithdrawTransaction(minAmountOut));
      }
    }
    if (tokenIn.id === WRAP_NEAR_CONTRACT_ID) {
      const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
      if (registered === null) {
        transactions.unshift({
          receiverId: WRAP_NEAR_CONTRACT_ID,
          functionCalls: [registerAccountOnToken()],
        });
      }
    }

    return executeMultipleTransactions(transactions);
  }
};

export const checkTransaction = (txHash: string) => {
  return (near.connection.provider as JsonRpcProvider).sendJsonRpc(
    'EXPERIMENTAL_tx_status',
    [txHash, getCurrentWallet()?.wallet?.getAccountId()]
  );
};

export const checkTransactionStatus = (txHash: string) => {
  return near.connection.provider.txStatus(
    txHash,
    getCurrentWallet()?.wallet?.getAccountId()
  );
};

export const parallelSwapCase = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  swapsToDo: EstimateSwapView[];
  slippageTolerance: number;
}) => {
  const curTransactions: Transaction[] = [];

  // separate todos to different dexes

  const refSwapTodos = swapsToDo.filter((e) => e.pool.Dex === 'ref');

  const triSwapTodos = swapsToDo.filter((e) => e.pool.Dex === 'tri');

  if (triSwapTodos.length > 0) {
    const triSwapTransactions = await auroraSwapTransactions({
      tokenIn_id: tokenIn.id,
      tokenOut_id: tokenOut.id,
      swapTodos: triSwapTodos,
      readableAmountIn: amountIn,
      decimalIn: tokenIn.decimals,
      decimalOut: tokenOut.decimals,
      slippageTolerance,
      swapType: 'parallel',
    });

    triSwapTransactions.forEach((t) => curTransactions.push(t));
  }

  if (refSwapTodos.length > 0) {
    const refSwapActions = refSwapTodos.map((s2d) => {
      let minTokenOutAmount = s2d.estimate
        ? percentLess(slippageTolerance, s2d.estimate)
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

    const nearTransactionAmount = scientificNotationToString(
      BigNumber.sum(
        ...refSwapTodos.map((todo) => todo.pool.partialAmountIn)
      ).toString()
    );

    curTransactions.push({
      receiverId: tokenIn.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: nearTransactionAmount,
            msg: JSON.stringify({
              force: 0,
              actions: refSwapActions,
            }),
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }

  // could be hybrid transactions on difference dexes
  return curTransactions;
};

export const smartRouteSwapCase = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  swapsToDo: EstimateSwapView[];
  slippageTolerance: number;
}) => {
  const curTransactions: Transaction[] = [];
  const actionsList = []; // for ref swap actions

  const amountInInt = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  const swap1 = swapsToDo[0];
  const swap2 = swapsToDo[1];
  const swap1toTri = swap1.pool.Dex === 'tri';

  const swap2toTri = swap2.pool.Dex === 'tri';
  let triSwapTransactions: Transaction[] = [];

  if (swap1toTri && swap2toTri) {
    triSwapTransactions = await auroraSwapTransactions({
      tokenIn_id: swap1.inputToken,
      tokenOut_id: swap2.outputToken,
      swapTodos: swapsToDo,
      readableAmountIn: amountIn,
      decimalIn: tokenIn.decimals,
      decimalOut: tokenOut.decimals,
      slippageTolerance,
      swapType: 'smartV1',
      readableAmountOut: percentLess(
        slippageTolerance,
        swapsToDo[swapsToDo.length - 1].estimate
      ),
    });
    triSwapTransactions.forEach((t) => curTransactions.push(t));
  } else if (swap1toTri) {
    // first pool on tri
    const secondAmountIn = round(
      swap2.tokens[1].decimals,
      toNonDivisibleNumber(
        swap2.tokens[1].decimals,
        percentLess(slippageTolerance, swap1.estimate)
      )
    );

    const secondHopEstimateOut = await getPoolEstimate({
      tokenIn: swap2.tokens[1],
      tokenOut,
      amountIn: secondAmountIn,
      Pool: swap2.pool,
    });

    triSwapTransactions = await auroraSwapTransactions({
      tokenIn_id: tokenIn.id,
      tokenOut_id: swap1.outputToken,
      swapTodos: [swap1],
      readableAmountIn: amountIn,
      decimalIn: tokenIn.decimals,
      decimalOut: swap1.tokens[1].decimals,
      slippageTolerance,
      swapType: 'smartV1',
      readableAmountOut: toReadableNumber(
        swap2.tokens[1].decimals,
        secondAmountIn
      ),
    });
    triSwapTransactions.forEach((t) => curTransactions.push(t));

    // slippage tolerance from first action
    actionsList.push({
      pool_id: swap2.pool.id,
      token_in: swap2.inputToken,
      token_out: swap2.outputToken,
      amount_in: secondAmountIn,
      min_amount_out: round(
        tokenOut.decimals,
        toNonDivisibleNumber(
          tokenOut.decimals,
          percentLess(slippageTolerance, secondHopEstimateOut.estimate)
        )
      ),
    });

    curTransactions.push({
      receiverId: swap2.inputToken,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: secondAmountIn,
            msg: JSON.stringify({
              force: 0,
              actions: actionsList,
            }),
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  } else if (swap2toTri) {
    // second pool on tri

    const secondAmountIn = round(
      swap1.tokens[1].decimals,
      toNonDivisibleNumber(
        swap1.tokens[1].decimals,
        percentLess(slippageTolerance, swap1.estimate)
      )
    );

    const secondHopEstimateOut = await getPoolEstimate({
      tokenIn: swap2.tokens[1],
      tokenOut,
      amountIn: secondAmountIn,
      Pool: swap2.pool,
    });

    actionsList.push({
      pool_id: swap1.pool.id,
      token_in: swap1.inputToken,
      token_out: swap1.outputToken,
      amount_in: amountInInt,
      min_amount_out: secondAmountIn,
    });

    curTransactions.push({
      receiverId: tokenIn.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: amountInInt,
            msg: JSON.stringify({
              force: 0,
              actions: actionsList,
            }),
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });

    triSwapTransactions = await auroraSwapTransactions({
      tokenIn_id: swap2.inputToken,
      tokenOut_id: swap2.outputToken,
      swapTodos: [swap2],
      readableAmountIn: toReadableNumber(
        swap1.tokens[1].decimals,
        secondAmountIn
      ),
      decimalIn: swap2.tokens[1].decimals,
      decimalOut: tokenOut.decimals,
      slippageTolerance,
      swapType: 'smartV1',
      readableAmountOut: toReadableNumber(
        tokenOut.decimals,
        round(
          tokenOut.decimals,
          toNonDivisibleNumber(
            tokenOut.decimals,
            percentLess(slippageTolerance, secondHopEstimateOut.estimate)
          )
        )
      ),
    });
    triSwapTransactions.forEach((t) => curTransactions.push(t));
  } else {
    // no pool on tri
    actionsList.push({
      pool_id: swap1.pool.id,
      token_in: swap1.inputToken,
      token_out: swap1.outputToken,
      amount_in: amountInInt,
      min_amount_out: '0',
    });
    actionsList.push({
      pool_id: swap2.pool.id,
      token_in: swap2.inputToken,
      token_out: swap2.outputToken,
      min_amount_out: round(
        tokenOut.decimals,
        toNonDivisibleNumber(
          tokenOut.decimals,
          percentLess(slippageTolerance, swapsToDo[1].estimate)
        )
      ),
    });
    curTransactions.push({
      receiverId: tokenIn.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: toNonDivisibleNumber(tokenIn.decimals, amountIn),
            msg: JSON.stringify({
              force: 0,
              actions: actionsList,
            }),
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }

  // separate todos to different dexes

  return curTransactions;
};
