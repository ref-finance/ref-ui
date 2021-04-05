import { RefFiFunctionCallOptions, wallet } from '../near';

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
    amount: '0.00084',
  });
