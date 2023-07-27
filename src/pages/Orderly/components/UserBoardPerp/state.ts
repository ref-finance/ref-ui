import React, { useEffect, useMemo, useState } from 'react';
import { nearMetadata, getFTmetadata, ftGetBalance } from '../../near';
import { toReadableNumber } from '../../orderly/utils';
import { Holding, TokenInfo, TokenMetadata, MyOrder } from '../../orderly/type';
import {
  getCurrentHolding,
  getPortfolioAllOrders,
} from '../../orderly/off-chain-api';
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
} from './math';
import { parseSymbol } from '../RecentTrade';
import { useLeverage, useTokenInfo } from '~pages/Orderly/orderly/state';

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

// export function useTokensBalances(
//   tokens: TokenWithDecimals[] | undefined,
//   tokenInfo: TokenInfo[] | undefined,
//   trigger: any,
//   freeCollateral: string
// ) {
//   const [showbalances, setShowBalances] = useState<BalanceType[]>([]);

//   const { accountId } = useWalletSelector();

//   const { myPendingOrdersRefreshing, validAccountSig } = useOrderlyContext();
//   const getBalanceAndMeta = async (token: TokenWithDecimals) => {
//     const balance = await ftGetBalance(token.id).then((balance) => {
//       return toReadableNumber(token.decimals, balance);
//     });

//     const meta = await getFTmetadata(token.id);

//     return {
//       balance,
//       meta,
//     };
//   };

//   useEffect(() => {
//     if (!tokens || !tokenInfo || !accountId || !validAccountSig) return;

//     Promise.all(
//       tokenInfo.map((t) =>
//         getBalanceAndMeta({
//           id: t.token_account_id,
//           decimals: t.decimals,
//         })
//       )
//     )
//       .then((balances) => {
//         const showbalances = balances.map((b, i) => {
//           const wallet_balance = b.balance;

//           return {
//             meta: b.meta,
//             wallet_balance,
//             id: tokenInfo[i].token_account_id,
//             name: tokenInfo[i].token,
//           };
//         });

//         return showbalances;
//       })
//       .then(async (res) => {
//         const response = await getCurrentHolding({ accountId });

//         const holdings = response?.data?.holding as Holding[];

//         const resMap = res.reduce(
//           (acc, cur) => {
//             const id = cur.id;

//             const holding = holdings?.find(
//               (h: Holding) => h.token === cur.name
//             );
//             const displayHolding = holding
//               ? Number(
//                   new Big(holding.holding + holding.pending_short).toFixed(
//                     Math.min(8, cur.meta.decimals || 9),
//                     0
//                   )
//                 )
//               : 0;

//             acc[id] = {
//               ...cur,
//               holding: displayHolding,
//               'in-order': holding?.pending_short || 0,
//             };
//             return acc;
//           },
//           {} as {
//             [key: string]: BalanceType;
//           }
//         );

//         setShowBalances(Object.values(resMap));
//       });
//   }, [
//     tokens?.map((t) => t.id).join('|'),
//     tokenInfo,
//     accountId,
//     trigger,
//     myPendingOrdersRefreshing,
//     validAccountSig,
//   ]);

//   if (showbalances.length > 0 && freeCollateral !== '-') {
//     showbalances.forEach((sb) => {
//       if (sb.name === 'USDC') {
//         sb.holding = Number(freeCollateral);
//       }
//     });
//   }

//   return showbalances;
// }

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
  } = useOrderlyContext();

  const newPositions = useMemo(() => {
    try {
      const calcPositions = positions.rows.map((item) => {
        const push = positionPush?.find((i) => i.symbol === item.symbol);

        if (push) {
          const qty = push.positionQty;
          const pendingLong = push.pendingLongQty;
          const pendingShort = push.pendingShortQty;

          return {
            ...item,
            ...push,
            position_qty: qty,
            pending_long_qty: pendingLong,
            pending_short_qty: pendingShort,
            unsettled_pnl: push.unsettledPnl,
            mark_price: push.markPrice,
            average_open_price: push.averageOpenPrice,
            mmr: push.mmr,
            imr: push.imr,
            est_liq_price: push.estLiqPrice,
          };
        } else {
          return item;
        }
      });

      positions.rows = calcPositions;

      return {
        ...positions,

        rows: calcPositions,
      };
    } catch (error) {
      return null;
    }
  }, [positionPush, positions, markPrices]);

  const { accountId, modal, selector } = useWalletSelector();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

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
      const res = getTotalCollateral(positions, markPrices);

      return res.toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [curHoldingOut, markPrices, positions, positionPush]);

  const freeCollateral = useMemo(() => {
    try {
      return getFreeCollateral(positions, markPrices, userInfo).toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [positions, markPrices, userInfo, positionPush]);

  const totaluPnl = useMemo(() => {
    try {
      return getTotaluPnl(positions, markPrices);
    } catch (error) {
      return null;
    }
  }, [positions, markPrices]);

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
      return newPositions.total_pnl_24_h?.toFixed(2);
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
        const ratio = getMarginRatio(markPrices, positions, curHoldingOut);

        return Number(ratio);
      } catch (error) {
        return '-';
      }
    }
  }, [markPrices, positions, totaluPnl]);

  const unsettle = useMemo(() => {
    try {
      const res = getUnsettle(positions, markPrices);

      return res.toFixed();
    } catch (error) {
      return '-';
    }
  }, [positions, markPrices]);

  const portfolioUnsettle = useMemo(() => {
    try {
      const res = getPortfolioUnsettle(newPositions, markPrices);

      return res === '-' ? res : res.toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [newPositions, markPrices]);

  const mmr = useMemo(() => {
    if (!positions) return '-';

    if (positions.rows.every((r) => r.position_qty === 0)) {
      return '3.00%';
    }

    return getMaintenanceMarginRatio(positions, markPrices);
  }, [positions, markPrices, freeCollateral]);

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

  const perpOrders = useMemo(() => {
    return;
  }, [newPositions]);

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
  };
}
