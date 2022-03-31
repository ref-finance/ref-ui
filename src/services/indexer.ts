import getConfig from './config';
import { wallet, filterBlackListPools, POOLS_BLACK_LIST } from './near';
import _ from 'lodash';
import { parsePoolView, PoolRPCView, getCurrentUnixTime } from './api';
import moment from 'moment/moment';
import { parseAction } from '../services/transaction';
import { volumeType, TVLType } from '~state/pool';
import db from '../store/RefDatabase';
import { getCurrentWallet } from '../utils/sender-wallet';
import { getPoolsByTokens } from './pool';
const config = getConfig();

export const getPoolMonthVolume = async (
  pool_id: string
): Promise<volumeType[]> => {
  return await fetch(config.sodakiApiUrl + `/pool/${pool_id}/volume`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((monthVolume) => {
      return monthVolume.slice(0, 60);
    });
};

export const getPoolMonthTVL = async (pool_id: string): Promise<TVLType[]> => {
  return await fetch(config.sodakiApiUrl + `/pool/${pool_id}/tvl`, {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((monthTVL) => {
      return monthTVL.slice(0, 60);
    });
};

export const get24hVolume = async (pool_id: string): Promise<string> => {
  return await fetch(
    config.sodakiApiUrl + `/pool/${pool_id}/rolling24hvolume/sum`,
    {
      method: 'GET',
    }
  )
    .then((res) => res.json())
    .then((monthTVL) => {
      return monthTVL.toString();
    });
};

const parseActionView = async (action: any) => {
  const data = await parseAction(action[3], action[4], action[2]);
  return {
    datetime: moment.unix(action[0] / 1000000000),
    txUrl: config.explorerUrl + '/transactions/' + action[1],
    data: data,
    // status: action[5] === 'SUCCESS_VALUE',
    status: action[6] && action[6].indexOf('SUCCESS') > -1,
  };
};

export const getYourPools = async (): Promise<PoolRPCView[]> => {
  return await fetch(
    config.indexerUrl +
      '/liquidity-pools/' +
      getCurrentWallet().wallet.getAccountId(),
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((pools) => {
      return pools;
    });
};

export const getTopPools = async (): Promise<PoolRPCView[]> => {
  try {
    let pools;

    if (await db.checkTopPools()) {
      pools = await db.queryTopPools();
    } else {
      pools = await fetch(config.indexerUrl + '/list-top-pools', {
        method: 'GET',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      }).then((res) => res.json());

      const blackListPools = await getPool(POOLS_BLACK_LIST[0].toString());

      const blacklistTokenIn = blackListPools.token_account_ids[0];

      const blacklistTokenOut = blackListPools.token_account_ids[1];

      const twoTokenStablePoolIds = (
        await db.getPoolsByTokens(blacklistTokenIn, blacklistTokenOut)
      ).map((p) => p.id.toString());

      const twoTokenStablePools = await getPoolsByIds({
        pool_ids: twoTokenStablePoolIds,
      });

      if (twoTokenStablePools?.length > 0) {
        pools.push(_.maxBy(twoTokenStablePools, (p) => p.tvl));
      }

      await db.cacheTopPools(pools);
    }

    pools = pools.map((pool: any) => parsePoolView(pool));
    return pools
      .filter((pool: { token_account_ids: string | any[] }) => {
        return pool.token_account_ids.length < 3;
      })
      .filter(filterBlackListPools);
  } catch (error) {
    console.log(error);
    return [];
  }
};

export const getPool = async (pool_id: string): Promise<PoolRPCView> => {
  return await fetch(config.indexerUrl + '/get-pool?pool_id=' + pool_id, {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((pool) => {
      return parsePoolView(pool);
    });
};

export const getPoolsByIds = async ({
  pool_ids,
}: {
  pool_ids: string[];
}): Promise<PoolRPCView[]> => {
  const ids = pool_ids.join('|');
  return fetch(config.indexerUrl + '/list-pools-by-ids?ids=' + ids, {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((pools) => {
      pools = pools.map((pool: any) => parsePoolView(pool));
      return pools;
    })
    .catch(() => {
      return [];
    });
};

export const getTokenPriceList = async (): Promise<any> => {
  return await fetch(config.indexerUrl + '/list-token-price', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((list) => {
      return list;
    });
};

export const _search = (args: any, pools: PoolRPCView[]) => {
  if (args.tokenName === '') return pools;
  return _.filter(pools, (pool: PoolRPCView) => {
    return (
      _.includes(
        pool.token_symbols[0].toLowerCase(),
        args.tokenName.toLowerCase()
      ) ||
      _.includes(
        pool.token_symbols[1].toLowerCase(),
        args.tokenName.toLowerCase()
      )
    );
  });
};

export const _order = (args: any, pools: PoolRPCView[]) => {
  let column = args.column || 'tvl';
  let order = args.order || 'desc';
  column = args.column === 'fee' ? 'total_fee' : column;
  return _.orderBy(pools, [column], [order]);
};

const _pagination = (args: any, pools: PoolRPCView[]) => {
  return _.slice(
    pools,
    (args.page - 1) * args.perPage,
    args.page * args.perPage
  );
};

export type ActionData = Awaited<ReturnType<typeof parseActionView>>;

type Awaited<T> = T extends Promise<infer P> ? P : never;

export const getLatestActions = async (): Promise<Array<ActionData>> => {
  return await fetch(
    config.indexerUrl +
      '/latest-actions/' +
      getCurrentWallet().wallet.getAccountId(),
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((items) => {
      const tasks = items.map(async (item: any) => await parseActionView(item));

      return Promise.all(tasks);
    });
};
