import Big from 'big.js';
import {
  executeMultipleTransactions,
  LP_STORAGE_AMOUNT,
  ONE_YOCTO_NEAR,
  refFiViewFunction,
  REF_FI_CONTRACT_ID,
  Transaction,
  RefFiFunctionCallOptions,
  BLACKLIST_POOL_IDS,
} from './near';
import db from '../store/RefDatabase';
import {
  ftGetStorageBalance,
  TokenMetadata,
  native_usdc_has_upgrated,
  tokenFtMetadata,
} from './ft-contract';
import {
  toNonDivisibleNumber,
  toReadableNumber,
  ONLY_ZEROS,
} from '../utils/numbers';
import {
  storageDepositAction,
  storageDepositForFTAction,
} from './creators/storage';
import { getTopPools, getTopPoolsIndexerRaw } from '../services/indexer';
import { PoolRPCView } from './api';
import {
  checkTokenNeedsStorageDeposit,
  getDepositTransactions,
  getTokenBalance,
} from '../services/token';
import getConfig from '../services/config';
import { registerTokensAction } from '../services/creators/token';
import { getCurrentWallet } from '../utils/wallets-integration';
import { STORAGE_TO_REGISTER_WITH_FT } from './creators/storage';
import { withdrawAction, registerAccountOnToken } from './creators/token';
import { getExplorer, ExplorerType } from '../utils/device';
import {
  STABLE_POOL_ID,
  POOL_TOKEN_REFRESH_INTERVAL,
  STABLE_POOL_USN_ID,
} from './near';
import moment from 'moment';
import { getAllTriPools } from './aurora/aurora';
import { ALL_STABLE_POOL_IDS, isStablePool, isRatedPool } from './near';
import { filterBlackListPools } from './near';
import { nearWithdrawTransaction, nearMetadata } from './wrap-near';
import {
  WRAP_NEAR_CONTRACT_ID,
  wrapNear,
  nearDepositTransaction,
} from './wrap-near';
import { STABLE_LP_TOKEN_DECIMALS } from '../components/stableswap/AddLiquidity';
import { getStablePoolDecimal } from '../pages/stable/StableSwapEntry';

import { cacheAllDCLPools } from './swapV3';
import { REF_DCL_POOL_CACHE_KEY } from '../state/swap';
import getConfigV2 from '../services/configV2';
import { DEFLATION_MARK } from '../utils/token';
const { NO_REQUIRED_REGISTRATION_TOKEN_IDS } = getConfigV2();

const explorerType = getExplorer();
export const DEFAULT_PAGE_LIMIT = 500;
const getStablePoolKey = (id: string) => `STABLE_POOL_VALUE_${id}`;

export const getStablePoolInfoKey = (id: string) =>
  `REF_FI_STABLE_Pool_INFO_VALUE_${id}`;

export interface Pool {
  id: number;
  tokenIds: string[];
  supplies: { [key: string]: string };
  fee: number;
  shareSupply: string;
  tvl: number;
  token0_ref_price: string;
  partialAmountIn?: string;
  Dex?: string;
  rates?: {
    [id: string]: string;
  };
  pool_kind?: string;
  pairAdd?: string;
  metas?: {
    [id: string]: TokenMetadata;
  };
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
  rates: string[];
}

export const getPoolByToken = async (tokenId: string) => {
  return await db.queryPoolsBytoken(tokenId);
};

export const parsePool = (pool: PoolRPCView, id?: number): Pool => ({
  id: Number(id >= 0 ? id : pool.id),
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
  pool_kind: pool?.pool_kind,
});

export const parsePoolNew = (pool: any, id?: number): any => {
  return {
    id: Number(id >= 0 ? id : pool.id),
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
    pool_kind: pool?.pool_kind,
    apy: pool.apy,
    farm_apy: pool.farm_apy,
    is_farm: pool.is_farm,
    volume_24h: pool.volume_24h,
    token_symbols: pool.token_symbols,
    search_symbols: pool.token_symbols.join('-'),
    top: pool.top,
  };
};

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

