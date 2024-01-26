import Big from 'big.js';
import {
  Transaction,
  executeFarmMultipleTransactions,
  REF_FARM_BOOST_CONTRACT_ID,
  REF_MEME_FARM_CONTRACT_ID,
  ONE_YOCTO_NEAR,
  refMeMeFarmViewFunction,
} from './near';
import {
  storageDepositAction,
  STORAGE_TO_REGISTER_WITH_MFT,
} from '../services/creators/storage';
import { getCurrentWallet } from '../utils/wallets-integration';
import { currentStorageBalanceOfMeme_farm } from './account';
import { Seed, FarmBoost } from '~src/services/farm';
import { ftGetStorageBalance } from '../services/ft-contract';
import { WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
interface StakeOptions {
  seed: Seed;
  amount: string;
  msg?: string;
}
interface UnStakeOptions {
  seed: Seed;
  amount: string;
  withdrawAmount?: string;
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
export const stake = async ({ seed, amount = '' }: StakeOptions) => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
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
  transactions = await withdrawReards(seed, transactions);
  return executeFarmMultipleTransactions(transactions);
};
export const unStake = async ({
  seed,
  amount,
  withdrawAmount,
}: UnStakeOptions) => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
  if (withdrawAmount) {
    transactions.push({
      receiverId: REF_MEME_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw_seed',
          args: {
            seed_id,
            amount: withdrawAmount,
          },
          gas: '200000000000000',
        },
      ],
    });
  }
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
  transactions = await withdrawReards(seed, transactions);

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
export const claim = async (seed: Seed): Promise<any> => {
  const { seed_id } = seed;
  let transactions: Transaction[] = [];
  transactions.push({
    receiverId: REF_MEME_FARM_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'claim_reward_by_seed',
        args: { seed_id },
        gas: '200000000000000',
      },
    ],
  });
  transactions = await withdrawReards(seed, transactions);
  return executeFarmMultipleTransactions(transactions);
};
async function withdrawReards(seed: Seed, transactions: Transaction[]) {
  const { farmList, seed_id } = seed;
  const rewardIds = farmList.map((farm: FarmBoost) => farm.terms.reward_token);
  const functionCalls: any[] = [];
  const ftBalancePromiseList: any[] = [];
  rewardIds.forEach((token_id) => {
    const ftBalance = ftGetStorageBalance(token_id);
    ftBalancePromiseList.push(ftBalance);
    functionCalls.push({
      methodName: 'withdraw_reward',
      args: {
        token_id,
      },
      gas: '50000000000000',
    });
  });
  const resolvedBalanceList = await Promise.all(ftBalancePromiseList);
  resolvedBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.unshift({
        receiverId: rewardIds[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_MFT,
          }),
        ],
      });
    }
  });
  transactions.push({
    receiverId: REF_MEME_FARM_CONTRACT_ID,
    functionCalls,
  });
  let unclaimed_rewards = {};
  try {
    unclaimed_rewards = await get_unclaimed_rewards(seed_id);
  } catch (error) {}
  const wnear_rewards_amount = unclaimed_rewards[WRAP_NEAR_CONTRACT_ID];
  if (Big(wnear_rewards_amount || 0).gt(0)) {
    transactions.push({
      receiverId: WRAP_NEAR_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'near_withdraw',
          args: {
            amount: wnear_rewards_amount,
          },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    });
  }
  return transactions;
}
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
      lp_farm: {
        'lonk.fakes.testnet': '716',
        'neko.fakes.testnet': '717',
        'blackdragon.fakes.testnet': '718',
        'shitzu.fakes.testnet': '719',
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
      lp_farm: {
        'lonk.fakes.testnet': '716',
        'neko.fakes.testnet': '717',
        'blackdragon.fakes.testnet': '718',
        'shitzu.fakes.testnet': '719',
      },
    };
  } else {
    return {
      description: {
        'token.lonkingnearbackto2024.near':
          'LONK reads as “Long”, LONK is long, LONK IS 龍, LONK is dragon (insert Illia), LONK is fren with BONK, LONK is love, LONK is not your average meme coin...',
        'ftv2.nekotoken.near':
          'NEKO is the first community token on NEAR with a focus on creator empowerment. NEKO is on a mission to bring mass adoption to NEAR protocol.',
        'blackdragon.tkn.near':
          'Dawn of BLACKDRAGON | the next gen, fully open-source & community-driven, memecoin native to NEAR',
        'token.0xshitzu.near':
          'Shitzu is entirely community-run and no longer controlled by Bastion',
      },
      lp_farm: {
        'token.lonkingnearbackto2024.near': '4314',
        'ftv2.nekotoken.near': '3807',
        'blackdragon.tkn.near': '4276',
        'token.0xshitzu.near': '4369',
      },
    };
  }
}
// getMemeSeedApr
export function getSeedApr(seed: Seed) {
  if (!seed) return '0';
  const farms = seed.farmList;
  let apr = new Big(0);
  const allPendingFarms = isPending(seed);
  farms.forEach(function (item: FarmBoost) {
    const pendingFarm = item.status == 'Created' || item.status == 'Pending';
    if (allPendingFarms || (!allPendingFarms && !pendingFarm)) {
      apr = apr.plus(item.apr);
    }
  });
  return apr.mul(100).toFixed();
}
export function isPending(seed: Seed) {
  let pending: boolean = true;
  const farms = seed.farmList;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
      pending = false;
      break;
    }
  }
  return pending;
}
export function isEnded(seed: Seed) {
  let isEnded: boolean = true;
  const farms = seed.farmList;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != 'Ended') {
      isEnded = false;
      break;
    }
  }
  return isEnded;
}
