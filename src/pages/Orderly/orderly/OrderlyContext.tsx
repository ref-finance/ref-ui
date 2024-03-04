import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import _, { orderBy, sortBy, filter } from 'lodash';
import { useWalletSelector } from '../../../context/WalletSelectorContext';
import { isNewHostName } from '../../../services/config';
import {
  useAllSymbolInfo,
  useCurHoldings,
} from '../components/AllOrders/state';
import { PerpOrSpot } from '../utiles';
import { getAccountInformation, getOrderlySystemInfo } from './off-chain-api';
import { useOrderlyMarketData, useOrderlyPrivateData } from './off-chain-ws';
import {
  useAccountExist,
  useAllOrders,
  useAllPositions,
  useOrderlySystemAvailable,
} from './state';
import { useStorageEnough, useTokenInfo } from './state';
import {
  ClientInfo,
  EstFundingrate,
  Holding,
  IndexPrice,
  LiquidationPushType,
  OpenInterest,
  PositionPushType,
  PositionsType,
  SymbolInfo,
} from './type';
import {
  Balance,
  MarketTrade,
  MarkPrice,
  MyOrder,
  Orders,
  Ticker,
  TokenInfo,
  Trade,
} from './type';

interface OrderlyContextValue {
  orders: Orders | undefined;
  requestOrders: Orders | undefined;
  marketTrade: MarketTrade[] | undefined;
  lastJsonMessage: any;
  symbol: string;
  setSymbol: (symbol: string) => void;
  recentTrades: Trade[] | undefined;
  tokenInfo: TokenInfo[] | undefined;
  ticker: Ticker | undefined;
  markPrices: MarkPrice[] | undefined;
  balances?: Record<string, Balance>;
  balanceTimeStamp: number;
  allTickers: Ticker[] | undefined;
  indexprices: IndexPrice[] | undefined;
  allTickersPerp: Ticker[] | undefined;
  everyTickers: Ticker[] | undefined;
  openinterests: OpenInterest[] | undefined;
  allOrdersSymbol: MyOrder[] | undefined;
  handlePendingOrderRefreshing: () => void;
  pendingOrders: MyOrder[];
  storageEnough: boolean | undefined;
  myPendingOrdersRefreshing: boolean;
  setValidAccountSig: (validAccountSig: boolean) => void;
  validAccountSig: boolean;
  bridgePrice: string;
  setBridgePrice: (bridgePrice: string) => void;
  ordersUpdate: Orders | undefined;
  userExist: undefined | boolean;
  availableSymbols: SymbolInfo[];
  systemAvailable: boolean;
  requestSymbol: string;
  newUserTip: boolean;
  setRequestSymbol: (symbol: string) => void;
  estFundingRate: EstFundingrate | undefined;
  positions: PositionsType | undefined;
  positionPush: PositionPushType[] | undefined;
  positionTimeStamp: number;
  allOrdersSymbolMarket?: MyOrder[];
  liquidations: LiquidationPushType[];
  maintenance: boolean | undefined;
  symbolType: 'PERP' | 'SPOT';
  setLiquidations: (liquidations: LiquidationPushType[]) => void;
  futureLeverage: number | undefined;
  userInfo: ClientInfo;
  setUserInfo: (userInfo: ClientInfo) => void;
  holdings: Holding[];
  allOrders: MyOrder[];
  needRefresh: boolean;
  setPositionTrigger: React.Dispatch<React.SetStateAction<boolean>>;
  positionPushReceiver: boolean;
  orderPageNum: number;
  setOrderPageNum: (num: number) => void;
  orderTotalPage: number;
  setOrderTotalPage: (num: number) => void;
}

export const REF_ORDERLY_SYMBOL_KEY = 'REF_ORDERLY_SYMBOL_KEY';

export const OrderlyContext = createContext<OrderlyContextValue | null>(null);

