import getConfig from './config';
import { wallet } from './near';
import { DEFAULT_PAGE_LIMIT } from './pool';
import _ from 'lodash';

const config = getConfig();
const api_url = 'https://rest.nearapi.org/view';

interface PoolRPCView {
  token_account_ids: string[];
  amounts: string[];
  total_fee: number;
  shares_total_supply: string;
}

export const get_pool_balance = async (pool_id: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      "rpc_node": config.nodeUrl,
      "contract": config.REF_FI_CONTRACT_ID,
      "method": "get_pool_shares",
      "params": { "account_id": wallet.getAccountId(), "pool_id": pool_id }
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' }
  }).then(res => res.json())
    .then(balance => {
      return balance;
    });
};

export const get_pools = async (counter: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      "rpc_node": config.nodeUrl,
      "contract": config.REF_FI_CONTRACT_ID,
      "method": "get_pools",
      "params": { "from_index": counter, "limit": 300 }
    }),
    headers: { 'Content-type': 'application/json; charset=UTF-8' }
  }).then(res => res.json())
    .then(pools => {
      pools.forEach(async (pool: any, i: number) => {
        pool.id = i + counter;
        const pool_balance = await get_pool_balance(Number(pool.id) + counter);
        if (pool_balance > 0) {
          pools[i].share = pool_balance;
        }
      });
      return pools;
    });
};

export const get_pools_from_indexer = async (args: any): Promise<PoolRPCView[]> => {
  return await fetch(config.indexerUrl + '/list-top-pools', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' }
  }).then(res => res.json())
    .then(pools => {
      return paginationPools(args, orderPools(args, searchPools(args, pools)));
    });
};

const searchPools = (args: any, pools: PoolRPCView[]) => {
  if (args.tokenName === '') return pools;
  return _.filter(pools, (pool: PoolRPCView) => {
    return _.includes(pool.token_account_ids[0], args.tokenName) || _.includes(pool.token_account_ids[1], args.tokenName)
  });
}

const orderPools = (args: any, pools: PoolRPCView[]) => {
  const column = args.column === 'fee' ? 'total_fee' : args.column;
  return _.orderBy(pools, [column], [args.order]);
}

const paginationPools = (args: any, pools: PoolRPCView[]) => {
  return _.slice(pools, (args.page - 1) * args.perPage, args.page * args.perPage);
}