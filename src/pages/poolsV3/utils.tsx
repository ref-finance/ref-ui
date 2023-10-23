import {
  UserLiquidityInfo,
 
  get_intersection_radio,
  get_intersection_icon_by_radio,
  get_matched_seeds_for_dcl_pool,
  mint_liquidity,
  get_pool_name,
} from '../../services/commonV3';
import BigNumber from 'bignumber.js';
import { FarmBoost, Seed } from '../../services/farm';

export function get_detail_the_liquidity_refer_to_seed({
  liquidity,
  all_seeds,
  is_in_farming,
  related_farms,
  tokenPriceList,
}: {
  liquidity: UserLiquidityInfo;
  all_seeds: Seed[];
  is_in_farming: boolean;
  related_farms: FarmBoost[];
  tokenPriceList: Record<string, any>;
}) {
  const { mft_id, left_point, right_point, amount } = liquidity;
  let Icon;
  let your_apr;
  let link;
  let inRange;
  let status;
  const active_seeds = get_matched_seeds_for_dcl_pool({
    seeds: all_seeds,
    pool_id: liquidity.pool_id,
  });
  const canFarmSeed = active_seeds.find((seed: Seed) => {
    const { min_deposit, seed_id } = seed;
    const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] = seed_id
      .split('@')[1]
      .split('&');
    const v_liquidity = mint_liquidity(liquidity, seed_id);
    const radio = get_intersection_radio({
      left_point_liquidity: left_point,
      right_point_liquidity: right_point,
      left_point_seed,
      right_point_seed,
    });
    const condition1 = new BigNumber(v_liquidity).isGreaterThanOrEqualTo(
      min_deposit
    );
    const condition2 = +radio > 0;
    const condition3 =
      mft_id ||
      (!mft_id && new BigNumber(amount).isGreaterThanOrEqualTo(1000000));
    if (condition1 && condition2 && condition3) return true;
  });
  const targetSeed = canFarmSeed || active_seeds[0];
  if (targetSeed) {
    const { seed_id } = targetSeed;
    const [fixRange, dcl_pool_id, left_point_seed, right_point_seed] = seed_id
      .split('@')[1]
      .split('&');
    const radio = get_intersection_radio({
      left_point_liquidity: left_point,
      right_point_liquidity: right_point,
      left_point_seed,
      right_point_seed,
    });
    if (canFarmSeed) {
      your_apr = get_your_apr(liquidity, targetSeed, tokenPriceList);
    }
    Icon = get_intersection_icon_by_radio(radio);
    inRange = +radio > 0;
    const link_params = `${get_pool_name(
      dcl_pool_id
    )}[${left_point_seed}-${right_point_seed}]`;
    link = `/v2farms/${link_params}-r`;
    status = 'run';
  }
  if (is_in_farming) {
    const actives = related_farms.filter((farm: FarmBoost) => {
      return farm.status != 'Ended';
    });
    if (related_farms.length > 0) {
      if (actives.length > 0) {
        status = 'run';
      } else {
        status = 'end';
      }
    }
  }
  return {
    Icon,
    your_apr,
    link,
    inRange,
    status,
  };
}
