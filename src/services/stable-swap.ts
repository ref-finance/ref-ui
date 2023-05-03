import Big from 'big.js';
import {
  divide,
  multiply,
  scientificNotationToString,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
} from '../utils/numbers';

import { EstimateSwapView } from './swap';
import {
  executeMultipleTransactions,
  near,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
  Transaction,
  wallet,
  refFiViewFunction,
} from './near';
import db from '../store/RefDatabase';
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import { getPool, getStablePool, Pool, StablePool } from './pool';
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
import getConfig from '../services/config';
import { STABLE_LP_TOKEN_DECIMALS } from '../components/stableswap/AddLiquidity';
import { DBCoreRangeType } from 'dexie';
import moment from 'moment';
import BigNumber from 'bignumber.js';
import _, { rearg } from 'lodash';
import { PoolMode } from './swap';
import { getCurrentWallet } from '../utils/wallets-integration';
import { getStableTokenIndex } from './near';
import { getStablePoolDecimal } from '../pages/stable/StableSwapEntry';
const FEE_DIVISOR = 10000;
const STABLE_POOL_ID = getConfig().STABLE_POOL_ID;
const STABLE_POOL_KEY = `STABLE_POOL_VALUE_${getConfig().STABLE_POOL_ID}`;
const REF_FI_STABLE_POOL_INFO_KEY = 'REF_FI_STABLE_Pool_INFO_VALUE';
const STABLE_POOL_RES_KEY = 'STABLE_POOL_RES_KEY';

interface EstimateSwapOptions {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
  amountIn: string;
  intl?: any;
  setLoadingData?: (loading: boolean) => void;
  loadingTrigger?: boolean;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  StablePoolInfo?: StablePool;
  setCanSwap?: (can: boolean) => void;
}

// export interface EstimateSwapView {
//   estimate: string;
//   pool: Pool;
//   intl?: any;
//   dy?: string;
//   token?: TokenMetadata;
//   status?: PoolMode;
// }

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

