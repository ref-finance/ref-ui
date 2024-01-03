import React, { useState, useEffect, useContext } from 'react';
import { getURLInfo } from '../components/layout/transactionTipPopUp';
import { checkTransaction, checkTransactionStatus } from '../services/swap';
import { WalletContext } from '../utils/wallets-integration';
import { useHistory } from 'react-router';
import BigNumber from 'bignumber.js';
import * as d3 from 'd3';
import _, { forEach } from 'lodash';
import {
  toReadableNumber,
  toPrecision,
  toNonDivisibleNumber,
} from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import { PoolInfo } from './swapV3';
import {
  FarmBoost,
  Seed,
  getBoostSeeds,
  getBoostTokenPrices,
  get_seed_info,
} from './farm';
import getConfig from '../services/config';
import { PoolRPCView } from '../services/api';
import { ftGetTokenMetadata } from '../services/ft-contract';
import {
  CrossIconEmpty,
  CrossIconLittle,
  CrossIconMiddle,
  CrossIconLarge,
  CrossIconFull,
} from '../components/icon/FarmBoost';
import { useIntl } from 'react-intl';

import { scientificNotationToString } from '../utils/numbers';

import { getTokens } from './tokens_static';
import Big from 'big.js';
import {
  IChartData,
  IDCLAccountFee,
  IDclLogData,
  IProcessedLogData,
} from 'src/components/d3Chart/interfaces';
const { REF_UNI_V3_SWAP_CONTRACT_ID, boostBlackList } = getConfig();

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
/**
 * caculate point by price
 * @param pointDelta
 * @param price
 * @param decimalRate tokenY/tokenX
 * @returns
 */
export function getSlotPointByPoint(pointDelta: number, point: number) {
  let point_int_slot = Math.round(point / pointDelta) * pointDelta;
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
  lpt_id?: string;
  owner_id?: string;
  pool_id: string;
  left_point: number;
  right_point: number;
  amount: string;
  unclaimed_fee_x?: string;
  unclaimed_fee_y?: string;
  mft_id?: string;
  v_liquidity?: string;
  part_farm_ratio?: string;
  unfarm_part_amount?: string;
  status_in_other_seed?: string;
  less_than_min_deposit?: boolean;
  farmList?: FarmBoost[];
}
export interface ILiquidityInfoPool {
  left_point: number;
  right_point: number;
  amount_l: string;
}
export interface IOrderInfoPool {
  point: number;
  amount_x: string;
  amount_y: string;
}

export function useAddLiquidityUrlHandle() {
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
        const methodName = isNeth ? methodNameNeth : methodNameNormal;
        const successValue = isNeth ? successValueNeth : successValueNormal;
        let returnValue;
        if (successValue) {
          const buff = Buffer.from(successValue, 'base64');
          const v = buff.toString('ascii');
          returnValue = v.substring(1, v.length - 1);
        }
        let pool_info: string[] = [];
        if (methodName == 'add_liquidity') {
          pool_info = returnValue.split('|');
        } else if (methodName == 'batch_add_liquidity') {
          pool_info = returnValue.replace(/\"/g, '').split(',')[0]?.split('|');
        }
        if (pool_info.length) {
          const [tokenX, tokenY, id] = pool_info;
          const [fee] = id.split('#');
          const pool_name = get_pool_name(`${tokenX}|${tokenY}|${fee}`);
          history.replace('/poolV2/' + `${pool_name}`);
        }
      });
    }
  }, [txHash, isSignedIn]);
}
export function useRemoveLiquidityUrlHandle() {
  const history = useHistory();
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && isSignedIn) {
      checkTransaction(txHash).then((res: any) => {
        const { transaction, receipts, status, receipts_outcome } = res;
        receipts_outcome?.[1]?.outcome?.status?.SuccessValue;
        const isNeth =
          transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute';
        const methodNameNeth =
          receipts?.[0]?.receipt?.Action?.actions?.[0]?.FunctionCall
            ?.method_name;
        const methodNameNormal =
          transaction?.actions[0]?.['FunctionCall']?.method_name;
        const methodName = isNeth ? methodNameNeth : methodNameNormal;
        if (
          methodName == 'batch_remove_liquidity' ||
          methodName == 'batch_update_liquidity' ||
          methodName == 'withdraw_asset'
        ) {
          const pool_id = sessionStorage.getItem('REMOVE_POOL_ID');
          sessionStorage.removeItem('REMOVE_POOL_ID');
          if (pool_id) {
            const pool_name = get_pool_name(pool_id);
            history.replace(`/poolV2/${pool_name}`);
          } else {
            history.replace('/yourliquidity');
          }
        } else {
          history.replace(`${location.pathname}`);
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

/**
 *
 * @param amount  NonDivisible
 * @param point
 * @returns
 */
export function get_Lx_per_point_by_XAmount(amount: string, point: number) {
  const L = Big(amount)
    .mul(Math.pow(Math.sqrt(CONSTANT_D), point))
    .toFixed();
  return L;
}

/**
 *
 * @param amount NonDivisible
 * @param point
 * @returns
 */
export function get_Ly_per_point_by_YAmount(amount: string, point: number) {
  const L = Big(amount)
    .div(Math.pow(Math.sqrt(CONSTANT_D), point))
    .toFixed();
  return L;
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
        return dBig.toFixed(0);
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
  return y.shiftedBy(-token.decimals).toFixed();
}
function getX(
  leftPoint: number,
  rightPoint: number,
  L: string,
  token: TokenMetadata
) {
  const x = new BigNumber(L).multipliedBy(
    (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
  );
  return x.shiftedBy(-token.decimals).toFixed();
}
/**
 *
 * @param leftPoint
 * @param rightPoint
 * @param token_x_amount NonDivisible
 */
function getLByTokenX(
  leftPoint: number,
  rightPoint: number,
  token_x_amount: string
) {
  const L = Big(token_x_amount)
    .div(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint - leftPoint) - 1) /
        (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
          Math.pow(Math.sqrt(CONSTANT_D), rightPoint - 1))
    )
    .toFixed(0);
  return L;
}
/**
 *
 * @param leftPoint
 * @param rightPoint
 * @param token_y_amount NonDivisible
 * @returns
 */
function getLByTokenY(
  leftPoint: number,
  rightPoint: number,
  token_y_amount: string
) {
  const L = Big(token_y_amount)
    .div(
      (Math.pow(Math.sqrt(CONSTANT_D), rightPoint) -
        Math.pow(Math.sqrt(CONSTANT_D), leftPoint)) /
        (Math.sqrt(CONSTANT_D) - 1)
    )
    .toFixed(0);
  return L;
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
  const amountX_read = new BigNumber(amountX)
    .shiftedBy(-tokenX.decimals)
    .toFixed();
  const amountY_read = new BigNumber(amountY)
    .shiftedBy(-tokenY.decimals)
    .toFixed();
  return { amountx: amountX_read, amounty: amountY_read };
}

export function allocation_rule_liquidities({
  list,
  user_seed_amount,
  seed,
}: {
  list: UserLiquidityInfo[];
  user_seed_amount: string;
  seed: Seed;
}) {
  const { seed_id, min_deposit } = seed;
  const [contractId, temp_pool_id] = seed_id.split('@');
  const [fixRange, pool_id, left_point_s, right_point_s] =
    temp_pool_id.split('&');
  const matched_liquidities = list.filter((liquidity: UserLiquidityInfo) => {
    if (liquidity.pool_id == pool_id) return true;
  });
  const temp_farming: UserLiquidityInfo[] = [];
  let temp_free: UserLiquidityInfo[] = [];
  const temp_unavailable: UserLiquidityInfo[] = [];
  matched_liquidities.forEach((liquidity: UserLiquidityInfo) => {
    const [left_point, right_point] = get_valid_range(liquidity, seed_id);
    const { mft_id, amount } = liquidity;
    const inRange = right_point > left_point;
    const [fixRange_l, pool_id_l, left_point_l, right_point_l] =
      mft_id.split('&');
    const amount_is_little = new BigNumber(amount).isLessThan(1000000);
    if (inRange && mft_id) {
      if (left_point_l != left_point_s || right_point_l != right_point_s) {
        temp_unavailable.push(liquidity);
      } else {
        temp_farming.push(liquidity);
      }
    } else if (!inRange || (!mft_id && amount_is_little)) {
      temp_unavailable.push(liquidity);
    } else {
      temp_free.push(liquidity);
    }
  });
  // sort by mft amount for temp_farming
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
        .multipliedBy(100)
        .toFixed();
      liquidity.part_farm_ratio = percent;
      liquidity.unfarm_part_amount = v_liquidity_big
        .minus(user_seed_amount_remained)
        .toFixed();
      user_seed_amount_remained = '0';
    }
  });
  // Group together
  const temp_farming_final: UserLiquidityInfo[] = [];
  const temp_unFarming = temp_farming.filter((liquidity: UserLiquidityInfo) => {
    const { part_farm_ratio, unfarm_part_amount } = liquidity;
    if (part_farm_ratio == '0') return true;
    temp_farming_final.push(liquidity);
  });
  const temp_free_final: UserLiquidityInfo[] = [];
  temp_free = temp_unFarming.concat(temp_free);
  // const temp_too_little_in_free: UserLiquidityInfo[] = temp_free.filter(
  //   (liquidity: UserLiquidityInfo) => {
  //     const v_liquidity = mint_liquidity(liquidity, seed_id);
  //     if (new BigNumber(v_liquidity).isLessThan(min_deposit)) {
  //       liquidity.less_than_min_deposit = true;
  //       return true;
  //     }
  //     temp_free_final.push(liquidity);
  //   }
  // );
  const temp_too_little_in_free: UserLiquidityInfo[] = temp_free.filter(
    (liquidity: UserLiquidityInfo) => {
      // too little to mint
      const { amount } = liquidity;
      const amount_is_little = new BigNumber(amount).isLessThan(1000000);
      if (amount_is_little) return true;
      temp_free_final.push(liquidity);
    }
  );
  const temp_unavailable_final: UserLiquidityInfo[] = temp_unavailable.concat(
    temp_too_little_in_free
  );
  return [temp_farming_final, temp_free_final, temp_unavailable_final];
}

