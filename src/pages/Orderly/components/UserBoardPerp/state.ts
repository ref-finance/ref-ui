import React, { useEffect, useMemo, useState } from 'react';
import { nearMetadata, getFTmetadata, ftGetBalance } from '../../near';
import { toReadableNumber } from '../../orderly/utils';
import { Holding, TokenInfo, TokenMetadata } from '../../orderly/type';
import { getCurrentHolding } from '../../orderly/off-chain-api';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
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
  getNotional
} from './math';
import { parseSymbol } from '../RecentTrade';
import { useLeverage } from '~pages/Orderly/orderly/state';

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

export function useTokensBalances(
  tokens: TokenWithDecimals[] | undefined,
  tokenInfo: TokenInfo[] | undefined,
  trigger?: any
) {
  const [showbalances, setShowBalances] = useState<BalanceType[]>([]);

  const { accountId } = useWalletSelector();

  const { myPendingOrdersRefreshing, validAccountSig } = useOrderlyContext();
  const { freeCollateral } = usePerpData();
  const getBalanceAndMeta = async (token: TokenWithDecimals) => {
    const balance = await ftGetBalance(token.id).then((balance) => {
      return toReadableNumber(token.decimals, balance);
    });

    const meta = await getFTmetadata(token.id);

    return {
      balance,
      meta,
    };
  };

  useEffect(() => {
    if (!tokens || !tokenInfo || !accountId || !validAccountSig) return;

    Promise.all(
      tokenInfo.map((t) =>
        getBalanceAndMeta({
          id: t.token_account_id,
          decimals: t.decimals,
        })
      )
    )
      .then((balances) => {
        const showbalances = balances.map((b, i) => {
          const wallet_balance = b.balance;

          return {
            meta: b.meta,
            wallet_balance,
            id: tokenInfo[i].token_account_id,
            name: tokenInfo[i].token,
          };
        });

        return showbalances;
      })
      .then(async (res) => {
        const response = await getCurrentHolding({ accountId });

        const holdings = response?.data?.holding as Holding[];

        const resMap = res.reduce(
          (acc, cur) => {
            const id = cur.id;

            const holding = holdings?.find(
              (h: Holding) => h.token === cur.name
            );
            const displayHolding = holding
              ? Number(
                  new Big(holding.holding + holding.pending_short).toFixed(
                    Math.min(8, cur.meta.decimals || 9),
                    0
                  )
                )
              : 0;

            acc[id] = {
              ...cur,
              holding: displayHolding,
              'in-order': holding?.pending_short || 0,
            };
            return acc;
          },
          {} as {
            [key: string]: BalanceType;
          }
        );

        setShowBalances(Object.values(resMap));
      });
  }, [
    tokens?.map((t) => t.id).join('|'),
    tokenInfo,
    accountId,
    trigger,
    myPendingOrdersRefreshing,
    validAccountSig,
  ]);

  useEffect(() => {
    if (showbalances.length === 0 || freeCollateral === '-') return;

    showbalances.forEach((sb) => {
      if (sb.name === 'USDC') {
        sb.holding = Number(freeCollateral);
      }
    });
  }, [showbalances, freeCollateral]);

  return showbalances;
}

export function usePerpData() {
  const {
    symbol,
    orders,
    tokenInfo,
    storageEnough,
    balances,
    balanceTimeStamp,
    setValidAccountSig,
    handlePendingOrderRefreshing,
    validAccountSig,
    myPendingOrdersRefreshing,
    bridgePrice,
    userExist,
    positions,
    markPrices,
    positionPush,
    positionTimeStamp,
    ticker,
    futureLeverage,
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
  }, [positionPush, positions]);

  const [holdings, setHoldings] = useState<Holding[]>();

  const { accountId, modal, selector } = useWalletSelector();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const {
    userInfo,
    setRequestTrigger,
    curLeverage,
    setCurLeverage,
    setCurLeverageRaw,
  } = useLeverage();

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);
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
      const res = getTotalCollateral(newPositions, markPrices);

      return res.toFixed(2);
    } catch (error) {
      return '-';
    }
  }, [curHoldingOut, markPrices, newPositions, positionPush]);

  const freeCollateral = useMemo(() => {
    try {
      return getFreeCollateral(
        newPositions,
        markPrices,
        userInfo,
        curHoldingOut
      );
    } catch (error) {
      return '-';
    }
  }, [newPositions, markPrices, userInfo, positionPush]);

  const totaluPnl = useMemo(() => {
    try {
      return getTotaluPnl(newPositions, markPrices);
    } catch (error) {
      return null;
    }
  }, [newPositions, markPrices]);

  const totalPortfoliouPnl = useMemo(() => {
    try {
      return getPortfolioTotaluPnl(newPositions, markPrices);
    } catch (error) {
      return null;
    }
  }, [newPositions, markPrices]);

  const totalDailyReal = useMemo(() => {
    try {
      return newPositions.total_pnl_24_h?.toFixed(0);
    } catch (error) {
      return null;
    }
  }, [newPositions]);

  const totalNotional = useMemo(() => {
    try {
      return getNotional(newPositions);
    } catch (error) {
      return null;
    }
  }, [newPositions]);

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

  const unsettle = useMemo(
    () => getUnsettle(newPositions, markPrices),
    [newPositions, markPrices]
  );

  const portfolioUnsettle = useMemo(
    () => getPortfolioUnsettle(newPositions, markPrices),
    [newPositions, markPrices]
  );

  const mmr = useMemo(() => {
    return getMaintenanceMarginRatio(newPositions, markPrices);
  }, [newPositions, markPrices]);

  const triggerBalanceBasedData = useMemo(
    () => balanceTimeStamp,
    [balanceTimeStamp]
  );

  const triggerPositionBasedData = useMemo(
    () => positionTimeStamp,
    [positionTimeStamp]
  );

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
    triggerPositionBasedData
  };
}