export const getAllWatchListFromDb = async ({
  account = getCurrentWallet()?.wallet?.getAccountId(),
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
  account = getCurrentWallet()?.wallet?.getAccountId(),
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
  account = getCurrentWallet()?.wallet?.getAccountId(),
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
  account = getCurrentWallet()?.wallet?.getAccountId(),
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
  const normalItems = await db
    .allPoolsTokens()
    .where('token1Id')
    .equals(token1Id)
    .and((item) => item.token2Id === token2Id)
    .primaryKeys();
  const reverseItems = await db
    .allPoolsTokens()
    .where('token1Id')
    .equals(token2Id)
    .and((item) => item.token2Id === token1Id)
    .primaryKeys();

  return [...normalItems, ...reverseItems].map((item) => item.toString());
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
  crossSwap?: boolean;
  tokenIn?: TokenMetadata;
  tokenOut?: TokenMetadata;
  proGetCachePool?: boolean;
}

export const isNotStablePool = (pool: Pool) => {
  return !isStablePool(pool.id);
};

const fetchPoolsRPC = async () => {
  const totalPools = await getTotalPools();
  const pages = Math.ceil(totalPools / DEFAULT_PAGE_LIMIT);

  const res = (
    await Promise.all([...Array(pages)].map((_, i) => getAllPools(i + 1)))
  )
    .flat()
    .map((p) => ({ ...p, Dex: 'ref' }));

  return res;
};

const fetchPoolsIndexer = async () => {
  return await getTopPoolsIndexerRaw();
};

const REF_FI_POOL_PROTOCOL = 'REF_FI_POOL_PROTOCOL_KEY';

const fetchTopPools = async () => {
  try {
    return {
      pools: await getTopPoolsIndexerRaw(),
      protocol: 'indexer',
    };
  } catch (error) {
    sessionStorage.setItem(REF_FI_POOL_PROTOCOL, 'rpc');

    await db.topPools.clear();

    await db.poolsTokens.clear();

    const res = await fetchPoolsRPC();

    return {
      pools: res,
      protocol: 'rpc',
    };
  }
};

export const getPoolsByTokens = async ({
  tokenInId,
  tokenOutId,
  setLoadingData,
  loadingTrigger,
  proGetCachePool,
  tokenIn,
  tokenOut,
}: GetPoolOptions): Promise<{
  filteredPools: Pool[];
  pool_protocol: string;
}> => {
  let pools;

  let pool_protocol = 'indexer';

  const cachePools = async (pools: any) => {
    await db.cachePoolsByTokens(
      pools.filter(filterBlackListPools).filter((p: any) => isNotStablePool(p))
    );
  };

  if (loadingTrigger) {
    const { pools: poolsRaw, protocol } = await fetchTopPools();
    pool_protocol = protocol;

    if (protocol === 'indexer') {
      await db.cacheTopPools(poolsRaw);
      pools = poolsRaw.map((p: any) => {
        return {
          ...parsePool(p),
          Dex: 'ref',
        };
      });

      sessionStorage.setItem(REF_FI_POOL_PROTOCOL, 'indexer');
    } else {
      pools = poolsRaw;

      sessionStorage.setItem(REF_FI_POOL_PROTOCOL, 'rpc');
    }

    await cachePools(pools);

    await cacheAllDCLPools();
  } else {
    if (!localStorage.getItem(REF_DCL_POOL_CACHE_KEY)) {
      await cacheAllDCLPools();
    }

    const cachedPoolProtocol = sessionStorage.getItem(REF_FI_POOL_PROTOCOL);
    pool_protocol = cachedPoolProtocol || 'indexer';

    if (cachedPoolProtocol === 'rpc') {
      pools = await db.getPoolsByTokens(tokenInId, tokenOutId);

      if (!pools || pools.length === 0) {
        pools = await fetchPoolsRPC();
        await cachePools(pools);
      }
    } else {
      const poolsRaw = await db.queryTopPools();

      if (poolsRaw && poolsRaw?.length > 0 && cachedPoolProtocol !== 'rpc') {
        pools = poolsRaw.map((p) => {
          const parsedP = parsePool({
            ...p,
            share: p.shares_total_supply,
            id: Number(p.id),
            tvl: Number(p.tvl),
          });

          return {
            ...parsedP,
            Dex: 'ref',
          };
        });
      } else {
        const poolsRaw = await fetchPoolsIndexer();

        await db.cacheTopPools(poolsRaw);

        pools = poolsRaw.map((p: any) => {
          return {
            ...parsePool(p),
            Dex: 'ref',
          };
        });

        await cachePools(pools);
      }
    }
  }

  const filteredPools = pools
    .filter(filterBlackListPools)
    .filter((pool: any) => {
      return (
        pool.tokenIds.includes(tokenInId) &&
        pool.tokenIds.includes(tokenOutId) &&
        isNotStablePool(pool)
      );
    });
  return { filteredPools, pool_protocol };
};
export const getAllPoolsByTokens = async (): Promise<{
  filteredPools: Pool[];
}> => {
  let pools;

  const cachePools = async (pools: any) => {
    await db.cachePoolsByTokens(
      pools.filter(filterBlackListPools).filter((p: any) => isNotStablePool(p))
    );
  };
  try {
    const cachedPoolProtocol = sessionStorage.getItem(REF_FI_POOL_PROTOCOL);

    if (cachedPoolProtocol === 'rpc') {
      pools = await db.getAllPoolsTokens();

      if (!pools || pools.length === 0) {
        pools = await fetchPoolsRPC();
        await cachePools(pools);
      }
    } else {
      const poolsRaw = await db.queryTopPools();
      if (poolsRaw && poolsRaw?.length > 0) {
        pools = poolsRaw.map((p) => {
          const parsedP = parsePool({
            ...p,
            share: p.shares_total_supply,
            id: Number(p.id),
            tvl: Number(p.tvl),
          });

          return {
            ...parsedP,
            Dex: 'ref',
          };
        });
      } else {
        const poolsRaw = await fetchPoolsIndexer();

        await db.cacheTopPools(poolsRaw);

        pools = poolsRaw.map((p: any) => {
          return {
            ...parsePool(p),
            Dex: 'ref',
          };
        });

        await cachePools(pools);
      }
    }
  } catch (error) {
    const { pools: poolsRaw, protocol } = await fetchTopPools();

    if (protocol === 'indexer') {
      await db.cacheTopPools(poolsRaw);
      pools = poolsRaw.map((p: any) => {
        return {
          ...parsePool(p),
          Dex: 'ref',
        };
      });
      sessionStorage.setItem(REF_FI_POOL_PROTOCOL, 'indexer');
    } else {
      pools = poolsRaw;
      sessionStorage.setItem(REF_FI_POOL_PROTOCOL, 'rpc');
    }
    await cachePools(pools);
    await cacheAllDCLPools();
  }
  const filteredPools = pools
    .filter(filterBlackListPools)
    .filter((pool: any) => {
      return isNotStablePool(pool);
    });
  return { filteredPools };
};

export const getPoolsByTokensAurora = async ({
  tokenInId,
  tokenOutId,
  setLoadingData,
  loadingTrigger,
  crossSwap,
  proGetCachePool,
  tokenIn,
  tokenOut,
}: GetPoolOptions): Promise<Pool[]> => {
  let filtered_pools;
  const [cacheForPair, cacheTimeLimit] = await db.checkPoolsByTokens(
    tokenInId,
    tokenOutId,
    true
  );

  const PAIR_NAME = [
    !tokenIn || tokenIn.id === WRAP_NEAR_CONTRACT_ID ? 'wNEAR' : tokenIn.symbol,
    !tokenOut || tokenOut.id === WRAP_NEAR_CONTRACT_ID
      ? 'wNEAR'
      : tokenOut.symbol,
  ].join('-');

  if ((!loadingTrigger && cacheTimeLimit) || !cacheForPair) {
    filtered_pools = await db.getPoolsByTokens(tokenInId, tokenOutId, true);

    let triPools: any = sessionStorage.getItem(`REF_FI_TRI_POOL_` + PAIR_NAME);
    if (triPools) {
      triPools = JSON.parse(triPools);
    } else {
      triPools = await getAllTriPools(
        tokenIn && tokenOut
          ? [
              tokenIn.id === WRAP_NEAR_CONTRACT_ID ? 'wNEAR' : tokenIn.symbol,
              tokenOut.id === WRAP_NEAR_CONTRACT_ID ? 'wNEAR' : tokenOut.symbol,
            ]
          : null
      );
    }
    filtered_pools = filtered_pools.concat(triPools || []);
  }
  if (
    (crossSwap && proGetCachePool) ||
    loadingTrigger ||
    (!cacheTimeLimit && cacheForPair)
  ) {
    setLoadingData && setLoadingData(true);

    const triPools = await getAllTriPools(
      tokenIn && tokenOut
        ? [
            tokenIn.id === WRAP_NEAR_CONTRACT_ID ? 'wNEAR' : tokenIn.symbol,
            tokenOut.id === WRAP_NEAR_CONTRACT_ID ? 'wNEAR' : tokenOut.symbol,
          ]
        : null
    );

    if (triPools && triPools.length > 0) {
      sessionStorage.setItem(
        `REF_FI_TRI_POOL_` + PAIR_NAME,
        JSON.stringify(triPools)
      );
    }

    filtered_pools = triPools;

    await db.cachePoolsByTokensAurora(filtered_pools);
    filtered_pools = filtered_pools.filter(
      (p: any) => p.supplies[tokenInId] && p.supplies[tokenOutId]
    );
  }

  setLoadingData && setLoadingData(false);

  // @ts-ignore
  return filtered_pools;
};

export const getRefPoolsByToken1ORToken2 = async () => {
  return await db.queryPoolsByTokens2();
};
export const getRefPoolsByToken1ORToken2Parsed = async () => {
  return await db.getAllPoolsTokens();
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
    args: {
      pool_id: id,
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
    },
  });
};

