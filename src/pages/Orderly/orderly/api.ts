import {
  get_storage_deposit_amount,
  orderly_storage_deposit,
  user_deposit_native_token,
  deposit_exact_token,
  user_request_withdraw,
  storage_balance_of,
  storage_balance_bounds,
  get_cost_of_announce_key,
  user_account_exists,
  is_orderly_key_announced,
} from './on-chain-api';
import { Transaction as WSTransaction } from '@near-wallet-selector/core';

import { utils } from 'near-api-js';

import {
  find_orderly_functionCall_key,
  getNormalizeTradingKey,
  toNonDivisibleNumber,
} from './utils';
import {
  getAddFunctionCallKeyTransaction,
  ORDERLY_ASSET_MANAGER,
} from '../near';
import {
  Transaction,
  getFunctionCallTransaction,
  near,
  getGas,
  getAmount,
} from '../near';

import { REGISTER_DEPOSIT_AMOUNT } from './on-chain-api';
import { getFTmetadata } from '../near';
import Big from 'big.js';

const signAndSendTransactions = async (transactions: Transaction[]) => {
  const wsTransactions = await getFunctionCallTransaction(transactions);

  const wallet = await window.selector.wallet();

  await wallet.signAndSendTransactions({
    transactions: wsTransactions,
  });
};

const signAndSendTransaction = async (wsTransaction: WSTransaction) => {
  const wallet = await window.selector.wallet();

  await wallet.signAndSendTransaction(wsTransaction).then(res => {
    console.log(res);
  });
};

// account_exist = await user_account_exists(accountId);
// no account_exist to call registerOrderly.

const announceKey = async (accountId: string) => {
  const account = await near.account(accountId);

  await account.functionCall(ORDERLY_ASSET_MANAGER, 'user_announce_key', {});
};

const setTradingKey = async (accountId: string) => {
  const account = await near.account(accountId);

  await account.functionCall(
    ORDERLY_ASSET_MANAGER,
    'user_request_set_trading_key',
    {
      key: getNormalizeTradingKey(),
    }
  );
};

const storageDeposit = async (accountId: string) => {
  // const storage_amount = await get_storage_deposit_amount(accountId);

  const functionCallList: any = [];

  const user_exists = await user_account_exists(accountId);

  const storage_balance = await storage_balance_of(accountId);

  const min_amount = await storage_balance_bounds();

  const announce_key_amount = await get_cost_of_announce_key();

  // if (storage_amount !== null) {
  const deposit_functionCall_register = orderly_storage_deposit(
    accountId,
    utils.format.formatNearAmount(min_amount.min)
  );

  const deposit_functionCall_announce_key = orderly_storage_deposit(
    accountId,
    utils.format.formatNearAmount(announce_key_amount)
  );

  // await account.functionCall(ORDERLY_ASSET_MANAGER, 'storage_deposit', {}, new BN(deposit_functionCall.gas), new BN(deposit_functionCall.));

  if (!user_exists) {
    functionCallList.push(deposit_functionCall_register);
  }

  if (
    !user_exists ||
    new Big(storage_balance?.available || '0').lt(new Big(announce_key_amount))
  ) {
    functionCallList.push(deposit_functionCall_announce_key);
  }

  if (functionCallList.length === 0) return;

  const transaction: Transaction = {
    receiverId: ORDERLY_ASSET_MANAGER,
    functionCalls: functionCallList,
  };

  return signAndSendTransactions([transaction]);
};

