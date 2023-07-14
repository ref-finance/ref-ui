import useWebSocket, { ReadyState } from 'react-use-websocket';
import React, {
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  StrictMode,
} from 'react';
import {
  OrderlyWSConnection,
  Orders,
  MarketTrade,
  Ticker,
  MarkPrice,
  Balance,
  IndexPrice,
  EstFundingrate,
  OpenInterest,
  PositionPushType,
  LiquidationPushType,
} from './type';
import { getOrderlyConfig } from '../config';
import {
  getPublicKey,
  generateRequestSignatureHeader,
  toNonDivisibleNumber,
} from './utils';
import { NotSignInError } from './error';
import { getOrderlyWss } from './constant';
import { parseSymbol } from '../components/RecentTrade/index';
import { useTokenInfo } from './state';
import { getFTmetadata } from '../near';
import { useWalletSelector } from '../../../context/WalletSelectorContext';
import useInterval from 'react-useinterval';
import { getFundingRateSymbol } from './perp-off-chain-api';

export const REF_ORDERLY_WS_ID_PREFIX = 'orderly_ws_';

export const useOrderlyWS = () => {
  const [socketUrl, setSocketUrl] = useState(getOrderlyWss(false));

  const [messageHistory, setMessageHistory] = useState<any>([]);

  const { lastMessage, readyState, lastJsonMessage, sendMessage } =
    useWebSocket(socketUrl, {
      shouldReconnect: (closeEvent) => true,
      reconnectAttempts: 10,
      reconnectInterval: (attemptNumber) =>
        Math.min(Math.pow(2, attemptNumber) * 1000, 10000),
      onClose: (e) => {},
      onError: (e) => {},
    });

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev: any) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return {
    connectionStatus,
    messageHistory,
    lastMessage,
    sendMessage,
    lastJsonMessage,
  };
};
export const usePrivateOrderlyWS = () => {
  const { accountId } = useWalletSelector();
  const [socketUrl, setSocketUrl] = useState(
    getOrderlyConfig().ORDERLY_WS_ENDPOINT_PRIVATE + `/${accountId}`
  );

  useEffect(() => {
    if (!accountId) {
      return;
    } else {
      setSocketUrl(
        getOrderlyConfig().ORDERLY_WS_ENDPOINT_PRIVATE + `/${accountId}`
      );
    }
  }, [accountId]);

  const [messageHistory, setMessageHistory] = useState<any>([]);

  const { lastMessage, readyState, lastJsonMessage, sendMessage } =
    useWebSocket(!accountId ? null : socketUrl);

  useEffect(() => {
    if (lastMessage !== null) {
      setMessageHistory((prev: any) => prev.concat(lastMessage));
    }
  }, [lastMessage, setMessageHistory]);

  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];

  return {
    connectionStatus,
    messageHistory,
    lastMessage,
    sendMessage,
    lastJsonMessage,
  };
};

export const generateMarketDataFlow = ({ symbol }: { symbol: string }) => {
  const data: OrderlyWSConnection[] = [
    {
      id: `request-order-${symbol}`,
      event: 'request',
      params: {
        symbol,
        type: 'orderbook',
      },
    },
    {
      id: `${symbol}@orderbookupdate`,
      event: 'subscribe',
      topic: `${symbol}@orderbookupdate`,
    },
    {
      id: `${symbol}@trade-sub`,
      event: 'subscribe',
      topic: `${symbol}@trade`,
    },
    {
      id: `${symbol}@trade-req`,
      event: 'request',
      topic: `${symbol}@trade`,
      params: {
        type: 'trade',
        symbol,
        limit: 50,
      },
    },

    {
      id: `${symbol}@estfundingrate`,
      event: 'subscribe',
      topic: `${symbol}@estfundingrate`,
    },

    {
      id: `openinterests`,
      event: 'subscribe',
      topic: `openinterests`,
    },

    {
      id: `markprices`,
      event: 'subscribe',
      topic: `markprices`,
      ts: Date.now(),
    },
    {
      id: `tickers`,
      event: 'subscribe',
      topic: `tickers`,
    },
    {
      id: `indexprices`,
      event: 'subscribe',
      topic: `indexprices`,
    },
  ];

  return data;
};
export const initDataFlow = ({ symbol }: { symbol: string }) => {
  let data: OrderlyWSConnection[] = [
    {
      id: `request-order-${symbol}`,
      event: 'request',
      params: {
        symbol,
        type: 'orderbook',
      },
    },
    {
      topic: `${symbol}@kline_1m`,
      event: 'subscribe',
      id: `${symbol}@kline_1m`,
    },
  ];

  return data;
};

const preSubScription = new Map<string, OrderlyWSConnection>();

