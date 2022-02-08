import BN from 'bn.js';
import Big from 'big.js';

import { getLiquidity } from '~utils/pool';

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
import { STABLE_LP_TOKEN_DECIMALS } from '~components/stableswap/AddLiquidity';

// Big.strict = false;
const FEE_DIVISOR = 10000;
const LP_THERESHOLD = 0.001;
const MAXIMUM_NUMBER_OF_POOLS = 5;
const STABLE_POOL_KEY = 'STABLE_POOL_VALUE';
const REF_FI_STABLE_Pool_INFO_KEY = 'REF_FI_STABLE_Pool_INFO_VALUE';

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
  noFeeAmountOut?: string;
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
  };
};

export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  setLoadingData,
  loadingTrigger,
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

  const pools = await getPoolsByTokens({
    tokenInId: tokenIn.id,
    tokenOutId: tokenOut.id,
    amountIn: parsedAmountIn,
    setLoadingData,
    loadingTrigger,
  });

  console.log('POOLS ARE...');
  console.log(pools);
  const orpools = await getRefPoolsByToken1ORToken2(
    pools,
    tokenIn.id,
    tokenOut.id
  );

  console.log('ORPOOLS ARE...');
  console.log(orpools);
  let graph = await getGraphFromPoolList(orpools);
  // console.log(graph);
  console.log(`tokenIn is ${tokenIn.id}`);
  console.log(`tokenOut is ${tokenOut.id}`);

  // console.log('paths are...');
  // let paths = await getPathsFromPools(orpools, tokenIn.id, tokenOut.id);
  // console.log(paths);
  let paths = await getKShortestPaths(graph, tokenIn.id, tokenOut.id, 100);
  ///let routePaths = await getAllPathsBelowLengthN(graph, tokenIn.id, tokenOut.id,3);
  console.log('PATHS ARE...');
  console.log(paths);

  let poolChains = await getPoolChainFromPaths(paths, orpools);
  console.log('POOL CHAINS ARE');
  console.log(poolChains);
  let routes = await getRoutesFromPoolChain(poolChains);
  console.log('ROUTES ARE...');
  console.log(routes);
  let nodeRoutes = await getNodeRoutesFromPathsAndPoolChains(paths, poolChains);
  console.log('NODE ROUTES ARE');
  console.log(nodeRoutes);
  let allocations = await getBestOptInput(routes, nodeRoutes, parsedAmountIn);
  console.log('ALLOCATIONS ARE...');
  console.log(allocations.map((item) => item.toString()));
  console.log('actions are...');
  let actions = await getSmartRouteSwapActions(
    orpools,
    tokenIn.id,
    tokenOut.id,
    parsedAmountIn,
    0.001
  );
  console.log('FOUND SMART ROUTE ACTIONS TO BE...');
  console.log(actions);

  const maxLPPool = _.maxBy(pools, (p) => getLiquidity(p, tokenIn, tokenOut));

  const maxPoolLiquidity = maxLPPool
    ? new Big(getLiquidity(maxLPPool, tokenIn, tokenOut))
    : new Big(0);

  const filterFunc = (pool: Pool, i: number) =>
    maxPoolLiquidity.gt(0) &&
    new Big(getLiquidity(pool, tokenIn, tokenOut))
      .div(maxPoolLiquidity)
      .gt(LP_THERESHOLD);

  const filteredPools = _.orderBy(
    pools,
    (p) => getLiquidity(p, tokenIn, tokenOut),
    ['desc']
  )
    .slice(0, MAXIMUM_NUMBER_OF_POOLS)
    .filter(filterFunc);

  const poolAllocations = calculateOptimalOutput(
    filteredPools,
    parsedAmountIn,
    tokenIn.id,
    tokenOut.id
  );

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
    let stablePool;
    let stablePoolInfo;

    const bothStableCoin =
      STABLE_TOKEN_IDS.includes(tokenIn.id) &&
      STABLE_TOKEN_IDS.includes(tokenOut.id);

    if (bothStableCoin) {
      throwNoPoolError();
    }

    if (
      STABLE_TOKEN_IDS.includes(tokenIn.id) ||
      STABLE_TOKEN_IDS.includes(tokenOut.id)
    ) {
      [stablePool, stablePoolInfo] = await Promise.all([
        JSON.parse(localStorage.getItem(STABLE_POOL_KEY)) ||
          (await getPool(Number(STABLE_POOL_ID))),
        JSON.parse(localStorage.getItem(REF_FI_STABLE_Pool_INFO_KEY)) ||
          (await getStablePool(Number(STABLE_POOL_ID))),
      ]);
      localStorage.setItem(STABLE_POOL_KEY, JSON.stringify(stablePool));
      localStorage.setItem(
        REF_FI_STABLE_Pool_INFO_KEY,
        JSON.stringify(stablePoolInfo)
      );
    }

    const candidatePools = [];

    const pools1 = (await getPoolByToken(tokenIn.id)).filter((p) => {
      const supplies = Object.values(p.supplies);
      return new Big(supplies[0]).times(new Big(supplies[1])).gt(0);
    });

    if (STABLE_TOKEN_IDS.includes(tokenIn.id) && stablePool) {
      pools1.push(stablePool);
    }

    for (let i = 0; i < pools1.length; i++) {
      const tempPool1 = pools1[i];
      const tokenMidIds = tempPool1.tokenIds.filter((id) => id !== tokenIn.id);

      for (let k = 0; k < tokenMidIds.length; k++) {
        const tokenMidId = tokenMidIds[k];

        const pools2 = (await getPoolByToken(tokenMidId)).filter((p) => {
          const supplies = Object.values(p.supplies);
          return (
            new Big(supplies[0]).times(new Big(supplies[1])).gt(0) &&
            p.tokenIds.includes(tokenOut.id)
          );
        });

        if (
          STABLE_TOKEN_IDS.includes(tokenOut.id) &&
          STABLE_TOKEN_IDS.includes(tokenMidId) &&
          stablePool &&
          tokenOut.id !== tokenMidId
        ) {
          pools2.push(stablePool);
        }

        if (pools2.length > 0) {
          pool2 = _.maxBy(pools2, (p) =>
            Number(
              new Big(
                toReadableNumber(tokenOut.decimals, p.supplies[tokenOut.id])
              )
            )
          );
          pool1 = tempPool1;
          candidatePools.push([pool1, pool2]);
        }
      }
    }

    if (candidatePools.length > 0) {
      const BestPoolPair = _.maxBy(candidatePools, (poolPair) => {
        const tokenInSupply = toReadableNumber(
          tokenIn.decimals,
          poolPair[0].supplies[tokenIn.id]
        );
        const tokenOutSupply = toReadableNumber(
          tokenOut.decimals,
          poolPair[1].supplies[tokenOut.id]
        );

        return Number(new Big(tokenInSupply).times(new Big(tokenOutSupply)));
      });
      [pool1, pool2] = BestPoolPair;

      const tokenMidId = BestPoolPair[0].tokenIds.find((t) =>
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
          : getSinglePoolEstimate(
              tokenIn,
              tokenMidMeta,
              pool1,
              parsedAmountIn
            )),
        status: PoolMode.SMART,
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
      };

      return [estimate1, estimate2];
    }

    throwNoPoolError();
  } else {
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
      throwNoPoolError();
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
      throw new Error(`${token.id} doesn't exist.`);
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
        receiverId: token.id,
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

      await registerToken(tokenOut);

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

    const neededStorage = await checkTokenNeedsStorageDeposit();
    if (neededStorage) {
      actions.unshift(storageDepositAction({ amount: neededStorage }));
    }

    return refFiManyFunctionCalls(actions);
  }
};

