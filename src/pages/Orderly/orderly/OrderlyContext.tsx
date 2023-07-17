import React, {
  useContext,
  createContext,
  useState,
  useEffect,
  useMemo,
} from 'react';
import { useOrderlyMarketData, useOrderlyPrivateData } from './off-chain-ws';
import {
  useAccountExist,
  useAllOrders,
  useAllPositions,
  useOrderlySystemAvailable,
} from './state';
import { useAllSymbolInfo } from '../components/AllOrders/state';
import {
  EstFundingrate,
  IndexPrice,
  LiquidationPushType,
  OpenInterest,
  PositionPushType,
  PositionsType,
  SymbolInfo,
} from './type';
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
import { useTokenInfo, useAllOrdersSymbol, useStorageEnough } from './state';
import { getOrderlySystemInfo } from './off-chain-api';
import { PerpOrSpot } from '../utiles';

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

  const pathname = window.location.pathname;

  const isPerp = pathname.includes('perp');

  const [symbol, setSymbol] = useState<string>(
    storedSymbol || 'SPOT_NEAR_USDC'
  );

  useEffect(() => {
    if (
      (isPerp && symbol.indexOf('PERP') > -1) ||
      (!isPerp && symbol.indexOf('SPOT') > -1)
    ) {
      return;
    }

    if (isPerp) {
      setSymbol('PERP_NEAR_USDC');
      localStorage.setItem(REF_ORDERLY_SYMBOL_KEY, 'PERP_NEAR_USDC');
    } else {
      setSymbol('SPOT_NEAR_USDC');
      localStorage.setItem(REF_ORDERLY_SYMBOL_KEY, 'SPOT_NEAR_USDC');
    }
  }, [symbol]);

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

  const privateValue = useOrderlyPrivateData({
    validAccountSig,
  });
  const { positions } = useAllPositions([
    myPendingOrdersRefreshing,
    privateValue?.positionPushReceiver,
  ]);

  const availableSymbols = useAllSymbolInfo();

  const allOrdersSymbol = useAllOrdersSymbol({
    symbol,
    refreshingTag: myPendingOrdersRefreshing,
    validAccountSig,
  });

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
        maintenance,
        positions,
        systemAvailable,
        requestSymbol,
        setRequestSymbol,
        symbol,
        setSymbol: (symbol: string) => {
          setSymbol(symbol);
          handlePendingOrderRefreshing();
          localStorage.setItem(REF_ORDERLY_SYMBOL_KEY, symbol);
        },
        recentTrades,
        tokenInfo,
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
