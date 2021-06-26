import getConfig from './config';
import {wallet} from './near';
import _ from 'lodash';
import {parsePoolView, PoolRPCView} from './api';
import moment from 'moment/moment';
import {parseAction} from "~services/transaction";

const config = getConfig();

const parseActionView = (action: any) => {
  return {
    datetime: moment
      .unix(action[0] / 1000000000)
      .format('MMMM D, YYYY [at] h:mm:ss A'),
    txUrl: config.explorerUrl + '/transactions/' + action[1],
    data: parseAction(action[2], action[3]),
    status: action[5] === 'SUCCESS_VALUE',
  };
};

export const getYourPools = async (): Promise<PoolRPCView[]> => {
  return await fetch(
    config.indexerUrl + '/liquidity-pools/' + wallet.getAccountId(),
    {
      method: 'GET',
      headers: {'Content-type': 'application/json; charset=UTF-8'},
    }
  )
    .then((res) => res.json())
    .then((pools) => {
      return pools;
    });
};

export const getTopPools = async (args: any): Promise<PoolRPCView[]> => {
  return await fetch(config.indexerUrl + '/list-top-pools', {
    method: 'GET',
    headers: {'Content-type': 'application/json; charset=UTF-8'},
  })
    .then((res) => res.json())
    .then((pools) => {
      pools = pools.map((pool: any) => parsePoolView(pool));

      return _pagination(args, _order(args, _search(args, pools)));
    });
};

const _search = (args: any, pools: PoolRPCView[]) => {
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

const _order = (args: any, pools: PoolRPCView[]) => {
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

export const getLatestActions = async () => {
  return await fetch(
    config.indexerUrl + '/latest-actions/' + wallet.getAccountId(),
    {
      method: 'GET',
      headers: {'Content-type': 'application/json; charset=UTF-8'},
    }
  )
    .then((res) => res.json())
    .then((items) => {
      items = items.map((item: any) => parseActionView(item));

      return items;
    });
};
