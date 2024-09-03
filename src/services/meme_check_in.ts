import getConfig from './config';
import { Transaction, executeFarmMultipleTransactions } from './near';
import { getCurrentWallet } from '../utils/wallets-integration';
import { ftGetStorageBalance } from '../services/ft-contract';
import { wallet } from '../services/near';
import { getMemeCheckInConfig } from '../components/meme/memeConfig';
const config = getConfig();
const memeCheckInConfig = getMemeCheckInConfig();
import { STORAGE_TO_REGISTER_WITH_FT } from './creators/storage';
export async function query_user_claimed(tokenId: string) {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await checkInViewFunction({
    methodName: 'query_user_claimed',
    args: { token: tokenId, user: accountId },
  });
}
export async function query_user_nftInfo() {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await nftViewFunction({
    methodName: 'nft_tokens_for_owner',
    args: { account_id: accountId },
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
      gas: '42000000000000',
      amount: '0.0015',
    };
  });
  transactions.push({
    receiverId: config.MEME_CHECK_IN_CONTRACT_ID,
    functionCalls: funs,
  });
  return executeFarmMultipleTransactions(transactions);
}

export async function claim_nft({ media }: { media: string }) {
  const transactions: Transaction[] = [];
  const accountId = getCurrentWallet().wallet.getAccountId();
  transactions.push({
    receiverId: config.MEME_NFT_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'nft_mint',
        args: {
          token_owner_id: accountId,
          token_metadata: {
            title: memeCheckInConfig.nftMetaData.title,
            description: memeCheckInConfig.nftMetaData.description,
            media,
          },
        },
        gas: '300000000000000',
        amount: '0.007',
      },
    ],
  });
  return executeFarmMultipleTransactions(transactions);
}
export async function get_nft_metadata() {
  const metadata = await nftViewFunction({
    methodName: 'nft_metadata',
    args: {},
  });
  return metadata;
}
export async function is_account_already_minted() {
  const accountId = getCurrentWallet().wallet.getAccountId();
  return await nftViewFunction({
    methodName: 'is_account_already_minted',
    args: {
      account_id: accountId,
    },
  });
}
export const checkInViewFunction = ({ methodName, args }: any) => {
  return wallet
    .account()
    .viewFunction(config.MEME_CHECK_IN_CONTRACT_ID, methodName, args);
};
export const nftViewFunction = ({ methodName, args }: any) => {
  return wallet
    .account()
    .viewFunction(config.MEME_NFT_CONTRACT_ID, methodName, args);
};
