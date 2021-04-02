import BN from 'bn.js';
import { utils } from 'near-api-js';
import {
  refFiFunctionCall,
  refFiViewFunction,
  REF_FI_CONTRACT_ID,
  wallet,
} from './near';

export const MIN_DEPOSIT_PER_TOKEN = new BN('800000000000000000000');

interface DepositStorageOptions {
  accountId?: string;
  registrationOnly?: boolean;
  amount?: string;
}

export const depositStorage = ({
  accountId,
  registrationOnly = true,
  amount = '0.01',
}: DepositStorageOptions) => {
  return refFiFunctionCall({
    methodName: 'storage_deposit',
    args: { account_id: accountId, registration_only: registrationOnly },
    amount,
  });
};

export const depositStorageToCoverToken = (tokenCount: number = 1) => {
  const amount = utils.format.formatNearAmount(
    MIN_DEPOSIT_PER_TOKEN.mul(new BN(tokenCount)).toString()
  );

  return depositStorage({
    accountId: wallet.getAccountId(),
    registrationOnly: false,
    amount, // 0.0125 1E20 vs 1E19
  });
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
