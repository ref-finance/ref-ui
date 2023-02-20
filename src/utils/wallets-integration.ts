import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useReducer,
} from 'react';
import { REF_FARM_CONTRACT_ID, wallet as webWallet } from '../services/near';

import {
  getAmount,
  RefFiFunctionCallOptions,
  getGas,
  wallet,
  REF_FARM_BOOST_CONTRACT_ID,
} from '../services/near';
import { scientificNotationToString } from './numbers';
import { ACCOUNT_ID_KEY } from '../context/WalletSelectorContext';
import getConfig from '../services/config';
import {
  TRANSACTION_WALLET_TYPE,
  TRANSACTION_STATE,
} from '../components/layout/transactionTipPopUp';
import { WalletSelector } from '@near-wallet-selector/core';

export const SENDER_WALLET_SIGNEDIN_STATE_KEY =
  'SENDER_WALLET_SIGNEDIN_STATE_VALUE';

export const walletsRejectError = [
  'User reject',
  'User rejected the signature request',
  'Invalid message. Only transactions can be signed',
  'Ledger device: Condition of use not satisfied (denied by the user?) (0x6985)',
  'User cancelled the action',
  'User closed the window before completing the action',
];

export const extraWalletsError = [
  "Couldn't open popup window to complete wallet action",
];

export const getSenderLoginRes = () => {
  return localStorage.getItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);
};

export const saveSenderLoginRes = (accountId?: string) => {
  localStorage.setItem(
    SENDER_WALLET_SIGNEDIN_STATE_KEY,
    `SENDER_WALLET_SIGNEDIN_STATE_KEY: ${
      accountId || window.near.getAccountId()
    }`
  );
};

export const removeSenderLoginRes = () => {
  localStorage.removeItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);
};

export function addQueryParams(
  baseUrl: string,
  queryParams: {
    [name: string]: string;
  }
) {
  const url = new URL(baseUrl);
  for (let key in queryParams) {
    const param = queryParams[key];
    if (param) url.searchParams.set(key, param);
  }
  return url.toString();
}

export const getTransactionHashes = (
  res: any,
  state: TRANSACTION_STATE
): string[] => {
  if (state === TRANSACTION_STATE.SUCCESS) {
    return res.response?.map((resp: any) => {
      return resp.transaction.hash;
    });
  } else {
    return [
      res?.response?.error?.context?.transactionHash ||
        res?.response?.error?.transaction_outcome?.id,
    ];
  }
};

export const setCallbackUrl = (res: any) => {
  const state = !res?.response?.error
    ? TRANSACTION_STATE.SUCCESS
    : TRANSACTION_STATE.FAIL;

  const transactionHashes = getTransactionHashes(res, state);

  const parsedTransactionHashes = transactionHashes?.join(',');

  const newHref = addQueryParams(
    window.location.origin + window.location.pathname,
    {
      [TRANSACTION_WALLET_TYPE.SENDER_WALLET]: parsedTransactionHashes,
      state: parsedTransactionHashes ? state : '',
    }
  );

  window.location.href = newHref;
};

//@ts-ignore
export enum WALLET_TYPE {
  WEB_WALLET = 'near-wallet',
  SENDER_WALLET = 'sender-wallet',
}

export enum SENDER_ERROR {
  USER_REJECT = 'User reject',
}

export const LOCK_INTERVAL = 1000 * 60 * 20;

