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

  public withSearch(args: any, pools: Pool[]): Pool[] {
    if (args.tokenName === '') return pools;
    return _.filter(pools, (pool: Pool) => {
      return _.includes(pool.token1Id, args.tokenName) || _.includes(pool.token2Id, args.tokenName)
    });
  }

  public withOrder(args: any, pools: Pool[]): Pool[] {
    return _.orderBy(pools, [args.column], [args.order]);
  }

  public uniquePairName(args: any, pools: Pool[]): Pool[] {
    if (!args.uniquePairName) return pools;
    let obj: any[] = [];
    return pools.reduce((cur: any[], next: { token1Id: any; token2Id: any; }) => {
      const pair_name = `${next.token1Id}--${next.token1Id}`
      obj[pair_name] ? "" : obj[pair_name] = true && cur.push(next);
      return cur;
    }, []);
  }

  public async query(args: any) {
    let pools = await this.allPools().toArray();
    return this.withOrder(args, this.uniquePairName(args, this.withSearch(args, pools)));
  }
}

export default new RefDatabase();
