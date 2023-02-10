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
    const { mft_id } = liquidity;
    const inRange = right_point > left_point;
    const [fixRange_l, pool_id_l, left_point_l, right_point_l] =
      mft_id.split('&');
    if (inRange && mft_id) {
      if (left_point_l != left_point_s || right_point_l != right_point_s) {
        temp_unavailable.push(liquidity);
      } else {
        temp_farming.push(liquidity);
      }
    } else if (!inRange) {
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
  const temp_too_little_in_free: UserLiquidityInfo[] = temp_free.filter(
    (liquidity: UserLiquidityInfo) => {
      const v_liquidity = mint_liquidity(liquidity, seed_id);
      if (new BigNumber(v_liquidity).isLessThan(min_deposit)) return true;
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
      const { token_account_ids } = pool;
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
    farmList.forEach((farm: FarmBoost) => {
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
          ? 0
          : new BigNumber(readableNumber)
              .multipliedBy(365)
              .multipliedBy(reward_token_price)
              .dividedBy(seedPowerTvl)
              .toFixed();
      const baseApr =
        +seedTvl == 0
          ? 0
          : new BigNumber(readableNumber)
              .multipliedBy(365)
              .multipliedBy(reward_token_price)
              .dividedBy(seedTvl)
              .toFixed();

      farm.apr = apr.toString();
      farm.baseApr = baseApr.toString();
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
    return toPrecision(num.toString(), 5);
  } else if (numBig.isGreaterThanOrEqualTo(0.01) && numBig.isLessThan(1)) {
    return toPrecision(num.toString(), 3);
  } else if (numBig.isGreaterThanOrEqualTo(1) && numBig.isLessThan(10000)) {
    return toPrecision(num.toString(), 2);
  } else {
    return toPrecision(num.toString(), 0);
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
/** start */
/*
has x, y
{
  lpt_id: 'usdc.fakes.testnet|wrap.testnet|2000#17',
  owner_id: 'qtest.testnet',
  pool_id: 'usdc.fakes.testnet|wrap.testnet|2000',
  left_point: 409880,
  right_point: 411920,
  amount: '1266716207774',
  mft_id: '',
  v_liquidity: '0',
  unclaimed_fee_x: null,
  unclaimed_fee_y: null
}
 "amount_x": "1584599",
 "amount_y": "1000000000000000000000000",
 
only has x
{
  lpt_id: 'usdc.fakes.testnet|wrap.testnet|2000#18',
  owner_id: 'qtest.testnet',
  pool_id: 'usdc.fakes.testnet|wrap.testnet|2000',
  left_point: 409880,
  right_point: 410840,
  amount: '1280233743506',
  mft_id: '',
  v_liquidity: '0',
  unclaimed_fee_x: null,
  unclaimed_fee_y: null
}
"amount_x": "0",
"amount_y": "1000000000000000000000000",

only has y
{
  lpt_id: 'usdc.fakes.testnet|wrap.testnet|2000#19',
  owner_id: 'qtest.testnet',
  pool_id: 'usdc.fakes.testnet|wrap.testnet|2000',
  left_point: 410920,
  right_point: 411920,
  amount: '857766405598',
  mft_id: '',
  v_liquidity: '0',
  unclaimed_fee_x: null,
  unclaimed_fee_y: null
}
"amount_x": "1000000",
"amount_y": "0",


*/
// compute_liquidity( left_point: int, right_point: int, amount_x: int, amount_y: int):
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
export function compute_liquidity(
  left_point: number,
  right_point: number,
  amount_x: string,
  amount_y: string,
  current_point: number
) {
  const { x, y } = compute_deposit_xy_per_unit(
    left_point,
    right_point,
    current_point
  );
  let xl = '0';
  let yl = '0';
  if (+x > 0) {
    xl = new BigNumber(amount_x).dividedBy(x).toFixed();
  }
  if (+y > 0) {
    yl = new BigNumber(amount_y).dividedBy(y).toFixed();
  }
  if (new BigNumber(xl).isLessThanOrEqualTo(yl)) {
    return xl;
  } else {
    return yl;
  }
}
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
  const left_price = get_sqrt_price(left_point);
  const right_price = get_sqrt_price(right_point);
  const current_price = get_sqrt_price(current_point);
  let x = '0';
  let y = '0';
  if (left_point < current_point) {
    if (right_point < current_point) {
      y = get_amount_y_unit_liquidity(left_price, right_price, current_price);
    } else {
      y = get_amount_y_unit_liquidity(left_price, current_price, current_price);
    }
  }
  if (right_point > current_point) {
    let xr_left = current_point + 1;
    if (left_point > current_point) {
      xr_left = left_point;
    }
    x = get_amount_x_unit_liquidity(
      xr_left,
      right_point,
      right_price,
      current_price
    );
  }
  return { x, y };
}
// def get_amount_y_unit_liquidity_96( sqrt_price_l_96: int, sqrt_price_r_96: int,sqrt_rate_96: int):
//    numerator = sqrt_price_r_96 - sqrt_price_l_96
//    denominator = sqrt_rate_96 - pow_96()
//    return mul_fraction_ceil(pow_96(), numerator, denominator)
function get_amount_y_unit_liquidity(
  left_price: string,
  price_right: string,
  current_price: string
) {
  const numerator = new BigNumber(price_right).minus(left_price).toFixed();
  const denominator = new BigNumber(current_price).minus(pow_96()).toFixed();
  return mul_fraction_ceil(pow_96(), numerator, denominator);
}
// def get_amount_x_unit_liquidity_96( left_pt: int, right_pt: int, sqrt_price_r_96: int, sqrt_rate_96: int):
//    sqrt_price_pr_pc_96 = get_sqrt_price(right_pt - left_pt + 1)
//    sqrt_price_pr_pd_96 = get_sqrt_price(right_pt + 1)

//    numerator = sqrt_price_pr_pc_96 - sqrt_rate_96
//    denominator = sqrt_price_pr_pd_96 - sqrt_price_r_96
//    return mul_fraction_ceil(pow_96(), numerator, denominator)
function get_amount_x_unit_liquidity(
  left_point: number,
  right_point: number,
  price_right: string,
  current_price: string
) {
  const sqrt_price_pr_pc = get_sqrt_price(right_point - left_point + 1);
  const sqrt_price_pr_pd = get_sqrt_price(right_point + 1);
  const numerator = new BigNumber(sqrt_price_pr_pc)
    .minus(current_price)
    .toFixed();
  const denominator = new BigNumber(sqrt_price_pr_pd)
    .minus(price_right)
    .toFixed();
  return mul_fraction_ceil(pow_96(), numerator, denominator);
}
// def pow_96():
//    return 1<<96
function pow_96() {
  return BigNumber(2).pow(96).toFixed();
}
// def mul_fraction_ceil(number, _numerator, _denominator):
//    res = number * _numerator // _denominator
//    if (number * _numerator % _denominator == 0):
//       return res
//    else:
//       return (res+1)
function mul_fraction_ceil(
  number: string,
  _numerator: string,
  _denominator: string
) {
  const res = new BigNumber(number)
    .multipliedBy(_numerator)
    .dividedToIntegerBy(_denominator);
  if (
    new BigNumber(number)
      .multipliedBy(_numerator)
      .modulo(_denominator)
      .toFixed() == '0'
  ) {
    return res.toFixed();
  } else {
    return res.plus(1).toFixed();
  }
}
//  ????????? todo
function get_sqrt_price(point: number) {
  return Math.sqrt(Math.pow(1.0001, point)).toString();
}
/** end */

export const TOKEN_LIST_FOR_RATE = ['USDC.e', 'USDC'];