export function mint_liquidity(liquidity: UserLiquidityInfo, seed_id: string) {
  const { amount } = liquidity;
  const [left_point, right_point] = get_valid_range(liquidity, seed_id);
  if (+right_point > +left_point) {
    const temp_valid = +right_point - +left_point;
    const mint_amount = new BigNumber(Math.pow(temp_valid, 2))
      .multipliedBy(amount)
      .dividedBy(Math.pow(10, 6))
      .toFixed(0, 1);
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

export function get_matched_seeds_for_dcl_pool({
  seeds,
  pool_id,
  sort,
}: {
  seeds: Seed[];
  pool_id: string;
  sort?: string;
}) {
  const activeSeeds = seeds.filter((seed: Seed) => {
    const { seed_id, farmList } = seed;
    const [contractId, mft_id] = seed_id.split('@');
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, pool_id_from_seed, left_point, right_point] =
        mft_id.split('&');
      return pool_id_from_seed == pool_id && farmList[0].status != 'Ended';
    }
  });

  // sort by the latest
  activeSeeds.sort((b: Seed, a: Seed) => {
    const b_latest = getLatestStartTime(b);
    const a_latest = getLatestStartTime(a);
    if (b_latest == 0) return -1;
    if (a_latest == 0) return 1;
    return a_latest - b_latest;
  });
  if (sort != 'new') {
    // having benefit
    const temp_seed = activeSeeds.find((s: Seed, index: number) => {
      if (!isPending(s)) {
        activeSeeds.splice(index, 1);
        return true;
      }
    });
    if (temp_seed) {
      activeSeeds.unshift(temp_seed);
    }
  }
  return activeSeeds;
}
// contain run and ended seed
export function get_matched_all_seeds_of_a_dcl_pool({
  seeds,
  pool_id,
}: {
  seeds: Seed[];
  pool_id: string;
}) {
  const matchedSeeds = seeds.filter((seed: Seed) => {
    const { seed_id, farmList } = seed;
    const [contractId, mft_id] = seed_id.split('@');
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, pool_id_from_seed, left_point, right_point] =
        mft_id.split('&');
      return pool_id_from_seed == pool_id;
    }
  });

  // sort by the latest
  matchedSeeds.sort((b: Seed, a: Seed) => {
    const b_latest = getLatestStartTime(b);
    const a_latest = getLatestStartTime(a);
    if (b_latest == 0) return -1;
    if (a_latest == 0) return 1;
    return a_latest - b_latest;
  });
  const activeSeeds: Seed[] = [];
  const endedSeeds: Seed[] = [];
  matchedSeeds.forEach((seed: Seed) => {
    const { farmList } = seed;
    if (farmList[0].status != 'Ended') {
      activeSeeds.push(seed);
    } else {
      endedSeeds.push(seed);
    }
  });

  return [activeSeeds, endedSeeds, matchedSeeds];
}

