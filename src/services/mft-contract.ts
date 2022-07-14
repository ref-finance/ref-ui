import { wallet, refFiViewFunction } from './near';
import { getCurrentWallet } from '../utils/wallets-integration';

export const mftGetBalance = async (
  token_id: string,
  accountId = getCurrentWallet()?.wallet?.getAccountId()
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
  accountId = getCurrentWallet()?.wallet?.getAccountId()
): Promise<MFTStorageBalance | null> => {
  return await refFiViewFunction({
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};
