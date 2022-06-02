import BN from 'bn.js';
import Big from 'big.js';

import { getLiquidity } from '../utils/pool';

import {
  ONLY_ZEROS,
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
  getPoolByToken,
  parsePool,
  Pool,
  getPool,
  getStablePool,
  StablePool,
  getRefPoolsByToken1ORToken2,
  getStablePoolFromCache,
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
import _, { filter, MemoVoidIteratorCapped, StringNullableChain } from 'lodash';
import { getSwappedAmount } from './stable-swap';
import {
  isStablePool,
  ALL_STABLE_POOL_IDS,
  STABLE_POOL_ID,
  isStableToken,
} from './near';
import { SWAP_MODE } from '../pages/SwapPage';
import { STABLE_TOKEN_USN_IDS, STABLE_POOL_USN_ID } from './near';
import { STABLE_LP_TOKEN_DECIMALS } from '../components/stableswap/AddLiquidity';
import {
  getSmartRouteSwapActions,
  stableSmart,
  getExpectedOutputFromActions,
  //@ts-ignore
} from './smartRouteLogic';
import { getCurrentWallet } from '../utils/sender-wallet';
import { multiply, separateRoutes } from '../utils/numbers';
import { auroraSwapTransactions } from './aurora/aurora';
import { PoolSlippageSelector } from '../components/forms/SlippageSelector';
import { getAllStablePoolsFromCache } from './pool';
import { PoolInfo } from '../components/layout/SwapRoutes';
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
  pool: Pool;
  intl?: any;
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

export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  setLoadingData,
  loadingTrigger,
  swapMode,
  supportLedger,
  swapPro,
  setSwapsToDoRef,
  setSwapsToDoTri,
}: EstimateSwapOptions): Promise<EstimateSwapView[]> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  if (ONLY_ZEROS.test(parsedAmountIn))
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  const throwNoPoolError = () => {
    throw new Error(
      `${intl.formatMessage({
        id: 'no_pool_available_to_make_a_swap_from',
      })} ${tokenIn.symbol} -> ${tokenOut.symbol} ${intl.formatMessage({
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
      crossSwap: swapPro,
    })
  ).filter((p) => {
    return getLiquidity(p, tokenIn, tokenOut) > 0;
  });

  let { supportLedgerRes, triTodos, refTodos } = await getOneSwapActionResult(
    swapPro,
    pools,
    loadingTrigger,
    tokenIn,
    tokenOut,
    supportLedger,
    swapMode,
    throwNoPoolError,
    amountIn,
    parsedAmountIn
  );
  // ref smart routing

  if (supportLedger) {
    if (swapPro) {
      setSwapsToDoRef(refTodos);
      setSwapsToDoTri(triTodos);
    }

    return supportLedgerRes;
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
      loadingTrigger,
      swapMode
    );

    let hybridStableSmartOutputEstimate = hybridStableSmart.estimate.toString();

    if (
      swapMode === SWAP_MODE.STABLE ||
      new Big(
        hybridStableSmartOutputEstimate === 'NaN'
          ? '0'
          : hybridStableSmartOutputEstimate
      ).gt(new Big(smartRouteV2OutputEstimate))
    ) {
      // then hybrid route gave better answer. Use it!

      res = hybridStableSmart.actions;
    } else {
      // smart route v2 gave better answer. use it!

      res = stableSmartActionsV2;
    }
  }

  if (!swapPro && !res?.length) {
    throwNoPoolError();
  }

  if (swapPro) {
    if (!supportLedgerRes && !res.length) throwNoPoolError();

    // if not both none, we could return res
    setSwapsToDoRef(res);
    setSwapsToDoTri(triTodos);

    const refSmartRes = await getExpectedOutputFromActions(res, tokenOut.id, 0);
    const triRes = await getExpectedOutputFromActions(triTodos, tokenOut.id, 0);

    if (new Big(refSmartRes || '0').gt(new Big(triRes || '0'))) {
      return res;
    } else {
      return triTodos;
    }
  }

  return res;
};

export const getOneSwapActionResult = async (
  swapPro: boolean,
  poolsOneSwap: Pool[],
  loadingTrigger: boolean,
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  supportLedger: boolean,
  swapMode: SWAP_MODE,
  throwNoPoolError: (p?: any) => void,
  amountIn: string,
  parsedAmountIn: string
) => {
  const { allStablePoolsById, allStablePools, allStablePoolsInfo } =
    await getAllStablePoolsFromCache(loadingTrigger);

  let supportLedgerRes;

  /**
   * for swap pro, we need to calculate the result on tri pool
   * to do price comparison on tri result and ref result
   *
   */

  let triTodos;
  let refTodos;
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
  if (supportLedger || swapPro) {
    if (swapMode === SWAP_MODE.STABLE) {
      pools = getStablePoolThisPair({
        tokenInId: tokenIn.id,
        tokenOutId: tokenOut.id,
        stablePools: allStablePools,
      });
    }
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
    if (swapPro) {
      // find tri pool for this pair
      const triPoolThisPair = pools.find(
        (p) =>
          p.Dex === 'tri' &&
          p.tokenIds &&
          p.tokenIds.includes(tokenIn.id) &&
          p.tokenIds.includes(tokenOut.id)
      );
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
        const refPools = pools.filter((p) => p.Dex !== 'tri');

        const refPoolThisPair =
          refPools.length === 1
            ? refPools[0]
            : _.maxBy(refPools, (p) => {
                if (isStablePool(p.id)) {
                  return Number(
                    getStablePoolEstimate({
                      tokenIn,
                      tokenOut,
                      stablePoolInfo: allStablePoolsById[p.id][1],
                      stablePool: allStablePoolsById[p.id][0],
                      amountIn,
                    }).estimate
                  );
                } else
                  return Number(
                    getSinglePoolEstimate(tokenIn, tokenOut, p, parsedAmountIn)
                      .estimate
                  );
              });

        if (refPoolThisPair) {
          const refPoolEstimateRes = await getPoolEstimate({
            tokenIn,
            tokenOut,
            amountIn: parsedAmountIn,
            Pool: refPoolThisPair,
          });

          refTodos = [
            {
              ...refPoolEstimateRes,
              status: PoolMode.PARALLEL,
              routeInputToken: tokenIn.id,
              totalInputAmount: parsedAmountIn,
              pool: {
                ...refPoolThisPair,
                partialAmountIn: parsedAmountIn,
              },
              tokens: [tokenIn, tokenOut],
              inputToken: tokenIn.id,
              outputToken: tokenOut.id,
            },
          ];
        }
      }
    }
  }

  return {
    supportLedgerRes,
    triTodos,
    refTodos,
  };
};

// hybrid stable pool
export async function getHybridStableSmart(
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  amountIn: string,
  loadingTrigger: boolean,
  swapMode: SWAP_MODE
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
      const tobeAddedPools =
        swapMode === SWAP_MODE.STABLE
          ? stablePools
          : tmpPools.concat(stablePools);
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

      const tobeAddedPools =
        swapMode === SWAP_MODE.STABLE
          ? stablePools
          : tmpPools.concat(stablePools);

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

  // return best estimate
  // console.log(candidatePools, 'candidate pools');
  // candidatePools = candidatePools.filter((pools) => {
  //   pools.every((p) =>
  //     new Big(p.supplies[p.tokenIds[0]])
  //       .times(new Big(p.supplies[p.tokenIds[1]]))
  //       .gt(0)
  //   );
  // });

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
    };

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
    }
  }
};

export const instantSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  swapsToDo,
  slippageTolerance,
}: SwapOptions) => {
  if (swapsToDo.every((todo) => todo.pool.Dex !== 'tri')) {
    localStorage.setItem(REF_FI_SWAP_SIGNAL, 'ref');
    return nearInstantSwap({
      tokenIn,
      tokenOut,
      amountIn,
      swapsToDo,
      slippageTolerance,
    });
  } else {
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
  const tokenInActions: RefFiFunctionCallOptions[] = [];
  const tokenOutActions: RefFiFunctionCallOptions[] = [];

  const { wallet, wallet_type } = getCurrentWallet();

  const registerToken = async (token: TokenMetadata) => {
    const tokenRegistered = await ftGetStorageBalance(token.id).catch(() => {
      throw new Error(`${token.id} doesn't exist.`);
    });

    if (tokenRegistered === null) {
      tokenOutActions.push({
        methodName: 'storage_deposit',
        args: {
          registration_only: true,
          account_id: getCurrentWallet().wallet.getAccountId(),
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

  const isParallelSwap = swapsToDo.every(
    (estimate) => estimate.status === PoolMode.PARALLEL
  );
  const isSmartRouteV1Swap = swapsToDo.every(
    (estimate) => estimate.status === PoolMode.SMART
  );

  if (wallet.isSignedIn()) {
    if (isParallelSwap) {
      const swapActions = swapsToDo.map((s2d) => {
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
        // deposit: '1',
      });

      transactions.push({
        receiverId: tokenIn.id,
        functionCalls: tokenInActions,
      });
    } else if (isSmartRouteV1Swap) {
      //making sure all actions get included for hybrid stable smart.
      await registerToken(tokenOut);
      var actionsList = [];
      // let allSwapsTokens = swapsToDo.map((s) => [s.inputToken, s.outputToken]); // to get the hop tokens
      let amountInInt = new Big(amountIn)
        .times(new Big(10).pow(tokenIn.decimals))
        .toString();
      let swap1 = swapsToDo[0];
      actionsList.push({
        pool_id: swap1.pool.id,
        token_in: swap1.inputToken,
        token_out: swap1.outputToken,
        amount_in: amountInInt,
        min_amount_out: '0',
      });
      let swap2 = swapsToDo[1];
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
    } else {
      //making sure all actions get included.
      await registerToken(tokenOut);
      var actionsList = [];
      let allSwapsTokens = swapsToDo.map((s) => [s.inputToken, s.outputToken]); // to get the hop tokens
      for (var i in allSwapsTokens) {
        let swapTokens = allSwapsTokens[i];
        if (swapTokens[0] == tokenIn.id && swapTokens[1] == tokenOut.id) {
          // parallel, direct hop route.
          actionsList.push({
            pool_id: swapsToDo[i].pool.id,
            token_in: tokenIn.id,
            token_out: tokenOut.id,
            amount_in: swapsToDo[i].pool.partialAmountIn,
            min_amount_out: round(
              tokenOut.decimals,
              toNonDivisibleNumber(
                tokenOut.decimals,
                percentLess(slippageTolerance, swapsToDo[i].estimate)
              )
            ),
          });
        } else if (swapTokens[0] == tokenIn.id) {
          // first hop in double hop route
          //TODO -- put in a check to make sure this first hop matches with the next (i+1) hop as a second hop.
          actionsList.push({
            pool_id: swapsToDo[i].pool.id,
            token_in: swapTokens[0],
            token_out: swapTokens[1],
            amount_in: swapsToDo[i].pool.partialAmountIn,
            min_amount_out: '0',
          });
        } else {
          // second hop in double hop route.
          //TODO -- put in a check to make sure this second hop matches with the previous (i-1) hop as a first hop.
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
    }

    if (tokenOut.id !== swapsToDo[swapsToDo.length - 1].outputToken) {
      return window.location.reload();
    }
    return executeMultipleTransactions(transactions);
  }
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
          account_id: getCurrentWallet().wallet.getAccountId(),
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
  new Array(...new Set(forceRegisterTokens)).map((id) =>
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
      .filter((id) => !forceRegisterTokens.includes(id))
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
          amountIn: toReadableNumber(
            tokenIn.decimals,
            todosThisRoute[0].pool.partialAmountIn
          ),
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

    return executeMultipleTransactions(transactions);
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
    // need to add in condition if smart route solves for direct hop as optimal solution and there is no tokenMid:

    // need to do a more robust check on swapsToDo. For each of these, if inputToken and outputToken for swapsToDo[i] match
    // overall inputToken/outputToken, then that is a single-hop / parallel swap.
    // otherwise, if the inputToken for swapsToDo[i] matches overall inputToken, then it is a first hop. Can probably assume
    // that swapsToDo[i+1] will be the corresponding second hop. But need to check this to make sure.
    // Need to build up full actions list.
    var actionsList = [];
    let allSwapsTokens = swapsToDo.map((s) => [s.inputToken, s.outputToken]); // to get the hop tokens
    for (var i in allSwapsTokens) {
      let swapTokens = allSwapsTokens[i];
      if (swapTokens[0] == tokenIn.id && swapTokens[1] == tokenOut.id) {
        // parallel, direct hop route.
        actionsList.push({
          pool_id: swapsToDo[i].pool.id,
          token_in: tokenIn.id,
          token_out: tokenOut.id,
          amount_in: swapsToDo[i].pool.partialAmountIn,
          min_amount_out: round(
            tokenOut.decimals,
            toNonDivisibleNumber(
              tokenOut.decimals,
              percentLess(slippageTolerance, swapsToDo[i].estimate)
            )
          ),
        });
      } else if (swapTokens[0] == tokenIn.id) {
        // first hop in double hop route
        //TODO -- put in a check to make sure this first hop matches with the next (i+1) hop as a second hop.
        actionsList.push({
          pool_id: swapsToDo[i].pool.id,
          token_in: swapTokens[0],
          token_out: swapTokens[1],
          amount_in: swapsToDo[i].pool.partialAmountIn,
          min_amount_out: '0',
        });
      } else {
        // second hop in double hop route.
        //TODO -- put in a check to make sure this second hop matches with the previous (i-1) hop as a first hop.
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
      }
    }

    var actions: RefFiFunctionCallOptions[] = [
      {
        methodName: 'swap',
        amount: ONE_YOCTO_NEAR,
        args: {
          actions: actionsList,
        },
      },
    ];

    if (!whitelist.includes(tokenOut.id)) {
      actions.unshift(registerTokenAction(tokenOut.id));
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
    [txHash, getCurrentWallet().wallet.getAccountId()]
  );
};

export const checkTransactionStatus = (txHash: string) => {
  return near.connection.provider.txStatus(
    txHash,
    getCurrentWallet().wallet.getAccountId()
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
      readableAmountIn: toReadableNumber(
        tokenIn.decimals,
        scientificNotationToString(
          BigNumber.sum(
            ...triSwapTodos.map((todo) => todo.pool.partialAmountIn)
          ).toString()
        )
      ),
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
