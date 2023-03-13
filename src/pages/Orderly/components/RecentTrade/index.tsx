import React, { useState, useEffect, useContext } from 'react';
import {
  OrderlyContext,
  useOrderlyContext,
} from '../../orderly/OrderlyContext';
import moment from 'moment';
import { OrderlyLoading } from '../Common/Icons';
import { digitWrapper, digitWrapperFull, numberWithCommas } from '../../utiles';

export function parseSymbol(fullName: string) {
  return {
    symbolFrom: fullName.split('_')[1],
    symbolTo: fullName.split('_')[2],
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
  const { recentTrades, symbol } = useOrderlyContext();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [loading, setLoading] = useState<boolean>(recentTrades === undefined);

  useEffect(() => {
    if (!!recentTrades) {
      setLoading(false);
    }
  }, [!!recentTrades]);

  return (
    <>
      <div className="flex px-4 mr-4 mb-1 items-center text-xs text-primaryOrderly justify-between ">
        <div className="flex items-center">
          <span>Price</span>

          <span className="text-primaryText rounded-md ml-1  px-1 text-xs py-0 pt-0.5 bg-primaryOrderly bg-opacity-10">
            {symbolTo}
          </span>
        </div>

        <div>
          <span>Qty</span>

          <span className="text-primaryText rounded-md ml-1 px-1 text-xs py-0 pt-0.5 bg-primaryOrderly bg-opacity-10">
            {symbolFrom}
          </span>
        </div>

        <div>Time</div>
      </div>

      <section
        className="overflow-auto w-full px-4 text-xs"
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
                className="grid mr-2 mt-2.5 grid-cols-3 justify-items-end"
              >
                <span
                  className={`justify-self-start ${
                    trade.side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
                  }`}
                >
                  {numberWithCommas(trade.executed_price)}
                </span>
                <span className="text-white">
                  {digitWrapper(trade.executed_quantity, 2)}
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
