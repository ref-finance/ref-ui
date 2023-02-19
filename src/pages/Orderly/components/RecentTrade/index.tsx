import React, { useState, useEffect, useContext } from 'react';
import {
  OrderlyContext,
  useOrderlyContext,
} from '../../orderly/OrderlyContext';
import moment from 'moment';

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

  return (
    <>
      <div className="flex px-4 mr-4 mb-1 items-center text-xs text-primaryOrderly justify-between ">
        <div>
          <span>Price</span>

          <span className="text-white rounded-md ml-1 p-1 bg-primaryOrderly bg-opacity-10">
            {symbolTo}
          </span>
        </div>

        <div>
          <span>Size</span>

          <span className="text-white rounded-md ml-1 p-1 bg-primaryOrderly bg-opacity-10">
            {symbolFrom}
          </span>
        </div>

        <div>Time</div>
      </div>

      <section
        className="overflow-auto px-4 text-xs"
        style={{
          height: '490px',
        }}
      >
        {recentTrades.map((trade, i) => {
          return (
            <div
              key={'recent-trade-' + i}
              className="grid mr-2 mt-2.5 grid-cols-3 justify-items-end"
            >
              <span
                className={`justify-self-start ${
                  trade.side === 'BUY' ? 'text-buyGreen' : 'text-sellRed'
                }`}
              >
                {trade.executed_price}
              </span>
              <span className="text-white">{trade.executed_quantity}</span>

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
