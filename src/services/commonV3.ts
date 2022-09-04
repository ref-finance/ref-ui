import BigNumber from 'bignumber.js';
/**
 * caculate price by point
 * @param pointDelta
 * @param point
 * @param decimalRate tokenX/tokenY
 * @returns
 */
export function getPriceByPoint(point: number, decimalRate: number) {
  const price = Math.pow(CONSTANT_D, point) * decimalRate;
  const price_handled = new BigNumber(price).toFixed();
  return price_handled;
}
/**
 * caculate point by price
 * @param pointDelta
 * @param price
 * @param decimalRate tokenY/tokenX
 * @returns
 */
export function getPointByPrice(
  pointDelta: number,
  price: string,
  decimalRate: number
) {
  const point = Math.log(+price * decimalRate) / Math.log(CONSTANT_D);
  const point_int = Math.round(point);
  const point_int_slot = Math.floor(point_int / pointDelta) * pointDelta;
  if (point_int_slot < POINTLEFTRANGE) {
    return POINTLEFTRANGE;
  } else if (point_int_slot > POINTRIGHTRANGE) {
    return 800000;
  }
  return point_int_slot;
}
export const CONSTANT_D = 1.0001;
export const POINTDELTAMAP = {
  100: 1,
  400: 8,
  2000: 40,
  10000: 200,
};
export const DEFAULTSELECTEDFEE = 2000;
export const FEELIST = [
  {
    fee: 100,
    text: 'Best for very stable pairs',
  },
  {
    fee: 400,
    text: 'Best for stable pairs',
  },
  {
    fee: 2000,
    text: 'Best for most pairs',
  },
  {
    fee: 10000,
    text: 'Best for rare pairs',
  },
];
export const POINTLEFTRANGE = -800000;
export const POINTRIGHTRANGE = 800000;
export interface UserLiquidityInfo {
  lpt_id: string;
  owner_id: string;
  pool_id: string;
  left_point: number;
  right_point: number;
  amount: string;
  unclaimed_fee_x: string;
  unclaimed_fee_y: string;
}
