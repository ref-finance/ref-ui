// @ts-nocheck

import getConfig from './config';
import { Near, keyStores, utils } from 'near-api-js';
import {
  Transaction as WSTransaction,
  AddKeyAction,
  AddKeyPermission,
} from '@near-wallet-selector/core';
import * as math from 'mathjs';

import BN from 'bn.js';
import { getOrderlyConfig } from './config';
import { NotSignInError } from './orderly/error';
import { TokenMetadata } from './orderly/type';
import { ftGetTokenMetadata } from '../../services/ft-contract';
export interface ViewFunctionOptions {
  methodName: string;
  args?: object;
}

export const getGas = (gas?: string) =>
  gas ? new BN(gas) : new BN('100000000000000');

export const getAmount = (amount: string) =>
  amount ? new BN(utils.format.parseNearAmount(amount)) : new BN('0');

export const ONE_YOCTO_NEAR = '0.000000000000000000000001';
export interface FunctionCallOptions extends ViewFunctionOptions {
  gas?: string;
  amount?: string;
}

export interface Transaction {
  receiverId: string;
  functionCalls: FunctionCallOptions[];
}

export const keyStore = new keyStores.BrowserLocalStorageKeyStore();
export const keyStoreKeypom = new keyStores.BrowserLocalStorageKeyStore(
  undefined,
  'keypom:'
);

export const config = getConfig();

export const near = new Near({
  keyStore,
  headers: {},
  ...config,
});
export const nearKeypom = new Near({
  keyStore: keyStoreKeypom,
  headers: {},
  ...config,
});

export const ORDERLY_ASSET_MANAGER = getOrderlyConfig().ORDERLY_ASSET_MANAGER;

export const orderlyViewFunction = async ({
  methodName,
  args,
}: ViewFunctionOptions) => {
  const nearConnection = await near.account(ORDERLY_ASSET_MANAGER);

  return nearConnection.viewFunction(ORDERLY_ASSET_MANAGER, methodName, args);
};

export const getFunctionCallTransaction = async (
  transactions: Transaction[]
) => {
  const signerId = await window.selector?.store?.getState()?.accounts[0]
    ?.accountId;

  const wsTransactions: WSTransaction[] = [];

  transactions.forEach((transaction) => {
    wsTransactions.push({
      signerId: signerId!,
      receiverId: transaction.receiverId,
      actions: transaction.functionCalls.map((fc) => {
        return {
          type: 'FunctionCall',
          params: {
            methodName: fc.methodName,
            args: fc.args || [],
            gas: getGas(fc.gas).toNumber().toFixed(),
            deposit: utils.format.parseNearAmount(fc.amount || '0')!,
          },
        };
      }),
    });
  });

  return wsTransactions;
};

export const getAddFunctionCallKeyTransaction = async ({
  receiverId,
  publicKey,
}: {
  receiverId: string;
  publicKey: string;
}) => {
  const signerId = await window.selector?.store?.getState()?.accounts[0]
    ?.accountId;

  if (!signerId) throw Error('Please sign in first.');

  const wsTransactions: WSTransaction[] = [];
  wsTransactions.push({
    signerId: signerId!,
    receiverId: signerId,
    actions: [
      {
        type: 'AddKey',
        params: {
          publicKey,
          accessKey: {
            permission: {
              receiverId,
            },
          },
        },
      },
    ],
  });

  return wsTransactions;
};

export const getFTmetadata = async (token: string): Promise<TokenMetadata> => {
  if (token === 'near' || token === 'NEAR') return nearMetadata;

  const data = await ftGetTokenMetadata(token);

  return {
    ...data,
    id: token,
  };
};

export const btcMetadata = {
  id: 'WBTC',
  name: 'WBTC',
  symbol: 'WBTC',
  decimals: 8,
  icon: 'data:image/svg+xml,%3Csvg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none"%3E%3Ccircle fill="%23201A2D" cx="16" cy="16" r="16"/%3E%3Cg fill="%23FFF"%3E%3Cpath d="M22.818 9.586l-.6.6a8.494 8.494 0 010 11.464l.6.6a9.352 9.352 0 000-12.678v.014zM10.2 9.638a8.494 8.494 0 0111.464 0l.6-.6a9.352 9.352 0 00-12.678 0l.614.6zm-.562 12.018a8.494 8.494 0 010-11.458l-.6-.6a9.352 9.352 0 000 12.678l.6-.62zm12.018.554a8.494 8.494 0 01-11.464 0l-.6.6a9.352 9.352 0 0012.678 0l-.614-.6zm-1.942-8.286c-.12-1.252-1.2-1.672-2.566-1.8V10.4h-1.056v1.692h-.844V10.4H14.2v1.736h-2.142v1.13s.78-.014.768 0a.546.546 0 01.6.464v4.752a.37.37 0 01-.128.258.366.366 0 01-.272.092c.014.012-.768 0-.768 0l-.2 1.262h2.122v1.764h1.056V20.12h.844v1.73h1.058v-1.744c1.784-.108 3.028-.548 3.184-2.218.126-1.344-.506-1.944-1.516-2.186.614-.302.994-.862.908-1.778zm-1.48 3.756c0 1.312-2.248 1.162-2.964 1.162v-2.328c.716.002 2.964-.204 2.964 1.166zm-.49-3.28c0 1.2-1.876 1.054-2.472 1.054v-2.116c.596 0 2.472-.188 2.472 1.062z"/%3E%3Cpath d="M15.924 26.852C9.89 26.851 5 21.959 5 15.925 5 9.892 9.892 5 15.925 5c6.034 0 10.926 4.89 10.927 10.924a10.926 10.926 0 01-10.928 10.928zm0-21c-5.559.004-10.062 4.513-10.06 10.072.002 5.559 4.51 10.064 10.068 10.064 5.559 0 10.066-4.505 10.068-10.064A10.068 10.068 0 0015.924 5.852z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E',
};

