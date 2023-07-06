import {
  PositionPushType,
  PositionsType,
  SymbolInfo,
} from '~pages/Orderly/orderly/type';
import Big from 'big.js';
import { numberWithCommas } from '~pages/Orderly/utiles';
import { numberWithCommasPadding } from '../../utiles';
import { toPrecision } from '~pages/Orderly/near';
import {
  MarkPrice,
  Holding,
  ClientInfo,
  MyOrder,
  Ticker,
} from '../../orderly/type';

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

  return numberWithCommas(pnl.toFixed(4));
};

const getTotaluPnlABS = (positions: PositionsType, markprices: MarkPrice[]) => {
  if (!positions) return new Big(0);

  const pnl = positions.rows.reduce(
    (acc, cur, index) => {
      const markPrice =
        markprices?.find((item) => item.symbol === cur.symbol)?.price || 0;

      const value =
        (markPrice - cur.mark_price) * cur.position_qty + cur.unsettled_pnl;

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
  const totaluPnl = getTotaluPnlABS(positions, markprices);

  const total_collatetal = new Big(
    curHoldingOut.holding + curHoldingOut.pending_short
  ).plus(totaluPnl || 0);

  return total_collatetal;
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

  if (freeCollateral.lt(0)) {
    return '0';
  }

  return freeCollateral.toFixed(4);
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

  const total_collatetal = getTotalCollateral(
    positions,
    markPrices,
    curHoldingOut
  );

  console.log('total_collatetal: ', total_collatetal.toFixed(6));

  const ratio = total_collatetal.div(notionalValue).toFixed(6);

  return ratio;
};

const getMaxQuantity = () => {};

const getLqPrice = (
  markPrices: MarkPrice[],
  symbol: SymbolInfo,
  positions: PositionsType,
  curHoldingOut: Holding,
  cur_amount: string
) => {
  try {
    // TODO: fix calculation
    const markPrice =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    const total_collateral_value = getTotalCollateral(
      positions,
      markPrices,
      curHoldingOut
    );

    const cur_notional = new Big(cur_amount).mul(markPrice);

    const total_notional = getTotalnotional(markPrices, positions);

    //
    const MMR = positions.rows.reduce(
      (acc, cur) => {
        const mark_price =
          markPrices.find((item) => item.symbol === cur.symbol)?.price || 0;

        const position_national = Math.abs(cur.position_qty) * mark_price;

        const value = new Big(position_national)
          .mul(cur.mmr)
          .div(total_notional);

        return value.plus(acc);
      },

      new Big(0)
    );

    console.log('MMR: ', MMR.toFixed(6));

    const curPosition = positions.rows.find(
      (item) => item.symbol === symbol.symbol
    );

    const liquidation_price_cur = new Big(markPrice).plus(
      total_collateral_value
        .minus(total_notional.plus(cur_notional).mul(MMR))
        .div(
          new Big(curPosition.position_qty + Number(cur_amount))
            .abs()
            .mul(new Big(curPosition.mmr))
            .minus(curPosition.position_qty + Number(cur_amount))
        )
    );

    console.log('liquidation_price_cur: ', liquidation_price_cur.toFixed(6));

    return liquidation_price_cur.lte(0)
      ? '-'
      : liquidation_price_cur.toFixed(tickToPrecision(symbol.quote_tick));
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

export {
  getTotaluPnl,
  getRiskLevel,
  getMarginRatio,
  getTotalCollateral,
  getFreeCollateral,
  leverageMap,
  getMaxQuantity,
  tickToPrecision,
  getLqPrice,
};
