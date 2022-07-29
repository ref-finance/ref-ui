import {
  executeMultipleTransactions,
  ONE_YOCTO_NEAR,
  REF_FI_CONTRACT_ID,
  REF_TOKEN_ID,
  refContractViewFunction,
  Transaction,
  wallet,
} from '../services/near';
import { toNonDivisibleNumber } from '../utils/numbers';
import { storageDepositAction } from '../services/creators/storage';
import getConfig from '../services/config';
import { checkTokenNeedsStorageDeposit } from './token';
import { ftGetStorageBalance } from '../services/ft-contract';
import { NEW_ACCOUNT_STORAGE_COST } from '../services/wrap-near';
import { getCurrentWallet } from '../utils/sender-wallet';

const XREF_TOKEN_ID = getConfig().XREF_TOKEN_ID;
export const XREF_TOKEN_DECIMALS = 18;

export const metadata = async () => {
  return await refContractViewFunction({
    methodName: 'contract_metadata',
  });
};

export const getPrice = async () => {
  return await refContractViewFunction({
    methodName: 'get_virtual_price',
  });
};

interface StakeOptions {
  amount: string;
  msg?: string;
}

export const stake = async ({ amount, msg = '' }: StakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_TOKEN_ID,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: XREF_TOKEN_ID,
            amount: toNonDivisibleNumber(XREF_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '50000000000000',
        },
      ],
    },
  ];

  const balance = await ftGetStorageBalance(XREF_TOKEN_ID);

  if (!balance || balance.total === '0') {
    transactions.unshift({
      receiverId: XREF_TOKEN_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            account_id: getCurrentWallet().wallet.getAccountId(),
            registration_only: true,
          },
          gas: '50000000000000',
          amount: NEW_ACCOUNT_STORAGE_COST,
        },
      ],
    });
  }

  const needDeposit = await checkTokenNeedsStorageDeposit();
  if (needDeposit) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: needDeposit })],
    });
  }

  return executeMultipleTransactions(transactions);
};

interface UnstakeOptions {
  amount: string;
  msg?: string;
}
export const unstake = async ({ amount, msg = '' }: UnstakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: XREF_TOKEN_ID,
      functionCalls: [
        {
          methodName: 'unstake',
          args: {
            amount: toNonDivisibleNumber(XREF_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '100000000000000',
        },
      ],
    },
  ];
  const balance = await ftGetStorageBalance(REF_TOKEN_ID);

  if (!balance) {
    transactions.unshift({
      receiverId: REF_TOKEN_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            account_id: getCurrentWallet().wallet.getAccountId(),
            registration_only: true,
          },
          gas: '50000000000000',
          amount: NEW_ACCOUNT_STORAGE_COST,
        },
      ],
    });
  }
  const needDeposit = await checkTokenNeedsStorageDeposit();
  if (needDeposit) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: needDeposit })],
    });
  }

  return executeMultipleTransactions(transactions);
};
