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

// export const getMaxQuantity = ({
//   symbol,
//   side,
//   reduceOnly,
// }: {
//   symbol: string;
//   side: SideType;
//   reduceOnly?: boolean;
// }): number => {
//   const state = store.getState();
//   const { futuresRelatedValues, futuresPositions, currentPosition } =
//     getFuturesState({ symbol });

//   if (reduceOnly) {
//     if (currentPosition?.holding) {
//       if (side === SideType.BUY) {
//         return Decimal.min(currentPosition.holding, 0).abs().toNumber();
//       }
//       return Decimal.max(currentPosition.holding, 0).toNumber();
//     }
//     return 0;
//   }

//   if (!futuresRelatedValues.futuresTotalCollateral) {
//     return 0;
//   }

//   const currentTicker = getCurrentTicker({ symbol });
//   if (!currentTicker) {
//     return 0;
//   }

//   // console.time('getMaxQuantity(time):');
//   const markPrice = currentTicker?.markPrice || 0;
//   const leverage = state.global.accountInfo.futuresLeverage;
//   if (!leverage) {
//     return 0;
//   }
//   const othersPositions = futuresPositions.filter((p) => p.symbol !== symbol);
//   const params = {
//     futuresAdjustedCollateral: futuresRelatedValues.futuresAdjustedCollateral,
//     totalIM: futuresRelatedValues.futuresTotalIM || 0,
//     othersIM: new Decimal(futuresRelatedValues.futuresTotalIM || 0)
//       .minus(currentPosition.initialMargin || 0)
//       .toNumber(),
//     leverage,
//     markPrice,
//     side,
//     symbol,
//     futuresMarginFactor: 0,
//     currentPosition,
//     othersPositions,
//   };
//   const result = calcMaxSize(params);

//   return result;
// };

// const calcMaxSize = (params: CalcMaxSizeParams): number => {
//   const futuresAdjustedCollateral = new Decimal(params.futuresAdjustedCollateral);
//   const totalIM = new Decimal(params.totalIM);
//   const othersIM = new Decimal(params.othersIM);
//   const { side } = params;
//   const { currentPosition, othersPositions } = params;
//   if (futuresAdjustedCollateral.lt(totalIM)) {
//       //          max_buy_size = if(side >= 0, 0, holdingsize + pendingsell- pendingbuysize )
//       //          max_sell_size = if(side >= 0, holdingsize + pendingbuysize - pendingsellsize , 0)
//       const holding = new Decimal(currentPosition.holding);
//       if ((side === SideType.BUY && holding.gte(0)) || (side === SideType.SELL && holding.lt(0))) {
//           return 0;
//       }

//       if (side === SideType.BUY) {
//           return Decimal.max(holding.abs().minus(currentPosition.pendingLongQty), 0).toNumber();
//       }
//       const pendingShortQty = new Decimal(currentPosition.pendingShortQty).abs().mul(-1);
//       return Decimal.max(holding.plus(pendingShortQty), 0).toNumber();
//   }
//   const { markPrice, symbol, futuresMarginFactor, leverage } = params;
//   const newOrderSize = new Decimal(futuresAdjustedCollateral).minus(othersIM).mul(leverage).dividedBy(markPrice);
//   const order = {
//       side,
//       symbol,
//       size: newOrderSize.toNumber(),
//   };

//   const { afterTradeIM } = calcAfterTrade({
//       order,
//       currentPosition,
//       leverage,
//       markPrice,
//       futuresMarginFactor,
//   });
//   const othersTotal = calcTotal({ futuresPositions: othersPositions });
//   const newTotalIM = othersTotal.IM.plus(afterTradeIM);

//   let others;
//   if (side === SideType.BUY) {
//       // max_buy_size = neworder.size*0.995 - side*holding_size - pendingbuy_size
//       others = new Decimal(-1).mul(currentPosition.holding).minus(currentPosition.pendingLongQty);
//   } else {
//       // max_sell_size = neworder.size *0.995 + side*holding_size - pendingsell_size
//       others = new Decimal(currentPosition.holding).minus(currentPosition.pendingShortQty);
//   }
//   let result;
//   if (futuresAdjustedCollateral.toDecimalPlaces(10).gte(newTotalIM.toDecimalPlaces(10))) {
//       result = newOrderSize.mul(0.995).plus(others);
//   } else {
//       const iteratorSize = leverageIterator(params);
//       result = new Decimal(iteratorSize).plus(others);
//   }
//   return Decimal.max(result, 0).toNumber();
// };

// function getEstLiqPriceWithOrder(side: SideType, size: number) {
//   const order = { symbol, side, size };
//   const result = futuresService.getEstLiqPriceWithOrder({ order, price });
//   if (result?.gt(0) && result.gt(markPrice.times(0.01)) && result.lt(markPrice.times(10))) {
//       return result.toFixed(symbolInfo.basePriceDecimal);
//   }
//   return '--';
// }

// export const getEstLiqPriceWithOrder = (params: { order: OrderParams; price: string }): BigNumber | null => {
// const { order } = params;
// const { symbol } = order;
// const { futuresRelatedValues, currentPosition } = getFuturesState({ symbol });
// if (!futuresRelatedValues.futuresTotalCollateral) {
//   return null;
// }
// const holding = new BigNumber(currentPosition.holding);
// const orderSize = new BigNumber(order.size);
// const orderSide = order.side === SideType.BUY ? 1 : -1;
// const currentTicker = getCurrentTicker({ symbol });
// const markPrice = new BigNumber(currentTicker?.markPrice || 0);
// const futuresTotalCollateral = new BigNumber(futuresRelatedValues.futuresTotalCollateral);

// /*
//   order.qty: +ve for long, -ve for short
//   position.qty: +ve for long, -ve for short, 0 if no position
//   total.qty = order.qty + position.qty

//   long-est.LP= price - (total_collateral - total_MM) / size / (1- real-MMR )
//   short-est.LP= price + (total_collateral - total_MM) / size / (1+ real-MMR )
//   简化后
//   est.liq.price = price - side * (total_collateral - total_MM) / size / (1- side * real-MMR )
// */
// const totalQty = orderSize.multipliedBy(orderSide).plus(holding);
// if (totalQty.eq(0)) {
//   // close position
//   return null;
// }
// const totalSide = new BigNumber(totalQty.gt(0) ? 1 : -1);
// const totalSize = totalQty.abs();
// const priceNumber = new BigNumber(params.price);
// const totalNational = totalSize.times(markPrice).toNumber();
// const { asset } = store.getState();
// const { symbolRealMMR, symbolMM } = FuturesUtils.getFuturesSymbolMM(symbol, totalNational, { asset });
// const initialSymbolMM = currentPosition.maintenanceMargin ?? 0;
// const newTotalMM = new BigNumber(futuresRelatedValues.futuresTotalMM).minus(initialSymbolMM).plus(symbolMM);

// // (1- side * real-MMR )
// const lastOption = new BigNumber(1).minus(totalSide.multipliedBy(symbolRealMMR));
// const rightOption = totalSide.multipliedBy(futuresTotalCollateral.minus(newTotalMM)).dividedBy(totalSize).dividedBy(lastOption);
// const estLiqPrice = priceNumber.minus(rightOption);
// return BigNumber.max(estLiqPrice, 0);
// };

export {
  getTotaluPnl,
  getRiskLevel,
  getMarginRatio,
  getTotalCollateral,
  getFreeCollateral,
  leverageMap,
  // getMaxQuantity,
  tickToPrecision,
  getLqPrice,
};
