import React, { useContext, createContext, useState, useEffect } from 'react';
import { useOrderlyMarketData, useOrderlyPrivateData } from './off-chain-ws';
import { useAccountExist } from './state';
import { useAllSymbolInfo } from '../components/AllOrders/state';
import { SymbolInfo } from './type';
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
  marketTrade: MarketTrade[] | undefined;
  lastJsonMessage: any;
  symbol: string;
  setSymbol: (symbol: string) => void;
  recentTrades: Trade[] | undefined;
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
  bridgePrice: string;
  setBridgePrice: (bridgePrice: string) => void;
  ordersUpdate: Orders | undefined;
  userExist: undefined | boolean;
  availableSymbols: SymbolInfo[];
}

export const REF_ORDERLY_SYMBOL_KEY = 'REF_ORDERLY_SYMBOL_KEY';

export const OrderlyContext = createContext<OrderlyContextValue | null>(null);

const OrderlyContextProvider: React.FC<any> = ({ children }) => {
  const [symbol, setSymbol] = useState<string>(
    localStorage.getItem(REF_ORDERLY_SYMBOL_KEY) || 'SPOT_NEAR_USDC'
  );

  const value = useOrderlyMarketData({
    symbol,
  });

  const storageEnough = useStorageEnough();

  const userExist = useAccountExist();

  const [validAccountSig, setValidAccountSig] = useState<boolean>(false);

  const [myPendingOrdersRefreshing, setMyPendingOrdersRefreshing] =
    useState<boolean>(false);

  const handlePendingOrderRefreshing = () => {
    setMyPendingOrdersRefreshing(!myPendingOrdersRefreshing);
  };

  const [bridgePrice, setBridgePrice] = useState<string>('');

  const privateValue = useOrderlyPrivateData({ validAccountSig });

  // const pendingOrders = usePendingOrders({
  //   symbol,
  //   refreshingTag: myPendingOrdersRefreshing,
  //   validAccountSig,
  // });

  const availableSymbols = useAllSymbolInfo();

  const allOrdersSymbol = useAllOrdersSymbol({
    symbol,
    refreshingTag: myPendingOrdersRefreshing,
    validAccountSig,
  });

  console.log(
    'pending orders',
    allOrdersSymbol?.filter(
      (order) => order.status === 'PARTIAL_FILLED' || order.status === 'NEW'
    ) || []
  );

  // const { trades: recentTrades, setTrades } = useMarketTrades({
  //   symbol,
  //   limit: 50,
  // });

  const [recentTrades, setTrades] = useState<Trade[]>();

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
          localStorage.setItem(REF_ORDERLY_SYMBOL_KEY, symbol);
        },
        recentTrades,
        tokenInfo,
        allOrdersSymbol,
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
