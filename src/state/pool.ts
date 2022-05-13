import { useEffect, useState, useCallback, useContext } from 'react';
import {
  calculateFairShare,
  percentLess,
  toPrecision,
  toNonDivisibleNumber,
  toReadableNumber,
} from '../utils/numbers';
import { getStakedListByAccountId } from '../services/farm';
import {
  DEFAULT_PAGE_LIMIT,
  getAllPoolsFromDb,
  getAllWatchListFromDb,
  getCachedPoolsByTokenId,
  getPoolDetails,
  getPools,
  getSharesInPool,
  getTotalPools,
  parsePool,
  Pool,
  PoolDetails,
  removeLiquidityFromPool,
  predictLiquidityShares,
  predictRemoveLiquidityByTokens,
  StablePool,
  getStablePool,
  getPoolsFromCache,
} from '../services/pool';
import db, { PoolDb, WatchList } from '../store/RefDatabase';

import { useWhitelistTokens } from './token';
import _, { countBy, debounce, min, orderBy, trim } from 'lodash';
import {
  getPoolMonthVolume,
  getPoolMonthTVL,
  getPoolsByIds,
  get24hVolume,
  _order,
  _search,
  getTopPools,
  getPool,
} from '../services/indexer';
import { parsePoolView, PoolRPCView } from '../services/api';
import { TokenMetadata } from '../services/ft-contract';
import { TokenBalancesView } from '../services/token';
import {
  shareToAmount,
  getAddLiquidityShares,
  getRemoveLiquidityByTokens,
} from '../services/stable-swap';
import { STABLE_LP_TOKEN_DECIMALS } from '~components/stableswap/AddLiquidity';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import {
  POOL_TOKEN_REFRESH_INTERVAL,
  STABLE_POOL_ID,
  ALL_STABLE_POOL_IDS,
} from '../services/near';
import { getCurrentWallet, WalletContext } from '../utils/sender-wallet';
import getConfig from '../services/config';
import {
  getStablePoolFromCache,
  getRefPoolsByToken1ORToken2,
} from '../services/pool';
const REF_FI_STABLE_POOL_INFO_KEY = `REF_FI_STABLE_Pool_INFO_VALUE_${
  getConfig().STABLE_POOL_ID
}`;

export const usePool = (id: number | string) => {
  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>('0');
  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  useEffect(() => {
    // if (!isSignedIn) return;

    getPoolDetails(Number(id)).then(setPool);
    getSharesInPool(Number(id))
      .then(setShares)
      .catch(() => setShares);

    getStakedListByAccountId({})
      .then((stakeList) => {
        setStakeList(stakeList);
      })
      .catch(() => {});
  }, [id, isSignedIn]);

  return { pool, shares, stakeList };
};

interface LoadPoolsOpts {
  accumulate: boolean;
  tokenName?: string;
  sortBy?: string;
  order?: string;
}

export const usePools = (props: {
  searchTrigger?: Boolean;
  tokenName?: string;
  sortBy?: string;
  order?: string;
}) => {
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [rawPools, setRawPools] = useState<PoolRPCView[]>([]);
  const [loading, setLoading] = useState(false);

  const nextPage = () => setPage((page) => page + 1);

  function _loadPools({
    accumulate = true,
    tokenName,
    sortBy,
    order,
  }: LoadPoolsOpts) {
    getTopPools()
      .then(async (rawPools) => {
        const pools =
          rawPools.length > 0
            ? rawPools.map((rawPool) => parsePool(rawPool))
            : await getPoolsFromCache({
                page,
                tokenName: tokenName,
                column: sortBy,
                order: order,
              });

        setRawPools(rawPools);

        setHasMore(pools.length === DEFAULT_PAGE_LIMIT);
        setPools((currentPools) =>
          pools.reduce<Pool[]>(
            (acc: Pool[], pool) => {
              if (
                acc.some(
                  (p) =>
                    p.fee === pool.fee &&
                    p.tokenIds.includes(pool.tokenIds[0]) &&
                    p.tokenIds.includes(pool.tokenIds[1]) &&
                    p.shareSupply === pool.shareSupply
                )
              )
                return acc;
              acc.push(pool);
              return acc;
            },
            accumulate ? currentPools.slice() : []
          )
        );
      })
      .finally(() => setLoading(false));
  }

  const loadPools = useCallback(debounce(_loadPools, 500), []);

  useEffect(() => {
    const args = {
      page,
      perPage: DEFAULT_PAGE_LIMIT,
      tokenName: trim(props.tokenName),
      column: props.sortBy,
      order: props.order,
    };

    const newPools = _order(args, _search(args, rawPools)).map((rawPool) =>
      parsePool(rawPool)
    );
    setPools(newPools);
  }, [props.sortBy, props.order, props.tokenName, rawPools]);

  useEffect(() => {
    setLoading(true);
    loadPools({
      accumulate: true,
      tokenName: props.tokenName,
      sortBy: props.sortBy,
      order: props.order,
    });
  }, [page]);

  return {
    pools,
    hasMore,
    nextPage,
    loading,
  };
};