export function isPending(seed: Seed) {
  let pending: boolean = true;
  const farms = seed.farmList;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
      pending = false;
      break;
    }
  }
  return pending;
}
export function getLatestStartTime(seed: Seed) {
  let start_at: any[] = [];
  const farmList = seed.farmList;
  farmList.forEach(function (item) {
    start_at.push(item.terms.start_at);
  });
  start_at = _.sortBy(start_at);
  // start_at = start_at.filter(function (val) {
  //   return +val != 0;
  // });
  if (+start_at[0] == 0) {
    return 0;
  } else {
    return start_at[start_at.length - 1];
  }
}
export async function get_all_seeds() {
  let list_seeds: Seed[];
  let list_farm: FarmBoost[][];
  let pools: PoolRPCView[];
  const result = await getBoostSeeds();
  const { seeds, farms, pools: cachePools } = result;
  list_seeds = seeds;
  list_farm = farms;
  pools = cachePools;
  // filter Love Seed
  list_seeds.filter((seed: Seed) => {
    if (seed.seed_id.indexOf('@') > -1) return true;
  });
  // filter black farms
  const temp_list_farm: FarmBoost[][] = [];
  list_farm.forEach((farmList: FarmBoost[]) => {
    let temp_farmList: FarmBoost[] = [];
    temp_farmList = farmList.filter((farm: FarmBoost) => {
      const id = farm?.farm_id?.split('@')[1];
      if (boostBlackList.indexOf(id) == -1) {
        return true;
      }
    });
    temp_list_farm.push(temp_farmList);
  });
  list_farm = temp_list_farm;
  // filter no farm seed
  const new_list_seeds: any[] = [];
  list_farm.forEach((farmList: FarmBoost[], index: number) => {
    if (farmList?.length > 0) {
      new_list_seeds.push({
        ...list_seeds[index],
        farmList,
      });
    }
  });

  list_seeds = new_list_seeds;
  // get all token prices
  const tokenPriceList = await getBoostTokenPrices();
  const list = await getFarmDataList({
    list_seeds,
    list_farm,
    tokenPriceList,
    pools,
  });
  return list;
}
async function getFarmDataList(initData: any) {
  const { list_seeds, tokenPriceList, pools } = initData;
  const promise_new_list_seeds = list_seeds.map(async (newSeed: Seed) => {
    const {
      seed_id,
      farmList,
      total_seed_amount,
      total_seed_power,
      seed_decimal,
    } = newSeed;
    const [contractId, temp_pool_id] = seed_id.split('@');
    let is_dcl_pool = false;
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      is_dcl_pool = true;
    }
    const poolId = getPoolIdBySeedId(seed_id);
    const pool = pools.find((pool: PoolRPCView & PoolInfo) => {
      if (is_dcl_pool) {
        if (pool.pool_id == poolId) return true;
      } else {
        if (+pool.id == +poolId) return true;
      }
    });
    let token_ids: string[] = [];
    if (is_dcl_pool) {
      const [token_x, token_y, fee] = poolId.split('|');
      token_ids.push(token_x, token_y);
    } else {
      const { token_account_ids } = pool || {};
      token_ids = token_account_ids;
    }
    const promise_token_meta_data: Promise<any>[] = [];
    token_ids.forEach(async (tokenId: string) => {
      promise_token_meta_data.push(ftGetTokenMetadata(tokenId));
    });
    const tokens_meta_data = await Promise.all(promise_token_meta_data);
    pool.tokens_meta_data = tokens_meta_data;
    const promise_farm_meta_data = farmList.map(async (farm: FarmBoost) => {
      const tokenId = farm.terms.reward_token;
      const tokenMetadata = await ftGetTokenMetadata(tokenId);
      farm.token_meta_data = tokenMetadata;
      return farm;
    });
    await Promise.all(promise_farm_meta_data);
    // get seed tvl
    const DECIMALS = seed_decimal;
    const seedTotalStakedAmount = toReadableNumber(DECIMALS, total_seed_amount);
    let single_lp_value = '0';
    if (is_dcl_pool) {
      const [fixRange, dcl_pool_id, left_point, right_point] =
        temp_pool_id.split('&');
      const [token_x, token_y] = dcl_pool_id.split('|');
      const [token_x_meta, token_y_meta] = tokens_meta_data;
      const price_x = tokenPriceList[token_x]?.price || '0';
      const price_y = tokenPriceList[token_y]?.price || '0';
      const temp_valid = +right_point - +left_point;
      const range_square = Math.pow(temp_valid, 2);
      const amount = new BigNumber(Math.pow(10, 12))
        .dividedBy(range_square)
        .toFixed();
      single_lp_value = get_total_value_by_liquidity_amount_dcl({
        left_point: +left_point,
        right_point: +right_point,
        amount,
        poolDetail: pool,
        price_x_y: { [token_x]: price_x, [token_y]: price_y },
        metadata_x_y: { [token_x]: token_x_meta, [token_y]: token_y_meta },
      });
    } else {
      const { tvl, id, shares_total_supply } = pool;
      const poolShares = Number(
        toReadableNumber(DECIMALS, shares_total_supply)
      );
      if (poolShares == 0) {
        single_lp_value = '0';
      } else {
        single_lp_value = (tvl / poolShares).toString();
      }
    }
    const seedTotalStakedPower = toReadableNumber(DECIMALS, total_seed_power);
    const seedTvl = new BigNumber(seedTotalStakedAmount)
      .multipliedBy(single_lp_value)
      .toFixed();
    const seedPowerTvl = new BigNumber(seedTotalStakedPower)
      .multipliedBy(single_lp_value)
      .toFixed();
    // get apr per farm
    farmList?.forEach((farm: FarmBoost) => {
      const { token_meta_data } = farm;
      const { daily_reward, reward_token } = farm.terms;
      const readableNumber = toReadableNumber(
        token_meta_data.decimals,
        daily_reward
      );
      const reward_token_price = Number(
        tokenPriceList[reward_token]?.price || 0
      );
      const apr =
        +seedPowerTvl == 0
          ? '0'
          : new BigNumber(readableNumber)
              .multipliedBy(365)
              .multipliedBy(reward_token_price)
              .dividedBy(seedPowerTvl)
              .toFixed();
      const baseApr =
        +seedTvl == 0
          ? '0'
          : new BigNumber(readableNumber)
              .multipliedBy(365)
              .multipliedBy(reward_token_price)
              .dividedBy(seedTvl)
              .toFixed();

      farm.apr = apr;
      farm.baseApr = baseApr;
    });
    newSeed.pool = pool;
    newSeed.seedTvl = seedTvl || '0';
  });
  await Promise.all(promise_new_list_seeds);
  // split ended farms
  const ended_split_list_seeds: Seed[] = [];
  list_seeds.forEach((seed: Seed) => {
    const { farmList } = seed;
    const endedList = farmList.filter((farm: FarmBoost) => {
      if (farm.status == 'Ended') return true;
    });
    const noEndedList = farmList.filter((farm: FarmBoost) => {
      if (farm.status != 'Ended') return true;
    });
    if (endedList.length > 0 && noEndedList.length > 0) {
      seed.farmList = noEndedList;
      const endedSeed = JSON.parse(JSON.stringify(seed));
      endedSeed.farmList = endedList;
      endedSeed.endedFarmsIsSplit = true;
      ended_split_list_seeds.push(endedSeed);
    }
  });
  const total_list_seeds = list_seeds.concat(ended_split_list_seeds);
  return total_list_seeds;
}
const getPoolIdBySeedId = (seed_id: string) => {
  const [contractId, temp_pool_id] = seed_id.split('@');
  if (temp_pool_id) {
    if (contractId == REF_UNI_V3_SWAP_CONTRACT_ID) {
      const [fixRange, dcl_pool_id, left_point, right_point] =
        temp_pool_id.split('&');
      return dcl_pool_id;
    } else {
      return temp_pool_id;
    }
  }
  return '';
};
export function displayNumberToAppropriateDecimals(num: string | number) {
  if (!num) return num;
  const numBig = new BigNumber(num);
  if (numBig.isEqualTo(0)) return 0;
  if (numBig.isLessThan(0.01)) {
    return toPrecision(scientificNotationToString(num.toString()), 5);
  } else if (numBig.isGreaterThanOrEqualTo(0.01) && numBig.isLessThan(1)) {
    return toPrecision(scientificNotationToString(num.toString()), 3);
  } else if (numBig.isGreaterThanOrEqualTo(1) && numBig.isLessThan(10000)) {
    return toPrecision(scientificNotationToString(num.toString()), 2);
  } else {
    return toPrecision(scientificNotationToString(num.toString()), 0);
  }
}

