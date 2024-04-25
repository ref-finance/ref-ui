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
import { toNonDivisibleNumber, ONLY_ZEROS } from '../utils/numbers';
import {
  MIN_DEPOSIT_PER_TOKEN,
  STORAGE_TO_REGISTER_WITH_FT,
  storageDepositAction,
  storageDepositForFTAction,
  needDepositStorage,
  STORAGE_PER_TOKEN,
  ONE_MORE_DEPOSIT_AMOUNT,
} from './creators/storage';
import { unwrapNear, WRAP_NEAR_CONTRACT_ID } from './wrap-near';
import { registerTokenAction } from './creators/token';
import { getUserWalletTokens } from './api';
import { extraStableTokenIds, REF_UNI_V3_SWAP_CONTRACT_ID } from './near';
import getConfig from './config';
import {
  getCurrentWallet,
  WALLET_TYPE,
  senderWallet,
} from '../utils/wallets-integration';

const specialToken = 'pixeltoken.near';

export const checkTokenNeedsStorageDeposit = async () => {
  let storageNeeded: math.MathType = 0;

  const needDeposit = await needDepositStorage();
  if (needDeposit) {
    storageNeeded = Number(ONE_MORE_DEPOSIT_AMOUNT);
  } else {
    const balance = await Promise.resolve(
      currentStorageBalance(getCurrentWallet()?.wallet?.getAccountId())
    );

    if (!balance) {
      storageNeeded = math.add(
        storageNeeded,
        Number(ACCOUNT_MIN_STORAGE_AMOUNT)
      );
    }

    if (new BN(balance?.available || '0').lt(MIN_DEPOSIT_PER_TOKEN)) {
      storageNeeded = math.add(storageNeeded, Number(STORAGE_PER_TOKEN));
    }
  }

  return storageNeeded ? storageNeeded.toString() : '';
};

export const registerTokenAndExchange = async (tokenId: string) => {
  const transactions: Transaction[] = [];
  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'register_tokens',
      args: { token_ids: [tokenId] },
      amount: ONE_YOCTO_NEAR,
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit();

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
  if (!exchangeBalanceAtFt) {
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

  const actions: RefFiFunctionCallOptions[] = [registerTokenAction(tokenId)];

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    actions.unshift(storageDepositAction({ amount: neededStorage }));
  }

  return refFiManyFunctionCalls(actions);
};

export const unregisterToken = async (tokenId: string) => {
  const actions: RefFiFunctionCallOptions[] = [
    {
      methodName: 'unregister_tokens',
      args: { token_ids: [tokenId] },
      amount: ONE_YOCTO_NEAR,
    },
  ];

  const neededStorage = await checkTokenNeedsStorageDeposit();

  if (neededStorage) {
    actions.unshift(storageDepositAction({ amount: neededStorage }));
  }

  return refFiManyFunctionCalls(actions);
};

interface DepositOptions {
  token: TokenMetadata;
  amount: string;
  msg?: string;
}

