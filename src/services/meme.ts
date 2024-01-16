import Big from 'big.js';
import {
  Transaction,
  executeFarmMultipleTransactions,
  REF_FARM_BOOST_CONTRACT_ID,
  REF_MEME_FARM_CONTRACT_ID,
  ONE_YOCTO_NEAR,
  refMeMeFarmViewFunction,
  refMeMeFarmFunctionCall,
} from './near';
import { storageDepositAction } from '../services/creators/storage';
import { getCurrentWallet } from '../utils/wallets-integration';
import { currentStorageBalanceOfMeme_farm } from './account';
interface StakeOptions {
  seed_id: string;
  amount: string;
  msg?: string;
}
interface UnStakeOptions {
  seed_id: string;
  amount: string;
}
export interface IMemefarmConfig {
  delay_withdraw_sec: number;
  seed_slash_rate: number;
  booster_seeds: any;
  max_num_farms_per_booster: number;
  max_num_farms_per_seed: number;
  maximum_locking_duration_sec: number;
  max_locking_multiplier: number;
}
export interface IFarmerWithdraw {
  amount: string;
  apply_timestamp: string;
}
export const checkTokenNeedsStorageDeposit_meme = async () => {
  let storageNeeded;
  const balance = await currentStorageBalanceOfMeme_farm(
    getCurrentWallet().wallet.getAccountId()
  );

  if (!balance) {
    // TDOO
    storageNeeded = '0.1';
  }
  return storageNeeded;
};

export const list_seeds_info = async () => {
  return await refMeMeFarmViewFunction({
    methodName: 'list_seeds_info',
  });
};

export const list_seed_farms = async (seed_id: string) => {
  try {
    return await refMeMeFarmViewFunction({
      methodName: 'list_seed_farms',
      args: { seed_id },
    });
  } catch {
    return null;
  }
};

export const list_farmer_seeds = async () => {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await refMeMeFarmViewFunction({
    methodName: 'list_farmer_seeds',
    args: { farmer_id: accountId },
  });
};

export const list_farmer_withdraws = async () => {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await refMeMeFarmViewFunction({
    methodName: 'list_farmer_withdraws',
    args: { farmer_id: accountId },
  });
};

export const get_config = async () => {
  return await refMeMeFarmViewFunction({
    methodName: 'get_config',
  });
};
export const get_unclaimed_rewards = async (seed_id: string) => {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await refMeMeFarmViewFunction({
    methodName: 'get_unclaimed_rewards',
    args: { farmer_id: accountId, seed_id },
  });
};
export const stake = async ({ seed_id, amount = '' }: StakeOptions) => {
  const transactions: Transaction[] = [];
  const functionCalls = [];
  functionCalls.push({
    methodName: 'ft_transfer_call',
    args: {
      receiver_id: REF_MEME_FARM_CONTRACT_ID,
      amount,
      msg: JSON.stringify('Free'),
    },
    amount: ONE_YOCTO_NEAR,
    gas: '180000000000000',
  });
  transactions.push({
    receiverId: seed_id,
    functionCalls,
  });
  const neededStorage = await checkTokenNeedsStorageDeposit_meme();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeFarmMultipleTransactions(transactions);
};
export const unStake = async ({ seed_id, amount }: UnStakeOptions) => {
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: REF_MEME_FARM_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'unlock_and_unstake_seed',
        args: {
          seed_id,
          unlock_amount: '0',
          unstake_amount: amount,
        },
        amount: ONE_YOCTO_NEAR,
        gas: '200000000000000',
      },
    ],
  });
  const neededStorage = await checkTokenNeedsStorageDeposit_meme();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeFarmMultipleTransactions(transactions);
};
export const withdraw = async ({
  seed_id,
  amount,
}: {
  seed_id: string;
  amount: string;
}) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw_seed',
          args: {
            seed_id,
            amount,
          },
          gas: '200000000000000',
        },
      ],
    },
  ];

  const neededStorage_boost = await checkTokenNeedsStorageDeposit_meme();
  if (neededStorage_boost) {
    transactions.push({
      receiverId: REF_FARM_BOOST_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage_boost })],
    });
  }
  return executeFarmMultipleTransactions(transactions);
};
export const claim = async (seed_id: string): Promise<any> => {
  return refMeMeFarmFunctionCall({
    methodName: 'claim_reward_by_seed',
    args: { seed_id },
  });
};
// config
export function getMemeConfig(): any {
  const env: string = process.env.REACT_APP_NEAR_ENV;
  if (env == 'pub-testnet') {
    return {
      description: {
        'lonk.fakes.testnet':
          'LONK reads as “Long”, LONK is long, LONK IS 龍, LONK is dragon (insert Illia), LONK is fren with BONK, LONK is love, LONK is not your average meme coin...',
        'neko.fakes.testnet':
          'NEKO is the first community token on NEAR with a focus on creator empowerment. NEKO is on a mission to bring mass adoption to NEAR protocol.',
        'blackdragon.fakes.testnet':
          'Dawn of BLACKDRAGON | the next gen, fully open-source & community-driven, memecoin native to NEAR',
        'shitzu.fakes.testnet':
          'Shitzu is entirely community-run and no longer controlled by Bastion',
      },
    };
  } else if (env == 'testnet') {
    return {
      description: {
        'lonk.fakes.testnet':
          'LONK reads as “Long”, LONK is long, LONK IS 龍, LONK is dragon (insert Illia), LONK is fren with BONK, LONK is love, LONK is not your average meme coin...',
        'neko.fakes.testnet':
          'NEKO is the first community token on NEAR with a focus on creator empowerment. NEKO is on a mission to bring mass adoption to NEAR protocol.',
        'blackdragon.fakes.testnet':
          'Dawn of BLACKDRAGON | the next gen, fully open-source & community-driven, memecoin native to NEAR',
        'shitzu.fakes.testnet':
          'Shitzu is entirely community-run and no longer controlled by Bastion',
      },
    };
  } else {
    return {
      description: {},
    };
  }
}
