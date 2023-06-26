import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router';
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
import { ONLY_ZEROS, toReadableNumber } from '../utils/numbers';
import BigNumber from 'bignumber.js';
import { getDCLTopBinFee } from '../services/indexer';
import { list_pools } from '../services/swapV3';
import { WRAP_NEAR_CONTRACT_ID } from '../services/wrap-near';
import Big from 'big.js';

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

            try {
              const topBinFee = await getDCLTopBinFee({
                pool_id: p.pool_id,
                slot_number: 100,
              });

              if (!topBinFee || ONLY_ZEROS.test(topBinFee.total_liquidity)) {
                p.top_bin_apr = '0';
                p.top_bin_apr_display = '-';
              } else {
                const apr = new Big(topBinFee.total_fee)
                  .div(topBinFee.total_liquidity)
                  .mul(365)
                  .toFixed(2);
                p.top_bin_apr = apr;
                p.top_bin_apr_display = apr + '%';
              }
            } catch (error) {}
            return p;
          })
        );
      })
      .then(setAllPools);
  }, [tokenPriceList]);
  return allPools;
};

export const useDclPoolIdByUrl = () => {
  const [pool_id, set_pool_id] = useState<string>();
  const location = useLocation();
  const hash = location.hash;
  useEffect(() => {
    get_all_dcl_pools_by_url();
  }, [hash]);

  async function get_all_dcl_pools_by_url() {
    const dcl_pools: PoolInfo[] = await list_pools();
    const [urlTokenIn, urlTokenOut] = decodeURIComponent(
      location.hash.slice(1)
    ).split('|');
    const url_token_in =
      urlTokenIn == 'near' ? WRAP_NEAR_CONTRACT_ID : urlTokenIn;
    const url_token_out =
      urlTokenOut == 'near' ? WRAP_NEAR_CONTRACT_ID : urlTokenOut;
    const target: PoolInfo = dcl_pools.find((pool: PoolInfo) => {
      const { token_x, token_y } = pool;
      return (
        (url_token_in == token_x && url_token_out == token_y) ||
        (url_token_in == token_y && url_token_out == token_x)
      );
    });
    if (target) {
      set_pool_id(target.pool_id);
    } else {
      set_pool_id('');
    }
  }

  return pool_id;
};
