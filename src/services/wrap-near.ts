import { utils } from 'near-api-js';
import { storageDepositForTokenAction } from './creators/storage';
import { withdrawAction } from './creators/token';
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import {
  executeMultipleTransactions,
  ONE_YOCTO_NEAR,
  RefFiFunctionCallOptions,
  REF_FI_CONTRACT_ID,
  Transaction,
  wallet,
} from './near';
import { checkTokenNeedsStorageDeposit } from './token';

export const WRAP_NEAR_CONTRACT_ID = 'wrap.near';
const NEW_ACCOUNT_STORAGE_COST = '1250000000000000000000';

export const nearMetadata: TokenMetadata = {
  id: 'NEAR',
  name: 'NEAR',
  symbol: 'NEAR',
  decimals: 24,
  icon: 'https://near.org/wp-content/themes/near-19/assets/img/brand-icon.png',
};

export const wrapNear = async (amount: string) => {
  const transactions: Transaction[] = [];
  const needsStorage = await checkTokenNeedsStorageDeposit(
    WRAP_NEAR_CONTRACT_ID
  );
  if (needsStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositForTokenAction(wallet.getAccountId())],
    });
  }

  const actions: RefFiFunctionCallOptions[] = [];
  const balance = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);

  if (balance.total === '0') {
    actions.push({
      methodName: 'storage_deposit',
      args: {},
      gas: '30000000000000',
      amount: NEW_ACCOUNT_STORAGE_COST,
    });
  }

  actions.push({
    methodName: 'near_deposit',
    args: {},
    amount,
  });

  actions.push({
    methodName: 'ft_transfer_call',
    args: {
      receiver_id: REF_FI_CONTRACT_ID,
      amount: utils.format.parseNearAmount(amount),
      msg: '',
    },
    gas: '100000000000000',
    amount: ONE_YOCTO_NEAR,
  });

  transactions.push({
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: actions,
  });

  return executeMultipleTransactions(transactions);
};

export const unwrapNear = async (amount: string) => {
  const transactions: Transaction[] = [];

  const balance = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);

  if (balance.total === '0') {
    transactions.push({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {},
          gas: '30000000000000',
          amount: NEW_ACCOUNT_STORAGE_COST,
        },
      ],
    });
  }

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      withdrawAction({
        tokenId: WRAP_NEAR_CONTRACT_ID,
        amount: utils.format.parseNearAmount(amount),
      }),
    ],
  });

  transactions.push({
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'near_withdraw',
        args: { amount: utils.format.parseNearAmount(amount) },
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  return executeMultipleTransactions(transactions);
};