export const getFarmsCount = (poolId: string | number, farms: any) => {
  const count = farms.reduce((pre: number, cur: any) => {
    if (Number(cur.pool_id) === Number(poolId)) return pre + 1;
    return pre;
  }, 0);

  return count;
};

export const getEndedFarmsCount = (poolId: string | number, farms: any) => {
  const count = farms.reduce((pre: number, cur: any) => {
    if (
      Number(cur.pool_id) === Number(poolId) &&
      (cur.status === 'Ended' || cur.status === 'Created')
    )
      return pre + 1;
    return pre;
  }, 0);

  return count;
};
export const getRealEndedFarmsCount = (poolId: string | number, farms: any) => {
  const count = farms.reduce((pre: number, cur: any) => {
    if (Number(cur.pool_id) === Number(poolId) && cur.status === 'Ended')
      return pre + 1;
    return pre;
  }, 0);

  return count;
};

export const canFarm = async (
  pool_id: number,
  withEnded?: boolean
): Promise<Record<string, any>> => {
  let farms;
  let boostFarms;

  if (!withEnded) {
    farms = (await db.queryFarms()).filter((farm) => farm.status !== 'Ended');
    boostFarms = (await db.queryBoostFarms()).filter(
      (farm) => farm.status !== 'Ended'
    );
  } else {
    farms = await db.queryFarms();
    boostFarms = await db.queryBoostFarms();
  }

  const countV1 = farms.reduce((pre, cur) => {
    if (Number(cur.pool_id) === pool_id) return pre + 1;
    return pre;
  }, 0);

  const countV2 = boostFarms.reduce((pre, cur) => {
    if (Number(cur.pool_id) === pool_id) return pre + 1;
    return pre;
  }, 0);

  return {
    count: countV2 > 0 ? countV2 : countV1,
    version: countV2 > 0 ? 'V2' : 'V1',
  };
};

