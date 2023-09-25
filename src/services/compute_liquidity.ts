import BigNumber from 'bignumber.js';

const LEFT_MOST_POINT = -800000;
const RIGHT_MOST_POINT = 800000;

// sqrt of 1.0001^(-800000) in 2^96 power
// const MIN_PRICE = 337263108622
const MIN_PRICE = new BigNumber('337263108622');
// sqrt of 1.0001^(800000) in 2^96 power
//const MAX_PRICE = 18611883644907511909590774894315720731532604461
const MAX_PRICE = new BigNumber(
  '18611883644907511909590774894315720731532604461'
);

const pow_n = (n: any) => {
  return new BigNumber(2).exponentiatedBy(n);
};

const pow_128 = () => {
  //return new BigNumber(2).exponentiatedBy(128);
  return new BigNumber('340282366920938463463374607431768211456');
};

const pow_96 = () => {
  //return new BigNumber(2).exponentiatedBy(96);
  return new BigNumber('79228162514264337593543950336');
};

const sqrt_rate_96 = () => {
  return get_sqrt_price(1);
};

const mul_fraction_floor = (
  number: BigNumber,
  numerator: BigNumber,
  denominator: BigNumber
) => {
  return number.multipliedBy(numerator).dividedToIntegerBy(denominator);
};

const mul_fraction_ceil = (
  number: BigNumber,
  numerator: BigNumber,
  denominator: BigNumber
) => {
  const res = number.multipliedBy(numerator).dividedToIntegerBy(denominator);
  if (number.multipliedBy(numerator).modulo(denominator) == new BigNumber(0))
    return res;
  else return res.plus(1);
};

// sqrt(1.0001^point)
// from https://github.com/izumiFinance/izumi-swap-core/blob/main/contracts/libraries/LogPowMath.sol//L16-L44
// compute the price at a given point
// @param point: the point
// @return the price of the point
const get_sqrt_price = (point: number) => {
  if (point > RIGHT_MOST_POINT || point < LEFT_MOST_POINT) {
    return new BigNumber(0);
  }

  let abs_point = point;
  if (point < 0) abs_point = -point;

  let value = new BigNumber('0x100000000000000000000000000000000');
  if ((point & 1) != 0) {
    value = new BigNumber('0xfffcb933bd6fad37aa2d162d1a594001');
  }

  value = update_value(
    abs_point,
    value,
    0x2,
    new BigNumber('0xfff97272373d413259a46990580e213a')
  );
  value = update_value(
    abs_point,
    value,
    0x4,
    new BigNumber('0xfff2e50f5f656932ef12357cf3c7fdcc')
  );
  value = update_value(
    abs_point,
    value,
    0x8,
    new BigNumber('0xffe5caca7e10e4e61c3624eaa0941cd0')
  );
  value = update_value(
    abs_point,
    value,
    0x10,
    new BigNumber('0xffcb9843d60f6159c9db58835c926644')
  );
  value = update_value(
    abs_point,
    value,
    0x20,
    new BigNumber('0xff973b41fa98c081472e6896dfb254c0')
  );
  value = update_value(
    abs_point,
    value,
    0x40,
    new BigNumber('0xff2ea16466c96a3843ec78b326b52861')
  );
  value = update_value(
    abs_point,
    value,
    0x80,
    new BigNumber('0xfe5dee046a99a2a811c461f1969c3053')
  );
  value = update_value(
    abs_point,
    value,
    0x100,
    new BigNumber('0xfcbe86c7900a88aedcffc83b479aa3a4')
  );
  value = update_value(
    abs_point,
    value,
    0x200,
    new BigNumber('0xf987a7253ac413176f2b074cf7815e54')
  );
  value = update_value(
    abs_point,
    value,
    0x400,
    new BigNumber('0xf3392b0822b70005940c7a398e4b70f3')
  );
  value = update_value(
    abs_point,
    value,
    0x800,
    new BigNumber('0xe7159475a2c29b7443b29c7fa6e889d9')
  );
  value = update_value(
    abs_point,
    value,
    0x1000,
    new BigNumber('0xd097f3bdfd2022b8845ad8f792aa5825')
  );
  value = update_value(
    abs_point,
    value,
    0x2000,
    new BigNumber('0xa9f746462d870fdf8a65dc1f90e061e5')
  );
  value = update_value(
    abs_point,
    value,
    0x4000,
    new BigNumber('0x70d869a156d2a1b890bb3df62baf32f7')
  );
  value = update_value(
    abs_point,
    value,
    0x8000,
    new BigNumber('0x31be135f97d08fd981231505542fcfa6')
  );
  value = update_value(
    abs_point,
    value,
    0x10000,
    new BigNumber('0x9aa508b5b7a84e1c677de54f3e99bc9')
  );
  value = update_value(
    abs_point,
    value,
    0x20000,
    new BigNumber('0x5d6af8dedb81196699c329225ee604')
  );
  value = update_value(
    abs_point,
    value,
    0x40000,
    new BigNumber('0x2216e584f5fa1ea926041bedfe98')
  );
  value = update_value(
    abs_point,
    value,
    0x80000,
    new BigNumber('0x48a170391f7dc42444e8fa2')
  );

  if (point > 0) {
    value = new BigNumber(pow_n(256)).minus(1).dividedToIntegerBy(value);
  }

  let remainder = 0;
  if (value.modulo(pow_n(32)).isPositive()) {
    remainder = 1;
  }
  return value.dividedToIntegerBy(pow_n(32)).plus(new BigNumber(remainder));
};

