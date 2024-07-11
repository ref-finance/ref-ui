import { storageDepositAction } from './creators/storage';
import { refVeViewFunction } from './near';
import {
  refFarmViewFunction,
  refFiFunctionCall,
  refFiViewFunction,
  wallet,
  refFarmBoostViewFunction,
  refSwapV3ViewFunction,
  refSwapV3OldVersionViewFunction,
  refMeMeFarmViewFunction,
  xrefMeMeFarmViewFunction,
  lockerViewFunction,
} from './near';

export const ACCOUNT_MIN_STORAGE_AMOUNT = '0.005';
export interface RefPrice {
  'ref-finance': {
    usd: number;
  };
}

export const initializeAccount = () => {
  return refFiFunctionCall(
    storageDepositAction({
      accountId: wallet.getAccountId(),
      registrationOnly: true,
      amount: ACCOUNT_MIN_STORAGE_AMOUNT,
    })
  );
};

export interface AccountStorageView {
  total: string;
  available: string;
}

export const currentStorageBalance = (
  accountId: string
): Promise<AccountStorageView> => {
  return refFiViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};

export const currentStorageBalanceOfFarm = (
  accountId: string
): Promise<AccountStorageView> => {
  return refFarmViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};

export const currentStorageBalanceOfFarm_boost = (
  accountId: string
): Promise<AccountStorageView> => {
  return refFarmBoostViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};

export const currentStorageBalanceOfVE = (
  accountId: string
): Promise<AccountStorageView> => {
  return refVeViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};
export const currentStorageBalanceOfV3 = (
  accountId: string
): Promise<AccountStorageView> => {
  return refSwapV3ViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};
export const currentStorageBalanceOfV3_old_version = (
  accountId: string
): Promise<AccountStorageView> => {
  return refSwapV3OldVersionViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};

export const currentStorageBalanceOfMeme_farm = (
  accountId: string
): Promise<AccountStorageView> => {
  return refMeMeFarmViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};
export const currentStorageBalanceOfXref_farm = (
  accountId: string,
  contractId: string
): Promise<AccountStorageView> => {
  return xrefMeMeFarmViewFunction({
    contractId,
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};
export const currentStorageBalanceOfLocker = (
  accountId: string
): Promise<AccountStorageView> => {
  return lockerViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};