export const checkTransaction = (txHash: string) => {
  return (near.connection
    .provider as JsonRpcProvider).sendJsonRpc('EXPERIMENTAL_tx_status', [
    txHash,
    wallet.getAccountId(),
  ]);
};

////////////////////////////////////////////////////////////////////////////
// SMART ROUTE SWAP LOGIC
////////////////////////////////////////////////////////////////////////////

// const { default: Big } = require('big.js');
// const { poolList } = require('./testPoolsData.js');
// Big.DP = 40;
// Big.NE = -40;
// Big.PE = 40;
// Is any configuration needed to do floor or enforce the number of decimal places?

function getBetaForRoute(route, path) {
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    let p = route[0];
    var beta = new Big(p.reserves[path[0]]);
  } else if (route.length == 2) {
    let p1 = route[0];
    let p2 = route[1];
    var beta = new Big(p1.reserves[path[0]]).times(
      new Big(p2.reserves[path[1]])
    );
  }
  return beta;
}

function getEpsilonForRoute(route, path) {
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    // Single Hop case
    let p = route[0];
    let gamma = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
    var epsilon = Big(gamma);
  } else if (route.length == 2) {
    //Double Hop Case
    let p1 = route[0];
    let p2 = route[1];
    let gamma1 = new Big(10000).minus(new Big(p1.fee)).div(new Big(10000));
    let gamma2 = new Big(10000).minus(new Big(p2.fee)).div(Big(10000));
    var epsilon = new Big(p2.reserves[path[1]])
      .times(new Big(gamma1))
      .plus(new Big(p1.reserves[path[1]]).times(gamma1).times(gamma2));
  }
  return epsilon;
}

function getAlphaForRoute(route, path) {
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    //console.log('single hop')
    let p = route[0];
    let inputToken = path[0];
    let outputToken = path[1];
    let gamma = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
    let key1 = p.token1Id;
    let key2 = p.token2Id;
    let val1 = p.token1Supply;
    let val2 = p.token2Supply;
    p['reserves'] = { [key1]: val1, [key2]: val2 };
    var alpha = new Big(p.reserves[inputToken]).times(
      new Big(p.reserves[outputToken]).times(new Big(gamma))
    );
  } else if (route.length == 2) {
    //console.log('double hop')
    let p1 = route[0];
    let p2 = route[1];
    let key11 = p1.token1Id;
    let key12 = p1.token2Id;
    let val11 = p1.token1Supply;
    let val12 = p1.token2Supply;
    p1['reserves'] = { [key11]: val11, [key12]: val12 };
    let key21 = p2.token1Id;
    let key22 = p2.token2Id;
    let val21 = p2.token1Supply;
    let val22 = p2.token2Supply;
    p2['reserves'] = { [key21]: val21, [key22]: val22 };
    let inputToken = path[0];
    let middleToken = path[1];
    let outputToken = path[2];
    let gamma1 = new Big(10000).minus(Big(p1.fee)).div(new Big(10000));
    let gamma2 = new Big(10000).minus(new Big(p2.fee)).div(new Big(10000));
    let alpha1 = new Big(p1.reserves[inputToken])
      .times(new Big(p1.reserves[middleToken]))
      .times(gamma1);
    let alpha2 = new Big(p2.reserves[middleToken])
      .times(new Big(p2.reserves[outputToken]))
      .times(gamma2);
    var alpha = alpha1.times(alpha2);
  }
  return alpha;
}

function getAlphaSumFromRoutes(routes, nodeRoutes) {
  let alphaSum = new Big(0);
  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let alpha = getAlphaForRoute(route, nodeRoute);
    let radical = new Big(alpha).sqrt();
    let epsilon = getEpsilonForRoute(route, nodeRoute);
    let denom = new Big(epsilon);
    alphaSum = alphaSum.plus(radical.div(denom));
  }
  return alphaSum;
}

function getBetaSumFromRoutes(routes, nodeRoutes) {
  let betaSum = new Big(0);
  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let num = new Big(getBetaForRoute(route, nodeRoute));
    let denom = new Big(getEpsilonForRoute(route, nodeRoute));
    betaSum = betaSum.plus(num.div(denom));
  }
  return betaSum;
}

function getPhiFromRoutes(routes, nodeRoutes, totalInput) {
  let alphaSum = getAlphaSumFromRoutes(routes, nodeRoutes);
  let betaSum = getBetaSumFromRoutes(routes, nodeRoutes);
  // console.log('ALPHASUM IS ...')
  // console.log(alphaSum.toString())
  // console.log('BETASUM IS...')
  // console.log(betaSum.toString())
  // console.log('FOR ROUTES...')
  // console.log(routes)
  let phi = new Big(totalInput).plus(betaSum).div(alphaSum);
  return phi;
}

function getAllocationForRoute(phi, route, path) {
  let alpha = getAlphaForRoute(route, path);
  let beta = getBetaForRoute(route, path);
  let epsilon = getEpsilonForRoute(route, path);
  let allocation = new Big(phi)
    .abs()
    .times(new Big(alpha).sqrt())
    .minus(beta)
    .div(epsilon);
  return allocation;
}

function getAllocationVectorForRoutes(phi, routes, nodeRoutes) {
  let allocationVec = [];
  for (var i in routes) {
    allocationVec.push(getAllocationForRoute(phi, routes[i], nodeRoutes[i]));
  }
  return allocationVec;
}

