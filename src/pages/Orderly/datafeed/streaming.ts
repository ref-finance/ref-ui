// @ts-noCheck

import { config } from '../near';

import { getOrderlyConfig } from '../config';
import {
  ResolutionToSeconds,
  parseFullSymbol,
  parseResolution,
} from './helpers';

// import { WebSocket } from 'ws';
import { getOrderlyWss } from '../orderly/constant';

import ReconnectingWebSocket from 'reconnecting-websocket';

const channelToSubscription = new Map();

var ws = new ReconnectingWebSocket(getOrderlyWss(false));

function sendPing() {
  ws.send(
    JSON.stringify({
      event: 'ping',
      ts: Date.now(),
    })
  );
}

function sendPong() {
  ws.send(
    JSON.stringify({
      event: 'pong',
      ts: Date.now(),
    })
  );
}

ws.onopen = () => {
  sendPing();
};

ws.onmessage = (event) => {
  const { event: data_event } = JSON.parse(event.data);

  if (data_event) {
    if (data_event === 'ping') {
      sendPong();
      sendPing();
    }
  }
};

ws.onclose = (event) => {};

ws.onerror = (event) => {
  // alert('error ');
};

ws.onmessage = (event) => {
  const { data, topic, event: dataEvent } = JSON.parse(event.data);

  if (dataEvent === 'ping') {
    sendPong();
    return;
  }

  if (!topic || topic.indexOf('kline') === -1) {
    return;
  }

  const { high, low, open, startTime, close } = data;

  const subscriptionItem = channelToSubscription.get(topic);
  if (subscriptionItem === undefined) {
    return;
  }

  const lastBar = subscriptionItem.lastBar;

  const nextDailyBarTime = getNextBarTime(
    lastBar.time,
    subscriptionItem.resolution
  );

  let bar;
  if (startTime >= nextDailyBarTime) {
    bar = {
      time: nextDailyBarTime,
      open: open,
      high: high,
      low: low,
      close: close,
    };
  } else {
    bar = {
      ...lastBar,
      high: Math.max(lastBar.high, high),
      low: Math.min(lastBar.low, low),
      close: close,
    };
  }
  subscriptionItem.lastBar = bar;

  // send data to every subscriber of that symbol
  subscriptionItem.handlers.forEach((handler) => handler.callback(bar));
};

function getNextBarTime(barTime: number, resolution: string) {
  return barTime + ResolutionToSeconds(resolution) * 1000;
}

export function subscribeOnStream(
  symbolInfo,
  resolution,
  onRealtimeCallback,
  subscriberUID,
  onResetCacheNeededCallback,
  lastBar
) {
  const parsedSymbol = parseFullSymbol(symbolInfo.full_name);
  const channelString = `0~${parsedSymbol.exchange}~${parsedSymbol.fromSymbol}~${parsedSymbol.toSymbol}`;
  const topic = `${symbolInfo.ticker}@kline_${parseResolution(resolution)}`;

  const handler = {
    id: subscriberUID,
    callback: onRealtimeCallback,
    topic,
  };

  const msg = {
    event: 'subscribe',
    topic,
    id: topic,
    ts: Date.now(),
  };
  let subscriptionItem = channelToSubscription.get(topic);

  if (subscriptionItem) {
    // already subscribed to the channel, use the existing subscription

    subscriptionItem.handlers.push(handler);
    return;
  }

  subscriptionItem = {
    subscriberUID,
    resolution,
    lastBar,
    handlers: [handler],
  };

  channelToSubscription.set(topic, subscriptionItem);

  ws.send(JSON.stringify(msg));
}

export function unsubscribeFromStream(subscriberUID) {
  // find a subscription with id === subscriberUID
  for (const topic of channelToSubscription.keys()) {
    const subscriptionItem = channelToSubscription.get(topic);
    const handlerIndex = subscriptionItem.handlers.findIndex(
      (handler) => handler.id === subscriberUID
    );

    if (handlerIndex !== -1) {
      // remove from handlers

      const tmpHandler = subscriptionItem.handlers[handlerIndex];

      subscriptionItem.handlers.splice(handlerIndex, 1);
      if (subscriptionItem.handlers.length === 0) {
        // unsubscribe from the channel, if it was the last handler
        // socket.emit('SubRemove', { subs: [channelString] });
        const msg = {
          event: 'unsubscribe',
          topic: tmpHandler.topic,
          id: tmpHandler.topic,
        };

        ws.send(JSON.stringify(msg));

        channelToSubscription.delete(topic);
        break;
      }
    }
  }
}
