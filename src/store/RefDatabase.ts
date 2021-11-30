import Dexie from 'dexie';
import _ from 'lodash';
import moment from 'moment';
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

class RefDatabase extends Dexie {
  public pools: Dexie.Table<Pool>;
  public tokens: Dexie.Table<TokenMetadata>;
  public farms: Dexie.Table<FarmDexie>;
  public poolsTokens: Dexie.Table<PoolsTokens>;
  public watchList: Dexie.Table<WatchList>;

  public constructor() {
    super('RefDatabase');

    this.version(5.1).stores({
      pools: 'id, token1Id, token2Id, token1Supply, token2Supply, fee, shares',
      tokens: 'id, name, symbol, decimals, icon',
      farms: 'id, pool_id, status',
      pools_tokens:
        'id, token1Id, token2Id, token1Supply, token2Supply, fee, shares, update_time, token0_price',
      watchList: 'id, account, pool_id, update_time',
    });

    this.pools = this.table('pools');
    this.tokens = this.table('tokens');
    this.farms = this.table('farms');
    this.poolsTokens = this.table('pools_tokens');
    this.watchList = this.table('watchList');
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
    let pools = await this.allPools().toArray();
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
    await this.poolsTokens.bulkPut(
      pools.map(
        (pool: {
          id: number;
          tokenIds: string[];
          supplies: any[];
          fee: number;
          shareSupply: string;
          token0_ref_price: string;
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
        })
      )
    );
  }

  public async checkPoolsByTokens(tokenInId: string, tokenOutId: string) {
    const items = await this.queryPoolsByTokens(tokenInId, tokenOutId);
    return items.length > 0;
  }

  public async getPoolsByTokens(tokenInId: string, tokenOutId: string) {
    const items = await this.queryPoolsByTokens(tokenInId, tokenOutId);

    return items.map((item) => ({
      id: item.id,
      fee: item.fee,
      tokenIds: [item.token1Id, item.token2Id],
      supplies: {
        [item.token1Id]: item.token1Supply,
        [item.token2Id]: item.token2Supply,
      },
      token0_ref_price: item.token0_price,
    }));
  }

  async queryPoolsByTokens(tokenInId: string, tokenOutId: string) {
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
}

export default new RefDatabase();