export const canFarms = async ({
  pool_ids,
  withEnded,
}: {
  pool_ids: number[];
  withEnded?: boolean;
}) => {
  let farms: any;
  let boostFarms: any;

  if (!withEnded) {
    farms = (await db.queryFarms()).filter((farm) => farm.status !== 'Ended');
    boostFarms = (await db.queryBoostFarms()).filter(
      (farm) => farm.status !== 'Ended'
    );
  } else {
    farms = await db.queryFarms();
    boostFarms = await db.queryBoostFarms();
  }

  const getCounts = (pool_id: number) => {
    const countV1 = farms.reduce((pre: any, cur: any) => {
      if (Number(cur.pool_id) === pool_id) return pre + 1;
      return pre;
    }, 0);

    const countV2 = boostFarms.reduce((pre: any, cur: any) => {
      if (Number(cur.pool_id) === pool_id) return pre + 1;
      return pre;
    }, 0);

    return {
      count: countV2 > 0 ? countV2 : countV1,
      version: countV2 > 0 ? 'V2' : 'V1',
    };
  };

  return pool_ids
    .map((pool_id) => getCounts(pool_id).count)
    .reduce((acc, cur, i) => {
      return {
        ...acc,
        [pool_ids[i]]: cur,
      };
    }, {}) as Record<string, number>;
};

