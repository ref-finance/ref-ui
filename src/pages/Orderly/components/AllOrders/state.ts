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
            symbol: 'PERP_BTC_USDC',
            quote_min: 0,
            quote_max: 100000,
            quote_tick: 0.1,
            base_min: 0.00001,
            base_max: 20,
            base_tick: 0.00001,
            min_notional: 1,
            price_range: 0.02,
            price_scope: 0.4,
            std_liquidation_fee: 0.03,
            liquidator_fee: 0.015,
            claim_insurance_fund_discount: 0.0075,
            funding_period: 8,
            cap_funding: 0.000375,
            floor_funding: -0.000375,
            interest_rate: 0.0001,
            created_time: 1684140107326,
            updated_time: 1685345968053,
            imr_factor: 0.0000002512,
            base_mmr: 0.05,
            base_imr: 0.1,
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
