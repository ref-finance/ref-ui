import getConfig from './config';
import {
  wallet,
  isStablePool,
  STABLE_TOKEN_USN_IDS,
  AllStableTokenIds,
  CUSDIDS,
  BTCIDS,
} from './near';
import _ from 'lodash';
import { parsePoolView, PoolRPCView, getCurrentUnixTime } from './api';
import moment from 'moment/moment';
import { parseAction } from '../services/transaction';
import { volumeType, TVLType } from '~state/pool';
import db from '../store/RefDatabase';
import { getCurrentWallet } from '../utils/wallets-integration';
import { parsePool } from './pool';
import {
  filterBlackListPools,
  ALL_STABLE_POOL_IDS,
  STABLE_POOL_ID,
} from './near';

import { getPool as getPoolRPC } from '../services/pool';
import { BLACKLIST_POOL_IDS } from './near';
import { TokenMetadata } from './ft-contract';

const config = getConfig();

const genUrlParams = (props: Record<string, string | number>) => {
  return Object.keys(props)
    .map((key) => key + '=' + props[key])
    .join('&');
};

export const getPoolsByTokensIndexer = async ({
  token0,
  token1,
}: {
  token0: string;
  token1: string;
}) => {
  const res1 = await fetch(
    config.indexerUrl +
      `/list-pools-by-tokens?token0=${token0}&token1=${token1}`,
    {
      method: 'GET',
    }
  ).then((res) => res.json());

  if (res1?.code === -1 && res1?.data === null) return [];

  return res1.filter(
    (p: any) => !isStablePool(p.id) && !BLACKLIST_POOL_IDS.includes(p.id)
  );
};

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

export interface OrderTxType {
  order_id: string;
  tx_id: string | null;
}

export const getHistoryOrder = async (
  account_id: string
): Promise<OrderTxType[]> => {
  return await fetch(
    config.indexerUrl + `/get-limit-order-log-by-account/${account_id}`,
    {
      method: 'GET',
    }
  ).then((res) => res.json());
};
export interface HistoryOrderSwapInfo {
  tx_id: string;
  token_in: string;
  token_out: string;
  pool_id: string;
  point: string;
  amount_in: string;
  amount_out: string;
  timestamp: string;
}

interface TokenFlow {
  token_pair: string;
  grade: string;
  pool_ids: string[];
  token_in: string;
  token_out: string;
  final_ratio: number;
  amount: number;
  swap_amount: number;
  all_tokens: string[];
  all_pool_fees: number[];
  swap_ratio: number;
  timestamp: string;
}

export const getTokenFlow = async ({
  tokenInAmount,
  tokenInId,
  tokenOutId,
  ledger,
}: {
  tokenInId: string;
  tokenOutId: string;
  tokenInAmount: string;
  ledger: boolean;
}): Promise<TokenFlow[]> => {
  const token_pair: string = tokenInId + '->' + tokenOutId;

  const swap_amount: string = tokenInAmount;

  return await fetch(
    config.indexerUrl +
      `/get-token-flow?token_pair=${token_pair}&swap_amount=${swap_amount}&ledger=${
        ledger ? 'one' : 'all'
      }`,
    {
      method: 'GET',
    }
  ).then((res) => res.json());
};

