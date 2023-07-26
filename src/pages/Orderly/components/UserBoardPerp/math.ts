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
import { getPortfolioAllOrders } from '../../orderly/off-chain-api'
import { OrderAsset } from '../AssetModal/state';
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
  markprices: MarkPrice[],
  everyTickers: Ticker[],
  markMode: boolean
) => {
  if (!positions) return '0';

  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markprices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const lastPrice =
        everyTickers.find((i) => i.symbol === cur.symbol)?.close || 0;

      const price = markMode ? markPrice : lastPrice;

      const value =
        cur.position_qty >= 0
          ? (price - cur.average_open_price) * cur.position_qty
          : (cur.average_open_price - price) * cur.position_qty * -1;

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  return numberWithCommas(pnl.toFixed(2));
};

const getNotional = (positions: PositionsType, markPrices: MarkPrice[]) => {
  if (!positions) return '0';

  const notionals = positions.rows.reduce((acc, cur, index) => {
    const markPrice =
      markPrices?.find((item) => item.symbol === cur.symbol)?.price || 0;

    const value = Math.abs(markPrice * cur.position_qty);

    return new Big(value).plus(acc);
  }, new Big(0));

  return numberWithCommas(notionals.toFixed(2));
};

const getAvailable = (
  positions: PositionsType,
  markPrices: MarkPrice[],
  displayBalances: OrderAsset[]
) => {
  if (!displayBalances || !positions || !markPrices) return '0';

  const totatEst = displayBalances.reduce((acc, cur, index) => {
    const markPrice =
      markPrices?.find(
        (item) => item.symbol === `SPOT_${cur.tokenMeta.symbol}_USDC`
      )?.price || 0;

    const value =
      cur.tokenMeta.symbol === 'USDC'
        ? parseFloat(cur.available)
        : parseFloat(cur.available) * markPrice;

    const total = value;

    return new Big(total).plus(acc);
  }, new Big(0));

  console.log(`total estimate:  ${totatEst} (all spot balance in usdc) `);

  return numberWithCommas(totatEst.toFixed(2));
};

const getTotalEst = async (
  positions: PositionsType,
  markPrices: MarkPrice[],
  displayBalances: OrderAsset[],
  curLeverage: number,
  accountId: string
) => {
  if (!displayBalances || !positions || !markPrices || !curLeverage) return '0';
  
  const { data } = await getPortfolioAllOrders({
    accountId,
    OrderProps: {
      page: 1,
      size: 500,
      status: 'INCOMPLETE',
    } 
  })
  
  const futureOrders: MyOrder[] = data.rows.filter((order: MyOrder) => order.symbol.includes('PERP'))

  const futureOrdersCount = futureOrders.reduce((acc, cur, index) => {
    const markPrice =
      markPrices?.find(
        (item) => item.symbol === cur.symbol
      )?.price || 0;


    const value = (cur.quantity * markPrice) / curLeverage;

    return new Big(value).plus(acc);
  }, new Big(0))

  const availables = displayBalances.reduce((acc, cur, index) => {
    const markPrice =
      markPrices?.find(
        (item) => item.symbol === `SPOT_${cur.tokenMeta.symbol}_USDC`
      )?.price || 0;

    const value =
      cur.tokenMeta.symbol === 'USDC'
        ? parseFloat(cur.available)
        : parseFloat(cur.available) * markPrice;
    const inOrder =
      cur.tokenMeta.symbol === 'USDC'
        ? parseFloat(cur['in-order'])
        : parseFloat(cur['in-order']) * markPrice;

    const total = value - inOrder;

    return new Big(total).plus(acc);
  }, new Big(0));

  const futures = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markPrices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value = Math.abs((markPrice * cur.position_qty) / curLeverage);

      return new Big(value).plus(acc);
    },

    new Big(0)
  );



  console.log(
    `available:  ${availables} (all spot balance in usdc + in order spot token) + ${futures} (sum of (future mark price * qty) / leverage) + ${futureOrdersCount} future in orders`
  );

  const available = new Big(futures).plus(availables).plus(futureOrdersCount);

  return numberWithCommas(available.toFixed(2));

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
  console.log('totalCollateral: ', totalCollateral.toFixed());

  const freeCollateral = new Big(totalCollateral).minus(new Big(pendinguPnl));

  return freeCollateral;
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

const getMMR = (
  symbol: SymbolInfo,
  userInfo: ClientInfo,
  position_notional: number
) => {
  const { symbolFrom } = parseSymbol(symbol.symbol);
  const base_mmr = symbol.base_mmr;

  const base_imr = symbol.base_imr;

  const imr_factor = userInfo.imr_factor[symbolFrom];

  const mmr_i = BigNumber.max(
    new Big(base_mmr),
    new BigNumber(base_mmr)
      .div(new BigNumber(base_imr))
      .times(new BigNumber(imr_factor))
      .times(new Decimal(position_notional).pow(4 / 5).toNumber())
  ).toFixed();

  return mmr_i;
};

