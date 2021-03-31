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

export const getUserRegisteredTokens = (): Promise<string> => {
  return refFiViewFunction({
    methodName: 'get_user_whitelisted_tokens',
    args: { account_id: wallet.getAccountId() },
  });
};

export const getRegisteredTokens = async (): Promise<string[]> => {
  const [globalWhitelist, userWhitelist] = await Promise.all([
    refFiViewFunction({ methodName: 'get_whitelisted_tokens' }),
    refFiViewFunction({
      methodName: 'get_user_whitelisted_tokens',
      args: { account_id: wallet.getAccountId() },
    }),
  ]);

  return [...globalWhitelist, ...userWhitelist];
};

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  icon: string;
}

export const getTokenMetadata = async (id: string): Promise<TokenMetadata> => {
  try {
    const metadata = await wallet.account().viewFunction(id, 'ft_metadata', {});
    return {
      id,
      ...metadata,
    };
  } catch {
    return {
      id,
      name: id,
      symbol: id.split('.')[0].slice(0, 8),
      icon:
        'https://fluxprotocol.eth.link/static/media/wrapped-near.8b3a5e4b.svg',
    };
  }
};
