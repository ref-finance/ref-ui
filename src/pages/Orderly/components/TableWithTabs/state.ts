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
    fetch(`${getOrderlyConfig().OFF_CHAIN_END_POINT}/v1/public/info`)
      .then((res) => {
        res.json().then((data) => {
          setAvailableSymbols(data.data.rows);
        });
      })
      .catch((e) => {
        setAvailableSymbols([
          {
            created_time: 1575441595650, // Unix epoch time in milliseconds
            updated_time: 1575441595650, // Unix epoch time in milliseconds
            symbol: 'SPOT_BTC_USDT',
            quote_min: 100,
            quote_max: 100000,
            quote_tick: 0.01,
            base_min: 0.0001,
            base_max: 20,
            base_tick: 0.0001,
            min_notional: 0.02,
            price_range: 0.99,
          },
        ]);
      });
  }, []);

  return availableSymbols;
}

export function useOrderBook({
  symbol,
  openSig,
}: {
  symbol: string;
  openSig: any[];
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
