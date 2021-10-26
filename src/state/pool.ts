import { useEffect, useState } from 'react';
import { calculateFairShare, percentLess, toPrecision } from '../utils/numbers';
import {
  DEFAULT_PAGE_LIMIT,
  getAllPoolsFromDb,
  getAllWatchListFromDb,
  getCachedPoolsByTokenId,
  getPoolDetails,
  getPools,
  getSharesInPool,
  getTotalPools,
  Pool,
  PoolDetails,
  removeLiquidityFromPool,
} from '../services/pool';
import { PoolDb, WatchList } from '~store/RefDatabase';

import { useWhitelistTokens } from './token';
import _, { debounce, orderBy } from 'lodash';
import { getPoolsByIds } from '~services/indexer';
import { PoolRPCView } from '~services/api';

export const usePool = (id: number | string) => {
  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>();

  useEffect(() => {
    getPoolDetails(Number(id)).then(setPool);
    getSharesInPool(Number(id)).then(setShares);
  }, []);

  return { pool, shares };
};

export const usePools = (props: {
  tokenName?: string;
  sortBy?: string;
  order?: string;
}) => {
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(false);
  const [pools, setPools] = useState<Pool[]>([]);

  const tokens = useWhitelistTokens();
  const tokenIds = tokens?.map((t) => t.id);

  const nextPage = () => setPage((page) => page + 1);

  function _loadPools(accumulate = true) {
    getPools({
      page,
      tokenName: props.tokenName,
      column: props.sortBy,
      order: props.order,
    }).then((pools) => {
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
    });
  }

  const loadPools = debounce(_loadPools, 500);

  useEffect(() => {
    loadPools(false);
  }, [props.tokenName]);

  useEffect(() => {
    loadPools(false);
  }, [props.sortBy, props.order]);

  useEffect(() => {
    loadPools();
  }, [page]);

  return {
    pools,
    hasMore,
    nextPage,
  };
};

export const useMorePoolIds = (props: { topPool: Pool }) => {
  const { topPool } = props;
  // const tokenId1 = topPool.tokenIds[0]
  // const tokenId2 = topPool.tokenIds[1]

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
      setWatchList(watchlist);
    });
  }, []);

  return watchList
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