function getOptimalAllocationForRoutes(routes, nodeRoutes, totalInput) {
  // console.log("CALLING GET OPTIMAL ALLOCATION FOR ROUTES:")
  // console.log(routes)
  var totalInput = new Big(totalInput);
  let phi = getPhiFromRoutes(routes, nodeRoutes, totalInput);
  // console.log('PHI CALCULATED TO BE...')
  // console.log(phi.toString())
  let allocations = getAllocationVectorForRoutes(phi, routes, nodeRoutes);
  if (allocations.every((item) => item.lt(new Big(0)))) {
    console.log('all allocations were negative...');
    allocations = allocations.map((item) => item.times(new Big(-1.0)));
  }
  if (allocations.some((item) => item.lt(new Big(0)))) {
    allocations = reduceRoutes(routes, nodeRoutes, allocations, totalInput);
  }
  let sumAllocations = allocations.reduce((a, b) => a.plus(b), new Big(0));
  let normalizedAllocations = allocations.map((a) =>
    a.div(sumAllocations).times(new Big(totalInput))
  );
  return normalizedAllocations;
}

function reduceRoutes(routes, nodeRoutes, allocationVec, totalInput) {
  // console.log("RUNNING REDUCE ROUTES")
  var totalInput = new Big(totalInput);
  let goodIndices = [];
  for (var i in allocationVec) {
    let dx = allocationVec[i];
    // console.log('DX IS...')
    // console.log(dx.toString())
    if (dx.gt(new Big(0))) {
      goodIndices.push(i);
    }
  }
  // console.log('GOOD INDICES ARE...');
  // console.log(goodIndices);
  let newRoutes = [];
  let newNodeRoutes = [];
  for (var i in goodIndices) {
    let goodIndex = goodIndices[i];
    newRoutes.push(routes[goodIndex]);
    newNodeRoutes.push(nodeRoutes[goodIndex]);
  }
  allocationVec = getOptimalAllocationForRoutes(
    newRoutes,
    newNodeRoutes,
    totalInput
  );
  let allocationDict = {};
  for (var i in goodIndices) {
    allocationDict[goodIndices[i]] = allocationVec[i];
  }
  var allocationVecNew = [];
  for (var i in routes) {
    if (goodIndices.includes(i)) {
      allocationVecNew.push(allocationDict[i]);
    } else {
      let zeroAllocation = new Big(0);
      allocationVecNew.push(zeroAllocation);
    }
  }
  return allocationVecNew;
}

function getNodeRoutesFromPathsAndPoolChains(paths, poolChains) {
  let multiplicity = [];
  for (var i in poolChains) {
    let pc = poolChains[i];
    let mul = pc
      .map((item) => item.length)
      .reduce((elem1, elem2) => elem1 * elem2, 1);
    multiplicity.push(mul);
  }
  let nodeRoutes = [];
  for (var j in paths) {
    let path = paths[j];
    let m = multiplicity[j];
    for (var k = 0; k < m; k++) {
      nodeRoutes.push(path);
    }
  }
  return nodeRoutes;
}

function getPoolChainFromPaths(paths, pools, threshold = 0.001) {
  let poolChains = [];
  for (var pathInd in paths) {
    let path = paths[pathInd];
    let chain = [];
    let pairs = [];
    for (var i = 0; i < path.length - 1; i++) {
      pairs.push([path[i], path[i + 1]]);
    }
    for (var pairInd in pairs) {
      let pair = pairs[pairInd];
      console.log(pair);
      let tokenPools = getPoolsByToken1ANDToken2(pools, pair[0], pair[1]);
      console.log(tokenPools);
      chain.push(tokenPools);
    }
    poolChains.push(chain);
  }
  // return poolChains;
  let culledPoolChains = getCulledPoolChains(poolChains, threshold);
  return culledPoolChains;
}

function getCulledPoolChains(poolChains, threshold = 0.001) {
  let newChains = [];
  for (var pathInd in poolChains) {
    let path = poolChains[pathInd];
    let newPath = [];
    for (var legInd in path) {
      let leg = path[legInd];
      let culledPath = cullPoolsWithInsufficientLiquidity(leg, threshold);
      newPath.push(culledPath);
    }
    newChains.push(newPath);
  }
  return newChains;
}

function getRoutesFromPoolChain(poolChains) {
  let routes = [];
  for (var pci in poolChains) {
    let poolChain = poolChains[pci];
    //get cartesian product of each pool chain to get the list of routes.
    let newRoutes = cartesianProduct(poolChain);
    routes.push(...newRoutes);
  }
  return routes;
}

function getOutputSingleHop(pool, inputToken, outputToken, totalInput) {
  var totalInput = new Big(totalInput);
  // check if pool is forward or backward for inputToken/outputToken cf. token1Id/token2Id
  if (inputToken === pool.token1Id && outputToken === pool.token2Id) {
    // forward Pool
    var reserves = {
      [inputToken]: new Big(pool.token1Supply),
      [outputToken]: new Big(pool.token2Supply),
    };
  } else if (inputToken === pool.token2Id && outputToken === pool.token1Id) {
    // reverse pool
    var reserves = {
      [outputToken]: new Big(pool.token1Supply),
      [inputToken]: new Big(pool.token2Supply),
    };
  } else {
    //got the wrong pool.
    console.log(
      `INPUT TOKENS ${inputToken} and ${outputToken} DO NOT EXIST IN THIS POOL, which contains ${pool.token1Id} and ${pool.token2Id}`
    );
    return new Big(0);
  }
  let gamma = new Big(10000).minus(new Big(pool.fee)).div(new Big(10000));
  // console.log(totalInput)
  // console.log(gamma)
  // console.log(reserves)
  let num = totalInput.times(gamma).times(reserves[outputToken]);
  let denom = reserves[inputToken].plus(gamma.times(totalInput));
  return num.div(denom);
}

function getOutputDoubleHop(
  pools,
  inputToken,
  middleToken,
  outputToken,
  totalInput
) {
  var totalInput = new Big(totalInput);
  for (var poolIndex in pools) {
    let p = pools[poolIndex];
    p['gamma'] = new Big(10000).minus(new Big(p.fee)).div(new Big(10000));
  }
  let p1 = pools[0];
  let p2 = pools[1];

  if (inputToken === p1.token1Id && middleToken === p1.token2Id) {
    // forward Pool
    p1['reserves'] = {
      inputToken: new Big(p1.token1Supply),
      middleToken: new Big(p1.token2Supply),
    };
  } else if (middleToken === p1.token1Id && inputToken === p1.token2Id) {
    //reverse pool
    p1['reserves'] = {
      middleToken: new Big(p1.token1Supply),
      inputToken: new Big(p1.token2Supply),
    };
  }

  if (middleToken === p2.token1Id && outputToken === p2.token2Id) {
    // forward Pool
    p2['reserves'] = {
      middleToken: new Big(p2.token1Supply),
      outputToken: new Big(p2.token2Supply),
    };
  } else if (outputToken === p2.token1Id && middleToken === p2.token2Id) {
    //reverse pool
    p2['reserves'] = {
      outputToken: new Big(p2.token1Supply),
      middleToken: new Big(p2.token2Supply),
    };
  }

  let c1 = new Big(p1.reserves.middleToken);
  let a1 = new Big(p1.reserves.inputToken);
  let c2 = new Big(p2.reserves.middleToken);
  let b2 = new Big(p2.reserves.outputToken);
  let gamma1 = p1.gamma;
  let gamma2 = p2.gamma;
  let num = totalInput.times(c1).times(b2).times(gamma1).times(gamma2);
  let denom = c2
    .times(a1)
    .plus(
      totalInput.times(c2.times(gamma1).plus(c1.times(gamma1).times(gamma2)))
    );
  // denom = c2*a1 + totalInput * (c2*gamma1 + c1*gamma1*gamma2)

  return num.div(denom);
}

