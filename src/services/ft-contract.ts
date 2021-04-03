import {
  RefFiFunctionCallOptions,
  wallet,
  getGas,
  getAmount,
  RefFiViewFunctionOptions,
} from './near';

export const ftFunctionCall = (
  tokenId: string,
  { methodName, args, gas, amount }: RefFiFunctionCallOptions
) => {
  return wallet
    .account()
    .functionCall(tokenId, methodName, args, getGas(gas), getAmount(amount));
};

export const ftViewFunction = (
  tokenId: string,
  { methodName, args }: RefFiViewFunctionOptions
) => {
  return wallet.account().viewFunction(tokenId, methodName, args);
};

export const ftGetBalance = (tokenId: string) => {
  return ftViewFunction(tokenId, {
    methodName: 'ft_balance_of',
    args: { account_id: wallet.getAccountId() },
  });
};

export const ftGetStorageBalance = (tokenId: string) => {
  return ftViewFunction(tokenId, {
    methodName: 'storage_balance_of',
    args: { account_id: wallet.getAccountId() },
  });
};

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
}
export const ftGetTokenMetadata = async (
  id: string
): Promise<TokenMetadata> => {
  try {
    const metadata = await ftViewFunction(id, {
      methodName: 'ft_metadata',
    });
    return {
      id,
      ...metadata,
    };
  } catch (err) {
    console.log(err);
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
