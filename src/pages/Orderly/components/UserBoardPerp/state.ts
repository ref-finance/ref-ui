import React, { useEffect, useMemo, useState } from 'react';
import { nearMetadata, getFTmetadata, ftGetBalance } from '../../near';
import { toReadableNumber } from '../../orderly/utils';
import { Holding, TokenInfo, TokenMetadata, MyOrder } from '../../orderly/type';

import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { OrderAsset, useOrderlyPortfolioAssets } from '../AssetModal/state';
import Big from 'big.js';
import {
  getFreeCollateral,
  getMaintenanceMarginRatio,
  getMarginRatio,
  getTotalCollateral,
  getTotaluPnl,
  getPortfolioTotaluPnl,
  getUnsettle,
  getPortfolioUnsettle,
  getNotional,
  getAvailable,
  getTotalEst,
  getLqPriceFloat,
  getCollateralTokenAvailableBalance,
} from './math';
import { parseSymbol } from '../RecentTrade';
import {
  useLeverage,
  useTokenInfo,
} from '../../../../pages/Orderly/orderly/state';

export function useTokenBalance(tokenId: string | undefined, deps?: any) {
  const [tokenMeta, setTokenMeta] = useState<TokenMetadata>();
  const [walletBalance, setWalletBalance] = useState<string>('');

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!tokenId) return;

    getFTmetadata(tokenId).then((meta) => {
      setTokenMeta(meta);
    });
  }, [tokenId, deps]);

  useEffect(() => {
    if (!tokenId || !accountId) return;

    getFTmetadata(tokenId)
      .then((meta) => {
        return meta;
      })
      .then((tokenMeta) => {
        ftGetBalance(tokenMeta?.id).then((balance) => {
          setWalletBalance(toReadableNumber(tokenMeta.decimals, balance));
        });
      });
  }, [tokenId, tokenMeta?.id, deps, accountId]);

  return !tokenMeta || !tokenId ? '0' : walletBalance;
}

interface TokenWithDecimals {
  id: string;
  decimals: number;
}

interface BalanceType {
  meta: TokenMetadata;
  holding: number;
  wallet_balance: string;
  id: string;
  name: string;
  'in-order': number;
}