export const canFarmV1 = async (
  pool_id: number,
  withEnded?: boolean
): Promise<Record<string, any>> => {
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

  const endedCount = farms.reduce((pre, cur) => {
    if (cur.status === 'Ended' && Number(cur.pool_id) === pool_id)
      return pre + 1;
    return pre;
  }, 0);

  return {
    count,
    version: 'V1',
    endedCount,
  };
};

export const canFarmV2 = async (
  pool_id: number,
  withEnded?: boolean
): Promise<Record<string, any>> => {
  let boostFarms;

  if (!withEnded) {
    boostFarms = (await db.queryBoostFarms()).filter(
      (farm) => farm.status !== 'Ended'
    );
  } else {
    boostFarms = await db.queryBoostFarms();
  }

  const countV2 = boostFarms.reduce((pre, cur) => {
    if (Number(cur.pool_id) === pool_id) return pre + 1;
    return pre;
  }, 0);

  const endedCount = boostFarms.reduce((pre, cur) => {
    if (cur.status === 'Ended' && Number(cur.pool_id) === pool_id)
      return pre + 1;
    return pre;
  }, 0);

  return {
    count: countV2,
    version: 'V2',
    endedCount,
  };
};

interface AddLiquidityToPoolOptions {
  id: number;
  tokenAmounts: { token: TokenMetadata; amount: string }[];
}

