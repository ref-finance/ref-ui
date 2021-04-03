import BN from 'bn.js';
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
import { currentStorageBalance, MIN_DEPOSIT_PER_TOKEN } from './account';
import { toNonDivisibleNumber } from '../utils/numbers';

export const checkTokenNeedsStorageDeposit = async (tokenId: string) => {
  const [registeredTokens, { available }] = await Promise.all([
    getUserRegisteredTokens(),
    currentStorageBalance(wallet.getAccountId()),
  ]);

  return (
    new BN(available).lt(MIN_DEPOSIT_PER_TOKEN) &&
    !registeredTokens.includes(tokenId)
  );
};

export const registerToken = async (tokenId: string) => {
  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'register_tokens',
      args: { token_ids: [tokenId] },
    },
  ];

  const needsStorageDeposit = await checkTokenNeedsStorageDeposit(tokenId);
  if (needsStorageDeposit) {
    actions.unshift({
      methodName: 'storage_deposit',
      args: { account_id: wallet.getAccountId(), registration_only: false },
      amount: '0.00084',
    });
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

  const needsStorage = await checkTokenNeedsStorageDeposit(token.id);
  if (needsStorage) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            account_id: wallet.getAccountId(),
            registration_only: false,
          },
          amount: '0.00084',
        },
      ],
    });
  }

  return executeMultipleTransactions(transactions);
};

interface WithdrawOptions {
  tokenId: string;
  amount: string;
  unregister?: boolean;
}
export const withdraw = async ({
  tokenId,
  amount,
  unregister = false,
}: WithdrawOptions) => {
  const ftBalance = await ftGetStorageBalance(tokenId);

  const transactions: Transaction[] = [
    {
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [
        {
          methodName: 'withdraw',
          args: { token_id: tokenId, amount, unregister },
          amount: ONE_YOCTO_NEAR,
        },
      ],
    },
  ];

  if (!ftBalance || ftBalance.total === '0') {
    transactions.unshift({
      receiverId: tokenId,
      functionCalls: [
        {
          methodName: 'storage_balance',
          args: { account_id: wallet.getAccountId(), registration_only: true },
          amount: '0.1',
        },
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

export const getUserRegisteredTokens = (): Promise<string[]> => {
  return refFiViewFunction({
    methodName: 'get_user_whitelisted_tokens',
    args: { account_id: wallet.getAccountId() },
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
