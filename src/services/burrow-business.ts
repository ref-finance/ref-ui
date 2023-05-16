import {
  IAccount,
  IAsset,
  INetTvlFarm,
  INetTvlFarmReward,
  IProtocolReward,
  IAccountItem,
  IBurrowConfig,
} from './burrow-interfaces';
import {
  toUsd,
  sumReducer,
  sumRewards,
  shrinkToken,
  expandToken,
  decimalMax,
  decimalMin,
} from './burrow-utils';
import { getFarm } from './burrow';
import Big from 'big.js';
import getConfig from './config';
const { WRAP_NEAR_CONTRACT_ID } = getConfig();
const MAX_RATIO = 10_000;
export async function getProtocolRewards(assets: IAsset[]) {
  const netTvl = (await getFarm('NetTvl')) as INetTvlFarm;
  const rewards = Object.entries(netTvl.rewards).map(
    ([tokenId, farm]: [string, INetTvlFarmReward]) => {
      const asset = assets.find((asset: IAsset) => asset.token_id == tokenId);
      const { name, symbol, icon } = asset.metadata;
      const assetDecimals =
        asset.metadata.decimals + asset.config.extra_decimals;
      const dailyAmount = Number(
        shrinkToken(farm.reward_per_day, assetDecimals)
      );
      const remainingAmount = Number(
        shrinkToken(farm.remaining_rewards, assetDecimals)
      );
      return {
        icon,
        name,
        symbol,
        tokenId,
        dailyAmount,
        remainingAmount,
        price: asset.price?.usd || 0,
      } as IProtocolReward;
    }
  );
  const amount = rewards.reduce(sumRewards, 0);
  return amount;
}
export function getGains(account: IAccount, assets: IAsset[], source: string) {
  return account[source]
    .map((accountAsset: IAccountItem) => {
      const { token_id, balance, apr } = accountAsset;
      const asset = assets.find((asset) => asset.token_id == token_id);
      const balanceUSD = toUsd(balance, asset);
      return [balanceUSD, apr];
    })
    .reduce(
      ([gain, sum]: [number, number], [balance, apr]: [number, string]) => [
        gain + balance * Number(apr),
        sum + balance,
      ],
      [0, 0]
    );
}
export function getNetLiquidityAPY(
  netLiquidityFarm: INetTvlFarm,
  account: IAccount,
  assets: IAsset[]
) {
  const totalDailyNetLiquidityRewards = Object.entries(netLiquidityFarm.rewards)
    .map(([rewardTokenId, farm]) => {
      const rewardAsset = assets.find((a) => a.token_id === rewardTokenId);
      const assetDecimals =
        rewardAsset.metadata.decimals + rewardAsset.config.extra_decimals;
      const dailyAmount = Number(
        shrinkToken(farm.reward_per_day, assetDecimals)
      );
      return (
        dailyAmount *
        rewardAsset.price.usd *
        (rewardAsset.config.net_tvl_multiplier / 10000)
      ); // todo
    })
    .reduce(sumReducer, 0);
  const supplied = getTotalBalance(assets, 'supplied', true);
  const borrowed = getTotalBalance(assets, 'borrowed', true);
  const totalProtocolLiquidity = supplied - borrowed;
  const netLiquidtyAPY =
    ((totalDailyNetLiquidityRewards * 365) / totalProtocolLiquidity) * 100;
  const rewardTokens = Object.entries(netLiquidityFarm.rewards).map(
    ([rewardTokenId]) => rewardTokenId
  );
  let accountNetLiquidtyAPY;
  if (account) {
    const [gainCollateral, totalCollateral] = getGains(
      account,
      assets,
      'collateral'
    );
    const [gainSupplied, totalSupplied] = getGains(account, assets, 'supplied');
    const accountTvlRewards = getNetTvlRewards(
      assets,
      account,
      netLiquidityFarm
    );
    const netTvlRewards = accountTvlRewards.reduce(
      (acc, r) => acc + r.dailyAmount * r.price,
      0
    );
    const netLiquidity = totalCollateral + totalSupplied;
    accountNetLiquidtyAPY = ((netTvlRewards * 365) / netLiquidity) * 100;
  }
  return [accountNetLiquidtyAPY || netLiquidtyAPY, rewardTokens];
}
export function getNetTvlRewards(
  assets: IAsset[],
  account: IAccount,
  netLiquidityFarm: INetTvlFarm
) {
  const hasNetTvlFarm = !!Object.entries(netLiquidityFarm.rewards).length;
  if (!hasNetTvlFarm) return [];
  const netTvl = account.farms.find((farm) => farm.farm_id == 'NetTvl');
  if (!netTvl.rewards) return [];
  return netTvl.rewards.map((reward) => {
    const { asset_farm_reward, boosted_shares, reward_token_id } = reward;
    const asset = assets.find((asset) => asset.token_id == reward_token_id);
    const assetDecimals = asset.metadata.decimals + asset.config.extra_decimals;
    const boostedShares = Number(shrinkToken(boosted_shares, assetDecimals));
    const totalBoostedShares = Number(
      shrinkToken(asset_farm_reward['boosted_shares'], assetDecimals)
    );
    const totalRewardsPerDay = Number(
      shrinkToken(asset_farm_reward['reward_per_day'], assetDecimals)
    );
    const dailyAmount =
      (boostedShares / totalBoostedShares) * totalRewardsPerDay;
    return { dailyAmount, token_id: reward_token_id, price: asset.price.usd };
  });
}
export const getTotalBalance = (
  assets: IAsset[],
  source: string,
  withNetTvlMultiplier?: boolean
) =>
  assets
    .map((asset) => {
      const netTvlMultiplier = withNetTvlMultiplier
        ? asset.config.net_tvl_multiplier / 10000
        : 1;
      return (
        toUsd(asset[source].balance, asset) * netTvlMultiplier +
        (source === 'supplied'
          ? toUsd(asset.reserved, asset) * netTvlMultiplier
          : 0)
      );
    })
    .reduce(sumReducer, 0);
