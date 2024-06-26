import { TokenMetadata } from 'src/services/ft-contract';
interface IPool {
  shares: string;
  balance: string;
}
export interface IAssetConfig {
  reserve_ratio: number;
  target_utilization: number;
  target_utilization_rate: string;
  max_utilization_rate: string;
  volatility_ratio: number;
  extra_decimals: number;
  can_deposit: boolean;
  can_withdraw: boolean;
  can_use_as_collateral: boolean;
  can_borrow: boolean;
  net_tvl_multiplier: number;
}

export interface IAssetDetailed {
  token_id: string;
  /// Total supplied including collateral, but excluding reserved.
  supplied: IPool;
  /// Total borrowed.
  borrowed: IPool;
  /// The amount reserved for the stability. This amount can also be borrowed and affects
  /// borrowing rate.
  reserved: string;
  /// When the asset was last updated. It's always going to be the current block timestamp.
  last_update_timestamp: string;
  /// The asset config.
  config: IAssetConfig;
  /// Current supply APR
  supply_apr: string;
  /// Current borrow APR
  borrow_apr: string;
  /// Asset farms
  farms: IAssetFarmView[];
  // price mixin
  price?: IPrice;
}

export interface IAssetFarmReward {
  /// The reward token ID.
  token_id: string;
  /// The amount of reward distributed per day.
  reward_per_day: string;
  /// The log base for the booster. Used to compute boosted shares per account.
  /// Including decimals of the booster.
  booster_log_base: string;
  /// The amount of rewards remaining to distribute.
  remaining_rewards: string;
  /// The total number of boosted shares.
  boosted_shares: string;
}
export interface IAccountFarm {
  asset_farm_reward: Omit<IAssetFarmReward, 'token_id'>;
  boosted_shares: string;
  unclaimed_amount: string;
  reward_token_id: string;
}

export interface IPrice {
  decimals: number;
  multiplier: string;
  usd: number;
}

interface IAssetFarmView {
  farm_id: string;
  rewards: IAssetFarmReward[];
}
export interface IMetadata {
  token_id: string;
  icon: string;
  name: string;
  symbol: string;
  decimals: number;
}

export type IAccountItem = IPool & {
  apr: string;
  token_id: string;
};
interface IFarm {
  farm_id: {
    Supplied?: string;
    Borrowed?: string;
  };
  rewards: INetTvlFarmRewards;
}

export interface INetTvlFarmReward {
  boosted_shares: string;
  booster_log_base: string;
  remaining_rewards: string;
  reward_per_day: string;
}
export interface INetTvlFarmRewards {
  [asset_id: string]: INetTvlFarmReward;
}
export interface INetTvlFarm {
  block_timestamp: string;
  rewards: INetTvlFarmRewards;
}
interface IFarm_id {
  [farmType: string]: string;
}
interface IAccountFarmView {
  farm_id: IFarm_id | string;
  rewards: IAccountFarm[];
}

export interface IProtocolReward {
  icon: string;
  name: string;
  symbol: string;
  tokenId: string;
  dailyAmount: number;
  remainingAmount: number;
  price: number;
}
export interface IAsset {
  accountBalance: string;
  availableLiquidity: number;
  borrow_apr: string;
  borrowed: IPool;
  config: IAssetConfig;
  farms: IFarm[];
  last_update_timestamp: string;
  metadata: TokenMetadata;
  price: IPrice;
  reserved: string;
  supplied: IPool;
  supply_apr: string;
  token_id: string;
}
export interface IAccount {
  account_id: string;
  booster_staking: any;
  borrowed: IAccountItem[];
  collateral: IAccountItem[];
  supplied: IAccountItem[];
  farms: IAccountFarmView[];
  has_non_farmed_assets: boolean;
}

export interface IAccountAllPositionsDetailed {
  account_id: string;
  supplied: IAsset[];
  farms: IFarm[];
  booster_staking: IBoosterStaking;
  has_non_farmed_assets: boolean;
  is_locked: boolean;
  positions: IPositionsOrigin;
}

export interface IPositionsOrigin {
  [shadow_id: string]: {
    collateral: IPortfolioAssetOrigin[];
    borrowed: IPortfolioAssetOrigin[];
  };
}
export interface IPortfolioAssetOrigin {
  token_id: string;
  apr: string;
  balance: string;
  shares: string;
}
export interface IBoosterStaking {
  staked_booster_amount: string;
  unlock_timestamp: string;
  x_booster_amount: string;
}

export interface IAssetRewardDetail {
  token_id: string;
  symbol: string;
  tvlUsd: number;
  apyReward: number;
  apyRewardTvl: number;
  apyBase: number;
  rewardTokens: string[];
  totalSupplyUsd: number;
  totalBorrowUsd: number;
  apyBaseBorrow: number;
  apyRewardBorrow: number;
  rewardTokensBorrow: string[];
  ltv: number;
}

export interface IUnclaimedReward {
  id: string;
  unclaimed: string;
  symbol: string;
  icon: string;
  usd: number;
}

export interface IBurrowConfig {
  oracle_account_id: string;
  owner_id: string;
  booster_token_id: string;
  booster_decimals: number;
  max_num_assets: number;
  maximum_recency_duration_sec: number;
  maximum_staleness_duration_sec: number;
  minimum_staking_duration_sec: number;
  maximum_staking_duration_sec: number;
  x_booster_multiplier_at_maximum_staking_duration: number;
  force_closing_enabled: boolean;
}

export interface IModalProps {
  action: 'adjust' | 'withdraw' | 'borrow' | 'repay' | 'supply';
  asset: IAsset;
}

export type IRepayWay = 'wallet' | 'deposit';

export type ISort = {
  field: 'apy' | 'cf' | 'total';
  order: 'asc' | 'desc';
};
