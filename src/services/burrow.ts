import Big from 'big.js';
import { wallet, executeMultipleTransactions, Transaction } from './near';
import { ftGetTokenMetadata, TokenMetadata } from '~services/ft-contract';
import getConfig from './config';
const { BURROW_CONTRACT_ID } = getConfig();
import { getCurrentWallet, WalletContext } from '../utils/wallets-integration';
import { useWalletSelector } from 'context/WalletSelectorContext';
import { shrinkToken, expandToken, sumReducer, toUsd } from './burrow-utils';
import {
  IAccount,
  IAsset,
  INetTvlFarm,
  IAssetRewardDetail,
} from './burrow-interfaces';
import { getNetLiquidityAPY } from './burrow-business';

export async function getAssets() {
  const assets = await burrowViewFunction({ methodName: 'get_assets_paged' });
  const tokenIds = assets?.map(([id]: [string, any]) => id);
  const assetsDetailedRequest = tokenIds.map(async (token_id: string) =>
    burrowViewFunction({
      methodName: 'get_asset',
      args: {
        token_id,
      },
    })
  );
  const assetsDetailed = await Promise.all(assetsDetailedRequest);
  const tokensMetadataRequest = tokenIds.map(async (id: string) =>
    ftGetTokenMetadata(id)
  );
  const tokensMetadata = await Promise.all(tokensMetadataRequest);
  const config = await burrowViewFunction({ methodName: 'get_config' });
  const prices = await wallet
    .account()
    .viewFunction(config?.['oracle_account_id'], 'get_price_data');
  const refPrices = await fetch(
    'https://raw.githubusercontent.com/NearDeFi/token-prices/main/ref-prices.json'
  ).then((r) => r.json());
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  const balances = accountId
    ? await Promise.all(
        tokenIds.map((token_id: string) =>
          wallet
            .account()
            .viewFunction(token_id, 'ft_balance_of', { account_id: accountId })
        )
      )
    : undefined;
  return assetsDetailed?.map((asset, i) => {
    const price = prices?.prices?.find(
      (p: any) => p.asset_id === asset?.token_id
    );
    const usd =
      Number(price?.price?.multiplier) /
      10 ** (price?.price?.decimals - tokensMetadata?.[i].decimals);
    const temp_temp = Big(asset.supplied.balance)
      .plus(Big(asset.reserved))
      .minus(Big(asset.borrowed.balance));
    const temp = temp_temp.minus(temp_temp.mul(0.001));
    const decimals = tokensMetadata?.[i].decimals + asset.config.extra_decimals;
    const availableLiquidity = Number(shrinkToken(temp.toFixed(), decimals));
    const extraPrice = price?.price || {
      decimals: Number(refPrices?.[asset.token_id]?.decimal),
      multiplier: '1',
    };
    return {
      ...asset,
      metadata: tokensMetadata?.[i],
      accountBalance: accountId ? balances?.[i] : undefined,
      availableLiquidity,
      price: {
        ...extraPrice,
        usd: usd || parseFloat(refPrices?.[asset.token_id]?.price),
      },
    };
  });
}
export async function getAccount() {
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  return await burrowViewFunction({
    methodName: 'get_account',
    args: {
      account_id: accountId,
    },
  });
}
export async function getRewards(account: IAccount, assets: IAsset[]) {
  const netLiquidityFarm = (await getFarm('NetTvl')) as INetTvlFarm;
  const [apyRewardTvl, rewardTokensTVL] = getNetLiquidityAPY(
    netLiquidityFarm,
    account,
    assets
  ) as [number, string[]];
  const rewards = assets.map((asset: IAsset) => {
    const apyBase = Number(asset['supply_apr']) * 100;
    const apyBaseBorrow = Number(asset['borrow_apr']) * 100;
    const tokenId = asset.token_id;
    const totalSupplyUsd = toUsd(asset.supplied.balance, asset);
    const totalBorrowUsd = toUsd(asset.borrowed.balance, asset);

    const suppliedFarmRewards =
      asset.farms.find((farm) => farm.farm_id.Supplied === tokenId)?.rewards ||
      {};

    const rewardTokens = [
      ...new Set(
        Object.entries(suppliedFarmRewards)
          .map(([rewardTokenId]) => rewardTokenId)
          .concat(rewardTokensTVL)
      ),
    ];

    const apyRewards = Object.entries(suppliedFarmRewards).map(
      ([rewardTokenId, reward]) => {
        const rewardAsset = assets.find((a) => a.token_id === rewardTokenId);
        const decimals =
          rewardAsset.metadata.decimals + rewardAsset.config.extra_decimals;
        const price = rewardAsset.price?.usd || 0;
        if (!totalSupplyUsd) return 0;
        return (
          new Big(reward.reward_per_day)
            .div(new Big(10).pow(decimals || 0))
            .mul(365)
            .mul(price)
            .div(totalSupplyUsd)
            .mul(100)
            .toNumber() || 0
        );
      }
    );

    const apyReward = apyRewards.reduce(sumReducer, 0);

    const borrowedFarmRewards =
      asset.farms.find((farm) => farm.farm_id.Borrowed === tokenId)?.rewards ||
      {};

    const rewardTokensBorrow = Object.entries(borrowedFarmRewards).map(
      ([rewardTokenId]) => rewardTokenId
    );

    const apyRewardBorrow = Object.entries(borrowedFarmRewards)
      .map(([rewardTokenId, reward]) => {
        const rewardAsset = assets.find((a) => a.token_id === rewardTokenId);
        const decimals =
          rewardAsset.metadata.decimals + rewardAsset.config.extra_decimals;
        const price = rewardAsset.price?.usd || 0;

        if (!totalBorrowUsd) return 0;

        return (
          new Big(reward.reward_per_day)
            .div(new Big(10).pow(decimals || 0))
            .mul(365)
            .mul(price)
            .div(totalBorrowUsd)
            .mul(100)
            .toNumber() || 0
        );
      })
      .reduce(sumReducer, 0);

    return {
      token_id: asset.token_id,
      symbol: asset.metadata.symbol,
      tvlUsd: totalSupplyUsd - totalBorrowUsd,
      apyReward,
      apyRewardTvl: apyRewardTvl || 0,
      apyBase,
      rewardTokens,
      totalSupplyUsd,
      totalBorrowUsd,
      apyBaseBorrow,
      apyRewardBorrow,
      rewardTokensBorrow,
      ltv: asset.config.volatility_ratio,
    } as IAssetRewardDetail;
  });

  return rewards;
}
export async function getFarm(farm_id: string) {
  return await burrowViewFunction({
    methodName: 'get_asset_farm',
    args: {
      farm_id,
    },
  });
}
export async function getFarms() {
  return await burrowViewFunction({
    methodName: 'get_asset_farms_all',
  });
}
export function accountFarmClaimAll() {
  const transactions: Transaction[] = [];
  transactions.push({
    receiverId: BURROW_CONTRACT_ID,
    functionCalls: [
      {
        methodName: 'account_farm_claim_all',
        args: {},
      },
    ],
  });
  return executeBurrowMultipleTransactions(transactions);
}
export const burrowViewFunction = ({
  methodName,
  args,
}: {
  methodName: string;
  args?: object;
}) => {
  return wallet.account().viewFunction(BURROW_CONTRACT_ID, methodName, args);
};
export const executeBurrowMultipleTransactions = async (
  transactions: Transaction[],
  callbackUrl?: string
) => {
  return executeMultipleTransactions(transactions, callbackUrl);
};
export async function getGlobalConfig() {
  return await burrowViewFunction({ methodName: 'get_config' });
}
