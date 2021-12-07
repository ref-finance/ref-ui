import { toNonDivisibleNumber, toReadableNumber } from '../utils/numbers';
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
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import { getPool, Pool } from './pool';
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
import getConfig from '~services/config';
import { STABLE_LP_TOKEN_DECIMALS } from '~components/stableswap/AddLiquidity';

const FEE_DIVISOR = 10000;
const STABLE_POOL_ID = getConfig().STABLE_POOL_ID;

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
}: EstimateSwapOptions): Promise<EstimateSwapView> => {
  const parsedAmountIn = toNonDivisibleNumber(tokenIn.decimals, amountIn);
  if (!parsedAmountIn)
    throw new Error(
      `${amountIn} ${intl.formatMessage({ id: 'is_not_a_valid_swap_amount' })}`
    );

  try {
    const pool = await getPool(Number(STABLE_POOL_ID));
    const result = await Promise.resolve(
      refFiViewFunction({
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
        .catch(() => ({ status: 'error', estimate: '0', pool }))
    );

    return {
      estimate: toReadableNumber(tokenOut.decimals, result.estimate),
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

  if (wallet.isSignedIn()) {
    const tokenOutRegistered = await ftGetStorageBalance(
      tokenOut.id,
      wallet.getAccountId()
    ).catch(() => {
      throw new Error(`${tokenOut.id} doesn't exist.`);
    });

    if (!tokenOutRegistered || tokenOutRegistered.total === '0') {
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

    return executeMultipleTransactions(transactions);
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
    [txHash, wallet.getAccountId()]
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
  const tokenMaxAmount = Number(
    toReadableNumber(token.decimals, tokensAmount[token.id])
  );
  const amountRate = Number(amount) / tokenMaxAmount;

  return toReadableNumber(
    STABLE_LP_TOKEN_DECIMALS,
    (amountRate * Number(totalShares)).toString()
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
