import {
  executeMultipleTransactions,
  LP_STORAGE_AMOUNT,
  ONE_YOCTO_NEAR,
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
import {
  toNonDivisibleNumber,
  toReadableNumber,
  ONLY_ZEROS,
} from '../utils/numbers';
import {
  storageDepositAction,
  storageDepositForFTAction,
} from './creators/storage';
import { getTopPools, _search } from '../services/indexer';
import { parsePoolView, PoolRPCView } from './api';
import {
  checkTokenNeedsStorageDeposit,
  getDepositTransactions,
  getTokenBalance,
} from '../services/token';
import getConfig from '../services/config';
import { registerTokensAction } from '../services/creators/token';
import { getCurrentWallet } from '../utils/sender-wallet';
import { STORAGE_TO_REGISTER_WITH_FT } from './creators/storage';
import { withdrawAction } from './creators/token';
import { getExplorer, ExplorerType } from '../utils/device';
import {
  STABLE_POOL_ID,
  POOL_TOKEN_REFRESH_INTERVAL,
  filterBlackListPools,
} from './near';
import moment from 'moment';
const explorerType = getExplorer();

export const DEFAULT_PAGE_LIMIT = 100;
const STABLE_POOL_KEY = `STABLE_POOL_VALUE_${getConfig().STABLE_POOL_ID}`;
const REF_FI_STABLE_Pool_INFO_KEY = `REF_FI_STABLE_Pool_INFO_VALUE_${
  getConfig().STABLE_POOL_ID
}`;
export interface Pool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  fee: number;
  shareSupply: string;
  tvl: number;
  token0_ref_price: string;
  partialAmountIn?: string;
}

export interface StablePool {
  id: number;
  token_account_ids: string[];
  decimals: number[];
  amounts: string[];
  c_amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  amp: number;
}

export interface StablePool {
  id: number;
  token_account_ids: string[];
  decimals: number[];
  amounts: string[];
  c_amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  amp: number;
}

export const getPoolByToken = async (tokenId: string) => {
  return await db.queryPoolsBytoken(tokenId);
};

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
}): Promise<PoolRPCView[]> => {
  return await getTopPools();
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

export const getAllPoolsFromDb = async () => {
  return await db.allPools().toArray();
};

export const getAllWatchListFromDb = async ({
  account = getCurrentWallet().wallet.getAccountId(),
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
  account = getCurrentWallet().wallet.getAccountId(),
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
  account = getCurrentWallet().wallet.getAccountId(),
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
  account = getCurrentWallet().wallet.getAccountId(),
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
  let normalItems = await db
    .allPoolsTokens()
    .where('token1Id')
    .equals(token1Id)
    .and((item) => item.token2Id === token2Id)
    .toArray();
  let reverseItems = await db
    .allPoolsTokens()
    .where('token1Id')
    .equals(token2Id)
    .and((item) => item.token2Id === token1Id)
    .toArray();

  return [...normalItems, ...reverseItems];
};

export const getTotalPools = async () => {
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
  amountIn?: string;
  setLoadingTrigger?: (loadingTrigger: boolean) => void;
  setLoadingData?: (loading: boolean) => void;
  loadingTrigger: boolean;
}

export const isNotStablePool = (pool: Pool) => {
  return pool.tokenIds.length < 3;
};

export const getPoolsByTokens = async ({
  tokenInId,
  tokenOutId,
  setLoadingData,
  loadingTrigger,
}: GetPoolOptions): Promise<Pool[]> => {
  let filtered_pools;
  const [cacheForPair, cacheTimeLimit] = await db.checkPoolsByTokens(
    tokenInId,
    tokenOutId
  );

  if ((!loadingTrigger && cacheTimeLimit) || !cacheForPair) {
    filtered_pools = await db.getPoolsByTokens(tokenInId, tokenOutId);
  }
  if (loadingTrigger || (!cacheTimeLimit && cacheForPair)) {
    setLoadingData && setLoadingData(true);
    const totalPools = await getTotalPools();
    const pages = Math.ceil(totalPools / DEFAULT_PAGE_LIMIT);
    const pools = (
      await Promise.all([...Array(pages)].map((_, i) => getAllPools(i + 1)))
    ).flat();

    filtered_pools = pools.filter(isNotStablePool).filter(filterBlackListPools);

    await db.cachePoolsByTokens(filtered_pools);
    filtered_pools = filtered_pools.filter(
      (p) => p.supplies[tokenInId] && p.supplies[tokenOutId]
    );
  }
  setLoadingData && setLoadingData(false);
  // @ts-ignore
  return filtered_pools;
};

export const getRefPoolsByToken1ORToken2 = async (
  tokenId1: string,
  tokenId2: string
) => {
  return await db.queryPoolsByTokens2(tokenId1, tokenId2);
  //return await db.poolsTokens;
};

export const getPool = async (id: number): Promise<Pool> => {
  return refFiViewFunction({
    methodName: 'get_pool',
    args: { pool_id: id },
  }).then((pool: PoolRPCView) => parsePool(pool, id));
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
    args: { pool_id: id, account_id: getCurrentWallet().wallet.getAccountId() },
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

  const depositTransactions = await getDepositTransactions({
    tokens: tokenAmounts.map(({ token, amount }) => token),
    amounts: tokenAmounts.map(({ token, amount }) => amount),
  });

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'add_liquidity',
      args: { pool_id: id, amounts },
      amount: LP_STORAGE_AMOUNT,
    },
  ];

  // const needDeposit = await checkTokenNeedsStorageDeposit();
  // if (needDeposit) {
  //   actions.unshift(
  //     storageDepositAction({
  //       amount: needDeposit,
  //     })
  //   );
  // }

  return executeMultipleTransactions([
    ...depositTransactions,
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [...actions],
    },
  ]);
};

