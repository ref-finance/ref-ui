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
import { getCurrentWallet, WalletContext } from '../utils/wallets-integration';
import getConfig from '../services/config';
import { useFarmStake } from './farm';
import { ONLY_ZEROS } from '../utils/numbers';
import {
  getPoolsByTokensIndexer,
  getAllPoolsIndexer,
} from '../services/indexer';
import {
  getStablePoolFromCache,
  getRefPoolsByToken1ORToken2,
} from '../services/pool';
import Big from 'big.js';
const REF_FI_STABLE_POOL_INFO_KEY = `REF_FI_STABLE_Pool_INFO_VALUE_${
  getConfig().STABLE_POOL_ID
}`;

export const usePoolUserTotalShare = (id: string | number) => {
  const shares = usePoolShareRaw(id.toString());
  const { stakeList, v2StakeList, finalStakeList } = useStakeListByAccountId();

  const farmStake = useFarmStake({
    poolId: Number(id),
    stakeList: finalStakeList,
  });

  const userTotalShare = BigNumber.sum(shares, farmStake);

  return userTotalShare.toNumber();
};

export const useBatchTotalShares = (
  ids: (string | number)[],
  finalStakeList: Record<string, string>
) => {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [batchShares, setBatchShares] = useState<string[]>();

  const [batchFarmStake, setBatchFarmStake] = useState<(string | number)[]>();

  const getFarmStake = (pool_id: number) => {
    let farmStake = '0';

    const seedIdList: string[] = Object.keys(finalStakeList);
    let tempFarmStake: string | number = '0';
    seedIdList.forEach((seed) => {
      const id = Number(seed.split('@')[1]);
      if (id == pool_id) {
        tempFarmStake = BigNumber.sum(
          farmStake,
          finalStakeList[seed]
        ).valueOf();
      }
    });

    return tempFarmStake;
  };

  useEffect(() => {
    if (!ids || !finalStakeList || !isSignedIn) return undefined;

    Promise.all(ids.map((id) => getSharesInPool(Number(id)))).then(
      setBatchShares
    );

    Promise.all(ids.map((id) => getFarmStake(Number(id)))).then(
      setBatchFarmStake
    );
  }, [ids?.join('-'), finalStakeList, isSignedIn]);

  return {
    shares: batchShares,
    batchTotalShares:
      ids?.map((id, index) => {
        return new Big(batchShares?.[index] || '0')
          .plus(new Big(batchFarmStake?.[index] || '0'))
          .toNumber();
      }) || undefined,
  };
};

export const useStakeListByAccountId = () => {
  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  const [v2StakeList, setV2StakeList] = useState<Record<string, string>>({});

  const [finalStakeList, setFinalStakeList] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    if (!isSignedIn) return;
    getStakedListByAccountId({})
      .then(({ stakedList, finalStakeList, v2StakedList }) => {
        setStakeList(stakedList);
        setV2StakeList(v2StakedList);
        setFinalStakeList(finalStakeList);
      })
      .catch(() => {});
  }, [isSignedIn]);

  return {
    stakeList,
    v2StakeList,
    finalStakeList,
  };
};

export const usePool = (id: number | string) => {
  const { globalState } = useContext(WalletContext);

  const isSignedIn = globalState.isSignedIn;

  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>('0');
  const [stakeList, setStakeList] = useState<Record<string, string>>({});
  const [v2StakeList, setV2StakeList] = useState<Record<string, string>>({});

  const [finalStakeList, setFinalStakeList] = useState<Record<string, string>>(
    {}
  );

  useEffect(() => {
    getPoolDetails(Number(id)).then(setPool);
    getSharesInPool(Number(id))
      .then(setShares)
      .catch(() => setShares);

    getStakedListByAccountId({})
      .then(({ stakedList, finalStakeList, v2StakedList }) => {
        setStakeList(stakedList);
        setV2StakeList(v2StakedList);
        setFinalStakeList(finalStakeList);
      })
      .catch(() => {});
  }, [id, isSignedIn]);

  return {
    pool,
    shares,
    stakeList,
    v2StakeList,
    finalStakeList,
  };
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

export const usePoolsMorePoolIds = () => {
  // top pool id to more pool ids:Array
  const [poolsMorePoolIds, setMorePoolIds] = useState<Record<string, string[]>>(
    {}
  );

  const getAllPoolsTokens = async () => {
    return await getAllPoolsIndexer();
  };

  useEffect(() => {
    getAllPoolsTokens().then((res) => {
      const poolsMorePoolIds = res.map((p) => {
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
          [res[i].id.toString()]: cur,
        };
      }, {});

      setMorePoolIds(parsedIds);
    });
  }, []);

  return poolsMorePoolIds;
};

