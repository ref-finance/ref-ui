import BN from 'bn.js';
import {
  refFiFunctionCall,
  refFiViewFunction,
  REF_FI_CONTRACT_ID,
  wallet,
} from './near';
import { depositStorageToCoverToken } from './account';
import { sumBN } from '~utils/numbers';
import { utils } from 'near-api-js';

export const registerToken = async (tokenId: string) => {
  // TODO: maybe check if there is enough storage already
  wallet._keyStore.getKey;
  console.log('registering token: ', tokenId);
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

interface DepositOptions {
  tokenId: string;
  amount: string;
  msg?: string;
}
export const deposit = async ({
  tokenId,
  amount,
  msg = '',
}: DepositOptions) => {
  return wallet.account().functionCall(
    tokenId,
    'ft_transfer_call',
    {
      receiver_id: REF_FI_CONTRACT_ID,
      amount,
      msg,
    },
    new BN('100000000000000'),
    new BN(utils.format.parseNearAmount('0.000000000000000000000001'))
  );
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

export interface TokenBalancesView {
  [tokenId: string]: string;
}
export const getTokenBalances = (): Promise<TokenBalancesView> => {
  return refFiViewFunction({
    methodName: 'get_deposits',
    args: { account_id: wallet.getAccountId() },
  });
};

export const getDepositableBalance = (tokenId: string): Promise<string> => {
  return wallet.account().viewFunction(tokenId, 'ft_balance_of', {
    account_id: wallet.getAccountId(),
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

  return [...new Set<string>([...globalWhitelist, ...userWhitelist])];
};

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
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
      decimals: 6,
      icon:
        'https://fluxprotocol.eth.link/static/media/wrapped-near.8b3a5e4b.svg',
    };
  }
};