export function get_intersection_radio({
  left_point_liquidity,
  right_point_liquidity,
  left_point_seed,
  right_point_seed,
}: {
  left_point_liquidity: string | number;
  right_point_liquidity: string | number;
  left_point_seed: string | number;
  right_point_seed: string | number;
}) {
  let percent;
  const max_left_point = Math.max(+left_point_liquidity, +left_point_seed);
  const min_right_point = Math.min(+right_point_liquidity, +right_point_seed);
  if (min_right_point > max_left_point) {
    const range_cross = new BigNumber(min_right_point).minus(max_left_point);
    const range_seed = new BigNumber(right_point_seed).minus(left_point_seed);
    const range_user = new BigNumber(right_point_liquidity).minus(
      left_point_liquidity
    );
    let range_denominator = range_seed;
    if (
      left_point_liquidity <= left_point_seed &&
      right_point_liquidity >= right_point_seed
    ) {
      range_denominator = range_user;
    }
    percent = range_cross
      .dividedBy(range_denominator)
      .multipliedBy(100)
      .toFixed();
  } else {
    percent = '0';
  }
  return percent;
}
export function get_intersection_icon_by_radio(radio: string): any {
  const p = new BigNumber(radio || '0');
  let icon;
  if (p.isEqualTo(0)) {
    icon = CrossIconEmpty;
  } else if (p.isLessThan(20)) {
    icon = CrossIconLittle;
  } else if (p.isLessThan(60)) {
    icon = CrossIconMiddle;
  } else if (p.isLessThan(100)) {
    icon = CrossIconLarge;
  } else {
    icon = CrossIconFull;
  }
  return icon;
}
export function getEffectiveFarmList(farmList: FarmBoost[]) {
  const farms: FarmBoost[] = JSON.parse(JSON.stringify(farmList || []));
  let allPending = true;
  for (let i = 0; i < farms.length; i++) {
    if (farms[i].status != 'Created' && farms[i].status != 'Pending') {
      allPending = false;
      break;
    }
  }
  const targetList = farms.filter((farm: FarmBoost) => {
    const pendingFarm = farm.status == 'Created' || farm.status == 'Pending';
    return allPending || !pendingFarm;
  });
  return targetList;
}
export const TOKEN_LIST_FOR_RATE = [
  'USDC.e',
  'USDC',
  'USDT.e',
  'USDT',
  'DAI',
  'USDt',
];

export const TOKEN_LIST_FOR_RATE_EXTRA = ['NEAR'];

export const PAUSE_DCL = true;

export function pause_v2_tip() {
  const tip = 'REF DCL has been paused for maintenance';
  let result: string = `<div class="opacity-50 text-xs text-left xsm:w-40">${tip}</div>`;
  return result;
}
export function pause_old_dcl_claim_tip() {
  const intl = useIntl();

  const tip = intl.formatMessage({
    id: 'remove_will_automatically_claim',
    defaultMessage: 'Removing will automatically claim your unclaimed fees.',
  });

  let result: string = `<div class="opacity-50 w-p200 text-xs text-left">${tip}</div>`;
  return result;
}
export function sort_tokens_by_base(tokens: TokenMetadata[]) {
  const tokens_temp = JSON.parse(JSON.stringify(tokens || []));
  tokens_temp.sort((item2: TokenMetadata, item1: TokenMetadata) => {
    if (TOKEN_LIST_FOR_RATE_EXTRA.indexOf(item2.symbol) > -1) return 1;
    if (TOKEN_LIST_FOR_RATE_EXTRA.indexOf(item1.symbol) > -1) return -1;
    return 0;
  });
  tokens_temp.sort((item2: TokenMetadata, item1: TokenMetadata) => {
    if (TOKEN_LIST_FOR_RATE.indexOf(item2.symbol) > -1) return 1;
    if (TOKEN_LIST_FOR_RATE.indexOf(item1.symbol) > -1) return -1;
    return 0;
  });
  return tokens_temp;
}
export function get_liquidity_value({
  liquidity,
  poolDetail,
  tokenPriceList,
  tokensMeta,
}: {
  liquidity: UserLiquidityInfo;
  poolDetail: PoolInfo;
  tokenPriceList: Record<string, any>;
  tokensMeta: TokenMetadata[];
}) {
  const { left_point, right_point, amount } = liquidity;
  const { token_x, token_y } = poolDetail;
  const v = get_total_value_by_liquidity_amount_dcl({
    left_point,
    right_point,
    poolDetail,
    amount,
    price_x_y: {
      [token_x]: tokenPriceList[token_x]?.price || '0',
      [token_y]: tokenPriceList[token_y]?.price || '0',
    },
    metadata_x_y: {
      [token_x]: tokensMeta[0],
      [token_y]: tokensMeta[1],
    },
  });
  return v;
}
/**
 * caculate bin point by price
 * @param pointDelta
 * @param price
 * @param decimalRate tokenY/tokenX
 * @returns
 */
export function getBinPointByPrice(
  pointDelta: number,
  price: string,
  decimalRate: number,
  slotNumber: number
) {
  const point = Math.log(+price * decimalRate) / Math.log(CONSTANT_D);
  const point_int = Math.round(point);
  const point_int_bin = getBinPointByPoint(pointDelta, slotNumber, point_int);
  return point_int_bin;
}

/**
 *  caculate bin point by point
 * @param pointDelta
 * @param point
 * @param slotNumber
 * @returns
 */
export function getBinPointByPoint(
  pointDelta: number,
  slotNumber: number,
  point: number,
  type?: 'round' | 'floor' | 'ceil'
) {
  const binWidth = pointDelta * slotNumber;
  let int;
  if (type == 'floor') {
    int = Math.floor(point / binWidth);
  } else if (type == 'ceil') {
    int = Math.ceil(point / binWidth);
  } else {
    int = Math.round(point / binWidth);
  }
  const point_in_bin = int * binWidth;
  if (point_in_bin < POINTLEFTRANGE) {
    return POINTLEFTRANGE;
  } else if (point_in_bin > POINTRIGHTRANGE) {
    return 800000;
  }
  return point_in_bin;
}

