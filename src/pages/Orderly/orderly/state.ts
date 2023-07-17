import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import {
  Trade,
  TokenInfo,
  MyOrder,
  MarketTrade,
  Orders,
  PositionsType,
  ClientInfo,
  LiquidationType,
  SymbolInfo,
} from './type';
import {
  getMarketTrades,
  getOrderlyPublic,
  getOpenOrders,
  getAllOrders,
  getAccountInformation,
} from './off-chain-api';

import { checkStorageDeposit } from './api';
import {
  is_orderly_key_announced,
  is_trading_key_set,
  user_account_exists,
} from './on-chain-api';
import { useWalletSelector } from '../../../context/WalletSelectorContext';
import { useOrderlyContext } from './OrderlyContext';
import {
  getLiquidationHistory,
  getUserAllPositions,
  updateLeverage,
} from './perp-off-chain-api';
import _, { set } from 'lodash';
import {
  normalFailToast,
  normalSuccessToast,
} from '../../../components/layout/transactionTipPopUp';
import { useBatchTokenMetaFromSymbols } from '../components/ChartHeader/state';
import { parseSymbol } from '../components/RecentTrade';

export function useMarketTrades({
  symbol,
  limit,
}: {
  symbol: string;
  limit: number;
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
  }, [setFunc]);

  return { trades, setTrades };
}

export function usePendingOrders({
  refreshingTag,
  validAccountSig,
}: {
  refreshingTag: boolean;
  validAccountSig: boolean;
}) {
  const [liveOrders, setLiveOrders] = useState<MyOrder[]>([]);

  const { accountId } = useWalletSelector();

  const setFunc = useCallback(async () => {
    if (accountId === null || !validAccountSig) return;
    try {
      const pendingOrders = await getOpenOrders({
        accountId,
      });

      setLiveOrders(pendingOrders.data.rows);
    } catch (error) {}
  }, [refreshingTag, validAccountSig]);

  useEffect(() => {
    setFunc();
  }, [refreshingTag, setFunc]);

  return liveOrders;
}

export function useAllOrdersSymbol({
  symbol,
  refreshingTag,
  validAccountSig,
}: {
  symbol: string;
  refreshingTag: boolean;
  validAccountSig: boolean;
}) {
  const [liveOrders, setLiveOrders] = useState<MyOrder[]>();

  const { accountId } = useWalletSelector();

  const setFunc = useCallback(async () => {
    if (accountId === null || !validAccountSig) return;
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
  }, [refreshingTag, symbol, validAccountSig]);

  useEffect(() => {
    setFunc();
  }, [refreshingTag, symbol, setFunc]);

  return liveOrders;
}

export function useAllOrders({
  refreshingTag,
  type,
}: {
  refreshingTag: boolean;
  type?: 'SPOT' | 'PERP';
}) {
  const [liveOrders, setLiveOrders] = useState<MyOrder[]>();

  const { accountId } = useWalletSelector();
  const { validAccountSig } = useOrderlyContext();

  const setFunc = useCallback(async () => {
    if (accountId === null || !validAccountSig) return;
    try {
      const allOrders = await getAllOrders({
        accountId,
        OrderProps: {
          size: 200,
          broker_id: 'ref_dex',
        },
      });

      setLiveOrders(allOrders);
    } catch (error) {}
  }, [refreshingTag, validAccountSig]);

  useEffect(() => {
    setFunc();
  }, [refreshingTag, setFunc]);

  return liveOrders?.filter((o) => o.symbol.indexOf(type || 'SPOT') > -1);
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
    if (!accountId) return;

    checkStorageDeposit(accountId).then(setStorageEnough);
  }, [accountId]);

  return storageEnough;
}

export function useOrderlySystemAvailable() {
  const [systemAvailable, setSystemAvailable] = useState<boolean>(undefined);

  useEffect(() => {
    getOrderlyPublic('/v1/public/system_info').then((res) => {
      const status = res?.data?.status;
      setSystemAvailable(status === 0);
    });
  }, []);

  return systemAvailable;
}