export const estimateSwap = async ({
  tokenIn,
  tokenOut,
  amountIn,
  intl,
  loadingTrigger,
  setLoadingTrigger,
  StablePoolInfo,
  setCanSwap,
}: EstimateSwapOptions): Promise<EstimateSwapView> => {
  const getPoolInfo = async () => {
    let pool: Pool = JSON.parse(localStorage.getItem(STABLE_POOL_KEY));

    if (!pool || loadingTrigger) {
      pool = await getPool(Number(STABLE_POOL_ID));
      localStorage.setItem(STABLE_POOL_KEY, JSON.stringify(pool));
      setLoadingTrigger(false);
    }

    if (
      new BigNumber(
        toNonDivisibleNumber(tokenIn.decimals, amountIn)
      ).isGreaterThan(new BigNumber(pool.supplies[tokenIn.id]))
    ) {
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

    return pool;
  };

  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);

  if (!parsedAmountIn)
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  try {
    const pool = await getPoolInfo();
    const [amount_swapped, fee, dy] = getSwappedAmount(
      tokenIn.id,
      tokenOut.id,
      amountIn,
      StablePoolInfo
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
      dy: toReadableNumber(STABLE_LP_TOKEN_DECIMALS, dyOut),
      pool,
    };
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

export const swap = async ({
  useNearBalance,
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
}: InstantSwapOption) => {
  if (pool) {
    if (useNearBalance) {
      await instantSwap({
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
  }
};

export const instantSwap = async ({
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const transactions = await instantSwapGetTransactions({
    pool,
    tokenIn,
    tokenOut,
    amountIn,
    minAmountOut,
  });
  return executeMultipleTransactions(transactions);
};

export const instantSwapGetTransactions = async ({
  pool,
  tokenIn,
  tokenOut,
  amountIn,
  minAmountOut,
}: SwapOptions) => {
  const swapAction = {
    pool_id: pool?.id,
    token_in: tokenIn?.id,
    token_out: tokenOut?.id,
    min_amount_out: round(
      tokenIn.decimals,
      toNonDivisibleNumber(tokenOut.decimals, minAmountOut)
    ),
  };

  const transactions: Transaction[] = [];
  const tokenInActions: RefFiFunctionCallOptions[] = [];
  const tokenOutActions: RefFiFunctionCallOptions[] = [];

  const { wallet } = getCurrentWallet();

  if (wallet.isSignedIn()) {
    const tokenOutRegistered = await ftGetStorageBalance(tokenOut.id).catch(
      () => {
        throw new Error(`${tokenOut.id} doesn't exist.`);
      }
    );

    if (!tokenOutRegistered || tokenOutRegistered.total === '0') {
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
          actions: [swapAction],
        }),
      },
      gas: '150000000000000',
      amount: ONE_YOCTO_NEAR,
    });

    transactions.push({
      receiverId: tokenIn.id,
      functionCalls: tokenInActions,
    });
    return transactions;
  }
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

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    actions.unshift(storageDepositAction({ amount: neededStorage }));
  }

  return refFiManyFunctionCalls(actions);
};

export const checkTransaction = (txHash: string) => {
  return (near.connection.provider as JsonRpcProvider).sendJsonRpc(
    'EXPERIMENTAL_tx_status',
    [txHash, getCurrentWallet()?.wallet?.getAccountId()]
  );
};

export const shareToAmount = (
  pool: Pool,
  share: string,
  token: TokenMetadata
) => {
  const totalShares = pool?.shareSupply;
  const tokensAmount = pool?.supplies;
  const shareRate =
    Number(share) /
    Number(toReadableNumber(STABLE_LP_TOKEN_DECIMALS, totalShares));
  const tokenMaxAmount = Number(
    toReadableNumber(token.decimals, tokensAmount[token.id])
  );

  return shareRate * tokenMaxAmount;
};

export const amountToShare = (
  pool: Pool,
  amount: string,
  token: TokenMetadata
) => {
  const totalShares = pool?.shareSupply;
  const tokensAmount = pool?.supplies;
  const tokenMaxAmount = toReadableNumber(
    token.decimals,
    tokensAmount[token.id]
  );

  const amountRate = divide(amount, tokenMaxAmount);

  return toReadableNumber(
    STABLE_LP_TOKEN_DECIMALS,
    toPrecision(multiply(amountRate, totalShares), 0)
  );
};

export const restShare = (pool: Pool, shareOne: string, shareTwo: string) => {
  const totalShares = pool?.shareSupply;

  return Number(totalShares) - Number(shareOne) - Number(shareTwo);
};

export const restAmount = (
  pool: Pool,
  shareOne: string,
  shareTwo: string,
  token: TokenMetadata
) => {
  const share = restShare(pool, shareOne, shareTwo);
  return shareToAmount(pool, share.toString(), token);
};

export const GetAmountToBalances = ({
  tokens,
  pool,
  amounts,
  userShare,
}: {
  tokens: TokenMetadata[];
  pool: Pool;
  amounts: string[];
  userShare: string;
}) => {
  const tokenShares = amounts.map((amount, i) =>
    amountToShare(pool, amount || '0', tokens[i])
  );

  const leftShares = new BigNumber(
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, userShare)
  ).minus(BigNumber.sum(...tokenShares));

  const parsedLeftShares = leftShares.isGreaterThan(0)
    ? leftShares.toNumber().toLocaleString('fullwide', { useGrouping: false })
    : '0';

  return tokens.reduce(
    (pre, cur, i) => ({
      ...pre,
      [cur.id]: shareToAmount(pool, parsedLeftShares, tokens[i]).toString(),
    }),
    {}
  );
};

const tradeFee = (amount: number, trade_fee: number) => {
  return (amount * trade_fee) / FEE_DIVISOR;
};

const adminFee = (amount: number, admin_fee: number) => {
  return (amount * admin_fee) / FEE_DIVISOR;
};

const normalized_trade_fee = (
  token_num: number,
  amount: number,
  trade_fee: number
) => {
  const adjusted_trade_fee = Number(
    Math.floor((trade_fee * token_num) / (4 * (token_num - 1)))
  );
  return (amount * adjusted_trade_fee) / FEE_DIVISOR;
};

export const calc_d = (amp: number, c_amounts: number[]) => {
  const token_num = c_amounts.length;
  const sum_amounts = _.sum(c_amounts);
  let d_prev = 0;
  let d = sum_amounts;
  for (let i = 0; i < 256; i++) {
    let d_prod = d;
    for (let c_amount of c_amounts) {
      d_prod = (d_prod * d) / (c_amount * token_num);
    }
    d_prev = d;
    const ann = amp * token_num ** token_num;
    const numerator = d_prev * (d_prod * token_num + ann * sum_amounts);
    const denominator = d_prev * (ann - 1) + d_prod * (token_num + 1);
    d = numerator / denominator;
    if (Math.abs(d - d_prev) <= 1) break;
  }
  return d;
};

