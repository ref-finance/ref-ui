import { useEffect, useState, useCallback } from 'react';
import {
  calculateFairShare,
  percentLess,
  toPrecision,
  toNonDivisibleNumber,
  toReadableNumber,
  scientificNotationToString,
} from '../utils/numbers';
import { getStakedListByAccountId } from '~services/farm';
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
} from '../services/pool';
import db, { PoolDb, WatchList } from '~store/RefDatabase';

import { useWhitelistTokens } from './token';
import _, { countBy, debounce, min, orderBy } from 'lodash';
import {
  getPoolMonthVolume,
  getPoolMonthTVL,
  getPoolsByIds,
  get24hVolume,
} from '~services/indexer';
import { parsePoolView, PoolRPCView } from '~services/api';
import { TokenMetadata } from '~services/ft-contract';
import { TokenBalancesView } from '~services/token';
import {
  shareToAmount,
  getAddLiquidityShares,
  getRemoveLiquidityByTokens,
} from '~services/stable-swap';
import { STABLE_LP_TOKEN_DECIMALS } from '~components/stableswap/AddLiquidity';
import BigNumber from 'bignumber.js';
import moment from 'moment';
import { POOL_TOKEN_REFRESH_INTERVAL, STABLE_POOL_ID } from '~services/near';
const REF_FI_STABLE_Pool_INFO_KEY = 'REF_FI_STABLE_Pool_INFO_VALUE';

export const usePool = (id: number | string) => {
  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>('0');
  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  useEffect(() => {
    getPoolDetails(Number(id)).then(setPool);
    getSharesInPool(Number(id))
      .then(setShares)
      .catch(() => setShares);

    getStakedListByAccountId({})
      .then((stakeList) => {
        setStakeList(stakeList);
      })
      .catch(() => {});
  }, [id]);

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
  const [loading, setLoading] = useState(false);

  const tokens = useWhitelistTokens();
  const tokenIds = tokens?.map((t) => t.id);

  const nextPage = () => setPage((page) => page + 1);

  function _loadPools({
    accumulate = true,
    tokenName,
    sortBy,
    order,
  }: LoadPoolsOpts) {
    getPools({
      page,
      tokenName: tokenName,
      column: sortBy,
      order: order,
    })
      .then((pools) => {
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

  // const loadPools = debounce(_loadPools, 500);

  useEffect(() => {
    setLoading(true);
    loadPools({
      accumulate: false,
      tokenName: props.tokenName,
      sortBy: props.sortBy,
      order: props.order,
    });
  }, [props.searchTrigger]);

  useEffect(() => {
    setLoading(true);
    loadPools({
      accumulate: false,
      tokenName: props.tokenName,
      sortBy: props.sortBy,
      order: props.order,
    });
  }, [props.sortBy, props.order]);

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

export const useMorePoolIds = (props: { topPool: Pool }) => {
  const { topPool } = props;

  const [token1Id, token2Id] = topPool.tokenIds;

  const [ids, setIds] = useState<string[]>();

  useEffect(() => {
    getCachedPoolsByTokenId({
      token1Id,
      token2Id,
    }).then((res) => {
      const idsFromCachePools: string[] = res.map((p) => {
        return p.id.toString();
      });
      setIds(idsFromCachePools);
    });
  }, [topPool?.id]);
  return ids;
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
  tokens,
  poolId,
  firstTokenAmount,
  secondTokenAmount,
  thirdTokenAmount,
  stablePool,
}: {
  poolId: number;
  tokens: TokenMetadata[];
  firstTokenAmount: string;
  secondTokenAmount: string;
  thirdTokenAmount: string;
  stablePool: StablePool;
}) => {
  const [predicedShares, setPredictedShares] = useState<string>('0');

  const zeroValidae = () => {
    return (
      Number(firstTokenAmount) > 0 ||
      Number(secondTokenAmount) > 0 ||
      Number(thirdTokenAmount) > 0
    );
  };

  useEffect(() => {
    if (!zeroValidae()) {
      setPredictedShares('0');
      return;
    }

    const calcShares = getAddLiquidityShares(
      poolId,
      [firstTokenAmount, secondTokenAmount, thirdTokenAmount],
      stablePool
    );
    setPredictedShares(calcShares);
  }, [firstTokenAmount, secondTokenAmount, thirdTokenAmount]);

  return predicedShares;
};

export const usePredictRemoveShares = ({
  pool_id,
  amounts,
  tokens,
  setError,
  shares,
  stablePool,
}: {
  pool_id: number;
  amounts: string[];
  tokens: TokenMetadata[];
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
}: {
  loadingTrigger: boolean;
  setLoadingTrigger: (mode: boolean) => void;
}) => {
  const [stablePool, setStablePool] = useState<StablePool>();
  const [count, setCount] = useState(0);
  const refreshTime = Number(POOL_TOKEN_REFRESH_INTERVAL) * 1000;
  useEffect(() => {
    getStablePool(Number(STABLE_POOL_ID)).then((res) => {
      setStablePool(res);
      localStorage.setItem(REF_FI_STABLE_Pool_INFO_KEY, JSON.stringify(res));
    });
  }, [count, loadingTrigger]);

  useEffect(() => {
    let id: any = null;
    if (!loadingTrigger) {
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
  }, [count, loadingTrigger]);

  return stablePool;
};