const update_value = (
  point: number,
  value: BigNumber,
  hex1: number,
  hex2: BigNumber
) => {
  if ((point & hex1) != 0) {
    return value.multipliedBy(hex2).dividedToIntegerBy(pow_128());
  }
  return value;
};

// compute the amount of token X and token Y required to add a unit of liquidity within a specified range
// @param left_point: left point of this range
// @param right_point: right point of this range
// @return (x, y)
// compute_deposit_xy_per_unit(self,  left_point: i32, right_point: i32) -> (U256, U256)
const compute_deposit_xy_per_unit = (
  left_point: number,
  right_point: number,
  current_point: number
) => {
  let sqrt_price_96 = get_sqrt_price(current_point);
  let sqrt_price_r_96 = get_sqrt_price(right_point);
  let y = new BigNumber(0);
  if (left_point < current_point) {
    let sqrt_price_l_96 = get_sqrt_price(left_point);
    if (right_point < current_point)
      y = get_amount_y_unit_liquidity_96(
        sqrt_price_l_96,
        sqrt_price_r_96,
        sqrt_rate_96()
      );
    else
      y = get_amount_y_unit_liquidity_96(
        sqrt_price_l_96,
        sqrt_price_96,
        sqrt_rate_96()
      );
  }
  let x = new BigNumber(0);
  if (right_point > current_point) {
    let xr_left = current_point + 1;
    if (left_point > current_point) xr_left = left_point;
    x = get_amount_x_unit_liquidity_96(
      xr_left,
      right_point,
      sqrt_price_r_96,
      sqrt_rate_96()
    );

    if (left_point <= current_point && right_point > current_point)
      y = y.plus(sqrt_price_96);
  }
  return [x, y];
};
// Get amount of token Y that is needed to add a unit of liquidity in the range [left_pt, right_pt)
// @param sqrt_price_l_96: sqrt of left point price in 2^96 power
// @param sqrt_price_r_96: sqrt of right point price in 2^96 power
// @param sqrt_rate_96: sqrt of 1.0001 in 2^96 power
// @return amount of token Y
// get_amount_y_unit_liquidity_96( sqrt_price_l_96: U256, sqrt_price_r_96: U256,sqrt_rate_96: U256) -> U256
const get_amount_y_unit_liquidity_96 = (
  sqrt_price_l_96: BigNumber,
  sqrt_price_r_96: BigNumber,
  sqrt_rate_96: BigNumber
) => {
  let numerator = sqrt_price_r_96.minus(sqrt_price_l_96);
  let denominator = sqrt_rate_96.minus(pow_96());
  return mul_fraction_ceil(pow_96(), numerator, denominator);
};

// Get amount of token X that is needed to add a unit of liquidity in the range [left_pt, right_pt)
// @param left_pt: left point of this range
// @param right_pt: right point of this range
// @param sqrt_price_r_96: sqrt of right point price in 2^96 power
// @param sqrt_rate_96: sqrt of 1.0001 in 2^96 power
// @return amount of token X
// get_amount_x_unit_liquidity_96( left_pt: i32, right_pt: i32, sqrt_price_r_96: U256, sqrt_rate_96: U256) -> U256
const get_amount_x_unit_liquidity_96 = (
  left_pt: number,
  right_pt: number,
  sqrt_price_r_96: BigNumber,
  sqrt_rate_96: BigNumber
) => {
  let sqrt_price_pr_pc_96 = get_sqrt_price(right_pt - left_pt + 1);
  let sqrt_price_pr_pd_96 = get_sqrt_price(right_pt + 1);

  let numerator = sqrt_price_pr_pc_96.minus(sqrt_rate_96);
  let denominator = sqrt_price_pr_pd_96.minus(sqrt_price_r_96);
  return mul_fraction_ceil(pow_96(), numerator, denominator);
};

export const compute_liquidity = (
  left_point: number,
  right_point: number,
  current_point: number,
  amount_x: string,
  amount_y: string
) => {
  let liquidity = pow_n(128)
    .minus(new BigNumber(1))
    .dividedToIntegerBy(new BigNumber(2));
  let x_y = compute_deposit_xy_per_unit(left_point, right_point, current_point);
  if (x_y[0].isGreaterThan(new BigNumber(0))) {
    let xl = mul_fraction_floor(new BigNumber(amount_x), pow_96(), x_y[0]);
    if (liquidity.isGreaterThan(xl)) liquidity = xl;
  }
  if (x_y[1].isGreaterThan(new BigNumber(0))) {
    let yl = mul_fraction_floor(
      new BigNumber(amount_y).minus(new BigNumber(1)),
      pow_96(),
      x_y[1]
    );
    if (liquidity.isGreaterThan(yl)) liquidity = yl;
  }

  return liquidity.toFixed();
};
