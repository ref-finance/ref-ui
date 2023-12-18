import { Near, keyStores, utils, providers } from 'near-api-js';
import { functionCall } from 'near-api-js/lib/transaction';
import BN from 'bn.js';
import getConfig, { getExtraStablePoolConfig } from './config';
import SpecialWallet from './SpecialWallet';
import {
  getCurrentWallet,
  senderWallet,
  walletsRejectError,
} from '../utils/wallets-integration';

import { Transaction as WSTransaction } from '@near-wallet-selector/core';

import {
  SENDER_WALLET_SIGNEDIN_STATE_KEY,
  WALLET_TYPE,
} from '../utils/wallets-integration';
import { AccountView } from 'near-api-js/lib/providers/provider';
import { ledgerTipTrigger } from '../utils/wallets-integration';
import {
  addQueryParams,
  extraWalletsError,
} from '../utils/wallets-integration';
import {
  TRANSACTION_WALLET_TYPE,
  failToastAccount,
} from '../components/layout/transactionTipPopUp';
import { useTranstionsExcuteDataStore } from 'src/stores/transtionsExcuteData';

const config = getConfig();

export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;

export const REF_ADBOARD_CONTRACT_ID = config.REF_ADBOARD_CONTRACT_ID;

export const POOL_TOKEN_REFRESH_INTERVAL = config.POOL_TOKEN_REFRESH_INTERVAL;

export const REF_VE_CONTRACT_ID = config.REF_VE_CONTRACT_ID;

export const STABLE_TOKEN_IDS = config.STABLE_TOKEN_IDS;

export const USDTT_USDCC_USDT_USDC_TOKEN_IDS =
  config.USDTT_USDCC_USDT_USDC_TOKEN_IDS;

export const STABLE_POOL_ID = config.STABLE_POOL_ID;

export const USDTT_USDCC_USDT_USDC_POOL_ID =
  config.USDTT_USDCC_USDT_USDC_POOL_ID;

export const STABLE_POOL_USN_ID = config.STABLE_POOL_USN_ID;

export const STABLE_TOKEN_USN_IDS = config.STABLE_TOKEN_USN_IDS;

export const REF_FARM_BOOST_CONTRACT_ID = config.REF_FARM_BOOST_CONTRACT_ID;

export const {
  BTCIDS,
  CUSDIDS,
  BTC_STABLE_POOL_ID,
  CUSD_STABLE_POOL_ID,
  STNEAR_POOL_ID,
  STNEARIDS,
  BTC_STABLE_POOL_INDEX,
  CUSD_STABLE_POOL_INDEX,
  STNEAR_POOL_INDEX,
  LINEARIDS,
  LINEAR_POOL_INDEX,
  LINEAR_POOL_ID,
  NEARX_POOL_ID,
  NEARX_POOL_INDEX,
  NEARXIDS,
  NEW_NEARXIDS,
  NEW_NEARX_POOL_ID,
  NEW_NEARX_POOL_INDEX,
  USDTIDS,
  USDT_POOL_ID,
  USDT_POOL_INDEX,
  USDTT_USDCC_USDT_USDC_POOL_INDEX,
} = getExtraStablePoolConfig();

export const extraStableTokenIds = BTCIDS.concat(LINEARIDS)
  .concat(USDTIDS)
  .concat(STNEARIDS)
  .concat(NEARXIDS)
  .concat(CUSDIDS)
  .concat(NEW_NEARXIDS)
  .concat(USDTIDS)
  .filter((_) => !!_);

export const isRatedPool = (id: string | number) => {
  return getExtraStablePoolConfig().RATED_POOLS_IDS.includes(id.toString());
};

export const AllStableTokenIds = new Array(
  ...new Set(
    STABLE_TOKEN_USN_IDS.concat(STABLE_TOKEN_IDS)
      .concat(extraStableTokenIds)
      .concat(USDTT_USDCC_USDT_USDC_TOKEN_IDS)
  )
);

export const isStableToken = (id: string) => {
  return AllStableTokenIds.includes(id);
};

export const TOKEN_BLACK_LIST = [NEARXIDS[0], 'meta-token.near'];

export const ALL_STABLE_POOL_IDS = [
  USDTT_USDCC_USDT_USDC_POOL_ID,
  STABLE_POOL_ID,
  STABLE_POOL_USN_ID,
  BTC_STABLE_POOL_ID,
  STNEAR_POOL_ID,
  CUSD_STABLE_POOL_ID,
  LINEAR_POOL_ID,
  NEARX_POOL_ID,
  NEW_NEARX_POOL_ID,
  USDT_POOL_ID,
]
  .filter((_) => _)
  .map((id) => id.toString());

export const BLACKLIST_POOL_IDS = config.BLACKLIST_POOL_IDS;

