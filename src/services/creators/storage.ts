import BN from 'bn.js';
import { RefFiFunctionCallOptions, REF_FI_CONTRACT_ID, wallet } from '../near';

export const STORAGE_PER_TOKEN = '0.00084';
const STORAGE_TO_REGISTER_WITH_FT = '0.1';
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
    registrationOnly: false,
    amount: STORAGE_PER_TOKEN,
  });

export const storageDepositForFTAction = () =>
  storageDepositAction({
    accountId: REF_FI_CONTRACT_ID,
    registrationOnly: true,
    amount: STORAGE_TO_REGISTER_WITH_FT,
  });
