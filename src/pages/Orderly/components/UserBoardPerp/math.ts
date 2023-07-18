import { PositionPushType, PositionsType } from '~pages/Orderly/orderly/type';
import Big from 'big.js';

import BigNumber from 'bignumber.js';

import math from 'mathjs';
import { numberWithCommas } from '~pages/Orderly/utiles';
import { numberWithCommasPadding } from '../../utiles';
import { toPrecision } from '~pages/Orderly/near';
import { getMax } from '../../../../utils/numbers';
import { SymbolInfo } from '../../orderly/type';
import {
  MarkPrice,
  Holding,
  ClientInfo,
  MyOrder,
  Ticker,
} from '../../orderly/type';
import Decimal from 'decimal.js';
import { parseSymbol } from '../RecentTrade';

const getTotaluPnl = (positions: PositionsType, markprices: MarkPrice[]) => {
  if (!positions) return '0';

  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markprices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value = (markPrice - cur.average_open_price) * cur.position_qty;

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  return numberWithCommas(pnl.toFixed(2));
};

const getPortfolioTotaluPnl = (
  positions: PositionsType,
  markprices: MarkPrice[]
) => {
  if (!positions) return '0';

  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markprices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value = (markPrice - cur.average_open_price) * cur.position_qty;

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  return numberWithCommas(pnl.toFixed(0));
};

