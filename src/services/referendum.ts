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
export interface LockOptions {
  token_id: string;
  amount: string;
  duration: number;
  leftTime?: number;
}

export type Incentive = {
  incentive_type: string;
  incentive_token_id: string;
  incentive_amount: string;
  claimed_amount: string;
};

export interface Proposal {
  proposer: string;
  kind: {
    FarmingReward?: {
      farm_list: string[];
      total_reward: number;
    };
    description?: string | string[];
  };
  votes: string[];
  start_at: string;
  end_at: string;
  participants: string;
  incetive: null | Incentive;
  status: string;
  is_nonsense: null;
  id?: number;
}

export interface VoteDetail {
  [id: string]: {
    amount: string;
    action: {
      VoteFarm?: { farm_id: number };
      VotePoll?: { poll_id: number };
    };
  };
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

export const lockLP = async ({
  token_id,
  amount,
  duration,
  leftTime,
}: LockOptions) => {
  const msg =
    leftTime === duration
      ? JSON.stringify({
          Append: {
            append_duration_sec: 0,
          },
        })
      : JSON.stringify({ Lock: { duration_sec: duration } });

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
            msg,
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

export const cancelVote = async ({ proposal_id }: { proposal_id: number }) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'action_cancel',
          args: {
            proposal_id,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '180000000000000',
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};

export const getProposalList = () => {
  return refVeViewFunction({
    methodName: 'list_proposals',
  });
};

export const getProposal = (proposal_id: number) => {
  return refVeViewFunction({
    methodName: 'get_proposal',
    args: {
      proposal_id,
    },
  });
};

export const getVoteDetail = () => {
  return refVeViewFunction({
    methodName: 'get_vote_detail',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
  });
};

export const getVoteDetailHistory = () => {
  return refVeViewFunction({
    methodName: 'get_vote_detail_history',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
  });
};

export const getUnclaimedProposal = () => {
  return refVeViewFunction({
    methodName: 'get_unclaimed_proposal',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
  });
};

export const getUnclaimedRewards = () => {
  return refVeViewFunction({
    methodName: 'get_unclaimed_rewards',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
  });
};

export const VoteFarm = async ({
  proposal_id,
  index,
}: {
  proposal_id: number;
  index: number;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'action_proposal',
          args: {
            proposal_id: proposal_id,
            action: {
              VoteFarm: {
                farm_id: index,
              },
            },
          },
          gas: '180000000000000',
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};

export const VotePoll = async ({
  proposal_id,
  index,
}: {
  proposal_id: number;
  index: number;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'action_proposal',
          args: {
            proposal_id,
            action: {
              VotePoll: {
                poll_id: index,
              },
            },
          },
          gas: '180000000000000',
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};
