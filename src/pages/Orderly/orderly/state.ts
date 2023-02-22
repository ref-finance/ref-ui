import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Trade, TokenInfo, MyOrder, MarketTrade, Orders } from './type';
import {
  getMarketTrades,
  getOrderlyPublic,
  getOpenOrders,
  getAllOrders,
} from './off-chain-api';

import { checkStorageDeposit } from './api';
import { is_orderly_key_announced, is_trading_key_set } from './on-chain-api';
import { useWalletSelector } from '../../../context/WalletSelectorContext';

export function useMarketTrades({
  symbol,
  limit,
  marketTrade,
}: {
  symbol: string;
  limit: number;
  marketTrade: MarketTrade | undefined;
}) {
  const [trades, setTrades] = useState<Trade[]>();

  const setFunc = useCallback(async () => {
    try {
      const res = await getMarketTrades({ symbol, limit });
      setTrades(res?.data?.rows);
    } catch (error) {}
  }, [symbol, limit]);

  useEffect(() => {
    setFunc();
  }, [setFunc, marketTrade]);

  return trades;
}

export function usePendingOrders({
  symbol,
  refreshingTag,
}: {
  symbol: string;
  refreshingTag: boolean;
}) {
  const [liveOrders, setLiveOrders] = useState<MyOrder[]>([]);

  const { accountId } = useWalletSelector();

  const setFunc = useCallback(async () => {
    if (accountId === null) return;
    try {
      const pendingOrders = await getOpenOrders({
        accountId,
      });

      setLiveOrders(pendingOrders.data.rows);
    } catch (error) {}
  }, [refreshingTag, symbol]);

  useEffect(() => {
    setFunc();
  }, [refreshingTag, symbol, setFunc]);

  return liveOrders.filter((o) => o.symbol === symbol);
}

export function useAllOrdersSymbol({
  symbol,
  refreshingTag,
}: {
  symbol: string;
  refreshingTag: boolean;
}) {
  const [liveOrders, setLiveOrders] = useState<MyOrder[]>();

  const { accountId } = useWalletSelector();

  const setFunc = useCallback(async () => {
    if (accountId === null) return;
    try {
      const allOrders = await getAllOrders({
        accountId,
        OrderProps: {
          size: 200,
          symbol,
        },
      });

      setLiveOrders(allOrders);
    } catch (error) {}
  }, [refreshingTag, symbol]);

  useEffect(() => {
    setFunc();
  }, [refreshingTag, symbol, setFunc]);

  return liveOrders;
}

export function useAllOrders({ refreshingTag }: { refreshingTag: boolean }) {
  const [liveOrders, setLiveOrders] = useState<MyOrder[]>();

  const { accountId } = useWalletSelector();

  const setFunc = useCallback(async () => {
    if (accountId === null) return;
    try {
      const allOrders = await getAllOrders({
        accountId,
        OrderProps: {
          size: 200,
        },
      });

      setLiveOrders(allOrders);
    } catch (error) {}
  }, [refreshingTag]);

  useEffect(() => {
    setFunc();
  }, [refreshingTag, setFunc]);

  return liveOrders;
}

export function useTokenInfo() {
  const [tokenInfo, setTokenInfo] = useState<TokenInfo[]>();

  useEffect(() => {
    getOrderlyPublic('/v1/public/token').then((res) => {
      setTokenInfo(res?.data?.rows);
    });
  }, []);

  return tokenInfo;
}

export function useStorageEnough() {
  const { accountId } = useWalletSelector();

  const [storageEnough, setStorageEnough] = useState<boolean | undefined>(
    undefined
  );

  useEffect(() => {
    if (!accountId) setStorageEnough(false);
    else {
      checkStorageDeposit(accountId).then(setStorageEnough);
    }
  }, [accountId]);

  return storageEnough;
}

export function useOrderlyRegistered() {
  const { accountId } = useWalletSelector();

  const [registered, setRegistered] = useState<{
    key_announce: boolean;
    trading_key_set: boolean;
  }>({
    key_announce: false,
    trading_key_set: false,
  });

  useEffect(() => {
    if (!accountId) return;
    is_orderly_key_announced(accountId)
      .then((key_announce) => {
        return key_announce;
      })
      .then((key_announce) => {
        is_trading_key_set(accountId).then((trading_key_set) => {
          setRegistered({
            key_announce,
            trading_key_set,
          });
        });
      });
  }, [accountId]);

  return registered;
}
