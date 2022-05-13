import Dexie from 'dexie';
import _ from 'lodash';
import moment from 'moment';
import { isNotStablePool, PoolDetails } from '~services/pool';
import getConfig from '../services/config';

interface Pool {
  id: number;
  token1Id: string;
  token2Id: string;
  token1Supply: string;
  token2Supply: string;
  fee: number;
  shares: string;
}

interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

interface PoolsTokens {
  id: number;
  pool_id: string;
  token1Id: string;
  token2Id: string;
  token1Supply: string;
  token2Supply: string;
  fee: number;
  shares: string;
  update_time: string;
  token0_price: string;
  Dex?: string;
}

export interface PoolDb extends Pool {
  tvl?: string;
}

export interface FarmDexie {
  id: string;
  pool_id: string;
  status: string;
}

export interface WatchList {
  id: string;
  account: string;
  pool_id: string;
  update_time: number;
}

export interface TopPool {
  id: string;
  amounts: string[];
  amp: number;
  farming: boolean;
  pool_kind: string;
  shares_total_supply: string;
  token0_ref_price: string;
  token_account_ids: string[];
  token_symbols: string[];
  total_fee: number;
  tvl: string;
  vol01?: { [from: string]: string };
  vol10?: { [from: string]: string };
  update_time: number;
}

class RefDatabase extends Dexie {
  public pools: Dexie.Table<Pool>;
  public tokens: Dexie.Table<TokenMetadata>;
  public farms: Dexie.Table<FarmDexie>;
  public poolsTokens: Dexie.Table<PoolsTokens>;
  public watchList: Dexie.Table<WatchList>;
  public topPools: Dexie.Table<TopPool>;

  public constructor() {
    super('RefDatabase');

    this.version(5.4).stores({
      pools: 'id, token1Id, token2Id, token1Supply, token2Supply, fee, shares',
      tokens: 'id, name, symbol, decimals, icon',
      farms: 'id, pool_id, status',
      pools_tokens:
        'id, token1Id, token2Id, token1Supply, token2Supply, fee, shares, update_time, token0_price',
      watchList: 'id, account, pool_id, update_time',
      topPools: 'id, pool_kind, update_time',
    });

    this.pools = this.table('pools');
    this.tokens = this.table('tokens');
    this.farms = this.table('farms');
    this.poolsTokens = this.table('pools_tokens');
    this.watchList = this.table('watchList');
    this.topPools = this.table('topPools');
  }

  public allWatchList() {
    return this.watchList;
  }

  public allPools() {
    return this.pools;
  }

  public allTokens() {
    return this.tokens;
  }

  public allFarms() {
    return this.farms;
  }

  public allPoolsTokens() {
    return this.poolsTokens;
  }

  public allTopPools() {
    return this.topPools;
  }

  public searchPools(args: any, pools: Pool[]): Pool[] {
    if (args.tokenName === '') return pools;
    return _.filter(pools, (pool: Pool) => {
      return (
        _.includes(pool.token1Id, args.tokenName) ||
        _.includes(pool.token2Id, args.tokenName)
      );
    });
  }

  public orderPools(args: any, pools: Pool[]): Pool[] {
    return _.orderBy(pools, [args.column], [args.order]);
  }

  public paginationPools(args: any, pools: Pool[]): Pool[] {
    return _.slice(
      pools,
      (args.page - 1) * args.perPage,
      args.page * args.perPage
    );
  }

  public uniquePools(args: any, pools: Pool[]): Pool[] {
    if (!args.uniquePairName) return pools;
    let obj: any[];
    return pools.reduce(
      (cur: any[], next: { token1Id: any; token2Id: any }) => {
        const pair_name: any = `${next.token1Id}--${next.token1Id}`;
        obj[pair_name] ? '' : (obj[pair_name] = true && cur.push(next));
        return cur;
      },
      []
    );
  }

  public async queryPools(args: any) {
    let pools = await this.allPoolsTokens().toArray();
    return this.paginationPools(
      args,
      this.orderPools(
        args,
        this.uniquePools(args, this.searchPools(args, pools))
      )
    );
  }

  public searchTokens(args: any, tokens: TokenMetadata[]): TokenMetadata[] {
    if (args.tokenName === '') return tokens;
    return _.filter(tokens, (token: TokenMetadata) => {
      return _.includes(token.name, args.tokenName);
    });
  }

  public async queryTokens(args: any) {
    let tokens = await this.allTokens().toArray();
    return this.searchTokens(args, tokens);
  }

  public async queryFarms() {
    let farms = await this.allFarms().toArray();
    return farms;
  }

  public async cachePoolsByTokens(pools: any) {
    await this.poolsTokens.clear();
    const filtered_pools = pools.filter(function (pool: PoolDetails) {
      return pool.tokenIds.length < 3;
    });
    await this.poolsTokens.bulkPut(
      filtered_pools.map(
        (pool: {
          id: number;
          tokenIds: string[];
          supplies: any[];
          fee: number;
          shareSupply: string;
          token0_ref_price: string;
          Dex: string;
        }) => ({
          id: pool.id,
          token1Id: pool.tokenIds[0],
          token2Id: pool.tokenIds[1],
          token1Supply: pool.supplies[pool.tokenIds[0]],
          token2Supply: pool.supplies[pool.tokenIds[1]],
          fee: pool.fee,
          shares: pool.shareSupply,
          update_time: moment().unix(),
          token0_price: pool.token0_ref_price || '0',
          Dex: pool.Dex,
        })
      )
    );
  }
  public async checkPoolsByTokens(tokenInId: string, tokenOutId: string) {
    const itemsTimeLimit = await this.queryPoolsByTokensTimeLimit(
      tokenInId,
      tokenOutId
    );
    const items = await this.queryPoolsByTokens(tokenInId, tokenOutId);

    return [items.length > 0, itemsTimeLimit.length > 0];
  }

