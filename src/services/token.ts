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

export const getUserRegisteredTokens = async () => {
  const userWhitelist = await refFiViewFunction({
      methodName: 'get_user_whitelisted_tokens',
      args: { account_id: wallet.getAccountId() },
    })
  return userWhitelist;
};

export const getGlobalRegisteredTokens = async () => {
  const globalWhitelist = await refFiViewFunction({ 
    methodName: 'get_whitelisted_tokens' 
  });
  return globalWhitelist;
}
