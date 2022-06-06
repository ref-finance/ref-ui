import React from 'react';
import { refFiViewFunction, refVeViewFunction } from './near';
import { getCurrentWallet } from '../utils/sender-wallet';

export const getAccountInfo = () => {
  console.log(getCurrentWallet().wallet.getAccountId());
  return refVeViewFunction({
    methodName: 'get_account_info',
    args: { account_id: getCurrentWallet().wallet.getAccountId() },
  });
};

export const getMetaData = () => {
  return refVeViewFunction({
    methodName: 'get_metadata',
  });
};
