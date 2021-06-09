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

class RefDatabase extends Dexie {
  public pools: Dexie.Table<Pool>;
  public tokens: Dexie.Table<TokenMetadata>;

  public constructor() {
    super('RefDatabase');

    this.version(1).stores({
      pools: 'id, token1Id, token2Id, token1Supply, token2Supply, fee, shares',
      tokens: 'id, name, symbol, decimals, icon',
    });

    this.pools = this.table('pools');
    this.tokens = this.table('tokens');
  }

  public allPools() {
    return this.pools;
  }

  public allTokens() {
    return this.tokens;
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
    let obj: any[] = [];
    return pools.reduce(
      (cur: any[], next: { token1Id: any; token2Id: any }) => {
        const pair_name = `${next.token1Id}--${next.token1Id}`;
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
}

export default new RefDatabase();
