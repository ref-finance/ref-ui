import React, { useState, useEffect, useContext } from 'react';
import {
  OrderlyContext,
  useOrderlyContext,
} from '../../orderly/OrderlyContext';
import moment from 'moment';
import { OrderlyLoading } from '../Common/Icons';
import {
  digitWrapper,
  numberWithCommas,
  numberWithCommasPadding,
} from '../../utiles';
import Big from 'big.js';
import { useIntl } from 'react-intl';

export function parseSymbol(fullName: string) {
  return {
    symbolFrom: fullName?.split('_')[1],
    symbolTo: fullName?.split('_')[2],
  };
}

function formatTime(ts: number) {
  const curTime = Date.now();

  if (curTime - ts > 60 * 60 * 24 * 1000) {
    return moment(ts).fromNow();
  }

  return moment(ts).format('HH:mm:ss');
}

function RecentTrade() {
  const { recentTrades, symbol, availableSymbols } = useOrderlyContext();

  const symbolInfo = availableSymbols.find((s) => s.symbol === symbol);

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [loading, setLoading] = useState<boolean>(recentTrades === undefined);

  let quantityDecimal =
    Math.log10(symbolInfo.base_tick) > 0
      ? 0
      : -Math.log10(symbolInfo.base_tick);

  useEffect(() => {
    if (!!recentTrades || !symbolInfo) {
      setLoading(false);
    }
  }, [!!recentTrades, symbolInfo]);

  const intl = useIntl();

  return (
    <>
      <div className="flex px-4 xs:px-2 xs:border-b xs:border-white xs:border-opacity-10 xs:pb-1.5 xs:mr-0   mr-4 mb-1 items-center text-xs text-primaryOrderly justify-between ">
        <div className="flex items-center">
          <span>
            {intl.formatMessage({
              id: 'price',
              defaultMessage: 'Price',
            })}
          </span>

          <span className="text-primaryText rounded-md ml-1  px-1 text-xs py-0 pt-0.5 bg-primaryOrderly bg-opacity-10">
            {symbolTo}
          </span>
        </div>

        <div>
          <span>
            {intl.formatMessage({
              id: 'qty',
              defaultMessage: 'Qty',
            })}
          </span>

          <span className="text-primaryText rounded-md ml-1 px-1 text-xs py-0 pt-0.5 bg-primaryOrderly bg-opacity-10">
            {symbolFrom}
          </span>
        </div>

        <div>
          {intl.formatMessage({
            id: 'time',
            defaultMessage: 'Time',
          })}
        </div>
      </div>

      <section
        className="overflow-auto w-full px-4 xs:px-1.5 text-xs"
        style={{
          height: 'calc(100% - 56px)',
        }}
      >
        {loading && <OrderlyLoading></OrderlyLoading>}
        {!loading &&
          recentTrades?.slice(0, 50)?.map((trade, i) => {
            return (
              <div
                key={'recent-trade-' + i}
                className="grid mr-2 mt-2.5 grid-cols-3 font-nunito justify-items-end"
              >
                <span
                  className={`justify-self-start ${
                    trade.side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
                  }`}
                >
                  {numberWithCommasPadding(
                    trade.executed_price,
                    Math.log10(symbolInfo.quote_tick) > 0
                      ? 0
                      : -Math.log10(symbolInfo.quote_tick)
                  )}
                </span>
                <span className="text-white">
                  {numberWithCommas(
                    new Big(trade.executed_quantity).toFixed(quantityDecimal, 1)
                  )}
                </span>

                <span className="justify-self-end text-primaryOrderly">
                  {formatTime(trade.executed_timestamp)}
                </span>
              </div>
            );
          })}
      </section>
    </>
  );
}

export default RecentTrade;