const getLqPrice = (
  markPrices: MarkPrice[],
  symbol: SymbolInfo,
  positions: PositionsType,
  cur_amount: string,
  side: 'Buy' | 'Sell',
  curHoldingOut: Holding,
  priceNumber: number,
  userInfo: ClientInfo,
  availableSymbols: SymbolInfo[]
) => {
  try {
    // const unsettle = getUnsettle(positions, markPrices);

    const mark_price =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    // const free_collateral = getFreeCollateral(positions, markPrices, userInfo);

    const total_collateral_value = getTotalCollateral(positions, markPrices);

    const total_mm = positions.rows.reduce((acc, cur) => {
      if (cur.symbol === symbol.symbol) return acc;

      const cur_mark_price =
        markPrices.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value = new Big(cur_mark_price).times(cur.position_qty).abs();

      const position_notional = value.toNumber();

      const cur_symbol = availableSymbols.find((s) => s.symbol === cur.symbol);

      const cur_mmr = getMMR(cur_symbol, userInfo, position_notional);

      const mm = new Big(cur_mmr).times(position_notional);

      return acc.plus(mm);
    }, new Big(0));

    console.log('total_mm: ', total_mm.toFixed());

    const cur_position = positions.rows.find((r) => r.symbol === symbol.symbol);

    const orderSize = new Big(side === 'Buy' ? 1 : -1).times(
      new Big(cur_amount)
    );

    const new_Qi = orderSize.plus(new Big(cur_position?.position_qty || 0));
    console.log('new_Qi: ', new_Qi.toFixed());

    const new_Qi_abs = new_Qi.abs();

    const position_notional = new_Qi_abs.times(mark_price).toNumber();

    // const mmr_i = BigNumber.max(
    //   new Big(base_mmr),
    //   new BigNumber(base_mmr)
    //     .div(new BigNumber(base_imr))
    //     .times(new BigNumber(imr_factor))
    //     .times(new Decimal(position_notional).pow(4 / 5).toNumber())
    // ).toFixed();

    const mmr_i = getMMR(symbol, userInfo, position_notional);

    console.log('mmr_i: ', mmr_i);

    const denominator = new Big(new_Qi_abs).times(new Big(mmr_i)).minus(new_Qi);

    // total_mm 所有占用
    //
    const numerator = new Big(total_collateral_value)
      .minus(total_mm)
      .minus(new Big(position_notional).times(mmr_i));

    console.log(
      'new Big(position_notional).times(mmr_i): ',
      new Big(position_notional).times(mmr_i).toFixed()
    );

    const result = new Big(priceNumber).plus(numerator.div(denominator));
    console.log('result: ', result.toFixed(), priceNumber);

    console.log('right options', numerator.div(denominator).toFixed());
    console.log('numerator: ', numerator.toFixed());

    // const result = total_notional
    //   .times(maintenance_margin_ratio)
    //   .minus(numerator.div(denominator));

    // console.log('result: ', result.toFixed());

    return result.lte(0)
      ? '-'
      : result.toFixed(tickToPrecision(symbol.quote_tick));
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
    const cur_position = positions.rows.find((r) => r.symbol === symbol.symbol);

    const free_collateral = getFreeCollateral(positions, markPrices, userInfo);

    if (free_collateral.lte(0)) {
      if (
        (side === 'Buy' && (cur_position?.position_qty || 0) >= 0) ||
        (side == 'Sell' && (cur_position?.position_qty || 0) < 0)
      ) {
        return 0;
      } else {
        if (side === 'Buy') {
          return Math.max(
            0,
            Math.abs(cur_position?.position_qty || 0) -
              (cur_position?.pending_long_qty || 0)
          );
        }
        if (side === 'Sell') {
          return Math.max(
            0,
            (cur_position?.position_qty || 0) +
              (cur_position?.pending_short_qty || 0)
          );
        }
      }
    }

    const mark_price_current_i =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    const collateral = getTotalCollateral(positions, markPrices);

    const cur_side = new Big(1).times(
      (cur_position?.position_qty || 0) +
        (side === 'Buy'
          ? cur_position?.pending_long_qty || 0
          : cur_position?.pending_short_qty || 0) >=
        0
        ? 1
        : -1
    );

    const order_side = side == 'Buy' ? new Big(1) : new Big(-1);

    const curIm = positions.rows.reduce((acc, cur) => {
      const mark_price_current_i = markPrices.find(
        (m) => m.symbol === cur.symbol
      ).price;

      if (cur.symbol !== symbol.symbol) return acc;

      const qty =
        cur.position_qty +
        (side === 'Buy' ? cur.pending_long_qty : cur.pending_short_qty);

      const imr_pending = new Big(qty)
        .abs()
        .times(mark_price_current_i)
        .times(cur.imr);

      return acc.plus(imr_pending);
    }, new Big(0));

    const othersIm = positions.rows.reduce((acc, cur) => {
      const mark_price_current_i = markPrices.find(
        (m) => m.symbol === cur.symbol
      ).price;

      if (cur.symbol === symbol.symbol) return acc;

      const pendingLong = cur.pending_long_qty;
      const pendingShort = Math.abs(cur.pending_short_qty);

      const positionQty = cur.position_qty;

      const value =
        mark_price_current_i *
        Math.max(pendingLong + positionQty, pendingShort - positionQty);

      const im = new Big(value).abs().times(cur.imr);

      return acc.plus(im);
    }, new Big(0));

    const account_max_leverage = userInfo.max_leverage;

    const total_side = order_side.times(cur_side);

    const newOrderSize = collateral
      .minus(othersIm.plus(curIm.times(total_side)))
      .times(account_max_leverage)
      .div(mark_price_current_i)
      .times(0.995);

    const res = newOrderSize.toFixed(tickToPrecision(symbol.base_tick));

    return Number(res);
  } catch (error) {
    console.log('error: ', error);
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
    const float = getPositionFloat(positions, markPrices);

    const unsettlePnl = positions.rows.reduce((acc, cur) => {
      return acc.plus(cur.unsettled_pnl);
    }, new Big(0));

    return unsettlePnl.plus(float);
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
  getAvailable,
  getTotalEst,
};