export const getHistoryOrderSwapInfo = async (
  account_id: string
): Promise<HistoryOrderSwapInfo[]> => {
  return await fetch(
    config.indexerUrl + `/get-limit-order-swap-by-account/${account_id}`,
    {
      method: 'GET',
    }
  ).then((res) => res.json());
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

export const get24hVolumes = async (
  pool_ids: (string | number)[]
): Promise<string[]> => {
  return await fetch(
    config.sodakiApiUrl +
      `/poollist/${pool_ids.join('|')}/rolling24hvolume/sum`,
    {
      method: 'GET',
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res.map((r: any) => r.toString());
    });
};

const parseActionView = async (action: any) => {
  const data = await parseAction(action[3], action[4], action[2]);
  return {
    datetime: moment.unix(action[0] / 1000000000),
    txUrl: config.explorerUrl + '/txns/' + action[1],
    data: data,
    // status: action[5] === 'SUCCESS_VALUE',
    status: action[6] && action[6].indexOf('SUCCESS') > -1,
  };
};

export const getYourPools = async (): Promise<PoolRPCView[]> => {
  return await fetch(
    config.indexerUrl +
      '/liquidity-pools/' +
      getCurrentWallet()?.wallet?.getAccountId(),
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

export const getTopPoolsIndexer = async () => {
  return await fetch(config.indexerUrl + '/list-top-pools', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((poolList) => {
      return poolList.map((p: any) => parsePool(p));
    });
};

export const getTopPoolsIndexerRaw = async () => {
  return await fetch(config.indexerUrl + '/list-top-pools', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  }).then((res) => res.json());
};

export const getTopPools = async (): Promise<PoolRPCView[]> => {
  try {
    let pools: any;

    if (await db.checkTopPools()) {
      pools = await db.queryTopPools();
    } else {
      pools = await fetch(config.indexerUrl + '/list-top-pools', {
        method: 'GET',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      }).then((res) => res.json());

      // include non-stable pools on top pool list
      // TODO:

      await Promise.all(
        ALL_STABLE_POOL_IDS.concat(BLACKLIST_POOL_IDS)
          .filter((id) => Number(id) !== Number(STABLE_POOL_ID))
          .filter((_) => _)
          .map(async (id) => {
            const pool = await getPoolRPC(Number(id));

            const ids = pool.tokenIds;

            const twoTokenStablePoolIds = (
              await getPoolsByTokensIndexer({
                token0: ids[0],
                token1: ids[1],
              })
            ).map((p: any) => p.id.toString());

            const twoTokenStablePools = await getPoolsByIds({
              pool_ids: twoTokenStablePoolIds,
            });

            if (twoTokenStablePools.length > 0) {
              const maxTVLPool = _.maxBy(twoTokenStablePools, (p) => p.tvl);

              if (
                pools.find(
                  (pool: any) => Number(pool.id) === Number(maxTVLPool.id)
                )
              )
                return;

              pools.push(_.maxBy(twoTokenStablePools, (p) => p.tvl));
            }
          })
      );

      await db.cacheTopPools(pools);
    }

    pools = pools.map((pool: any) => parsePoolView(pool));

    return pools
      .filter((pool: { token_account_ids: string | any[]; id: any }) => {
        return !isStablePool(pool.id) && pool.token_account_ids.length < 3;
      })
      .filter(filterBlackListPools);
  } catch (error) {
    return [];
  }
};

export const getAllPoolsIndexer = async (amountThresh?: string) => {
  const rawRes = await fetch(
    config.indexerUrl +
      `/list-pools?${amountThresh ? `amounts=${amountThresh}` : ''}`,
    {
      method: 'GET',
    }
  ).then((res) => res.json());

  return rawRes.map((r: any) => parsePool(r));
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
const parsePoolTxTimeStamp = (ts: string) => {
  return moment(Math.floor(Number(ts) / 1000000)).format('YYYY-MM-DD HH:mm:ss');
};

export interface ClassicPoolSwapTransaction {
  token_in: string;
  token_out: string;
  swap_in: string;
  swap_out: string;
  timestamp: string;
  tx_id: string;
}

export const getClassicPoolSwapRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-swap?${paramString}`,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((res: ClassicPoolSwapTransaction[]) => {
      return res.map((tx) => {
        return {
          ...tx,
          timestamp: parsePoolTxTimeStamp(tx.timestamp),
        };
      });
    });
};

export interface DCLPoolSwapTransaction {
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  timestamp: string;
  tx_id: string;
}

export const getDCLPoolSwapRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-dcl-swap?${paramString}`,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((res: DCLPoolSwapTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export interface ClassicPoolLiquidtyRecentTransaction {
  method_name: string;
  timestamp: string;
  token_in: string;
  token_out: string;
  amount_in: string;
  amount_out: string;
  tx_id: string;
  shares?: string;
  pool_id?: string;
  amounts?: string;
}

export const getClassicPoolLiquidtyRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-liquidity?${paramString}`,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((res: ClassicPoolLiquidtyRecentTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export interface DCLPoolLiquidtyRecentTransaction {
  method_name: string;
  amount_x: string;
  amount_y: string;
  timestamp: string;
  tx_id: string;
}

export const getDCLPoolLiquidtyRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-dcl-liquidity?${paramString}`,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((res: DCLPoolLiquidtyRecentTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export interface LimitOrderRecentTransaction {
  method_name: string;
  timestamp: string;
  amount: string;
  tx_id: string;
  point: string;
  sell_token: string;
}

export const getLimitOrderRecentTransaction = async (props: {
  pool_id: string | number;
}) => {
  const paramString = genUrlParams(props);

  return await fetch(
    config.indexerUrl + `/get-recent-transaction-limit-order?${paramString}`,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((res: LimitOrderRecentTransaction[]) => {
      return res.map((t) => ({
        ...t,
        timestamp: parsePoolTxTimeStamp(t.timestamp),
      }));
    });
};

export interface DCLPoolFee {
  total_fee: string;
  total_liquidity: string;
}

export const getDCLTopBinFee = async (props: {
  pool_id: string | number;
  slot_number: string | number;
}): Promise<DCLPoolFee> => {
  const paramString = genUrlParams(props);

  return await fetch(config.indexerUrl + `/get-dcl-points?${paramString}`, {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((res) => {
      return res.top_bin_fee_data;
    });
};

export const getDCLAccountFee = async (props: {
  pool_id: string | number;
  account_id: string | number;
}): Promise<DCLPoolFee> => {
  const paramString = genUrlParams(props);
  try {
    return await fetch(
      config.indexerUrl + `/get-fee-by-account?${paramString}`,
      {
        method: 'GET',
        headers: { 'Content-type': 'application/json; charset=UTF-8' },
      }
    ).then((res) => res.json());
  } catch (error) {
    return;
  }
};

export interface ProposalHash {
  proposal_id: string;
  receipt_id: string;
  transaction_hash: string;
}

export const getProposalHashes = async ({
  proposal_ids,
}: {
  proposal_ids: number[];
}) => {
  return fetch(
    config.indexerUrl +
      '/get-proposal-hash-by-id?proposal_id=' +
      proposal_ids.join('|'),
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())

    .catch(() => {
      return [];
    });
};

export const getPoolsByIds = async ({
  pool_ids,
}: {
  pool_ids: string[];
}): Promise<PoolRPCView[]> => {
  const ids = pool_ids.join('|');
  if (!ids) return [];
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
        pool.token_symbols[0]?.toLowerCase(),
        args.tokenName?.toLowerCase()
      ) ||
      _.includes(
        pool.token_symbols[1]?.toLowerCase(),
        args.tokenName?.toLowerCase()
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
      getCurrentWallet()?.wallet?.getAccountId(),
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

export const getListHistoryTokenPriceByIds = async (
  tokenIds: string
): Promise<any[]> => {
  return await fetch(
    config.indexerUrl + '/list-history-token-price-by-ids?ids=' + tokenIds,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      return list;
    })
    .catch(() => {
      return [];
    });
};

export const getV3PoolVolumeById = async (pool_id: string): Promise<any[]> => {
  return await fetch(
    config.indexerUrl + '/get-dcl-pools-volume?pool_id=' + pool_id,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      return list.slice(0, 60);
    })
    .catch(() => {
      return [];
    });
};
export const getV3poolTvlById = async (pool_id: string): Promise<any[]> => {
  return await fetch(
    config.indexerUrl + '/get-dcl-pools-tvl-list?pool_id=' + pool_id,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      return list.slice(0, 60);
    })
    .catch(() => {
      return [];
    });
};

export const getV3Pool24VolumeById = async (pool_id: string): Promise<any> => {
  return await fetch(
    config.indexerUrl + '/get-24h-volume-by-id?pool_id=' + pool_id,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((value) => {
      return value;
    })
    .catch(() => {
      return 0;
    });
};
export const getAllV3Pool24Volume = async (): Promise<any[]> => {
  return await fetch(config.indexerUrl + '/get-24h-volume-list', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((list) => {
      return list;
    })
    .catch(() => {
      return [];
    });
};

export const getAllTvl = async () => {
  return await fetch(config.sodakiApiUrl + '/historical-tvl?period=1', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((res) => {
      return res?.historicalTVL?.at(-1)?.totalUsdTvl;
    });
};

export const getAllVolume24h = async () => {
  return await fetch(config.sodakiApiUrl + '/24h-volume-variation', {
    method: 'GET',
  })
    .then((res) => res.json())
    .then((res) => {
      return res?.lastVolumeUSD;
    });
};

export const getAssets = async (dateType: 'M' | 'W' | 'H' | 'ALL' = 'H') => {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  return await fetch(
    config.indexerUrl +
      '/get-assets-by-account?' +
      `account_id=${accountId}&dimension=${dateType}`,
    {
      method: 'GET',
    }
  )
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch(() => {
      return [];
    });
};
export const getLimitOrderLogsByAccount = async (): Promise<any[]> => {
  return await fetch(
    config.indexerUrl +
      `/get-limit-order-log-by-account/${getCurrentWallet()?.wallet?.getAccountId()}`,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then((res) => res.json())
    .then((list) => {
      return list;
    })
    .catch(() => {
      return [];
    });
};

export interface TokenPairRate {
  symbol: string;
  contract_address: string;
  price_list: PriceList[];
}

interface PriceList {
  price: number;
  date_time: number;
}

export const getTokenPairRate = async ({
  token,
  base_token,
  dimension,
}: {
  token: TokenMetadata;
  base_token: TokenMetadata;
  dimension: 'Y' | 'M' | 'W' | 'D' | 'All';
}): Promise<TokenPairRate> => {
  return await fetch(
    config.indexerUrl +
      `/token-price-report?token=${token.id}&base_token=${base_token.id}&dimension=${dimension}`,
    {
      method: 'GET',
      headers: { 'Content-type': 'application/json; charset=UTF-8' },
    }
  )
    .then(async (res) => {
      const data = await res.json();
      return {
        ...data,
        price_list: data.price_list.map((item: any) => ({
          price: Number(item.price),
          date_time: item.date_time * 1000,
        })),
      };
    })

    .catch(() => {
      return {
        symbol: token.symbol,
        contract_address: token.id,
        price_list: [],
      };
    });
};

export const getDclPoolPoints = async (
  pool_id: string,
  bin: number,
  start_point: number,
  end_point: number
) => {
  return await fetch(
    config.indexerUrl +
      `/get-dcl-points?pool_id=${pool_id}&slot_number=${bin}&start_point=${start_point}&end_point=${end_point}`
  )
    .then(async (res) => {
      const data = await res.json();
      return data;
    })
    .catch(() => {
      return {};
    });
};
export const getDclUserPoints = async (
  pool_id: string,
  bin: number,
  account_id: string
) => {
  return await fetch(
    config.indexerUrl +
      `/get-dcl-points-by-account?pool_id=${pool_id}&slot_number=${bin}&account_id=${account_id}`
  )
    .then(async (res) => {
      const data = await res.json();
      return data;
    })
    .catch(() => {
      return [];
    });
};
