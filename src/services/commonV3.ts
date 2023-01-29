import React, { useState, useEffect, useContext } from 'react';
import { getURLInfo } from '../components/layout/transactionTipPopUp';
import { checkTransaction, checkTransactionStatus } from '../services/swap';
import { WalletContext } from '../utils/wallets-integration';
import { useHistory } from 'react-router';
import BigNumber from 'bignumber.js';
import * as d3 from 'd3';
import _ from 'lodash';
import { toReadableNumber, toPrecision } from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import { PoolInfo } from './swapV3';

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
  decimalRate: number,
  noNeedSlot?: boolean
) {
  const point = Math.log(+price * decimalRate) / Math.log(CONSTANT_D);
  const point_int = Math.round(point);
  let point_int_slot = point_int;
  if (!noNeedSlot) {
    point_int_slot = Math.round(point_int / pointDelta) * pointDelta;
  }
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
  mft_id: string;
  v_liquidity: string;
  part_farm_ratio?: string;
  unfarm_part_amount?: string;
}

export function useAddAndRemoveUrlHandle() {
  const history = useHistory();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, status, receipts, receipts_outcome } = res;
        const successValueNormal: string | undefined = status?.SuccessValue;
        const successValueNeth: string | undefined =
          receipts_outcome?.[1]?.outcome?.status?.SuccessValue;
        const isNeth =
          transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute';
        const methodNameNeth =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
            ?.method_name;
        const methodNameNormal =
          transaction?.actions[0]?.['FunctionCall']?.method_name;
        const argsNormal = transaction?.actions[0]?.['FunctionCall']?.args;
        const argsNeth =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall?.args;
        const args = isNeth ? argsNeth : argsNormal;
        const methodName = isNeth ? methodNameNeth : methodNameNormal;
        const successValue = isNeth ? successValueNeth : successValueNormal;
        let returnValue;
        let argsValue;
        if (successValue) {
          const buff = Buffer.from(successValue, 'base64');
          const v = buff.toString('ascii');
          returnValue = v.substring(1, v.length - 1);
        }
        if (args) {
          const buff = Buffer.from(args, 'base64');
          const v = buff.toString('ascii');
          argsValue = v;
        }
        if (methodName == 'append_liquidity' && argsValue) {
          const parmas = JSON.parse(argsValue);
          const { lpt_id } = parmas;
          const [tokenX, tokenY, id] = lpt_id.split('|');
          const [fee, hashId] = id.split('#');
          const paramsId = `${tokenX}@${tokenY}@${fee}@${hashId}`;
          history.replace('/yoursLiquidityDetailV2/' + `${paramsId}`);
        } else if (methodName == 'add_liquidity' && returnValue) {
          const [tokenX, tokenY, id] = returnValue.split('|');
          const [fee, hashId] = id.split('#');
          const paramsId = `${tokenX}@${tokenY}@${fee}@${hashId}`;
          history.replace('/yoursLiquidityDetailV2/' + `${paramsId}`);
        } else if (methodName == 'remove_liquidity' && argsValue) {
          const parmas = JSON.parse(argsValue);
          const { amount, min_amount_x, min_amount_y } = parmas;
          if (+amount == 0 && +min_amount_x == 0 && +min_amount_y == 0) {
            history.replace(`${location.pathname}`);
          } else {
            history.replace('/yourliquidity');
          }
        } else if (methodName == 'create_pool' && returnValue) {
          history.replace(`${location.pathname}#${returnValue}`);
        }
      });
    }
  }, [txHash, isSignedIn]);
}

export function getXAmount_per_point_by_Lx(L: string, point: number) {
  const xAmount = new BigNumber(L)
    .dividedBy(Math.pow(Math.sqrt(CONSTANT_D), point))
    .toFixed();
  return xAmount;
}

export function getYAmount_per_point_by_Ly(L: string, point: number) {
  const yAmount = new BigNumber(L)
    .multipliedBy(Math.pow(Math.sqrt(CONSTANT_D), point))
    .toFixed();
  return yAmount;
}