function getOutputFromRoute(route, nodeRoute, allocation) {
  if (new Big(allocation).eq(new Big(0))) {
    return new Big(0);
  } else {
    var allocation = new Big(allocation);
  }
  if (!route.length) {
    route = [route];
  }
  if (route.length == 1) {
    // single hop
    let inputToken = nodeRoute[0];
    let outputToken = nodeRoute[1];
    let pool = route[0];
    var output = getOutputSingleHop(pool, inputToken, outputToken, allocation);
  } else if (route.length == 2) {
    // DOUBLE HOP
    let inputToken = nodeRoute[0];
    let middleToken = nodeRoute[1];
    let outputToken = nodeRoute[2];
    let pools = route;
    var output = getOutputDoubleHop(
      pools,
      inputToken,
      middleToken,
      outputToken,
      allocation
    );
  }
  return output;
}

function getOptOutputVec(routes, nodeRoutes, totalInput) {
  let allocations = getOptimalAllocationForRoutes(
    routes,
    nodeRoutes,
    totalInput
  );
  let result = [];
  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let allocation = allocations[i];
    let output = getOutputFromRoute(route, nodeRoute, allocation);
    result.push(output);
  }
  return {
    result: result,
    allocations: allocations,
  };
  //NOTE -- I made this return an object instead of the tuple returned in python. need to check the places it is called, and specify
  // result field instead of tuple 0 position, and allocations field instead of tuple 1 position.
}

function getBestOptOutput(routes, nodeRoutes, totalInput) {
  let outputRefined = getOptOutputVecRefined(routes, nodeRoutes, totalInput)
    .result;
  let outputRaw = getOptOutputVec(routes, nodeRoutes, totalInput).result;
  let res1 = new Big(0);
  let res2 = new Big(0);

  for (var n in outputRefined) {
    res1 = res1.plus(outputRefined[n]);
  }
  for (var nn in outputRaw) {
    res2 = res2.plus(outputRaw[nn]);
  }
  if (res1.gt(res2)) {
    return res1;
  } else {
    return res2;
  }
}

function getBestOptInput(routes, nodeRoutes, totalInput) {
  let refDict = getOptOutputVecRefined(routes, nodeRoutes, totalInput);
  let outputRefined = refDict.result;
  let inputRefined = refDict.allocations;
  inputRefined = checkIntegerSumOfAllocations(inputRefined, totalInput);
  let rawDict = getOptOutputVec(routes, nodeRoutes, totalInput);
  let outputRaw = rawDict.result;
  let inputRaw = rawDict.allocations;
  inputRaw = checkIntegerSumOfAllocations(inputRaw, totalInput);
  let res1 = new Big(0);
  let res2 = new Big(0);

  for (var n in outputRefined) {
    res1 = res1.plus(outputRefined[n]);
  }
  for (var nn in outputRaw) {
    res2 = res2.plus(outputRaw[nn]);
  }
  // console.log('COMPARING SINGLE HOPS VS DOUBLE')
  // console.log(res1.toString())
  // console.log(res2.toString())
  if (res1.gt(res2)) {
    return inputRefined;
  } else {
    return inputRaw;
  }
}

function getOptOutputVecRefined(routes, nodeRoutes, totalInput) {
  let initLengthRoutes = routes.length;
  let directRouteInds = [];
  for (var routeInd in routes) {
    let route = routes[routeInd];
    if (!route.length) {
      route = [route];
    }
    if (route.length == 1) {
      directRouteInds.push(routeInd);
    }
  }
  // console.log('DIRECT ROUTE INDS ARE')
  // console.log(directRouteInds)
  if (directRouteInds.length < 1) {
    var allocations = getOptimalAllocationForRoutes(
      routes,
      nodeRoutes,
      totalInput
    );
    var result = [];
    for (var i in routes) {
      let r = routes[i];
      let nr = nodeRoutes[i];
      let a = allocations[i];
      let output = getOutputFromRoute(r, nr, a);
      result.push(output);
    }
  } else {
    // console.log('DOING SINGLE HOP ONLY')
    let droutes = [];
    let dnodeRoutes = [];
    for (var dri in directRouteInds) {
      let ind = directRouteInds[dri];
      droutes.push(routes[ind]);
      dnodeRoutes.push(nodeRoutes[ind]);
    }
    let dallocations = getOptimalAllocationForRoutes(
      droutes,
      dnodeRoutes,
      totalInput
    );
    let dallocDict = {};
    for (var dd in dallocations) {
      dallocDict[directRouteInds[dd]] = dallocations[dd];
    }
    var allocations = [];

    for (var ii = 0; ii < initLengthRoutes; ii++) {
      if (directRouteInds.includes(ii.toString())) {
        //console.log('ADDING ALLOCATION FOR SINGLE ROUTE')
        allocations.push(dallocDict[ii]);
      } else {
        allocations.push(new Big(0));
      }
    }
    var result = [];
    for (var j in routes) {
      let route = routes[j];
      let nodeRoute = nodeRoutes[j];
      let allocation = allocations[j];
      let output = getOutputFromRoute(route, nodeRoute, allocation);
      result.push(output);
    }
  }
  return {
    result: result,
    allocations: allocations,
  };
}

async function getBestOptimalAllocationsAndOutputs(
  pools,
  inputToken,
  outputToken,
  totalInput
) {
  console.log('INSIDE GET BEST OPTIMAL...');
  var totalInput = new Big(totalInput);
  let paths = await getPathsFromPools(pools, inputToken, outputToken);
  console.log(paths);
  let poolChains = await getPoolChainFromPaths(paths, pools);
  console.log(poolChains);
  let routes = await getRoutesFromPoolChain(poolChains);
  console.log(routes);
  let nodeRoutes = await getNodeRoutesFromPathsAndPoolChains(paths, poolChains);
  console.log(nodeRoutes);
  let allocations = await getBestOptInput(routes, nodeRoutes, totalInput);
  // fix integer rounding for allocations:
  allocations = checkIntegerSumOfAllocations(allocations, totalInput);
  let outputs = getBestOptOutput(routes, nodeRoutes, totalInput);
  return {
    allocations: allocations,
    outputs: outputs,
    routes: routes,
    nodeRoutes: nodeRoutes,
  };
}

