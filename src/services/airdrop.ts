import {
  getAmount,
  getGas,
  REF_AIRDRAOP_CONTRACT_ID,
  REF_TOKEN_ID,
  wallet,
} from '~services/near';
import { functionCall } from 'near-api-js/lib/transaction';
import { storageDepositForFTAction } from '~services/creators/storage';
import { NEW_ACCOUNT_STORAGE_COST } from '~services/wrap-near';

const AIRDROP_STORAGE_AMOUNT = '0.01';

export interface StatsOptions {
  token_account_id: string;
  skyward_account_id: string;
  claim_expiration_timestamp: string;
  total_balance: number;
  untouched_balance: number;
  total_claimed: number;
}

export interface AccountOptions {
  start_timestamp: string;
  cliff_timestamp: string;
  end_timestamp: string;
  balance: number;
  claimed_balance: number;
}

export interface AirDropViewFunctionOptions {
  methodName: string;
  args?: object;
}

export interface AirDropFunctionCallOptions extends AirDropViewFunctionOptions {
  gas?: string;
  amount?: string;
}

const airdropViewFunction = ({
  methodName,
  args,
}: AirDropViewFunctionOptions) => {
  return wallet
    .account()
    .viewFunction(REF_AIRDRAOP_CONTRACT_ID, methodName, args);
};

interface Transaction {
  receiverId: string;
  functionCalls: AirDropFunctionCallOptions[];
}

const executeMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  const nearTransactions = await Promise.all(
    transactions.map((t, i) => {
      return wallet.createTransaction({
        receiverId: t.receiverId,
        nonceOffset: i + 1,
        actions: t.functionCalls.map((fc) =>
          functionCall(
            fc.methodName,
            fc.args,
            getGas(fc.gas),
            getAmount(fc.amount)
          )
        ),
      });
    })
  );

  return wallet.requestSignTransactions(nearTransactions, callbackUrl);
};

export const getStats = async (): Promise<StatsOptions> => {
  return airdropViewFunction({
    methodName: 'get_stats',
    args: {},
  });
};

export const getAccount = async (): Promise<AccountOptions> => {
  return airdropViewFunction({
    methodName: 'get_account',
    args: {
      account_id: wallet.getAccountId(),
    },
  });
};

export const claim = async () => {
  const transactions: Transaction[] = [];
  const actions: AirDropFunctionCallOptions[] = [];

  actions.push({
    methodName: 'claim',
    args: {},
    gas: getGas('100000000000000').toString(),
  });

  transactions.push({
    receiverId: REF_TOKEN_ID,
    functionCalls: [
      {
        methodName: 'storage_deposit',
        args: {},
        gas: '100000000000000',
        amount: NEW_ACCOUNT_STORAGE_COST,
      },
    ],
  });

  transactions.push({
    receiverId: REF_AIRDRAOP_CONTRACT_ID,
    functionCalls: actions,
  });

  return executeMultipleTransactions(transactions);
};