function senderWalletFunc(window: Window) {
  this.requestSignIn = async function (contractId: string) {
    return window.near
      .requestSignIn({
        contractId: contractId || getConfig().REF_FARM_BOOST_CONTRACT_ID,
      })
      .then((res: any) => {
        // Login reject
        if (res?.error && res?.error === SENDER_ERROR.USER_REJECT) {
          removeSenderLoginRes();
          window.location.reload();
        }

        // unknown error from near chain
        if (res?.error && res?.error?.type) {
          window.location.href = addQueryParams(window.location.href, {
            signInErrorType: res.error.type,
          });
        }

        // login success
        if (!res?.error) {
          saveSenderLoginRes();
          document
            .getElementsByClassName('sender-login-fail-toast')?.[0]
            ?.setAttribute('style', 'display:none');
        }

        return res;
      });
  };

  this.signOut = function () {
    // removeSenderLoginRes();
    const n: any = window?.near;
    const signedInContractSize = n?.authData?.allKeys;

    if (
      signedInContractSize &&
      Number(Object.keys(signedInContractSize).length === 1)
    ) {
      return window.near.signOut();
    }

    if (
      signedInContractSize &&
      Object.keys(signedInContractSize).includes('aurora')
    ) {
      return n.signOut({
        contractId: 'aurora',
      });
    } else {
      return n.signOut({
        contractId: REF_FARM_BOOST_CONTRACT_ID,
      });
    }
  };

  this.requestSignTransactions = async function (
    transactions: any,
    callbackUrl?: string
  ) {
    if (!window.near.isSignedIn()) {
      await this.requestSignIn(REF_FARM_BOOST_CONTRACT_ID);
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

    return window.near
      .requestSignTransactions({
        transactions: senderTransaction,
      })
      .then((res: any) => {
        setCallbackUrl(res);
      });
  };

  this.sendTransactionWithActions = async function (
    receiverId: string,
    functionCalls: RefFiFunctionCallOptions[]
  ) {
    const n: any = window?.near;
    if (!window.near.isSignedIn()) {
      await this.requestSignIn(REF_FARM_BOOST_CONTRACT_ID);
    }

    return n
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
      .then((res: any) => {
        setCallbackUrl(res);
      });
  };

  this.walletType = WALLET_TYPE.SENDER_WALLET;
}

senderWalletFunc.prototype = window.near;

export const senderWallet = new (senderWalletFunc as any)();

export const getSenderWallet = (window: Window) => {
  senderWalletFunc.prototype = window.near;

  return new (senderWalletFunc as any)(window);
};

export const getAccountName = (accountId: string) => {
  const [account, network] = accountId.split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;

  return account.length > 10 ? niceAccountId : accountId;
};

export const getCurrentWallet = () => {
  const walletInstance = window.selector;

  if (walletInstance) {
    walletInstance.getAccountId = () => {
      return localStorage.getItem(ACCOUNT_ID_KEY) || '';
    };
  }

  return {
    wallet: walletInstance,
    wallet_type: WALLET_TYPE.WEB_WALLET,
  };
};

export const WalletContext = createContext(null);

export const globalStateReducer = (
  state: { isSignedIn: boolean },
  action: { type: 'signIn' | 'signOut' }
) => {
  switch (action.type) {
    case 'signIn':
      return {
        ...state,
        isSignedIn: true,
      };
    case 'signOut':
      return {
        ...state,
        isSignedIn: false,
      };
  }
};

// export const setCallbackUrl = (res: any) => {
//   const state = !res?.response?.error
//     ? TRANSACTION_STATE.SUCCESS
//     : TRANSACTION_STATE.FAIL;

//   const transactionHashes = getTransactionHashes(res, state);

//   const parsedTransactionHashes = transactionHashes?.join(',');

// const newHref = addQueryParams(
//   window.location.origin + window.location.pathname,
//   {
//     [TRANSACTION_WALLET_TYPE.SENDER_WALLET]: parsedTransactionHashes,
//     state: parsedTransactionHashes ? state : '',
//   }
// );

//   window.location.href = newHref;
// };

export const ledgerTipTrigger = async (wallet: WalletSelector) => {
  const handlePopTrigger = () => {
    const el = document.getElementsByClassName(
      'ledger-transaction-pop-up'
    )?.[0];
    if (el) {
      el.setAttribute('style', 'display:flex');
    }
  };

  const isLedger = (await wallet.wallet()).id === 'ledger';

  if (isLedger) {
    handlePopTrigger();
  }
};
