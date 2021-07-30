import { wallet, refFiViewFunction } from './near';

export const mftGetBalance = async (
  token_id: string,
  accountId = wallet.getAccountId()
) => {
  return await refFiViewFunction({
    methodName: 'mft_balance_of',
    args: { account_id: accountId, token_id: token_id },
  });
};

export interface MFTStorageBalance {
  total: string;
  available: string;
}

export const mftGetStorageBalance = async (
  token_id: string,
  accountId = wallet.getAccountId()
): Promise<MFTStorageBalance | null> => {
  return await refFiViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};
