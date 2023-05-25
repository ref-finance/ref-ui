import {
  IAccount,
  IAsset,
  INetTvlFarm,
  INetTvlFarmReward,
  IProtocolReward,
  IAccountItem,
  IBurrowConfig,
  ISort,
  IAssetRewardDetail,
} from './burrow-interfaces';
import {
  toUsd,
  sumReducer,
  sumRewards,
  shrinkToken,
  expandToken,
  decimalMax,
  decimalMin,
  clone,
} from './burrow-utils';
import { getFarm } from './burrow';
import Big from 'big.js';
import getConfig from './config';
const { WRAP_NEAR_CONTRACT_ID } = getConfig();
const MAX_RATIO = 10_000;
export const hiddenAssets = ['ref.fakes.testnet', 'meta-token.near'];
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
  if (!netTvl || !netTvl.rewards) return [];
  return netTvl.rewards?.map((reward) => {
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
          totalRewards[reward_token_id]?.boosted_shares || 0,
          assetDecimals
        )
      );
      const totalRewardsPerDay = Number(
        shrinkToken(
          totalRewards[reward_token_id]?.reward_per_day || 0,
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
export function computeAdjustMaxAmount(account: IAccount, asset: IAsset) {
  const { metadata, config, token_id } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  const accountSuppliedAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );
  const suppliedBalance = Big(accountSuppliedAsset?.balance || 0);
  const supplied = shrinkToken(suppliedBalance.toFixed(), decimals);
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = Big(accountCollateralAsset?.balance || 0);
  const collateral = shrinkToken(collateralBalance.toFixed(), decimals);
  const availableBalance = Big(supplied).plus(collateral).toFixed();
  return availableBalance;
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
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = new Big(accountCollateralAsset?.balance || 0);
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
  return availableBalance;
}
export function computeSupplyMaxAmount(asset: IAsset, nearBalance: string) {
  const { accountBalance, metadata, token_id } = asset;
  const accountBalanceReadAble = shrinkToken(accountBalance, metadata.decimals);
  const availableNearBalance = decimalMax(
    0,
    Big(nearBalance || 0)
      .plus(accountBalanceReadAble || 0)
      .minus(0.25)
      .toFixed()
  ).toFixed();
  const availableBalance =
    token_id == WRAP_NEAR_CONTRACT_ID
      ? availableNearBalance
      : accountBalanceReadAble;
  return availableBalance;
}

export function computeRepayMaxAmount(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[],
  nearBalance: string
) {
  const { accountBalance, metadata, token_id } = asset;
  const borrowed = account.borrowed.find((a) => a.token_id === token_id);
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const borrowedBalance = shrinkToken(borrowed.balance || 0, decimals);
  const accountBalanceReadAble = shrinkToken(accountBalance, metadata.decimals);
  const availableNearBalance = decimalMax(
    0,
    Big(nearBalance || 0)
      .plus(accountBalanceReadAble || 0)
      .minus(0.25)
      .toFixed()
  ).toFixed();
  const walletBalance =
    token_id == WRAP_NEAR_CONTRACT_ID
      ? availableNearBalance
      : accountBalanceReadAble;
  const withdrawMaxAmount = computeWithdrawMaxAmount(account, asset, assets);
  const availableBalance_deposit = decimalMin(
    withdrawMaxAmount,
    borrowedBalance
  ).toFixed();
  const availableBalance_wallet = decimalMin(
    borrowedBalance,
    walletBalance
  ).toFixed();
  return [availableBalance_wallet, availableBalance_deposit];
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
  return availableBalance;
}
export function getHealthFactor(account: IAccount, assets: IAsset[]) {
  const adjustedCollateralSum = getAdjustedSum('collateral', account, assets);
  const adjustedBorrowedSum = getAdjustedSum('borrowed', account, assets);
  if (Big(adjustedBorrowedSum).eq(0)) return 10000;
  const healthFactor = Big(adjustedCollateralSum)
    .div(Big(adjustedBorrowedSum))
    .mul(100)
    .toNumber();
  return Number(healthFactor) < MAX_RATIO ? healthFactor : MAX_RATIO;
}
export function recomputeAdjustHealthFactor(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[],
  amount: string
) {
  const { token_id } = asset;
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const amountDecimal = expandToken(amount || 0, decimals);
  const newBalance = amountDecimal;
  const clonedAccount = clone(account);

  const updatedToken = {
    token_id,
    balance: newBalance,
    shares: newBalance,
    apr: '0',
  };

  if (!clonedAccount.collateral) {
    clonedAccount.collateral = [updatedToken];
  } else if (!accountCollateralAsset) {
    clonedAccount.collateral.push(updatedToken);
  } else {
    clonedAccount.collateral = [
      ...clonedAccount.collateral.filter(
        (a: IAccountItem) => a.token_id !== token_id
      ),
      updatedToken,
    ];
  }
  const adjustedCollateralSum = getAdjustedSum(
    'collateral',
    clonedAccount,
    assets
  );
  const adjustedBorrowedSum = getAdjustedSum('borrowed', account, assets);
  let newHealthFactor;
  if (Big(adjustedBorrowedSum).eq(0)) {
    newHealthFactor = 10000;
  } else {
    newHealthFactor = Big(adjustedCollateralSum)
      .div(Big(adjustedBorrowedSum))
      .mul(100)
      .toNumber();
  }
  const newHealthFactorAmount =
    Number(newHealthFactor) < MAX_RATIO ? newHealthFactor : MAX_RATIO;
  return newHealthFactorAmount;
}
export function recomputeWithdrawHealthFactor(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[],
  amount: string
) {
  const { token_id } = asset;
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const accountSuppliedAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = Big(accountCollateralAsset?.balance || 0);
  const suppliedBalance = Big(accountSuppliedAsset?.balance || 0);
  const amountDecimal = expandToken(amount || 0, decimals);

  const newBalance = decimalMin(
    collateralBalance.toFixed(),
    collateralBalance.plus(suppliedBalance).minus(amountDecimal).toFixed()
  ).toFixed();
  const clonedAccount = clone(account);

  const updatedToken = {
    token_id: token_id,
    balance: newBalance,
    shares: newBalance,
    apr: '0',
  };

  if (!clonedAccount.collateral) {
    clonedAccount.collateral = [updatedToken];
  } else if (!accountCollateralAsset) {
    clonedAccount.collateral.push(updatedToken);
  } else {
    clonedAccount.collateral = [
      ...clonedAccount.collateral.filter(
        (a: IAccountItem) => a.token_id !== token_id
      ),
      updatedToken,
    ];
  }
  const adjustedCollateralSum = getAdjustedSum(
    'collateral',
    +amount == 0 ? account : clonedAccount,
    assets
  );
  const adjustedBorrowedSum = getAdjustedSum('borrowed', account, assets);
  let newHealthFactor;
  if (Big(adjustedBorrowedSum).eq(0)) {
    newHealthFactor = 10000;
  } else {
    newHealthFactor = Big(adjustedCollateralSum)
      .div(Big(adjustedBorrowedSum))
      .mul(100)
      .toNumber();
  }
  return Number(newHealthFactor) < MAX_RATIO ? newHealthFactor : MAX_RATIO;
}
export function recomputeSupplyHealthFactor(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[],
  amount: string
) {
  if (!account) return 10000;
  const { token_id } = asset;
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const newBalance = Big(expandToken(amount, decimals))
    .plus(accountCollateralAsset?.balance || 0)
    .toFixed();
  const clonedAccount = clone(account);
  const updatedToken = {
    token_id: token_id,
    balance: newBalance,
    shares: newBalance,
    apr: '0',
  };
  if (!clonedAccount.collateral) {
    clonedAccount.collateral = [updatedToken];
  } else if (!accountCollateralAsset) {
    clonedAccount.collateral.push(updatedToken);
  } else {
    clonedAccount.collateral = [
      ...clonedAccount.collateral.filter(
        (a: IAccountItem) => a.token_id !== token_id
      ),
      updatedToken,
    ];
  }
  const adjustedCollateralSum = getAdjustedSum(
    'collateral',
    +amount == 0 ? account : clonedAccount,
    assets
  );
  const adjustedBorrowedSum = getAdjustedSum('borrowed', account, assets);
  let newHealthFactor;
  if (Big(adjustedBorrowedSum).eq(0)) {
    newHealthFactor = 10000;
  } else {
    newHealthFactor = Big(adjustedCollateralSum)
      .div(Big(adjustedBorrowedSum))
      .mul(100)
      .toNumber();
  }
  return Number(newHealthFactor) < MAX_RATIO ? newHealthFactor : MAX_RATIO;
}
export function recomputeRepayHealthFactor(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[],
  amount: string
) {
  const { token_id } = asset;
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const accountBorrowedAsset = account.borrowed.find(
    (a) => a.token_id === token_id
  );
  const borrowedBalance = Big(accountBorrowedAsset?.balance || 0);
  const balance = borrowedBalance.minus(expandToken(amount, decimals));
  const clonedAccount = clone(account);
  const newBalance = balance.lt(0) ? 0 : balance.toFixed();
  const updatedToken = {
    token_id: token_id,
    balance: newBalance,
    shares: newBalance,
    apr: '0',
  };
  if (!clonedAccount.borrowed) {
    clonedAccount.borrowed = [updatedToken];
  } else if (!accountBorrowedAsset) {
    clonedAccount.borrowed.push(updatedToken);
  } else {
    clonedAccount.borrowed = [
      ...clonedAccount.borrowed.filter(
        (a: IAccountItem) => a.token_id !== token_id
      ),
      updatedToken,
    ];
  }
  const adjustedCollateralSum = getAdjustedSum('collateral', account, assets);
  const adjustedBorrowedSum = getAdjustedSum(
    'borrowed',
    +amount == 0 ? account : clonedAccount,
    assets
  );
  if (Big(adjustedBorrowedSum).eq(0)) {
    return MAX_RATIO;
  } else {
    const newHealthFactor = Big(adjustedCollateralSum)
      .div(Big(adjustedBorrowedSum))
      .mul(100)
      .toNumber();
    return Number(newHealthFactor) < MAX_RATIO ? newHealthFactor : MAX_RATIO;
  }
}
export function recomputeRepayHealthFactorFromDeposits(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[],
  amount: string
) {
  const { token_id, config } = asset;
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const amountDecimal = expandToken(amount, decimals);
  const accountBorrowedAsset = account.borrowed.find(
    (a) => a.token_id === token_id
  );
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const accountSupplyAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );

  const collateralBalance = Big(accountCollateralAsset?.balance || '0');
  const suppliedBalance = Big(accountSupplyAsset?.balance || '0');
  const newCollateralBalance = decimalMin(
    collateralBalance.toFixed(),
    collateralBalance.plus(suppliedBalance).minus(amountDecimal).toFixed()
  ).toFixed();

  const borrowedBalance = Big(accountBorrowedAsset?.balance || 0);
  const balance = borrowedBalance.minus(amountDecimal);
  const clonedAccount = clone(account);
  const newBorrowedBalance = balance.lt(0) ? 0 : balance.toFixed();
  const updatedTokenBorrow = {
    token_id: token_id,
    balance: newBorrowedBalance,
    shares: newBorrowedBalance,
    apr: '0',
  };
  clonedAccount.borrowed = [
    ...clonedAccount.borrowed.filter(
      (a: IAccountItem) => a.token_id !== token_id
    ),
    updatedTokenBorrow,
  ];
  if (config.can_use_as_collateral) {
    const updatedToken = {
      token_id: token_id,
      balance: newCollateralBalance,
      shares: newCollateralBalance,
      apr: '0',
    };
    if (!clonedAccount.collateral) {
      clonedAccount.collateral = [updatedToken];
    } else if (!accountCollateralAsset) {
      clonedAccount.collateral.push(updatedToken);
    } else {
      clonedAccount.collateral = [
        ...clonedAccount.collateral.filter(
          (a: IAccountItem) => a.token_id !== token_id
        ),
        updatedToken,
      ];
    }
  }
  const adjustedCollateralSum = getAdjustedSum(
    'collateral',
    +amount == 0 ? account : clonedAccount,
    assets
  );
  const adjustedBorrowedSum = getAdjustedSum(
    'borrowed',
    +amount == 0 ? account : clonedAccount,
    assets
  );
  if (Big(adjustedBorrowedSum).eq(0)) {
    return MAX_RATIO;
  } else {
    const newHealthFactor = Big(adjustedCollateralSum)
      .div(Big(adjustedBorrowedSum))
      .mul(100)
      .toNumber();
    return Number(newHealthFactor) < MAX_RATIO ? newHealthFactor : MAX_RATIO;
  }
}
export function recomputeBurrowHealthFactor(
  account: IAccount,
  asset: IAsset,
  assets: IAsset[],
  amount: string
) {
  if (!account) return 10000;
  const { token_id } = asset;
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const accountBorrowedAsset = account.borrowed.find(
    (a) => a.token_id === token_id
  );

  const newBalance = Big(expandToken(amount, decimals))
    .plus(accountBorrowedAsset?.balance || 0)
    .toFixed();

  const clonedAccount = clone(account);

  const updatedToken = {
    token_id: token_id,
    balance: newBalance,
    shares: newBalance,
    apr: '0',
  };

  if (!clonedAccount.borrowed) {
    clonedAccount.borrowed = [updatedToken];
  } else if (!accountBorrowedAsset) {
    clonedAccount.borrowed.push(updatedToken);
  } else {
    clonedAccount.borrowed = [
      ...clonedAccount.borrowed.filter(
        (a: IAccountItem) => a.token_id !== token_id
      ),
      updatedToken,
    ];
  }
  const adjustedCollateralSum = getAdjustedSum('collateral', account, assets);
  const adjustedBorrowedSum = getAdjustedSum(
    'borrowed',
    +amount == 0 ? account : clonedAccount,
    assets
  );
  if (Big(adjustedBorrowedSum).eq(0)) {
    return MAX_RATIO;
  } else {
    const newHealthFactor = Big(adjustedCollateralSum)
      .div(Big(adjustedBorrowedSum))
      .mul(100)
      .toNumber();
    return Number(newHealthFactor) < MAX_RATIO ? newHealthFactor : MAX_RATIO;
  }
}
export function get_as_collateral_adjust(
  account: IAccount,
  asset: IAsset,
  amount: string
) {
  const { metadata, config, token_id } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = Big(accountCollateralAsset?.balance || 0);
  const collateral = shrinkToken(collateralBalance.toFixed(), decimals);
  return amount || collateral || '0';
}
export function get_remain_collateral_withdraw(
  account: IAccount,
  asset: IAsset,
  amount: string
) {
  const { metadata, config, token_id } = asset;
  const decimals = metadata.decimals + config.extra_decimals;
  const accountCollateralAsset = account.collateral.find(
    (a) => a.token_id === token_id
  );
  const collateralBalance = new Big(accountCollateralAsset?.balance || 0);
  const collateral = Number(shrinkToken(collateralBalance.toFixed(), decimals));
  const accountSuppliedAsset = account.supplied.find(
    (a) => a.token_id === token_id
  );
  const suppliedBalance = new Big(accountSuppliedAsset?.balance || 0);
  const supplied = Number(shrinkToken(suppliedBalance.toFixed(), decimals));
  const remain = Math.abs(
    Math.min(collateral, collateral + supplied - (+amount || 0))
  );
  return remain.toString();
}
export function get_remain_borrow_repay(
  account: IAccount,
  asset: IAsset,
  amount: string
) {
  const { token_id } = asset;
  const decimals = asset.metadata.decimals + asset.config.extra_decimals;
  const borrowed = account.borrowed.find((a) => a.token_id === token_id);
  const borrowedBalance = shrinkToken(borrowed.balance || 0, decimals);
  return decimalMax(
    Big(borrowedBalance || 0)
      .sub(amount || 0)
      .toFixed(),
    '0'
  ).toFixed();
}