export const useOrderlyMarketData = ({
  symbol,
  requestSymbol,
}: {
  symbol: string;
  requestSymbol: string;
}) => {
  const { lastJsonMessage, sendMessage, connectionStatus } = useOrderlyWS();

  const [orders, setOrders] = useState<Orders>();

  const [requestOrders, setRequestOrders] = useState<Orders>();

  const [ticker, setTicker] = useState<Ticker>();

  const [allTickers, setAllTickers] = useState<Ticker[]>();

  const [marketTrade, setMarketTrade] = useState<MarketTrade[]>();

  const [markPrices, setMarkPrices] = useState<MarkPrice[]>();
  const [ordersUpdate, setOrdersUpdate] = useState<Orders>();

  const [indexprices, setIndexprices] = useState<IndexPrice[]>();

  const [estFundingRate, setEstFundingRate] = useState<EstFundingrate>();

  const [openinterests, setOpeninterests] = useState<OpenInterest[]>();

  useEffect(() => {
    if (connectionStatus !== 'Open') return;

    const msgFlow = generateMarketDataFlow({
      symbol,
    });

    msgFlow.forEach((msg) => {
      const id = msg.id;

      if (!id) return;

      if (preSubScription.has(id + '|' + symbol)) {
        if ('unsubscribe' in msg) {
          sendMessage(
            JSON.stringify({
              ...msg,
              event: 'unsubscribe',
            })
          );
          preSubScription.delete(id + '|' + symbol);
        }
      }

      preSubScription.set(id + '|' + symbol, msg);

      sendMessage(JSON.stringify(msg));
    });
  }, [symbol, connectionStatus]);

  useEffect(() => {
    // update orderbook

    if (connectionStatus !== 'Open') return;

    if (lastJsonMessage?.['event'] === 'ping') {
      sendMessage(JSON.stringify({ event: 'pong', ts: Date.now() }));
    }

    if (
      lastJsonMessage?.['id'] === `request-order-${symbol}` &&
      lastJsonMessage?.['event'] === 'request'
    ) {
      setOrders(lastJsonMessage?.['data']);

      setOrdersUpdate(lastJsonMessage?.['data']);
    }

    if (
      lastJsonMessage?.['topic'] === `${symbol}@orderbookupdate` &&
      !!orders
    ) {
      setOrdersUpdate(lastJsonMessage?.['data']);

      let asks = orders.asks;

      lastJsonMessage?.['data'].asks.forEach((ask: number[]) => {
        const price = ask[0];
        const quantity = ask[1];
        const index = asks.findIndex((a) => a[0] === price);

        if (index === -1) {
          asks.push(ask);
        } else {
          if (quantity === 0) {
            asks.splice(index, 1);
          } else {
            asks[index] = ask;
          }
        }
      });

      let bids = orders.bids;

      lastJsonMessage?.['data'].bids.forEach((bid: number[]) => {
        const price = bid[0];
        const quantity = bid[1];
        const index = bids.findIndex((a) => a[0] === price);

        if (index === -1) {
          bids.push(bid);
        } else {
          if (quantity === 0) {
            bids.splice(index, 1);
          } else {
            bids[index] = bid;
          }
        }
      });

      setOrders({
        ...orders,
        asks: asks.sort((a1, a2) => a1[0] - a2[0]),
        bids: bids.sort((b1, b2) => b2[0] - b1[0]),
        ts: lastJsonMessage?.['ts'],
      });
    }

    if (lastJsonMessage?.['topic'] === `${symbol}@estfundingrate`) {
      setEstFundingRate(lastJsonMessage?.['data']);
    }

    if (lastJsonMessage?.['topic'] === `openinterests`) {
      setOpeninterests(lastJsonMessage?.['data']);
    }

    //  process trade
    if (
      (lastJsonMessage?.['id'] &&
        lastJsonMessage?.['id'].includes(`${symbol}@trade-req`)) ||
      lastJsonMessage?.['topic'] === `${symbol}@trade`
    ) {
      if (lastJsonMessage?.['event'] === 'request') {
        setMarketTrade(
          lastJsonMessage?.['data'].map((t: MarketTrade) => ({ ...t, symbol }))
        );
      } else
        setMarketTrade([
          {
            ...lastJsonMessage?.['data'],
            symbol,
            ts: lastJsonMessage?.['ts'],
          },
          ...(marketTrade || []),
        ]);
    }

    if (lastJsonMessage?.['topic'] === 'tickers') {
      const tickers = lastJsonMessage?.['data'];

      setAllTickers(tickers);

      const ticker = tickers.find((t: Ticker) => t.symbol === symbol);

      if (ticker) setTicker(ticker);
    }

    if (lastJsonMessage?.['topic'] === 'indexprices') {
      const indexPrices = lastJsonMessage?.['data'];

      setIndexprices(indexPrices);
    }

    if (lastJsonMessage?.['topic'] === 'markprices') {
      const markPrices = lastJsonMessage?.['data'];

      setMarkPrices(markPrices);
    }
  }, [lastJsonMessage, symbol, connectionStatus]);

  useEffect(() => {
    if (connectionStatus !== 'Open' || !requestSymbol) return;
    const mySymbol = requestSymbol.split('|')[0];

    sendMessage(
      JSON.stringify({
        id: `request-order-${mySymbol}`,
        event: 'request',
        params: {
          symbol: mySymbol,
          type: 'orderbook',
        },
      })
    );
  }, [requestSymbol, connectionStatus]);

  // change funding rate
  useEffect(() => {
    if (!symbol) return;

    getFundingRateSymbol(symbol).then((res) => {
      setEstFundingRate({
        symbol,
        fundingRate: res.data.est_funding_rate,
        fundingTs: res.data.next_funding_time,
      });
    });
  }, [symbol]);

  useEffect(() => {
    if (connectionStatus !== 'Open' || !requestSymbol) return;

    const mySymbol = requestSymbol.split('|')[0];

    if (
      lastJsonMessage?.['id'] === `request-order-${mySymbol}` &&
      lastJsonMessage?.['event'] === 'request'
    ) {
      setRequestOrders(lastJsonMessage?.['data']);
    }
  }, [lastJsonMessage, requestSymbol, connectionStatus]);

  return {
    lastJsonMessage,
    marketTrade,
    orders,
    ticker,
    markPrices,
    allTickers,
    ordersUpdate,
    requestOrders,
    openinterests,
    estFundingRate,
    indexprices,
  };
};