// processing of pool id and farm id
const FEE_TIER = [100, 400, 2000, 10000];
const TOKENS = getTokens();
function locate_fee(fee_tier: number) {
  for (let i = 0; i < FEE_TIER.length; i++) {
    if (FEE_TIER[i] == fee_tier) return i + 1;
  }
  return 0;
}
function locate_token_id(token_name: string) {
  const arr = Object.entries(TOKENS);
  for (let i = 0; i < arr.length; i++) {
    const [id, name] = arr[i];
    if (name == token_name) return id;
  }
  return 'n/a';
}
export function get_pool_name(pool_id: string) {
  const parts = pool_id.split('|');
  const token_a = TOKENS[parts[0]];
  const token_b = TOKENS[parts[1]];
  const fee = parts[2];
  return `${token_a}<>${token_b}@${fee}`;
}
export function get_pool_id(pool_name: string) {
  const layer1_parts = pool_name.split('@');
  const layer2_parts = layer1_parts[0].split('<>');
  const token_a = locate_token_id(layer2_parts[0]);
  const token_b = locate_token_id(layer2_parts[1]);
  const fee = layer1_parts[1];
  return `${token_a}|${token_b}|${fee}`;
}
export function get_farm_name(farm_id: string) {
  const layer1_parts = farm_id.split('&');
  const pool_id = layer1_parts[1];
  const left_point = layer1_parts[2];
  const right_point = layer1_parts[3];
  const pool_name = get_pool_name(pool_id);
  return `F:${pool_name}[${left_point}-${right_point}]`;
}
export function get_farm_id(farm_name: string) {
  const layer0_parts = farm_name.split(':');
  let farm_type = '';
  if (layer0_parts[0] == 'F') {
    farm_type = 'FixRange';
  } else {
    farm_type = 'N/A';
  }
  const layer1_parts = layer0_parts[1].split('[');
  const pool_id = get_pool_id(layer1_parts[0]);
  const layer2_parts = layer1_parts[1]
    .slice(0, layer1_parts[1].length - 1)
    .split('|');
  const lp = layer2_parts[0];
  const rp = layer2_parts[1];
  return `${REF_UNI_V3_SWAP_CONTRACT_ID}@{"FixRange":{"left_point":${lp},"right_point":${rp}}}&${pool_id}&${lp}&${rp}`;
}

export function openUrl(url: string) {
  var newTab = window.open();
  newTab.opener = null;
  newTab.location = url;
}

/**
 * 中文
 * @param nfts
 * @param slot_number_in_a_bin
 * step1 遍历每个nft，按照slot拆分，把每个slot的 liquidity 和 tokenx amount token y amount 放入 map集合里
 * step2 根据step1 得到的slot，再按照bin划分，每个bin的宽度根据参数拿到，高度 根据 这个bin 里token x token y的数量 应用公式拿到
 */
export function divide_liquidities_into_bins_user({
  liquidities,
  slot_number_in_a_bin,
  tokenX,
  tokenY,
  poolDetail,
}: {
  liquidities: UserLiquidityInfo[];
  slot_number_in_a_bin: number;
  tokenX: TokenMetadata;
  tokenY: TokenMetadata;
  poolDetail: PoolInfo;
}) {
  if (!liquidities?.length) return [];
  // split data to slots
  const liquidities_in_slot_unit: { [point: number]: IChartData } = {};
  const { point_delta, pool_id, current_point } = poolDetail;
  liquidities.forEach((liquidity: UserLiquidityInfo) => {
    const { left_point, right_point, amount } = liquidity;
    const slots_in_a_nft = (right_point - left_point) / point_delta;
    for (let i = 0; i < slots_in_a_nft; i++) {
      const left_point_i = left_point + i * point_delta;
      const right_point_i = left_point_i + point_delta;
      const { total_x, total_y } = get_x_y_amount_by_condition({
        left_point: left_point_i,
        right_point: right_point_i,
        amount,
        tokenX,
        tokenY,
        poolDetail,
      });
      const {
        token_x: token_x_amount,
        token_y: token_y_amount,
        liquidity: L,
      } = liquidities_in_slot_unit[left_point_i] || {};
      liquidities_in_slot_unit[left_point_i] = {
        pool_id,
        point: left_point_i,
        liquidity: Big(amount || 0)
          .plus(L || 0)
          .toFixed(),
        token_x: Big(total_x || 0)
          .plus(token_x_amount || 0)
          .toFixed(),
        token_y: Big(total_y || 0)
          .plus(token_y_amount || 0)
          .toFixed(),
      };
    }
  });
  // 如果有包含当前点位的slot，这个slot里面的 token_x token_y 累计的amount，重新计算 token的数量
  const contain_current_point = getBinPointByPoint(
    point_delta,
    1,
    current_point,
    'floor'
  );
  const contain_current_point_slot =
    liquidities_in_slot_unit[contain_current_point];
  if (contain_current_point_slot) {
    const { total_x, total_y } = get_x_y_amount_by_condition({
      left_point: contain_current_point,
      right_point: contain_current_point + point_delta,
      amount: contain_current_point_slot.liquidity,
      tokenX,
      tokenY,
      poolDetail,
    });
    liquidities_in_slot_unit[contain_current_point]['token_x'] = total_x;
    liquidities_in_slot_unit[contain_current_point]['token_y'] = total_y;
  }
  // split slots to bin
  const liquidities_in_bin_unit: IChartData[] = [];
  const slots: IChartData[] = Object.values(liquidities_in_slot_unit);
  slots.sort((b: IChartData, a: IChartData) => {
    return b.point - a.point;
  });
  const min_point = slots[0].point;
  const max_point = slots[slots.length - 1].point + point_delta;

  const min_bin_point = getBinPointByPoint(
    point_delta,
    slot_number_in_a_bin,
    min_point,
    'floor'
  );
  const max_bin_point = getBinPointByPoint(
    point_delta,
    slot_number_in_a_bin,
    max_point,
    'ceil'
  );
  const binWidth = slot_number_in_a_bin * point_delta;
  const bins_number = (max_bin_point - min_bin_point) / binWidth;
  for (let i = 0; i < bins_number; i++) {
    // search slots in this bin
    const bin_i_point_start = min_bin_point + i * binWidth;
    const bin_i_point_end = min_bin_point + (i + 1) * binWidth;
    const slots_in_bin_i = slots.filter((slot: IChartData) => {
      const { point } = slot;
      const point_start = point;
      const point_end = point + point_delta;
      return point_start >= bin_i_point_start && point_end <= bin_i_point_end;
    });
    // get tokenx tokeny amount in this bin
    let total_x_amount_in_bin_i = Big(0);
    let total_y_amount_in_bin_i = Big(0);
    slots_in_bin_i.forEach((slot: IChartData) => {
      const { token_x, token_y } = slot;
      total_x_amount_in_bin_i = total_x_amount_in_bin_i.plus(token_x);
      total_y_amount_in_bin_i = total_y_amount_in_bin_i.plus(token_y);
    });
    // get L in this bin
    const bin_i_L = get_l_amount_by_condition({
      left_point: bin_i_point_start,
      right_point: bin_i_point_end,
      token_x_amount: toNonDivisibleNumber(
        tokenX.decimals,
        total_x_amount_in_bin_i.toFixed()
      ),
      token_y_amount: toNonDivisibleNumber(
        tokenY.decimals,
        total_y_amount_in_bin_i.toFixed()
      ),
      poolDetail,
      slots: slots_in_bin_i,
      binWidth,
    });

    //
    liquidities_in_bin_unit.push({
      pool_id,
      point: bin_i_point_start,
      liquidity: bin_i_L,
      token_x: total_x_amount_in_bin_i.toFixed(),
      token_y: total_y_amount_in_bin_i.toFixed(),
    });
  }
  // filter empty bin
  const bins_final = liquidities_in_bin_unit.filter((bin: IChartData) => {
    const { token_x, token_y } = bin;
    return Big(token_x || 0).gt(0) || Big(token_y || 0).gt(0);
  });
  bins_final.sort((b: IChartData, a: IChartData) => {
    return b.point - a.point;
  });
  // last bins
  return bins_final;
}
// 根据 point 区间和 L 高度，获得这段区间里的token x 和 token y的数量
export function get_x_y_amount_by_condition({
  left_point,
  right_point,
  amount,
  tokenX,
  tokenY,
  poolDetail,
}: {
  left_point: number;
  right_point: number;
  amount: string;
  tokenX: TokenMetadata;
  tokenY: TokenMetadata;
  poolDetail: PoolInfo;
}) {
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
  return {
    total_x,
    total_y,
  };
}

