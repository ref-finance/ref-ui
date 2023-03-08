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
  storage_cost_of_token_balance,
  storage_balance_of_orderly,
  is_trading_key_set,
} from './on-chain-api';
import { Transaction as WSTransaction } from '@near-wallet-selector/core';

import { Contract, KeyPair, utils } from 'near-api-js';

import { getNormalizeTradingKey, toNonDivisibleNumber } from './utils';
import {
  getAddFunctionCallKeyTransaction,
  keyStore,
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
import { getOrderlyConfig } from '../config';
import { registerAccountOnToken } from '../../../services/creators/token';
import { ftViewFunction } from '../../../services/ft-contract';
import { executeMultipleTransactions } from '~services/near';
import getConfig from '../config';
import { ledgerTipTrigger } from '../../../utils/wallets-integration';

const signAndSendTransactions = async (transactions: Transaction[]) => {
  return executeMultipleTransactions(transactions);
};

// account_exist = await user_account_exists(accountId);
// no account_exist to call registerOrderly.

const announceLedgerAccessKey = async (accountId: string) => {
  const keyPairLedger = KeyPair.fromRandom('ed25519');

  const wallet = await window.selector.wallet();

  if (wallet.id === 'sender') {
    await ledgerTipTrigger(window.selector);
  }

  const addKeyRes = await wallet.signAndSendTransaction({
    signerId: accountId,
    receiverId: accountId,
    actions: [
      {
        type: 'AddKey',
        params: {
          publicKey: keyPairLedger.getPublicKey().toString(),
          accessKey: {
            permission: {
              receiverId: ORDERLY_ASSET_MANAGER,

              methodNames: [
                'addMessage',
                'user_deposit_native_token',
                'user_request_withdraw',
                'user_announce_key',
                'user_request_set_trading_key',
                'create_user_account',
              ],
            },
          },
        },
      },
    ],
  });

  keyStore.setKey(getConfig().networkId, accountId, keyPairLedger);

  // localStorage.setItem()

  const handlePopTrigger = () => {
    const el = document.getElementsByClassName(
      'ledger-transaction-pop-up'
    )?.[0];
    if (el) {
      el.setAttribute('style', 'display:none');
    }
  };

  handlePopTrigger();

  await new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(1);
    }, 2000);
  });
};

// @ts-ignore
export let contract;

const announceKey = async (accountId: string) => {
  const wallet = await window.selector.wallet();

  if (wallet.id === 'ledger' || wallet.id === 'neth') {
    await announceLedgerAccessKey(accountId);

    // const account = await near.account(ORDERLY_ASSET_MANAGER);

    contract = await near.loadContract(ORDERLY_ASSET_MANAGER, {
      sender: accountId,
      viewMethods: [
        'user_token_balance',
        'user_trading_key',
        'is_orderly_key_announced',
        'is_trading_key_set',
        'user_account_exists',
      ],
      changeMethods: [
        'addMessage',
        'user_deposit_native_token',
        'user_request_withdraw',
        'user_announce_key',
        'user_request_set_trading_key',
        'create_user_account',
      ],
    });

    // @ts-ignore
    await contract.user_announce_key();

    return;
  }

  if (wallet.id === 'sender') {
    return window.near
      .account()
      .functionCall(ORDERLY_ASSET_MANAGER, 'user_announce_key', {});
  }

  return await wallet.signAndSendTransaction({
    signerId: accountId,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: 'user_announce_key',
          args: {},
          gas: utils.format.parseNearAmount('0.00000000003')!,
          deposit: utils.format.parseNearAmount('0')!,
        },
      },
    ],
  });
};

const setTradingKey = async (accountId: string) => {
  const wallet = await window.selector.wallet();

  if (wallet.id === 'ledger') {
    // @ts-ignore
    if (!contract) {
      return;
    } else {
      // @ts-ignore
      return await contract.user_request_set_trading_key({
        key: getNormalizeTradingKey(),
      });
    }
  }

  if (wallet.id === 'sender') {
    return window.near
      .account()
      .functionCall(ORDERLY_ASSET_MANAGER, 'user_request_set_trading_key', {
        key: getNormalizeTradingKey(),
      });
  }

  return await wallet.signAndSendTransaction({
    signerId: accountId,
    actions: [
      {
        type: 'FunctionCall',
        params: {
          methodName: 'user_request_set_trading_key',
          args: {
            key: getNormalizeTradingKey(),
          },
          gas: utils.format.parseNearAmount('0.00000000003')!,
          deposit: utils.format.parseNearAmount('0')!,
        },
      },
    ],
  });

  // return await account.functionCall(
  //   ORDERLY_ASSET_MANAGER,
  //   'user_request_set_trading_key',
  //   {
  //     key: getNormalizeTradingKey(),
  //   }
  // );
};

