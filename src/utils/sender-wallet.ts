import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useReducer,
} from 'react';
import {
  REF_FARM_CONTRACT_ID,
  wallet as webWallet,
  wallet,
} from '../services/near';

import { getAmount, RefFiFunctionCallOptions, getGas } from '../services/near';
import { scientificNotationToString } from './numbers';

export const SENDER_WALLET_SIGNEDIN_STATE_KEY =
  'SENDER_WALLET_SIGNEDIN_STATE_VALUE';

export const getSenderLoginRes = () => {
  return localStorage.getItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);
};

export const saveSenderLoginRes = () => {
  localStorage.setItem(
    SENDER_WALLET_SIGNEDIN_STATE_KEY,
    SENDER_WALLET_SIGNEDIN_STATE_KEY + ': ' + senderWallet.getAccountId()
  );
};

export const removeSenderLoginRes = () => {
  localStorage.removeItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);
};

//@ts-ignore
export const senderWalletExtention = window.near;
export enum WALLET_TYPE {
  WEB_WALLET = 'near-wallet',
  SENDER_WALLET = 'sender-wallet',
}

export const LOCK_INTERVAL = 1000 * 60 * 20;
// export const LOCK_INTERVAL = 1000 * 60;

function senderWalletFunc() {
  this.requestSignIn = async function (contractId: string) {
    return senderWalletExtention
      .requestSignIn({
        contractId,
      })
      .then(() => saveSenderLoginRes());
  };

  this.signOut = function () {
    removeSenderLoginRes();
    return senderWalletExtention.signOut();
  };

  this.requestSignTransactions = async function (
    transactions: any,
    callbackUrl?: string
  ) {
    if (!senderWallet.isSignedIn()) {
      await this.requestSignIn(REF_FARM_CONTRACT_ID);
    }

    const senderTransaction = transactions.map((item: any) => {
      return {
        ...item,
        actions: item.functionCalls.map((fc: any) => ({
          ...fc,
          deposit: scientificNotationToString(getAmount(fc.amount).toString()),
          gas: scientificNotationToString(getGas(fc.gas).toString()),
        })),
      };
    });

    return senderWalletExtention
      .requestSignTransactions({
        transactions: senderTransaction,
      })
      .then(() => window.location.reload());
  };

  this.sendTransactionWithActions = async function (
    receiverId: string,
    functionCalls: RefFiFunctionCallOptions[]
  ) {
    if (!senderWallet.isSignedIn()) {
      await this.requestSignIn(REF_FARM_CONTRACT_ID);
    }

    return senderWalletExtention
      .signAndSendTransaction({
        receiverId,
        actions: functionCalls.map((fc) => {
          return {
            ...fc,
            deposit: scientificNotationToString(
              getAmount(fc.amount).toString()
            ),
            gas: scientificNotationToString(getGas(fc.gas).toString()),
          };
        }),
      })
      .then(() => window.location.reload());
  };

  this.walletType = WALLET_TYPE.SENDER_WALLET;
}

senderWalletFunc.prototype = senderWalletExtention;

export const senderWallet = new (senderWalletFunc as any)();

export const getAccountName = (accountId: string) => {
  const [account, network] = accountId.split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;

  return account.length > 10 ? niceAccountId : accountId;
};

export const getCurrentWallet = () => {
  const SENDER_LOGIN_RES = getSenderLoginRes();

  if (SENDER_LOGIN_RES)
    return {
      wallet: senderWallet,
      wallet_type: WALLET_TYPE.SENDER_WALLET,
      accountName: getAccountName(senderWallet.getAccountId()),
    };

  return {
    wallet: webWallet,
    wallet_type: WALLET_TYPE.WEB_WALLET,

    accountName: getAccountName(webWallet.getAccountId()),
  };
};

export const WalletContext = createContext(null);

export const signedInStateReducer = (
  state: { isSignedIn: boolean },
  action: { type: 'signIn' | 'signOut' }
) => {
  switch (action.type) {
    case 'signIn':
      return {
        isSignedIn: true,
      };
    case 'signOut':
      return {
        isSignedIn: false,
      };
  }
};