export function drawChartData({
  depthData,
  chartDom,
  token_x_decimals,
  token_y_decimals,
  sort,
  sizey,
  ticks,
  left_point = 1,
  right_point = 1,
  onlyCurrent = false,
  space_x,
}: {
  depthData: any;
  chartDom: any;
  token_x_decimals: number;
  token_y_decimals: number;
  sort: boolean;
  ticks?: number;
  sizey?: number;
  left_point?: number;
  right_point?: number;
  onlyCurrent?: boolean;
  space_x?: number;
}) {
  const { current_point, liquidities } = depthData;
  const list = Object.values(liquidities);
  const space = space_x || 50;
  const axis_y = sizey || 200;
  if (list.length > 0) {
    const priceList: string[] = [];
    const L_list: string[] = [];
    const displayList: any[] = [];
    const decimalRate =
      Math.pow(10, token_x_decimals) / Math.pow(10, token_y_decimals);
    let price_c: any = getPriceByPoint(current_point, decimalRate);
    let price_left: any = getPriceByPoint(left_point, decimalRate);
    let price_right: any = getPriceByPoint(right_point, decimalRate);
    if (!sort) {
      const temp = price_left;
      price_c = 1 / price_c;
      price_left = 1 / price_right;
      price_right = 1 / temp;
    }
    list.forEach((item: any, index: number) => {
      const { left_point, right_point, amount_l } = item;
      let price_l: any = getPriceByPoint(left_point, decimalRate);
      let price_r: any = getPriceByPoint(right_point, decimalRate);
      if (!sort) {
        const temp = price_l;
        price_l = 1 / price_r;
        price_r = 1 / temp;
      }
      const min_decimals = _.min([token_x_decimals, token_y_decimals]);
      const l = toReadableNumber(min_decimals, amount_l);
      // filter out-of-scope data
      const maxPrice = new BigNumber(price_c).multipliedBy(1000);
      const minPrice = new BigNumber(price_c).dividedBy(1000);
      const needFilterData =
        minPrice.isGreaterThanOrEqualTo(price_l) ||
        minPrice.isGreaterThanOrEqualTo(price_r) ||
        maxPrice.isLessThanOrEqualTo(price_l) ||
        maxPrice.isLessThanOrEqualTo(price_r);
      if (!needFilterData) {
        priceList.push(price_l, price_r);
        L_list.push(l);
        displayList.push({
          left: price_l,
          right: price_r,
          l,
        });
      }
    });
    priceList.push(price_c);
    if (!onlyCurrent) {
      priceList.push(price_left);
      priceList.push(price_right);
    }
    priceList.sort((a: string, b: string) => {
      return new BigNumber(a).minus(new BigNumber(b)).toNumber();
    });
    L_list.sort((a: string, b: string) => {
      return new BigNumber(a).minus(new BigNumber(b)).toNumber();
    });
    const left_p: any = priceList[0];
    const right_p: any = priceList[priceList.length - 1];
    const l_r: any = L_list[L_list.length - 1];
    const width = chartDom.current
      ? chartDom.current.clientWidth - space * 2
      : 0;
    const l: any = new BigNumber(left_p).multipliedBy(0.95).toFixed();
    const r: any = new BigNumber(right_p).multipliedBy(1.05).toFixed();
    const myScaleX = d3.scaleLinear().domain([l, r]).range([0, width]);
    const myScaleY = d3.scaleLinear().domain([0, l_r]).range([0, axis_y]);
    const axis: any = d3.axisBottom(myScaleX);
    axis.ticks(ticks || 5).tickFormat(function (d: any) {
      const dBig = new BigNumber(d);
      if (dBig.isGreaterThanOrEqualTo(10000)) {
        return dBig.toExponential(1);
      } else {
        return d;
      }
    });
    axis.tickSize(0).tickPadding(15);
    d3.select('.g').call(axis).selectAll('text').style('fill', '#7E8A93');
    // chart
    d3.select('.chart')
      .selectAll('rect')
      .data(displayList)
      .join('rect')
      .attr('width', function (d, i) {
        const { left, right, l } = d;
        return myScaleX(right) - myScaleX(left);
      })
      .attr('height', function (d, i) {
        const { left, right, l } = d;
        return myScaleY(l);
      })
      .attr('x', function (d, i) {
        const { left, right, l } = d;
        return myScaleX(left) + space;
      })
      .attr('y', function (d, i) {
        const { left, right, l } = d;
        return axis_y - myScaleY(l);
      })
      .style('fill', 'rgba(91, 64, 255, 0.5)');
    d3.select('.g2')
      .selectAll('line')
      .data([price_c])
      .join('line')
      .attr('x1', function (d) {
        return myScaleX(d) + space;
      })
      .attr('x2', function (d) {
        return myScaleX(d) + space;
      })
      .attr('y1', 0)
      .attr('y2', axis_y)
      .style('strokeWidth', 1)
      .style('stroke', '#fff');

    d3.select('.gLeftLine')
      .selectAll('line')
      .data([price_left])
      .join('line')
      .attr('x1', function (d) {
        return myScaleX(d) + space;
      })
      .attr('x2', function (d) {
        return myScaleX(d) + space;
      })
      .attr('y1', 0)
      .attr('y2', axis_y)
      .style('strokeWidth', 1)
      .style('stroke', '#00FFD1');

    d3.select('.gLeftLine')
      .selectAll('text')
      .data([price_left])
      .join('text')
      .attr('class', 'textLeft')
      .text(function (d, i) {
        const diff: any = new BigNumber(price_c).minus(d).abs();
        const percent = diff.dividedBy(price_c).multipliedBy(100);
        let p: any;
        if (percent.isGreaterThanOrEqualTo(10)) {
          p = percent.toFixed(0);
        } else {
          p = percent.toFixed(1);
        }
        if (percent.isEqualTo(0)) {
          return '0%';
        } else if (price_c > d) {
          if (percent.isGreaterThan(1000)) {
            return '<-1000%';
          } else if (percent.isLessThanOrEqualTo(0.1)) {
            return '>-0.1%';
          } else {
            return `-${p}%`;
          }
        } else {
          if (percent.isGreaterThan(1000)) {
            return '>1000%';
          } else if (percent.isLessThanOrEqualTo(0.1)) {
            return '<0.1%';
          } else {
            return `${p}%`;
          }
        }
      })
      .style('fill', '#00FFD1')
      .style('font-size', '14px')
      .attr('x', function (d, i) {
        const nodeDOM: any = d3.select('.textLeft').node();
        const textWidth = nodeDOM.getComputedTextLength();
        const normalPosition: any = myScaleX(d) + space - textWidth - 5;
        const oppositePosition = myScaleX(d) + space + 5;
        if (normalPosition < 0) {
          return oppositePosition;
        } else {
          return normalPosition;
        }
      })
      .attr('y', function (d, i) {
        return 15;
      });

    d3.select('.gRightLine')
      .selectAll('line')
      .data([price_right])
      .join('line')
      .attr('x1', function (d) {
        return myScaleX(d) + space;
      })
      .attr('x2', function (d) {
        return myScaleX(d) + space;
      })
      .attr('y1', 0)
      .attr('y2', axis_y)
      .style('strokeWidth', 1)
      .style('stroke', '#00FFD1');

    d3.select('.gRightLine')
      .selectAll('text')
      .data([price_right])
      .join('text')
      .attr('class', 'textRight')
      .attr('y', function (d, i) {
        return 15;
      })
      .text(function (d, i) {
        let result;
        const diff = new BigNumber(price_c).minus(d).abs();
        let p = diff.dividedBy(price_c).multipliedBy(100);
        if (p.isGreaterThanOrEqualTo(10)) {
          result = p.toFixed(0);
        } else {
          result = p.toFixed(1);
        }
        if (p.isEqualTo(0)) {
          return '0%';
        } else if (price_c > d) {
          if (p.isGreaterThan(1000)) {
            return '<-1000%';
          } else if (p.isLessThanOrEqualTo(0.1)) {
            return '>-0.1%';
          } else {
            return `-${result}%`;
          }
        } else {
          if (p.isGreaterThan(1000)) {
            return '>1000%';
          } else if (p.isLessThanOrEqualTo(0.1)) {
            return '<0.1%';
          } else {
            return `${result}%`;
          }
        }
      })
      .style('fill', '#00FFD1')
      .style('font-size', '14px')
      .attr('x', function (d, i) {
        const nodeDOM: any = d3.select('.textRight').node();
        const textWidth = nodeDOM.getComputedTextLength();
        const maxPosition = myScaleX(d) + textWidth;
        const oppositePosition = myScaleX(d) + space - textWidth - 5;
        const normalposition = myScaleX(d) + space + 5;
        if (maxPosition > width) {
          return oppositePosition;
        } else {
          return normalposition;
        }
      });
  }
  return list.length;
}