const storageDeposit = async (accountId: string) => {
  // const storage_amount = await get_storage_deposit_amount(accountId);

  const functionCallList: any = [];

  const transactions: Transaction[] = [];

  const user_exists = await user_account_exists(accountId);

  const storage_balance = await storage_balance_of(accountId);

  const min_amount = await storage_balance_bounds();

  const announce_key_amount = await get_cost_of_announce_key();

  // if (storage_amount !== null) {
  const deposit_functionCall_register = orderly_storage_deposit(
    accountId,
    utils.format.formatNearAmount(min_amount.min),
    true
  );

  const deposit_functionCall_announce_key = orderly_storage_deposit(
    accountId,
    '0.01'
  );

  // await account.functionCall(ORDERLY_ASSET_MANAGER, 'storage_deposit', {}, new BN(deposit_functionCall.gas), new BN(deposit_functionCall.));

  if (
    !user_exists ||
    storage_balance === null ||
    new Big(storage_balance.total || 0).lt(min_amount.min)
  ) {
    // functionCallList.push(deposit_functionCall_register);
    transactions.push({
      receiverId: ORDERLY_ASSET_MANAGER,
      functionCalls: [deposit_functionCall_register],
    });
  }

  if (
    !user_exists ||
    new Big(storage_balance?.available || '0').lt(
      new Big(utils.format.parseNearAmount('0.01'))
    )
  ) {
    functionCallList.push(deposit_functionCall_announce_key);

    transactions.push({
      receiverId: ORDERLY_ASSET_MANAGER,
      functionCalls: [deposit_functionCall_announce_key],
    });
  }

  if (transactions.length === 0) return;

  return signAndSendTransactions(transactions);
};

const checkStorageDeposit = async (accountId: string) => {
  // const storage_amount = await get_storage_deposit_amount(accountId);

  // const storage_amount = await get_storage_deposit_amount(accountId);

  const functionCallList: any = [];

  const user_exists = await user_account_exists(accountId);

  const storage_balance = await storage_balance_of(accountId);

  const min_amount = await storage_balance_bounds();

  const isAnnounceKey = !user_exists
    ? false
    : await is_orderly_key_announced(accountId);

  const isTradingKeySet = !user_exists
    ? false
    : await is_trading_key_set(accountId);

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

  if (
    !user_exists ||
    storage_balance === null ||
    new Big(storage_balance.total || 0).lt(min_amount.min)
  ) {
    functionCallList.push(deposit_functionCall_register);
  }
  console.log('functionCallList.length: ', functionCallList.length);

  if (
    !user_exists ||
    new Big(storage_balance?.available || '0').lt(
      new Big(utils.format.parseNearAmount('0.01'))
    )
  ) {
    functionCallList.push(deposit_functionCall_announce_key);
  }

  if (functionCallList.length === 0) return true;
  console.log('functionCallList.length: ', functionCallList.length);

  return false;
};

const depositNEAR = async (amount: string) => {
  const transactions: Transaction[] = [];
  const account_id = window.selectorAccountId;
  if (!account_id) return;

  const storageBound = await storage_cost_of_token_balance();

  const balance = await storage_balance_of(account_id);

  if (
    balance === null ||
    new Big(storageBound).gt(new Big(balance.available))
  ) {
    transactions.push({
      receiverId: ORDERLY_ASSET_MANAGER,
      functionCalls: [
        orderly_storage_deposit(
          account_id,
          utils.format.formatNearAmount(storageBound),
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

  const storageBound = await storage_cost_of_token_balance();

  const balance = await storage_balance_of(account_id);

  if (
    balance === null ||
    new Big(storageBound).gt(new Big(balance.available))
  ) {
    transactions.push({
      receiverId: ORDERLY_ASSET_MANAGER,
      functionCalls: [
        orderly_storage_deposit(
          account_id,
          utils.format.formatNearAmount(storageBound),
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
  if (token === 'near' || token === 'NEAR') {
    return depositNEAR(amount);
  } else {
    return depositFT(token, amount);
  }
};

const withdrawOrderly = async (token: string, amount: string) => {
  const transactions: Transaction[] = [];

  if (!window.selectorAccountId) {
    return;
  }

  if (token.toLocaleLowerCase() !== 'near') {
    const registeredOrderly = await storage_balance_of_orderly(token);

    if (!registeredOrderly) {
      transactions.push({
        receiverId: token,
        functionCalls: [
          {
            methodName: 'storage_deposit',
            args: {
              receiver_id: getOrderlyConfig().ORDERLY_ASSET_MANAGER,
              msg: '',
            },
            gas: '30000000000000',
            amount: '0.00125',
          },
        ],
      });
    }

    const registeredAccount = await ftViewFunction(token, {
      methodName: 'storage_balance_of',
      args: {
        account_id: window.selectorAccountId,
      },
    });

    if (!registeredAccount) {
      transactions.push({
        receiverId: token,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }

  const account_id = window.selectorAccountId;
  if (!account_id) return;

  const storageBound = await storage_cost_of_token_balance();

  const balance = await storage_balance_of(account_id);

  if (
    balance === null ||
    new Big(storageBound).gt(new Big(balance.available))
  ) {
    transactions.push({
      receiverId: ORDERLY_ASSET_MANAGER,
      functionCalls: [
        orderly_storage_deposit(
          account_id,
          utils.format.formatNearAmount(storageBound),
          false
        ),
      ],
    });
  }

  const metaData = await getFTmetadata(token);

  transactions.push({
    receiverId: getOrderlyConfig().ORDERLY_ASSET_MANAGER,
    functionCalls: [
      await user_request_withdraw(
        token.toLowerCase() === 'near' ? 'near' : token,
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
  announceKey,
  storageDeposit,
  depositNEAR,
  depositFT,
  checkStorageDeposit,
  setTradingKey,
};