export const useMorePools = ({
  tokenIds,
  order,
  sortBy,
}: {
  tokenIds: string[];
  order: boolean | 'desc' | 'asc';
  sortBy: string;
}) => {
  const [morePools, setMorePools] = useState<PoolRPCView[]>();
  useEffect(() => {
    getPoolsByTokensIndexer({
      token0: tokenIds[0],
      token1: tokenIds[1],
    }).then((res) => {
      // const orderedPools = orderBy(res, [sortBy], [order]);
      setMorePools(res);
    });
  }, [order, sortBy]);

  return orderBy(
    morePools?.map((p) => ({
      ...p,
      tvl: Number(p.tvl),
    })),
    [sortBy],
    [order]
  );
};

export const usePoolsFarmCount = ({
  morePoolIds,
}: {
  morePoolIds: string[];
}) => {
  const [poolsFarmCountv1, setPoolsFarmCountv1] = useState<
    Record<string, number>
  >({});

  const [poolsFarmCountv2, setPoolsFarmCountv2] = useState<
    Record<string, number>
  >({});

  const getFarms = async () => {
    return (await db.queryFarms()).filter((farm) => farm.status !== 'Ended');
  };

  const getBoostFarms = async () => {
    return (await db.queryBoostFarms()).filter(
      (farm) => farm.status !== 'Ended'
    );
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

      setPoolsFarmCountv1(parsedCounts);
    });
  }, [morePoolIds?.join('-')]);

  useEffect(() => {
    if (!morePoolIds) return;
    getBoostFarms().then((res) => {
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

      setPoolsFarmCountv2(parsedCounts);
    });
  }, [morePoolIds?.join('-')]);

  const poolsFarmCount = morePoolIds?.reduce((acc, cur, i) => {
    return {
      ...acc,
      [cur]:
        poolsFarmCountv2[cur] > 0
          ? poolsFarmCountv2[cur]
          : poolsFarmCountv1[cur],
    };
  }, {});

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
    return tokenAmounts.every((amount) => ONLY_ZEROS.test(amount));
  };

  useEffect(() => {
    if (zeroValidae()) {
      setPredictedShares('0');
      return;
    }
    getAddLiquidityShares(
      poolId,
      tokenAmounts.map((amount) => amount || '0'),
      stablePool
    )
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
      const burn_shares = getRemoveLiquidityByTokens(
        amounts.map((amount) => amount || '0'),
        stablePool
      );

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

export const useYourliquidity = (poolId: number) => {
  const { pool, shares, stakeList, v2StakeList, finalStakeList } =
    usePool(poolId);

  const farmStakeV1 = useFarmStake({ poolId, stakeList });
  const farmStakeV2 = useFarmStake({ poolId, stakeList: v2StakeList });
  const farmStakeTotal = useFarmStake({ poolId, stakeList: finalStakeList });

  const userTotalShare = BigNumber.sum(shares, farmStakeTotal);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  return {
    pool,
    shares,
    stakeList,
    v2StakeList,
    finalStakeList,
    farmStakeTotal,
    farmStakeV1,
    farmStakeV2,
    userTotalShare,
    userTotalShareToString,
  };
};

export const usePoolShareRaw = (id: string | number) => {
  const [myPoolShare, setMyPoolShare] = useState<string>('0');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    if (!isSignedIn) return;
    getSharesInPool(Number(id)).then((res) => {
      setMyPoolShare(res);
    });
  }, [isSignedIn]);

  return myPoolShare;
};

export const usePoolShare = (id: string | number, decimalLimit?: number) => {
  const [myPoolShare, setMyPoolShare] = useState<string>('0');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    if (!isSignedIn) return;
    getSharesInPool(Number(id)).then((res) => {
      setMyPoolShare(toReadableNumber(24, res));
    });
  }, [isSignedIn]);

  if (!decimalLimit) {
    return myPoolShare;
  } else {
    return ONLY_ZEROS.test(toNonDivisibleNumber(decimalLimit, myPoolShare))
      ? '0'
      : myPoolShare;
  }
};
