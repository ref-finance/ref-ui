import {
  executeMultipleTransactions,
  ONE_YOCTO_NEAR,
  refFiFunctionCall,
  refFiViewFunction,
  REF_FI_CONTRACT_ID,
  Transaction,
  wallet,
} from './near';
import BN from 'bn.js';
import db from '../store/RefDatabase';
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import { toNonDivisibleNumber } from '../utils/numbers';
import { storageDepositForFTAction } from './creators/storage';

export const DEFAULT_PAGE_LIMIT = 100;

interface PoolRPCView {
  token_account_ids: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
}

export interface Pool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  fee: number;
  shareSupply: string;
}

const parsePool = (pool: PoolRPCView, id: number): Pool => ({
  id,
  tokenIds: pool.token_account_ids,
  supplies: pool.amounts.reduce(
    (acc: { [tokenId: string]: string }, amount: string, i: number) => {
      acc[pool.token_account_ids[i]] = amount;
      return acc;
    },
    {}
  ),
  fee: pool.total_fee,
  shareSupply: pool.shares_total_supply,
});

export const getPools = async ({
  page = 1,
  perPage = DEFAULT_PAGE_LIMIT,
  tokenName = '',
  column = '',
  order = 'desc',
  uniquePairName = false,
}: {
  page?: number;
  perPage?: number;
  tokenName?: string;
  column?: string;
  order?: string;
  uniquePairName?: boolean;
}): Promise<Pool[]> => {
  const rows = await db.queryPools({ page, perPage, tokenName, column, order, uniquePairName });
  return rows.map((row) => ({
    id: row.id,
    tokenIds: [row.token1Id, row.token2Id],
    supplies: {
      [row.token1Id]: row.token1Supply,
      [row.token2Id]: row.token2Supply,
    },
    fee: row.fee,
    shareSupply: row.shares,
  }));
};

interface GetPoolOptions {
  tokenInId: string;
  tokenOutId: string;
  amountIn: string;
}

export const getPoolsByTokens = async ({
  tokenInId,
  tokenOutId,
  amountIn,
}: GetPoolOptions): Promise<Pool[]> => {
  const amountToTrade = new BN(amountIn);

  // TODO: Check if there can be a better way. If not need to iterate through all pages to find pools
  return (await getPools({ page: 1, perPage: 100 })).filter(
    (p) =>
      new BN(p.supplies[tokenInId]).gte(amountToTrade) && p.supplies[tokenOutId]
  );
};

export const getPool = async (id: number): Promise<Pool> => {
  return refFiViewFunction({
    methodName: 'get_pool',
    args: { pool_id: id },
  }).then((pool) => parsePool(pool, id));
};

interface PoolVolumes {
  [tokenId: string]: { input: string; output: string };
}

export type PoolDetails = Pool & { volumes: PoolVolumes };

export const getPoolDetails = async (id: number): Promise<PoolDetails> => {
  const [pool, volumes] = await Promise.all([
    getPool(id),
    refFiViewFunction({
      methodName: 'get_pool_volumes',
      args: { pool_id: id },
    }),
  ]);

  return {
    ...pool,
    volumes: pool.tokenIds.reduce((acc: PoolVolumes, tokenId, i) => {
      acc[tokenId] = volumes[i];
      return acc;
    }, {}),
  };
};

export const getPoolVolumes = async (id: number): Promise<PoolVolumes> => {
  return (await getPoolDetails(id)).volumes;
};

export const getSharesInPool = (id: number): Promise<string> => {
  return refFiViewFunction({
    methodName: 'get_pool_shares',
    args: { pool_id: id, account_id: wallet.getAccountId() },
  });
};

interface AddLiquidityToPoolOptions {
  id: number;
  tokenAmounts: { token: TokenMetadata; amount: string }[];
}

export const addLiquidityToPool = async ({
   id,
   tokenAmounts,
 }: AddLiquidityToPoolOptions) => {
  const amounts = tokenAmounts.map(({ token, amount }) =>
    toNonDivisibleNumber(token.decimals, amount)
  );

  return refFiFunctionCall({
    methodName: 'add_liquidity',
    args: { pool_id: id, amounts },
    amount: ONE_YOCTO_NEAR,
  });
};

interface RemoveLiquidityOptions {
  id: number;
  shares: string;
  minimumAmounts: { [tokenId: string]: string };
}
export const removeLiquidityFromPool = async ({
  id,
  shares,
  minimumAmounts,
}: RemoveLiquidityOptions) => {
  const pool = await getPool(id);

  const amounts = pool.tokenIds.map((tokenId) => minimumAmounts[tokenId]);

  return refFiFunctionCall({
    methodName: 'remove_liquidity',
    args: {
      pool_id: id,
      shares,
      min_amounts: amounts,
    },
    amount: ONE_YOCTO_NEAR,
  });
};

export const addSimpleLiquidityPool = async (
  tokenIds: string[],
  fee: number
) => {
  const storageBalances = await Promise.all(
    tokenIds.map((id) => ftGetStorageBalance(id, REF_FI_CONTRACT_ID))
  );

  const transactions: Transaction[] = storageBalances
    .reduce((acc, sb, i) => {
      if (!sb || sb.total === '0') acc.push(tokenIds[i]);
      return acc;
    }, [])
    .map((id) => ({
      receiverId: id,
      functionCalls: [storageDepositForFTAction()],
    }));

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'add_simple_pool',
        args: { tokens: tokenIds, fee },
        amount: '0.05',
      },
    ],
  });

  return executeMultipleTransactions(
    transactions,
    `${window.location.origin}/pools`
  );
};