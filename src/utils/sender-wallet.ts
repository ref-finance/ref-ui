import React, { useState, useEffect, useContext, createContext } from 'react';
import {
  REF_FARM_CONTRACT_ID,
  wallet as webWallet,
  wallet,
} from '../services/near';

import NearWalletSelector from 'near-wallet-selector';

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
    const signedInRes = await senderWalletExtention.requestSignIn({
      contractId,
    });
    localStorage.setItem(
      SENDER_WALLET_SIGNEDIN_STATE_KEY,
      SENDER_WALLET_SIGNEDIN_STATE_KEY + ':' + JSON.stringify(signedInRes)
    );
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
      return { ...item, actions: item.functionCalls };
    });

    return senderWalletExtention.requestSignTransactions({
      transactions: senderTransaction,
    });
  };

  this.walletType = WALLET_TYPE.SENDER_WALLET;
}

senderWalletFunc.prototype = senderWalletExtention;

export const senderWallet = new (senderWalletFunc as any)();

const getAccountName = (accountId: string = senderWallet.getAccountId()) => {
  const [account, network] = accountId.split('.');
  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;

  return account.length > 10 ? niceAccountId : accountId;
};

export const useSenderWallet = () => {
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    senderWallet.isSignedIn()
  );

  senderWallet.on({
    signIn: () => setIsSignedIn(true),
    signOut: () => setIsSignedIn(false),
  });

  const [senderAccountName, setSenderAccountName] = useState<string>('');

  useEffect(() => {
    setSenderAccountName(getAccountName());
    setIsSignedIn(isSignedIn);
  }, [isSignedIn]);

  useEffect(() => {
    const signedInRes = localStorage.getItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);

    if (signedInRes && !senderWallet.isSignedIn())
      senderWallet
        .requestSignIn(REF_FARM_CONTRACT_ID)
        .then((res: any) => console.log(res));
  }, []);

  return {
    senderWallet,
    senderAccountName,
    isSignedIn,
    setIsSignedIn,
  };
};

export const useWallet = () => {
  const [walletType, setWalletType] = useState<WALLET_TYPE>(
    WALLET_TYPE.WEB_WALLET
  );

  const {
    senderWallet,
    senderAccountName,
    isSignedIn: senderIsSignedIn,
    setIsSignedIn: senderSetIsSignedIn,
  } = useSenderWallet();

  useEffect(() => {
    if (webWallet.isSignedIn()) {
      setWalletType(WALLET_TYPE.WEB_WALLET);
    } else if (senderWallet.isSignedIn()) {
      setWalletType(WALLET_TYPE.SENDER_WALLET);
    }
  }, []);

  switch (walletType) {
    case WALLET_TYPE.SENDER_WALLET:
      return {
        wallet: senderWallet,
        accountName: senderAccountName,
        isSignedIn: senderIsSignedIn,
        setIsSignedIn: senderSetIsSignedIn,
        setWalletType,
        walletType: WALLET_TYPE.SENDER_WALLET,
      };
    case WALLET_TYPE.WEB_WALLET:
      return {
        wallet: webWallet,
        accountName: getAccountName(webWallet.getAccountId()),
        isSignedIn: webWallet.isSignedIn(),
        setIsSignedIn: null,
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
    return { wallet: senderWallet, wallet_type: WALLET_TYPE.SENDER_WALLET };
  else return { wallet: webWallet, wallet_type: WALLET_TYPE.WEB_WALLET };
};
