//@ts-nocheck

import {
  makePublicApiRequest,
  generateSymbol,
  parseFullSymbol,
} from './helpers';
import { subscribeOnStream, unsubscribeFromStream } from './streaming';

interface OrderlyPair {
  symbol: string;
  quote_min: number;
  quote_max: number;
  quote_tick: number;
  base_min: number;
  base_max: number;
  base_tick: number;
  min_notional: number;
  price_range: number;
  created_time: number;
  updated_time: number;
}

const lastBarsCache = new Map();

const configurationData = {
  supported_resolutions: ['1', '5', '15', '30', '1H', '1D', '1W', '1M'],
  exchanges: [
    {
      value: 'Orderly',
      name: 'Orderly',
      desc: 'Orderly',
    },
  ],
  supports_marks: true,
  supports_timescale_marks: true,
};

async function getAllSymbols() {
  const data = await makePublicApiRequest('v1/public/info');

  const pairs: OrderlyPair[] = data.data.rows;

  const symbols = pairs.map((p) => {
    return {
      symbol: p.symbol.split('_').slice(1, undefined).join('/'),
      full_name: p.symbol,
      description: p.symbol,
      exchange: 'Orderly',
      type: 'crypto',
    };
  });

  return symbols;

  // for (const leftPairPart of Object.keys(pairs)) {
  //   const symbols = pairs[leftPairPart].map((rightPairPart) => {
  //     const symbol = generateSymbol(exchange.value, leftPairPart, rightPairPart);
  //     return {
  //       symbol: symbol.short,
  //       full_name: symbol.full,
  //       description: symbol.short,
  //       exchange: exchange.value,
  //       type: 'crypto',
  //     };
  //   });
  //   allSymbols = [...allSymbols, ...symbols];
}

function getDatafeed(pricescaleNum: number) {
  const datafeed = {
    onReady: (callback) => {
      setTimeout(() => callback(configurationData));
    },
    searchSymbols: async (
      userInput,
      exchange,
      symbolType,
      onResultReadyCallback
    ) => {
      const symbols = await getAllSymbols();
      const newSymbols = symbols.filter((symbol) => {
        const isExchangeValid = exchange === '' || symbol.exchange === exchange;
        const isFullSymbolContainsInput =
          symbol.full_name.toLowerCase().indexOf(userInput.toLowerCase()) !==
          -1;
        return isExchangeValid && isFullSymbolContainsInput;
      });
      onResultReadyCallback(newSymbols);
    },
    resolveSymbol: async (
      symbolName,
      onSymbolResolvedCallback,
      onResolveErrorCallback,
      extension
    ) => {
      const symbols = await getAllSymbols();
      const symbolItem = symbols.find(
        ({ full_name }) => full_name === symbolName
      );
      if (!symbolItem) {
        onResolveErrorCallback('cannot resolve symbol');
        return;
      }

      const symbolInfo = {
        ticker: symbolItem.full_name,
        name: symbolItem.symbol,
        description: symbolItem.description,
        type: symbolItem.type,
        session: '24x7',
        timezone: 'Etc/UTC',
        exchange: symbolItem.exchange,
        minmov: 1,
        pricescale: pricescaleNum || 100,
        has_intraday: true,
        has_no_volume: true,
        has_weekly_and_monthly: false,
        supported_resolutions: configurationData.supported_resolutions,
        volume_precision: 2,
        data_status: 'streaming',
        volume_field: 'volume',
      };
      onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (
      symbolInfo,
      resolution,
      periodParams,
      onHistoryCallback,
      onErrorCallback
    ) => {
      const { from, to, firstDataRequest } = periodParams;

      const urlParameters = {
        symbol: symbolInfo.ticker,
        resolution,
        from,
        to,
      };
      const query = Object.keys(urlParameters)
        .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
        .join('&');
      try {
        const data = await makePublicApiRequest(`tv/history/?${query}`);
        if (!data || data.s !== 'ok') {
          // "noData" should be set if there is no data in the requested period.
          onHistoryCallback([], {
            noData: true,
          });
          return;
        }

        let bars = [];

        data.a.forEach((bar, i) => {
          if (data.t[i] >= from && data.t[i] < to) {
            bars = [
              ...bars,
              {
                time: data.t[i] * 1000,
                low: data.l[i],
                high: data.h[i],
                open: data.o[i],
                close: data.c[i],
                volume: data.v[i],
              },
            ];
          }
        });
        if (firstDataRequest) {
          lastBarsCache.set(symbolInfo.full_name, {
            ...bars[bars.length - 1],
          });
        }
        onHistoryCallback(bars, {
          noData: false,
        });
      } catch (error) {
        onErrorCallback(error);
      }
    },

    subscribeBars: (
      symbolInfo,
      resolution,
      onRealtimeCallback,
      subscriberUID,
      onResetCacheNeededCallback
    ) => {
      subscribeOnStream(
        symbolInfo,
        resolution,
        onRealtimeCallback,
        subscriberUID,
        onResetCacheNeededCallback,
        lastBarsCache.get(symbolInfo.full_name)
      );
    },

    unsubscribeBars: (subscriberUID) => {
      unsubscribeFromStream(subscriberUID);
    },
  };
  return datafeed;
}

export default getDatafeed;
