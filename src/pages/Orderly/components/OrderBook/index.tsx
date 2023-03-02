import React, { useState, useEffect } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import RecentTrade from '../RecentTrade';

import { MyOrder, Orders } from '../../orderly/type';
import { MyOrderTip } from '../Common';
import { digitWrapper } from '../../utiles';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { Selector } from '../OrderBoard';
import { IoArrowUpOutline } from 'react-icons/io5';
import Big from 'big.js';
import { TextWrapper } from '../UserBoard/index';
import { OrderlyLoading } from '../Common/Icons';

function parseSymbol(fullName: string) {
  return {
    symbolFrom: fullName.split('_')[1],
    symbolTo: fullName.split('_')[2],
  };
}

function groupOrdersByPrecision({
  orders,
  precision,
  pendingOrders,
}: {
  orders: Orders | undefined;
  precision: number;
  pendingOrders: MyOrder[];
}) {
  // this function is to group orders by precision,

  if (!orders) return {};

  const asks = orders.asks;

  const bids = orders.bids;

  const groupedAsks = asks.reduce((acc, cur) => {
    const groupKey = new Big(cur[0]).toFixed(precision, 3);

    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr] ? acc[keyStr] + cur[1] : cur[1],
    };
  }, {} as Record<string, number>);

  const sortedAsks = Object.entries(groupedAsks)
    .map(([price, amount]) => [Number(price), amount])
    .sort((a, b) => a[0] - b[0]);

  const groupedBids = bids.reduce((acc, cur) => {
    const groupKey = new Big(cur[0]).toFixed(precision, 0);

    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr] ? acc[keyStr] + cur[1] : cur[1],
    };
  }, {} as Record<string, number>);

  const sortedBids = Object.entries(groupedBids)
    .map(([price, amount]) => [Number(price), amount])
    .sort((a, b) => b[0] - a[0]);

  const groupedAsktotalSize = sortedAsks.reduce(
    (acc, cur, index: number) => {
      const groupKey = cur[0];

      if (index === 0) {
        return {
          [groupKey]: cur[1],
        };
      }

      return {
        ...acc,
        [groupKey]: cur[1] + acc?.[sortedAsks[index - 1]?.[0]?.toString()] || 0,
      };
    },

    {} as Record<string, number>
  );

  const groupedBidtotalSize = sortedBids.reduce(
    (acc, cur, index: number) => {
      const groupKey = cur[0];

      if (index === 0) {
        return {
          [groupKey]: cur[1],
        };
      }

      return {
        ...acc,
        [groupKey]: cur[1] + acc?.[sortedBids[index - 1]?.[0]?.toString()] || 0,
      };
    },

    {} as Record<string, number>
  );

  const groupMyPendingOrders = pendingOrders.reduce((acc, cur) => {
    const groupKey = Math.floor(cur.price * 10 ** precision) / 10 ** precision;
    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr]
        ? acc[keyStr] + (cur.quantity - cur.executed || 0)
        : cur.quantity - cur.executed || 0,
    };
  }, {} as Record<string, number>);

  return {
    asks: sortedAsks.sort((a, b) => a[0] - b[0]),

    bids: sortedBids,
    asktotalSize: groupedAsktotalSize,
    bidtotalSize: groupedBidtotalSize,
    groupMyPendingOrders,
  };
}

function getPrecisionStringByNumber(precision: number) {
  if (precision === 0) {
    return '1';
  } else {
    return '0.' + '0'.repeat(precision - 1) + '1';
  }
}

export const REF_ORDERLY_PRECISION = 'REF_ORDERLY_PRECISION';

