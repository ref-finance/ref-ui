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

import NearWalletSelector from 'near-wallet-selector';
import { getAmount, RefFiFunctionCallOptions, getGas } from '../services/near';
import { scientificNotationToString } from './numbers';
import { Action } from 'near-api-js/lib/transaction';

export const wallet_selector = new NearWalletSelector({
  wallets: ['near-wallet', 'sender-wallet'],
  networkId: process.env.NEAR_ENV as 'testnet' | 'mainnet',
  theme: 'light',
  contract: {
    accountId: REF_FARM_CONTRACT_ID,
  },
  walletSelectorUI: {
    description: 'Please select a wallet to connect to this dApp:',
    explanation: [
      'Wallets are used to send, receive, and store digital assets.',
      'There are different types of wallets. They can be an extension',
      'added to your browser, a hardware device plugged into your',
      'computer, web-based, or as an app on your phone.',
    ].join(' '),
  },
});

export const SENDER_WALLET_SIGNEDIN_STATE_KEY =
  'SENDER_WALLET_SIGNEDIN_STATE_VALUE';

//@ts-ignore
export const senderWalletExtention = window.near;
export enum WALLET_TYPE {
  WEB_WALLET = 'near-wallet',
  SENDER_WALLET = 'sender-wallet',
}

function senderWalletFunc() {
  this.requestSignIn = async function (contractId: string) {
    return senderWalletExtention
      .requestSignIn({
        contractId,
      })
      .then(() => {
        localStorage.setItem(
          SENDER_WALLET_SIGNEDIN_STATE_KEY,
          SENDER_WALLET_SIGNEDIN_STATE_KEY + ': ' + senderWallet.getAccountId()
        );
      });
  };

  this.signOut = function () {
    localStorage.removeItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);
    return senderWalletExtention.signOut();
  };

  this.requestSignTransactions = function (
    transactions: any,
    callbackUrl?: string
  ) {
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

  this.sendTransactionWithActions = function (
    receiverId: string,
    functionCalls: RefFiFunctionCallOptions[]
  ) {
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
  this.viewFunction = async function (
    contractId: string,
    methodName: string,
    args?: any
  ) {
    return await senderWalletExtention
      .viewFunction({
        contractId,
        methodName,
        args,
      })
      .then((res: any) => {
        return res.response;
      });
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

export const useWallet = () => {
  const [walletType, setWalletType] = useState<WALLET_TYPE>(
    WALLET_TYPE.SENDER_WALLET
  );

  const [unlocking, setUnlocking] = useState(false);

  const { signedInState, signedInStatedispatch } = useContext(WalletContext);

  const [senderSignedIn, setSenderSignedIn] = useState<boolean>(false);

  useEffect(() => {
    const signedInRes = localStorage.getItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);

    if (signedInRes && !senderWallet.isSignedIn() && !unlocking) {
      setUnlocking(true);
      senderWallet.requestSignIn(REF_FARM_CONTRACT_ID).then(() => {
        signedInStatedispatch({ type: 'signIn' });
        setUnlocking(false);
      });
    }
  }, []);

  useEffect(() => {
    if (webWallet.isSignedIn()) {
      setWalletType(WALLET_TYPE.WEB_WALLET);
    } else if (senderWallet.isSignedIn()) {
      setWalletType(WALLET_TYPE.SENDER_WALLET);
    }
  }, [signedInState.isSignedIn]);

  senderWallet.on('signIn', () => {
    localStorage.setItem(
      SENDER_WALLET_SIGNEDIN_STATE_KEY,
      SENDER_WALLET_SIGNEDIN_STATE_KEY + ': ' + senderWallet.getAccountId()
    );
    signedInStatedispatch({ type: 'signIn' });
  });

  senderWallet.on('signOut', () => {
    signedInStatedispatch({ type: 'signOut' });
  });

  switch (walletType) {
    case WALLET_TYPE.SENDER_WALLET:
      return {
        wallet: senderWallet,
        setWalletType,
        isSignedIn: senderSignedIn,
        setIsSigneIn: setSenderSignedIn,
        walletType: WALLET_TYPE.SENDER_WALLET,
      };

    case WALLET_TYPE.WEB_WALLET:
      return {
        wallet: webWallet,
        isSignedIn: webWallet.isSignedIn(),
        setWalletType,
        walletType: WALLET_TYPE.WEB_WALLET,
      };
  }
};

export const getCurrentWallet = () => {
  const SENDER_LOGIN_RES = localStorage.getItem(
    SENDER_WALLET_SIGNEDIN_STATE_KEY
  );

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
