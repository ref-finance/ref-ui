import React, { useState, useEffect, useContext } from 'react';
import {
  UserOrderInfo,
  list_active_orders,
  list_history_orders,
  PoolInfo,
  listPools,
} from '../services/swapV3';
import { WalletContext } from '../utils/wallets-integration';
import { useTokenPriceList } from './token';
import { ftGetTokenMetadata } from '../services/ft-contract';
import { toReadableNumber } from '../utils/numbers';
import BigNumber from 'bignumber.js';

export const useMyOrders = () => {
  const [activeOrder, setActiveOrder] = useState<UserOrderInfo[]>();
  const [historyOrder, setHistoryOrder] = useState<UserOrderInfo[]>();
  const [activeOrderDone, setActiveOrderDone] = useState<boolean>(false);

  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  useEffect(() => {
    if (!isSignedIn) return;

    list_active_orders().then((res) => {
      setActiveOrder(res);
      setActiveOrderDone(true);
    });
    list_history_orders().then(setHistoryOrder);
  }, [isSignedIn]);

  return {
    activeOrder,
    historyOrder,
    activeOrderDone,
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
            const {
              total_x,
              total_y,
              total_fee_x_charged,
              total_fee_y_charged,
            } = p;
            const totalX = new BigNumber(total_x)
              .minus(total_fee_x_charged)
              .toFixed();
            const totalY = new BigNumber(total_y)
              .minus(total_fee_y_charged)
              .toFixed();
            const tvlx =
              Number(toReadableNumber(p.token_x_metadata.decimals, totalX)) *
              Number(pricex);
            const tvly =
              Number(toReadableNumber(p.token_y_metadata.decimals, totalY)) *
              Number(pricey);

            p.tvl = tvlx + tvly;
            p.tvlUnreal = Object.keys(tokenPriceList).length === 0;

            return p;
          })
        );
      })
      .then(setAllPools);
  }, [tokenPriceList]);
  return allPools;
};
