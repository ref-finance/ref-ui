import BigNumber from 'bignumber.js';

const LEFT_MOST_POINT = -800000;
const RIGHT_MOST_POINT = 800000;
// def compute_deposit_xy_per_unit( left_point: int, right_point: int, current_point: int):
//       sqrt_price_96 = get_sqrt_price(1)
//       sqrt_price_r_96 = get_sqrt_price(right_point)
//       y = 0
//       if left_point < current_point:
//          sqrt_price_l_96 = get_sqrt_price(left_point)
//          if right_point < current_point:
//             y = get_amount_y_unit_liquidity_96(sqrt_price_l_96, sqrt_price_r_96, sqrt_rate_96())
//          else:
//             y = get_amount_y_unit_liquidity_96(sqrt_price_l_96, sqrt_price_96, sqrt_rate_96())

//       x = 0
//       if right_point > current_point:
//          xr_left = current_point + 1
//          if left_point > current_point:
//             xr_left = left_point
//          x = get_amount_x_unit_liquidity_96(xr_left, right_point, sqrt_price_r_96, sqrt_rate_96())

//       if left_point <= current_point and right_point > current_point:
//          y += sqrt_price_96

//       return (x, y)
function compute_deposit_xy_per_unit(
  left_point: number,
  right_point: number,
  current_point: number
) {
  const sqrt_price_96 = get_sqrt_price(current_point);
  const sqrt_price_r_96 = get_sqrt_price(right_point);
  let y = '0';
  if (left_point < current_point) {
    const sqrt_price_l_96 = get_sqrt_price(left_point);
    if (right_point < current_point) {
      y = get_amount_y_unit_liquidity_96(
        sqrt_price_l_96,
        sqrt_price_r_96,
        sqrt_rate_96()
      );
    } else {
      y = get_amount_y_unit_liquidity_96(
        sqrt_price_l_96,
        sqrt_price_96,
        sqrt_rate_96()
      );
    }
  }
  let x = '0';
  if (right_point > current_point) {
    let xr_left = current_point + 1;
    if (left_point > current_point) {
      xr_left = left_point;
    }
    x = get_amount_x_unit_liquidity_96(
      xr_left,
      right_point,
      sqrt_price_r_96,
      sqrt_rate_96()
    );
  }
  if (left_point <= current_point && right_point > current_point) {
    y = new BigNumber(y).plus(sqrt_price_96).toFixed();
  }
  return { x, y };
}
// def get_amount_y_unit_liquidity_96( sqrt_price_l_96: int, sqrt_price_r_96: int,sqrt_rate_96: int):
//    numerator = sqrt_price_r_96 - sqrt_price_l_96
//    denominator = sqrt_rate_96 - pow_96()
//    return mul_fraction_ceil(pow_96(), numerator, denominator)
function get_amount_y_unit_liquidity_96(
  sqrt_price_l_96: string,
  sqrt_price_r_96: string,
  sqrt_rate_96: string
) {
  const numerator = new BigNumber(sqrt_price_r_96)
    .minus(sqrt_price_l_96)
    .toFixed();
  const denominator = new BigNumber(sqrt_rate_96).minus(pow_96()).toFixed();
  return mul_fraction_ceil(pow_96(), numerator, denominator);
}

function get_amount_x_unit_liquidity_96(
  left_pt: number,
  right_pt: number,
  sqrt_price_r_96: number | string,
  sqrt_rate_96: number | string
) {
  const sqrt_price_pr_pc_96 = get_sqrt_price(right_pt - left_pt + 1);
  const sqrt_price_pr_pd_96 = get_sqrt_price(right_pt + 1);
  const numerator = new BigNumber(sqrt_price_pr_pc_96)
    .minus(sqrt_rate_96)
    .toFixed();
  const denominator = new BigNumber(sqrt_price_pr_pd_96)
    .minus(sqrt_price_r_96)
    .toFixed();
  return mul_fraction_ceil(pow_96(), numerator, denominator);
}

// def mul_fraction_ceil(number, _numerator, _denominator):
//    res = number * _numerator // _denominator
//    if (number * _numerator % _denominator == 0):
//       return res
//    else:
//       return (res+1)
const mul_fraction_ceil = (
  number: string | number,
  _numerator: string | number,
  _denominator: string | number
) => {
  const res = new BigNumber(number)
    .multipliedBy(_numerator)
    .dividedToIntegerBy(_denominator);
  if (
    new BigNumber(number)
      .multipliedBy(_numerator)
      .modulo(_denominator)
      .isEqualTo(0)
  )
    return res.toFixed();
  else return res.plus(1).toFixed();
};
function get_sqrt_price(point: number) {
  if (point > RIGHT_MOST_POINT || point < LEFT_MOST_POINT) {
    return '0';
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
  return value
    .dividedToIntegerBy(pow_n(32))
    .plus(new BigNumber(remainder))
    .toFixed();
}
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
const pow_n = (n: number) => {
  return new BigNumber(2).exponentiatedBy(n).toFixed();
};
const pow_128 = () => {
  return new BigNumber('340282366920938463463374607431768211456').toFixed();
};
const pow_96 = () => {
  return new BigNumber('79228162514264337593543950336').toFixed();
};
const mul_fraction_floor = (
  number: string | number,
  numerator: string | number,
  denominator: string | number
) => {
  return new BigNumber(number)
    .multipliedBy(numerator)
    .dividedToIntegerBy(denominator);
};
const sqrt_rate_96 = () => {
  return get_sqrt_price(1);
};
// def compute_liquidity( left_point: int, right_point: int, amount_x: int, amount_y: int):
//       liquidity = ( (1<<128) - 1 ) // 2
//       (x, y) = self.compute_deposit_xy_per_unit(left_point, right_point)
//       if x > 0:
//          xl = mul_fraction_floor(amount_x, pow_96(), x)
//          if liquidity > xl:
//             liquidity = xl

//       if y > 0:
//          yl = mul_fraction_floor(amount_y - 1, pow_96(), y)
//          if liquidity > yl:
//             liquidity = yl

//       return liquidity
export function compute_liquidity({
  left_point,
  right_point,
  amount_x,
  amount_y,
  current_point,
}: {
  left_point: number;
  right_point: number;
  amount_x: string;
  amount_y: string;
  current_point: number;
}) {
  let liquidity = new BigNumber(2).pow(128).minus(1).dividedToIntegerBy(2);
  const { x, y } = compute_deposit_xy_per_unit(
    left_point,
    right_point,
    current_point
  );
  let xl;
  let yl;
  if (+x > 0) {
    xl = mul_fraction_floor(amount_x, pow_96(), x);
    if (liquidity.isGreaterThan(xl)) {
      liquidity = xl;
    }
  }
  if (+y > 0) {
    yl = mul_fraction_floor(
      new BigNumber(amount_y).minus(1).toFixed(),
      pow_96(),
      y
    );
    if (liquidity.isGreaterThan(yl)) {
      liquidity = yl;
    }
  }
  return liquidity.toFixed();
}
