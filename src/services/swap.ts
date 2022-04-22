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
  STABLE_POOL_ID,
  STABLE_TOKEN_IDS,
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
import { registerTokenAction } from './creators/token';
import { BigNumber } from 'bignumber.js';
import _, { filter } from 'lodash';
import { getSwappedAmount } from './stable-swap';
import { STABLE_LP_TOKEN_DECIMALS } from '../components/stableswap/AddLiquidity';
//@ts-ignore
import { getSmartRouteSwapActions, stableSmart } from './smartRouteLogic';
import { getCurrentWallet } from '../utils/sender-wallet';
import { multiply, separateRoutes } from '../utils/numbers';
import { auroraSwapTransactions } from './aurora/aurora';
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
  supportLedger?: boolean;
  crossSwap?: boolean;
  onlyTri?: boolean;
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
    pool: stablePool,
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
  if (Number(Pool.id) === Number(STABLE_POOL_ID)) {
    console.log('dsadsadsa');

    const stablePoolInfo = (await getStablePoolFromCache())[1];
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

export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  setLoadingData,
  loadingTrigger,
  supportLedger,
  crossSwap,
  onlyTri,
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

  const pools = (
    await getPoolsByTokens({
      tokenInId: tokenIn.id,
      tokenOutId: tokenOut.id,
      amountIn: parsedAmountIn,
      setLoadingData,
      loadingTrigger,
      crossSwap,
      onlyTri,
    })
  ).filter((p) => {
    return getLiquidity(p, tokenIn, tokenOut) > 0;
  });

  const [stablePool, stablePoolInfo] = await getStablePoolFromCache();

  if (
    STABLE_TOKEN_IDS.includes(tokenIn.id) &&
    STABLE_TOKEN_IDS.includes(tokenOut.id)
  ) {
    pools.push(stablePool);
  }

  if (supportLedger) {
    if (pools.length === 0) {
      throwNoPoolError();
    }

    const bestPricePool = _.maxBy(pools, (p) => {
      if (p.id === Number(STABLE_POOL_ID)) {
        return Number(
          getStablePoolEstimate({
            tokenIn,
            tokenOut,
            amountIn,
            stablePoolInfo,
            stablePool,
          }).estimate
        );
      } else
        return Number(
          getSinglePoolEstimate(tokenIn, tokenOut, p, parsedAmountIn).estimate
        );
    });

    const estimateRes =
      bestPricePool.id === Number(STABLE_POOL_ID)
        ? getStablePoolEstimate({
            tokenIn,
            tokenOut,
            amountIn,
            stablePool,
            stablePoolInfo,
          })
        : getSinglePoolEstimate(
            tokenIn,
            tokenOut,
            bestPricePool,
            parsedAmountIn
          );

    const res = [
      {
        ...estimateRes,
        status: PoolMode.PARALLEL,
        routeInputToken: tokenIn.id,
        totalInputAmount: parsedAmountIn,
        pool: { ...bestPricePool, partialAmountIn: parsedAmountIn },
        tokens: [tokenIn, tokenOut],
        inputToken: tokenIn.id,
        totalInput: parsedAmountIn,
      },
    ];

    return res;
  }

  const orpools = await getRefPoolsByToken1ORToken2(tokenIn.id, tokenOut.id);

  let stableSmartActionsV2;

  stableSmartActionsV2 = await stableSmart(
    orpools.filter((p) =>
      onlyTri ? p.Dex === 'tri' : crossSwap || p.Dex === 'ref'
    ),
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

  if (
    (STABLE_TOKEN_IDS.includes(tokenIn.id) ||
      STABLE_TOKEN_IDS.includes(tokenOut.id)) &&
    !onlyTri
  ) {
    let hybridStableSmart = await getHybridStableSmart(
      tokenIn,
      tokenOut,
      amountIn,
      crossSwap,
      onlyTri
    );

    let hybridStableSmartOutputEstimate = hybridStableSmart.estimate.toString();
    if (
      new Big(hybridStableSmartOutputEstimate).gt(
        new Big(smartRouteV2OutputEstimate)
      )
    ) {
      // then hybrid route gave better answer. Use it!

      res = hybridStableSmart.actions;
    } else {
      // smart route v2 gave better answer. use it!

      res = stableSmartActionsV2;
    }
  }

  if (!res.length) {
    throwNoPoolError();
  }

  console.log(res);

  return res;
};

// hybrid stable pool
export async function getHybridStableSmart(
  tokenIn: TokenMetadata,
  tokenOut: TokenMetadata,
  amountIn: string,
  crossSwap?: boolean,
  onlyTri?: boolean
) {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);
  let pool1, pool2;
  let stablePool: any;
  let stablePoolInfo: any;

  const bothStableCoin =
    STABLE_TOKEN_IDS.includes(tokenIn.id) &&
    STABLE_TOKEN_IDS.includes(tokenOut.id);

  // cache stable pools
  if (
    STABLE_TOKEN_IDS.includes(tokenIn.id) ||
    STABLE_TOKEN_IDS.includes(tokenOut.id)
  ) {
    [stablePool, stablePoolInfo] = await getStablePoolFromCache();
  } else {
    return { actions: [], estimate: '0' };
  }

  // for both stable coin, return
  if (bothStableCoin) {
    let stableOnlyResult = getStablePoolEstimate({
      tokenIn,
      tokenOut: tokenOut,
      amountIn,
      stablePoolInfo,
      stablePool,
    });

    return {
      actions: [
        {
          ...stableOnlyResult,
          status: PoolMode.STABLE,
          routeInputToken: tokenIn.id,
          totalInputAmount: parsedAmountIn,
          pool: { ...stableOnlyResult.pool, partialAmountIn: parsedAmountIn },
          tokens: [tokenIn, tokenOut],
          inputToken: tokenIn.id,
          outputToken: tokenOut.id,
        },
      ],
      estimate: stableOnlyResult.estimate,
    };
  }

  var candidatePools = [];

  //
  if (STABLE_TOKEN_IDS.includes(tokenIn.id)) {
    // first hop will be through stable pool.
    var pools1 = [stablePool];
    const otherStables = STABLE_TOKEN_IDS.filter((st) => st !== tokenIn.id);
    var pools2 = [];
    for (var otherStable of otherStables) {
      // console.log('INPUT STABLE IS ', tokenIn.id);
      // console.log('CONSIDERING FIRST HOP TO...', otherStable);
      let tmpPools = await getPoolsByTokens({
        tokenInId: otherStable,
        tokenOutId: tokenOut.id,
        amountIn: parsedAmountIn,
        loadingTrigger: false,
        crossSwap,
        onlyTri,
      });

      pools2.push(
        ...tmpPools.filter((p) => {
          const supplies = Object.values(p.supplies);
          return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
        })
      );
    }
  } else if (STABLE_TOKEN_IDS.includes(tokenOut.id)) {
    // second hop will be through stable pool.
    var pools2 = [stablePool];
    var otherStables = STABLE_TOKEN_IDS.filter((st) => st != tokenOut.id);
    var pools1 = [];
    for (var otherStable of otherStables) {
      // console.log('OUTPUT STABLE IS ', tokenOut.id);
      // console.log('CONSIDERING SECOND HOP FROM...', otherStable);
      let tmpPools = await getPoolsByTokens({
        tokenInId: tokenIn.id,
        tokenOutId: otherStable,
        amountIn: parsedAmountIn,
        loadingTrigger: false,
        crossSwap,
        onlyTri,
      });
      pools1.push(
        ...tmpPools.filter((p) => {
          const supplies = Object.values(p.supplies);
          return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
        })
      );
    }
  } else {
    return { actions: [], estimate: '0' };
  }

  // find candidate pools
  for (var p1 of pools1) {
    let middleTokens = p1.tokenIds.filter((id: string) => id !== tokenIn.id);
    for (var middleToken of middleTokens) {
      let p2s = pools2.filter((p) => p.tokenIds.includes(middleToken));
      // console.log('P2S is...', p2s);
      var p2 = _.maxBy(p2s, (p) =>
        Number(
          new Big(toReadableNumber(tokenOut.decimals, p.supplies[tokenOut.id]))
        )
      );
      if (p1 && p2) {
        candidatePools.push([p1, p2]);
      }
    }
  }

  // return best estimate
  if (candidatePools.length > 0) {
    const tokensMedata = await ftGetTokensMetadata(
      candidatePools.map((cp) => cp.map((p) => p.tokenIds).flat()).flat()
    );

    const BestPoolPair = _.maxBy(candidatePools, (poolPair) => {
      const [tmpPool1, tmpPool2] = poolPair;
      const tokenMidId = poolPair[0].tokenIds.find((t: string) =>
        poolPair[1].tokenIds.includes(t)
      );

      const tokenMidMeta = tokensMedata[tokenMidId];

      const estimate1 = {
        ...(tmpPool1.id === Number(STABLE_POOL_ID)
          ? getStablePoolEstimate({
              tokenIn,
              tokenOut: tokenMidMeta,
              amountIn,
              stablePoolInfo,
              stablePool,
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
        ...(tmpPool2.id === Number(STABLE_POOL_ID)
          ? getStablePoolEstimate({
              tokenIn: tokenMidMeta,
              tokenOut,
              amountIn: estimate1.estimate,
              stablePoolInfo,
              stablePool,
            })
          : getSinglePoolEstimate(
              tokenMidMeta,
              tokenOut,
              tmpPool2,
              toNonDivisibleNumber(tokenMidMeta.decimals, estimate1.estimate)
            )),
        status: PoolMode.SMART,
      };

      return Number(estimate2.estimate);
    });
    [pool1, pool2] = BestPoolPair;

    const tokenMidId = BestPoolPair[0].tokenIds.find((t: string) =>
      BestPoolPair[1].tokenIds.includes(t)
    );

    const tokenMidMeta = await ftGetTokenMetadata(tokenMidId);

    const estimate1 = {
      ...(pool1.id === Number(STABLE_POOL_ID)
        ? getStablePoolEstimate({
            tokenIn,
            tokenOut: tokenMidMeta,
            amountIn,
            stablePoolInfo,
            stablePool,
          })
        : getSinglePoolEstimate(tokenIn, tokenMidMeta, pool1, parsedAmountIn)),
      status: PoolMode.SMART,
      tokens: [tokenIn, tokenMidMeta, tokenOut],
      inputToken: tokenIn.id,
      outputToken: tokenMidMeta.id,
    };

    const estimate2 = {
      ...(pool2.id === Number(STABLE_POOL_ID)
        ? getStablePoolEstimate({
            tokenIn: tokenMidMeta,
            tokenOut,
            amountIn: estimate1.estimate,
            stablePoolInfo,
            stablePool,
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
  if (swapsToDo.every((todo) => todo.pool.Dex === 'ref')) {
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

  console.log(swapsToDo);

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

      return executeMultipleTransactions(transactions);
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

      return executeMultipleTransactions(transactions);
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

      return executeMultipleTransactions(transactions);
    }
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

  await registerToken(tokenOut.id);

  let toRegisterMiddleTokenId: string;

  const routes = separateRoutes(swapsToDo, tokenOut.id);

  for (let i = 0; i < routes.length; i++) {
    const curRoute = routes[i];
    if (
      curRoute.length === 2 &&
      curRoute.some((todo) => todo.pool.Dex === 'tri') &&
      curRoute.some((todo) => todo.pool.Dex === 'ref')
    ) {
      // await registerTokenAction(curRoute[0].tokens[1].id);
      toRegisterMiddleTokenId = curRoute[0].tokens[1].id;
      break;
    }
  }

  if (toRegisterMiddleTokenId) {
    await registerToken(toRegisterMiddleTokenId);
  }

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
  console.log(swapsToDo);

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
  console.log(amountInInt, amountIn);

  const swap1 = swapsToDo[0];
  const swap2 = swapsToDo[1];
  const swap1toTri = swap1.pool.Dex === 'tri';

  const swap2toTri = swap2.pool.Dex === 'tri';
  let triSwapTransactions: Transaction[] = [];

  if (swap1toTri && swap2toTri) {
    // both pool on tri
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
        tokenOut.decimals,
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

    console.log(triSwapTransactions, 'first is tri');

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