const getNotional = (positions: PositionsType) => {
  if (!positions) return '0';

  const notional = positions.rows.reduce(
    (acc, cur, index) => {
      const value = cur.average_open_price * cur.position_qty;

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  return numberWithCommas(notional.toFixed(0));
};

const get_total_upnl = (positions: PositionsType, markprices: MarkPrice[]) => {
  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markprices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value = (markPrice - cur.average_open_price) * cur.position_qty;

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  return pnl;
};

const getPositionFloat = (
  positions: PositionsType,
  markprices: MarkPrice[]
) => {
  if (!positions) return new Big(0);

  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markprices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value = (markPrice - cur.mark_price) * cur.position_qty;

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  return pnl;
};

const getRiskLevel = (marginRatio: number, curLeverage: number) => {
  if (marginRatio > 1) {
    return 'low_risk';
  } else if (marginRatio < 1 / (curLeverage || 10)) {
    return 'high_risk';
  } else {
    return 'mid_risk';
  }
};

const getTotalCollateral = (
  positions: PositionsType,
  markprices: MarkPrice[]
) => {
  const float = getPositionFloat(positions, markprices);

  const total_collateral_value = positions.total_collateral_value;

  return new Big(total_collateral_value).plus(float);
};
const getFreeCollateral = (
  positions: PositionsType,
  markprices: MarkPrice[],
  userInfo: ClientInfo
) => {
  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markprices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const pendingLong = cur.pending_long_qty;
      const pendingShort = Math.abs(cur.pending_short_qty);

      const positionQty = cur.position_qty;

      const value =
        markPrice *
        Math.max(pendingLong + positionQty, pendingShort - positionQty);

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  const pendinguPnl = pnl.div(userInfo.max_leverage);

  const totalCollateral = getTotalCollateral(positions, markprices);

  const freeCollateral = new Big(totalCollateral).minus(new Big(pendinguPnl));

  if (freeCollateral.lt(0)) {
    return '0';
  }

  return freeCollateral.toFixed(2);
};

const getTotalnotional = (
  markPrices: MarkPrice[],
  positions: PositionsType
) => {
  const notionalValue = positions.rows.reduce((acc, cur) => {
    const qty = cur.position_qty;

    const price =
      markPrices.find((item) => item.symbol === cur.symbol)?.price || 0;

    const value = new Big(qty).abs().mul(price);

    return new Big(value).plus(acc);
  }, new Big(0));

  return notionalValue;
};

const getMarginRatio = (
  markPrices: MarkPrice[],
  positions: PositionsType,
  curHoldingOut: Holding
) => {
  const notionalValue = positions.rows.reduce((acc, cur) => {
    const qty = cur.position_qty;

    const price =
      markPrices.find((item) => item.symbol === cur.symbol)?.price || 0;

    const value = new Big(qty).abs().mul(price);

    return new Big(value).plus(acc);
  }, new Big(0));

  if (notionalValue.eq(0)) return '10';

  const total_collatetal = getTotalCollateral(positions, markPrices);

  const ratio = total_collatetal.div(notionalValue).gt(10)
    ? '10'
    : total_collatetal.div(notionalValue).toFixed(6);

  return ratio;
};

const getLqPrice = (
  markPrices: MarkPrice[],
  symbol: SymbolInfo,
  positions: PositionsType,
  cur_amount: string,
  side: 'Buy' | 'Sell',
  curHoldingOut: Holding,

  priceNumber: number,
  userInfo: ClientInfo
) => {
  try {
    const unsettle = getUnsettle(positions, markPrices);

    const mark_price_current_i =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    console.log('mark_price_current_i: ', mark_price_current_i.toFixed());

    const total_notional_value = getTotalnotional(markPrices, positions).times(
      mark_price_current_i
    );

    console.log('total_notional_value: ', total_notional_value.toFixed());

    const collateral = new Big(
      curHoldingOut.holding + curHoldingOut.pending_short
    ).plus(total_notional_value.div(userInfo.max_leverage));

    console.log('collateral: ', collateral.toFixed());

    const maintenance_margin_ratio = positions.maintenance_margin_ratio;
    console.log(
      'maintenance_margin_ratio: ',
      maintenance_margin_ratio.toFixed()
    );

    const current_position = positions.rows.find(
      (r) => r.symbol === symbol.symbol
    );

    console.log('current_position: ', current_position);

    const unsettled_pnl_i = new Big(current_position?.unsettled_pnl || 0);
    console.log('unsettled_pnl_i: ', unsettled_pnl_i.toFixed());

    const current_notional_i = new Big(
      current_position?.position_qty || 0
    ).times(mark_price_current_i);

    console.log('current_notional_i: ', current_notional_i.toFixed());

    const position_qty_i = current_position?.position_qty || 0;
    console.log('position_qty_i: ', position_qty_i.toFixed());

    const total_unpnl = get_total_upnl(positions, markPrices);
    console.log('total_unpnl: ', total_unpnl.toFixed());

    const total_notional = getTotalnotional(markPrices, positions);
    console.log('total_notional: ', total_notional.toFixed());

    const new_positon_qty_i = new Big(cur_amount).times(side == 'Buy' ? 1 : -1);
    console.log('new_positon_qty_i: ', new_positon_qty_i.toFixed());

    const after_position_qty_i = new Big(position_qty_i).plus(
      new_positon_qty_i
    );

    console.log('after_position_qty_i: ', after_position_qty_i.toFixed());

    const numerator = current_notional_i
      .times(maintenance_margin_ratio)
      .minus(collateral)
      .minus(total_unpnl)
      .plus(unsettled_pnl_i)
      .plus(after_position_qty_i.times(priceNumber))
      .abs();
    const denominator = after_position_qty_i.minus(
      after_position_qty_i.abs().times(maintenance_margin_ratio)
    );
    const result = total_notional
      .times(maintenance_margin_ratio)
      .minus(numerator.div(denominator));

    console.log('result: ', result.toFixed());

    return result.lte(0)
      ? '-'
      : result.toFixed(tickToPrecision(symbol.base_tick));
  } catch (error) {
    console.log('error: ', error);
    return '-';
  }
};

const leverageMap = (num: number, reverse?: boolean) => {
  const arr = [1, 2, 3, 4, 5, 10];

  if (reverse) {
    return arr[num];
  } else {
    const value = arr.indexOf(num);

    return value;
  }
};

const tickToPrecision = (tick: number) => {
  return Math.log10(1 / tick);
};

const getMaxQuantity = (
  symbol: SymbolInfo,
  side: 'Buy' | 'Sell',
  positions: PositionsType,
  markPrices: MarkPrice[],
  userInfo: ClientInfo
) => {
  try {
    const mark_price_current_i =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    const collateral = getTotalCollateral(positions, markPrices);

    const cur_position = positions.rows.find((r) => r.symbol === symbol.symbol);

    const cur_side = new Big(1).times(cur_position.position_qty >= 0 ? 1 : -1);

    const order_side = side == 'Buy' ? new Big(1) : new Big(-1);

    const curIm = positions.rows.reduce((acc, cur) => {
      const mark_price_current_i = markPrices.find(
        (m) => m.symbol === cur.symbol
      ).price;

      // const imr_pos = new Big(cur.position_qty)
      //   .abs()
      //   .times(mark_price_current_i)
      //   .times(cur.imr);

      if (cur.symbol !== symbol.symbol) return acc;

      const imr_pending = new Big(
        Math.max(
          cur.pending_long_qty + cur.position_qty,
          cur.pending_short_qty - cur.position_qty
        )
      )
        .abs()
        .times(mark_price_current_i)
        .times(cur.imr);

      return acc.plus(imr_pending);
    }, new Big(0));

    const othersIm = positions.rows.reduce((acc, cur) => {
      const mark_price_current_i = markPrices.find(
        (m) => m.symbol === cur.symbol
      ).price;

      // const imr_pos = new Big(cur.position_qty)
      //   .abs()
      //   .times(mark_price_current_i)
      //   .times(cur.imr);

      if (cur.symbol === symbol.symbol) return acc;

      const im = new Big(
        Math.max(
          cur.pending_long_qty + cur.position_qty,
          cur.pending_short_qty - cur.position_qty
        )
      )
        .abs()
        .times(mark_price_current_i)
        .times(cur.imr);

      return acc.plus(im);
    }, new Big(0));

    const account_max_leverage = userInfo.max_leverage;

    const newOrderSize = collateral
      .minus(othersIm.plus(curIm.times(order_side.times(cur_side))))
      .times(account_max_leverage)
      .div(mark_price_current_i)
      .times(0.995);

    const res = newOrderSize.toFixed(tickToPrecision(symbol.base_tick));

    return Number(res);
  } catch (error) {
    return '-';
  }
};

export interface CalcMaxSizeParams {
  futuresAdjustedCollateral: string;
  totalIM: number;
  othersIM: number;
  leverage: number;
  side: 'Buy' | 'Sell';
  symbol: string;
  futuresMarginFactor: number;
  currentPosition: any;
  othersPositions: any;
  markPrice: number;
}

const getUnsettle = (positions: PositionsType, markPrices: MarkPrice[]) => {
  const float = getPositionFloat(positions, markPrices);

  const unsettle = positions.rows.reduce((acc, cur) => {
    return acc.plus(cur.unsettled_pnl);
  }, new Big(0));

  return unsettle.plus(float);
};

const getPortfolioUnsettle = (
  positions: PositionsType,
  markPrices: MarkPrice[]
) => {
  try {
    const unsettle = positions.rows.reduce((acc, cur) => {
      const cur_mark_price = markPrices.find(
        (m) => m.symbol === cur.symbol
      ).price;

      const float = cur.position_qty * (cur_mark_price - cur.mark_price);

      return acc.plus(cur.unsettled_pnl + float);
    }, new Big(0));

    return unsettle.toFixed(0);
  } catch (error) {
    return '-';
  }
};

const getMaintenanceMarginRatio = (
  positions: PositionsType,
  markPrices: MarkPrice[]
) => {
  try {
    const mmr = positions.maintenance_margin_ratio;

    return new Big(mmr * 100).toFixed(2) + '%';
  } catch (error) {
    return '-';
  }
};

export {
  getTotaluPnl,
  getPortfolioTotaluPnl,
  getNotional,
  getRiskLevel,
  getMarginRatio,
  getTotalCollateral,
  getFreeCollateral,
  leverageMap,
  getMaxQuantity,
  tickToPrecision,
  getLqPrice,
  getUnsettle,
  getPortfolioUnsettle,
  getMaintenanceMarginRatio,
};