export function getPortfolioRewards(
  source: 'Supplied' | 'Borrowed',
  token_id: string,
  account: IAccount,
  assets: IAsset[]
) {
  const targetFarm = account.farms.find((farm) => {
    return farm['farm_id'][source] == token_id;
  });
  if (targetFarm) {
    const asset = assets.find((a) => a.token_id == token_id);
    const rewards = targetFarm['rewards'] || [];
    const totalRewards =
      source == 'Supplied' ? asset.farms[0].rewards : asset.farms[1].rewards;
    const result = rewards.map((reward) => {
      const { reward_token_id } = reward;
      const assetDecimals =
        asset.metadata.decimals + asset.config.extra_decimals;
      const rewardAsset = assets.find((a) => a.token_id == reward_token_id);
      const rewardTokenDecimals =
        rewardAsset.metadata.decimals + rewardAsset.config.extra_decimals;

      const boostedShares = Number(
        shrinkToken(reward.boosted_shares || 0, assetDecimals)
      );
      const totalBoostedShares = Number(
        shrinkToken(
          totalRewards[reward_token_id].boosted_shares || 0,
          assetDecimals
        )
      );
      const totalRewardsPerDay = Number(
        shrinkToken(
          totalRewards[reward_token_id].reward_per_day || 0,
          rewardTokenDecimals
        )
      );
      const rewardPerDay =
        (boostedShares / totalBoostedShares) * totalRewardsPerDay || 0;
      return { rewardAsset, rewardPerDay };
    });
    return result;
  }
  return [];
}
export function getExtraApy(
  asset: IAsset,
  account: IAccount,
  assets: IAsset[],
  globalConfig: IBurrowConfig
) {
  const asset_token_id = asset.token_id;
  const borrowFarm = asset.farms.find(
    (farm) =>
      farm['farm_id']['Borrowed'] && Object.keys(farm.rewards || {}).length
  );
  if (!borrowFarm) return 0;
  const assetDecimals = asset.metadata.decimals + asset.config.extra_decimals;
  const totalBorrowUSD = toUsd(asset.borrowed.balance, asset);
  const rewards = borrowFarm.rewards;
  let userFarm;
  if (account) {
    userFarm = account.farms.find((farm) => {
      return (
        farm['farm_id']['Borrowed'] == asset.token_id && farm.rewards.length
      );
    });
  }
  if (!userFarm) {
    return Object.keys(rewards)
      .map((reward_token_id) => {
        const farmData = rewards[reward_token_id];
        const { reward_per_day, boosted_shares } = farmData;
        const assetReward = assets.find(
          (asset) => asset.token_id == reward_token_id
        );
        const totalRewardsUsd = toUsd(
          Big(reward_per_day).mul(365).toFixed(),
          assetReward
        );
        if (Big(totalBorrowUSD).eq(0)) return 0;
        const apy = Big(totalRewardsUsd)
          .div(totalBorrowUSD)
          .mul(100)
          .toNumber();
        return apy;
      })
      .reduce((acc, cur) => acc + cur, 0);
  } else {
    return userFarm.rewards
      .map((farmData) => {
        const { reward_token_id, boosted_shares, asset_farm_reward } = farmData;
        const assetReward = assets.find(
          (asset) => asset.token_id == reward_token_id
        );
        const borrowedShares = Number(
          shrinkToken(boosted_shares || 0, assetDecimals)
        );
        const totalBoostedShares = Number(
          shrinkToken(asset_farm_reward.boosted_shares, assetDecimals)
        );
        debugger;
        const boosterLogBase = Number(
          shrinkToken(
            asset_farm_reward.booster_log_base,
            globalConfig.booster_decimals
          )
        );
        const xBRRRAmount = Number(
          shrinkToken(
            account.booster_staking?.['x_booster_amount'] || 0,
            globalConfig.booster_decimals
          )
        );
        const log = Math.log(xBRRRAmount) / Math.log(boosterLogBase);
        const multiplier = log >= 0 ? 1 + log : 1;
        const userBorrowedBalance =
          account.borrowed.find((asset) => asset.token_id == asset_token_id)
            .balance || '0';
        const totalUserAssetUSD = toUsd(userBorrowedBalance, asset);
        const totalRewardsUsd = toUsd(
          Big(asset_farm_reward.reward_per_day).mul(365).toFixed(),
          assetReward
        );
        return Big(totalRewardsUsd)
          .mul(borrowedShares / totalBoostedShares)
          .mul(multiplier)
          .div(totalUserAssetUSD)
          .mul(100)
          .toFixed();
      })
      .reduce((acc, cur) => acc + Number(cur), 0);
  }
}
export function getAdjustedSum(
  type: 'collateral' | 'borrowed',
  account: IAccount,
  assets: IAsset[]
) {
  if (!assets || !account || account[type].length == 0) return 0;
  return account[type]
    .map((assetInAccount) => {
      const asset = assets.find((a) => a.token_id === assetInAccount.token_id);

      const price = asset.price
        ? Big(asset.price.multiplier).div(Big(10).pow(asset.price.decimals))
        : Big(0);

      const pricedBalance = Big(assetInAccount.balance)
        .div(expandToken(1, asset.config.extra_decimals))
        .mul(price);

      return type === 'borrowed'
        ? pricedBalance
            .div(asset.config.volatility_ratio)
            .mul(MAX_RATIO)
            .toFixed()
        : pricedBalance
            .mul(asset.config.volatility_ratio)
            .div(MAX_RATIO)
            .toFixed();
    })
    .reduce((sum, cur) => Big(sum).plus(Big(cur)).toFixed());
}
export function computeAdjustMaxBalance(account: IAccount, asset: IAsset) {
  const { metadata, config, token_id } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  // const assetPrice = asset.price.usd || 0;
  const accountSuppliedAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );
  const suppliedBalance = Big(accountSuppliedAsset?.balance || 0);
  const supplied = Number(shrinkToken(suppliedBalance.toFixed(), decimals));

  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = Big(accountCollateralAsset?.balance || 0);
  const collateral = shrinkToken(collateralBalance.toFixed(), decimals);
  const availableBalance = Big(supplied).plus(collateral).toFixed();
  // const availableBalance$ = Big(assetPrice).mul(availableBalance).toFixed();
  return [availableBalance, collateral];
}
export function computeWithdrawMaxAmount(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[]
) {
  const { metadata, config, token_id } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  const assetPrice = asset.price
    ? Big(asset.price.multiplier).div(Big(10).pow(asset.price.decimals))
    : Big(0);
  const accountSuppliedAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );
  const suppliedBalance = new Big(accountSuppliedAsset?.balance || 0);
  // const supplied = Number(shrinkToken(suppliedBalance.toFixed(), decimals));

  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = new Big(accountCollateralAsset?.balance || 0);
  // const collateral = Number(shrinkToken(collateralBalance.toFixed(), decimals));
  let maxAmount = suppliedBalance;
  if (collateralBalance.gt(0)) {
    const adjustedCollateralSum = getAdjustedSum('collateral', account, assets);
    const adjustedBorrowedSum = getAdjustedSum('borrowed', account, assets);
    const adjustedPricedDiff = decimalMax(
      0,
      Big(adjustedCollateralSum).sub(adjustedBorrowedSum).toFixed()
    );
    const safeAdjustedPricedDiff = adjustedPricedDiff.mul(999).div(1000);

    const safePricedDiff = safeAdjustedPricedDiff
      .div(asset.config.volatility_ratio)
      .mul(10000);
    const safeDiff = safePricedDiff
      .div(assetPrice)
      .mul(expandToken(1, asset.config.extra_decimals))
      .toFixed(0);
    maxAmount = maxAmount.add(
      decimalMin(safeDiff, collateralBalance.toFixed())
    );
  }
  const availableBalance = shrinkToken(maxAmount.toFixed(), decimals);
  // const remain = Math.abs(
  //   Math.min(collateral, collateral + supplied - (amount || 0))
  // );
  // const remainBalance = Big(remain).toFixed(4);
  // const price = asset.price.usd || 0;
  // const maxAmount$ = maxAmount.mul(price).toFixed(2);
  // const remainBalance$ = Big(remain).mul(price).toFixed(2);
  return [availableBalance];
}
export function computeSupplyMaxAmount(asset: IAsset, nearBalance: string) {
  const { accountBalance, metadata, token_id } = asset;
  const accountBalanceReadAble = shrinkToken(accountBalance, metadata.decimals);
  const availableNearBalance = decimalMax(
    0,
    Big(nearBalance || 0)
      .plus(accountBalanceReadAble)
      .minus(0.25)
      .toFixed()
  ).toFixed();
  const availableBalance =
    token_id == WRAP_NEAR_CONTRACT_ID
      ? availableNearBalance
      : accountBalanceReadAble;
  return [availableBalance];
}

