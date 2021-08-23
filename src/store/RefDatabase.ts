import Dexie, { Collection } from 'dexie';
import _ from 'lodash';

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

export interface FarmDexie {
  id: string;
  pool_id: string;
}

class RefDatabase extends Dexie {
  public pools: Dexie.Table<Pool>;
  public tokens: Dexie.Table<TokenMetadata>;
  public farms: Dexie.Table<FarmDexie>;

  public constructor() {
    super('RefDatabase');

    this.version(3).stores({
      pools: 'id, token1Id, token2Id, token1Supply, token2Supply, fee, shares',
      tokens: 'id, name, symbol, decimals, icon',
      farms: 'id, pool_id',
    });

    this.pools = this.table('pools');
    this.tokens = this.table('tokens');
    this.farms = this.table('farms');
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
}

export default new RefDatabase();
