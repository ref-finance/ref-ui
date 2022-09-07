import React from 'react';
import {
  refFiViewFunction,
  refVeViewFunction,
  Transaction,
  REF_FI_CONTRACT_ID,
  REF_FARM_BOOST_CONTRACT_ID,
  ONE_YOCTO_NEAR,
} from './near';
import { getCurrentWallet } from '../utils/wallets-integration';
import { executeMultipleTransactions, REF_VE_CONTRACT_ID } from './near';
import {
  checkTokenNeedsStorageDeposit_boost,
  checkTokenNeedsStorageDeposit_ve,
} from './farm';
import { storageDepositAction } from './creators/storage';
import moment from 'moment';
import { ftGetTokenMetadata, ftGetStorageBalance } from './ft-contract';
import {
  toNonDivisibleNumber,
  ONLY_ZEROS,
  toReadableNumber,
} from '../utils/numbers';
import {
  WRAP_NEAR_CONTRACT_ID,
  nearDepositTransaction,
  nearWithdraw,
  nearWithdrawTransaction,
} from './wrap-near';
import { registerAccountOnToken } from './creators/token';
import { getProposalHashes } from './indexer';
export interface LockOptions {
  token_id: string;
  amount: string;
  duration: number;
  leftTime?: number;
}

export interface IncentiveItem {
  incentive_token_ids: string[];
  incentive_amounts: string[];
  claimed_amounts: string;
}

export type Incentive = {
  [index: string]: IncentiveItem;
};

export type ProposalStatus = 'WarmUp' | 'InProgress' | 'Expired';

export interface Proposal {
  proposer: string;
  kind: {
    FarmingReward?: {
      farm_list: string[];
      total_reward: number;
    };
    Poll?: {
      options?: string[];
      description?: string;
    };
    Common?: {
      description?: string;
    };
  };
  votes: string[];
  votesDetail: {
    total_ballots: string;
    participants: number;
  }[];
  start_at: string;
  end_at: string;
  description: string;
  participants: string;
  incentive: {} | Incentive;
  status: ProposalStatus;
  is_nonsense: null;
  transaction_hash?: string | null;
  id?: number;
  ve_amount_at_last_action: string;
}

export type VoteAction = {
  VoteFarm?: { farm_id: number };
  VotePoll?: { poll_id: number };
};

export interface VoteDetail {
  [id: string]: {
    amount: string;
    action: VoteAction;
  };
}

export interface Description {
  title: string;
  link: string;
}

export interface VEConfig {
  min_locking_duration_sec: number;
  max_locking_duration_sec: number;
  max_locking_multiplier: number;
  min_proposal_start_vote_offset_sec: number;
}