export const calc_y = (
  amp: number,
  x_c_amount: number,
  current_c_amounts: number[],
  index_x: number,
  index_y: number
) => {
  const token_num = current_c_amounts.length;
  const ann = amp * token_num ** token_num;
  const d = calc_d(amp, current_c_amounts);
  let s = x_c_amount;
  let c = (d * d) / x_c_amount;
  for (let i = 0; i < token_num; i++) {
    if (i != index_x && i != index_y) {
      s += current_c_amounts[i];
      c = (c * d) / current_c_amounts[i];
    }
  }
  c = (c * d) / (ann * token_num ** token_num);
  const b = d / ann + s;
  let y_prev = 0;
  let y = d;
  for (let i = 0; i < 256; i++) {
    y_prev = y;
    const y_numerator = y ** 2 + c;
    const y_denominator = 2 * y + b - d;
    y = y_numerator / y_denominator;
    if (Math.abs(y - y_prev) <= 1) break;
  }

  return y;
};

export const calc_add_liquidity = (
  amp: number,
  deposit_c_amounts: number[],
  old_c_amounts: number[],
  pool_token_supply: number,
  trade_fee: number
) => {
  if (pool_token_supply === 0) {
    const d_0 = calc_d(amp, deposit_c_amounts);
    return [d_0, 0];
  }

  const token_num = old_c_amounts.length;
  const d_0 = calc_d(amp, old_c_amounts);
  let c_amounts = [];
  for (let i = 0; i < old_c_amounts.length; i++) {
    c_amounts[i] = old_c_amounts[i] + deposit_c_amounts[i];
  }
  const d_1 = calc_d(amp, c_amounts);

  if (Number(d_1) <= Number(d_0))
    throw new Error(`D1 need less then or equal to D0.`);

  for (let i = 0; i < token_num; i++) {
    const ideal_balance = (old_c_amounts[i] * d_1) / d_0;
    const difference = Math.abs(ideal_balance - c_amounts[i]);
    const fee = normalized_trade_fee(token_num, difference, trade_fee);
    c_amounts[i] -= fee;
  }
  const d_2 = calc_d(amp, c_amounts);

  if (Number(d_1) < Number(d_2)) throw new Error(`D2 need less then D1.`);

  if (Number(d_2) <= Number(d_0))
    throw new Error(`D1 need less then or equal to D0.`);
  const mint_shares = (pool_token_supply * (d_2 - d_0)) / d_0;
  const diff_shares = (pool_token_supply * (d_1 - d_0)) / d_0;

  return [mint_shares, diff_shares - mint_shares];
};

export const calc_remove_liquidity = (
  shares: number,
  c_amounts: number[],
  pool_token_supply: number
) => {
  let amounts = [];
  for (let i = 0; i < c_amounts.length; i++) {
    amounts[i] = (c_amounts[i] * shares) / pool_token_supply;
  }
  return amounts;
};

export const calc_remove_liquidity_by_tokens = (
  amp: number,
  removed_c_amounts: number[],
  old_c_amounts: number[],
  pool_token_supply: number,
  trade_fee: number
) => {
  const token_num = old_c_amounts.length;
  const d_0 = calc_d(amp, old_c_amounts);
  let c_amounts = [];
  for (let i = 0; i < old_c_amounts.length; i++) {
    c_amounts[i] = old_c_amounts[i] - removed_c_amounts[i];
  }
  const d_1 = calc_d(amp, c_amounts);
  if (d_1 >= d_0) throw new Error(`D1 need less then or equal to D0.`);
  for (let i = 0; i < token_num; i++) {
    const ideal_balance = (old_c_amounts[i] * d_1) / d_0;
    const difference = Math.abs(ideal_balance - c_amounts[i]);
    const fee = normalized_trade_fee(token_num, difference, trade_fee);
    c_amounts[i] -= fee;
  }
  const d_2 = calc_d(amp, c_amounts);
  if (d_2 > d_1) throw new Error(`D2 need less then D1.`);
  if (d_1 >= d_0) throw new Error(`D1 need less then or equal to D0.`);
  const burn_shares = (pool_token_supply * (d_0 - d_2)) / d_0;
  const diff_shares = (pool_token_supply * (d_0 - d_1)) / d_0;

  return [burn_shares, burn_shares - diff_shares];
};

export const calc_swap = (
  amp: number,
  in_token_idx: number,
  in_c_amount: number,
  out_token_idx: number,
  old_c_amounts: number[],
  trade_fee: number
) => {
  const y = calc_y(
    amp,
    in_c_amount + old_c_amounts[in_token_idx],
    old_c_amounts,
    in_token_idx,
    out_token_idx
  );
  const dy = old_c_amounts[out_token_idx] - y;
  const fee = tradeFee(dy, trade_fee);
  const amount_swapped = dy - fee;
  return [amount_swapped, fee, dy];
};

