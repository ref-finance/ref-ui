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

export const useOrderlyMarketData = ({ symbol }: { symbol: string }) => {
  const { lastJsonMessage, sendMessage, connectionStatus } = useOrderlyWS();

  const [orders, setOrders] = useState<Orders>();

  const [ticker, setTicker] = useState<Ticker>();

  const [allTickers, setAllTickers] = useState<Ticker[]>();

  const [marketTrade, setMarketTrade] = useState<MarketTrade[]>();

  const [markPrices, setMarkPrices] = useState<MarkPrice[]>();

  const [ordersUpdate, setOrdersUpdate] = useState<Orders>();

  // subscribe
  useEffect(() => {
    if (connectionStatus !== 'Open') return;

    const msgFlow = generateMarketDataFlow({
      symbol,
    });

    msgFlow.forEach((msg) => {
      const id = msg.id;

      if (!id) return;

      if (preSubScription.has(id + '|' + symbol)) {
        // unsubscribe

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

  // onmessage
  useEffect(() => {
    // update orderbook

    if (connectionStatus !== 'Open') return;

    if (lastJsonMessage?.event === 'ping') {
      sendMessage(JSON.stringify({ event: 'pong', ts: Date.now() }));
    }

    if (
      lastJsonMessage?.id === `request-order-${symbol}` &&
      lastJsonMessage?.event === 'request'
    ) {
      setOrders(lastJsonMessage.data);

      setOrdersUpdate(lastJsonMessage.data);
    }

    // process orderbook update
    if (lastJsonMessage?.topic === `${symbol}@orderbookupdate` && !!orders) {
      // setOrders(lastJsonMessage.data);
      setOrdersUpdate(lastJsonMessage.data);

      let asks = orders.asks;

      lastJsonMessage.data.asks.forEach((ask: number[]) => {
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

      lastJsonMessage.data.bids.forEach((bid: number[]) => {
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
        ts: lastJsonMessage.ts,
      });
    }

    //  process trade
    if (
      (lastJsonMessage?.id &&
        lastJsonMessage?.id.includes(`${symbol}@trade-req`)) ||
      lastJsonMessage?.topic === `${symbol}@trade`
    ) {
      if (lastJsonMessage?.event === 'request') {
        setMarketTrade(
          lastJsonMessage.data.map((t: MarketTrade) => ({ ...t, symbol }))
        );
      } else
        setMarketTrade([
          {
            ...lastJsonMessage.data,
            symbol,
            ts: lastJsonMessage.ts,
          },
          ...(marketTrade || []),
        ]);
    }

    if (lastJsonMessage?.topic === 'tickers') {
      const tickers = lastJsonMessage.data;

      setAllTickers(tickers);

      const ticker = tickers.find((t: Ticker) => t.symbol === symbol);

      if (ticker) setTicker(ticker);
    }

    if (lastJsonMessage?.topic === 'markprices') {
      const markPrices = lastJsonMessage.data;

      setMarkPrices(markPrices);
    }
  }, [lastJsonMessage, symbol, connectionStatus]);

  return {
    lastJsonMessage,
    marketTrade,
    orders,
    ticker,
    markPrices,
    allTickers,
    ordersUpdate,
  };
};

export const useOrderlyPrivateData = ({
  validAccountSig,
}: {
  validAccountSig: boolean;
}) => {
  const {
    connectionStatus,
    messageHistory,
    lastMessage,
    sendMessage,
    lastJsonMessage,
  } = usePrivateOrderlyWS();

  const [authPass, setAuthPass] = useState(false);
  const { accountId } = useWalletSelector();

  const [balances, setBalances] = useState<Record<string, Balance>>({});

  const [orderlyKey, setOrderlyKey] = useState('');

  const [requestSignature, setRequestSignature] = useState('');

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
      lastJsonMessage.event === 'auth' &&
      lastJsonMessage.success === true
    ) {
      setAuthPass(true);
    }

    if (lastJsonMessage?.event === 'ping') {
      sendMessage(JSON.stringify({ event: 'pong', ts: Date.now() }));
    }

    if (lastJsonMessage?.topic === 'balance') {
      setBalances(lastJsonMessage.data.balances);
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
  }, [authPass]);

  return {
    balances,
  };
};