export function usePerpData(deps?: {
  displayBalances?: OrderAsset[];
  markMode?: boolean;
}) {
  const { displayBalances, markMode } = deps || {};
  const {
    symbol,
    balances,
    balanceTimeStamp,
    positions,
    markPrices,
    positionPush,
    positionTimeStamp,
    everyTickers,
    holdings,
    availableSymbols,
    setPositionTrigger,
  } = useOrderlyContext();

  const newPositions = useMemo(() => {
    try {
      let calcPositions = positions.rows.map((item) => {
        const push = positionPush?.find((i) => i.symbol === item.symbol);

        if (push && positionTimeStamp > positions.timestamp) {
          const qty = push.positionQty;
          const pendingLong = push.pendingLongQty;
          const pendingShort = push.pendingShortQty;

          return {
            ...item,
            ...push,
            position_qty: push.positionQty,
            pending_long_qty: push.pendingLongQty,
            pending_short_qty: push.pendingShortQty,
            unsettled_pnl: push.unsettledPnl,
            mark_price: push.markPrice,
            average_open_price: push.averageOpenPrice,
            mmr: push.mmr,
            imr: push.imr,
            est_liq_price: push.estLiqPrice,
            timestamp: Date.now(),
            IMR_withdraw_orders: push.imrwithOrders,
            MMR_with_orders: push.mmrwithOrders,
            last_sum_unitary_funding: push.lastSumUnitaryFunding,
            pnl_24_h: push.pnl24H,
            fee_24_h: push.fee24H,
            cost_position: push.costPosition,
            settle_price: push.settlePrice,
            display_est_liq_price: push.estLiqPrice,
          };
        } else {
          return {
            ...item,

            display_est_liq_price: item.est_liq_price,
          };
        }
      });

      const pushSymbols = positionPush?.map((p) => p.symbol) || [];

      const positionSymbols = positions.rows.map((p) => p.symbol);

      const diffSymbols = pushSymbols.filter(
        (p) => !positionSymbols.includes(p)
      );

      if (diffSymbols && diffSymbols.length > 0) {
        setPositionTrigger((b) => !b);

        diffSymbols.forEach((s) => {
          const item = positionPush?.find((p) => p.symbol === s);

          if (item) {
            calcPositions.push({
              ...item,
              position_qty: item.positionQty,
              pending_long_qty: item.pendingLongQty,
              pending_short_qty: item.pendingShortQty,
              unsettled_pnl: item.unsettledPnl,
              mark_price: item.markPrice,
              average_open_price: item.averageOpenPrice,
              mmr: item.mmr,
              imr: item.imr,
              est_liq_price: item.estLiqPrice,
              timestamp: Date.now(),
              IMR_withdraw_orders: item.imrwithOrders,
              MMR_with_orders: item.mmrwithOrders,
              last_sum_unitary_funding: item.lastSumUnitaryFunding,
              pnl_24_h: item.pnl24H,
              fee_24_h: item.fee24H,
              cost_position: item.costPosition,
              settle_price: item.settlePrice,
              display_est_liq_price: item.estLiqPrice,
            });
          }
        });
      }

      positions.rows = calcPositions;

      return {
        ...positions,
        rows: calcPositions,
      };
    } catch (error) {
      return null;
    }
  }, [positions, markPrices, positionPush, positionTimeStamp]);

  const noPosition = newPositions?.rows?.length === 0;

  const { symbolTo } = parseSymbol(symbol);

  const { userInfo, curLeverage, error, setCurLeverage, setCurLeverageRaw } =
    useLeverage();

  const curHoldingOut = useMemo(() => {
    try {
      const holding = holdings?.find((h) => h.token === symbolTo);

      const balance = balances[symbolTo];

      if (balance) {
        holding.holding = balance.holding;

        holding.pending_short = balance.pendingShortQty;
      }

      return holding;
    } catch (error) {
      return undefined;
    }
  }, [balances, holdings]);

  const totalCollateral = useMemo(() => {
    try {
      if (!curHoldingOut) return '0';

      const res = getTotalCollateral(newPositions, markPrices, curHoldingOut);

      return res.toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [curHoldingOut, markPrices, newPositions, positionPush, noPosition]);

  const freeCollateral = useMemo(() => {
    try {
      if (!curHoldingOut) return '0';

      return getFreeCollateral(
        newPositions,
        markPrices,
        userInfo,
        curHoldingOut
      ).toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [newPositions, markPrices, userInfo, curHoldingOut]);

  const collateralTokenAvailableBalance = useMemo(() => {
    try {
      if (!curHoldingOut) return '0';

      return getCollateralTokenAvailableBalance(
        newPositions,
        markPrices,
        userInfo,
        curHoldingOut
      ).toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [newPositions, markPrices, userInfo, curHoldingOut]);

  const totaluPnl = useMemo(() => {
    try {
      return getTotaluPnl(newPositions, markPrices);
    } catch (error) {
      return null;
    }
  }, [newPositions, markPrices]);

  const totalPortfoliouPnl = useMemo(() => {
    try {
      return getPortfolioTotaluPnl(
        newPositions,
        markPrices,
        everyTickers,
        markMode
      );
    } catch (error) {
      return null;
    }
  }, [newPositions, markPrices, everyTickers, markMode]);

  const totalDailyReal = useMemo(() => {
    try {
      return newPositions.rows
        .reduce((acc, cur) => {
          return acc.plus(cur.pnl_24_h);
        }, new Big(0))
        .toFixed(2);
    } catch (error) {
      return null;
    }
  }, [newPositions]);

  const totalNotional = useMemo(() => {
    try {
      return getNotional(newPositions, markPrices);
    } catch (error) {
      return null;
    }
  }, [newPositions, markPrices]);

  const marginRatio = useMemo(() => {
    {
      try {
        const ratio = getMarginRatio(markPrices, newPositions, curHoldingOut);

        return Number(ratio);
      } catch (error) {
        return '-';
      }
    }
  }, [markPrices, newPositions, totaluPnl]);

  const accountCurLeverage =
    marginRatio === '-'
      ? '-'
      : marginRatio === 10
      ? new Big(0).toFixed(2)
      : new Big(1).div(marginRatio).toFixed(2, 3);

  const unsettle = useMemo(() => {
    try {
      const res = getUnsettle(newPositions, markPrices);

      return res.toFixed();
    } catch (error) {
      return '-';
    }
  }, [newPositions, markPrices]);

  const portfolioUnsettle = useMemo(() => {
    try {
      const res = getPortfolioUnsettle(newPositions, markPrices);

      return res === '-' ? res : res.toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [newPositions, markPrices]);

  const mmr = useMemo(() => {
    if (!newPositions) return '-';

    if (newPositions.rows.every((r) => r.position_qty === 0)) {
      return '3.00%';
    }

    const curSymbol = availableSymbols?.find((item) => item.symbol === symbol);

    return getMaintenanceMarginRatio(
      newPositions,
      markPrices,
      userInfo,
      availableSymbols,
      curSymbol
    );
  }, [newPositions, markPrices, freeCollateral, availableSymbols]);

  const triggerBalanceBasedData = useMemo(
    () => balanceTimeStamp,
    [balanceTimeStamp]
  );

  const triggerPositionBasedData = useMemo(
    () => positionTimeStamp,
    [positionTimeStamp]
  );

  const lastPrices = useMemo(() => {
    return everyTickers?.map(({ symbol, close }) => ({ symbol, close }));
  }, [everyTickers]);

  const totalEst = useMemo(() => {
    try {
      return getTotalEst(
        newPositions,
        markPrices,
        displayBalances,
        curLeverage
      );
    } catch (error) {
      return null;
    }
  }, [newPositions, markPrices, displayBalances]);

  const totalAvailable = useMemo(() => {
    try {
      return getAvailable(newPositions, markPrices, displayBalances);
    } catch (error) {
      return null;
    }
  }, [newPositions, markPrices, displayBalances]);

  newPositions?.rows?.forEach((r) => {
    const cur_lq_price = r.est_liq_price;

    const cur_mark_price =
      markPrices?.find((item) => item.symbol === r.symbol)?.price || 0;

    if (typeof cur_lq_price === 'number' && cur_lq_price > 0) {
      const symbol = availableSymbols?.find((item) => item.symbol === r.symbol);

      const lq_price_float = getLqPriceFloat(
        markPrices,
        symbol,
        newPositions,
        curHoldingOut,
        userInfo,
        availableSymbols
      );

      r.display_est_liq_price = Math.max(0, lq_price_float);

      if (r.display_est_liq_price > cur_mark_price * 10) {
        r.display_est_liq_price = 0;
      }
    } else {
      r.display_est_liq_price = cur_lq_price;
    }
  });

  return {
    totalCollateral,
    freeCollateral,
    totaluPnl,
    totalPortfoliouPnl,
    totalDailyReal,
    totalNotional,
    marginRatio,
    unsettle,
    portfolioUnsettle,
    mmr,
    newPositions,
    triggerBalanceBasedData,
    triggerPositionBasedData,
    markPrices,
    lastPrices,
    curLeverage,
    error,
    setCurLeverage,
    setCurLeverageRaw,
    userInfo,
    totalAvailable,
    totalEst,
    holdings,
    accountCurLeverage,
    collateralTokenAvailableBalance,
  };
}
