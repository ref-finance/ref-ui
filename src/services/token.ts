import BN from 'bn.js';
import * as math from 'mathjs';
import {
  ONE_YOCTO_NEAR,
  refFiFunctionCall,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
  refFiViewFunction,
  Transaction,
  REF_FI_CONTRACT_ID,
  wallet,
  executeMultipleTransactions,
} from './near';
import { ftGetStorageBalance, TokenMetadata } from './ft-contract';
import { ACCOUNT_MIN_STORAGE_AMOUNT, currentStorageBalance } from './account';
import { toNonDivisibleNumber } from '../utils/numbers';
import {
  MIN_DEPOSIT_PER_TOKEN,
  STORAGE_TO_REGISTER_WITH_FT,
  storageDepositAction,
  storageDepositForFTAction,
  STORAGE_PER_TOKEN,
} from './creators/storage';

export const checkTokenNeedsStorageDeposit = async (tokenId: string) => {
  let storageNeeded: math.MathType = 0;
  const [registeredTokens, balance] = await Promise.all([
    getUserRegisteredTokens(),
    currentStorageBalance(wallet.getAccountId()),
  ]);

  if (!balance) {
    storageNeeded = math.add(storageNeeded, Number(ACCOUNT_MIN_STORAGE_AMOUNT));
  }

  if (
    new BN(balance?.available || '0').lt(MIN_DEPOSIT_PER_TOKEN) &&
    !registeredTokens.includes(tokenId)
  ) {
    storageNeeded = math.add(storageNeeded, Number(STORAGE_PER_TOKEN));
  }

  return storageNeeded ? storageNeeded.toString() : '';
};

export const registerTokenAndExchange = async (tokenId: string) => {
  const transactions: Transaction[] = [];
  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'register_tokens',
      args: { token_ids: [tokenId] },
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit(tokenId);
  if (neededStorage) {
    actions.unshift(storageDepositAction({ amount: neededStorage }));
  }

  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: actions,
  });

  const exchangeBalanceAtFt = await ftGetStorageBalance(
    tokenId,
    REF_FI_CONTRACT_ID
  );
  if (!exchangeBalanceAtFt || exchangeBalanceAtFt.total === '0') {
    transactions.push({
      receiverId: tokenId,
      functionCalls: [storageDepositForFTAction()],
    });
  }

  return executeMultipleTransactions(transactions);
};

export const registerToken = async (tokenId: string) => {
  const registered = await ftGetStorageBalance(
    tokenId,
    REF_FI_CONTRACT_ID
  ).catch(() => {
    throw new Error(`${tokenId} doesn't exist.`);
  });
  if (!registered) throw new Error('No liquidity pools available for token');

  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'register_tokens',
      args: { token_ids: [tokenId] },
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit(tokenId);
  if (neededStorage) {
    actions.unshift(storageDepositAction({ amount: neededStorage }));
  }

  return refFiManyFunctionCalls(actions);
};

export const unregisterToken = (tokenId: string) => {
  return refFiFunctionCall({
    methodName: 'unregister_tokens',
    args: { token_ids: [tokenId] },
  });
};

interface DepositOptions {
  token: TokenMetadata;
  amount: string;
  msg?: string;
}
export const deposit = async ({ token, amount, msg = '' }: DepositOptions) => {
  const transactions: Transaction[] = [
    {
      receiverId: token.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: toNonDivisibleNumber(token.decimals, amount),
            msg,
          },
          amount: ONE_YOCTO_NEAR,
          gas: '100000000000000',
        },
      ],
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit(token.id);
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeMultipleTransactions(transactions);
};

interface WithdrawOptions {
  token: TokenMetadata;
  amount: string;
  unregister?: boolean;
}
export const withdraw = async ({
  token,
  amount,
  unregister = false,
}: WithdrawOptions) => {
  const parsedAmount = toNonDivisibleNumber(token.decimals, amount);
  const ftBalance = await ftGetStorageBalance(token.id);

  const transactions: Transaction[] = [
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw',
          args: { token_id: token.id, amount: parsedAmount, unregister },
          gas: '50000000000000',
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];

  if (!ftBalance || ftBalance.total === '0') {
    transactions.unshift({
      receiverId: token.id,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_FT,
        }),
      ],
    });
  }

  return executeMultipleTransactions(transactions);
};

export interface TokenBalancesView {
  [tokenId: string]: string;
}
export const getTokenBalances = (): Promise<TokenBalancesView> => {
  return refFiViewFunction({
    methodName: 'get_deposits',
    args: { account_id: wallet.getAccountId() },
  });
};

export const getUserRegisteredTokens = (
  accountId: string = wallet.getAccountId()
): Promise<string[]> => {
  return refFiViewFunction({
    methodName: 'get_user_whitelisted_tokens',
    args: { account_id: accountId },
  });
};

export const getWhitelistedTokens = async (): Promise<string[]> => {
  const [globalWhitelist, userWhitelist] = await Promise.all([
    refFiViewFunction({ methodName: 'get_whitelisted_tokens' }),
    refFiViewFunction({
      methodName: 'get_user_whitelisted_tokens',
      args: { account_id: wallet.getAccountId() },
    }),
  ]);

  return [...new Set<string>([...globalWhitelist, ...userWhitelist])];
};