export const getSwappedAmount = (
  tokenInId: string,
  tokenOutId: string,
  amountIn: string,
  stablePool: StablePool
) => {
  const amp = stablePool.amp;
  const trade_fee = stablePool.total_fee;

  const STABLE_TOKEN_INDEX = getStableTokenIndex(stablePool.id);

  const in_token_idx = STABLE_TOKEN_INDEX[tokenInId];
  const out_token_idx = STABLE_TOKEN_INDEX[tokenOutId];

  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(stablePool.id);

  const rates = stablePool.rates.map((r) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
  );

  const base_old_c_amounts = stablePool.c_amounts.map((amount) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amount)
  );

  const old_c_amounts = base_old_c_amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount || 0).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));

  const in_c_amount = Number(
    toNonDivisibleNumber(
      STABLE_LP_TOKEN_DECIMALS,
      scientificNotationToString(
        new Big(amountIn).times(new Big(rates[in_token_idx])).toString()
      )
    )
  );

  // const in_c_amount = Number(
  //   toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, amountIn)
  // );

  const [amount_swapped, fee, dy] = calc_swap(
    amp,
    in_token_idx,
    in_c_amount,
    out_token_idx,
    old_c_amounts,
    trade_fee
  );

  // TODO:
  return [
    amount_swapped / Number(rates[out_token_idx]),
    fee,
    dy / Number(rates[out_token_idx]),
  ];

  // return [amount_swapped, fee, dy];
};

export const getAddLiquidityShares = async (
  pool_id: number,
  amounts: string[],
  stablePool: StablePool
) => {
  const amp = stablePool.amp;
  const trade_fee = stablePool.total_fee;

  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(pool_id);

  const base_old_c_amounts = stablePool.c_amounts.map((amount) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amount)
  );
  const rates = stablePool.rates.map((r) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
  );
  const old_c_amounts = base_old_c_amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));

  const deposit_c_amounts = amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));

  // const deposit_c_amounts = amounts.map((amount) =>
  //   Number(toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, amount))
  // );

  // const old_c_amounts = stablePool.c_amounts.map((amount) => Number(amount));

  const pool_token_supply = Number(stablePool.shares_total_supply);

  const [min_shares, fee_ratio] = calc_add_liquidity(
    amp,
    deposit_c_amounts,
    old_c_amounts,
    pool_token_supply,
    trade_fee
  );

  return toPrecision(scientificNotationToString(min_shares.toString()), 0);
};

export const getRemoveLiquidityByShare = (
  shares: string,
  stablePool: StablePool
) => {
  const c_amounts = stablePool.c_amounts.map((amount) => Number(amount));

  const pool_token_supply = Number(stablePool.shares_total_supply);

  const amounts = calc_remove_liquidity(
    Number(shares),
    c_amounts,
    pool_token_supply
  );

  // TODO:
  return amounts.map((amount) =>
    toPrecision(scientificNotationToString(amount.toString()), 0)
  );
};

export const getRemoveLiquidityByTokens = (
  amounts: string[],
  stablePool: StablePool
) => {
  const amp = stablePool.amp;
  // const removed_c_amounts = amounts.map((amount) =>
  //   Number(toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, amount))
  // );

  const STABLE_LP_TOKEN_DECIMALS = getStablePoolDecimal(stablePool.id);

  const pool_token_supply = Number(stablePool.shares_total_supply);

  const base_old_c_amounts = stablePool.c_amounts.map((amount) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, amount)
  );
  const rates = stablePool.rates.map((r) =>
    toReadableNumber(STABLE_LP_TOKEN_DECIMALS, r)
  );
  const old_c_amounts = base_old_c_amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));

  const removed_c_amounts = amounts
    .map((amount, i) =>
      toNonDivisibleNumber(
        STABLE_LP_TOKEN_DECIMALS,
        scientificNotationToString(
          new Big(amount).times(new Big(rates[i])).toString()
        )
      )
    )
    .map((amount) => Number(amount));
  // const old_c_amounts = stablePool.c_amounts.map((amount) => Number(amount));
  const trade_fee = Number(stablePool.total_fee);

  const [burn_shares, diff] = calc_remove_liquidity_by_tokens(
    amp,
    removed_c_amounts,
    old_c_amounts,
    pool_token_supply,
    trade_fee
  );

  return toPrecision(scientificNotationToString(burn_shares.toString()), 0);
};