export const addLiquidityToPool = async ({
  id,
  tokenAmounts,
}: AddLiquidityToPoolOptions) => {
  let amounts = tokenAmounts.map(({ token, amount }) =>
    toNonDivisibleNumber(token.decimals, amount)
  );

  const transactions = await getDepositTransactions({
    tokens: tokenAmounts.map(({ token, amount }) => token),
    amounts: tokenAmounts.map(({ token, amount }) => amount),
  });
  // add deflation calc logic
  const tknx_tokens = tokenAmounts
    .map((item) => item.token)
    .filter((token) => token.id.includes(DEFLATION_MARK));
  if (tknx_tokens.length > 0) {
    const pending = tknx_tokens.map((token) => tokenFtMetadata(token.id));
    const tokenFtMetadatas = await Promise.all(pending);
    const rate = tokenFtMetadatas.reduce((acc, cur, index) => {
      const is_owner =
        cur.owner_account_id == getCurrentWallet()?.wallet?.getAccountId();
      return {
        ...acc,
        [tknx_tokens[index].id]: is_owner
          ? 0
          : (cur?.deflation_strategy?.fee_strategy?.SellFee?.fee_rate ?? 0) +
            (cur?.deflation_strategy?.burn_strategy?.SellBurn?.burn_rate ?? 0),
      };
    }, {});
    amounts = tokenAmounts.map(({ token, amount }) => {
      const reforeAmount = toNonDivisibleNumber(token.decimals, amount);
      let afterAmount = reforeAmount;
      if (rate[token.id]) {
        afterAmount = Big(1 - rate[token.id] / 1000000)
          .mul(reforeAmount)
          .toFixed(0);
      }
      return afterAmount;
    });
  }
  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'add_liquidity',
      args: { pool_id: id, amounts },
      amount: LP_STORAGE_AMOUNT,
    },
  ];

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [...actions],
  });

  const wNearTokenAmount = tokenAmounts.find(
    (TA) => TA.token.id === WRAP_NEAR_CONTRACT_ID
  );

  if (wNearTokenAmount && !ONLY_ZEROS.test(wNearTokenAmount.amount)) {
    transactions.unshift(nearDepositTransaction(wNearTokenAmount.amount));
  }

  if (tokenAmounts.map((ta) => ta.token.id).includes(WRAP_NEAR_CONTRACT_ID)) {
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

export const predictLiquidityShares = async (
  pool_id: number,
  amounts: string[],
  stablePool: StablePool
): Promise<string> => {
  return refFiViewFunction({
    methodName: 'predict_add_stable_liquidity',
    args: { pool_id, amounts },
  });
};

interface AddLiquidityToStablePoolOptions {
  id: number;
  amounts: string[];
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

  const transactions: Transaction[] = depositTransactions;

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [...actions],
  });

  if (tokens.map((t) => t.id).includes(WRAP_NEAR_CONTRACT_ID)) {
    const idx = tokens.findIndex((t) => t.id === WRAP_NEAR_CONTRACT_ID);

    if (idx !== -1 && !ONLY_ZEROS.test(amounts[idx])) {
      transactions.unshift(
        nearDepositTransaction(toReadableNumber(24, amounts[idx]))
      );
    }

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
      if (NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
        const r = await native_usdc_has_upgrated(tokenId);
        if (r) {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              storageDepositAction({
                registrationOnly: true,
                amount: STORAGE_TO_REGISTER_WITH_FT,
              }),
            ],
          });
        } else {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              {
                methodName: 'register_account',
                args: {
                  account_id: getCurrentWallet()?.wallet?.getAccountId(),
                },
                gas: '10000000000000',
              },
            ],
          });
        }
      } else {
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

  // if (
  //   tokenIds.includes(WRAP_NEAR_CONTRACT_ID) &&
  //   !ONLY_ZEROS.test(minimumAmounts[WRAP_NEAR_CONTRACT_ID])
  // ) {
  //   transactions.push(
  //     nearWithdrawTransaction(
  //       toReadableNumber(
  //         nearMetadata.decimals,
  //         minimumAmounts[WRAP_NEAR_CONTRACT_ID]
  //       )
  //     )
  //   );
  // }

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
  min_amounts: string[];
  tokens: TokenMetadata[];
  unregister?: boolean;
}
// todo by shares
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
      if (NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
        const r = await native_usdc_has_upgrated(tokenId);
        if (r) {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              storageDepositAction({
                registrationOnly: true,
                amount: STORAGE_TO_REGISTER_WITH_FT,
              }),
            ],
          });
        } else {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              {
                methodName: 'register_account',
                args: {
                  account_id: getCurrentWallet()?.wallet?.getAccountId(),
                },
                gas: '10000000000000',
              },
            ],
          });
        }
      } else {
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
  let need_split = false;
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  if (selectedWalletId == 'ledger') {
    need_split = true;
  }
  if (explorerType !== ExplorerType.Firefox && !need_split) {
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
  if (explorerType !== ExplorerType.Firefox && need_split) {
    withdrawActions.forEach((withdraw) => {
      transactions.push({
        receiverId: REF_FI_CONTRACT_ID,
        functionCalls: [withdraw],
      });
    });
  }

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  // if (
  //   tokenIds.includes(WRAP_NEAR_CONTRACT_ID) &&
  //   !ONLY_ZEROS.test(min_amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)])
  // ) {
  //   transactions.push(
  //     nearWithdrawTransaction(
  //       toReadableNumber(
  //         nearMetadata.decimals,
  //         min_amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)]
  //       )
  //     )
  //   );
  // }

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
  amounts: string[];
  max_burn_shares: string;
  tokens: TokenMetadata[];
  unregister?: boolean;
}

// todo by tokens
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
      if (NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
        const r = await native_usdc_has_upgrated(tokenId);
        if (r) {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              storageDepositAction({
                registrationOnly: true,
                amount: STORAGE_TO_REGISTER_WITH_FT,
              }),
            ],
          });
        } else {
          withDrawTransactions.unshift({
            receiverId: tokenId,
            functionCalls: [
              {
                methodName: 'register_account',
                args: {
                  account_id: getCurrentWallet()?.wallet?.getAccountId(),
                },
                gas: '10000000000000',
              },
            ],
          });
        }
      } else {
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
  let need_split = false;
  const selectedWalletId = window.selector?.store?.getState()?.selectedWalletId;
  if (selectedWalletId == 'ledger' || selectedWalletId == 'mintbase-wallet') {
    need_split = true;
  }
  if (explorerType !== ExplorerType.Firefox && !need_split) {
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
  if (explorerType !== ExplorerType.Firefox && need_split) {
    withdrawActions.forEach((withdraw) => {
      transactions.push({
        receiverId: REF_FI_CONTRACT_ID,
        functionCalls: [withdraw],
      });
    });
  }

  if (explorerType === ExplorerType.Firefox) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: withdrawActionsFireFox,
    });
  }

  // if (
  //   tokenIds.includes(WRAP_NEAR_CONTRACT_ID) &&
  //   !ONLY_ZEROS.test(amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)])
  // ) {
  //   transactions.push(
  //     nearWithdrawTransaction(
  //       toReadableNumber(
  //         nearMetadata.decimals,
  //         amounts[tokenIds.indexOf(WRAP_NEAR_CONTRACT_ID)]
  //       )
  //     )
  //   );
  // }

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
  if (isRatedPool(pool_id)) {
    const pool_info = await refFiViewFunction({
      methodName: 'get_rated_pool',
      args: { pool_id },
    });

    return {
      ...pool_info,
      id: pool_id,
    };
  }

  const pool_info = await refFiViewFunction({
    methodName: 'get_stable_pool',
    args: { pool_id },
  });

  return {
    ...pool_info,
    id: pool_id,
    rates: pool_info.c_amounts.map((i: any) =>
      toNonDivisibleNumber(STABLE_LP_TOKEN_DECIMALS, '1')
    ),
  };
};