function getActionListFromRoutesAndAllocations(
  routes,
  nodeRoutes,
  allocations,
  slippageTolerance
) {
  // TODO: need to add in minimumAmountOut for each action instead of a hop Multiplier
  // TODO: need to consolidate sub-parallel swap paths - need middle token checks.
  //console.log(allocations.map((item) => item.toString()))
  let actions = [];
  console.log('INSIDE GETACTIONLIST FUNC');
  console.log(routes);
  console.log(nodeRoutes);
  console.log(allocations);
  console.log(slippageTolerance);

  for (var i in routes) {
    let route = routes[i];
    let nodeRoute = nodeRoutes[i];
    let allocation = new Big(allocations[i]);
    if (allocation.eq(new Big(0))) {
      continue;
    }
    if (!route.length) {
      route = [route];
    }
    if (route.length === 1) {
      //single hop. only one action.
      let pool = route[0];
      let poolId = pool.id;
      let inputToken = nodeRoute[0];
      let outputToken = nodeRoute[1];
      let expectedAmountOut = getOutputSingleHop(
        pool,
        inputToken,
        outputToken,
        allocation
      );
      let minimumAmountOut = expectedAmountOut
        .times(new Big(1).minus(slippageTolerance))
        .round()
        .toString(); //Here, assume slippage tolerance is a fraction. So 1% would be 0.01
      let action = {
        pool_id: poolId,
        token_in: inputToken,
        token_out: outputToken,
        amount_in: allocation.round().toString(),
        min_amount_out: minimumAmountOut.toString(),
      };
      actions.push(action);
    } else if (route.length === 2) {
      // double hop. two actions.
      let pool1 = route[0];
      let pool2 = route[1];
      let pool1Id = pool1.id;
      let pool2Id = pool2.id;
      let inputToken = nodeRoute[0];
      let middleToken = nodeRoute[1];
      let outputToken = nodeRoute[2];
      let expectedAmountOutFirstHop = getOutputSingleHop(
        pool1,
        inputToken,
        middleToken,
        allocation
      );
      let minimumAmountOutFirstHop = expectedAmountOutFirstHop
        .times(new Big(1).minus(slippageTolerance))
        .round()
        .toString(); //Here, assume slippage tolerance is a fraction. So 1% would be 0.01

      let action1 = {
        pool_id: pool1Id,
        token_in: inputToken,
        token_out: middleToken,
        amount_in: allocation.round().toString(),
        min_amount_out: minimumAmountOutFirstHop,
      };
      let expectedFinalAmountOut = getOutputSingleHop(
        pool2,
        middleToken,
        outputToken,
        minimumAmountOutFirstHop
      );
      let minimumAMountOutSecondHop = expectedFinalAmountOut
        .times(new Big(1).minus(slippageTolerance))
        .round()
        .toString();
      let action2 = {
        pool_id: pool2Id,
        token_in: middleToken,
        token_out: outputToken,
        amount_in: minimumAmountOutFirstHop,
        min_amount_out: minimumAMountOutSecondHop,
      };
      actions.push(action1);
      actions.push(action2);
    }
  }
  return actions;
}

//     #middleTokenTotals = getMiddleTokenTotals(routes,nodeRoutes,allocations)
//     #TODO: complete this function with middle token checks.

//     #consider all routes of length 2 with non-zero allocation. (double-hops)
//     # among these, check for parallel swaps. That is, check for common node routes
//     # for first hop. Then check for common node routes on second hop.
//     # when common node routes occur for the first hop:
//     # 1. Calculate the total expected output of intermediate token.
//     # 2.
//     # when common node routes occur for the second hop:
//     # 1. get a ratio of the input allocations of the full routes associated with
//     # these common node routes. allocate the total intermediate token output
//     # toward these 2nd hop routes in the same ratio as their route input allocations.

async function getSmartRouteSwapActions(
  pools,
  inputToken,
  outputToken,
  totalInput,
  slippageTolerance
) {
  console.log('INSIDE GET SMART ROUTE ACTIONS FUNCTION');
  if (!totalInput) {
    return [];
  }
  var totalInput = new Big(totalInput);
  let resDict = await getBestOptimalAllocationsAndOutputs(
    pools,
    inputToken,
    outputToken,
    totalInput
  );
  console.log('RESULT DICTIONARY IS...');
  console.log(resDict);
  let allocations = resDict.allocations;
  // let outputs = resDict.outputs;
  let routes = resDict.routes;
  let nodeRoutes = resDict.nodeRoutes;
  let actions = getActionListFromRoutesAndAllocations(
    routes,
    nodeRoutes,
    allocations,
    slippageTolerance
  );
  console.log('TEMP ACTIONS ARE...');
  console.log(actions);
  let distilledActions = distillCommonPoolActions(
    actions,
    pools,
    slippageTolerance
  );
  console.log('RETURNING DISTILLED ACTIONS');
  console.log(distilledActions);
  return distilledActions;
}

function distillCommonPoolActions(actions, pools, slippageTolerance) {
  //     #Note, if there are multiple transactions for a single pool, it might lead to sub-optimal
  //     #returns. This is due to the fact that the routes are treated as independent, where
  //     #here, if one transaction goes through in a pool, it changes the price of the asset
  //     #before the second transaction can occur.

  //     #combine same-pool transactions into single transaction:
  console.log('INSIDE DISTILL COMMON POOL ACTIONS');
  let poolsUsedPerAction = actions.map((item) => item.pool_id);
  let axnSet = [];
  let repeats = false;
  for (var i in poolsUsedPerAction) {
    if (axnSet.includes(poolsUsedPerAction[i])) {
      repeats = true;
      break;
    } else {
      axnSet.push(poolsUsedPerAction[i]);
    }
  }
  if (repeats) {
    console.log('FOUND REPEATING POOL');
    var pid = {};
    for (var ai in actions) {
      let a = actions[ai];
      let currentPoolId = a.pool_id;
      if (Object.keys(pid).includes(currentPoolId)) {
        pid.currentPoolId.push(a);
      } else {
        pid[currentPoolId] = [a];
      }
    }
    var newActions = [];
    var poolIds = Object.keys(pid);
    for (var pi in poolIds) {
      let poolId = poolIds[pi];
      let actionList = pid[poolId];
      console.log(actionList);
      if (actionList.length == 1) {
        var poolTotalInput = new Big(actionList[0].amount_in);
      } else {
        var poolTotalInput = actionList.reduce(
          (a, b) => new Big(a.amount_in) + new Big(b.amount_in),
          new Big(0)
        );
      }

      let inputToken = actionList[0].token_in;
      let outputToken = actionList[0].token_out;
      let pool = pools.filter((item) => item.id.toString() === poolId)[0];
      let expectedMinimumOutput = getOutputSingleHop(
        pool,
        inputToken,
        outputToken,
        poolTotalInput
      ).times(new Big(1).minus(new Big(slippageTolerance)));
      let newAction = {
        pool_id: poolId,
        token_in: inputToken,
        token_out: outputToken,
        amount_in: poolTotalInput.round().toString(),
        min_amount_out: expectedMinimumOutput.round().toString(),
      };
      newActions.push(newAction);
    }
  } else {
    console.log('FOUND NO REPEATING POOL');
    console.log(actions);
    return actions;
  }
  return newActions;
}