export const getDepositTransactions = async ({
  tokens,
  amounts,
  msgs,
}: {
  tokens: TokenMetadata[];
  amounts: string[];
  msgs?: string[];
}) => {
  const whitelist = await getWhitelistedTokens();

  const transactions: Transaction[] = [];

  for (let i = 0; i < tokens.length; i++) {
    if (ONLY_ZEROS.test(amounts[i])) continue;
    const token = tokens[i];
    const gasFee =
      token.id === specialToken ? '150000000000000' : '100000000000000';
    transactions.unshift({
      receiverId: token.id,
      functionCalls: [
        {
          methodName: 'ft_transfer_call',
          args: {
            receiver_id: REF_FI_CONTRACT_ID,
            amount: toNonDivisibleNumber(token.decimals, amounts[i]),
            msg: msgs?.[i] || '',
          },
          amount: ONE_YOCTO_NEAR,
          gas: gasFee,
        },
      ],
    });

    const exchangeBalanceAtFt = await ftGetStorageBalance(
      token.id,
      REF_FI_CONTRACT_ID
    );

    if (!exchangeBalanceAtFt) {
      transactions.unshift({
        receiverId: token.id,
        functionCalls: [
          {
            methodName: 'storage_deposit',
            args: {
              account_id: REF_FI_CONTRACT_ID,
              registration_only: true,
            },
            amount: STORAGE_TO_REGISTER_WITH_FT,
            gas: '30000000000000',
          },
        ],
      });
    }

    if (!whitelist.includes(token.id)) {
      transactions.unshift({
        receiverId: REF_FI_CONTRACT_ID,
        functionCalls: [registerTokenAction(token.id)],
      });
    }
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();

  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return transactions;
};

export const deposit = async ({ token, amount, msg = '' }: DepositOptions) => {
  const gasFee =
    token.id === specialToken ? '150000000000000' : '100000000000000';

  const transactions: Transaction[] = [];

  transactions.unshift({
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
        gas: gasFee,
      },
    ],
  });

  const exchangeBalanceAtFt = await ftGetStorageBalance(
    token.id,
    REF_FI_CONTRACT_ID
  );

  if (!exchangeBalanceAtFt) {
    transactions.unshift({
      receiverId: token.id,
      functionCalls: [
        {
          methodName: 'storage_deposit',
          args: {
            account_id: REF_FI_CONTRACT_ID,
            registration_only: true,
          },
          amount: STORAGE_TO_REGISTER_WITH_FT,
          gas: '30000000000000',
        },
      ],
    });
  }

  const whitelist = await getWhitelistedTokens();
  if (!whitelist.includes(token.id)) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [registerTokenAction(token.id)],
    });
  }

  const neededStorage = await checkTokenNeedsStorageDeposit();
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
  if (token.id === WRAP_NEAR_CONTRACT_ID) {
    return unwrapNear(amount);
  }

  const transactions: Transaction[] = [];
  const parsedAmount = toNonDivisibleNumber(token.decimals, amount);
  const ftBalance = await ftGetStorageBalance(token.id);

  transactions.unshift({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'withdraw',
        args: { token_id: token.id, amount: parsedAmount, unregister },
        gas: '100000000000000',
        amount: ONE_YOCTO_NEAR,
      },
    ],
  });

  if (ftBalance === null) {
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

  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    transactions.unshift({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }

  return executeMultipleTransactions(transactions);
};

export const batchWithdraw = async (tokenMap: any) => {
  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit();

  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  const tokenIdList = Object.keys(tokenMap);
  const ftBalancePromiseList: any[] = [];
  tokenIdList.forEach(async (tokenId) => {
    const promise = ftGetStorageBalance(tokenId);
    ftBalancePromiseList.push(promise);
  });
  const ftBalanceList = await Promise.all(ftBalancePromiseList);
  ftBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.push({
        receiverId: tokenIdList[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  });

  const widthdrawActions: any[] = [];
  let wNEARAction;
  tokenIdList.forEach((tokenId) => {
    const { decimals, amount } = tokenMap[tokenId];
    const parsedAmount = toNonDivisibleNumber(decimals, amount);
    widthdrawActions.push({
      methodName: 'withdraw',
      args: {
        token_id: tokenId,
        amount: parsedAmount,
        unregister: false,
        skip_unwrap_near: false,
      },
      gas: '55000000000000',
      amount: ONE_YOCTO_NEAR,
    });
    // if (tokenId === WRAP_NEAR_CONTRACT_ID) {
    //   wNEARAction = {
    //     receiverId: WRAP_NEAR_CONTRACT_ID,
    //     functionCalls: [
    //       {
    //         methodName: 'near_withdraw',
    //         args: {
    //           amount: parsedAmount,
    //         },
    //         amount: ONE_YOCTO_NEAR,
    //       },
    //     ],
    //   };
    // }
  });
  transactions.push({
    receiverId: REF_FI_CONTRACT_ID,
    functionCalls: widthdrawActions,
  });
  if (wNEARAction) {
    transactions.push(wNEARAction);
  }
  return executeMultipleTransactions(transactions);
};

export const batchWithdrawDCL = async (tokenMap: any) => {
  const transactions: Transaction[] = [];
  const neededStorage = await checkTokenNeedsStorageDeposit();
  if (neededStorage) {
    transactions.push({
      receiverId: REF_FI_CONTRACT_ID,
      functionCalls: [storageDepositAction({ amount: neededStorage })],
    });
  }
  const tokenIdList = Object.keys(tokenMap);
  const ftBalancePromiseList: any[] = [];
  tokenIdList.forEach(async (tokenId) => {
    const promise = ftGetStorageBalance(tokenId);
    ftBalancePromiseList.push(promise);
  });
  const ftBalanceList = await Promise.all(ftBalancePromiseList);
  ftBalanceList.forEach((ftBalance, index) => {
    if (!ftBalance) {
      transactions.push({
        receiverId: tokenIdList[index],
        functionCalls: [
          storageDepositAction({
            registrationOnly: true,
            amount: STORAGE_TO_REGISTER_WITH_FT,
          }),
        ],
      });
    }
  });

  const widthdrawActions: any[] = [];
  tokenIdList.forEach((tokenId) => {
    const { decimals, amount } = tokenMap[tokenId];
    const parsedAmount = toNonDivisibleNumber(decimals, amount);
    widthdrawActions.push({
      methodName: 'withdraw_asset',
      args: { token_id: tokenId, amount: parsedAmount },
      gas: '55000000000000',
    });
  });
  transactions.push({
    receiverId: REF_UNI_V3_SWAP_CONTRACT_ID,
    functionCalls: widthdrawActions,
  });

  return executeMultipleTransactions(transactions);
};

export interface TokenBalancesView {
  [tokenId: string]: string;
}

export const getTokenBalances = (): Promise<TokenBalancesView> => {
  return refFiViewFunction({
    methodName: 'get_deposits',
    args: { account_id: getCurrentWallet()?.wallet?.getAccountId() },
  });
};

export const getTokenBalance = (tokenId: string): Promise<number> => {
  return refFiViewFunction({
    methodName: 'get_deposit',
    args: {
      account_id: getCurrentWallet()?.wallet?.getAccountId(),
      token_id: tokenId,
    },
  });
};

export const getUserRegisteredTokens = (
  accountId: string = getCurrentWallet()?.wallet?.getAccountId()
): Promise<string[]> => {
  return refFiViewFunction({
    methodName: 'get_user_whitelisted_tokens',
    args: { account_id: accountId },
  });
};

export const getWhitelistedTokens = async (): Promise<string[]> => {
  let userWhitelist = [];
  const globalWhitelist = await refFiViewFunction({
    methodName: 'get_whitelisted_tokens',
  });
  if (getCurrentWallet()?.wallet?.isSignedIn()) {
    userWhitelist = await refFiViewFunction({
      methodName: 'get_user_whitelisted_tokens',
      args: { account_id: getCurrentWallet()?.wallet?.getAccountId() },
    });
  }

  return [
    ...new Set<string>([
      ...globalWhitelist,
      ...userWhitelist,
      ...extraStableTokenIds,
    ]),
  ];
};
export const getWhitelistedTokensInfo = async (): Promise<
  Record<string, string[]>
> => {
  let userWhitelist = [];
  const globalWhitelist = await refFiViewFunction({
    methodName: 'get_whitelisted_tokens',
  });
  if (getCurrentWallet()?.wallet?.isSignedIn()) {
    userWhitelist = await refFiViewFunction({
      methodName: 'get_user_whitelisted_tokens',
      args: { account_id: getCurrentWallet()?.wallet?.getAccountId() },
    });
  }
  return {
    globalWhitelist: [
      ...new Set<string>([...globalWhitelist, ...extraStableTokenIds]),
    ],
    userWhitelist,
  };
};

export const getGlobalWhitelist = async (): Promise<string[]> => {
  const globalWhitelist = await refFiViewFunction({
    methodName: 'get_whitelisted_tokens',
  });
  return [...new Set<string>([...globalWhitelist])];
};

export const getWhitelistedTokensAndNearTokens = async (): Promise<
  string[]
> => {
  const requestAll = [];
  const request1 = refFiViewFunction({
    methodName: 'get_whitelisted_tokens',
  });
  requestAll.push(request1);
  if (getCurrentWallet()?.wallet?.isSignedIn()) {
    const request2 = refFiViewFunction({
      methodName: 'get_user_whitelisted_tokens',
      args: { account_id: getCurrentWallet()?.wallet?.getAccountId() },
    });
    requestAll.push(request2);
  }
  const [globalWhitelist = [], userWhitelist = []] = await Promise.all(
    requestAll
  );

  return [
    ...new Set<string>([
      ...globalWhitelist,
      ...userWhitelist,
      getConfig().REF_VE_CONTRACT_ID,
    ]),
  ];
};

export const round = (decimals: number, minAmountOut: string) => {
  return Number.isInteger(Number(minAmountOut))
    ? minAmountOut
    : Math.ceil(
        Math.round(Number(minAmountOut) * Math.pow(10, decimals)) /
          Math.pow(10, decimals)
      ).toString();
};

export const get_auto_whitelisted_postfix = async (): Promise<string[]> => {
  const metadata = await refFiViewFunction({
    methodName: 'metadata',
  });
  return metadata.auto_whitelisted_postfix;
};
