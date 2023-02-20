import React, { useContext, createContext, useState, useEffect } from 'react';
import { useOrderlyMarketData, useOrderlyPrivateData } from './off-chain-ws';
import {
  MarketTrade,
  Orders,
  TokenInfo,
  Trade,
  Ticker,
  MarkPrice,
  Balance,
  MyOrder,
} from './type';
import {
  useMarketTrades,
  useTokenInfo,
  usePendingOrders,
  useAllOrdersSymbol,
  useStorageEnough,
} from './state';

interface OrderlyContextValue {
  orders: Orders | undefined;
  marketTrade: MarketTrade | undefined;
  lastJsonMessage: any;
  symbol: string;
  setSymbol: (symbol: string) => void;
  recentTrades: Trade[];
  tokenInfo: TokenInfo[] | undefined;
  ticker: Ticker | undefined;
  markPrices: MarkPrice[] | undefined;
  balances?: Record<string, Balance>;
  allTickers: Ticker[] | undefined;
  allOrdersSymbol: MyOrder[] | undefined;
  handlePendingOrderRefreshing: () => void;
  pendingOrders: MyOrder[];
  storageEnough: boolean | undefined;
  myPendingOrdersRefreshing: boolean;
  setValidAccountSig: (validAccountSig: boolean) => void;
  validAccountSig: boolean;
}

export const OrderlyContext = createContext<OrderlyContextValue | null>(null);

const OrderlyContextProvider: React.FC<any> = ({ children }) => {
  const [symbol, setSymbol] = useState<string>('SPOT_NEAR_USDC');

  const value = useOrderlyMarketData({
    symbol,
  });

  const storageEnough = useStorageEnough();

  const [validAccountSig, setValidAccountSig] = useState<boolean>(false);

  const [myPendingOrdersRefreshing, setMyPendingOrdersRefreshing] =
    useState<boolean>(false);

  const handlePendingOrderRefreshing = () => {
    setMyPendingOrdersRefreshing(!myPendingOrdersRefreshing);
  };

  const privateValue = useOrderlyPrivateData({ validAccountSig });

  const pendingOrders = usePendingOrders({
    symbol,
    refreshingTag: myPendingOrdersRefreshing,
  });

  const allOrdersSymbol = useAllOrdersSymbol({
    symbol,
    refreshingTag: myPendingOrdersRefreshing,
  });

  const recentTrades = useMarketTrades({
    symbol,
    limit: 20,
    marketTrade: value.marketTrade,
  });

  const tokenInfo = useTokenInfo();

  return (
    <OrderlyContext.Provider
      value={{
        ...value,
        ...privateValue,
        symbol,
        setSymbol: (symbol: string) => {
          setSymbol(symbol);
          handlePendingOrderRefreshing();
        },
        recentTrades,
        tokenInfo,
        allOrdersSymbol,
        handlePendingOrderRefreshing,
        pendingOrders,
        storageEnough,
        myPendingOrdersRefreshing,
        setValidAccountSig,
        validAccountSig,
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
