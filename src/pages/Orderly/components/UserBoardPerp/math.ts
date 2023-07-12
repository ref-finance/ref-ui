import { PositionPushType, PositionsType } from '~pages/Orderly/orderly/type';
import Big from 'big.js';
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
  cur_amount: string,
  side: 'Buy' | 'Sell',
  orderType: 'Market' | 'Limit',
  limitPrice: string,
  availableSymbols: SymbolInfo[]
) => {
  try {
    // TODO: fix calculation

    const markPrice =
      markPrices.find((item) => item.symbol === symbol.symbol)?.price || 0;

    // OK
    const futuresTotalMM = positions.rows.reduce(
      (acc, cur) => {
        const symbol = availableSymbols.find((s) => s.symbol === cur.symbol);

        const mark_price =
          markPrices.find((item) => item.symbol === cur.symbol)?.price || 0;

        const notional =
          Math.abs(
            cur.position_qty + cur.pending_long_qty + cur.pending_short_qty
          ) * mark_price;

        const { symbolMM } = getFutureSymbolMM(symbol, notional);

        return new Big(symbolMM).plus(acc);
      },

      new Big(0)
    );

    //  OK
    const orderSide = side === 'Buy' ? 1 : -1;

    const curPosition = positions.rows.find(
      (item) => item.symbol === symbol.symbol
    );

    //  OK
    const futuresTotalCollateral = getTotalCollateral(
      positions,
      markPrices,
      curHoldingOut
    );

    // OK
    const holding = new Big(
      curPosition.position_qty +
        curPosition.pending_long_qty +
        curPosition.pending_short_qty
    );

    //  OK
    const orderSize = new Big(cur_amount);

    //  OK

    // OK
    const totalQty = new Big(orderSize).mul(orderSide).plus(holding);

    // OK
    const totalSide = new Big(totalQty.gt(0) ? 1 : -1);

    // OK
    const totalSize = totalQty.abs();

    // OK
    const priceNumber = new Big(markPrice);

    //OK
    const totalNational = totalSize.mul(markPrice).toNumber();

    // ??
    const { symbolMM, symbolRealMMR } = getFutureSymbolMM(
      symbol,
      totalNational
    );

    // console.log('symbolRealMMR: ', symbolRealMMR.toFixed(5));

    // OK
    const { symbolMM: initialSymbolMM } = getFutureSymbolMM(
      symbol,
      holding.abs().toNumber() * markPrice
    );

    // OK
    const newTotalMM = new Big(futuresTotalMM)
      .minus(initialSymbolMM)
      .plus(symbolMM);

    // OK
    const lastOption = new Big(1).minus(totalSide.mul(symbolRealMMR));

    // OK
    const rightOption = totalSide
      .mul(futuresTotalCollateral.minus(newTotalMM))
      .div(totalSize)
      .div(lastOption);

    // OK
    const estLiqPrice = priceNumber.minus(rightOption);

    return estLiqPrice.toFixed(6);
  } catch (error) {
    console.log('error: ', error);
    return '-';
  }
};