function OrderBook() {
  const {
    orders,
    symbol,
    pendingOrders,
    recentTrades,
    marketTrade,
    ordersUpdate,
    setBridgePrice,
    handlePendingOrderRefreshing,
  } = useOrderlyContext();

  const storedPrecision = sessionStorage.getItem(REF_ORDERLY_PRECISION);

  const [precision, setPrecision] = useState<number>(
    storedPrecision ? Number(storedPrecision) : 2
  );

  const hitMyOrder = pendingOrders?.some((po) => {
    return (
      ordersUpdate?.asks?.some((a) => a[0] === po?.price) ||
      ordersUpdate?.bids?.some((a) => a[0] === po?.price)
    );
  });

  useEffect(() => {
    if (hitMyOrder) {
      handlePendingOrderRefreshing();
    }
  }, [hitMyOrder, JSON.stringify(ordersUpdate)]);

  const [showPrecisionSelector, setShowPrecisionSelector] =
    useState<boolean>(false);

  const { asks, bids, asktotalSize, bidtotalSize, groupMyPendingOrders } =
    groupOrdersByPrecision({
      orders,
      precision,
      pendingOrders,
    });

  const { symbolFrom, symbolTo } = parseSymbol(symbol);
  const [tab, setTab] = useState<'recent' | 'book'>('book');

  const [loading, setLoading] = useState<boolean>(orders === undefined);

  useEffect(() => {
    if (!!orders) {
      setLoading(false);
    }
  }, [!!orders]);

  const marketTradeDisplay = digitWrapper(
    recentTrades?.at(0)?.executed_price || 0,
    2
  );

  const diff =
    (recentTrades?.at(0)?.executed_price || 0) -
    (recentTrades?.at(1)?.executed_price || 0);

  return (
    <div className="w-full h-full relative border border-boxBorder text-sm rounded-2xl bg-black bg-opacity-10 py-4 ">
      <div className="px-4 relative flex mb-2 border-b border-white border-opacity-10 items-center ">
        <div
          onClick={() => {
            setTab('book');
          }}
          className={`cursor-pointer text-left relative ${
            tab === 'book' ? 'text-white' : 'text-primaryOrderly'
          } font-bold mb-1`}
        >
          Book
          {tab === 'book' && (
            <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-1.5 left-0"></div>
          )}
        </div>
        <div
          onClick={() => {
            setTab('recent');
          }}
          className={`cursor-pointer text-left relative ${
            tab === 'recent' ? 'text-white' : 'text-primaryOrderly'
          } ml-3 font-bold mb-1`}
        >
          Trades
          {tab === 'recent' && (
            <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-1.5 left-0"></div>
          )}
        </div>
        {tab === 'book' && (
          <div
            className="max-w-fit min-w-p72 cursor-pointer rounded-md bg-symbolHover pl-2 absolute   right-4 bottom-1 text-white flex justify-center items-center"
            onClick={() => {
              setShowPrecisionSelector(!showPrecisionSelector);
            }}
          >
            <span className="relative right-2 text-xs">
              {getPrecisionStringByNumber(precision)}
            </span>

            <MdArrowDropDown
              size={22}
              className="text-primaryOrderly absolute right-0 justify-self-end"
            ></MdArrowDropDown>
            {showPrecisionSelector && (
              <Selector
                selected={precision.toString()}
                setSelect={(textId: string) => {
                  setPrecision(Number(textId));
                  sessionStorage.setItem(REF_ORDERLY_PRECISION, textId);
                  setShowPrecisionSelector(false);
                }}
                className=" min-w-p72 -left-2 top-1 relative"
                list={[
                  {
                    text: '0.0001',
                    textId: '4',
                  },
                  {
                    text: '0.001',
                    textId: '3',
                  },
                  {
                    text: '0.01',
                    textId: '2',
                  },
                  {
                    text: '0.1',
                    textId: '1',
                  },
                  {
                    text: '1',
                    textId: '0',
                  },
                ]}
              />
            )}
          </div>
        )}
      </div>

      {loading && <OrderlyLoading></OrderlyLoading>}

      {tab === 'book' && !loading && (
        <>
          <div className="px-4 flex items-center text-xs mb-2 mr-4 text-primaryOrderly justify-between ">
            <div className="flex items-center">
              <span className="flex items-center">Price</span>

              <span className="text-primaryText rounded-md ml-1 px-1 text-10px py-0 bg-primaryOrderly bg-opacity-10">
                {symbolTo}
              </span>
            </div>

            <div>
              <span>Qty</span>

              <span className="text-primaryText rounded-md ml-1 px-1 text-10px py-0 bg-primaryOrderly bg-opacity-10">
                {symbolFrom}
              </span>
            </div>

            <div>
              Total
              <span className="text-primaryText rounded-md ml-1 px-1 text-10px py-0 bg-primaryOrderly bg-opacity-10">
                {symbolFrom}
              </span>
            </div>
          </div>

          {/* sell  */}
          <section
            className="text-xs flex  flex-col-reverse overflow-auto text-white "
            id="sell-order-book-panel"
            style={{
              maxHeight: 'calc(50% - 50px)',
            }}
          >
            {asks?.map((order, i) => {
              return (
                <div
                  className={
                    'relative  grid px-4 cursor-pointer hover:bg-symbolHover grid-cols-3 mr-2 py-1 justify-items-end'
                  }
                  id={`order-id-${order[0]}`}
                  key={'orderbook-ask-' + i}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBridgePrice(order[0].toString());
                  }}
                >
                  <span className="text-sellRed justify-self-start">
                    {digitWrapper(order[0].toString(), 2)}
                  </span>

                  <span className="mr-4">
                    {digitWrapper(order[1].toString(), 2)}
                  </span>

                  <span>
                    {digitWrapper(asktotalSize?.[order[0]].toString(), 2)}
                  </span>

                  <div
                    className="absolute left-0 top-1 z-40"
                    style={{
                      zIndex: 200 + i,
                    }}
                  >
                    {pendingOrders && groupMyPendingOrders[order[0]] && (
                      <MyOrderTip
                        price={order[0]}
                        scrollTagID="sell-order-book-panel"
                        quantity={groupMyPendingOrders[order[0]]}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </section>

          {/* market trade */}

          <div
            className={`text-center flex items-center py-1 justify-center ${
              diff > 0
                ? 'text-buyGreen'
                : diff < 0
                ? 'text-sellRed'
                : 'text-primaryText'
            } text-lg`}
          >
            {orders && recentTrades?.length > 0 && marketTradeDisplay}

            {orders && recentTrades?.length > 0 && diff !== 0 && (
              <IoArrowUpOutline
                className={diff < 0 ? 'transform rotate-180' : ''}
              />
            )}
          </div>

          {/* buy */}

          <section
            className="text-xs  overflow-auto  overflow-x-visible text-white"
            id="buy-order-book-panel"
            style={{
              maxHeight: 'calc(50% - 50px)',
            }}
          >
            {bids?.map((order, i) => {
              return (
                <div
                  className="px-4 relative grid grid-cols-3 mr-2 py-1 hover:bg-symbolHover  justify-items-end cursor-pointer"
                  key={'orderbook-ask-' + i}
                  id={`order-id-${order[0]}`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setBridgePrice(order[0].toString());
                  }}
                >
                  <span className="text-buyGreen justify-self-start">
                    {digitWrapper(order[0].toString(), 2)}
                  </span>

                  <span className="mr-4">
                    {digitWrapper(order[1].toString(), 2)}
                  </span>

                  <span>
                    {digitWrapper(bidtotalSize?.[order[0]].toString(), 2)}
                  </span>

                  <div
                    className="absolute left-0 top-1 z-40"
                    style={{
                      zIndex: 199 - i,
                    }}
                  >
                    {pendingOrders && groupMyPendingOrders[order[0]] && (
                      <MyOrderTip
                        scrollTagID="buy-order-book-panel"
                        price={order[0]}
                        quantity={groupMyPendingOrders[order[0]]}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </section>
        </>
      )}
      {tab === 'recent' && !loading && <RecentTrade />}
    </div>
  );
}

export default OrderBook;
