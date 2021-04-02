import BN from 'bn.js';
import {
  near,
  ONE_YOCTO_NEAR,
  refFiFunctionCall,
  RefFiFunctionCallOptions,
  refFiManyFunctionCalls,
  refFiViewFunction,
  REF_FI_CONTRACT_ID,
  wallet,
} from './near';
import { KeyPair, utils } from 'near-api-js';
import { currentStorageBalance, MIN_DEPOSIT_PER_TOKEN } from './account';
import { toNonDivisibleNumber } from '~utils/numbers';
import {
  createTransaction,
  functionCall,
  Transaction,
} from 'near-api-js/lib/transaction';

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
      amount: '0.00125',
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
    await wallet.createTransaction({
      receiverId: token.id,
      actions: [
        functionCall(
          'ft_transfer_call',
          {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: toNonDivisibleNumber(token.decimals, amount),
            msg,
          },
          new BN('100000000000000'),
          new BN(utils.format.parseNearAmount(ONE_YOCTO_NEAR))
        ),
      ],
    }),
  ];

  const needsStorage = await checkTokenNeedsStorageDeposit(token.id);
  if (needsStorage) {
    transactions.unshift(
      await wallet.createTransaction({
        receiverId: REF_FI_CONTRACT_ID,
        nonceOffset: 2,
        actions: [
          functionCall(
            'storage_deposit',
            {
              account_id: wallet.getAccountId(),
              registration_only: false,
            },
            new BN('30000000000000'),
            new BN(utils.format.parseNearAmount('0.00125'))
          ),
        ],
      })
    );
  }

  return wallet.requestSignTransactions(transactions);
};

interface WithdrawOptions {
  tokenId: string;
  amount: string;
  unregister?: boolean;
}
export const withdraw = ({
  tokenId,
  amount,
  unregister = false,
}: WithdrawOptions) => {
  return refFiFunctionCall({
    methodName: 'withdraw',
    args: { token_id: tokenId, amount, unregister },
    amount: ONE_YOCTO_NEAR,
  });
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

export const getDepositableBalance = (tokenId: string): Promise<string> => {
  return wallet.account().viewFunction(tokenId, 'ft_balance_of', {
    account_id: wallet.getAccountId(),
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

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}

export const getTokenMetadata = async (id: string): Promise<TokenMetadata> => {
  try {
    const metadata = await wallet.account().viewFunction(id, 'ft_metadata', {});
    return {
      id,
      ...metadata,
    };
  } catch {
    return {
      id,
      name: id,
      symbol: id.split('.')[0].slice(0, 8),
      decimals: 6,
      icon:
        'https://fluxprotocol.eth.link/static/media/wrapped-near.8b3a5e4b.svg',
    };
  }
};
