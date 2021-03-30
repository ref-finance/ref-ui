import { refFiViewFunction, wallet } from './near';
import BN from 'bn.js';
import { idText } from 'typescript';

const DEFAULT_PAGE_LIMIT = 10;

interface PoolRPCView {
  token_account_ids: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
}

export interface PoolDetails {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  fee: number;
  shareSupply: string;
}

const parsePool = (pool: PoolRPCView, id: number): PoolDetails => ({
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

export const getPools = async (
  page: number = 1,
  perPage: number = DEFAULT_PAGE_LIMIT
): Promise<PoolDetails[]> => {
  const index = (page - 1) * perPage;
  const poolData = await refFiViewFunction({
    methodName: 'get_pools',
    args: { from_index: index, limit: perPage },
  });

  return poolData.map(parsePool);
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
}: GetPoolOptions): Promise<PoolDetails[]> => {
  const amountToTrade = new BN(amountIn);

  // TODO: Check if there can be a better way. If not need to iterate through all pages to find pools
  return (await getPools(1, 100)).filter(
    (p) =>
      new BN(p.supplies[tokenInId]).gte(amountToTrade) && p.supplies[tokenOutId]
  );
};

export const getIdealSwapPool = async ({
  tokenInId,
  tokenOutId,
  amountIn,
}: GetPoolOptions | null) => {
  const pool = await getPoolsByTokens({ tokenInId, tokenOutId, amountIn });
  return pool.sort((a, b) => a.fee - b.fee)[0] ?? null;
};

export const getPool = async (id: number): Promise<PoolDetails> => {
  return refFiViewFunction({
    methodName: 'get_pool',
    args: { pool_id: id },
  }).then((pool) => parsePool(pool, id));
};

interface PoolVolumes {
  [tokenId: string]: { input: string; output: string };
}

export const getPoolVolumes = async (id: number): Promise<PoolVolumes> => {
  const [pool, volumes] = await Promise.all([
    getPool(id),
    refFiViewFunction({
      methodName: 'get_pool_volumes',
      args: { pool_id: id },
    }),
  ]);

  return pool.tokenIds.reduce((acc, tokenId, i) => {
    acc[tokenId] = volumes[i];
    return acc;
  }, {});
};

export const getSharesInPool = (id: string): Promise<string> => {
  return refFiViewFunction<string>({
    methodName: 'get_pool_shares',
    args: { pool_id: id, account_id: wallet.getAccountId() },
  });
};

interface AddLiquidityToPoolOptions {
  id: number;
  tokenAmounts: { [tokenId: string]: string };
}

export const addLiquidityToPool = async ({
  id,
  tokenAmounts,
}: AddLiquidityToPoolOptions) => {
  const pool = await getPool(id);

  const amounts = pool.tokenIds.map((tokenId) => tokenAmounts[tokenId]);

  return refFiViewFunction({
    methodName: 'add_liquidity',
    args: { pool_id: id, amounts },
  });
};

export const removeLiquidityFromPool = async () => {};
