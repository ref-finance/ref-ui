import { connect, Contract, keyStores, WalletConnection } from 'near-api-js';
import getConfig from './config';

const env = process.env.NODE_ENV || 'development';

const nearConfig = getConfig(env);

// Initialize contract & set global variables

import {
  formatNearAmount,
  parseNearAmount,
} from 'near-api-js/lib/utils/format';
import {
  getDeposits,
  getPools,
  getStorageBalance,
  getTokenFromTokenId,
} from '~utils/ContractUtils';

import DefaultSupportedCoinsMetadataDev from '~consts/DefaultSupportCoinsMetadataDev';
import DefaultSupportedCoinsMetadataProd from '~consts/DefaultSupportCoinsMetadataProd';

async function getDefaultTokenLists() {
  const tokenMap =
    env === 'development'
      ? DefaultSupportedCoinsMetadataDev
      : DefaultSupportedCoinsMetadataProd;
  global.tokenMap = tokenMap;
  global.tokenList = Object.values(tokenMap);

  // To get coin list from contracts
  // const tokenMap = {};
  // const tokenList = [];
  // for (const token of tokens) {
  //   const resp = await getTokenFromTokenId(token);
  //   tokenMap[token] = resp;
  //   tokenList.push(token);
  // }
}

// todo: for registering an accont.
// await window.contract.storage_deposit(
//   {
//     account_id: window.accountId,
//     registration_only: true,
//   },
//   null,
//   parseNearAmount("1")
// );

//   await tokenContract.storage_deposit(
//     {
//       account_id: window.accountId,
//       registration_only: true,
//     },
//     null,
//     parseNearAmount("1")
//   );

export async function initContract() {
  // Initialize connection to the NEAR testnet
  const near = await connect(
    Object.assign(
      { deps: { keyStore: new keyStores.BrowserLocalStorageKeyStore() } },
      nearConfig
    )
  );

  // Initializing Wallet based Account. It can work with NEAR testnet wallet that
  // is hosted at https://wallet.testnet.near.org
  window.walletConnection = new WalletConnection(near);
  window.contractName = nearConfig.contractName;

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  // window.contractName =
  //   env === "development" ? "ref-finance.testnet" : "ref-finance.near";
  window.contractName = 'ref-finance.testnet';

  // Initializing our contract APIs by contract name and configuration

  window.contract = await new Contract(
    window.walletConnection.account(),
    window.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        'get_whitelisted_tokens',
        'get_number_of_pools',
        'get_owner',
        'get_deposits',
        'get_return',
        'get_pools',
        'get_pool_shares',
        'storage_balance_of',
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: [
        'new',
        'storage_deposit',
        'withdraw',
        'swap',
        'add_liquidity',
        'remove_liquidity',
      ],
    }
  );

  // await mintCoins();
  await getDefaultTokenLists();
  const pools = await getPools();
  const deposits = window.accountId ? await getDeposits() : {};
  window.pools = pools;
  window.deposits = deposits;
}

export function getPool(idOne: string, idTwo: string) {
  let poolId = 0;
  const pool = window.pools.find((p: PoolInfo) => {
    const { token_account_ids } = p;
    const [t1, t2] = token_account_ids;
    if ((idOne === t1 && idTwo === t2) || (idOne === t2 && idTwo === t1)) {
      return p;
    }
    poolId += 1;
  });
  if (!pool) {
    poolId = -1;
  }

  return { pool, poolId };
}

export function logout() {
  window.walletConnection.signOut();
  // reload page
  window.location.replace(window.location.origin + window.location.pathname);
}

export function login() {
  // Allow the current app to make calls to the specified contract on the
  // user's behalf.
  // This works by creating a new access key for the user's account and storing
  // the private key in localStorage.

  window.walletConnection.requestSignIn(nearConfig.contractName);
}