export const nearMetadata = {
  id: 'NEAR',
  name: 'NEAR',
  symbol: 'NEAR',
  decimals: 24,
  icon: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAA2AAAANgCAIAAADF8JzzAAAACXBIWXMAABYlAAAWJQFJUiTwAAAgAElEQVR4nO3d7VXb2rqw4eQd57/cgZ0KLCqwVwWIChAVYCrAqQBTgUUFERVEVBBTwTYdmArWO/by3uzMfBA+bHlK87r+nTP2WBFSjO/o8SN//Pvvvz8AAMB//T9nAgCA7wlEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAAC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ICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAICAQAQAICAQAQAICEQAAAICEQCAgEAEACAgEAEACAhEAAACAhEAgIBABAAgIBABAAgIRAAAAgIRAID/+fDhw/8H0I0VimXUJpsAAAAASUVORK5CYII=',
};

export const ftGetBalance = async (tokenId: string) => {
  const account_id = window.selectorAccountId;

  const nearConnection = await near.account(account_id);

  if (tokenId === 'NEAR' || tokenId === 'near') {
    return nearConnection
      .getAccountBalance()
      .then(({ available }) => available)
      .catch((e) => {
        return '0';
      });
  }

  return nearConnection
    .viewFunction(tokenId, 'ft_balance_of', {
      account_id: account_id,
    })
    .catch(() => '0');
};

function formatWithCommas(value: string): string {
  const pattern = /(-?\d+)(\d{3})/;
  while (pattern.test(value)) {
    value = value.replace(pattern, '$1,$2');
  }
  return value;
}

export const toPrecision = (
  number: string,
  precision: number,
  withCommas: boolean = false,
  atLeastOne: boolean = true
): string => {
  if (typeof number === 'undefined') return '0';

  const [whole, decimal = ''] = number.split('.');

  let str = `${withCommas ? formatWithCommas(whole) : whole}.${decimal.slice(
    0,
    precision
  )}`.replace(/\.$/, '');
  if (atLeastOne && Number(str) === 0 && str.length > 1) {
    var n = str.lastIndexOf('0');
    str = str.slice(0, n) + str.slice(n).replace('0', '1');
  }

  return str;
};

export const percent = (numerator: string, denominator: string) => {
  return math.evaluate(`(${numerator} / ${denominator}) * 100`);
};

export function scientificNotationToString(strParam: string) {
  let flag = /e/.test(strParam);
  if (!flag) return strParam;

  let sysbol = true;
  if (/e-/.test(strParam)) {
    sysbol = false;
  }

  const negative = Number(strParam) < 0 ? '-' : '';

  let index = Number(strParam.match(/\d+$/)[0]);

  let basis = strParam.match(/[\d\.]+/)[0];

  const ifFraction = basis.includes('.');

  let wholeStr;
  let fractionStr;

  if (ifFraction) {
    wholeStr = basis.split('.')[0];
    fractionStr = basis.split('.')[1];
  } else {
    wholeStr = basis;
    fractionStr = '';
  }

  if (sysbol) {
    if (!ifFraction) {
      return negative + wholeStr.padEnd(index + wholeStr.length, '0');
    } else {
      if (fractionStr.length <= index) {
        return negative + wholeStr + fractionStr.padEnd(index, '0');
      } else {
        return (
          negative +
          wholeStr +
          fractionStr.substring(0, index) +
          '.' +
          fractionStr.substring(index)
        );
      }
    }
  } else {
    if (!ifFraction)
      return (
        negative +
        wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.')
      );
    else {
      return (
        negative +
        wholeStr.padStart(index + wholeStr.length, '0').replace(/^0/, '0.') +
        fractionStr
      );
    }
  }
}

export const percentOfBigNumber = (
  percent: number,
  num: number | string,
  precision: number
) => {
  const valueBig = math.bignumber(num);
  const percentBig = math.bignumber(percent).div(100);

  return toPrecision(
    scientificNotationToString(valueBig.mul(percentBig).toString()),
    precision
  );
};
