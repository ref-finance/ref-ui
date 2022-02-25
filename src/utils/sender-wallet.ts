import React, { useState, useEffect, useContext } from 'react';
import { REF_FARM_CONTRACT_ID, wallet } from '../services/near';

export const SENDER_WALLET_SIGNEDIN_STATE_KEY =
  'SENDER_WALLET_SIGNEDIN_STATE_VALUE';

//@ts-ignore
export const senderWalletExtention = window.near;

// functions rewrite
function senderWalletFunc() {
  this.requestSignIn = function (contractId: string) {
    return senderWalletExtention.requestSignIn({ contractId });
  };

  this.signOut = function () {
    localStorage.removeItem(SENDER_WALLET_SIGNEDIN_STATE_KEY);
    return senderWalletExtention.signOut();
  };
}

senderWalletFunc.prototype = senderWalletExtention;

const senderWallet = new (senderWalletFunc as any)();

export const useSenderWallet = () => {
  const getAccountName = (accountId: string = senderWallet.getAccountId()) => {
    const [account, network] = accountId.split('.');
    const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;

    return account.length > 10 ? niceAccountId : accountId;
  };

  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    senderWallet.isSignedIn()
  );

  const [accountName, setAccountName] = useState<string>('');

  useEffect(() => {
    setAccountName(getAccountName());
  }, [isSignedIn]);

  senderWallet.on({
    signIn: () => setIsSignedIn(true),
    signOut: () => setIsSignedIn(false),
    accountChanged: (changedAccountId: string) => {
      senderWallet.requestSignIn(REF_FARM_CONTRACT_ID);
      setAccountName(getAccountName(changedAccountId));
    },
  });

  return {
    senderWallet,
    accountName,
    isSignedIn,
    setIsSignedIn,
  };
};
