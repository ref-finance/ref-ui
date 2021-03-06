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
import { toNonDivisibleNumber } from '~utils/numbers';
import {
  ACCOUNT_MIN_STORAGE_AMOUNT,
  currentStorageBalanceOfFarm,
} from '../services/account';
import {
  MIN_DEPOSIT_PER_TOKEN,
  storageDepositAction,
  STORAGE_PER_TOKEN,
  STORAGE_TO_REGISTER_WITH_MFT,
} from '../services/creators/storage';
import { WRAP_NEAR_CONTRACT_ID } from '~services/wrap-near';
import { utils } from 'near-api-js';

export const LP_TOKEN_DECIMALS = 24;
export const FARM_STORAGE_BALANCE = '0.1';

export const checkTokenNeedsStorageDeposit = async () => {
  let storageNeeded: math.MathType = 0;
  const balance = await currentStorageBalanceOfFarm(wallet.getAccountId());

  if (!balance) {
    storageNeeded = math.add(storageNeeded, Number(ACCOUNT_MIN_STORAGE_AMOUNT));
  }

  if (new BN(balance?.available || '0').lt(MIN_DEPOSIT_PER_TOKEN)) {
    storageNeeded = math.add(storageNeeded, Number(STORAGE_PER_TOKEN));
  }

  return storageNeeded ? storageNeeded.toString() : '';
};

interface StakeOptions {
  token_id: string;
  amount: string;
  msg?: string;
}

export const stake = async ({ token_id, amount, msg = '' }: StakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'mft_transfer_call',
          args: {
            receiver_id: REF_FARM_CONTRACT_ID,
            token_id: token_id,
            amount: toNonDivisibleNumber(LP_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '100000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit();
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
}
export const unstake = async ({
  seed_id,
  amount,
  msg = '',
}: UnstakeOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: REF_FARM_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw_seed',
          args: {
            seed_id: seed_id,
            amount: toNonDivisibleNumber(LP_TOKEN_DECIMALS, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '100000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit();
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