export function sortSupplyMarketData(
  list: IAsset[],
  rewards: IAssetRewardDetail[],
  sort: ISort
) {
  if (sort.field == 'total') {
    sortByTotal(list, sort);
  } else if (sort.field == 'apy') {
    sortByApy(list, rewards, sort);
  } else if (sort.field == 'cf') {
    sortByCf(list, sort);
  }
}
export function sortBorrowedMarketData(
  list: IAsset[],
  sort: ISort,
  account: IAccount,
  assets: IAsset[],
  globalConfig: IBurrowConfig,
  rewards: IAssetRewardDetail[]
) {
  if (sort.field == 'total') {
    borrowSortByTotal(list, sort);
  } else if (sort.field == 'apy') {
    borrowSortByApy(list, sort, account, assets, globalConfig, rewards);
  } else if (sort.field == 'cf') {
    sortByCf(list, sort);
  }
}
function sortByTotal(list: IAsset[], sort: ISort) {
  list.sort((b: IAsset, a: IAsset) => {
    const b_totalLiquidity = Big(b.supplied.balance || 0)
      .plus(b.reserved)
      .toFixed();
    const b_decimals = b.metadata.decimals + b.config.extra_decimals;
    const b_totalLiquidity_shrink = shrinkToken(b_totalLiquidity, b_decimals);
    const b_totalLiquidity_usd = Big(b_totalLiquidity_shrink || 0)
      .mul(b.price.usd || 0)
      .toNumber();

    const a_totalLiquidity = Big(a.supplied.balance || 0)
      .plus(a.reserved)
      .toFixed();
    const a_decimals = a.metadata.decimals + a.config.extra_decimals;
    const a_totalLiquidity_shrink = shrinkToken(a_totalLiquidity, a_decimals);
    const a_totalLiquidity_usd = Big(a_totalLiquidity_shrink || 0)
      .mul(a.price.usd || 0)
      .toNumber();
    return a_totalLiquidity_usd - b_totalLiquidity_usd;
  });
  if (sort.order == 'asc') {
    list.reverse();
  }
}

