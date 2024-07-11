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
import { getCurrentWallet, WALLET_TYPE } from '../utils/wallets-integration';
import getConfig from './config';
import { nearMetadata, WRAP_NEAR_CONTRACT_ID } from './wrap-near';
import { REF_TOKEN_ID, getAccountNearBalance } from './near';
import getConfigV2 from './configV2';
const configV2 = getConfigV2();

export const NEAR_ICON =
  'https://near.org/wp-content/themes/near-19/assets/img/brand-icon.png';
const BANANA_ID = 'berryclub.ek.near';
const CHEDDAR_ID = 'token.cheddar.near';
const CUCUMBER_ID = 'farm.berryclub.ek.near';
const HAPI_ID = 'd9c2d319cd7e6177336b0a9c93c21cb48d84fb54.factory.bridge.near';
const WOO_ID = '4691937a7508860f876c9c0a2a617e7d9e945d4b.factory.bridge.near';
const SOL_ID = 'sol.token.a11bd.near';
const FRAX_ID = '853d955acef822db058eb8505911ed77f175b99e.factory.bridge.near';
const BLACKDRAGON_ID = 'blackdragon.tkn.near';
const SOL_NATIVE_ID = '22.contract.portalbridge.near';
const BABY_BLACKDRAGON_ID = 'babyblackdragon.tkn.near';
const INTEL_ID = 'intel.tkn.near';

export const REF_META_DATA = {
  decimals: 18,
  icon: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='16 24 248 248' style='background: %23000'%3E%3Cpath d='M164,164v52h52Zm-45-45,20.4,20.4,20.6-20.6V81H119Zm0,18.39V216h41V137.19l-20.6,20.6ZM166.5,81H164v33.81l26.16-26.17A40.29,40.29,0,0,0,166.5,81ZM72,153.19V216h43V133.4l-11.6-11.61Zm0-18.38,31.4-31.4L115,115V81H72ZM207,121.5h0a40.29,40.29,0,0,0-7.64-23.66L164,133.19V162h2.5A40.5,40.5,0,0,0,207,121.5Z' fill='%23fff'/%3E%3Cpath d='M189 72l27 27V72h-27z' fill='%2300c08b'/%3E%3C/svg%3E%0A",
  id: getConfig().REF_TOKEN_ID,
  name: 'Ref Finance Token',
  symbol: 'REF',
};

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

export const ftGetBalance = (tokenId: string, account_id?: string) => {
  if (tokenId === 'NEAR') {
    return getAccountNearBalance(
      account_id || getCurrentWallet().wallet.getAccountId()
    ).then(({ available }: any) => available);
  }

  return ftViewFunction(tokenId, {
    methodName: 'ft_balance_of',
    args: {
      account_id: account_id || getCurrentWallet()?.wallet?.getAccountId(),
    },
  }).catch(() => '0');
};

export interface FTStorageBalance {
  total: string;
  available: string;
}
export const ftGetStorageBalance = async (
  tokenId: string,
  accountId = getCurrentWallet()?.wallet?.getAccountId()
): Promise<FTStorageBalance | null> => {
  if (configV2.NO_REQUIRED_REGISTRATION_TOKEN_IDS.includes(tokenId)) {
    const r = await native_usdc_has_upgrated(tokenId);
    if (r) {
      return ftViewFunction(tokenId, {
        methodName: 'storage_balance_of',
        args: { account_id: accountId },
      });
    } else {
      return check_registration(tokenId).then((is_registration) => {
        if (is_registration) {
          return new Promise((resove) => {
            resove({ available: '1', total: '1' });
          });
        } else {
          return new Promise((resove) => {
            resove(null);
          });
        }
      });
    }
  }
  return ftViewFunction(tokenId, {
    methodName: 'storage_balance_of',
    args: { account_id: accountId },
  });
};

export const native_usdc_has_upgrated = async (
  tokenId: string,
  accountId = getCurrentWallet()?.wallet?.getAccountId()
) => {
  try {
    await ftViewFunction(tokenId, {
      methodName: 'storage_balance_of',
      args: { account_id: accountId },
    });
    return true;
  } catch (error) {
    await check_registration(tokenId).then((is_registration) => {
      if (is_registration) {
        return new Promise((resove) => {
          resove({ available: '1', total: '1' });
        });
      } else {
        return new Promise((resove) => {
          resove(null);
        });
      }
    });
    return false;
  }
};

export const check_registration = (
  tokenId: string,
  accountId = getCurrentWallet()?.wallet?.getAccountId()
): Promise<FTStorageBalance | null> => {
  return ftViewFunction(tokenId, {
    methodName: 'check_registration',
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
  aurora?: number | string;
  total?: number;
  onRef?: boolean;
  onTri?: boolean;
  amountLabel?: string;
  amount?: number;
  dcl?: number | string;
  nearNonVisible?: number | string;
  t_value?: string;
  isRisk?: boolean;
  isUserToken?: boolean;
}
export const ftGetTokenMetadata = async (
  id: string,
  accountPage?: boolean
): Promise<TokenMetadata> => {
  try {
    let metadata = await db.allTokens().where({ id }).first();
    if (!metadata) {
      metadata = await ftViewFunction(id, {
        methodName: 'ft_metadata',
      });
      await db.allTokens().put({
        id,
        name: metadata.name,
        symbol: metadata.symbol,
        decimals: metadata.decimals,
        icon: metadata.icon,
      });
    }

    if (metadata.id === WRAP_NEAR_CONTRACT_ID) {
      if (accountPage)
        return {
          ...metadata,
          icon: metadataDefaults[WRAP_NEAR_CONTRACT_ID],
        };

      return {
        ...metadata,
        icon: nearMetadata.icon,
        symbol: 'NEAR',
      };
    } else if (
      !metadata.icon ||
      metadata.icon === NEAR_ICON ||
      metadata.id === BANANA_ID ||
      metadata.id === CHEDDAR_ID ||
      metadata.id === CUCUMBER_ID ||
      metadata.id === HAPI_ID ||
      metadata.id === WOO_ID ||
      metadata.id === WRAP_NEAR_CONTRACT_ID ||
      metadata.id === SOL_ID ||
      metadata.id === BLACKDRAGON_ID ||
      metadata.id === FRAX_ID ||
      metadata.id === SOL_NATIVE_ID ||
      metadata.id === BABY_BLACKDRAGON_ID ||
      metadata.id === INTEL_ID
    ) {
      metadata.icon = metadataDefaults[id];
      if (metadata.id === SOL_ID) {
        metadata.symbol = 'SOL.Allbridge';
      }
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

export const unWrapToken = (token: TokenMetadata, keepId?: boolean) => {
  if (token.id === getConfig().WRAP_NEAR_CONTRACT_ID)
    return { ...nearMetadata, id: keepId ? token.id : nearMetadata.id };
  else return token;
};

export const tokenFtMetadata = async (tokenId: string) => {
  const metadata = await ftViewFunction(tokenId, {
    methodName: 'tknx_metadata',
  });
  return metadata;
};
