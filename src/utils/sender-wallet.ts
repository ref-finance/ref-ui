import React, { useState, useEffect, useContext } from 'react';
import { REF_FARM_CONTRACT_ID } from '../services/near';

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
  const [isSignedIn, setIsSignedIn] = useState<boolean>(
    senderWallet.isSignedIn()
  );
  const [account, network] = senderWallet.getAccountId().split('.');

  const niceAccountId = `${account.slice(0, 10)}...${network || ''}`;
  const accountName =
    account.length > 10 ? niceAccountId : senderWallet.getAccountId();

  senderWallet.on({
    signIn: () => setIsSignedIn(true),
    signOut: () => setIsSignedIn(false),
  });

  return {
    senderWallet,
    accountName,
    isSignedIn,
    setIsSignedIn,
  };
};