function sortByCf(list: IAsset[], sort: ISort) {
  list.sort((b: IAsset, a: IAsset) => {
    const b_cf = b.config.volatility_ratio;
    const a_cf = a.config.volatility_ratio;
    return a_cf - b_cf;
  });
  if (sort.order == 'asc') {
    list.reverse();
  }
}

function sortByApy(list: IAsset[], rewards: IAssetRewardDetail[], sort: ISort) {
  list.sort((b: IAsset, a: IAsset) => {
    const b_r = rewards.find((a: any) => a.token_id === b.token_id);
    const b_netTvlMultiplier = b.config.net_tvl_multiplier / 10000;
    const b_depositApy =
      b_r.apyBase + b_r.apyRewardTvl * b_netTvlMultiplier + b_r.apyReward;

    const a_r = rewards.find((m: any) => m.token_id === a.token_id);
    const a_netTvlMultiplier = a.config.net_tvl_multiplier / 10000;
    const a_depositApy =
      a_r.apyBase + a_r.apyRewardTvl * a_netTvlMultiplier + a_r.apyReward;
    return a_depositApy - b_depositApy;
  });
  if (sort.order == 'asc') {
    list.reverse();
  }
}

function borrowSortByTotal(list: IAsset[], sort: ISort) {
  list.sort((b: IAsset, a: IAsset) => {
    const b_liquidity = Big(b.availableLiquidity || 0).mul(b?.price?.usd || 0);
    const a_liquidity = Big(a.availableLiquidity || 0).mul(a?.price?.usd || 0);
    return a_liquidity.minus(b_liquidity).toNumber();
  });
  if (sort.order == 'asc') {
    list.reverse();
  }
}

function borrowSortByApy(
  list: IAsset[],
  sort: ISort,
  account: IAccount,
  assets: IAsset[],
  globalConfig: IBurrowConfig,
  rewards: IAssetRewardDetail[]
) {
  list.sort((b: IAsset, a: IAsset) => {
    const r_b = rewards.find((a) => a.token_id === b.token_id);
    const borrowApy_b = r_b.apyBaseBorrow;
    const extraApy_b = getExtraApy(b, account, assets, globalConfig);
    const apy_b = borrowApy_b - extraApy_b;

    const r_a = rewards.find((m) => a.token_id === m.token_id);
    const borrowApy_a = r_a.apyBaseBorrow;
    const extraApy_a = getExtraApy(a, account, assets, globalConfig);
    const apy_a = borrowApy_a - extraApy_a;
    return apy_a - apy_b;
  });
  if (sort.order == 'asc') {
    list.reverse();
  }
}