// 根据 区间和这段区间里的token x tokeny的数量，获得这段区间的高度
/**
 *
 * @param param0
 * @returns bin
 * token_x_amount、token_y_amount ---> NonDivisible
 */
export function get_l_amount_by_condition({
  left_point,
  right_point,
  token_x_amount,
  token_y_amount,
  poolDetail,
  slots,
  binWidth,
}: {
  left_point: number;
  right_point: number;
  token_x_amount: string;
  token_y_amount: string;
  poolDetail: PoolInfo;
  slots?: IChartData[];
  binWidth?: number;
}) {
  let L;
  const { current_point, point_delta } = poolDetail;
  //  in range
  if (current_point >= left_point && right_point > current_point) {
    // 中文 已知这个 bin 里每一个slot的高度，直接加权算
    if (slots) {
      let L_temp = Big(0);
      slots.forEach((slot: IChartData) => {
        const { liquidity } = slot;
        L_temp = L_temp.plus(Big(liquidity || 0).mul(point_delta));
      });
      L = L_temp.div(binWidth).toFixed();
    } else {
      let lx = '0';
      let ly = '0';
      if (Big(token_y_amount).gt(0)) {
        ly = getLByTokenY(left_point, current_point + 1, token_y_amount);
      }
      if (Big(token_x_amount).gt(0)) {
        lx = getLByTokenX(current_point, right_point, token_x_amount);
      }
      if (Big(lx).gt(0)) {
        L = lx;
      }
      if (Big(ly).gt(0)) {
        L = ly;
      }
    }
  }
  // only y token
  if (current_point >= right_point) {
    L = getLByTokenY(left_point, right_point, token_y_amount);
  }
  // only x token
  if (left_point > current_point) {
    L = getLByTokenX(left_point, right_point, token_x_amount);
  }
  return L;
}
/**
 * 根据区间和这段区间里的 order的数据，获得order在这段区间的平均高度
 * @param param0
 * @returns
 */
export function get_o_l_amount_by_condition({
  left_point,
  right_point,
  token_x_amount,
  token_y_amount,
  poolDetail,
  orders,
  binWidth,
}: {
  left_point: number;
  right_point: number;
  token_x_amount: string;
  token_y_amount: string;
  poolDetail: PoolInfo;
  orders?: IOrderInfoPool[];
  binWidth?: number;
}) {
  let L;
  const { current_point } = poolDetail;
  //  in range
  if (current_point >= left_point && right_point > current_point) {
    // 算出这个bin里每一个order的高度，直接加权求平均
    let L_O_temp = Big(0);
    orders.forEach((order: IOrderInfoPool) => {
      const { amount_x, amount_y, point } = order;
      if (amount_x) {
        const lx = get_Lx_per_point_by_XAmount(amount_x, point);
        L_O_temp.plus(lx || 0);
      } else if (amount_y) {
        const ly = get_Ly_per_point_by_YAmount(amount_y, point);
        L_O_temp.plus(ly || 0);
      }
    });
    L = L_O_temp.div(binWidth).toFixed();
  }
  // only y token
  if (current_point >= right_point) {
    L = getLByTokenY(left_point, right_point, token_y_amount);
  }
  // only x token
  if (left_point > current_point) {
    L = getLByTokenX(left_point, right_point, token_x_amount);
  }
  return L;
}

const second24 = 24 * 60 * 60;
export function get_account_24_apr(
  unClaimed_fee$: string | number,
  dclAccountFee: IDCLAccountFee | any,
  pool: PoolInfo,
  tokenPriceList: any
) {
  const { token_x_metadata, token_y_metadata } = pool;
  const price_x = tokenPriceList?.[token_x_metadata.id]?.price || 0;
  const price_y = tokenPriceList?.[token_y_metadata.id]?.price || 0;
  let apr_24 = '0';
  const { apr } = dclAccountFee;
  // 24小时平均利润
  const { fee_data, user_token, change_log_data } = apr;
  const { fee_x, fee_y } = fee_data;
  const fee_x_final = Big(fee_x).abs();
  const fee_y_final = Big(fee_y).abs();
  const fee_x_24 = toReadableNumber(
    token_x_metadata.decimals,
    Big(fee_x_final || 0).toFixed()
  );
  const fee_y_24 = toReadableNumber(
    token_y_metadata.decimals,
    Big(fee_y_final || 0).toFixed()
  );
  let fee_x_24_value = Big(fee_x_24).mul(price_x);
  let fee_y_24_value = Big(fee_y_24).mul(price_y);
  if (Big(fee_x).lt(0)) {
    fee_x_24_value = Big(-fee_x_24_value.toNumber());
  }
  if (Big(fee_y).lt(0)) {
    fee_y_24_value = Big(-fee_y_24_value.toNumber());
  }
  const total_fee_24_value = fee_x_24_value
    .plus(fee_y_24_value)
    .plus(unClaimed_fee$ || 0);
  // 24小时平均本金
  const processed_change_log: IProcessedLogData[] = [];
  const user_token_processed = process_user_token({
    user_token,
    pool,
    tokenPriceList,
  });
  const before24Time = Big(user_token.timestamp).minus(second24).toFixed(0); // 秒
  processed_change_log.push(user_token_processed);

  if (change_log_data?.length) {
    change_log_data.sort((b: IDclLogData, a: IDclLogData) => {
      return Big(a.timestamp).minus(b.timestamp).toNumber();
    });
    change_log_data.forEach((log: IDclLogData) => {
      const preLog = processed_change_log[processed_change_log.length - 1];
      const processed_log: IProcessedLogData = process_log_data({
        preLog,
        log,
        before24Time,
        pool,
        tokenPriceList,
      });
      processed_change_log.push(processed_log);
    });
    // for 加权
    processed_change_log.forEach((log: IProcessedLogData, index: number) => {
      const { distance_from_24 } = log;
      if (index !== processed_change_log.length - 1) {
        const next_log = processed_change_log[index + 1];
        const dis = Big(distance_from_24)
          .minus(next_log.distance_from_24)
          .toFixed();
        log.distance_from_24 = dis;
      }
    });
  }
  // 24小时apr
  let total_processed_log_value = Big(0);
  processed_change_log.forEach((log: IProcessedLogData) => {
    const { total_value, distance_from_24 } = log;
    total_processed_log_value = total_processed_log_value.plus(
      Big(total_value).mul(distance_from_24)
    );
  });
  const principal = total_processed_log_value.div(second24);
  if (principal.gt(0)) {
    apr_24 = total_fee_24_value.div(principal).mul(365).mul(100).toFixed();
  }
  return apr_24;
}

