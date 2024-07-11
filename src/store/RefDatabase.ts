import Dexie from 'dexie';
import _ from 'lodash';
import moment from 'moment';
import { PoolRPCView } from 'src/services/api';
import { FarmBoost, Seed } from 'src/services/farm';
import { PoolDetails } from 'src/services/pool';

import getConfig from '../services/config';
const checkCacheSeconds = 300;
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
  isRisk?: boolean;
  isUserToken?: boolean;
}

export interface PoolsTokens {
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
  pairAdd?: string;
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

export interface TokenPrice {
  id?: string;
  decimal: number;
  price: string;
  symbol: string;
  update_time?: number;
}

export interface BoostSeeds {
  id?: string;
  seed: Seed;
  farmList: FarmBoost[];
  pool: PoolRPCView;
  update_time?: number;
}

class RefDatabase extends Dexie {
  public tokens: Dexie.Table<TokenMetadata>;
  public farms: Dexie.Table<FarmDexie>;
  public poolsTokens: Dexie.Table<PoolsTokens>;
  public watchList: Dexie.Table<WatchList>;
  public topPools: Dexie.Table<TopPool>;
  public boostFarms: Dexie.Table<FarmDexie>;
  public tokenPrices: Dexie.Table<TokenPrice>;
  public boostSeeds: Dexie.Table<BoostSeeds>;

  public constructor() {
    super('RefDatabase');

    this.version(5.6).stores({
      tokens: 'id, name, symbol, decimals, icon',
      farms: 'id, pool_id, status',
      pools_tokens:
        'id, token1Id, token2Id, token1Supply, token2Supply, fee, shares, update_time, token0_price',
      watchList: 'id, account, pool_id, update_time',
      topPools: 'id, pool_kind, update_time',
      boostFarms: 'id, pool_id, status',
      tokenPrices: 'id, symbol, update_time',
      boostSeeds: 'id, update_time',
    });

    this.tokens = this.table('tokens');
    this.farms = this.table('farms');
    this.poolsTokens = this.table('pools_tokens');
    this.watchList = this.table('watchList');
    this.topPools = this.table('topPools');
    this.boostFarms = this.table('boostFarms');
    this.tokenPrices = this.table('tokenPrices');
    this.boostSeeds = this.table('boostSeeds');
  }

