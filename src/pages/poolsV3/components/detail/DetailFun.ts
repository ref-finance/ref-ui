import { UserLiquidityInfo } from '~services/commonV3';
import { PoolInfo } from '~services/swapV3';
import { toReadableNumber } from '../../../../utils/numbers';

export function get_unClaimed_fee_data(
  liquidities: UserLiquidityInfo[],
  poolDetail: PoolInfo,
  tokenPriceList: any
) {
  // UnClaimed fee
  let total_amount_x_fee = 0;
  let total_amount_y_fee = 0;
  let total_tvl_fee = 0;
  const { token_x_metadata, token_y_metadata } = poolDetail;
  liquidities.forEach((liquidity: UserLiquidityInfo) => {
    const { unclaimed_fee_x, unclaimed_fee_y } = liquidity;
    const unclaimed_fee_x_amount = toReadableNumber(
      token_x_metadata.decimals,
      unclaimed_fee_x
    );
    const unclaimed_fee_y_amount = toReadableNumber(
      token_y_metadata.decimals,
      unclaimed_fee_y
    );
    const token_x_price = tokenPriceList[token_x_metadata.id]?.price || 0;
    const token_y_price = tokenPriceList[token_y_metadata.id]?.price || 0;
    const total_fees_price =
      Number(unclaimed_fee_x_amount) * Number(token_x_price) +
      Number(unclaimed_fee_y_amount) * Number(token_y_price);
    total_amount_x_fee += Number(unclaimed_fee_x_amount);
    total_amount_y_fee += Number(unclaimed_fee_y_amount);
    total_tvl_fee += Number(total_fees_price);
  });
  return [total_tvl_fee, total_amount_x_fee, total_amount_y_fee];
}
