import { connect, Contract, keyStores, WalletConnection } from "near-api-js";
import getConfig from "./config";

const env = process.env.NODE_ENV || "development";

const nearConfig = getConfig(env);

// Initialize contract & set global variables

import {
  formatNearAmount,
  parseNearAmount,
} from "near-api-js/lib/utils/format";
import { getPools, getTokenFromTokenId } from "~utils/ContractUtils";

async function getDefaultTokenLists() {
  const tokens = await window.contract.get_whitelisted_tokens();

  const tokenMap = {};
  const tokenList = [];
  for (const token of tokens) {
    const resp = await getTokenFromTokenId(token);
    tokenMap[token] = resp;
    tokenList.push(token);
  }
  global.tokenList = tokenList;
  global.tokenMap = tokenMap;
}

// async function mintCoins() {
//   const newContract = await new Contract(
//     window.walletConnection.account(),
//     "token2.ref-finance.testnet",
//     { changeMethods: ["mint"] }
//   );
//   await newContract.mint({ account_id: window.accountId, amount: "12500000" });
// }

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

  // Getting the Account ID. If still unauthorized, it's just empty string
  window.accountId = window.walletConnection.getAccountId();

  window.contractName =
    env === "development" ? "ref-finance.testnet" : '"ref-finance.near"';
  // Initializing our contract APIs by contract name and configuration

  window.contract = await new Contract(
    window.walletConnection.account(),
    window.contractName,
    {
      // View methods are read only. They don't modify the state, but usually return some value.
      viewMethods: [
        "get_whitelisted_tokens",
        "get_number_of_pools",
        "get_owner",
        "get_deposits",
        "get_return",
        "get_pools",
      ],
      // Change methods can modify the state. But you don't receive the returned value when called.
      changeMethods: ["new", "storage_deposit"],
    }
  );

  // await mintCoins();
  await getDefaultTokenLists();
  const pools = await getPools();
  window.pools = pools;
}

// ref-finance.testnet

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