// pool =
// {"id": 19,
// "token1Id": "wrap.near",
// "token2Id": "a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near",
// "token1Supply": "458507706848275237144751",
// "token2Supply": "4773827",
// "fee": 20,
// "shares": "1433530386500514261296380",
// "update_time": 1643427419,
// "token0_price": "0"}

//////////////////////////////////////////////////////////////
// UTILITIES
//////////////////////////////////////////////////////////////
function getPoolsByToken1ORToken2(pools, token1, token2) {
  let filteredPools = pools.filter(
    (item) =>
      item.token1Id === token1 ||
      item.token2Id === token1 ||
      item.token1Id === token2 ||
      item.token2Id === token2
  );
  return filteredPools;
}

function getPoolsByToken1ANDToken2(
  pools,
  token1,
  token2,
  cullZeroLiquidityPools = true
) {
  let filteredPools = pools.filter(
    (item) =>
      (item.token1Id === token1 && item.token2Id === token2) ||
      (item.token1Id === token2 && item.token2Id === token1)
  );
  if (cullZeroLiquidityPools) {
    filteredPools = filteredPools.filter(
      (item) => item.token1Supply != '0' && item.token2Supply != '0'
    );
  }
  return filteredPools;
}

function getLiqudityOfPoolsFromList(pools) {
  let liquidities = [];
  for (var poolInd in pools) {
    let pool = pools[poolInd];
    pool.amounts = [pool.token1Supply, pool.token2Supply];
    let poolBigAmounts = pool.amounts.map((item) => new Big(item));
    let liquidity = poolBigAmounts[0].times(poolBigAmounts[1]);
    liquidities.push(liquidity);
  }
  return liquidities;
}

function getNormalizedLiquiditiesFromList(pools) {
  let liquidities = getLiqudityOfPoolsFromList(pools);
  let maxLiq = bigMax(liquidities);
  let normalizedLiquidities = liquidities.map((item) => item.div(maxLiq));
  return normalizedLiquidities;
}

function bigMax(arrayOfBigs) {
  if (arrayOfBigs.length < 1) {
    return null;
  }
  let maxElem = arrayOfBigs[0];
  for (var ind in arrayOfBigs) {
    let val = arrayOfBigs[ind];
    if (val.gt(maxElem)) {
      maxElem = val;
    }
  }
  return maxElem;
}

function cullPoolsWithInsufficientLiquidity(pools, threshold = 0.001) {
  var thresh = new Big(threshold);
  let normLiq = getNormalizedLiquiditiesFromList(pools);
  let filteredPools = [];
  for (var i = 0; i < normLiq.length; i++) {
    if (normLiq[i] > thresh) {
      filteredPools.push(pools[i]);
    }
  }
  return filteredPools;
}

function cartesianProduct(a) {
  let result = a.reduce((a, b) =>
    a.flatMap((d) => b.map((e) => [d, e].flat()))
  );
  return result;
}

function addEdge(g, edge) {
  let src = edge[0];
  let dst = edge[1];
  if (Object.keys(g).includes(src)) {
    if (!Object.keys(g[src]).includes(dst)) {
      g[src][dst] = 1;
    }
  } else {
    g[src] = {};
    g[src][dst] = 1;
  }
  if (Object.keys(g).includes(dst)) {
    if (!Object.keys(g[dst]).includes(src)) {
      g[dst][src] = 1;
    }
  } else {
    g[dst] = {};
    g[dst][src] = 1;
  }
}

function addEdges(g, edgeList) {
  for (var n in edgeList) {
    let edge = edgeList[n];
    //console.log(edge);
    addEdge(g, edge);
  }
}

function deleteEdge(g, edge) {
  let gNew = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure
  let e1 = edge[0];
  let e2 = edge[1];
  if (Object.keys(gNew).includes(e1)) {
    if (Object.keys(gNew[e1]).includes(e2)) {
      delete gNew[e1][e2];
    }
  }
  if (Object.keys(gNew).includes(e2)) {
    if (Object.keys(gNew[e2]).includes(e1)) {
      delete gNew[e2][e1];
    }
  }
  return gNew;
}

function deleteNode(g, node) {
  let gNew = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure
  if (Object.keys(gNew).includes(node)) {
    delete gNew[node];
  }
  let keys = Object.keys(gNew);
  for (var nodeInd in keys) {
    let nodeNow = keys[nodeInd];
    if (Object.keys(gNew[nodeNow]).includes(node)) {
      delete gNew[nodeNow][node];
    }
  }
  return gNew;
}

function dijkstra(graph, s) {
  var solutions = {};
  solutions[s] = {};
  solutions[s].path = [];
  solutions[s].dist = 0;

  while (true) {
    var parent = null;
    var nearest = null;
    var dist = Infinity;

    //for each existing solution
    for (var n in solutions) {
      if (!solutions[n]) {
        solutions[n] = {};
      }
      if (!solutions[n].path) continue;
      var ndist = solutions[n].dist;
      var adj = graph[n];
      //for each of its adjacent nodes...
      for (var a in adj) {
        //without a solution already...
        if (!solutions[a]) {
          solutions[a] = {};
        }
        if (solutions[a].path) continue;
        //choose nearest node with lowest *total* cost
        var d = adj[a] + ndist;
        if (d < dist) {
          //reference parent
          parent = solutions[n].path;
          nearest = a;
          dist = d;
        }
      }
    }

    //no more solutions
    if (dist === Infinity) {
      break;
    }

    //extend parent's solution path
    solutions[nearest].path = parent.concat(nearest);
    //extend parent's cost
    solutions[nearest].dist = dist;
  }

  return solutions;
}

function shortestPath(g, src, dst, ignore_nodes = [], ignore_edges = []) {
  let gTemp = JSON.parse(JSON.stringify(g)); // using this to deep clone graph structure. If we can use lodash, could use  _.cloneDeep(obj)
  // remove nodes
  for (var nodeInd in ignore_nodes) {
    let nodeNow = ignore_nodes[nodeInd];
    gTemp = deleteNode(gTemp, nodeNow);
  }
  // remove edges
  for (var edgeInd in ignore_edges) {
    let edgeNow = ignore_edges[edgeInd];
    gTemp = deleteEdge(gTemp, edgeNow);
  }
  let solution = dijkstra(gTemp, src)[dst];
  solution.path.unshift(src); // original algorithm doesn't include source node in path
  return solution;
}