const getFutureSymbolMM = (symbol: SymbolInfo, holdingNotional: number) => {
  if (holdingNotional <= 0)
    return {
      symbolMM: 0,
      symbolRealMMR: 0,
    };

  const IMRFactori = symbol.imr_factor ?? 0;

  const baseMMRi = symbol.base_mmr ?? 0;

  const baseIMRi = symbol.base_imr ?? 0;

  const firstOption = new Big(baseMMRi);

  const base = new Big(holdingNotional).abs();
  const basePow4 = base.pow(4); // Calculate base to the power of 4
  const numberBasePow4 = Number(basePow4.toString()); // Convert Big to a number
  const basePow4Over5 = Math.pow(numberBasePow4, 1 / 5); // Calculate the fifth root

  // Convert back to Big
  const finalResult = new Big(basePow4Over5);

  const secondOption = new Big(baseMMRi)
    .div(baseIMRi)
    .mul(IMRFactori)
    .mul(finalResult);

  const realMMR = new Big(firstOption).gt(secondOption)
    ? firstOption
    : secondOption;

  const symbolMM = new Big(realMMR).mul(new Big(holdingNotional));

  return {
    symbolMM,
    symbolRealMMR: realMMR,
  };
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
// const orderSide = order.side === 'Buy' ? 1 : -1;
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
//       if (side === 'Buy') {
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
//       if ((side === 'Buy' && holding.gte(0)) || (side === ''Sell'' && holding.lt(0))) {
//           return 0;
//       }

//       if (side === 'Buy') {
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
//   if (side === 'Buy') {
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
// const orderSide = order.side === 'Buy' ? 1 : -1;
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

// const getFuturesSymbolMM = (
//   position: FuturesPositionRawInterface,
//   holdingNotional: number,
//   currentSymbolInfo: SymbolInfo
// ): { symbolMM: number; symbolRealMMR: number } => {
//   // symbol.i_MM=symbol.i_holding_notional*real_MMR
//   if (holdingNotional > 0) {
//     // MMR i = Max(Base MMR i, (Base MMR i / Base IMR i) * IMR Factor i * Abs(Position Notional i)^(4/5))
//     const currentSymbolInfo = global.symbolsInfo.find(
//       (i) => i.symbol === position.symbol
//     );
//     const imrFactor = currentSymbolInfo?.IMRFactor ?? 0;
//     const realMMR = BigNumber.max(
//       new BigNumber(currentSymbolInfo?.baseMMR ?? 0),
//       new BigNumber(currentSymbolInfo?.baseMMR ?? 0)
//         .div(new BigNumber(currentSymbolInfo?.baseIMR ?? 0))
//         .times(new BigNumber(imrFactor))
//         .times(
//           new Decimal(holdingNotional)
//             .abs()
//             .toPower(4 / 5)
//             .toNumber()
//         )
//     ).toNumber();

//     return {
//       symbolMM: new BigNumber(holdingNotional).times(realMMR).toNumber(),
//       symbolRealMMR: realMMR,
//     };
//   }

//   return {
//     symbolMM: 0,
//     symbolRealMMR: 0,
//   };
// };

const getMaxQuantity = (
  symbol: SymbolInfo,
  side: 'Buy' | 'Sell',
  positions: PositionsType,
  markPrices: MarkPrice[],
  userInfo: ClientInfo,
  curHoldingOut: Holding,
  availableSymbols: SymbolInfo[]
) => {
  try {
    const markPrice = markPrices.find((p) => p.symbol === symbol.symbol);

    const leverage = userInfo.max_leverage;

    const futuresTotalIM = positions.rows.reduce(
      (acc, cur) => {
        const symbol = availableSymbols.find((s) => s.symbol === cur.symbol);

        const mark_price =
          markPrices.find((item) => item.symbol === cur.symbol)?.price || 0;

        const IM =
          Math.abs(
            cur.position_qty + cur.pending_long_qty + cur.pending_short_qty
          ) *
          mark_price *
          cur.imr;

        return new Big(IM).plus(acc);
      },

      new Big(0)
    );

    const currentPosition = positions.rows.find(
      (r) => r.symbol === symbol.symbol
    );

    const othersPositions = positions.rows.filter((r) => {
      return r.symbol !== symbol.symbol;
    });

    const futuresAdjustedCollateral = getFreeCollateral(
      positions,
      markPrices,
      userInfo,
      curHoldingOut
    );

    const curPositionIM = Math.abs(
      currentPosition.position_qty +
        currentPosition.pending_long_qty +
        currentPosition.pending_short_qty
    );

    const othersIM = futuresTotalIM.minus(curPositionIM).toNumber();

    const curPosition = {
      ...currentPosition,
      holding: new Big(
        currentPosition.position_qty +
          currentPosition.pending_long_qty +
          currentPosition.pending_short_qty
      ),
      pendingShortQty: currentPosition.pending_short_qty,
      pendingLongQty: currentPosition.pending_short_qty,
    };

    const params = {
      futuresAdjustedCollateral,
      totalIM: futuresTotalIM,
      othersIM,
      leverage,
      markPrice: markPrice.price,
      side,
      symbol: symbol.symbol,
      futuresMarginFactor: 0,
      currentPosition: curPosition,
      othersPositions,
    };
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
  try {
    const unsettle = positions.rows.reduce((acc, cur) => {
      const cur_mark_price = markPrices.find(
        (m) => m.symbol === cur.symbol
      ).price;

      const float = cur.position_qty * (cur_mark_price - cur.mark_price);

      return acc.plus(cur.unsettled_pnl + float);
    }, new Big(0));

    return unsettle.toFixed(2);
  } catch (error) {
    return '-';
  }
};

// const calcMaxSize = (params: CalcMaxSizeParams): number => {
//   const futuresAdjustedCollateral = new Big(params.futuresAdjustedCollateral);
//   const totalIM = new Big(params.totalIM);
//   const othersIM = new Big(params.othersIM);
//   const { side } = params;
//   const { currentPosition, othersPositions } = params;
//   if (futuresAdjustedCollateral.lt(totalIM)) {
//     //          max_buy_size = if(side >= 0, 0, holdingsize + pendingsell- pendingbuysize )
//     //          max_sell_size = if(side >= 0, holdingsize + pendingbuysize - pendingsellsize , 0)
//     const holding = new Big(currentPosition.holding);
//     if (
//       (side === 'Buy' && holding.gte(0)) ||
//       (side === 'Sell' && holding.lt(0))
//     ) {
//       return 0;
//     }

//     if (side === 'Buy') {
//       return Decimal.max(
//         holding.abs().minus(currentPosition.pendingLongQty),
//         0
//       ).toNumber();
//     }
//     const pendingShortQty = new Big(currentPosition.pendingShortQty)
//       .abs()
//       .mul(-1);
//     return Decimal.max(holding.plus(pendingShortQty), 0).toNumber();
//   }
//   const { markPrice, symbol, futuresMarginFactor, leverage } = params;
//   const newOrderSize = new Big(futuresAdjustedCollateral)
//     .minus(othersIM)
//     .mul(leverage)
//     .div(markPrice);
//   const order = {
//     side,
//     symbol,
//     size: newOrderSize.toNumber(),
//   };

//   const { afterTradeIM } = calcAfterTrade({
//     order,
//     currentPosition,
//     leverage,
//     markPrice,
//     futuresMarginFactor,
//   });
//   const othersTotal = calcTotal({ futuresPositions: othersPositions });
//   const newTotalIM = othersTotal.IM.plus(afterTradeIM);

//   let others;
//   if (side === 'Buy') {
//     // max_buy_size = neworder.size*0.995 - side*holding_size - pendingbuy_size
//     others = new Big(-1)
//       .mul(currentPosition.holding)
//       .minus(currentPosition.pendingLongQty);
//   } else {
//     // max_sell_size = neworder.size *0.995 + side*holding_size - pendingsell_size
//     others = new Big(currentPosition.holding).minus(
//       currentPosition.pendingShortQty
//     );
//   }
//   let result;
//   if (
//     futuresAdjustedCollateral
//       .toDecimalPlaces(10)
//       .gte(newTotalIM.toDecimalPlaces(10))
//   ) {
//     result = newOrderSize.mul(0.995).plus(others);
//   } else {
//     const iteratorSize = leverageIterator(params);
//     result = new Big(iteratorSize).plus(others);
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
  getUnsettle,
};
