import getConfig from './config';
import { Transaction, executeFarmMultipleTransactions } from './near';
import { getCurrentWallet } from '../utils/wallets-integration';
import { ftGetStorageBalance } from '../services/ft-contract';
import { wallet } from '../services/near';
const config = getConfig();
import { STORAGE_TO_REGISTER_WITH_FT } from './creators/storage';
export async function query_user_claimed(tokenId: string) {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await checkInViewFunction({
    methodName: 'query_user_claimed',
    args: { token: tokenId, user: accountId },
  });
}
export async function check_in(tokenIds: string[]) {
  const transactions: Transaction[] = [];
  const accountId = getCurrentWallet().wallet.getAccountId();
  const pending = tokenIds.map((tokenId: string) =>
    ftGetStorageBalance(tokenId)
  );
  const resolved = await Promise.all(pending);
  resolved.forEach((balance, index) => {
    if (!balance) {
      transactions.push({
        receiverId: tokenIds[index],
        functionCalls: [
          {
            methodName: 'storage_deposit',
            args: {
              account_id: accountId,
              registration_only: true,
            },
            amount: STORAGE_TO_REGISTER_WITH_FT,
            gas: '30000000000000',
          },
        ],
      });
    }
  });
  const funs = tokenIds.map((tokenId: string) => {
    return {
      methodName: 'check_in',
      args: { token: tokenId },
      gas: '300000000000000',
      amount: '0.0015',
    };
  });
  transactions.push({
    receiverId: config.MEME_CHECK_IN_CONTRACT_ID,
    functionCalls: funs,
  });
  return executeFarmMultipleTransactions(transactions);
}

export async function claim_nft() {}
export const checkInViewFunction = ({ methodName, args }: any) => {
  return wallet
    .account()
    .viewFunction(config.MEME_CHECK_IN_CONTRACT_ID, methodName, args);
};