export const filterBlackListPools = (pool: any & { id: any }) =>
  !BLACKLIST_POOL_IDS.includes(pool.id.toString());

export const STABLE_TOKEN_INDEX = config.STABLE_TOKEN_INDEX;

export const STABLE_TOKEN_USN_INDEX = config.STABLE_TOKEN_USN_INDEX;

export const BTC_POOL_INDEX = getConfig().BTC_IDS_INDEX;

export const getStableTokenIndex = (stable_pool_id: string | number) => {
  const id = stable_pool_id.toString();
  switch (id) {
    case STABLE_POOL_ID.toString():
      return STABLE_TOKEN_INDEX;
    case STABLE_POOL_USN_ID.toString():
      return STABLE_TOKEN_USN_INDEX;
    case BTC_STABLE_POOL_ID:
      return BTC_STABLE_POOL_INDEX;
    case STNEAR_POOL_ID:
      return STNEAR_POOL_INDEX;
    case CUSD_STABLE_POOL_ID:
      return CUSD_STABLE_POOL_INDEX;
    case LINEAR_POOL_ID:
      return LINEAR_POOL_INDEX;
    case NEARX_POOL_ID:
      return NEARX_POOL_INDEX;
    case NEW_NEARX_POOL_ID:
      return NEW_NEARX_POOL_INDEX;

    case USDT_POOL_ID:
      return USDT_POOL_INDEX;
    case USDTT_USDCC_USDT_USDC_POOL_ID.toString():
      return USDTT_USDCC_USDT_USDC_POOL_INDEX;
  }
};

export const isStablePool = (id: string | number) => {
  return ALL_STABLE_POOL_IDS.map((id) => id.toString()).includes(id.toString());
};

export enum STABLE_POOL_TYPE {
  BTC = 'BTC',
  NEAR = 'NEAR',
  USD = 'USD',
}

export const BTC_CLASS_STABLE_POOL_IDS = [BTC_STABLE_POOL_ID];

export const NEAR_CLASS_STABLE_POOL_IDS = [
  LINEAR_POOL_ID,
  STNEAR_POOL_ID,
  NEW_NEARX_POOL_ID,
];

export const USD_CLASS_STABLE_POOL_IDS = [
  STABLE_POOL_ID.toString(),
  STABLE_POOL_USN_ID.toString(),
  CUSD_STABLE_POOL_ID,
  USDT_POOL_ID,
  USDTT_USDCC_USDT_USDC_POOL_ID.toString(),
];

export const BTC_CLASS_STABLE_TOKEN_IDS = BTCIDS;

export const NEAR_CLASS_STABLE_TOKEN_IDS = new Array(
  ...new Set(STNEARIDS.concat(LINEARIDS).concat(NEW_NEARXIDS))
).map((id) => id);

export const USD_CLASS_STABLE_TOKEN_IDS = new Array(
  ...new Set(
    STABLE_TOKEN_USN_IDS.concat(STABLE_TOKEN_IDS)
      .concat(CUSDIDS)
      .concat(USDTIDS)
  )
);

export const REF_FARM_CONTRACT_ID = config.REF_FARM_CONTRACT_ID;

export const REF_UNI_V3_SWAP_CONTRACT_ID = config.REF_UNI_V3_SWAP_CONTRACT_ID;
export const REF_UNI_SWAP_CONTRACT_ID = config.REF_UNI_SWAP_CONTRACT_ID;

export const REF_AIRDRAOP_CONTRACT_ID = config.REF_AIRDROP_CONTRACT_ID;

export const REF_TOKEN_ID = config.REF_TOKEN_ID;
const XREF_TOKEN_ID = getConfig().XREF_TOKEN_ID;
export const LP_STORAGE_AMOUNT = '0.01';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

export const keyStore = new keyStores.BrowserLocalStorageKeyStore();
//@ts-ignore
keyStore.reKey = () => {};

export const near = new Near({
  keyStore,
  headers: {},
  ...config,
});
export const wallet = new SpecialWallet(near, REF_FARM_BOOST_CONTRACT_ID);

export const getGas = (gas?: string) =>
  gas ? new BN(gas) : new BN('100000000000000');
export const getAmount = (amount: string) =>
  amount ? new BN(utils.format.parseNearAmount(amount)) : new BN('0');

export interface RefFiViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface RefFiFunctionCallOptions extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
}

export const refFiFunctionCall = ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  return wallet
    .account()
    .functionCall(
      REF_FI_CONTRACT_ID,
      methodName,
      args,
      getGas(gas),
      getAmount(amount)
    );
};

export const refFiViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet.account().viewFunction(REF_FI_CONTRACT_ID, methodName, args);
};

export const refVeViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet.account().viewFunction(REF_VE_CONTRACT_ID, methodName, args);
};