export function get_total_earned_fee({
  total_earned_fee,
  token_x_metadata,
  token_y_metadata,
  unClaimed_amount_x_fee,
  unClaimed_amount_y_fee,
  tokenPriceList,
}: any) {
  let total_earned_fee_x;
  let total_earned_fee_y;
  let total_fee_earned;
  // total earned fee
  const { total_fee_x, total_fee_y } = total_earned_fee || {};
  const total_fee_x_final = Big(total_fee_x || 0).abs();
  const total_fee_y_final = Big(total_fee_y || 0).abs();

  total_earned_fee_x = toReadableNumber(
    token_x_metadata.decimals,
    total_fee_x_final.toFixed()
  );
  total_earned_fee_x = Big(total_fee_x || 0).lt(0)
    ? Big(-Number(total_earned_fee_x))
    : Big(total_earned_fee_x);
  total_earned_fee_x = total_earned_fee_x.plus(unClaimed_amount_x_fee);

  total_earned_fee_y = toReadableNumber(
    token_y_metadata.decimals,
    total_fee_y_final.toFixed()
  );
  total_earned_fee_y = Big(total_fee_y || 0).lt(0)
    ? Big(-Number(total_earned_fee_y))
    : Big(total_earned_fee_y);
  total_earned_fee_y = total_earned_fee_y.plus(unClaimed_amount_y_fee);

  const price_x = tokenPriceList[token_x_metadata.id]?.price || 0;
  const price_y = tokenPriceList[token_y_metadata.id]?.price || 0;
  const total_earned_fee_x_value = Big(total_earned_fee_x).mul(price_x);
  const total_earned_fee_y_value = Big(total_earned_fee_y).mul(price_y);
  total_fee_earned = total_earned_fee_x_value
    .plus(total_earned_fee_y_value)
    .toFixed();
  return {
    total_earned_fee_x_amount: total_earned_fee_x?.toFixed(),
    total_earned_fee_y_amount: total_earned_fee_y?.toFixed(),
    total_fee_earned_money: total_fee_earned,
  };
}
/**
 *
 * @param log 这笔log的本金
 * @param before24Time 秒
 * timestamp 秒
 * @returns
 */
function process_log_data({
  preLog,
  log,
  before24Time,
  pool,
  tokenPriceList,
}: {
  preLog: IProcessedLogData;
  log: IDclLogData;
  before24Time: string;
  pool: PoolInfo;
  tokenPriceList: any;
}) {
  let total_value = Big(0);
  let distance_from_24;
  const { token_x_metadata, token_y_metadata } = pool;
  // get current log changed total value
  const { token_x, token_y } = log;
  const token_x_abs = Big(token_x || 0).abs();
  const token_y_abs = Big(token_y || 0).abs();

  const token_x_amount = toReadableNumber(
    token_x_metadata.decimals,
    Big(token_x_abs).toFixed()
  );
  const token_y_amount = toReadableNumber(
    token_y_metadata.decimals,
    Big(token_y_abs).toFixed()
  );
  const price_x = tokenPriceList[token_x_metadata.id]?.price || 0;
  const price_y = tokenPriceList[token_y_metadata.id]?.price || 0;
  const token_x_value = Big(token_x_amount).mul(price_x);
  const token_y_value = Big(token_y_amount).mul(price_y);

  total_value = token_x_value.plus(token_y_value);

  distance_from_24 = Big(log.timestamp)
    .div(1000000000)
    .minus(before24Time)
    .toFixed(0); // 秒

  if (Big(token_x).lt(0) || Big(token_y).lt(0)) {
    total_value = Big(preLog.total_value).plus(total_value);
  } else {
    total_value = Big(preLog.total_value).minus(total_value);
  }

  return {
    distance_from_24,
    total_value: total_value.lt(0) ? '0' : total_value.toFixed(),
  };
}

function process_user_token({
  user_token,
  pool,
  tokenPriceList,
}: {
  user_token: IDclLogData;
  pool: PoolInfo;
  tokenPriceList: any;
}) {
  const { token_x_metadata, token_y_metadata } = pool;
  const { token_x, token_y } = user_token;

  const price_x = tokenPriceList?.[token_x_metadata.id]?.price || 0;
  const price_y = tokenPriceList?.[token_y_metadata.id]?.price || 0;

  const token_x_value = Big(token_x || 0).mul(price_x);
  const token_y_value = Big(token_y || 0).mul(price_y);
  const total_value = token_x_value.plus(token_y_value).toFixed();

  return {
    total_value,
    distance_from_24: Big(second24).toFixed(),
  };
}

export function whether_liquidity_can_farm_in_seed(
  liquidity: UserLiquidityInfo,
  seed: Seed
) {
  const { mft_id, left_point, right_point, amount } = liquidity;
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
}

/**
 * 中文
 * @param nfts
 * @param slot_number_in_a_bin
 * 获取这个池子的所有liquidity 和 order数据
 * liquidity划分成slot。
 * 找到这个slot和order的最小point 和最大point
 * 根据 区间范围 划分bin
 *
 *
 * step1 遍历每个nft，按照slot拆分，把每个slot的 liquidity 和 tokenx amount token y amount 放入 map集合里
 * step2 根据step1 得到的slot，再按照bin划分，每个bin的宽度根据参数拿到，高度 根据 这个bin 里token x token y的数量 应用公式拿到
 */
