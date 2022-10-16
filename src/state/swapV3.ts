import React, { useState, useEffect, useContext } from 'react';
import {
  UserOrderInfo,
  list_active_orders,
  list_history_orders,
  PoolInfoV3,
  PoolInfo,
  listPools,
} from '../services/swapV3';
import { WalletContext } from '../utils/wallets-integration';
import { useTokenPriceList } from './token';
import { ftGetTokenMetadata } from '../services/ft-contract';
import { toReadableNumber } from '../utils/numbers';

export const useMyOrders = () => {
  const [activeOrder, setActiveOrder] = useState<UserOrderInfo[]>();
  const [historyOrder, setHistoryOrder] = useState<UserOrderInfo[]>();

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    if (!isSignedIn) return;

    list_active_orders().then(setActiveOrder);
    list_history_orders().then(setHistoryOrder);
  }, [isSignedIn]);

  return {
    activeOrder,
    historyOrder,
  };
};

export const useAllPoolsV2 = () => {
  const [allPools, setAllPools] = useState<PoolInfo[]>();

  const tokenPriceList = useTokenPriceList();

  useEffect(() => {
    if (!tokenPriceList) return;

    listPools()
      .then((list: PoolInfo[]) => {
        return Promise.all(
          list.map(async (p) => {
            const token_x = p.token_x;
            const token_y = p.token_y;

            p.token_x_metadata = await ftGetTokenMetadata(token_x);
            p.token_y_metadata = await ftGetTokenMetadata(token_y);

            const pricex = tokenPriceList[token_x]?.price || 0;
            const pricey = tokenPriceList[token_y]?.price || 0;

            console.log(pricex, pricey);

            const tvlx =
              Number(toReadableNumber(p.token_x_metadata.decimals, p.total_x)) *
              Number(pricex);
            const tvly =
              Number(toReadableNumber(p.token_y_metadata.decimals, p.total_y)) *
              Number(pricey);

            p.tvl = tvlx + tvly;

            return p;
          })
        );
      })
      .then(setAllPools);
  }, [tokenPriceList]);
  return allPools;
};
