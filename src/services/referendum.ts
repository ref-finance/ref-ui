import React from 'react';
import {
  refFiViewFunction,
  refVeViewFunction,
  Transaction,
  REF_FI_CONTRACT_ID,
  REF_FARM_BOOST_CONTRACT_ID,
  ONE_YOCTO_NEAR,
} from './near';
import { getCurrentWallet } from '../utils/sender-wallet';
import { executeMultipleTransactions, REF_VE_CONTRACT_ID } from './near';
import {
  checkTokenNeedsStorageDeposit_boost,
  checkTokenNeedsStorageDeposit_ve,
} from './farm';
import { storageDepositAction } from './creators/storage';
interface StakeOptions {
  token_id: string;
  amount: string;
  msg?: string;
  duration: number;
}
export interface VEConfig {
  lock_near_per_proposal?: string;
  max_locking_duration_sec: number;
  max_locking_multiplier: number;
  min_proposal_start_vote_offset: string;
  min_locking_duration_sec: number;
}

export const getAccountInfo = () => {
  console.log(getCurrentWallet().wallet.getAccountId());
  return refVeViewFunction({
    methodName: 'get_account_info',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
  });
};

export const getVEMetaData = () => {
  return refVeViewFunction({
    methodName: 'get_metadata',
  });
};

export const getVEConfig = () => {
  return refVeViewFunction({
    methodName: 'get_config',
  });
};

export const lockLP = async ({ token_id, amount, duration }: StakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'mft_transfer_call',
          args: {
            receiver_id: REF_VE_CONTRACT_ID,
            token_id,
            amount,
            msg: JSON.stringify({ Lock: { duration_sec: duration } }),
          },
          amount: ONE_YOCTO_NEAR,
          gas: '180000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit_ve();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeMultipleTransactions(transactions);
};

export const unlockLP = async ({ amount }: { amount?: string }) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw_lpt',
          args: {
            amount,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '180000000000000',
        },
      ],
    },
  ];

  return executeMultipleTransactions(transactions);
};
