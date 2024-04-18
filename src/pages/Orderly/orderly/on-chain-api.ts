import {
  near,
  orderlyViewFunction,
  config,
  ORDERLY_ASSET_MANAGER,
  keyStore,
} from '../near';
import {
  getNormalizeTradingKey,
  getPublicKey,
  getSelectedWalletId,
} from './utils';

import getConfig from '../config';
import { BN } from 'bn.js';
import { ONE_YOCTO_NEAR } from '../near';
import { ftViewFunction } from '../../../services/ft-contract';
import {
  formatNearAmount,
  parseNearAmount,
} from 'near-api-js/lib/utils/format';
import { contract } from './api';
import { REF_ORDERLY_ACCOUNT_VALID } from '../components/UserBoard/index';

export const REGISTER_DEPOSIT_AMOUNT = '0.05';

const is_token_listed = async (token: string) => {
  return orderlyViewFunction({
    methodName: 'is_token_listed',
    args: {
      token,
    },
  });
};

//retrieve a list of whitelisted tokens supported by Orderly use the following method
const get_listed_tokens = async () => {
  return orderlyViewFunction({
    methodName: 'get_listed_tokens',
  });
};

const user_account_exists = async (user: string) => {
  return orderlyViewFunction({
    methodName: 'user_account_exists',
    args: {
      user,
    },
  });
};

const is_orderly_key_announced = async (
  user: string,
  fromUserBoard?: boolean
) => {
  const orderly_key = await getPublicKey(user);

  if (!orderly_key) return null;
  const valid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  const selectedWalletId = getSelectedWalletId();
  if (
    selectedWalletId === 'ledger' ||
    selectedWalletId === 'here-wallet' ||
    selectedWalletId === 'nightly'
  ) {
    if (!valid) {
      return false;
    }
  }

  const announced = await orderlyViewFunction({
    methodName: 'is_orderly_key_announced',
    args: {
      user,
      orderly_key,
    },
  });

  return announced;
};

const is_trading_key_set = async (user: string) => {
  const orderly_key = await getPublicKey(user);

  if (!orderly_key) return null;
  const selectedWalletId = getSelectedWalletId();

  if (
    selectedWalletId === 'ledger' ||
    selectedWalletId === 'here-wallet' ||
    selectedWalletId === 'nightly'
  ) {
    const valid = localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

    if (!valid) {
      return false;
    }
  }

  return orderlyViewFunction({
    methodName: 'is_trading_key_set',
    args: {
      user,
      orderly_key,
    },
  });
};

const is_symbol_listed = async (pair_symbol: string) => {
  return orderlyViewFunction({
    methodName: 'is_symbol_listed',
    args: {
      pair_symbol,
    },
  });
};

const get_user_trading_key = async (user: string) => {
  const orderly_key = (await keyStore.getKey(getConfig().networkId, user))
    ?.getPublicKey()
    ?.toString();

  if (!orderly_key)
    throw new Error('Orderly key not found while viewing get_user_trading_key');

  return orderlyViewFunction({
    methodName: 'get_user_trading_key',
    args: {
      user,
      orderly_key: orderly_key,
    },
  });
};

const orderly_storage_deposit = (
  account_id: string,
  amount: string = '0.05',
  registration_only: boolean = false
) => {
  return {
    methodName: 'storage_deposit',
    args: {
      registration_only,
      account_id,
    },
    gas: '30000000000000',
    amount,
  };
};

const user_announce_key = () => {
  return {
    methodName: 'user_announce_key',
    gas: '30000000000000',
  };
};

const user_request_set_trading_key = () => {
  const key = getNormalizeTradingKey();

  return {
    methodName: 'user_request_set_trading_key',
    args: {
      key,
    },
    gas: '30000000000000',
  };
};

const storage_withdraw = async (amount: string) => {
  return {
    methodName: 'storage_withdraw',
    args: {
      amount,
    },
    gas: '30000000000000',
  };
};

const user_request_settlement = async () => {
  return {
    methodName: 'user_request_settlement',
    gas: '30000000000000',
    amount: ONE_YOCTO_NEAR,
    args: {},
  };
};

const storage_balance_bounds = async () => {
  return orderlyViewFunction({
    methodName: 'storage_balance_bounds',
  });
};

const storage_cost_of_token_balance = async () => {
  return orderlyViewFunction({
    methodName: 'storage_cost_of_token_balance',
  });
};

const storage_balance_of = async (account_id: string) => {
  return orderlyViewFunction({
    methodName: 'storage_balance_of',
    args: {
      account_id,
    },
  });
};

const storage_balance_of_orderly = async (token: string) => {
  return ftViewFunction(token, {
    methodName: 'storage_balance_of',
    args: {
      account_id: getConfig().ORDERLY_ASSET_MANAGER,
    },
  });
};

const get_cost_of_announce_key = () => {
  return orderlyViewFunction({
    methodName: 'storage_cost_of_announce_key',
  });
};

const get_storage_deposit_amount = async (accountId: string) => {
  // const min_amount = (await storage_balance_bounds()).min;

  const my_storage_balance = (await storage_balance_of(accountId)) || '0';

  const to_be_added_amount = new BN(parseNearAmount('0.05') || '0').sub(
    new BN(my_storage_balance?.available || '0')
  );

  if (to_be_added_amount.lte(new BN(0))) return null;

  return to_be_added_amount.toString();
};

// deposit near into a wallet
const user_deposit_native_token = async (amount: string) => {
  return {
    methodName: 'user_deposit_native_token',
    args: {},
    gas: '30000000000000',
    amount,
  };
};

const deposit_exact_token = async (amount: string) => {
  return {
    methodName: 'ft_transfer_call',
    args: {
      receiver_id: ORDERLY_ASSET_MANAGER,
      msg: '',
      amount,
    },
    gas: '260000000000000',
    amount: ONE_YOCTO_NEAR,
  };
};

const user_request_withdraw = async (token: string, amount: string) => {
  return {
    methodName: 'user_request_withdraw',
    args: {
      amount,
      token,
    },
    gas: '30000000000000',
    amount: ONE_YOCTO_NEAR,
  };
};
export {
  get_user_trading_key,
  get_listed_tokens,
  is_symbol_listed,
  is_token_listed,
  user_account_exists,
  orderly_storage_deposit,
  user_announce_key,
  user_request_set_trading_key,
  storage_balance_bounds,
  storage_balance_of,
  storage_withdraw,
  user_deposit_native_token,
  deposit_exact_token,
  user_request_withdraw,
  get_storage_deposit_amount,
  get_cost_of_announce_key,
  is_orderly_key_announced,
  is_trading_key_set,
  storage_cost_of_token_balance,
  storage_balance_of_orderly,
  user_request_settlement,
};