const checkStorageDeposit = async (accountId: string) => {
  // const storage_amount = await get_storage_deposit_amount(accountId);

  // const storage_amount = await get_storage_deposit_amount(accountId);

  const functionCallList: any = [];

  const user_exists = await user_account_exists(accountId);

  const storage_balance = await storage_balance_of(accountId);

  const min_amount = await storage_balance_bounds();

  const isAnnounceKey = await is_orderly_key_announced(accountId);

  const isTradingKeySet = await is_orderly_key_announced(accountId);

  if (isAnnounceKey && isTradingKeySet) return true;

  const announce_key_amount = await get_cost_of_announce_key();

  // if (storage_amount !== null) {
  const deposit_functionCall_register = orderly_storage_deposit(
    accountId,
    utils.format.formatNearAmount(min_amount.min)
  );

  const deposit_functionCall_announce_key = orderly_storage_deposit(
    accountId,
    utils.format.formatNearAmount(announce_key_amount)
  );

  // await account.functionCall(ORDERLY_ASSET_MANAGER, 'storage_deposit', {}, new BN(deposit_functionCall.gas), new BN(deposit_functionCall.));

  if (!user_exists) {
    functionCallList.push(deposit_functionCall_register);
  }

  if (
    !user_exists ||
    new Big(storage_balance?.available || '0').lt(new Big(announce_key_amount))
  ) {
    functionCallList.push(deposit_functionCall_announce_key);
  }

  if (functionCallList.length === 0) return true;

  return false;
};

const registerOrderly = async (accountId: string) => {
  // let wsTransactions: WSTransaction[] = [];

  const account = await near.account(accountId);

  await account.functionCall(ORDERLY_ASSET_MANAGER, 'user_announce_key', {});

  await account.functionCall(
    ORDERLY_ASSET_MANAGER,
    'user_request_set_trading_key',
    {
      key: getNormalizeTradingKey(),
    }
  );
};

const depositNEAR = async (amount: string) => {
  const transactions: Transaction[] = [];
  const account_id = window.selectorAccountId;
  if (!account_id) return;

  const storageBound = await storage_balance_bounds();

  const balance = await storage_balance_of(account_id);

  if (
    balance === null ||
    new Big(storageBound.min).gt(new Big(balance.available))
  ) {
    transactions.push({
      receiverId: ORDERLY_ASSET_MANAGER,
      functionCalls: [
        orderly_storage_deposit(
          account_id,
          utils.format.formatNearAmount(storageBound.min),
          false
        ),
      ],
    });
  }
  transactions.push({
    receiverId: ORDERLY_ASSET_MANAGER,
    functionCalls: [await user_deposit_native_token(amount)],
  });

  return signAndSendTransactions(transactions);
};

const depositFT = async (token: string, amount: string) => {
  const transactions: Transaction[] = [];

  const metaData = await getFTmetadata(token);

  const account_id = window.selectorAccountId;
  if (!account_id) return;

  const storageBound = await storage_balance_bounds();

  const balance = await storage_balance_of(account_id);

  if (
    balance === null ||
    new Big(storageBound.min).gt(new Big(balance.available))
  ) {
    transactions.push({
      receiverId: ORDERLY_ASSET_MANAGER,
      functionCalls: [
        orderly_storage_deposit(
          account_id,
          utils.format.formatNearAmount(storageBound.min),
          false
        ),
      ],
    });
  }

  transactions.push({
    receiverId: token,
    functionCalls: [
      await deposit_exact_token(
        toNonDivisibleNumber(metaData.decimals, amount)
      ),
    ],
  });

  return signAndSendTransactions(transactions);
};

const depositOrderly = async (token: string, amount: string) => {
  if (token === 'near') {
    return depositNEAR(amount);
  } else {
    return depositFT(token, amount);
  }
};

const withdrawOrderly = async (token: string, amount: string) => {
  const transactions: Transaction[] = [];

  const metaData = await getFTmetadata(token);

  transactions.push({
    receiverId: token,
    functionCalls: [
      await user_request_withdraw(
        token,
        toNonDivisibleNumber(metaData.decimals, amount)
      ),
    ],
  });

  return signAndSendTransactions(transactions);
};

export {
  signAndSendTransactions,
  withdrawOrderly,
  depositOrderly,
  registerOrderly,
  announceKey,
  storageDeposit,
  depositNEAR,
  depositFT,
  signAndSendTransaction,
  checkStorageDeposit,
  setTradingKey,
};