export function get_total_value_by_liquidity_amount_dcl({
  left_point,
  right_point,
  poolDetail,
  amount,
  price_x_y,
  metadata_x_y,
}: {
  left_point: number;
  right_point: number;
  poolDetail: PoolInfo;
  amount: string;
  price_x_y: Record<string, string>;
  metadata_x_y: Record<string, TokenMetadata>;
}) {
  const [tokenX, tokenY] = Object.values(metadata_x_y);
  const [priceX, priceY] = Object.values(price_x_y);
  const { current_point } = poolDetail;
  let total_x = '0';
  let total_y = '0';
  //  in range
  if (current_point >= left_point && right_point > current_point) {
    const tokenYAmount = getY(left_point, current_point, amount, tokenY);
    const tokenXAmount = getX(current_point + 1, right_point, amount, tokenX);
    const { amountx, amounty } = get_X_Y_In_CurrentPoint(
      tokenX,
      tokenY,
      amount,
      poolDetail
    );
    total_x = new BigNumber(tokenXAmount).plus(amountx).toFixed();
    total_y = new BigNumber(tokenYAmount).plus(amounty).toFixed();
  }
  // only y token
  if (current_point >= right_point) {
    const tokenYAmount = getY(left_point, right_point, amount, tokenY);
    total_y = tokenYAmount;
  }
  // only x token
  if (left_point > current_point) {
    const tokenXAmount = getX(left_point, right_point, amount, tokenX);
    total_x = tokenXAmount;
  }
  const total_price_x = new BigNumber(total_x).multipliedBy(priceX);
  const total_price_y = new BigNumber(total_y).multipliedBy(priceY);
  return total_price_x.plus(total_price_y).toFixed();
}
function getY(
  leftPoint: number,
  rightPoint: number,
  L: string,
  token: TokenMetadata
) {
  const y = new BigNumber(L).multipliedBy(
    (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
      Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
      (Math.sqrt(CONSTANT_D) - 1)
  );
  const y_result = y.toFixed();
  return toReadableNumber(token.decimals, toPrecision(y_result, 0));
}
function getX(
  leftPoint: number,
  rightPoint: number,
  L: string,
  token: TokenMetadata
) {
  const x = new BigNumber(L)
    .multipliedBy(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
    )
    .toFixed();
  return toReadableNumber(token.decimals, toPrecision(x, 0));
}
function get_X_Y_In_CurrentPoint(
  tokenX: TokenMetadata,
  tokenY: TokenMetadata,
  L: string,
  poolDetail: PoolInfo
) {
  const { liquidity, liquidity_x, current_point } = poolDetail;
  const liquidity_y_big = new BigNumber(liquidity).minus(liquidity_x);
  let Ly = '0';
  let Lx = '0';
  // only remove y
  if (liquidity_y_big.isGreaterThanOrEqualTo(L)) {
    Ly = L;
  } else {
    // have x and y
    Ly = liquidity_y_big.toFixed();
    Lx = new BigNumber(L).minus(Ly).toFixed();
  }
  const amountX = getXAmount_per_point_by_Lx(Lx, current_point);
  const amountY = getYAmount_per_point_by_Ly(Ly, current_point);
  const amountX_read = toReadableNumber(
    tokenX.decimals,
    toPrecision(amountX, 0)
  );
  const amountY_read = toReadableNumber(
    tokenY.decimals,
    toPrecision(amountY, 0)
  );
  return { amountx: amountX_read, amounty: amountY_read };
}

export function allocation_rule_liquidities({
  list,
  user_seed_amount,
  seed_id,
}: {
  list: UserLiquidityInfo[];
  user_seed_amount: string;
  seed_id: string;
}) {
  const [contractId, temp_pool_id] = seed_id.split('@');
  const [fixRange, pool_id, left_point, right_point] = temp_pool_id.split('&');
  const matched_liquidities = list.filter((liquidity: UserLiquidityInfo) => {
    if (liquidity.pool_id == pool_id) return true;
  });
  const temp_farming: UserLiquidityInfo[] = [];
  let temp_free: UserLiquidityInfo[] = [];
  const temp_unavailable: UserLiquidityInfo[] = [];
  matched_liquidities.forEach((liquidity: UserLiquidityInfo) => {
    const [left_point, right_point] = get_valid_range(liquidity, seed_id);
    const { mft_id } = liquidity;
    const inRange = right_point > left_point;
    if (inRange && mft_id) {
      temp_farming.push(liquidity);
    } else if (!inRange) {
      temp_unavailable.push(liquidity);
    } else {
      temp_free.push(liquidity);
    }
  });
  // sort by mft amount for temp_canFarming
  temp_farming.sort((b: UserLiquidityInfo, a: UserLiquidityInfo) => {
    const mint_amount_b = b.v_liquidity;
    const mint_amount_a = a.v_liquidity;
    return new BigNumber(mint_amount_a).minus(mint_amount_b).toNumber();
  });
  // allocation for temp_farming
  let user_seed_amount_remained = user_seed_amount;
  temp_farming.forEach((liquidity: UserLiquidityInfo) => {
    const v_liquidity = liquidity.v_liquidity;
    const v_liquidity_big = new BigNumber(v_liquidity);
    const user_seed_amount_remained_big = new BigNumber(
      user_seed_amount_remained
    );
    if (v_liquidity_big.isLessThanOrEqualTo(user_seed_amount_remained)) {
      liquidity.part_farm_ratio = '100';
      user_seed_amount_remained = user_seed_amount_remained_big
        .minus(v_liquidity)
        .toFixed();
    } else if (user_seed_amount_remained_big.isEqualTo(0)) {
      liquidity.part_farm_ratio = '0';
    } else {
      const percent = user_seed_amount_remained_big
        .dividedBy(v_liquidity)
        .toFixed();
      liquidity.part_farm_ratio = percent;
      liquidity.unfarm_part_amount = v_liquidity_big
        .minus(user_seed_amount_remained)
        .toFixed();
      user_seed_amount_remained = '0';
    }
  });
  // Group together those of unFarming nft
  const temp_farming_final: UserLiquidityInfo[] = [];
  const temp_unFarming = temp_farming.filter((liquidity: UserLiquidityInfo) => {
    if (liquidity.part_farm_ratio == '0') return true;
    temp_farming_final.push(liquidity);
  });
  temp_free = temp_unFarming.concat(temp_free);
  return [temp_farming_final, temp_free, temp_unavailable];
}

export function mint_liquidity(liquidity: UserLiquidityInfo, seed_id: string) {
  const { amount } = liquidity;
  const [left_point, right_point] = get_valid_range(liquidity, seed_id);
  if (+right_point > +left_point) {
    const temp_valid = +right_point - +left_point;
    const mint_amount = new BigNumber(Math.pow(temp_valid, 2))
      .multipliedBy(amount)
      .dividedBy(Math.pow(10, 6))
      .toFixed(0);
    return mint_amount;
  }
  return '0';
}
export function get_valid_range(liquidity: UserLiquidityInfo, seed_id: string) {
  const { left_point, right_point } = liquidity;
  const [fixRange, dcl_pool_id, seed_left_point, seed_right_point] = seed_id
    .split('@')[1]
    .split('&');
  const max_left_point = Math.max(+left_point, +seed_left_point);
  const min_right_point = Math.min(+right_point, +seed_right_point);
  return [max_left_point, min_right_point];
}

export const TOKEN_LIST_FOR_RATE = ['USDC.e', 'USDC'];
