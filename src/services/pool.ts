import {
  executeMultipleTransactions,
  LP_STORAGE_AMOUNT,
  ONE_YOCTO_NEAR,
  refFiFunctionCall,
  refFiViewFunction,
  REF_FI_CONTRACT_ID,
  Transaction,
  wallet,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
} from './near';
import BN from 'bn.js';
import db from '../store/RefDatabase';
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import { toNonDivisibleNumber } from '../utils/numbers';
import {
  needDepositStorage,
  ONE_MORE_DEPOSIT_AMOUNT,
  storageDepositAction,
  storageDepositForFTAction,
} from './creators/storage';
import { getTopPools } from '~services/indexer';
import { PoolRPCView } from './api';
import { checkTokenNeedsStorageDeposit } from '~services/token';

export const DEFAULT_PAGE_LIMIT = 100;

export interface Pool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  fee: number;
  shareSupply: string;
  tvl: number;
  token0_ref_price: string;
}

export const parsePool = (pool: PoolRPCView, id?: number): Pool => ({
  id: id >= 0 ? id : pool.id,
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
  tvl: pool.tvl,
  token0_ref_price: pool.token0_ref_price,
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
  const poolData: PoolRPCView[] = await getTopPools({
    page,
    perPage,
    tokenName,
    column,
    order,
    uniquePairName,
  });
  if (poolData.length > 0) {
    return poolData.map((rawPool) => parsePool(rawPool));
  } else {
    const rows = await db.queryPools({
      page,
      perPage,
      tokenName,
      column,
      order,
      uniquePairName,
    });
    return rows.map((row) => ({
      id: row.id,
      tokenIds: [row.token1Id, row.token2Id],
      supplies: {
        [row.token1Id]: row.token1Supply,
        [row.token2Id]: row.token2Supply,
      },
      fee: row.fee,
      shareSupply: row.shares,
      tvl: 0,
      token0_ref_price: '0',
    }));
  }
};

export const getPoolsFromCache = async ({
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
}) => {
  const rows = await db.queryPools({
    page,
    perPage,
    tokenName,
    column,
    order,
    uniquePairName,
  });
  return rows.map((row) => ({
    id: row.id,
    tokenIds: [row.token1Id, row.token2Id],
    supplies: {
      [row.token1Id]: row.token1Supply,
      [row.token2Id]: row.token2Supply,
    },
    fee: row.fee,
    shareSupply: row.shares,
    tvl: 0,
    token0_ref_price: '0',
  }));
};

export const getPoolsFromIndexer = async ({
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
  const poolData: PoolRPCView[] = await getTopPools({
    page,
    perPage,
    tokenName,
    column,
    order,
    uniquePairName,
  });

  return poolData.map((rawPool) => parsePool(rawPool));
};

export const getAllPoolsFromDb = async () => {
  return await db.allPools().toArray();
};

export const getAllWatchListFromDb = async ({
  account = wallet.getAccountId(),
}: {
  account?: string;
}) => {
  return await db
    .allWatchList()
    .where({
      account,
    })
    .toArray();
};

export const getWatchListFromDb = async ({
  pool_id,
  account = wallet.getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db
    .allWatchList()
    .where({
      pool_id,
      account,
    })
    .toArray();
};

export const addPoolToWatchList = async ({
  pool_id,
  account = wallet.getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db.watchList.put({
    id: account + '-' + pool_id,
    pool_id,
    account,
    update_time: new Date().getTime(),
  });
};
export const removePoolFromWatchList = async ({
  pool_id,
  account = wallet.getAccountId(),
}: {
  pool_id: string;
  account?: string;
}) => {
  return await db.watchList.delete(account + '-' + pool_id);
};

export const getCachedPoolsByTokenId = async ({
  token1Id,
  token2Id,
}: {
  token1Id: string;
  token2Id: string;
}) => {
  return await db
    .allPools()
    .where({
      token1Id,
      token2Id,
    })
    .toArray();
};

export const getTotalPools = () => {
  return refFiViewFunction({
    methodName: 'get_number_of_pools',
  });
};

export const getAllPools = async (
  page: number = 1,
  perPage: number = DEFAULT_PAGE_LIMIT
): Promise<Pool[]> => {
  const index = (page - 1) * perPage;
  const poolData: PoolRPCView[] = await refFiViewFunction({
    methodName: 'get_pools',
    args: { from_index: index, limit: perPage },
  });

  return poolData.map((rawPool, i) => parsePool(rawPool, i + index));
};

interface GetPoolOptions {
  tokenInId: string;
  tokenOutId: string;
  amountIn: string;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  setLoadingData?: (loading: boolean) => void;
  loadingTrigger: boolean;
}

export const getPoolsByTokens = async ({
  tokenInId,
  tokenOutId,
  amountIn,
  setLoadingData,
  setLoadingTrigger,
  loadingTrigger,
}: GetPoolOptions): Promise<Pool[]> => {
  const amountToTrade = new BN(amountIn);
  let filtered_pools;
  const cache = await db.checkPoolsByTokens(tokenInId, tokenOutId);

  if (cache && !loadingTrigger) {
    const cache_pools = await db.getPoolsByTokens(tokenInId, tokenOutId);
    filtered_pools = cache_pools.filter(
      (p) =>
        new BN(p.supplies[tokenInId]).gte(amountToTrade) &&
        p.supplies[tokenOutId]
    );
  } else {
    setLoadingData(true);
    const totalPools = await getTotalPools();
    const pages = Math.ceil(totalPools / DEFAULT_PAGE_LIMIT);
    const pools = (
      await Promise.all([...Array(pages)].map((_, i) => getAllPools(i + 1)))
    ).flat();

    await db.cachePoolsByTokens(pools);
    filtered_pools = pools.filter(
      (p) =>
        new BN(p.supplies[tokenInId]).gte(amountToTrade) &&
        p.supplies[tokenOutId]
    );
  }
  setLoadingTrigger(false);
  setLoadingData(false);
  return filtered_pools;
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

export const canFarm = async (
  pool_id: number,
  withEnded?: boolean
): Promise<Number> => {
  let farms;
  if (!withEnded) {
    farms = (await db.queryFarms()).filter((farm) => farm.status !== 'Ended');
  } else {
    farms = await db.queryFarms();
  }

  const count = farms.reduce((pre, cur) => {
    if (Number(cur.pool_id) === pool_id) return pre + 1;
    return pre;
  }, 0);

  return count;
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

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'add_liquidity',
      args: { pool_id: id, amounts },
      amount: LP_STORAGE_AMOUNT,
    },
  ];

  const needDeposit = await checkTokenNeedsStorageDeposit();
  if (needDeposit) {
    actions.unshift(
      storageDepositAction({
        amount: needDeposit,
      })
    );
  }

  return refFiManyFunctionCalls(actions);
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

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'remove_liquidity',
      args: {
        pool_id: id,
        shares,
        min_amounts: amounts,
      },
      amount: ONE_YOCTO_NEAR,
    },
  ];

  const needDeposit = await checkTokenNeedsStorageDeposit();
  if (needDeposit) {
    actions.unshift(
      storageDepositAction({
        amount: needDeposit,
      })
    );
  }

  return refFiManyFunctionCalls(actions);
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
    `${window.location.origin}/pools/add`
  );
};