  public async getAllPoolsTokens() {
    const items = await this.allPoolsTokens().toArray();

    return items.map((item) => ({
      id: item.id,
      fee: item.fee,
      tokenIds: [item.token1Id, item.token2Id],
      supplies: {
        [item.token1Id]: item.token1Supply,
        [item.token2Id]: item.token2Supply,
      },
      token0_ref_price: item.token0_price,
      Dex: item.Dex,
    }));
  }

  public async getPoolsByTokens(tokenInId: string, tokenOutId: string) {
    let items = await this.queryPoolsByTokens(tokenInId, tokenOutId);

    return items.map((item) => ({
      id: item.id,
      fee: item.fee,
      tokenIds: [item.token1Id, item.token2Id],
      supplies: {
        [item.token1Id]: item.token1Supply,
        [item.token2Id]: item.token2Supply,
      },
      token0_ref_price: item.token0_price,
      Dex: item.Dex,
    }));
  }

  async queryPoolsByTokensTimeLimit(tokenInId: string, tokenOutId: string) {
    let normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenInId.toString())
      .and((item) => item.token2Id === tokenOutId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();
    let reverseItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenOutId.toString())
      .and((item) => item.token2Id === tokenInId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();

    return [...normalItems, ...reverseItems];
  }

  async queryPoolsByTokens(tokenInId: string, tokenOutId: string) {
    let normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenInId.toString())
      .and((item) => item.token2Id === tokenOutId.toString())
      .toArray();
    let reverseItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenOutId.toString())
      .and((item) => item.token2Id === tokenInId.toString())
      .toArray();

    return [...normalItems, ...reverseItems];
  }

  async queryPoolsByTokens2orig(tokenInId: string, tokenOutId: string) {
    //Queries for any pools that contain either tokenInId OR tokenOutId OR both.
    let normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenInId.toString())
      .toArray();
    let reverseItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenOutId.toString())
      .toArray();

    let normalItems2 = await this.poolsTokens
      .where('token2Id')
      .equals(tokenInId.toString())
      .toArray();
    let reverseItems2 = await this.poolsTokens
      .where('token2Id')
      .equals(tokenOutId.toString())
      .toArray();
    //note, there might be some overlap... we'll need to remove the duplicates, then sort by pool id:
    let dup = [
      ...normalItems,
      ...reverseItems,
      ...normalItems2,
      ...reverseItems2,
    ];
    // let result = [...new Set(dup.map(JSON.stringify))]
    //   .map(JSON.parse)
    //   .sort((a, b) => a['id'] - b['id']);
    let result = dup;
    return result;
  }

  async queryPoolsByTokens2(tokenInId: string, tokenOutId: string) {
    //Queries for any pools that contain either tokenInId OR tokenOutId OR both.
    let normalItems = await this.poolsTokens.toArray();

    return normalItems;
  }

  async queryPoolsByTokens3(tokenInId: string, tokenOutId: string) {
    //Queries for any pools that contain either tokenInId OR tokenOutId OR both.
    let normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenInId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();
    let reverseItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenOutId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();

    let normalItems2 = await this.poolsTokens
      .where('token2Id')
      .equals(tokenInId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();
    let reverseItems2 = await this.poolsTokens
      .where('token2Id')
      .equals(tokenOutId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();
    //note, there might be some overlap... we'll need to remove the duplicates, then sort by pool id:
    let dup = [
      ...normalItems,
      ...reverseItems,
      ...normalItems2,
      ...reverseItems2,
    ];
    let result = [...new Set(dup.map((d) => JSON.stringify(d)))]
      .map((d) => JSON.parse(d))
      .sort((a, b) => a['id'] - b['id']);
    return result;
  }

  public async cacheTopPools(pools: any) {
    await this.topPools.clear();
    await this.topPools.bulkPut(
      pools.map((topPool: TopPool) => ({
        ...topPool,
        update_time: moment().unix(),
        token1Id: topPool.token_account_ids[0],
        token2Id: topPool.token_account_ids[1],
      }))
    );
  }

  public async checkTopPools() {
    const pools = await this.topPools.limit(10).toArray();
    return (
      pools.length > 0 &&
      pools.every(
        (pool) =>
          Number(pool.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().TOP_POOLS_TOKEN_REFRESH_INTERVAL)
      )
    );
  }

  public async queryTopPools() {
    const pools = await this.topPools.toArray();

    return pools.map((pool) => {
      const { update_time, ...poolInfo } = pool;
      return poolInfo;
    });
  }

  public async queryPoolsBytoken(tokenId: string) {
    let normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenId)
      .toArray();
    let reverseItems = await this.poolsTokens
      .where('token2Id')
      .equals(tokenId)
      .toArray();

    return [...normalItems, ...reverseItems].map((item) => ({
      id: item.id,
      fee: item.fee,
      tokenIds: [item.token1Id, item.token2Id],
      supplies: {
        [item.token1Id]: item.token1Supply,
        [item.token2Id]: item.token2Supply,
      },
      tvl: 0,
      shareSupply: item.shares,
      token0_ref_price: item.token0_price,
    }));
  }

  // public async queryPoolsByToken1ORToken2(token1Id: string, token2Id: string) {
  //   let res1 = await this.queryPoolsBytoken(token1Id);
  //   let res2 = await this.queryPoolsBytoken(token2Id);
  //   let dup = [...res1, ...res2];
  //   let result = dup;
  //   console.log(result);
  //   // let result = [...new Set(dup.map(JSON.stringify))]
  //   //   .map(JSON.parse)
  //   //   .sort((a, b) => a['id'] - b['id']);
  //   return result;
  // }
}

export default new RefDatabase();