export const useMorePoolIds = ({
  topPool,
  inView,
}: {
  topPool: Pool;
  inView: boolean;
}) => {
  const [token1Id, token2Id] = topPool.tokenIds;

  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    if (!inView) return;
    getCachedPoolsByTokenId({
      token1Id,
      token2Id,
    }).then(setIds);
  }, [topPool?.id, inView]);
  return ids;
};

export const usePoolsMorePoolIds = ({ pools }: { pools: Pool[] }) => {
  // top pool id to more pool ids:Array
  const [poolsMorePoolIds, setMorePoolIds] = useState<Record<string, string[]>>(
    {}
  );

  const getAllPoolsTokens = async () => {
    return await db.getAllPoolsTokens();
  };

  useEffect(() => {
    if (!pools) return;

    getAllPoolsTokens().then((res) => {
      const poolsMorePoolIds = pools.map((p) => {
        const id1 = p.tokenIds[0];
        const id2 = p.tokenIds[1];

        return res
          .filter(
            (resP) => resP.tokenIds.includes(id1) && resP.tokenIds.includes(id2)
          )
          .map((a) => a.id.toString());
      });

      const parsedIds = poolsMorePoolIds.reduce((acc, cur, i) => {
        return {
          ...acc,
          [pools[i].id.toString()]: cur,
        };
      }, {});

      setMorePoolIds(parsedIds);
    });
  }, [pools]);

  return poolsMorePoolIds;
};

export const useMorePools = ({
  morePoolIds,
  order,
  sortBy,
}: {
  morePoolIds: string[];
  order: boolean | 'desc' | 'asc';
  sortBy: string;
}) => {
  const [morePools, setMorePools] = useState<PoolRPCView[]>();
  useEffect(() => {
    getPoolsByIds({ pool_ids: morePoolIds }).then((res) => {
      const orderedPools = orderBy(res, [sortBy], [order]);
      setMorePools(orderedPools);
    });
  }, [order, sortBy]);
  return morePools;
};

export const usePoolsFarmCount = ({
  morePoolIds,
}: {
  morePoolIds: string[];
}) => {
  const [poolsFarmCount, setPoolsFarmCount] = useState<Record<string, number>>(
    {}
  );

  const getFarms = async () => {
    return await db.queryFarms();
  };

  useEffect(() => {
    if (!morePoolIds) return;
    getFarms().then((res) => {
      const counts = morePoolIds.map((id) => {
        const count = res.reduce((pre, cur) => {
          if (Number(cur.pool_id) === Number(id)) return pre + 1;
          return pre;
        }, 0);
        return count;
      });
      const parsedCounts = counts.reduce((acc, cur, i) => {
        return {
          ...acc,
          [morePoolIds[i]]: cur,
        };
      }, {});

      setPoolsFarmCount(parsedCounts);
    });
  }, [morePoolIds]);

  return poolsFarmCount;
};

export const usePoolTVL = (poolId: string | number) => {
  const [TVL, setTVL] = useState<number>(null);

  useEffect(() => {
    const id = String(poolId);
    getPool(id).then((res) => {
      setTVL(res.tvl);
    });
  }, [poolId]);

  return TVL;
};

