import { utils } from 'near-api-js';
import { NEAR_META_DATA } from 'src/constants';

import { storageDepositAction } from '../services/creators/storage';
import { toNonDivisibleNumber, toReadableNumber } from '../utils/numbers';
import { getCurrentWallet } from '../utils/wallets-integration';
import getConfig from './config';
import { withdrawAction } from './creators/token';
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import {
  executeMultipleTransactions,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  RefFiFunctionCallOptions,
  Transaction,
} from './near';
import { checkTokenNeedsStorageDeposit } from './token';

export const { WRAP_NEAR_CONTRACT_ID } = getConfig();
export const NEW_ACCOUNT_STORAGE_COST = '0.00125';

export const wnearMetadata: TokenMetadata = {
  id: WRAP_NEAR_CONTRACT_ID,
  name: 'wNEAR',
  symbol: 'wNEAR',
  decimals: 24,
  icon: 'https://assets.ref.finance/images/w-NEAR-no-border.png',
};

export const nearMetadata: TokenMetadata = NEAR_META_DATA;

export const unwrapedNear: TokenMetadata = {
  ...wnearMetadata,
  symbol: 'NEAR',
  icon: nearMetadata.icon,
};

export const nearDeposit = async (amount: string) => {
  const transactions: Transaction[] = [
    {
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_deposit',
          args: {},
          gas: '50000000000000',
          amount,
        },
      ],
    },
  ];

  return executeMultipleTransactions(transactions);
};

export const nearDepositTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'near_deposit',
        args: {},
        gas: '50000000000000',
        amount,
      },
    ],
  };

  return transaction;
};

export const nearWithdraw = async (amount: string) => {
  const transactions: Transaction[] = [
    {
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_withdraw',
          args: { amount: utils.format.parseNearAmount(amount) },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];

  return executeMultipleTransactions(transactions);
};

export const nearWithdrawTransaction = (amount: string) => {
  const transaction: Transaction = {
    receiverId: WRAP_NEAR_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'near_withdraw',
        args: { amount: utils.format.parseNearAmount(amount) },
        amount: ONE_YOCTO_NEAR,
      },
    ],
  };
  return transaction;
};

export const wrapNear = async (amount: string) => {
  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            account_id: getCurrentWallet()?.wallet?.getAccountId(),
            registration_only: false,
          },
          gas: '30000000000000',
          amount: neededStorage,
        },
      ],
    });
  }

  const actions: RefFiFunctionCallOptions[] = [];
  const balance = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);

  if (!balance || balance.total === '0') {
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
    gas: '50000000000000',
    amount: toReadableNumber(24, toNonDivisibleNumber(24, amount)),
  });

  actions.push({
    methodName: 'ft_transfer_call',
    args: {
      receiver_id: REF_FI_CONTRACT_ID,
      // amount:utils.format.formatNearAmount(amount)
      amount: toNonDivisibleNumber(24, amount),
      msg: '',
    },
    gas: '50000000000000',
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

  if (!balance || balance.total === '0') {
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
        amount: toNonDivisibleNumber(24, amount),
      }),
    ],
  });

  // transactions.push({
  //   receiverId: WRAP_NEAR_CONTRACT_ID,
  //   functionCalls: [
  //     {
  //       methodName: 'near_withdraw',
  //       args: {
  //         // amount: utils.format.parseNearAmount(amount),
  //         amount: toNonDivisibleNumber(24, amount),
  //       },
  //       amount: ONE_YOCTO_NEAR,
  //     },
  //   ],
  // });

  const needDeposit = await checkTokenNeedsStorageDeposit();
  if (needDeposit) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: needDeposit })],
    });
  }

  return executeMultipleTransactions(transactions);
};