export const useOrderlyPrivateData = ({
  validAccountSig,
}: {
  validAccountSig: boolean;
}) => {
  const { sendMessage, lastJsonMessage } = usePrivateOrderlyWS();

  const [authPass, setAuthPass] = useState(false);
  const { accountId } = useWalletSelector();

  const [balances, setBalances] = useState<Record<string, Balance>>({});

  const [futureLeverage, setFutureLeverage] = useState<number>();

  const [orderlyKey, setOrderlyKey] = useState('');

  const [requestSignature, setRequestSignature] = useState('');

  const [liquidations, setLiquidations] = useState<LiquidationPushType[]>([]);

  const [positionPush, setPositionPush] = useState<PositionPushType[]>();

  const time_stamp = useMemo(() => Date.now(), []);

  useEffect(() => {
    if (!accountId || !validAccountSig) return;

    generateRequestSignatureHeader({
      accountId,
      time_stamp,
      url: null,
      body: null,
    }).then(setRequestSignature);
  }, [accountId, validAccountSig]);

  useEffect(() => {
    if (!accountId) return;

    getPublicKey(accountId).then((res) => {
      setOrderlyKey(res);
    });
  }, [accountId]);

  useEffect(() => {
    if (!orderlyKey || !requestSignature || !validAccountSig) return;

    const authData = {
      id: 'auth',
      event: 'auth',
      params: {
        timestamp: time_stamp,
        sign: requestSignature,
        orderly_key: orderlyKey,
      },
    };

    sendMessage(JSON.stringify(authData));
  }, [orderlyKey, requestSignature, accountId, validAccountSig]);

  useEffect(() => {
    if (
      lastJsonMessage &&
      lastJsonMessage?.['event'] === 'auth' &&
      lastJsonMessage?.['success'] === true
    ) {
      setAuthPass(true);
    }

    if (lastJsonMessage?.['event'] === 'ping') {
      sendMessage(JSON.stringify({ event: 'pong', ts: Date.now() }));
    }

    if (lastJsonMessage?.['topic'] === 'balance') {
      setBalances(lastJsonMessage?.['data'].balances);
    }

    if (lastJsonMessage?.['topic'] === 'position') {
      setPositionPush(lastJsonMessage?.['data'].positions);
    }

    if (lastJsonMessage?.['topic'] === 'liquidatorliquidations') {
      setLiquidations((liquidations) => [
        lastJsonMessage?.['data'],
        ...liquidations,
      ]);
    }

    if (lastJsonMessage?.['topic'] === 'account') {
      setFutureLeverage(
        lastJsonMessage?.['data']?.accountDetail?.futuresLeverage || undefined
      );
    }
  }, [lastJsonMessage]);

  useEffect(() => {
    if (!authPass) return;

    sendMessage(
      JSON.stringify({
        id: 'balance',
        topic: 'balance',
        event: 'subscribe',
      })
    );

    sendMessage(
      JSON.stringify({
        id: 'position',
        topic: 'position',
        event: 'subscribe',
      })
    );

    sendMessage(
      JSON.stringify({
        id: 'account',
        topic: 'account',
        event: 'subscribe',
      })
    );

    sendMessage(
      JSON.stringify({
        id: 'liquidatorliquidations',
        topic: 'position',
        event: 'liquidatorliquidations',
      })
    );
  }, [authPass]);

  return {
    balances,
    positionPush,
    liquidations,
    setLiquidations,
    futureLeverage,
  };
};
