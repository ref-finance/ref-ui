import {
  RefFiFunctionCallOptions,
  wallet,
  getGas,
  getAmount,
  RefFiViewFunctionOptions,
} from './near';
import metadataDefaults from '../utils/metadata';
import { storageDepositForFTAction } from './creators/storage';
import db from '../store/RefDatabase';

export const NEAR_ICON =
  'https://near.org/wp-content/themes/near-19/assets/img/brand-icon.png';
const BANANA_ID = 'berryclub.ek.near';
const CHEDDAR_ID = 'token.cheddar.near';
const CUCUMBER_ID = 'farm.berryclub.ek.near';
const HAPI_ID = 'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near';

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
  }).catch(() => '0');
};

export interface FTStorageBalance {
  total: string;
  available: string;
}
export const ftGetStorageBalance = (
  tokenId: string,
  accountId = wallet.getAccountId()
): Promise<FTStorageBalance | null> => {
  return ftViewFunction(tokenId, {
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};

export interface TokenMetadata {
  id: string;
  name: string;
  symbol: string;
  decimals: number;
  icon: string;
  ref?: number | string;
  near?: number | string;
  total?: number;
  amountLabel?: string;
  amount?: number;
  nearNonVisible?: number | string;
}
export const ftGetTokenMetadata = async (
  id: string
): Promise<TokenMetadata> => {
  try {
    let metadata = await db.allTokens().where({ id: id }).first();
    if (!metadata) {
      metadata = await ftViewFunction(id, {
        methodName: 'ft_metadata',
      });
      await db.allTokens().put({
        id: id,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        icon: metadata.icon,
      });
    }
    if (
      !metadata.icon ||
      metadata.icon === NEAR_ICON ||
      metadata.id === BANANA_ID ||
      metadata.id === CHEDDAR_ID ||
      metadata.id === CUCUMBER_ID ||
      metadata.id === HAPI_ID
    ) {
      metadata.icon = metadataDefaults[id];
    }
    return {
      id,
      ...metadata,
    };
  } catch (err) {
    return {
      id,
      name: id,
      symbol: id?.split('.')[0].slice(0, 8),
      decimals: 6,
      icon: null,
    };
  }
};

export const ftGetTokensMetadata = async (tokenIds: string[]) => {
  const tokensMetadata = await Promise.all(
    tokenIds.map((id: string) => ftGetTokenMetadata(id))
  );

  return tokensMetadata.reduce((pre, cur, i) => {
    return {
      ...pre,
      [tokenIds[i]]: cur,
    };
  }, {});
};

export const ftRegisterExchange = async (tokenId: string) => {
  return ftFunctionCall(tokenId, storageDepositForFTAction());
};