export function divide_liquidities_into_bins_pool({
  liquidities,
  orders,
  slot_number_in_a_bin,
  tokenX,
  tokenY,
  poolDetail,
}: {
  liquidities: ILiquidityInfoPool[];
  orders: IOrderInfoPool[];
  slot_number_in_a_bin: number;
  tokenX: TokenMetadata;
  tokenY: TokenMetadata;
  poolDetail: PoolInfo;
}) {
  if (!liquidities?.length && !orders?.length) return [];
  // split data to slots
  const liquidities_in_slot_unit: { [point: number]: IChartData } = {};
  const { point_delta, pool_id } = poolDetail;
  liquidities.forEach((liquidity: ILiquidityInfoPool, index) => {
    const { left_point, right_point, amount_l } = liquidity;
    const slots_in_a_nft = (right_point - left_point) / point_delta;
    for (let i = 0; i < slots_in_a_nft; i++) {
      const left_point_i = left_point + i * point_delta;
      const right_point_i = left_point_i + point_delta;
      const { total_x, total_y } = get_x_y_amount_by_condition({
        left_point: left_point_i,
        right_point: right_point_i,
        amount: amount_l,
        tokenX,
        tokenY,
        poolDetail,
      });
      const {
        token_x: token_x_amount,
        token_y: token_y_amount,
        liquidity: L,
      } = liquidities_in_slot_unit[left_point_i] || {};
      liquidities_in_slot_unit[left_point_i] = {
        pool_id,
        point: left_point_i,
        liquidity: Big(amount_l || 0)
          .plus(L || 0)
          .toFixed(),
        token_x: Big(total_x || 0)
          .plus(token_x_amount || 0)
          .toFixed(),
        token_y: Big(total_y || 0)
          .plus(token_y_amount || 0)
          .toFixed(),
      };
    }
  });
  // split slots to bin
  const liquidities_in_bin_unit: IChartData[] = [];
  const slots: IChartData[] = Object.values(liquidities_in_slot_unit);
  slots.sort((b: IChartData, a: IChartData) => {
    return b.point - a.point;
  });
  orders.sort((b: IOrderInfoPool, a: IOrderInfoPool) => {
    return b.point - a.point;
  });
  let min_point, max_point;
  if (slots.length && orders.length) {
    min_point = Math.min(slots[0].point, orders[0].point);
    max_point = Math.max(
      slots[slots.length - 1].point + point_delta,
      orders[orders.length - 1].point + point_delta
    );
  } else if (slots.length) {
    min_point = slots[0].point;
    max_point = slots[slots.length - 1].point + point_delta;
  } else if (orders.length) {
    min_point = orders[0].point;
    max_point = orders[orders.length - 1].point + point_delta;
  }

  const min_bin_point = getBinPointByPoint(
    point_delta,
    slot_number_in_a_bin,
    min_point,
    'floor'
  );
  const max_bin_point = getBinPointByPoint(
    point_delta,
    slot_number_in_a_bin,
    max_point,
    'ceil'
  );
  const binWidth = slot_number_in_a_bin * point_delta;
  const bins_number = (max_bin_point - min_bin_point) / binWidth;
  for (let i = 0; i < bins_number; i++) {
    // search slots and orders in this bin
    const bin_i_point_start = min_bin_point + i * binWidth;
    const bin_i_point_end = min_bin_point + (i + 1) * binWidth;
    const slots_in_bin_i = slots.filter((slot: IChartData) => {
      const { point } = slot;
      const point_start = point;
      const point_end = point + point_delta;
      return point_start >= bin_i_point_start && point_end <= bin_i_point_end;
    });
    const orders_in_bin_i = orders.filter((order: IOrderInfoPool) => {
      const { point } = order;
      return point >= bin_i_point_start && point < bin_i_point_end;
    });
    // get tokenx tokeny amount in this bin ===>liquidity
    let total_x_amount_in_bin_i = Big(0);
    let total_y_amount_in_bin_i = Big(0);
    slots_in_bin_i.forEach((slot: IChartData) => {
      const { token_x, token_y } = slot;
      total_x_amount_in_bin_i = total_x_amount_in_bin_i.plus(token_x);
      total_y_amount_in_bin_i = total_y_amount_in_bin_i.plus(token_y);
    });

    // get L in this bin =====>liquidity
    const bin_i_L = get_l_amount_by_condition({
      left_point: bin_i_point_start,
      right_point: bin_i_point_end,
      token_x_amount: toNonDivisibleNumber(
        tokenX.decimals,
        total_x_amount_in_bin_i.toFixed()
      ),
      token_y_amount: toNonDivisibleNumber(
        tokenY.decimals,
        total_y_amount_in_bin_i.toFixed()
      ),
      poolDetail,
      slots: slots_in_bin_i,
      binWidth,
    });

    // get tokenx tokeny amount in this bin ===>order
    let total_o_x_amount_in_bin_i = Big(0);
    let total_o_y_amount_in_bin_i = Big(0);
    orders_in_bin_i.forEach((order: IOrderInfoPool) => {
      const { amount_x, amount_y } = order;
      total_o_x_amount_in_bin_i = total_o_x_amount_in_bin_i.plus(amount_x);
      total_o_y_amount_in_bin_i = total_o_y_amount_in_bin_i.plus(amount_y);
    });

    const o_bin_i_L = get_o_l_amount_by_condition({
      left_point: bin_i_point_start,
      right_point: bin_i_point_end,
      token_x_amount: total_o_x_amount_in_bin_i.toFixed(),
      token_y_amount: total_o_y_amount_in_bin_i.toFixed(),
      orders: orders_in_bin_i,
      poolDetail,
      binWidth,
    });

    liquidities_in_bin_unit.push({
      pool_id,
      point: bin_i_point_start,
      liquidity: bin_i_L,
      token_x: total_x_amount_in_bin_i.toFixed(),
      token_y: total_y_amount_in_bin_i.toFixed(),
      order_x: toReadableNumber(
        tokenX.decimals,
        total_o_x_amount_in_bin_i.toFixed()
      ),
      order_y: toReadableNumber(
        tokenY.decimals,
        total_o_y_amount_in_bin_i.toFixed()
      ),
      order_liquidity: o_bin_i_L,
    });
  }
  // filter empty bin
  const bins_final = liquidities_in_bin_unit.filter((bin: IChartData) => {
    const { token_x, token_y, order_x, order_y } = bin;
    return (
      Big(token_x || 0).gt(0) ||
      Big(token_y || 0).gt(0) ||
      Big(order_x || 0).gt(0) ||
      Big(order_y || 0).gt(0)
    );
  });
  bins_final.sort((b: IChartData, a: IChartData) => {
    return b.point - a.point;
  });
  // last bins
  return bins_final;
}

export function get_token_amount_in_user_liquidities({
  user_liquidities,
  pool,
  token_x_metadata,
  token_y_metadata,
}: {
  user_liquidities: UserLiquidityInfo[];
  pool: PoolInfo;
  token_x_metadata: TokenMetadata;
  token_y_metadata: TokenMetadata;
}) {
  let total_x_amount = Big(0);
  let total_y_amount = Big(0);
  const list = divide_liquidities_into_bins_user({
    liquidities: user_liquidities,
    slot_number_in_a_bin: 1,
    tokenX: token_x_metadata,
    tokenY: token_y_metadata,
    poolDetail: pool,
  });

  list.forEach((l: IChartData) => {
    const { token_x, token_y } = l;
    total_x_amount = total_x_amount.plus(token_x);
    total_y_amount = total_y_amount.plus(token_y);
  });
  return [total_x_amount.toFixed(), total_y_amount.toFixed()];
}
export function reverse_price(price: string) {
  if (Big(price).eq(0)) return '999999999999999999999';
  return Big(1).div(price).toFixed();
}