function* count(firstval = 0, step = 1) {
  let x = firstval;
  while (true) {
    yield x;
    x = x + 1;
  }
}

class PathBuffer {
  constructor() {
    this.paths = [];
    this.sortedpaths = [];
    //this.counter = count();
  }
  len() {
    return this.sortedpaths.length;
  }

  push(cost, path) {
    if (path && !arrayContains(this.paths, path)) {
      this.sortedpaths.push([cost, path]);
      this.sortedpaths.sort(function (a, b) {
        return a[0] - b[0];
      });
      //heappush(this.sortedpaths, (cost, this.counter.next().value,path));
      this.paths.push(path);
    }
  }

  pop() {
    //let val = heappop(this.sortedpaths);
    let val = this.sortedpaths.shift();
    let cost = val[0];
    let path = val[1];
    this.paths.splice(this.paths.indexOf(path), 1);
    return path;
  }
}

function arrayEquals(a, b) {
  return (
    Array.isArray(a) &&
    Array.isArray(b) &&
    a.length === b.length &&
    a.every((val, index) => val === b[index])
  );
}

function arrayContains(arr, obj) {
  // checks to see if the input array contains a reference object, obj, using
  // JSON.stringify() .
  let obj_json = JSON.stringify(obj);
  for (var itemInd in arr) {
    if (JSON.stringify(arr[itemInd]) == obj_json) {
      return true;
    }
  }
  return false;
}

function* yenFromPy(g, source, target) {
  //adapted from the python implementation in networkx.algorithms.simple_paths.shortest_simple_paths()
  let listA = [];
  let listB = new PathBuffer();
  let prev_path = null;

  while (true) {
    if (!prev_path) {
      let sol = shortestPath(g, source, target);
      let length = sol.dist;
      let path = sol.path;
      listB.push(length, path);
    } else {
      let ignore_nodes = [];
      let ignore_edges = [];
      for (var i = 1; i < prev_path.length; i++) {
        let root = prev_path.slice(0, i);
        let root_length = root.length;
        for (var pathInd in listA) {
          let path = listA[pathInd];

          if (arrayEquals(path.slice(0, i), root)) {
            let edgeToIgnore = [path[i - 1], path[i]];
            ignore_edges.push(edgeToIgnore);
          }
        }
        try {
          let sol = shortestPath(
            g,
            root[root.length - 1],
            target,
            (ignore_nodes = ignore_nodes),
            (ignore_edges = ignore_edges)
          );
          let length = sol.dist;
          let spur = sol.path;
          let path = root.slice(0, root.length - 1).concat(spur);
          listB.push(root_length + length, path);
        } catch (e) {
          //console.log(`yenFromPy error was... ${e}`)
          //dont do anything.
        }
        ignore_nodes.push(root[root.length - 1]);
      }
    }
    if (listB.sortedpaths) {
      try {
        let path = listB.pop();
        yield path;
        listA.push(path);
        prev_path = path;
      } catch (e) {
        break;
      }
    } else {
      break;
    }
  }
}

function getKShortestPaths(g, source, target, k) {
  let paths = [];
  let gen = yenFromPy(g, source, target);
  for (var n = 1; n <= k; n++) {
    try {
      let res = gen.next().value;
      if (res && !arrayContains(paths, res)) {
        if (res.length > 3) {
          console.log(
            'found all hops of length 2 or less... breaking out of generator'
          );
          break;
        }
        paths.push(res);
      }
    } catch (e) {
      console.log(e);
      break;
    }
  }
  return paths;
}

async function getPathsFromPools(pools, inputToken, outputToken) {
  // console.log('INSIDE FUNCTION');
  // console.log(pools);
  // console.log(inputToken);
  // console.log(outputToken);
  let graph = getGraphFromPoolList(pools);
  // console.log(graph);
  return getKShortestPaths(graph, inputToken, outputToken, 100);
}

// function getAllPathsBelowLengthN(g, source, target, N, limit = 1000) {
//     // use Yen's algorithm to find the paths of length N or below between source and target nodes in graph g.
//     let paths = [];
//     let gen = yenFromPy(g, source, target);
//     let currentPathLength = 0;
//     let count = 1;
//     while (currentPathLength <= N) {
//         try {
//             let res = gen.next().value;
//             if (res && !arrayContains(paths, res)) {
//                 if (res.length > currentPathLength) {
//                     currentPathLength = res.length;
//                     if (currentPathLength > N) {
//                         break;
//                     }
//                 }
//                 paths.push(res);
//             }
//             count = count + 1;
//             if (count > limit) {
//                 break;
//             }
//         } catch (e) {
//             break;
//         }
//     }
//     return paths;
// }

async function getAllPathsBelowLengthN(g, source, target, N, limit = 100) {
  // use Yen's algorithm to find the paths of length N or below between source and target nodes in graph g.
  // console.log("working with graph")
  // console.log(g)
  // console.log(`SOURCE IS ${source}`)
  // console.log(`TARGET IS ${target}`)
  let paths = [];
  // console.log('INPUTS TO YENFROMPY:')
  // console.log(g)
  // console.log(source)
  // console.log(target)
  let gen = await yenFromPy(g, source, target);
  let currentPathLength = 0;
  let count = 1;
  while (currentPathLength <= N) {
    //   console.log(`CURRENT PATH LENGTH IS ${currentPathLength}`)
    try {
      let res = await gen.next().value;
      //   console.log(`RES IS ${res}`)
      if (res && !arrayContains(paths, res)) {
        if (res.length > currentPathLength) {
          currentPathLength = res.length;
          if (currentPathLength > N) {
            break;
          }
        }
        paths.push(res);
      }
      count = count + 1;
      if (count > limit) {
        break;
      }
    } catch (e) {
      //   console.log(e)
      break;
    }
  }
  return paths;
}

function getGraphFromPoolList(poolList) {
  let pools = poolList.filter(
    (item) => item.token1Supply != '0' && item.token2Supply != '0'
  );
  let transitions = pools.map((item) => [item.token1Id, item.token2Id]);
  let g = {};
  addEdges(g, transitions);
  return g;
}

////////////////////////////////////

// TESTS

////////////////////////////////////