export function computeRepayMaxAmount(
  account: IAccount,
  asset: IAsset,
  nearBalance: string
) {
  const { accountBalance, metadata, token_id } = asset;
  const borrowed = account.borrowed.find((a) => a.token_id === token_id);
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const borrowedBalance = shrinkToken(borrowed.balance || 0, decimals);
  const accountBalanceReadAble = shrinkToken(accountBalance, metadata.decimals);
  const walletBalance =
    token_id == WRAP_NEAR_CONTRACT_ID ? nearBalance : accountBalanceReadAble;
  const availableBalance = decimalMin(borrowedBalance, walletBalance).toFixed();
  return [availableBalance];
}

export function computeBurrowMaxAmount(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[]
) {
  const adjustedCollateralSum = getAdjustedSum('collateral', account, assets);
  const adjustedBorrowedSum = getAdjustedSum('borrowed', account, assets);
  const volatiliyRatio = asset.config.volatility_ratio || 0;
  const price = asset.price?.usd || Infinity;
  const availableBalance = Big(adjustedCollateralSum)
    .sub(Big(adjustedBorrowedSum))
    .mul(volatiliyRatio)
    .div(MAX_RATIO)
    .div(price)
    .mul(95)
    .div(100)
    .toFixed();
  return [availableBalance];
}
