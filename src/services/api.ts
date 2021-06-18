import getConfig from './config';
import { wallet } from './near';
import { DEFAULT_PAGE_LIMIT } from './pool';
import _ from 'lodash';
import { toPrecision } from '~utils/numbers';
import { BigNumber } from 'bignumber.js';

const config = getConfig();
const api_url = 'https://rest.nearapi.org/view';

export interface PoolRPCView {
  id: number;
  token_account_ids: string[];
  token_symbols: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
  tvl: number;
  token0_ref_price: string;
  share: string;
}

const parsePoolView = (pool: any): PoolRPCView => ({
  id: Number(pool.id),
  token_account_ids: pool.token_account_ids,
  token_symbols: pool.token_symbols,
  amounts: pool.amounts,
  total_fee: pool.total_fee,
  shares_total_supply: pool.shares_total_supply,
  tvl: Number(toPrecision(pool.tvl, 2)),
  token0_ref_price: pool.token0_ref_price,
  share: pool.share,
});

export const getPoolBalance = async (pool_id: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      rpc_node: config.nodeUrl,
      contract: config.REF_FI_CONTRACT_ID,
      method: 'get_pool_shares',
      params: { account_id: wallet.getAccountId(), pool_id: pool_id },
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.text())
    .then((balance) => {
      return new BigNumber(balance.toString()).toFixed();
    });
};

export const getPools = async (counter: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      rpc_node: config.nodeUrl,
      contract: config.REF_FI_CONTRACT_ID,
      method: 'get_pools',
      params: { from_index: counter, limit: 300 },
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((pools) => {
      pools.forEach(async (pool: any, i: number) => {
        pool.id = i + counter;
        const pool_balance = await getPoolBalance(Number(pool.id) + counter);
        if (Number(pool_balance) > 0) {
          pools[i].share = pool_balance;
        }
      });
      return pools;
    });
};

export const getYourPoolsFromIndexer = async (): Promise<PoolRPCView[]> => {
  return await fetch(
    config.indexerUrl + '/liquidity-pools/' + wallet.getAccountId(),
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

export const getPoolsFromIndexer = async (
  args: any
): Promise<PoolRPCView[]> => {
  return await fetch(config.indexerUrl + '/list-top-pools', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((pools) => {
      pools = pools.map((pool: any) => parsePoolView(pool));

      return pagination(args, order(args, search(args, pools)));
    });
};

export const getPoolsByIdsFromIndexer = async (
  pool_ids: string[]
): Promise<PoolRPCView[]> => {
  return await fetch(config.indexerUrl + '/list-pools-byids', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
    body: JSON.stringify({
      params: { pool_ids: pool_ids },
    }),
  })
    .then((res) => res.json())
    .then((pools) => {
      pools = pools.map((pool: any) => parsePoolView(pool));

      return pools;
    });
};

const search = (args: any, pools: PoolRPCView[]) => {
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

const order = (args: any, pools: PoolRPCView[]) => {
  let column = args.column || 'tvl';
  let order = args.order || 'desc';
  column = args.column === 'fee' ? 'total_fee' : column;
  return _.orderBy(pools, [column], [order]);
};

const pagination = (args: any, pools: PoolRPCView[]) => {
  return _.slice(
    pools,
    (args.page - 1) * args.perPage,
    args.page * args.perPage
  );
};
