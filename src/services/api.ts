import getConfig from './config';
import { wallet } from './near';
import { DEFAULT_PAGE_LIMIT } from './pool';

const config = getConfig();
const api_url = 'https://rest.nearapi.org/view';

export const get_pool_balance = async (pool_id: number) => {
  return await fetch(api_url, {
    method: 'POST',
    body: JSON.stringify({
      "rpc_node": config.nodeUrl,
      "contract": config.REF_FI_CONTRACT_ID,
      "method": "get_pool_shares",
      "params": {"account_id": wallet.getAccountId(), "pool_id": pool_id}
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8'}
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
      "params": {"from_index": counter, "limit": 300}
    }),
    headers: {'Content-type': 'application/json; charset=UTF-8'}
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