export const predictLiquidityShares = async (
  pool_id: number,
  amounts: string[],
  stablePool: StablePool
): Promise<string> => {
  return refFiViewFunction({
    methodName: 'predict_add_stable_liquidity',
    args: { pool_id: pool_id, amounts },
  });
};

interface AddLiquidityToStablePoolOptions {
  id: number;
  amounts: [string, string, string];
  min_shares: string;
  tokens: TokenMetadata[];
}

export const addLiquidityToStablePool = async ({
  id,
  amounts,
  min_shares,
  tokens,
}: AddLiquidityToStablePoolOptions) => {
  // const transactions: Transaction[] = [];

  const depositTransactions = await getDepositTransactions({
    tokens,
    amounts: amounts.map((amount, i) =>
      toReadableNumber(tokens[i].decimals, amount)
    ),
  });

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'add_stable_liquidity',
      args: { pool_id: id, amounts, min_shares },
      amount: LP_STORAGE_AMOUNT,
    },
  ];

  const allTokenIds = getConfig().STABLE_TOKEN_IDS;
  const balances = await Promise.all(
    allTokenIds.map((tokenId) => getTokenBalance(tokenId))
  );
  let notRegisteredTokens: string[] = [];
  for (let i = 0; i < balances.length; i++) {
    if (Number(balances[i]) === 0) {
      notRegisteredTokens.push(allTokenIds[i]);
    }
  }

  if (notRegisteredTokens.length > 0 && explorerType !== ExplorerType.Firefox) {
    actions.unshift(registerTokensAction(notRegisteredTokens));
  }

  const transactions: Transaction[] = depositTransactions;

  if (notRegisteredTokens.length > 0 && explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [registerTokensAction(notRegisteredTokens)],
    });
  }

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [...actions],
  });

  return executeMultipleTransactions(transactions);
};

interface RemoveLiquidityOptions {
  id: number;
  shares: string;
  minimumAmounts: { [tokenId: string]: string };
  unregister?: boolean;
}

export const removeLiquidityFromPool = async ({
  id,
  shares,
  minimumAmounts,
  unregister = false,
}: RemoveLiquidityOptions) => {
  const pool = await getPool(id);

  const amounts = pool.tokenIds.map((tokenId) => minimumAmounts[tokenId]);

  const tokenIds = Object.keys(minimumAmounts);

  const withDrawTransactions: Transaction[] = [];

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];

    const ftBalance = await ftGetStorageBalance(tokenId);
    if (ftBalance === null) {
      withDrawTransactions.unshift({
        receiverId: tokenId,
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    withDrawTransactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const withdrawActions = tokenIds.map((tokenId, i) =>
    withdrawAction({ tokenId, amount: '0', unregister })
  );

  const withdrawActionsFireFox = tokenIds.map((tokenId, i) =>
    withdrawAction({ tokenId, amount: '0', unregister, singleTx: true })
  );

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'remove_liquidity',
      args: {
        pool_id: id,
        shares,
        min_amounts: amounts,
      },
      amount: ONE_YOCTO_NEAR,
      gas: '30000000000000',
    },
  ];
  if (explorerType !== ExplorerType.Firefox) {
    withdrawActions.forEach((item) => {
      actions.push(item);
    });
  }

  const transactions: Transaction[] = [
    ...withDrawTransactions,
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [...actions],
    },
  ];

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  return executeMultipleTransactions(transactions);
};

export const predictRemoveLiquidity = async (
  pool_id: number,
  shares: string
): Promise<[]> => {
  return refFiViewFunction({
    methodName: 'predict_remove_liquidity',
    args: { pool_id, shares },
  });
};

interface RemoveLiquidityFromStablePoolOptions {
  id: number;
  shares: string;
  min_amounts: [string, string, string];
  tokens: TokenMetadata[];
  unregister?: boolean;
}