export const refSwapV3ViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet
    .account()
    .viewFunction(REF_UNI_V3_SWAP_CONTRACT_ID, methodName, args);
};
export const refSwapV3OldVersionViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet
    .account()
    .viewFunction(REF_UNI_SWAP_CONTRACT_ID, methodName, args);
};

export const refFiManyFunctionCalls = async (
  functionCalls: RefFiFunctionCallOptions[]
) => {
  const actions = functionCalls.map((fc) =>
    functionCall(fc.methodName, fc.args, getGas(fc.gas), getAmount(fc.amount))
  );
  const { wallet } = getCurrentWallet();

  await ledgerTipTrigger(wallet);

  return (await wallet.wallet()).signAndSendTransaction({
    signerId: wallet.getAccountId()!,
    receiverId: REF_FI_CONTRACT_ID,
    actions: functionCalls.map((fc) => ({
      type: 'FunctionCall',
      params: {
        methodName: fc.methodName,
        args: fc.args,
        gas: getGas(fc.gas).toNumber().toFixed(),
        deposit: utils.format.parseNearAmount(fc.amount)!,
      },
    })),
  });
};

export interface Transaction {
  receiverId: string;
  functionCalls: RefFiFunctionCallOptions[];
}

export const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string,
  isReturnResponse?: boolean
) => {
  const { wallet } = getCurrentWallet();
  const wstransactions: WSTransaction[] = [];

  transactions.forEach((transaction) => {
    wstransactions.push({
      signerId: wallet.getAccountId()!,
      receiverId: transaction.receiverId,
      actions: transaction.functionCalls.map((fc) => {
        return {
          type: 'FunctionCall',
          params: {
            methodName: fc.methodName,
            args: fc.args,
            gas: getGas(fc.gas).toNumber().toFixed(),
            deposit: utils.format.parseNearAmount(fc.amount || '0')!,
          },
        };
      }),
    });
  });

  await ledgerTipTrigger(wallet);
  try {
    const walletRes = await wallet.wallet();
    const res = await walletRes.signAndSendTransactions({
      transactions: wstransactions,
      callbackUrl,
    });
    if (!res) return;
    const transactionHashes = (Array.isArray(res) ? res : [res])?.map(
      (r) => r.transaction.hash
    );
    const parsedTransactionHashes = transactionHashes?.join(',');
    const newHref = addQueryParams(
      window.location.origin + window.location.pathname,
      {
        [TRANSACTION_WALLET_TYPE.WalletSelector]: parsedTransactionHashes,
      }
    );
    if (isReturnResponse) {
      return {
        response: res,
        callbackUrl: newHref,
      };
    } else {
      window.location.href = newHref;
    }
  } catch (e) {
    if (isReturnResponse) {
      throw e;
    } else {
      sessionStorage.setItem('WALLETS_TX_ERROR', e.message);
      window.location.reload();
    }
  }
};

export const executeMultipleTransactionsV2 = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  let walletId, firstMethod;
  const { wallet } = getCurrentWallet();
  const wstransactions: WSTransaction[] = [];
  transactions.forEach((transaction) => {
    wstransactions.push({
      signerId: wallet.getAccountId()!,
      receiverId: transaction.receiverId,
      actions: transaction.functionCalls.map((fc) => {
        return {
          type: 'FunctionCall',
          params: {
            methodName: fc.methodName,
            args: fc.args,
            gas: getGas(fc.gas).toNumber().toFixed(),
            deposit: utils.format.parseNearAmount(fc.amount || '0')!,
          },
        };
      }),
    });
  });

  try {
    await ledgerTipTrigger(wallet);
  } catch (e) {
    console.error('ledgerErr', e);
  }

  try {
    const walletRes = await wallet.wallet();
    walletId = walletRes?.id;
    firstMethod = transactions?.[0]?.functionCalls?.[0]?.methodName;
    const res = await walletRes.signAndSendTransactions({
      transactions: wstransactions,
      callbackUrl,
    });

    if (!res) return { response: null };
    const transactionHashes = (Array.isArray(res) ? res : [res])?.map(
      (r) => r.transaction.hash
    );

    return {
      response: res,
      callbackUrl,
      txHash:
        transactionHashes && transactionHashes.length > 0
          ? transactionHashes[transactionHashes.length - 1]
          : '',
      txHashes: transactionHashes,
    };
  } catch (e) {
    if (walletId === 'here-wallet' && !e.message) {
      throw new Error('User rejected');
    }
    if (!extraWalletsError.includes(e.message)) {
      sessionStorage.setItem('WALLETS_TX_ERROR', e.message);
    }

    throw e;
  }
};

