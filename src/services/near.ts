import {
  Near,
  keyStores,
  utils,
  WalletConnection,
  providers,
} from 'near-api-js';
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
import { addQueryParams } from '../utils/wallets-integration';
import { TRANSACTION_WALLET_TYPE } from '../components/layout/transactionTipPopUp';

const config = getConfig();

export const REF_FI_CONTRACT_ID = config.REF_FI_CONTRACT_ID;

export const REF_ADBOARD_CONTRACT_ID = config.REF_ADBOARD_CONTRACT_ID;

export const POOL_TOKEN_REFRESH_INTERVAL = config.POOL_TOKEN_REFRESH_INTERVAL;

export const REF_VE_CONTRACT_ID = config.REF_VE_CONTRACT_ID;

export const STABLE_TOKEN_IDS = config.STABLE_TOKEN_IDS;

export const STABLE_POOL_ID = config.STABLE_POOL_ID;

export const STABLE_POOL_USN_ID = config.STABLE_POOL_USN_ID;

export const STABLE_TOKEN_USN_IDS = config.STABLE_TOKEN_USN_IDS;

export const REF_FARM_BOOST_CONTRACT_ID = config.REF_FARM_BOOST_CONTRACT_ID;

export const isStableToken = (id: string) => {
  return (
    STABLE_TOKEN_IDS.includes(id) ||
    STABLE_TOKEN_USN_IDS.includes(id) ||
    BTCIDS.includes(id) ||
    STNEARIDS.includes(id) ||
    CUSDIDS.includes(id) ||
    LINEARIDS.includes(id) ||
    NEARXIDS.includes(id)
  );
};

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
  NEAX_POOL_ID,
  NEAX_POOL_INDEX,
  NEARXIDS,
} = getExtraStablePoolConfig();

export const extraStableTokenIds = BTCIDS.concat(LINEARIDS)
  .concat(STNEARIDS)
  .concat(NEARXIDS)
  .concat(CUSDIDS)
  .filter((_) => !!_);

export const isRatedPool = (id: string | number) => {
  return getExtraStablePoolConfig().RATED_POOLS_IDS.includes(id.toString());
};

export const AllStableTokenIds = new Array(
  ...new Set(
    STABLE_TOKEN_USN_IDS.concat(STABLE_TOKEN_IDS).concat(extraStableTokenIds)
  )
);

export const ALL_STABLE_POOL_IDS = [
  STABLE_POOL_ID,
  STABLE_POOL_USN_ID,
  BTC_STABLE_POOL_ID,
  STNEAR_POOL_ID,
  CUSD_STABLE_POOL_ID,
  LINEAR_POOL_ID,
  NEAX_POOL_ID,
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
    case NEAX_POOL_ID:
      return NEAX_POOL_INDEX;
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

export const BTC_POOL_ID = config.BTC_POOL_ID;

export const REF_FARM_CONTRACT_ID = config.REF_FARM_CONTRACT_ID;

export const REF_AIRDRAOP_CONTRACT_ID = config.REF_AIRDROP_CONTRACT_ID;

export const REF_TOKEN_ID = config.REF_TOKEN_ID;
const XREF_TOKEN_ID = getConfig().XREF_TOKEN_ID;

export const LP_STORAGE_AMOUNT = '0.01';

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';

export const keyStore = new keyStores.BrowserLocalStorageKeyStore();
//@ts-ignore
keyStore?.reKey = () => {};

export const near = new Near({
  keyStore,
  headers: {},
  ...config,
});
export const wallet = new SpecialWallet(near, REF_FARM_BOOST_CONTRACT_ID);

export const getGas = (gas: string) =>
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

export const refFiManyFunctionCalls = async (
  functionCalls: RefFiFunctionCallOptions[]
) => {
  const actions = functionCalls.map((fc) =>
    functionCall(fc.methodName, fc.args, getGas(fc.gas), getAmount(fc.amount))
  );
  const { wallet } = getCurrentWallet();

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
  callbackUrl?: string
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

  return (await wallet.wallet())
    .signAndSendTransactions({
      transactions: wstransactions,
    })
    .then((res) => {
      if (!res) return;

      const transactionHashes = res?.map((r) => r.transaction.hash);
      const parsedTransactionHashes = transactionHashes?.join(',');
      const newHref = addQueryParams(
        window.location.origin + window.location.pathname,
        {
          [TRANSACTION_WALLET_TYPE.WalletSelector]: parsedTransactionHashes,
        }
      );

      window.location.href = newHref;
    })
    .catch((e: Error) => {
      console.log(e);
      if (walletsRejectError.includes(e.message)) {
        window.location.reload();
      }
    });
};

export const refFarmFunctionCall = async ({
  methodName,
  args,
  gas,
  amount,
}: RefFiFunctionCallOptions) => {
  const { wallet } = getCurrentWallet();

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
        console.log(e);

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
            console.log(e);

            if (walletsRejectError.includes(e.message)) {
              window.location.reload();
            }
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
        console.log(e);
        if (walletsRejectError.includes(e.message)) {
          window.location.reload();
        }
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
  return executeMultipleTransactions(transactions, callbackUrl);
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
  const provider = new providers.JsonRpcProvider({
    url: getConfig().nodeUrl,
  });

  return provider
    .query<AccountView>({
      request_type: 'view_account',
      finality: 'final',
      account_id: accountId,
    })
    .then((data) => ({ available: data.amount }));
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
  const { wallet } = getCurrentWallet();

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
        console.log(e);

        return (await wallet.wallet())
          .signAndSendTransaction({
            signerId: wallet.getAccountId()!,
            receiverId: REF_FARM_BOOST_CONTRACT_ID,
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
            console.log(e);

            if (walletsRejectError.includes(e.message)) {
              window.location.reload();
            }
          });
      });
  } else {
    return (await wallet.wallet())
      .signAndSendTransaction({
        signerId: wallet.getAccountId()!,
        receiverId: REF_FARM_BOOST_CONTRACT_ID,
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
        console.log(e);
        if (walletsRejectError.includes(e.message)) {
          window.location.reload();
        }
      });
  }
};
