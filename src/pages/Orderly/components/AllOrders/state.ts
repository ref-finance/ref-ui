import React, { useState, useEffect } from 'react';
import { SymbolInfo, Holding } from '../../orderly/type';
import { getOrderlyConfig } from '../../config';

import { RequestOrder } from '../../orderly/type';
import { getOrderBook, getCurrentHolding } from '../../orderly/off-chain-api';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { useOrderlyContext } from '../../orderly/OrderlyContext';

export function useAllSymbolInfo() {
  const [availableSymbols, setAvailableSymbols] = useState<SymbolInfo[]>();
  useEffect(() => {
    fetch(`${getOrderlyConfig().OFF_CHAIN_END_POINT}/v1/public/info`).then(
      (res) => {
        res.json().then((data) => {
          setAvailableSymbols(data.data.rows);
        });
      }
    );
  }, []);

  return availableSymbols;
}

export function useOrderBook({
  symbol,
  openSig,
}: {
  symbol: string;
  openSig: boolean[];
}) {
  const [orderBook, setOrderBook] = useState<RequestOrder>();
  const { accountId } = useWalletSelector();
  useEffect(() => {
    if (openSig.every((s) => !s)) return;
    getOrderBook({
      accountId,
      symbol,
    }).then((res) => {
      setOrderBook(res.data);
    });
  }, [...openSig, symbol]);
  return orderBook;
}

export function useCurHoldings() {
  const [holdings, setHoldings] = useState<Holding[]>();

  const { myPendingOrdersRefreshing, validAccountSig } = useOrderlyContext();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    getCurrentHolding({ accountId }).then((res) => {
      setHoldings(res.data.holding);
    });
  }, [accountId, myPendingOrdersRefreshing, validAccountSig]);

  return holdings;
}