// check for stableswap.
function stableSmart(inputToken, outputToken, totalInput, slippageTolerance) {
  //   let stableCoins = [
  //     'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near',
  //     'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near',
  //     '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near',
  //   ]
  //   NOTE -- I found that the Ref UI codebase has these as a constant already. -- STABLE_TOKEN_IDS, STABLE_POOL_ID

  if (
    STABLE_TOKEN_IDS.includes(inputToken) &&
    STABLE_TOKEN_IDS.includes(outputToken)
  ) {
    //use stable swap only.
    console.log('USING STABLE SWAP ONLY...');
    let firstAction = GETSTABLESWAPACTION(
      (pool = STABLE_POOL_ID),
      (inputToken = inputToken),
      (outputToken = middleToken),
      (amountIn = totalInput),
      (slippageTolerance = slippageTolerance)
    );
    return [firstAction];
    //STABLESWAP(poolId=STABLE_POOL_ID, inputToken, outputToken, totalInput, slippageTolerance)
  } else if (
    STABLE_TOKEN_IDS.includes(inputToken) &&
    !STABLE_TOKEN_IDS.includes(outputToken)
  ) {
    // input is stable and output is not.
    console.log(
      'INPUT STABLE/ OUTPUT NOT, CHECKING STABLE ROUTES STARTING WITH INPUT...'
    );

    // (A) try route inputToken-->stable2-->outputToken (stablePool-->simple pool)
    // (B) try route inputTokne-->stable3-->outputToken (stablePool-->simple pool)
    // (C) try normal smart route. (simple Pool-->simple pool)
    // compare outputs from A,B,C and use the one with maximum return.

    var partialStableRoutes = [];
    var bestOutput = new Big(0);
    var bestStableSwapActions = [];
    for (var i in STABLE_TOKEN_IDS) {
      let middleToken = STABLE_TOKEN_IDS[i];
      if (middleToken === inputToken) {
        continue;
      }
      let secondHopPools = getPoolsByToken1ANDToken2(
        pools,
        middleToken,
        outputToken
      );

      let firstAction = GETSTABLESWAPACTION(
        (pool = STABLE_POOL_ID),
        (inputToken = inputToken),
        (outputToken = middleToken),
        (amountIn = totalInput),
        (slippageTolerance = slippageTolerance)
      );
      let middleTokenAmount = firstAction.min_amount_out;
      //scale to get minimum_amount_out
      let minMiddleTokenAmount = new Big(middleTokenAmount)
        .times(new Big(1).minus(slippageTolerance))
        .round()
        .toString();

      let parallelSwapActions = GETPARALLELSWAPACTIONS(
        (pools = secondHopPools),
        (inputToken = middleToken),
        (outputToken = outputToken),
        (amountIn = minMiddleTokenAmount),
        (slippageTolerance = slippageTolerance)
      );
      let stableResult = getExpectedOutputFromActions(
        parallelSwapActions,
        outputToken
      );
      partialStableRoutes.push(stableResult);
      if (new Big(stableResult).gt(bestOutput)) {
        bestOutput = new Big(stableResult);
        bestStableSwapActions = [firstAction, ...parallelSwapActions];
      }
    }
    let smartRouteActions = getSmartRouteSwapActions(
      pools,
      inputToken,
      outputToken,
      totalInput,
      slippageTolerance
    );
    let smartRouteExpectedOutput = getExpectedOutputFromActions(
      actions,
      outputToken
    );
    // now choose whichever solution gave the most output.
    if (new Big(smartRouteExpectedOutput).gt(bestOutput)) {
      return smartRouteActions;
    } else {
      return bestStableSwapActions;
    }
  } else if (
    !stableCoins.includes(inputToken) &&
    stableCoins.includes(outputToken)
  ) {
    console.log(
      'INPUT NOT STABLE/ OUTPUT IS STABLE, CHECKING STABLE ROUTES ENDING WITH OUTPUT...'
    );

    // input is not stable, output is.
    // (A) try route inputToken-->stable2-->outputToken (simple Pool-->stablepool)
    // (B) try route inputToken-->stable3-->outputToken (simple Pool-->stablepool)
    // (C) try normal smart route. (simple Pool-->simple pool)
    // compare outputs from A,B,C and use the one with maximum return.
    var partialStableRoutes = [];
    var bestOutput = new Big(0);
    var bestStableSwapActions = [];
    for (var i in STABLE_TOKEN_IDS) {
      let middleToken = STABLE_TOKEN_IDS[i];
      if (middleToken === inputToken) {
        continue;
      }
      let parallelSwapActions = GETPARALLELSWAPACTIONS(
        (pools = pools),
        (inputToken = inputToken),
        (outputToken = middleToken),
        (amountIn = totalInput),
        (slippageTolerance = slippageTolerance)
      );
      let minMiddleTokenAmount = getExpectedOutputFromActions(
        firstActions,
        middleToken
      );
      let lastAction = GETSTABLESWAPACTION(
        (pool = STABLE_POOL_ID),
        (inputToken = middleToken),
        (outputToken = outputToken),
        (amountIn = minMiddleTokenAmount),
        (slippageTolerance = slippageTolerance)
      );

      let stableResult = lastAction.min_amount_out;
      partialStableRoutes.push(stableResult);
      if (new Big(stableResult).gt(bestOutput)) {
        bestOutput = new Big(stableResult);
        bestStableSwapActions = [...parallelSwapActions, lastAction];
      }
    }
    let smartRouteActions = getSmartRouteSwapActions(
      pools,
      inputToken,
      outputToken,
      totalInput,
      slippageTolerance
    );
    let smartRouteExpectedOutput = getExpectedOutputFromActions(
      actions,
      outputToken
    );
    // now choose whichever solution gave the most output.
    if (new Big(smartRouteExpectedOutput).gt(bestOutput)) {
      return smartRouteActions;
    } else {
      return bestStableSwapActions;
    }
  } else {
    //do normal smart route swap. (simple Pool-->simple pool)
    console.log(
      'NEITHER INPUT NOR OUTPUT IS STABLE. DOING NORMAL SMART ROUTING OVER SIMPLE POOLS'
    );
    let smartRouteActions = getSmartRouteSwapActions(
      pools,
      inputToken,
      outputToken,
      totalInput,
      slippageTolerance
    );
    return smartRouteActions;
  }
}

function getExpectedOutputFromActions(actions, outputToken) {
  return actions
    .filter((item) => item.token_out === outputToken)
    .map((item) => new Big(item.min_amount_out))
    .reduce((a, b) => a.plus(b), new Big(0));
}

// let stable1 = 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near'
// let stable2 = 'a0b86991c6218b36c1d19d4a2e9eb0ce3606eb48.factory.bridge.near'
// let stable3 = '6b175474e89094c44da98b954eedeac495271d0f.factory.bridge.near'

// stableSmart(stable1, stable2)
// stableSmart(stable1, stable3)
// stableSmart(stable2, stable3)

// stableSmart(stable1, 'wrap.near')
// stableSmart('wrap.near', stable2)
// stableSmart('wrap.near', 'dbio.near')

//module.exports = { getSmartRouteSwapActions };