export const useAllWatchList = () => {
  const [watchList, setWatchList] = useState<WatchList[]>();

  useEffect(() => {
    getAllWatchListFromDb({}).then((watchlist) => {
      setWatchList(_.orderBy(watchlist, 'update_time', 'desc'));
    });
  }, []);

  return watchList;
};

export const useWatchPools = () => {
  const [watchList, setWatchList] = useState<WatchList[]>([]);

  const [watchPools, setWatchPools] = useState<Pool[]>([]);
  useEffect(() => {
    getAllWatchListFromDb({}).then((watchlist) => {
      setWatchList(_.orderBy(watchlist, 'update_time', 'desc'));
    });
  }, []);

  useEffect(() => {
    const ids = watchList.map((watchedPool) => watchedPool.pool_id);
    if (ids.length === 0) return;
    getPoolsByIds({ pool_ids: ids }).then((res) => {
      const resPools = res.map((pool) => parsePool(pool));
      setWatchPools(resPools);
    });
  }, [watchList]);

  return watchPools;
};

export const useAllPools = () => {
  const [allPools, setAllPools] = useState<number>();

  useEffect(() => {
    getTotalPools().then((res) => {
      setAllPools(res);
    });
  }, []);

  return allPools;
};

export const useRemoveLiquidity = ({
  pool,
  shares,
  slippageTolerance,
}: {
  pool: Pool;
  shares: string;
  slippageTolerance: number;
}) => {
  const minimumAmounts = Object.entries(pool.supplies).reduce<{
    [tokenId: string]: string;
  }>((acc, [tokenId, totalSupply]) => {
    acc[tokenId] = toPrecision(
      percentLess(
        slippageTolerance,
        calculateFairShare({
          shareOf: totalSupply,
          contribution: shares,
          totalContribution: pool.shareSupply,
        })
      ),
      0
    );
    return acc;
  }, {});

  const removeLiquidity = () => {
    return removeLiquidityFromPool({
      id: pool.id,
      shares,
      minimumAmounts,
    });
  };

  return {
    removeLiquidity,
    minimumAmounts,
  };
};

export interface volumeType {
  pool_id: string;
  dateString: string;
  fiat_volume: string;
  asset_volume: string;
  volume_dollar: string;
}

export interface volumeDataType {
  pool_id: string;
  dateString: string;
  fiat_volume: string;
  asset_volume: string;
  volume_dollar: number;
}

export const useMonthVolume = (pool_id: string) => {
  const [monthVolumeById, setMonthVolumeById] = useState<volumeDataType[]>();
  useEffect(() => {
    getPoolMonthVolume(pool_id).then((res) => {
      const monthVolume = res
        .map((v, i) => {
          return {
            ...v,
            volume_dollar: Number(v.volume_dollar),
          };
        })
        .reverse();
      setMonthVolumeById(monthVolume);
    });
  }, []);

  return monthVolumeById;
};

export interface TVLType {
  pool_id: string;
  asset_amount: string;
  fiat_amount: string;
  asset_price: string;
  fiat_price: string;
  asset_tvl: string;
  fiat_tvl: string;
  date: string;
}
export interface TVLDataType {
  pool_id: string;
  asset_amount: string;
  fiat_amount: string;
  asset_price: string;
  fiat_price: string;
  asset_tvl: number;
  fiat_tvl: number;
  date: string;
  total_tvl: number;
  scaled_tvl: number;
}

export const useMonthTVL = (pool_id: string) => {
  const [monthTVLById, setMonthTVLById] = useState<TVLDataType[]>();
  useEffect(() => {
    getPoolMonthTVL(pool_id).then((res) => {
      const minDay = _.minBy(res, (o) => {
        return Number(o.asset_tvl) + Number(o.fiat_tvl);
      });
      const minValue = Number(minDay?.asset_tvl) + Number(minDay?.fiat_tvl);

      const monthTVL = res
        .map((v, i) => {
          return {
            ...v,
            asset_tvl: Number(v?.asset_tvl),
            fiat_tvl: Number(v?.fiat_tvl),
            total_tvl: Number(v?.fiat_tvl) + Number(v?.asset_tvl),
            scaled_tvl:
              Number(v?.fiat_tvl) + Number(v?.asset_tvl) - minValue * 0.99,
          };
        })
        .reverse();
      setMonthTVLById(monthTVL);
    });
  }, []);

  return monthTVLById;
};