export const removeLiquidityFromStablePool = async ({
  id,
  shares,
  min_amounts,
  tokens,
  unregister = false,
}: RemoveLiquidityFromStablePoolOptions) => {
  const tokenIds = tokens.map((token) => token.id);

  const withDrawTransactions: Transaction[] = [];

  for (let i = 0; i < tokenIds.length; i++) {
    const tokenId = tokenIds[i];

    const ftBalance = await ftGetStorageBalance(tokenId);
    if (ftBalance === null) {
      withDrawTransactions.unshift({
        receiverId: tokenId,
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    withDrawTransactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const withdrawActions = tokenIds.map((tokenId) =>
    withdrawAction({ tokenId, amount: '0', unregister })
  );

  const withdrawActionsFireFox = tokenIds.map((tokenId, i) =>
    withdrawAction({ tokenId, amount: '0', unregister, singleTx: true })
  );

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'remove_liquidity',
      args: {
        pool_id: id,
        shares,
        min_amounts,
      },
      amount: ONE_YOCTO_NEAR,
      gas: '30000000000000',
    },
  ];

  if (explorerType !== ExplorerType.Firefox) {
    withdrawActions.forEach((item) => {
      actions.push(item);
    });
  }

  const transactions: Transaction[] = [
    ...withDrawTransactions,
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [...actions],
    },
  ];

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  return executeMultipleTransactions(transactions);
};

export const predictRemoveLiquidityByTokens = async (
  pool_id: number,
  amounts: string[]
): Promise<string> => {
  return refFiViewFunction({
    methodName: 'predict_remove_liquidity_by_tokens',
    args: { pool_id, amounts },
  });
};

interface RemoveLiquidityByTokensFromStablePoolOptions {
  id: number;
  amounts: [string, string, string];
  max_burn_shares: string;
  tokens: TokenMetadata[];
  unregister?: boolean;
}

export const removeLiquidityByTokensFromStablePool = async ({
  id,
  amounts,
  max_burn_shares,
  tokens,
  unregister = false,
}: RemoveLiquidityByTokensFromStablePoolOptions) => {
  const tokenIds = tokens.map((token) => token.id);

  const withDrawTransactions: Transaction[] = [];

  for (let i = 0; i < tokenIds.length; i++) {
    if (ONLY_ZEROS.test(amounts[i])) continue;

    const tokenId = tokenIds[i];

    const ftBalance = await ftGetStorageBalance(tokenId);
    if (ftBalance === null) {
      withDrawTransactions.unshift({
        receiverId: tokenId,
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    withDrawTransactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  const withdrawActions = tokenIds
    .filter((tk, i) => !ONLY_ZEROS.test(amounts[i]))
    .map((tokenId) => withdrawAction({ tokenId, amount: '0', unregister }));

  const withdrawActionsFireFox = tokenIds
    .filter((tk, i) => !ONLY_ZEROS.test(amounts[i]))
    .map((tokenId, i) =>
      withdrawAction({ tokenId, amount: '0', unregister, singleTx: true })
    );

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'remove_liquidity_by_tokens',
      args: { pool_id: id, amounts, max_burn_shares },
      amount: ONE_YOCTO_NEAR,
      gas: '30000000000000',
    },
  ];

  if (explorerType !== ExplorerType.Firefox) {
    withdrawActions.forEach((item) => {
      actions.push(item);
    });
  }

  const transactions: Transaction[] = [
    ...withDrawTransactions,
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [...actions],
    },
  ];

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  return executeMultipleTransactions(transactions);
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

export const getStablePool = async (pool_id: number): Promise<StablePool> => {
  const pool_info = await refFiViewFunction({
    methodName: 'get_stable_pool',
    args: { pool_id },
  });

  return {
    ...pool_info,
    id: pool_id,
  };
};

export const getStablePoolFromCache = async () => {
  const stablePoolCache = JSON.parse(localStorage.getItem(STABLE_POOL_KEY));

  const stablePoolInfoCache = JSON.parse(
    localStorage.getItem(REF_FI_STABLE_Pool_INFO_KEY)
  );

  const isStablePoolCached =
    stablePoolCache?.update_time &&
    stablePoolCache.update_time >
      moment().unix() - Number(POOL_TOKEN_REFRESH_INTERVAL);

  const isStablePoolInfoCached =
    stablePoolInfoCache?.update_time &&
    stablePoolInfoCache.update_time >
      moment().unix() - Number(POOL_TOKEN_REFRESH_INTERVAL);

  const stablePool = isStablePoolCached
    ? stablePoolCache
    : await getPool(Number(STABLE_POOL_ID));

  const stablePoolInfo = isStablePoolInfoCached
    ? stablePoolInfoCache
    : await getStablePool(Number(STABLE_POOL_ID));

  if (!isStablePoolCached) {
    localStorage.setItem(
      STABLE_POOL_KEY,
      JSON.stringify({ ...stablePool, update_time: moment().unix() })
    );
  }

  if (!isStablePoolInfoCached) {
    localStorage.setItem(
      REF_FI_STABLE_Pool_INFO_KEY,
      JSON.stringify({ ...stablePoolInfo, update_time: moment().unix() })
    );
  }

  return [stablePool, stablePoolInfo];
};
