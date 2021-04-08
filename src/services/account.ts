import { storageDepositAction } from './creators/storage';
import { refFiFunctionCall, refFiViewFunction, wallet } from './near';

export const ACCOUNT_MIN_STORAGE_AMOUNT = '0.00084';

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