export const refFarmFunctionCall = async ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  const { wallet } = getCurrentWallet();
  await ledgerTipTrigger(wallet);

  if ((await wallet.wallet()).id === 'sender') {
    return window.near
      .account()
      .functionCall(
        REF_FARM_BOOST_CONTRACT_ID,
        methodName,
        args,
        getGas(gas),
        getAmount(amount)
      )
      .catch(async (e: any) => {
        return (await wallet.wallet())
          .signAndSendTransaction({
            signerId: wallet.getAccountId()!,
            receiverId: REF_FARM_CONTRACT_ID,
            actions: [
              {
                type: 'FunctionCall',
                params: {
                  methodName,
                  args,
                  gas: getGas(gas).toNumber().toFixed(),
                  deposit: utils.format.parseNearAmount(amount || '0')!,
                },
              },
            ],
          })
          .catch((e: Error) => {
            if (extraWalletsError.includes(e.message)) {
              return;
            }

            if (
              !walletsRejectError.includes(e.message) &&
              !extraWalletsError.includes(e.message)
            ) {
              sessionStorage.setItem('WALLETS_TX_ERROR', e.message);
            }

            window.location.reload();
          });
      });
  } else {
    return (await wallet.wallet())
      .signAndSendTransaction({
        signerId: wallet.getAccountId()!,
        receiverId: REF_FARM_CONTRACT_ID,
        actions: [
          {
            type: 'FunctionCall',
            params: {
              methodName,
              args,
              gas: getGas(gas).toNumber().toFixed(),
              deposit: utils.format.parseNearAmount(amount || '0')!,
            },
          },
        ],
      })
      .catch((e: Error) => {
        if (extraWalletsError.includes(e.message)) {
          return;
        }

        if (
          !walletsRejectError.includes(e.message) &&
          !extraWalletsError.includes(e.message)
        ) {
          sessionStorage.setItem('WALLETS_TX_ERROR', e.message);
        }

        window.location.reload();
      });
  }
};

export const refFarmViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet.account().viewFunction(REF_FARM_CONTRACT_ID, methodName, args);
};

export const refFarmManyFunctionCalls = async (
  functionCalls: RefFiFunctionCallOptions[]
) => {
  const actions = functionCalls.map((fc) =>
    functionCall(fc.methodName, fc.args, getGas(fc.gas), getAmount(fc.amount))
  );

  const { wallet } = getCurrentWallet();

  await ledgerTipTrigger(wallet);

  return (await wallet.wallet()).signAndSendTransaction({
    signerId: wallet.getAccountId()!,
    receiverId: REF_FARM_CONTRACT_ID,
    actions: functionCalls.map((fc) => ({
      type: 'FunctionCall',
      params: {
        methodName: fc.methodName,
        args: fc.args,
        gas: getGas(fc.gas).toNumber().toFixed(),
        deposit: utils.format.parseNearAmount(fc.amount)!,
      },
    })),
  });
};

export const executeFarmMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  return executeMultipleTransactionsV2(transactions, callbackUrl);
};

export interface RefContractViewFunctionOptions
  extends RefFiViewFunctionOptions {
  gas?: string;
  amount?: string;
  contarctId?: string;
}

export const refContractViewFunction = ({
  methodName,
  args,
}: RefContractViewFunctionOptions) => {
  return wallet.account().viewFunction(XREF_TOKEN_ID, methodName, args);
};

export const getAccountNearBalance = async (accountId: string) => {
  // const provider = new providers.JsonRpcProvider({
  //   url: getConfig().nodeUrl,
  // });

  // return provider
  //   .query<AccountView>({
  //     request_type: 'view_account',
  //     finality: 'final',
  //     account_id: accountId,
  //   })
  //   .then((data) => ({ available: data.amount }));
  const nearConnection = await near.account(
    getCurrentWallet().wallet.getAccountId()
  );
  return nearConnection
    .getAccountBalance()
    .then(({ available }) => ({ available }))
    .catch((e) => {
      return { available: '0' };
    });
};

export const refFarmBoostViewFunction = ({
  methodName,
  args,
}: RefFiViewFunctionOptions) => {
  return wallet
    .account()
    .viewFunction(REF_FARM_BOOST_CONTRACT_ID, methodName, args);
};

export const refFarmBoostFunctionCall = async ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  const transaction: Transaction = {
    receiverId: REF_FARM_BOOST_CONTRACT_ID,
    functionCalls: [
      {
        methodName,
        args,
        amount,
        gas,
      },
    ],
  };

  return executeMultipleTransactionsV2([transaction]);
};

export const ftGetNearBalance = async () => {
  const nearConnection = await near.account(
    getCurrentWallet().wallet.getAccountId()
  );
  return nearConnection
    .getAccountBalance()
    .then(({ available }) => available)
    .catch((e) => {
      return '0';
    });
};