  public allWatchList() {
    return this.watchList;
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
  public allBoostFarms() {
    return this.boostFarms;
  }
  public allBoostSeeds() {
    return this.boostSeeds;
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
    const pools = await this.allPoolsTokens().toArray();
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
    const tokens = await this.allTokens().toArray();
    return this.searchTokens(args, tokens);
  }
  public async queryAllTokens() {
    const tokens = await this.allTokens().toArray();
    return tokens;
  }

  public async queryFarms() {
    const farms = await this.allFarms().toArray();
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
          pairAdd: string;
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
          pairAdd: pool?.pairAdd,
        })
      )
    );
  }

  public async cachePoolsByTokensAurora(pools: any) {
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
          pairAdd: string;
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
          pairAdd: pool?.pairAdd,
        })
      )
    );
  }

  public async checkPoolsByTokens(
    tokenInId: string,
    tokenOutId: string,
    forAurora?: boolean
  ) {
    let itemsTimeLimit = await this.queryPoolsByTokensTimeLimit(
      tokenInId,
      tokenOutId
    );

    if (forAurora) {
      itemsTimeLimit = itemsTimeLimit.filter((p) => p?.Dex === 'tri');
    }

    let items = await this.queryPoolsByTokens(tokenInId, tokenOutId);

    if (forAurora) {
      items = items.filter((p) => p?.Dex === 'tri');
    }

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

  public async getPoolsByTokens(
    tokenInId: string,
    tokenOutId: string,
    forAurora?: boolean
  ) {
    let items = await this.queryPoolsByTokens(tokenInId, tokenOutId);

    if (forAurora) {
      items = items.filter((p) => p?.Dex === 'tri');
    }

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
      pairAdd: item?.pairAdd,
    }));
  }

  async queryPoolsByTokensTimeLimit(tokenInId: string, tokenOutId: string) {
    const normalItems = await this.poolsTokens
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
    const reverseItems = await this.poolsTokens
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
    const normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenInId.toString())
      .and((item) => item.token2Id === tokenOutId.toString())
      .toArray();
    const reverseItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenOutId.toString())
      .and((item) => item.token2Id === tokenInId.toString())
      .toArray();

    return [...normalItems, ...reverseItems];
  }

  async queryPoolsByTokens2orig(tokenInId: string, tokenOutId: string) {
    //Queries for any pools that contain either tokenInId OR tokenOutId OR both.
    const normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenInId.toString())
      .toArray();
    const reverseItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenOutId.toString())
      .toArray();

    const normalItems2 = await this.poolsTokens
      .where('token2Id')
      .equals(tokenInId.toString())
      .toArray();
    const reverseItems2 = await this.poolsTokens
      .where('token2Id')
      .equals(tokenOutId.toString())
      .toArray();
    //note, there might be some overlap... we'll need to remove the duplicates, then sort by pool id:
    const dup = [
      ...normalItems,
      ...reverseItems,
      ...normalItems2,
      ...reverseItems2,
    ];
    // let result = [...new Set(dup.map(JSON.stringify))]
    //   .map(JSON.parse)
    //   .sort((a, b) => a['id'] - b['id']);
    const result = dup;
    return result;
  }

  async queryPoolsByTokens2() {
    //Queries for any pools that contain either tokenInId OR tokenOutId OR both.
    const normalItems = await this.poolsTokens.toArray();

    return normalItems;
  }

  async queryPoolsByTokens3(tokenInId: string, tokenOutId: string) {
    //Queries for any pools that contain either tokenInId OR tokenOutId OR both.
    const normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenInId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();
    const reverseItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenOutId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();

    const normalItems2 = await this.poolsTokens
      .where('token2Id')
      .equals(tokenInId.toString())
      .and(
        (item) =>
          Number(item.update_time) >=
          Number(moment().unix()) -
            Number(getConfig().POOL_TOKEN_REFRESH_INTERVAL)
      )
      .toArray();
    const reverseItems2 = await this.poolsTokens
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
    const dup = [
      ...normalItems,
      ...reverseItems,
      ...normalItems2,
      ...reverseItems2,
    ];
    const result = [...new Set(dup.map((d) => JSON.stringify(d)))]
      .map((d) => JSON.parse(d))
      .sort((a, b) => a.id - b.id);
    return result;
  }

  public async cacheTopPools(pools: any) {
    await this.topPools.clear();
    await this.topPools.bulkPut(
      pools.map((topPool: TopPool) => ({
        ...topPool,
        id: topPool.id.toString(),
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

  // public async queryTopPoolsByIds({ poolIds }: { poolIds: string[] }) {
  //   const pools = (await this.topPools.toArray()).filter((pool) =>
  //     poolIds.includes(pool.id)
  //   );

  //   return pools.map((pool) => {
  //     const { update_time, ...poolInfo } = pool;

  //     const res = parsePool({
  //       ...poolInfo,
  //       id: Number(poolInfo.id),
  //       share: '',
  //       tvl: Number(poolInfo.tvl),
  //     } as PoolRPCView);

  //     return {
  //       ...res,
  //       dex: 'ref',
  //     };
  //   });
  // }

  public async queryPoolsBytoken(tokenId: string) {
    const normalItems = await this.poolsTokens
      .where('token1Id')
      .equals(tokenId)
      .toArray();
    const reverseItems = await this.poolsTokens
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
  /***boost start****/
  public async queryBoostFarms() {
    const farms = await this.allBoostFarms().toArray();
    return farms;
  }
  public async queryTokenPrices() {
    return await this.tokenPrices.toArray();
  }
  public async queryBoostSeeds() {
    return await this.boostSeeds.toArray();
  }

  public async queryBoostSeedsBySeeds(seeds: string[]) {
    return (
      await this.boostSeeds
        .filter((seed) => seeds.includes(seed.id || ''))
        .toArray()
    ).reduce((acc, cur, i) => {
      return {
        ...acc,
        [cur.id]: cur,
      };
    }, {});
  }
  public async checkTokenPrices() {
    const priceList = await this.tokenPrices.limit(2).toArray();
    return (
      priceList.length > 0 &&
      priceList.every(
        (price) =>
          Number(price.update_time) >=
          Number(moment().unix()) - checkCacheSeconds
      )
    );
  }
  public async checkBoostSeeds() {
    const boostSeeds = await this.boostSeeds.limit(2).toArray();
    return (
      boostSeeds.length > 0 &&
      boostSeeds.every(
        (boostSeed) =>
          Number(boostSeed.update_time) >=
          Number(moment().unix()) - checkCacheSeconds
      )
    );
  }
  public async cacheTokenPrices(tokenPriceMap: Record<string, TokenPrice>) {
    // await this.tokenPrices.clear();
    const cacheData: TokenPrice[] = [];
    const tokenIds = Object.keys(tokenPriceMap);
    tokenIds.forEach((tokenId: string) => {
      cacheData.push({
        ...tokenPriceMap[tokenId],
        id: tokenId,
        update_time: moment().unix(),
      });
    });
    this.tokenPrices.bulkPut(cacheData);
  }
  public async cacheBoostSeeds(boostSeeds: BoostSeeds[]) {
    // await this.boostSeeds.clear();
    await this.boostSeeds.bulkPut(
      boostSeeds.map((boostSeed: BoostSeeds) => ({
        ...boostSeed,
        update_time: moment().unix(),
      }))
    );
  }
}

export default new RefDatabase();