const OrderlyContextProvider: React.FC<any> = ({ children }) => {
  const storedSymbol = localStorage.getItem(REF_ORDERLY_SYMBOL_KEY);

  const [maintenance, setMaintenance] = useState<boolean>(undefined);

  React.useEffect(() => {
    getOrderlySystemInfo().then((res) => {
      if (res.data.status === 2) {
        setMaintenance(true);
      } else {
        setMaintenance(false);
      }
    });
  }, []);

  const [symbol, setSymbol] = useState<string>(
    storedSymbol || 'SPOT_NEAR_USDC.e'
  );

  const [userInfo, setUserInfo] = useState<ClientInfo>();

  const pathname = useHistory().location.pathname;

  const symbolType = PerpOrSpot(symbol);

  const [requestSymbol, setRequestSymbol] = useState<string>();
  const [myPendingOrdersRefreshing, setMyPendingOrdersRefreshing] =
    useState<boolean>(false);

  const value = useOrderlyMarketData({
    symbol,
    requestSymbol,
  });

  const storageEnough = useStorageEnough();

  const userExist = useAccountExist();

  const systemAvailable = useOrderlySystemAvailable();
  const tokenInfo = useTokenInfo();

  const [validAccountSig, setValidAccountSig] = useState<boolean>(false);

  const handlePendingOrderRefreshing = () => {
    setMyPendingOrdersRefreshing(!myPendingOrdersRefreshing);
  };

  const [bridgePrice, setBridgePrice] = useState<string>('');
  const [orderPageNum, setOrderPageNum] = useState(1);
  const [orderTotalPage, setOrderTotalPage] = useState(0);
  const privateValue = useOrderlyPrivateData({
    validAccountSig,
  });
  const { positions, setPositionTrigger } = useAllPositions(validAccountSig);

  const holdings = useCurHoldings(validAccountSig, privateValue?.balances);

  const availableSymbols = useAllSymbolInfo();

  // TODOX
  const allOrders = useAllOrders({
    refreshingTag:
      privateValue.balanceTimeStamp + privateValue.positionTimeStamp,
    type: symbolType,
    validAccountSig,
    orderPageNum,
    setOrderTotalPage,
  })?.map((order) => {
    if (order.status == 'NEW' && !order.price) {
      order.price = 0;
    }
    return order;
  });
  const isPerp = isNewHostName
    ? pathname.includes('perp') || pathname == '/'
    : pathname.includes('perp');
  useEffect(() => {
    if (
      (isPerp && symbol.indexOf('PERP') > -1) ||
      (!isPerp && symbol.indexOf('SPOT') > -1)
    ) {
      return;
    }

    if (isPerp) {
      // find if PERP_{token}_{USDC} exist  in availableSymbols, if exist, set to this symbol else set to PERP_NEAR_USDC

      let newSymbol = 'PERP_NEAR_USDC.e';

      const perpSymbol = availableSymbols?.find((s) => {
        const storedSymbol = localStorage.getItem(REF_ORDERLY_SYMBOL_KEY);
        if (!storedSymbol) return false;

        const type = s.symbol.split('_')[0];

        if (type === 'SPOT') return false;

        const symbolFrom = s.symbol.split('_')[1];

        const symbolFromStored = storedSymbol.split('_')[1];

        if (symbolFrom.indexOf('BTC') > -1) {
          return symbolFromStored.indexOf('BTC') > -1;
        } else {
          return symbolFromStored === symbolFrom;
        }
      });

      if (perpSymbol) {
        newSymbol = perpSymbol.symbol;
      }

      setSymbol(newSymbol);
      localStorage.setItem(REF_ORDERLY_SYMBOL_KEY, newSymbol);
    } else {
      let newSymbol = 'SPOT_NEAR_USDC.e';

      const spotSymbol = availableSymbols?.find((s) => {
        const storedSymbol = localStorage.getItem(REF_ORDERLY_SYMBOL_KEY);
        if (!storedSymbol) return false;

        const type = s.symbol.split('_')[0];

        if (type === 'PERP') return false;

        const symbolFrom = s.symbol.split('_')[1];

        const symbolFromStored = storedSymbol.split('_')[1];

        if (symbolFrom.indexOf('BTC') > -1) {
          return symbolFromStored.indexOf('BTC') > -1;
        } else {
          return symbolFromStored === symbolFrom;
        }
      });
      if (spotSymbol) {
        newSymbol = spotSymbol.symbol;
      }

      setSymbol(newSymbol);
      localStorage.setItem(REF_ORDERLY_SYMBOL_KEY, newSymbol);
    }
  }, [symbol, isPerp, availableSymbols, pathname]);

  const allOrdersSymbol = allOrders?.filter((o) => o.symbol === symbol);

  const [recentTrades, setTrades] = useState<Trade[]>();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    if (!validAccountSig) return;

    getAccountInformation({ accountId }).then((res) => {
      if (!!res) {
        setUserInfo(res);
      }
    });
  }, [validAccountSig]);

  useEffect(() => {
    if (value?.marketTrade?.[0]?.symbol !== symbol) {
      return;
    }
    setTrades(
      value.marketTrade.map((t) => ({
        executed_timestamp: t.ts,
        executed_price: t.price,
        executed_quantity: t.size,
        side: t.side,
        symbol: t.symbol,
      }))
    );
  }, [JSON.stringify(value.marketTrade)]);

  const newUserTip =
    validAccountSig &&
    holdings &&
    holdings.every((h) => Number(h.holding) == 0);

  return (
    <OrderlyContext.Provider
      value={{
        ...value,
        ...privateValue,
        allTickers: value.allTickers?.filter(
          (t) => t.symbol.indexOf('SPOT') > -1
        ),
        allTickersPerp: value.allTickers?.filter(
          (t) => t.symbol.indexOf('PERP') > -1
        ),
        everyTickers: value.allTickers,
        maintenance,
        positions,
        systemAvailable,
        requestSymbol,
        setRequestSymbol,
        newUserTip,
        symbol,
        setSymbol: (symbol: string) => {
          setSymbol(symbol);
          handlePendingOrderRefreshing();
          localStorage.setItem(REF_ORDERLY_SYMBOL_KEY, symbol);
        },
        recentTrades,
        holdings,
        tokenInfo,
        allOrders,
        allOrdersSymbol: allOrdersSymbol?.filter(
          (o) => o.broker_id === 'ref_dex'
        ),
        handlePendingOrderRefreshing,
        pendingOrders:
          allOrdersSymbol?.filter(
            (order) =>
              order.status === 'PARTIAL_FILLED' || order.status === 'NEW'
          ) || [],
        storageEnough,
        myPendingOrdersRefreshing,
        setValidAccountSig,
        validAccountSig,
        bridgePrice,
        setBridgePrice,
        userExist,
        availableSymbols,
        symbolType,
        userInfo,
        setUserInfo,
        setPositionTrigger,
        orderPageNum,
        setOrderPageNum,
        orderTotalPage,
        setOrderTotalPage,
      }}
    >
      {children}
    </OrderlyContext.Provider>
  );
};

export default OrderlyContextProvider;

export function useOrderlyContext() {
  const context = React.useContext(OrderlyContext);

  if (!context) {
    throw new Error('useOrderly must be used within a OrderlyContextProvider');
  }

  return context;
}