export const useDayVolume = (pool_id: string) => {
  const [dayVolume, setDayVolume] = useState<string>();
  useEffect(() => {
    get24hVolume(pool_id).then(setDayVolume);
  }, [pool_id]);
  return dayVolume;
};

export const usePredictShares = ({
  poolId,
  tokenAmounts,
  stablePool,
}: {
  poolId: number;
  tokenAmounts: string[];
  stablePool: StablePool;
}) => {
  const [predicedShares, setPredictedShares] = useState<string>('0');

  const zeroValidae = () => {
    return tokenAmounts.some((amount) => Number(amount) > 0);
  };

  useEffect(() => {
    if (!zeroValidae()) {
      setPredictedShares('0');
      return;
    }
    getAddLiquidityShares(poolId, tokenAmounts, stablePool)
      .then(setPredictedShares)
      .catch((e) => e);
  }, [...tokenAmounts]);

  return predicedShares;
};

export const usePredictRemoveShares = ({
  amounts,
  setError,
  shares,
  stablePool,
}: {
  amounts: string[];
  setError: (e: Error) => void;
  shares: string;
  stablePool: StablePool;
}) => {
  const [canSubmitByToken, setCanSubmitByToken] = useState<boolean>(false);

  const [predictedRemoveShares, setPredictedRemoveShares] =
    useState<string>('0');

  const zeroValidate = amounts.every((amount) => !(Number(amount) > 0));

  function validate(predictedShare: string) {
    if (new BigNumber(predictedShare).isGreaterThan(new BigNumber(shares))) {
      setCanSubmitByToken(false);
      setError(new Error('insufficient_shares'));
    } else {
      setCanSubmitByToken(true);
    }
  }

  useEffect(() => {
    setError(null);
    if (zeroValidate) {
      setPredictedRemoveShares('0');
      setCanSubmitByToken(false);
      return;
    }
    setCanSubmitByToken(false);

    try {
      const burn_shares = getRemoveLiquidityByTokens(amounts, stablePool);

      validate(burn_shares);
      setPredictedRemoveShares(burn_shares);
    } catch (error) {
      setError(new Error('insufficient_shares'));
      setCanSubmitByToken(false);
    }
  }, [...amounts]);

  return {
    predictedRemoveShares,
    canSubmitByToken,
  };
};

export const useStablePool = ({
  loadingTrigger,
  setLoadingTrigger,
  loadingPause,
  setLoadingPause,
  poolId,
}: {
  loadingTrigger: boolean;
  setLoadingTrigger: (mode: boolean) => void;
  loadingPause: boolean;
  setLoadingPause: (pause: boolean) => void;
  poolId: string | number;
}) => {
  const [stablePool, setStablePool] = useState<StablePool>();
  const [count, setCount] = useState(0);
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;
  useEffect(() => {
    if ((loadingTrigger && !loadingPause) || !stablePool) {
      getStablePool(Number(STABLE_POOL_ID)).then((res) => {
        setStablePool(res);
        localStorage.setItem(REF_FI_STABLE_POOL_INFO_KEY, JSON.stringify(res));
      });
    }
  }, [count, loadingTrigger, loadingPause, stablePool]);

  useEffect(() => {
    let id: any = null;
    if (!loadingTrigger && !loadingPause) {
      id = setInterval(() => {
        setLoadingTrigger(true);
        setCount(count + 1);
      }, refreshTime);
    } else {
      clearInterval(id);
    }
    return () => {
      clearInterval(id);
    };
  }, [count, loadingTrigger, loadingPause]);

  return stablePool;
};

export const useAllStablePools = () => {
  const [stablePools, setStablePools] = useState<Pool[]>();
  useEffect(() => {
    Promise.all(
      ALL_STABLE_POOL_IDS.map((id) => {
        return getStablePoolFromCache(id.toString());
      })
    ).then((res) => setStablePools(res.map((p) => p[0])));
  }, []);

  return stablePools;
};
