import React from 'react';
import getConfig from './config';
import {
  near,
  Transaction,
  executeMultipleTransactions,
  ONE_YOCTO_NEAR,
} from './near';
import { wallet } from './near';
import { toNonDivisibleNumber } from '../utils/numbers';
import { ftGetStorageBalance } from '../services/ft-contract';
import {
  storageDepositAction,
  STORAGE_TO_REGISTER_WITH_MFT,
} from '../services/creators/storage';
const { networkId, USN_ID } = getConfig();
export const USDT_ID = get_usdt_id();

export const fetchMultiplier = async () => {
  try {
    const response = await near.connection.provider.query({
      request_type: 'call_function',
      account_id: `priceoracle.${networkId === 'mainnet' ? 'near' : 'testnet'}`,
      method_name: 'get_price_data',
      args_base64: btoa(
        `{"asset_ids": ["wrap.${
          networkId === 'mainnet' ? 'near' : 'testnet'
        }"]}`
      ),
      finality: 'final',
    });

    const res = JSON.parse(
      //@ts-ignore
      response.result.map((x: any) => String.fromCharCode(x)).join('')
    );

    return res.prices[0].price;
  } catch (error) {
    console.warn('Failed to load ', error);
  }
};

export const buyUSN = async ({
  multiplier,
  slippage,
  amount,
}: {
  multiplier: string;
  slippage: number;
  amount: string;
}) => {
  const transaction: Transaction = {
    receiverId: USN_ID,
    functionCalls: [
      {
        methodName: 'buy',
        args: {
          expected: {
            multiplier,
            slippage: `${Math.round((Number(multiplier) / 100) * slippage)}`,
            decimals: 28,
          },
        },
        amount,
        gas: '50000000000000',
      },
    ],
  };

  executeMultipleTransactions([transaction]);
};

export const sellUSN = async ({
  multiplier,
  slippage,
  amount,
}: {
  multiplier: string;
  slippage: number;
  amount: string;
}) => {
  const transaction: Transaction = {
    receiverId: USN_ID,
    functionCalls: [
      {
        methodName: 'sell',
        args: {
          expected: {
            multiplier,
            slippage: `${Math.round((Number(multiplier) / 100) * slippage)}`,
            decimals: 28,
          },
          amount: toNonDivisibleNumber(18, amount),
        },
        amount: ONE_YOCTO_NEAR,
        gas: '50000000000000',
      },
    ],
  };

  executeMultipleTransactions([transaction]);
};

export const buyUSNInUSDT = async ({ amount }: { amount: string }) => {
  const transaction: Transaction = {
    receiverId: USDT_ID,
    functionCalls: [
      {
        methodName: 'ft_transfer_call',
        args: {
          receiver_id: USN_ID,
          amount,
          msg: '',
        },
        amount: ONE_YOCTO_NEAR,
        gas: '100000000000000',
      },
    ],
  };
  sessionStorage.setItem('usn', '1');
  executeMultipleTransactions([transaction]);
};
export const sellUSNGetUSDT = async ({ amount }: { amount: string }) => {
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: USN_ID,
    functionCalls: [
      {
        methodName: 'withdraw',
        args: {
          amount,
        },
        amount: ONE_YOCTO_NEAR,
        gas: '100000000000000',
      },
    ],
  });
  const ftBalance = await ftGetStorageBalance(USDT_ID);
  if (!ftBalance) {
    transactions.unshift({
      receiverId: USDT_ID,
      functionCalls: [
        storageDepositAction({
          registrationOnly: true,
          amount: STORAGE_TO_REGISTER_WITH_MFT,
        }),
      ],
    });
  }
  sessionStorage.setItem('usn', '1');
  executeMultipleTransactions(transactions);
};

function get_usdt_id() {
  let id;
  if (networkId == 'testnet' || networkId == 'pub-testnet') {
    id = 'usdt.fakes.testnet';
  } else {
    id = 'dac17f958d2ee523a2206206994597c13d831ec7.factory.bridge.near';
  }
  return id;
}
