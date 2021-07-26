import { keyStores, Near } from 'near-api-js';
import db from './store/RefDatabase';
import getConfig from './services/config';
import { TokenMetadata } from '~services/ft-contract';

const config = getConfig();

const MAX_PER_PAGE = 100;

const near = new Near({
  keyStore: new keyStores.InMemoryKeyStore(),
  ...config,
});

const view = ({
  methodName,
  args = {},
}: {
  methodName: string;
  args?: object;
}) => {
  return near.connection.provider
    .query({
      request_type: 'call_function',
      finality: 'final',
      account_id: config.REF_FI_CONTRACT_ID,
      method_name: methodName,
      args_base64: Buffer.from(JSON.stringify(args)).toString('base64'),
    })
    .then(({ result }) => JSON.parse(Buffer.from(result).toString()));
};

const getTotalPools = () => {
  return view({ methodName: 'get_number_of_pools' });
};

const getPools = (page: number) => {
  const index = (page - 1) * MAX_PER_PAGE;

  return view({
    methodName: 'get_pools',
    args: { from_index: index, limit: MAX_PER_PAGE },
  });
};

const getTokens = async () => {
  return await fetch(config.indexerUrl + '/list-token', {
    method: 'GET',
    headers: { 'Content-type': 'application/json; charset=UTF-8' },
  })
    .then((res) => res.json())
    .then((tokens) => {
      return tokens;
    });
};

const cachePools = async () => {
  const totalPools = await getTotalPools();
  const pages = Math.ceil(totalPools / MAX_PER_PAGE);
  for (let page = 1; page <= pages; page++) {
    const pools = await getPools(page);
    await db.pools.bulkPut(
      pools.map(
        (
          pool: {
            token_account_ids: any[];
            amounts: any[];
            total_fee: any;
            shares_total_supply: any;
          },
          i: number
        ) => ({
          id: (page - 1) * MAX_PER_PAGE + i,
          token1Id: pool.token_account_ids[0],
          token2Id: pool.token_account_ids[1],
          token1Supply: pool.amounts[0],
          token2Supply: pool.amounts[1],
          fee: pool.total_fee,
          shares: pool.shares_total_supply,
        })
      )
    );
  }
};

const cacheTokens = async () => {
  const tokens = await getTokens();
  const tokenArr = Object.keys(tokens).map((key) => ({
    id: key,
    icon: tokens[key].icon,
    decimals: tokens[key].decimals,
    name: tokens[key].name,
    symbol: tokens[key].symbol,
  }));
  await db.tokens.bulkPut(
    tokenArr.map((token: TokenMetadata) => ({
      id: token.id,
      name: token.name,
      symbol: token.symbol,
      decimals: token.decimals,
      icon: token.icon,
    }))
  );
};

run();

async function run() {
  cachePools();
  cacheTokens();
}