export const getStablePoolFromCache = async (
  id?: string,
  loadingTrigger?: boolean
) => {
  const stable_pool_id = id || STABLE_POOL_ID.toString();

  const pool_key = getStablePoolKey(stable_pool_id);

  const info = getStablePoolInfoKey(stable_pool_id);

  const stablePoolCache = JSON.parse(localStorage.getItem(pool_key));

  const stablePoolInfoCache = JSON.parse(localStorage.getItem(info));

  const isStablePoolCached =
    stablePoolCache?.update_time &&
    Number(stablePoolCache.update_time) >
      Number(moment().unix() - Number(POOL_TOKEN_REFRESH_INTERVAL));

  const isStablePoolInfoCached =
    stablePoolInfoCache?.update_time &&
    Number(stablePoolInfoCache.update_time) >
      Number(moment().unix() - Number(POOL_TOKEN_REFRESH_INTERVAL));

  const stablePool = isStablePoolCached
    ? stablePoolCache
    : await getPool(Number(stable_pool_id));

  const stablePoolInfo = isStablePoolInfoCached
    ? stablePoolInfoCache
    : await getStablePool(Number(stable_pool_id));

  if (!isStablePoolCached) {
    localStorage.setItem(
      pool_key,
      JSON.stringify({ ...stablePool, update_time: moment().unix() })
    );
  }

  if (!isStablePoolInfoCached) {
    localStorage.setItem(
      info,
      JSON.stringify({ ...stablePoolInfo, update_time: moment().unix() })
    );
  }
  stablePool.rates = stablePoolInfo.token_account_ids.reduce(
    (acc: any, cur: any, i: number) => ({
      ...acc,
      [cur]: toReadableNumber(
        getStablePoolDecimal(stablePool.id),
        stablePoolInfo.rates[i]
      ),
    }),
    {}
  );

  return [stablePool, stablePoolInfo];
};

export const getAllStablePoolsFromCache = async (loadingTriger?: boolean) => {
  const res = await Promise.all(
    ALL_STABLE_POOL_IDS.filter((id) => {
      return !BLACKLIST_POOL_IDS.includes(id.toString());
    }).map((id) => getStablePoolFromCache(id.toString(), loadingTriger))
  );

  const allStablePoolsById = res.reduce((pre, cur, i) => {
    return {
      ...pre,
      [cur[0].id]: cur,
    };
  }, {}) as {
    [id: string]: [Pool, StablePool];
  };
  const allStablePools = Object.values(allStablePoolsById).map((p) => p[0]);
  const allStablePoolsInfo = Object.values(allStablePoolsById).map((p) => p[1]);

  return {
    allStablePoolsById,
    allStablePools,
    allStablePoolsInfo,
  };
};
