import BN from 'bn.js';
import {
  RefFiFunctionCallOptions,
  REF_FI_CONTRACT_ID,
  REF_FARM_CONTRACT_ID,
  wallet,
} from '../near';

export const STORAGE_PER_TOKEN = '0.00084';
export const STORAGE_TO_REGISTER_WITH_FT = '0.1';
export const STORAGE_TO_REGISTER_WITH_MFT = '0.1';
export const MIN_DEPOSIT_PER_TOKEN = new BN('800000000000000000000');

interface StorageDepositActionOptions {
  accountId?: string;
  registrationOnly?: boolean;
  amount: string;
}
export const storageDepositAction = ({
  accountId = wallet.getAccountId(),
  registrationOnly = false,
  amount,
}: StorageDepositActionOptions): RefFiFunctionCallOptions => ({
  methodName: 'storage_deposit',
  args: {
    account_id: accountId,
    registration_only: registrationOnly,
  },
  amount,
});

export const storageDepositForTokenAction = (
  accountId: string = wallet.getAccountId()
): RefFiFunctionCallOptions =>
  storageDepositAction({
    accountId,
    amount: STORAGE_PER_TOKEN,
  });

export const storageDepositForFTAction = () =>
  storageDepositAction({
    accountId: REF_FI_CONTRACT_ID,
    amount: STORAGE_TO_REGISTER_WITH_FT,
  });

export const storageDepositForMFTAction = () =>
  storageDepositAction({
    accountId: REF_FARM_CONTRACT_ID,
    amount: STORAGE_TO_REGISTER_WITH_MFT,
  });
