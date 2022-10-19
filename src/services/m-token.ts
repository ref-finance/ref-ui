import BN from 'bn.js';
import * as math from 'mathjs';
import {
  ONE_YOCTO_NEAR,
  Transaction,
  executeFarmMultipleTransactions,
  REF_FI_CONTRACT_ID,
  REF_FARM_CONTRACT_ID,
  wallet,
} from '../services/near';
import { ftGetStorageBalance, TokenMetadata } from '../services/ft-contract';
import { toNonDivisibleNumber, toReadableNumber } from '../utils/numbers';
import {
  ACCOUNT_MIN_STORAGE_AMOUNT,
  currentStorageBalanceOfFarm,
} from '../services/account';
import {
  MIN_DEPOSIT_PER_TOKEN,
  storageDepositAction,
  STORAGE_PER_TOKEN,
  STORAGE_TO_REGISTER_WITH_MFT,
  MIN_DEPOSIT_PER_TOKEN_FARM,
} from '../services/creators/storage';
import { WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
import { utils } from 'near-api-js';
import getConfig from '../services/config';
import { getCurrentWallet } from '../utils/wallets-integration';
import { nearWithdrawTransaction, nearMetadata } from './wrap-near';
const config = getConfig();
const STABLE_POOL_IDS = config.STABLE_POOL_IDS;

export const LP_TOKEN_DECIMALS = 24;
export const LP_STABLE_TOKEN_DECIMALS = 18;
export const FARM_STORAGE_BALANCE = '0.045';

export const checkTokenNeedsStorageDeposit = async (page?: string) => {
  let storageNeeded: math.MathType = 0;
  const balance = await currentStorageBalanceOfFarm(
    getCurrentWallet()?.wallet?.getAccountId()
  );

  if (!balance) {
    storageNeeded = math.add(storageNeeded, Number(ACCOUNT_MIN_STORAGE_AMOUNT));
  }
  if (page && page == 'farm') {
    if (new BN(balance?.available || '0').lt(MIN_DEPOSIT_PER_TOKEN_FARM)) {
      storageNeeded = math.add(storageNeeded, Number(FARM_STORAGE_BALANCE));
    }
  } else {
    if (new BN(balance?.available || '0').lt(MIN_DEPOSIT_PER_TOKEN)) {
      storageNeeded = math.add(storageNeeded, Number(STORAGE_PER_TOKEN));
    }
  }
  return storageNeeded ? storageNeeded.toString() : '';
};

interface StakeOptions {
  token_id: string;
  amount: string;
  msg?: string;
  poolId?: string;
}

export const stake = async ({
  token_id,
  amount,
  msg = '',
  poolId = '',
}: StakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'mft_transfer_call',
          args: {
            receiver_id: REF_FARM_CONTRACT_ID,
            token_id: token_id,
            amount: new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
              ? toNonDivisibleNumber(LP_STABLE_TOKEN_DECIMALS, amount)
              : toNonDivisibleNumber(LP_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '180000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit('farm');
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: FARM_STORAGE_BALANCE })],
    });
  }

  return executeFarmMultipleTransactions(transactions);
};

interface UnstakeOptions {
  seed_id: string;
  amount: string;
  msg?: string;
  poolId?: string;
}
export const unstake = async ({
  seed_id,
  amount,
  msg = '',
  poolId = '',
}: UnstakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw_seed',
          args: {
            seed_id: seed_id,
            amount: new Set(STABLE_POOL_IDS || []).has(poolId?.toString())
              ? toNonDivisibleNumber(LP_STABLE_TOKEN_DECIMALS, amount)
              : toNonDivisibleNumber(LP_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '200000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit('farm');
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FARM_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: FARM_STORAGE_BALANCE })],
    });
  }

  return executeFarmMultipleTransactions(transactions);
};

interface WithdrawOptions {
  token_id: string;
  amount: string;
  token: TokenMetadata;
  unregister?: boolean;
}

export const withdrawReward = async ({
  token_id,
  amount,
  token,
  unregister = false,
}: WithdrawOptions) => {
  const transactions: Transaction[] = [];

  const parsedAmount = toNonDivisibleNumber(token.decimals, amount);
  const ftBalance = await ftGetStorageBalance(token_id);

  if (!ftBalance || ftBalance.total === '0') {
    transactions.unshift({
      receiverId: token_id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }

  transactions.push({
    receiverId: REF_FARM_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'withdraw_reward',
        args: { token_id: token_id, amount: parsedAmount, unregister },
        gas: '100000000000000',
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  if (token_id === WRAP_NEAR_CONTRACT_ID) {
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
  }

  return executeFarmMultipleTransactions(transactions);
};

export const withdrawAllReward = async (
  checkedList: Record<string, any>,
  unregister = false
) => {
  const transactions: Transaction[] = [];
  const token_id_list = Object.keys(checkedList);
  const ftBalancePromiseList: any[] = [];
  const functionCalls: any[] = [];
  token_id_list.forEach((token_id) => {
    const ftBalance = ftGetStorageBalance(token_id);
    ftBalancePromiseList.push(ftBalance);
    functionCalls.push({
      methodName: 'withdraw_reward',
      args: {
        token_id: token_id,
        amount: checkedList[token_id].value,
        unregister,
      },
      gas: '40000000000000',
      amount: ONE_YOCTO_NEAR,
    });
  });
  const resolvedBalanceList = await Promise.all(ftBalancePromiseList);
  resolvedBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.unshift({
        receiverId: token_id_list[index],
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
    receiverId: REF_FARM_CONTRACT_ID,
    functionCalls,
  });

  if (Object.keys(checkedList).includes(WRAP_NEAR_CONTRACT_ID)) {
    transactions.push(
      nearWithdrawTransaction(
        toReadableNumber(
          nearMetadata.decimals,
          checkedList[WRAP_NEAR_CONTRACT_ID].value
        )
      )
    );
  }

  return executeFarmMultipleTransactions(transactions);
};
