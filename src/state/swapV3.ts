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
import { getStorageTokenId } from '../components/swap/swap';
import { wrapTokenId } from '../components/swap/LimitOrderCard';
import getConfigV2 from '../services/configV2';
const configV2 = getConfigV2();

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

export const useAllPoolsV2 = (forPool?: boolean) => {
  // todo
  const [allPools, setAllPools] = useState<PoolInfo[]>();

  const tokenPriceList = useTokenPriceList();

  useEffect(() => {
    if (!tokenPriceList) return;

    listPools()
      .then((list: PoolInfo[]) => {
        let final = list;
        if (forPool) {
          final = list.filter(
            (p) =>
              !configV2.BLACK_LIST_DCL_POOL_IDS_IN_POOLS.includes(p.pool_id)
          );
        } else {
          final = list.filter((p) =>
            configV2.WHITE_LIST_DCL_POOL_IDS_IN_LIMIT_ORDERS.includes(p.pool_id)
          );
        }
        return Promise.all(
          final.map(async (p) => {
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

export const useDclPoolIdByCondition = (source?: 'all' | 'url' | 'local') => {
  const [pool_id, set_pool_id] = useState<string>();
  const location = useLocation();
  const hash = location.hash;
  useEffect(() => {
    get_dcl_pool_by_Ids();
  }, [hash]);
  const [in_id, out_id] = getStorageTokenId();

  async function get_dcl_pool_by_Ids() {
    const dcl_pools: PoolInfo[] = await list_pools();
    const [urlTokenIn, urlTokenOut] = decodeURIComponent(
      location.hash.slice(1)
    ).split('|');
    let url_token_in: string;
    let url_token_out: string;
    if (source == 'all') {
      url_token_in = urlTokenIn || in_id;
      url_token_out = urlTokenOut || out_id;
    } else if (source == 'local') {
      url_token_in = in_id;
      url_token_out = out_id;
    } else {
      url_token_in = urlTokenIn;
      url_token_out = urlTokenOut;
    }
    url_token_in = wrapTokenId(url_token_in);
    url_token_out = wrapTokenId(url_token_out);
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
