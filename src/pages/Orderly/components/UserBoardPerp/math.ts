import {
  PositionPushType,
  PositionsType,
} from '../../../../pages/Orderly/orderly/type';
import Big from 'big.js';

import BigNumber from 'bignumber.js';

import { numberWithCommas } from '../../../../pages/Orderly/utiles';

import { SymbolInfo } from '../../orderly/type';
import {
  MarkPrice,
  Holding,
  ClientInfo,
  MyOrder,
  Ticker,
} from '../../orderly/type';
import { OrderAsset } from '../AssetModal/state';
import Decimal from 'decimal.js';
import getConfigV2 from '../../../../services/configV2';
const configV2 = getConfigV2();

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

  const available = displayBalances.reduce((acc, cur, index) => {
    const markPrice =
      markPrices?.find(
        (item) => item.symbol === `SPOT_${cur.tokenMeta.symbol}_USDC.e`
      )?.price || 1;

    const value =
      cur.tokenMeta.id == configV2.ORDRRBOOK_COLLATTERAL_TOKEN
        ? parseFloat(cur.available)
        : parseFloat(cur.available) * markPrice;

    const total = value;

    return new Big(total).plus(acc);
  }, new Big(0));

  return numberWithCommas(available.toFixed(2));
};

const getTotalEst = (
  positions: PositionsType,
  markPrices: MarkPrice[],
  displayBalances: OrderAsset[],
  curLeverage: number
) => {
  if (!displayBalances || !positions || !markPrices || !curLeverage) return '0';

  const availables = displayBalances.reduce((acc, cur, index) => {
    const markPrice =
      markPrices?.find(
        (item) => item.symbol === `SPOT_${cur.tokenMeta.symbol}_USDC.e`
      )?.price || 1;

    const value =
      cur.tokenMeta.id == configV2.ORDRRBOOK_COLLATTERAL_TOKEN
        ? parseFloat(cur.available)
        : parseFloat(cur.available) * markPrice;
    const inOrder =
      cur.tokenMeta.id == configV2.ORDRRBOOK_COLLATTERAL_TOKEN
        ? parseFloat(cur['in-order'])
        : parseFloat(cur['in-order']) * markPrice;

    const total = value + inOrder;

    return new Big(total).plus(acc);
  }, new Big(0));

  const futures = positions.rows.reduce(
    (acc, cur, index) => {
      const { position_qty, pending_long_qty, pending_short_qty } = cur;
      const markPrice =
        markPrices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      let quantity = position_qty;

      if (position_qty > 0) {
        if (
          position_qty + pending_long_qty >
          Math.abs(position_qty + pending_short_qty)
        ) {
          quantity = position_qty + pending_long_qty;
        } else {
          quantity = Math.abs(position_qty + pending_short_qty);
        }
      } else {
        if (
          Math.abs(position_qty + pending_short_qty) >
          position_qty + pending_long_qty
        ) {
          quantity = Math.abs(position_qty + pending_short_qty);
        } else {
          quantity = position_qty + pending_long_qty;
        }
      }

      const value = Math.abs((markPrice * quantity) / curLeverage);

      return new Big(value).plus(acc);
    },

    new Big(0)
  );

  const totalEst = new Big(futures).plus(availables);

  return totalEst;
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

const getOthersPositionFloat = (
  positions: PositionsType,
  markprices: MarkPrice[],
  curSymbol: SymbolInfo
) => {
  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      if (cur.symbol === curSymbol.symbol) return acc;

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
  markprices: MarkPrice[],
  curHoldingOut: Holding
) => {
  const unsettle = getUnsettle(positions, markprices);

  const total_collateral_value = new Big(
    curHoldingOut.holding + curHoldingOut.pending_short
  ).plus(unsettle);

  return total_collateral_value;
};

const getTotalCollateralStatic = (
  positions: PositionsType,
  markprices: MarkPrice[],
  curHoldingOut: Holding
) => {
  const unsettle = getUnsettleStatic(positions, markprices);

  const total_collateral_value = new Big(
    curHoldingOut.holding + curHoldingOut.pending_short
  ).plus(unsettle);

  return total_collateral_value;
};

const getFreeCollateral = (
  positions: PositionsType,
  markprices: MarkPrice[],
  userInfo: ClientInfo,
  curHoldingOut: Holding
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

  const totalCollateral = getTotalCollateral(
    positions,
    markprices,
    curHoldingOut
  );

  const freeCollateral = new Big(totalCollateral).minus(new Big(pendinguPnl));

  return freeCollateral;
};
function getCollateralTokenAvailableBalance(
  positions: PositionsType,
  markprices: MarkPrice[],
  userInfo: ClientInfo,
  curHoldingOut: Holding
) {
  const freeCollateral = getFreeCollateral(
    positions,
    markprices,
    userInfo,
    curHoldingOut
  );
  const balance = new Big(curHoldingOut.holding + curHoldingOut.pending_short);
  if (balance.lt(freeCollateral)) {
    return balance;
  } else {
    return freeCollateral;
  }
}

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

  const total_collatetal = getTotalCollateral(
    positions,
    markPrices,
    curHoldingOut
  );

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
  // const { symbolFrom } = parseSymbol(symbol.symbol);
  const symbolFrom = symbol.symbol;
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

const getLqPriceFloat = (
  markPrices: MarkPrice[],
  symbol: SymbolInfo,
  positions: PositionsType,
  curHoldingOut: Holding,
  userInfo: ClientInfo,
  availableSymbols: SymbolInfo[]
) => {
  try {
    const othersFloat = getOthersPositionFloat(positions, markPrices, symbol);

    const total_collateral_value = getTotalCollateralStatic(
      positions,
      markPrices,
      curHoldingOut
    ).plus(othersFloat);

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

    const cur_position = positions.rows.find((r) => r.symbol === symbol.symbol);

    const new_Qi = new Big(cur_position?.position_qty || 0);

    const new_Qi_abs = new_Qi.abs();

    const position_notional = new_Qi_abs
      .times(cur_position.mark_price)
      .toNumber();

    const mmr_i = getMMR(symbol, userInfo, position_notional);

    const denominator = new Big(new_Qi_abs).times(new Big(mmr_i)).minus(new_Qi);

    const numerator = new Big(total_collateral_value)
      .minus(total_mm)
      .minus(new Big(position_notional).times(mmr_i));

    const result = new Big(cur_position.mark_price).plus(
      numerator.div(denominator)
    );

    return result.lte(0) ? 0 : result.toNumber();
  } catch (error) {
    return 0;
  }
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
    const mark_price =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    const total_collateral_value = getTotalCollateral(
      positions,
      markPrices,
      curHoldingOut
    );

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

    const cur_position = positions.rows.find((r) => r.symbol === symbol.symbol);

    const orderSize = new Big(side === 'Buy' ? 1 : -1).times(
      new Big(cur_amount)
    );

    const new_Qi = orderSize.plus(new Big(cur_position?.position_qty || 0));

    const new_Qi_abs = new_Qi.abs();

    const position_notional = new_Qi_abs.times(mark_price).toNumber();

    const mmr_i = getMMR(symbol, userInfo, position_notional);

    const denominator = new Big(new_Qi_abs).times(new Big(mmr_i)).minus(new_Qi);

    const numerator = new Big(total_collateral_value)
      .minus(total_mm)
      .minus(new Big(position_notional).times(mmr_i));

    const result = new Big(priceNumber).plus(numerator.div(denominator));

    return result.lte(0)
      ? '-'
      : result.toFixed(tickToPrecision(symbol.quote_tick));
  } catch (error) {
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
  curHoldingOut: Holding
) => {
  try {
    const cur_position = positions.rows.find((r) => r.symbol === symbol.symbol);

    const free_collateral = getFreeCollateral(
      positions,
      markPrices,
      userInfo,
      curHoldingOut
    );

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

    const collateral = getTotalCollateral(positions, markPrices, curHoldingOut);

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
    return '-';
  }
};

const getUnsettle = (positions: PositionsType, markPrices: MarkPrice[]) => {
  const float = getPositionFloat(positions, markPrices);

  const unsettle = positions.rows.reduce((acc, cur) => {
    return acc.plus(cur.unsettled_pnl);
  }, new Big(0));

  return unsettle.plus(float);
};

const getUnsettleStatic = (
  positions: PositionsType,
  markPrices: MarkPrice[]
) => {
  const unsettle = positions.rows.reduce((acc, cur) => {
    return acc.plus(cur.unsettled_pnl);
  }, new Big(0));

  return unsettle;
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
  markPrices: MarkPrice[],
  userInfo: ClientInfo,
  availableSymbols: SymbolInfo[],
  curSymbol: SymbolInfo
) => {
  try {
    const total_mm = positions.rows.reduce((acc, cur) => {
      const cur_mark_price =
        markPrices.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value = new Big(cur_mark_price).times(cur.position_qty).abs();

      const position_notional = value.toNumber();

      const cur_symbol = availableSymbols.find((s) => s.symbol === cur.symbol);

      const cur_mmr = getMMR(cur_symbol, userInfo, position_notional);

      const mm = new Big(cur_mmr).times(position_notional);

      return acc.plus(mm);
    }, new Big(0));

    const total_notional_value = getTotalnotional(markPrices, positions);

    const mmr = total_mm.div(total_notional_value).toNumber();

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
  getLqPriceFloat,
  getCollateralTokenAvailableBalance,
};
