import { useEffect, useState, useCallback, useContext, useRef } from 'react';
import {
  calculateFairShare,
  percentLess,
  toPrecision,
  toNonDivisibleNumber,
  toReadableNumber,
} from '../utils/numbers';
import {
  getStakedListByAccountId,
  get_seed,
  list_seed_farms,
} from '../services/farm';
import {
  DEFAULT_PAGE_LIMIT,
  getAllWatchListFromDb,
  getCachedPoolsByTokenId,
  getPoolDetails,
  getPools,
  getSharesInPool,
  getTotalPools,
  parsePool,
  parsePoolNew,
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
  getTopPoolsByNewUI,
  getSearchResult,
  getPool,
  get24hVolumes,
  getV3PoolVolumeById,
  getAllV3Pool24Volume,
  getV3poolTvlById,
  getClassicPoolSwapRecentTransaction,
  ClassicPoolSwapTransaction,
  ClassicPoolLiquidtyRecentTransaction,
  getClassicPoolLiquidtyRecentTransaction,
  DCLPoolSwapTransaction,
  DCLPoolLiquidtyRecentTransaction,
  getDCLPoolSwapRecentTransaction,
  getDCLPoolLiquidtyRecentTransaction,
  getLimitOrderRecentTransaction,
  LimitOrderRecentTransaction,
  getDCLAccountFee,
  getDCLTopBinFee,
  getTokenPriceList,
  getIndexerStatus,
  getPoolsDetailByIds,
} from '../services/indexer';
import { parsePoolView, PoolRPCView } from '../services/api';
import {
  ftGetTokenMetadata,
  TokenMetadata,
  ftGetTokensMetadata,
} from '../services/ft-contract';
import { TokenBalancesView } from '../services/token';
import {
  shareToAmount,
  getAddLiquidityShares,
  getRemoveLiquidityByTokens,
} from '../services/stable-swap';
import { STABLE_LP_TOKEN_DECIMALS } from 'src/components/stableswap/AddLiquidity';
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
import { ONLY_ZEROS, scientificNotationToString } from '../utils/numbers';
import {
  getPoolsByTokensIndexer,
  getAllPoolsIndexer,
} from '../services/indexer';
import {
  getStablePoolFromCache,
  getRefPoolsByToken1ORToken2,
} from '../services/pool';
import Big from 'big.js';
import { getPoolFeeAprTitleRPCView } from '../pages/pools/MorePoolsPage';
import { PoolInfo, get_pool } from '../services/swapV3';
import { useTokenPriceList } from './token';
import { isStablePool } from '../services/near';
import { getStablePoolDecimal } from '../pages/stable/StableSwapEntry';
import {
  get_default_config_for_chart,
  get_custom_config_for_chart,
} from '../components/d3Chart/config';
import {
  IChartItemConfig,
  IChartConfig,
} from '../components/d3Chart/interfaces';
import { getPointByPrice, getPriceByPoint } from '../services/commonV3';
import { formatPercentage } from '../components/d3Chart/utils';
import { get_account, ILock } from '../services/lp-locker';
import { introCurrentPageStore } from '../stores/introCurrentPage';

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
  finalStakeList: Record<string, string>,
  stakeListDone: boolean
) => {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const [batchShares, setBatchShares] = useState<string[]>();
  const [batchFarmStake, setBatchFarmStake] = useState<(string | number)[]>();
  const [batchLpLocked, setBatchLpLocked] = useState<(string | number)[]>();
  const [sharesDone, setSharesDone] = useState<boolean>(false);
  const [accountLocked, setAccountLocked] = useState<Record<string, ILock>>();

  const getFarmStake = (pool_id: number) => {
    const farmStake = '0';

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
    if (isSignedIn) {
      get_account().then((locked) => {
        setAccountLocked(locked?.locked_tokens || {});
      });
    }
  }, [isSignedIn]);
  useEffect(() => {
    if (
      !ids ||
      !finalStakeList ||
      !isSignedIn ||
      !stakeListDone ||
      !accountLocked
    )
      return undefined;
    getShares();
  }, [
    ids?.join('-'),
    finalStakeList,
    isSignedIn,
    stakeListDone,
    accountLocked,
  ]);
  async function getShares() {
    const shareInPools = await Promise.all(
      ids.map((id) => getSharesInPool(Number(id)))
    );
    const shareInLocked = ids.map((id: string) => {
      const key = `${getConfig().REF_FI_CONTRACT_ID}@:${id}`;
      return accountLocked?.[key]?.locked_balance || '0';
    });
    const shareInFarms = ids.map((id) => getFarmStake(Number(id)));
    setBatchShares(shareInPools);
    setBatchFarmStake(shareInFarms);
    setBatchLpLocked(shareInLocked);
    setSharesDone(true);
  }
  return {
    sharesDone,
    shares: batchShares,
    batchTotalShares:
      ids?.map((id, index) => {
        return new Big(batchShares?.[index] || '0')
          .plus(new Big(batchFarmStake?.[index] || '0'))
          .plus(new Big(batchLpLocked?.[index] || '0'))
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
  const [stakeListDone, setStakeListDone] = useState<boolean>(false);

  useEffect(() => {
    if (!isSignedIn) return;
    getStakedListByAccountId({})
      .then(({ stakedList, finalStakeList, v2StakedList }) => {
        setStakeList(stakedList);
        setV2StakeList(v2StakedList);
        setFinalStakeList(finalStakeList);
        setStakeListDone(true);
      })
      .catch(() => {});
  }, [isSignedIn]);

  return {
    stakeList,
    v2StakeList,
    finalStakeList,
    stakeListDone,
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
  accumulate?: boolean;
  tokenName?: string;
  sortBy?: string;
  order?: string;
  getTopPoolsProps?: any;
}

export function useScrollToTopOnFirstPage() {
  const hasGuided = JSON.parse(localStorage.getItem('hasGuided'));

  const introRef = useRef(null);
  const { currentPage, hasLoaingOver } = introCurrentPageStore() as any;

  useEffect(() => {
    if (introRef.current && hasLoaingOver) {
      const rect = introRef.current.getBoundingClientRect();
      const offset = window.innerHeight / 2;
      const scrollTop = rect.top + window.pageYOffset - offset;

      window.scroll({
        top: scrollTop,
        behavior: 'smooth',
      });

      // introRef.current.scrollIntoView({
      //   behavior: 'smooth',
      // });
    }
  }, [currentPage, hasLoaingOver]); //
  //
  return { introRef, currentPage, hasGuided };
}

export const usePools = (props: {
  searchTrigger?: Boolean;
  tokenName?: string;
  sortBy?: string;
  order?: string;
  getTopPoolsProps?: any;
  activeTab?: any;
}) => {
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>([]);
  const [rawPools, setRawPools] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [cardLoading, setCardLoding] = useState(true);
  const [requestPoolList, setRequestPoolList] = useState<string[]>();

  const [shortSavePools, setShortSavePools] = useState([]);
  useEffect(() => {
    setPools([]);
    if (props.activeTab == 'v1') setLoading(true);
  }, [props.activeTab]);

  useEffect(() => {
    if (!loading && rawPools.length) {
      setRequestPoolList(
        rawPools.map((pool) => pool.id.toString()).concat(ALL_STABLE_POOL_IDS)
      );
    }
  }, [loading, rawPools.length]);

  const volumes = useDayVolumesPools(requestPoolList);

  const nextPage = () => setPage((page) => page + 1);

  function _loadPools({ getTopPoolsProps }: LoadPoolsOpts) {
    getSearchResult({ ...getTopPoolsProps, token_list: props.tokenName })
      .then(async (res) => {
        const pools =
          res.length > 0 ? res.map((item) => parsePoolNew(item)) : [];

        setShortSavePools(pools);

        // setHasMore(pools.length === DEFAULT_PAGE_LIMIT);

        setPools(pools);
      })
      .finally(() => {
        setLoading(false);
        setCardLoding(false);
      });
  }

  function _loadPoolsOri({
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
                tokenName,
                column: sortBy,
                order,
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
      .finally(() => {
        setLoading(false);
        setCardLoding(false);
      });
  }
  const loadPools = props.activeTab == 'v1' ? _loadPools : _loadPoolsOri;
  useEffect(() => {
    if (props.activeTab != 'v1') {
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
    }
  }, [props.sortBy, props.order, props.tokenName, rawPools]);

  useEffect(() => {
    if (props.activeTab == 'v1') {
      if (props.tokenName) {
        setCardLoding(true);
        getSearchResult({
          ...props.getTopPoolsProps,
          token_list: props.tokenName,
        })
          .then(async (res) => {
            const pools =
              res.length > 0 ? res.map((item) => parsePoolNew(item)) : [];
            setShortSavePools(pools);
            setHasMore(pools.length === DEFAULT_PAGE_LIMIT);
            setPools(pools);
          })
          .finally(() => {
            setLoading(false);
            setCardLoding(false);
          });
      } else {
        setCardLoding(true);
        loadPools({
          getTopPoolsProps: props.getTopPoolsProps,
        });
      }
    }
  }, [props.tokenName]);

  useEffect(() => {
    if (props.activeTab != 'v1') {
      setLoading(true);
      loadPools({
        accumulate: true,
        tokenName: props.tokenName,
        sortBy: props.sortBy,
        order: props.order,
      });
    }
  }, [page, props.activeTab]);

  useEffect(() => {
    if (props.activeTab == 'v1') {
      setCardLoding(true);
      loadPools({
        getTopPoolsProps: props.getTopPoolsProps,
      });
    }
  }, [
    props.getTopPoolsProps.farm,
    props.getTopPoolsProps.hide_low_pool,
    props.getTopPoolsProps.type,
    props.getTopPoolsProps.sort,
    props.getTopPoolsProps.order,
    props.getTopPoolsProps.order_by,
    props.getTopPoolsProps.offset,
    props.getTopPoolsProps.token_type,
  ]);
  return {
    pools,
    hasMore,
    nextPage,
    loading,
    volumes,
    cardLoading,
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

export const useMorePools = ({
  tokenIds,
  order,
  sortBy,
}: {
  tokenIds: string[];
  order: boolean | 'desc' | 'asc';
  sortBy: string;
}) => {
  const [morePools, setMorePools] = useState<any[]>();

  const { farmAprById, loadingSeedsDone } = useSeedFarmsByPools(morePools);

  useEffect(() => {
    getPoolsByTokensIndexer({
      token0: tokenIds[0],
      token1: tokenIds[1],
    }).then((res) => {
      // const orderedPools = orderBy(res, [sortBy], [order]);

      const parsedRes = res.map((p: PoolRPCView) => {
        return {
          ...p,
          tokenIds,
          fee: p.total_fee,
          shareSupply: p.shares_total_supply,
          supplies: p.token_account_ids.reduce(
            (acc: any, cur: any, i: number) => {
              return {
                ...acc,
                [cur]: p.amounts[i],
              };
            },
            {}
          ),
        };
      });

      setMorePools(parsedRes);
    });
  }, [tokenIds.join('-')]);

  useEffect(() => {
    if (!morePools || morePools.length === 0 || !loadingSeedsDone) return;

    get24hVolumes(morePools.map((pool) => pool.id.toString())).then((res) => {
      const volumePools = morePools.map((p, i) => {
        return {
          ...p,
          h24volume: res[i],
          baseApr: scientificNotationToString(
            getPoolFeeAprTitleRPCView(res[i], morePools[i]).toString()
          ),
          apr:
            getPoolFeeAprTitleRPCView(res[i], morePools[i]) +
            (farmAprById?.[p.id] || 0) * 100,
          farmApr: farmAprById?.[p.id] || 0,
        };
      });

      setMorePools(volumePools);
    });
  }, [
    (morePools || []).map((p) => p?.id).join('-'),
    loadingSeedsDone,
    farmAprById,
  ]);

  return !morePools
    ? null
    : orderBy(
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
  const [watchV2Pools, setWatchV2Pools] = useState<PoolInfo[]>([]);
  const [watchV2PoolsFinal, setWatchV2PoolsFinal] = useState<PoolInfo[]>([]);
  const tokenPriceList = useTokenPriceList();
  useEffect(() => {
    getAllWatchListFromDb({}).then((watchlist) => {
      setWatchList(_.orderBy(watchlist, 'update_time', 'desc'));
    });
  }, []);
  useEffect(() => {
    if (watchList.length == 0) return;
    const ids = watchList.map((watchedPool) => watchedPool.pool_id);
    if (ids.length === 0) return;
    const ids_v1: string[] = [];
    const ids_v2: string[] = [];
    ids.forEach((id) => {
      if (id.split('|').length == 3) {
        ids_v2.push(id);
      } else {
        ids_v1.push(id);
      }
    });
    if (ids_v1.length > 0) {
      //
      const knownPoolIds = new Set(ALL_STABLE_POOL_IDS);
      const knownIds_v1 = ids_v1.filter((id) => knownPoolIds.has(id));
      const unknownIds_v1 = ids_v1.filter((id) => !knownPoolIds.has(id));

      Promise.all([
        getPoolsByIds({ pool_ids: knownIds_v1 })
          .then((res) => {
            const resPools = res.map((pool) => parsePool(pool));

            return resPools;
          })
          .then((resPools) => {
            return Promise.all(
              resPools.map(async (p) => {
                return {
                  ...p,
                  metas: await ftGetTokensMetadata(p.tokenIds),
                };
              })
            );
          }),
        getSearchResult({
          onlyUseId: true,
          pool_id_list: unknownIds_v1.join(','),
        })
          .then((res) => {
            const resPools = res.map((pool) => parsePoolNew(pool));

            return resPools;
          })
          .then((resPools) => {
            return Promise.all(
              resPools.map(async (p) => {
                return {
                  ...p,
                  metas: await ftGetTokensMetadata(p.tokenIds),
                };
              })
            );
          }),
      ]).then(([res1, res2]) => {
        const allPools = [...res1, ...res2];
        setWatchPools(allPools);
      });
    }

    //
    if (ids_v2.length > 0) {
      getV2PoolsByIds(ids_v2).then((res: PoolInfo[]) => {
        setWatchV2Pools(
          res.filter((r) => {
            if (r) return true;
          })
        );
      });
    }
  }, [watchList]);
  useEffect(() => {
    if (watchV2Pools.length > 0 && Object.keys(tokenPriceList).length > 1) {
      getV2Poolsfinal();
    }
  }, [watchV2Pools, Object.keys(tokenPriceList).length]);

  async function getV2PoolsByIds(ids: string[]): Promise<PoolInfo[]> {
    const poolDetailPromise = ids.map((id) => {
      return get_pool(id);
    });
    const poolList_init = await Promise.all(poolDetailPromise);
    const poolList = poolList_init.filter((p: PoolInfo) => {
      if (p) return true;
    });
    const poolListPromise = poolList.map(async (pool: PoolInfo) => {
      const { token_x, token_y } = pool;
      const token_x_meta = await ftGetTokenMetadata(token_x);
      const token_y_meta = await ftGetTokenMetadata(token_y);
      pool.token_x_metadata = token_x_meta;
      pool.token_y_metadata = token_y_meta;
      return pool;
    });
    const poolListDealt = await Promise.all(poolListPromise);
    return poolListDealt;
  }
  function getV2Poolsfinal() {
    watchV2Pools.forEach((pool: PoolInfo) => {
      const { token_x, token_y } = pool;
      const pricex = tokenPriceList[token_x]?.price || 0;
      const pricey = tokenPriceList[token_y]?.price || 0;
      const { total_x, total_y, total_fee_x_charged, total_fee_y_charged } =
        pool;
      const totalX = new BigNumber(total_x)
        .minus(total_fee_x_charged)
        .toFixed();
      const totalY = new BigNumber(total_y)
        .minus(total_fee_y_charged)
        .toFixed();

      const tvlx =
        Number(toReadableNumber(pool.token_x_metadata.decimals, totalX)) *
        Number(pricex);
      const tvly =
        Number(toReadableNumber(pool.token_y_metadata.decimals, totalY)) *
        Number(pricey);
      pool.tvl = tvlx + tvly;
    });
    setWatchV2PoolsFinal(watchV2Pools);
  }
  return { watchPools, watchV2PoolsFinal, watchList };
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

export const useDayVolumesPools = (pool_ids: (string | number)[]) => {
  const [volumes, setVolumes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!pool_ids || pool_ids?.length === 0) return;

    get24hVolumes(pool_ids).then((res) => {
      const volumes = res.reduce((acc, cur, i) => {
        return { ...acc, [pool_ids[i]]: cur };
      }, {});

      setVolumes(volumes);
    });
  }, [pool_ids?.join('-')]);

  return volumes;
};

export const useDayVolume = (pool_id: string) => {
  const [dayVolume, setDayVolume] = useState<string>();
  useEffect(() => {
    get24hVolume(pool_id).then(setDayVolume);
  }, [pool_id]);
  return dayVolume;
};

export const useSeedDetail = (pool_id: string | number) => {
  const seed_id = getConfig().REF_FI_CONTRACT_ID + '@' + pool_id.toString();

  const [seedDetail, setSeedDetail] = useState<any>();

  useEffect(() => {
    get_seed(seed_id).then((res) => {
      setSeedDetail(res);
    });
  }, []);

  return seedDetail;
};

export const useSeedFarms = (pool_id: string | number) => {
  const [seedFarms, setSeedFarms] = useState<any>();

  const seed_id = getConfig().REF_FI_CONTRACT_ID + '@' + pool_id.toString();

  useEffect(() => {
    list_seed_farms(seed_id)
      .then(async (res) => {
        if (!res) return null;

        const parsedRes = res.filter((f: any) => f.status !== 'Ended');

        const noRunning = res.every((f: any) => f.status !== 'Running');

        if (!parsedRes || parsedRes.length === 0) {
          return;
        }

        return Promise.all(
          parsedRes
            // .filter((f: any) => noRunning || f.status === 'Running')
            .filter((f: any) => f.status != 'Ended')
            .map(async (farm: any) => {
              const token_meta_data = await ftGetTokenMetadata(
                farm.terms.reward_token
              );

              const daily_reward = farm.terms.daily_reward;

              const readableNumber = toReadableNumber(
                token_meta_data.decimals,
                daily_reward
              );

              const yearReward = Number(readableNumber) * 365;

              return {
                ...farm,
                token_meta_data,
                yearReward,
              };
            })
        );
      })
      .then(setSeedFarms);
  }, [pool_id]);

  return seedFarms;
};

export const useSeedFarmsByPools = (pools: Pool[]) => {
  const tokenPriceList = useTokenPriceList();

  const [loadingSeedsDone, setLoadingSeedsDone] = useState<boolean>(false);

  const [farmAprById, setFarmAprById] = useState<Record<string, number>>();

  useEffect(() => {
    const ids = pools?.map((p) => p.id);

    if (!ids || !tokenPriceList) return;

    const seeds = ids.map(
      (pool_id) => getConfig().REF_FI_CONTRACT_ID + '@' + pool_id.toString()
    );

    db.queryBoostSeedsBySeeds(seeds)

      .then(async (res) => {
        if (!res) return;

        const seedFarmsById = await Promise.all(
          Object.values(res).map((seed: any) => {
            if (!seed) return null;

            const parsedRes = seed.farmList.filter(
              (f: any) => f.status !== 'Ended'
            );

            const noRunning = seed.farmList.every(
              (f: any) => f.status !== 'Running'
            );

            if (!parsedRes || parsedRes.length === 0) {
              return null;
            }

            return Promise.all(
              parsedRes
                .filter((f: any) => noRunning || f.status === 'Running')
                .map(async (farm: any) => {
                  const token_meta_data = await ftGetTokenMetadata(
                    farm.terms.reward_token
                  );

                  const daily_reward = farm.terms.daily_reward;

                  const readableNumber = toReadableNumber(
                    token_meta_data.decimals,
                    daily_reward
                  );

                  const yearReward = Number(readableNumber) * 365;

                  return {
                    ...farm,
                    token_meta_data,
                    yearReward,
                  };
                })
            );
          })
        ).then((list) => {
          const seedFarmsById = list.reduce((acc, cur, i) => {
            return { ...acc, [Object.keys(res)[i]]: cur };
          }, {});

          return seedFarmsById;
        });

        return { seedFarmsById, cacheSeeds: res };
      })
      .then(
        async ({
          seedFarmsById,
          cacheSeeds,
        }: {
          seedFarmsById: Record<string, any>;
          cacheSeeds: Record<string, any>;
        }) => {
          if (!seedFarmsById || !cacheSeeds) return;

          const ARPs = await Promise.all(
            Object.values(seedFarmsById).map((farms: any, i: number) => {
              const seedDetail = Object.values(cacheSeeds)[i].seed;

              const poolId = Object.keys(cacheSeeds)[i].split('@')[1];
              const pool = pools.find((p) => p.id.toString() === poolId);
              let totalReward = 0;

              if (!farms) return 0;

              farms.forEach((farm: any) => {
                const reward_token_price = Number(
                  tokenPriceList?.[farm.token_meta_data.id]?.price || 0
                );

                totalReward =
                  totalReward + Number(farm.yearReward) * reward_token_price;
              });

              const poolShares = Number(
                toReadableNumber(
                  isStablePool(pool.id) ? getStablePoolDecimal(pool.id) : 24,
                  pool.shareSupply
                )
              );

              const seedTvl =
                !poolShares || !seedDetail
                  ? 0
                  : (Number(
                      toReadableNumber(
                        seedDetail.seed_decimal,
                        seedDetail.total_seed_power
                      )
                    ) *
                      (pool.tvl || 0)) /
                    poolShares;

              const baseAprAll = !seedTvl ? 0 : totalReward / seedTvl;

              return !pool.tvl || !seedDetail || !farms || !pool
                ? 0
                : baseAprAll;
            })
          );

          const returnAPRs = ARPs.reduce((acc, cur, i) => {
            return {
              ...acc,
              [Object.keys(seedFarmsById)[i].split('@')[1]]: cur,
            };
          }, {});

          setFarmAprById(returnAPRs);

          return returnAPRs;
        }
      )

      .finally(() => {
        setLoadingSeedsDone(true);
      });
  }, [pools?.map((p) => p.id).join('-'), tokenPriceList]);

  return {
    farmAprById,
    loadingSeedsDone,
  };
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

export const useV3VolumeChart = (pool_id: string) => {
  const [volumes, setVolumes] = useState<any[]>();
  useEffect(() => {
    getV3PoolVolumeById(pool_id)
      .then((res) => {
        res.forEach((p) => {
          p.volume_dollar = +p.volume;
        });
        res.sort((v1, v2) => {
          const b =
            new Date(v1.dateString).getTime() -
            new Date(v2.dateString).getTime();
          return b;
        });
        setVolumes(res);
      })
      .catch(() => {
        setVolumes([]);
      });
  }, []);
  return volumes;
};
export const useV3TvlChart = (pool_id: string) => {
  const [tvls, setTvls] = useState<any[]>();
  useEffect(() => {
    getV3poolTvlById(pool_id)
      .then((res) => {
        res.forEach((p) => {
          (p.total_tvl = +p.tvl || 0),
            (p.scaled_tvl = +p.tvl || 0),
            (p.date = p.dateString);
        });
        res.sort((t1, t2) => {
          return new Date(t1.date).getTime() - new Date(t2.date).getTime();
        });
        setTvls(res);
      })
      .catch(() => {
        setTvls([]);
      });
  }, []);
  return tvls;
};

export const useV3VolumesPools = () => {
  const [volumes, setVolumes] = useState<Record<string, string>>({});

  useEffect(() => {
    getAllV3Pool24Volume()
      .then((res) => {
        const result = {};
        res.forEach((v) => {
          const { pool_id, volume } = v;
          result[pool_id] = volume;
        });
        setVolumes(result);
      })
      .catch(() => {
        return {};
      });
  }, []);

  return volumes;
};

export const useClassicPoolTransaction = ({
  pool_id,
}: {
  pool_id: string | number;
}) => {
  const [swapRecent, setSwapRecent] = useState<ClassicPoolSwapTransaction[]>(
    []
  );

  const [lqRecent, setLqRecent] = useState<
    ClassicPoolLiquidtyRecentTransaction[]
  >([]);

  useEffect(() => {
    getClassicPoolSwapRecentTransaction({
      pool_id,
    }).then(setSwapRecent);

    getClassicPoolLiquidtyRecentTransaction({
      pool_id,
    }).then(setLqRecent);
  }, []);

  return { swapTransaction: swapRecent, liquidityTransactions: lqRecent };
};

export const useDCLPoolTransaction = ({
  pool_id,
}: {
  pool_id: string | number;
}) => {
  const [swapRecent, setSwapRecent] = useState<DCLPoolSwapTransaction[]>([]);

  const [lqRecent, setLqRecent] = useState<DCLPoolLiquidtyRecentTransaction[]>(
    []
  );

  const [limitOrderRecent, setLimitOrderRecent] = useState<
    LimitOrderRecentTransaction[]
  >([]);

  useEffect(() => {
    getDCLPoolSwapRecentTransaction({
      pool_id,
    }).then(setSwapRecent);

    getDCLPoolLiquidtyRecentTransaction({
      pool_id,
    }).then(setLqRecent);

    getLimitOrderRecentTransaction({
      pool_id,
    }).then(setLimitOrderRecent);
  }, []);

  return {
    swapTransactions: swapRecent,
    liquidityTransactions: lqRecent,
    limitOrderTransactions: limitOrderRecent,
  };
};

export const useDCLTopBinFee = ({
  pool,
  way,
}: {
  pool: PoolInfo;
  way?: 'value' | 'display';
}) => {
  const [topBinApr, setTopBinApr] = useState<string>('-');
  useEffect(() => {
    if (!pool) return;
    const [bin, start_point, end_point] = get_config_of_dcl_pool(pool);
    getDCLTopBinFee({
      pool_id: pool.pool_id,
      bin,
      start_point,
      end_point,
    }).then((res) => {
      if (!res || ONLY_ZEROS.test(res.total_liquidity)) return;
      const apr = new Big(res.total_fee)
        .div(res.total_liquidity)
        .mul(365)
        .mul(100)
        .toFixed();
      const apr_display = formatPercentage(apr);
      if (way == 'value') {
        setTopBinApr(apr);
      } else {
        setTopBinApr(apr_display);
      }
    });
  }, [pool]);

  return topBinApr;
};

function get_config_of_dcl_pool(pool: PoolInfo) {
  const pool_id = pool.pool_id;
  const { bin, rangeGear } = get_default_config_for_chart() as IChartItemConfig;
  const custom_config: IChartConfig = get_custom_config_for_chart();
  const bin_final = custom_config[pool_id]?.bin || bin;
  const rangeGear_final = custom_config[pool_id]?.rangeGear || rangeGear;
  const [price_l, price_r] = get_price_range_by_percent(
    rangeGear_final[0],
    pool
  );
  const point_l = get_point_by_price(price_l, pool);
  const point_r = get_point_by_price(price_r, pool);
  return [bin_final, point_l, point_r];
}

function get_price_range_by_percent(
  percent: number,
  pool: PoolInfo
): [string, string] {
  const { current_point } = pool;
  const p_l_r = percent / 100;
  const price = get_price_by_point(current_point, pool);
  const price_l_temp = Big(1 - p_l_r).mul(price);
  const price_l = price_l_temp.lt(0) ? '0' : price_l_temp.toFixed();
  const price_r = Big(1 + p_l_r)
    .mul(price)
    .toFixed();

  return [price_l, price_r];
}
function get_price_by_point(point: number, pool: PoolInfo) {
  const { token_x_metadata, token_y_metadata } = pool;
  const decimalRate_point =
    Math.pow(10, token_x_metadata.decimals) /
    Math.pow(10, token_y_metadata.decimals);
  const price = getPriceByPoint(point, decimalRate_point);
  return price;
}
function get_point_by_price(price: string, pool: PoolInfo) {
  const { point_delta, token_x_metadata, token_y_metadata } = pool;
  const decimalRate_point =
    Math.pow(10, token_y_metadata.decimals) /
    Math.pow(10, token_x_metadata.decimals);
  const point = getPointByPrice(point_delta, price, decimalRate_point);
  return point;
}
export const useIndexerStatus = (dep?: any) => {
  const [indexerStatus, setIndexerStatus] = useState<boolean>();

  useEffect(() => {
    getIndexerStatus()
      .then((res) => {
        setIndexerStatus(!!res);
      })
      .catch(() => {
        setIndexerStatus(false);
      });
  }, []);

  return {
    fail: typeof indexerStatus === 'boolean' && !indexerStatus,
  };
};
