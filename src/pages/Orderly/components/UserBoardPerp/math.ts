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

// export const getEstLiqPriceWithOrder = (params: { order: OrderParams; price: string }): BigNumber | null => {
//   const { order } = params;
//   const { symbol } = order;
//   const { futuresRelatedValues, currentPosition } = getFuturesState({ symbol });
//   if (!futuresRelatedValues.futuresTotalCollateral) {
//       return null;
//   }
//   const holding = new BigNumber(currentPosition.holding);
//   const orderSize = new BigNumber(order.size);
//   const orderSide = order.side === SideType.BUY ? 1 : -1;
//   const currentTicker = getCurrentTicker({ symbol });
//   const markPrice = new BigNumber(currentTicker?.markPrice || 0);
//   const futuresTotalCollateral = new BigNumber(futuresRelatedValues.futuresTotalCollateral);

//   /*
//       order.qty: +ve for long, -ve for short
//       position.qty: +ve for long, -ve for short, 0 if no position
//       total.qty = order.qty + position.qty

//       long-est.LP= price - (total_collateral - total_MM) / size / (1- real-MMR )
//       short-est.LP= price + (total_collateral - total_MM) / size / (1+ real-MMR )
//       简化后
//       est.liq.price = price - side * (total_collateral - total_MM) / size / (1- side * real-MMR )
//   */
//   const totalQty = orderSize.multipliedBy(orderSide).plus(holding);
//   if (totalQty.eq(0)) {
//       // close position
//       return null;
//   }
//   const totalSide = new BigNumber(totalQty.gt(0) ? 1 : -1);
//   const totalSize = totalQty.abs();
//   const priceNumber = new BigNumber(params.price);
//   const totalNational = totalSize.times(markPrice).toNumber();
//   const { asset } = store.getState();
//   const { symbolRealMMR, symbolMM } = FuturesUtils.getFuturesSymbolMM(symbol, totalNational, { asset });
//   const initialSymbolMM = currentPosition.maintenanceMargin ?? 0;
//   const newTotalMM = new BigNumber(futuresRelatedValues.futuresTotalMM).minus(initialSymbolMM).plus(symbolMM);

//   // (1- side * real-MMR )
//   const lastOption = new BigNumber(1).minus(totalSide.multipliedBy(symbolRealMMR));
//   const rightOption = totalSide.multipliedBy(futuresTotalCollateral.minus(newTotalMM)).dividedBy(totalSize).dividedBy(lastOption);
//   const estLiqPrice = priceNumber.minus(rightOption);
//   return BigNumber.max(estLiqPrice, 0);
// };

const getLqPrice = (
  markPrices: MarkPrice[],
  symbol: SymbolInfo,
  positions: PositionsType,
  cur_amount: string,
  side: 'Buy' | 'Sell',
  curHoldingOut: Holding,

  priceNumber: number
) => {
  try {
    const unsettle = getUnsettle(positions, markPrices);

    const collateral = new Big(
      curHoldingOut.holding + curHoldingOut.pending_short
    ).minus(unsettle);

    const maintenance_margin_ratio = positions.maintenance_margin_ratio;

    const mark_price_current_i =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    const current_position = positions.rows.find(
      (r) => r.symbol === symbol.symbol
    );

    const unsettled_pnl_i = new Big(current_position?.unsettled_pnl || 0);

    const current_notional_i = new Big(
      current_position?.position_qty || 0
    ).times(mark_price_current_i);

    const position_qty_i = current_position?.position_qty || 0;

    const total_unpnl = get_total_upnl(positions, markPrices);

    const total_notional = getTotalnotional(markPrices, positions);

    const new_positon_qty_i = new Big(cur_amount).times(side == 'Buy' ? 1 : -1);

    const after_position_qty_i = new Big(position_qty_i).plus(
      new_positon_qty_i
    );

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
  userInfo: ClientInfo,
  curHoldingOut: Holding,
  priceNumber: string
) => {
  try {
    const unsettle = getUnsettle(positions, markPrices);

    const available = getFreeCollateral(positions, markPrices, userInfo);

    const collateral = new Big(
      curHoldingOut.holding + curHoldingOut.pending_short
    ).minus(unsettle);

    // console.log('curHoldingOut: ', curHoldingOut);

    const im = positions.rows.reduce((acc, cur) => {
      const mark_price_current_i = markPrices.find(
        (m) => m.symbol === cur.symbol
      ).price;

      const imr_pos = new Big(cur.position_qty)
        .abs()
        .times(mark_price_current_i)
        .times(cur.imr);

      const long_qty = side === 'Sell' ? 0 : cur.pending_long_qty;

      const short_qty = side === 'Buy' ? 0 : cur.pending_short_qty;

      const imr_pending = new Big(long_qty + short_qty)
        .abs()
        .times(mark_price_current_i)
        .times(cur.imr);

      return acc.plus(imr_pos).plus(imr_pending);
    }, new Big(0));

    const account_max_leverage = userInfo.max_leverage;

    const newOrderSize = collateral
      .minus(im)
      .times(account_max_leverage)
      .div(priceNumber)
      .times(0.995);

    const res = newOrderSize.toFixed(tickToPrecision(symbol.base_tick));
    console.log('res: ', res);

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
