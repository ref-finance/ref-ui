import { refFiFunctionCall, refFiViewFunction, wallet } from './near';
import { depositStorageToCoverToken } from './account';

export const registerToken = async (tokenId: string) => {
  // TODO: maybe check if there is enough storage already
  await depositStorageToCoverToken();

  return refFiFunctionCall({
    methodName: 'register_tokens',
    args: { token_ids: [tokenId] },
  });
};

export const unregisterToken = (tokenId: string) => {
  return refFiFunctionCall({
    methodName: 'unregister_tokens',
    args: { token_ids: [tokenId] },
  });
};

interface WithdrawOptions {
  tokenId: string;
  amount: string;
  unregister?: boolean;
}

export const withdraw = ({
  tokenId,
  amount,
  unregister = false,
}: WithdrawOptions) => {
  return refFiFunctionCall({
    methodName: 'withdraw',
    args: { token_id: tokenId, amount, unregister },
    amount: '0.000000000000000000000001',
  });
};

export const getTokenBalances = () => {
  return refFiViewFunction({
    methodName: 'get_deposits',
    args: { accountId: wallet.getAccountId() },
  });
};

export const getRegisteredTokens = async () => {
  const [globalWhitelist, userWhitelist] = await Promise.all([
    refFiViewFunction({ methodName: 'get_whitelisted_tokens' }),
    refFiViewFunction({
      methodName: 'get_user_whitelisted_tokens',
      args: { accountId: wallet.getAccountId() },
    }),
  ]);

  return [...globalWhitelist, ...userWhitelist];
};