export function useAccountExist() {
  const [userExist, setUserExist] = useState<boolean>();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!accountId) {
      return;
    }

    user_account_exists(accountId).then(setUserExist);
  }, [accountId]);

  return userExist;
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

export function useAllPositions(refreshingTag: boolean[]) {
  const { accountId } = useWalletSelector();

  const [positions, setPositions] = useState<PositionsType>();

  useEffect(() => {
    if (!accountId) return;

    getUserAllPositions(accountId).then((res) => {
      setPositions(res.data);
    });
  }, [accountId, ...refreshingTag]);

  return {
    positions,
    setPositions,
  };
}

export function useLeverage() {
  const { accountId } = useWalletSelector();

  const [error, setError] = useState<Error>();

  const { futureLeverage, userInfo, setUserInfo } = useOrderlyContext();

  const { validAccountSig } = useOrderlyContext();

  const [curLeverage, setCurLeverage] = useState<number>();

  const [changeTrigger, setChangeTrigger] = useState<boolean>();

  useEffect(() => {
    if (!!curLeverage) return;
    if (userInfo) {
      setCurLeverage(userInfo.max_leverage);
    }
  }, [userInfo]);

  const requestLeverage = async () => {
    getAccountInformation({ accountId }).then((res) => {
      if (!!res) {
        setUserInfo(res);
        setCurLeverage(res.max_leverage);
      }
    });
  };

  const changeLeverage = useCallback(
    async (curLeverage: number, userInfo: ClientInfo) => {
      const updateRes = await updateLeverage({
        accountId,
        leverage: curLeverage as any,
      });

      console.log('updateRes: ', updateRes);

      if (!updateRes.success) {
        setCurLeverage(userInfo?.max_leverage);
        setChangeTrigger(undefined);
        console.log('userInfo: ', userInfo);
        // setError(updateRes.message);

        return normalFailToast(updateRes.message, 3000);
      }

      setError(null);

      await requestLeverage();
    },
    []
  );

  const changeLeverageDebounce = useCallback(
    _.debounce(changeLeverage, 500),
    []
  );

  useEffect(() => {
    if (futureLeverage !== undefined) {
      setCurLeverage(futureLeverage);
      userInfo.max_leverage = futureLeverage;
    }
  }, [futureLeverage]);

  // useEffect(() => {
  //   if (!accountId || !validAccountSig ||) return;
  //   console.log('requestLeverage: ');

  //   requestLeverage();
  // }, [accountId, validAccountSig, userInfo]);

  useEffect(() => {
    if (curLeverage === undefined) return;
    console.log('changeTrigger: ', changeTrigger);

    if (typeof changeTrigger === 'undefined') return;

    changeLeverageDebounce(curLeverage, userInfo);
  }, [changeTrigger]);

  return {
    userInfo,
    curLeverage,
    error,
    setCurLeverageRaw: setCurLeverage,
    setCurLeverage: (leverage: number) => {
      setCurLeverage(leverage);
      setChangeTrigger(!changeTrigger);
    },
  };
}

export function useLiquidationHistoryAll() {
  const [res, setRes] = useState<{
    records: LiquidationType[];
    loadingDone: boolean;
    curPage: number;
    total: number;
  }>();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!accountId) return;

    const allDone = res?.loadingDone;
    if (allDone) return;

    getLiquidationHistory({
      accountId,
      HistoryParam: {
        page: res?.curPage + 1 || 1,
      },
    }).then((response) => {
      const data = response.data;
      const { rows } = data;
      const { meta } = data;
      const finalrecords = [...(res?.records || []), ...rows];

      const restemp = {
        records: finalrecords,
        loadingDone: finalrecords.length === meta.total,
        curPage: meta.current_page,
        total: meta.total,
      };
      setRes(restemp);
    });
  }, [accountId, res]);

  const allDone = res?.loadingDone;

  return !allDone ? undefined : res?.records;
}