export const getAccountInfo = () => {
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
export const getLoveAmount = () => {
  return refVeViewFunction({
    methodName: 'ft_balance_of',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
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
            append_duration_sec: 1,
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

export const createProposal = async ({
  description,
  duration_sec,
  kind,
  options,
  start,
}: {
  description: Description;
  duration_sec: number;
  kind: 'Poll' | 'Common';
  options: string[];
  start: number;
}) => {
  const args = {
    kind:
      kind === 'Common'
        ? 'Common'
        : {
            [kind]: {
              options,
            },
          },
    description: JSON.stringify(description),
    start_at: start,
    duration_sec,
  };
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'create_proposal',
          args,
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

export const getProposalList = async () => {
  const list = await refVeViewFunction({
    methodName: 'list_proposals',
  }).then((reslist: any) => {
    return reslist.map((res: any) => {
      if (res?.kind?.Poll) {
        res.kind.Poll.description = res.description;
      }

      if (res?.kind === 'Common') {
        res.kind = {
          Common: {
            description: res.description,
          },
        };
      }

      return {
        ...res,
        votesDetail: res.votes,
        votes: res.votes.map((v: any) => v.total_ballots),
      };
    });
  });

  return list.filter((p: any) => {
    try {
      if (!p?.kind?.FarmingReward) {
        JSON.parse(p.description);
      }

      return true;
    } catch (error) {
      return false;
    }
  });
};

export const getProposal = async (proposal_id: number) => {
  return refVeViewFunction({
    methodName: 'get_proposal',
    args: {
      proposal_id,
    },
  }).then((res: any) => {
    if (res?.kind?.Poll) {
      res.kind.Poll.description = res.description;
    }
    if (res?.kind === 'Common') {
      res.kind = {
        Common: {
          description: res.description,
        },
      };
    }

    return {
      ...res,
      votesDetail: res.votes,
      votes: res.votes.map((v: any) => v.total_ballots),
    };
  });
};

export const batchFetchProposals = async (proposal_ids: number[]) => {
  return await Promise.all(proposal_ids.map((id) => getProposal(id)));
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

export const getUnclaimedRewards = async () => {
  const storage_balance_of = await refVeViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
  });

  if (storage_balance_of === null) return undefined;

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
          amount: ONE_YOCTO_NEAR,
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
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};

export const VoteCommon = async ({
  proposal_id,
  action,
}: {
  proposal_id: number;
  action: 'VoteApprove' | 'VoteReject';
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'action_proposal',
          args: {
            proposal_id,
            action,
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};

export const addBonus = async ({
  tokenId,
  amount,
  incentive_key,
  proposal_id,
}: {
  tokenId: string;
  amount: string;
  incentive_key: number;
  proposal_id: number;
}) => {
  const tokenMeta = await ftGetTokenMetadata(tokenId);

  const msg = JSON.stringify({
    Reward: {
      incentive_key,
      proposal_id,
    },
  });

  const transactions: Transaction[] = [
    {
      receiverId: tokenId,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_VE_CONTRACT_ID,
            amount: toNonDivisibleNumber(tokenMeta.decimals, amount),
            msg,
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];

  if (tokenId === WRAP_NEAR_CONTRACT_ID) {
    transactions.unshift(nearDepositTransaction(amount));
  }

  if (tokenId === WRAP_NEAR_CONTRACT_ID) {
    const registered = await ftGetStorageBalance(WRAP_NEAR_CONTRACT_ID);
    if (registered === null) {
      transactions.unshift({
        receiverId: WRAP_NEAR_CONTRACT_ID,
        functionCalls: [registerAccountOnToken()],
      });
    }
  }
  return executeMultipleTransactions(transactions);
};

export const claimRewardVE = async ({
  proposal_id,
}: {
  proposal_id: number;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'claim_reward',
          args: {
            proposal_id,
          },
          gas: '180000000000000',
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};

export const withdrawRewardVE = async ({
  token_ids,
  rewardList,
}: {
  token_ids: string[];
  rewardList: { tokenId: string; amount: string }[];
}) => {
  const transactions: Transaction[] = token_ids.map((token_id) => {
    return {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw_reward',
          args: {
            token_id,
          },
          gas: '180000000000000',
        },
      ],
    };
  });

  await Promise.all(
    token_ids.map(async (id, i) => {
      const tokenRegistered = await ftGetStorageBalance(id);
      if (tokenRegistered === null) {
        transactions.unshift({
          receiverId: id,
          functionCalls: [registerAccountOnToken()],
        });
      }
    })
  );

  if (token_ids.includes(WRAP_NEAR_CONTRACT_ID)) {
    const nearReward = rewardList.find(
      (r) => r.tokenId === WRAP_NEAR_CONTRACT_ID
    );
    if (!ONLY_ZEROS.test(nearReward.amount)) {
      transactions.push(
        nearWithdrawTransaction(toReadableNumber(24, nearReward.amount))
      );
    }
  }

  return executeMultipleTransactions(transactions);
};

export const claimAndWithdrawAll = async () => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'claim_and_withdraw_all',
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};

export const removeProposal = async (proposal_id: number) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_VE_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'remove_proposal',
          args: {
            proposal_id,
          },
          gas: '180000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];
  return executeMultipleTransactions(transactions);
};
