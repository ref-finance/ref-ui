import React, { useState } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import RecentTrade from '../RecentTrade';

import { MyOrder, Orders } from '../../orderly/type';
import { MyOrderTip } from '../Common';
import { digitWrapper } from '../../utiles';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import { Selector } from '../OrderBoard';

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

  const asktotalSize = asks.map(([price, quantity]) => {
    return [price, price * quantity];
  });

  const bidtotalSize = bids.map(([price, quantity]) => {
    return [price, price * quantity];
  });

  const groupedAsktotalSize = asktotalSize.reduce((acc, cur) => {
    const groupKey = Math.floor(cur[0] * 10 ** precision) / 10 ** precision;

    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr] ? acc[keyStr] + cur[1] : cur[1],
    };
  }, {} as Record<string, number>);

  const groupedBidtotalSize = bidtotalSize.reduce(
    (acc, cur) => {
      const groupKey = Math.floor(cur[0] * 10 ** precision) / 10 ** precision;

      const keyStr = groupKey.toString();

      return {
        ...acc,
        [groupKey]: acc[keyStr] ? acc[keyStr] + cur[1] : cur[1],
      };
    },

    {} as Record<string, number>
  );
  const groupedAsks = asks.reduce((acc, cur) => {
    const groupKey = Math.floor(cur[0] * 10 ** precision) / 10 ** precision;

    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr] ? acc[keyStr] + cur[1] : cur[1],
    };
  }, {} as Record<string, number>);

  const groupedBids = bids.reduce((acc, cur) => {
    const groupKey = Math.floor(cur[0] * 10 ** precision) / 10 ** precision;

    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr] ? acc[keyStr] + cur[1] : cur[1],
    };
  }, {} as Record<string, number>);

  const groupMyPendingOrders = pendingOrders.reduce((acc, cur) => {
    const groupKey = Math.floor(cur.price * 10 ** precision) / 10 ** precision;
    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr] ? acc[keyStr] + cur.quantity : cur.quantity,
    };
  }, {} as Record<string, number>);

  return {
    asks: Object.entries(groupedAsks)
      .map(([price, amount]) => [Number(price), amount])
      .sort((a, b) => a[0] - b[0]),
    bids: Object.entries(groupedBids)
      .map(([price, amount]) => [Number(price), amount])
      .sort((a, b) => b[0] - a[0]),
    asktotalSize: Object.entries(groupedAsktotalSize)
      .map(([price, amount]) => [Number(price), amount])
      .sort((a, b) => a[0] - b[0]),
    bidtotalSize: Object.entries(groupedBidtotalSize)
      .map(([price, amount]) => [Number(price), amount])
      .sort((a, b) => b[0] - a[0]),
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

function OrderBook() {
  const { orders, marketTrade, symbol, pendingOrders } = useOrderlyContext();

  const [precision, setPrecision] = useState<number>(2);

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

  return (
    <div
      className="w-full  border border-boxBorder text-sm rounded-2xl bg-black bg-opacity-10 py-4 "
      style={{
        height: '570px',
      }}
    >
      <div className="px-4 relative flex mb-2 border-b border-white border-opacity-10 items-center ">
        <div
          onClick={() => {
            setTab('book');
          }}
          className={`cursor-pointer text-left ${
            tab === 'book' ? 'text-white' : 'text-primaryOrderly'
          } font-bold mb-1`}
        >
          Orderbook
        </div>
        <div
          onClick={() => {
            setTab('recent');
          }}
          className={`cursor-pointer text-left ${
            tab === 'recent' ? 'text-white' : 'text-primaryOrderly'
          } ml-3 font-bold mb-1`}
        >
          Recent Trade
        </div>
        {tab === 'book' && (
          <div
            className="max-w-fit min-w-p72 cursor-pointer rounded-md bg-symbolHover pl-2 absolute   right-4 bottom-1 text-white flex justify-center items-center"
            onClick={() => {
              setShowPrecisionSelector(!showPrecisionSelector);
            }}
          >
            <span className="relative right-2">
              {getPrecisionStringByNumber(precision)}
            </span>

            <MdArrowDropDown
              size={22}
              className="text-primaryOrderly absolute right-0 justify-self-end"
            ></MdArrowDropDown>
            {showPrecisionSelector && (
              <Selector
                selected={getPrecisionStringByNumber(precision).toString()}
                setSelect={(textId: string) => {
                  setPrecision(parseInt(textId));
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

      {tab === 'book' && (
        <>
          <div className="px-4 flex items-center text-xs mb-2 mr-4 text-primaryOrderly justify-between ">
            <div className="">
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

            <div>Total Size</div>
          </div>

          {/* sell  */}
          <section
            className="text-xs flex flex-col-reverse overflow-auto text-white "
            id="sell-order-book-panel"
            style={{
              height: '225px',
            }}
          >
            {asks?.map((order, i) => {
              return (
                <>
                  <div
                    className={
                      'relative  grid px-4  hover:bg-symbolHover grid-cols-3 mr-2 py-1 justify-items-end'
                    }
                    id={`order-id-${order[0]}`}
                    key={'orderbook-ask-' + i}
                  >
                    <span className="text-sellRed justify-self-start">
                      {order[0]}
                    </span>

                    <span className="">
                      {digitWrapper(order[1].toString(), 2)}
                    </span>

                    <span>{asktotalSize?.[i]?.[1].toFixed(2)}</span>

                    <div className="absolute left-0 top-1 z-20">
                      {pendingOrders && groupMyPendingOrders[order[0]] && (
                        <MyOrderTip
                          price={order[0]}
                          scrollTagID="sell-order-book-panel"
                          quantity={groupMyPendingOrders[order[0]]}
                        />
                      )}
                    </div>
                  </div>
                </>
              );
            })}
          </section>

          {/* market trade */}

          <div
            className={`text-center flex items-center py-1 justify-center ${
              marketTrade?.side === 'BUY' ? 'text-buyGreen' : 'text-sellRed'
            } text-lg`}
          >
            {marketTrade && marketTrade?.price}
          </div>

          {/* buy */}

          <section
            className="text-xs overflow-auto  overflow-x-visible text-white"
            style={{
              height: '225px',
            }}
            id="buy-order-book-panel"
          >
            {bids?.map((order, i) => {
              return (
                <div
                  className="px-4 relative grid grid-cols-3 mr-2 py-1 hover:bg-symbolHover  justify-items-end"
                  key={'orderbook-ask-' + i}
                  id={`order-id-${order[0]}`}
                >
                  <span className="text-buyGreen justify-self-start">
                    {order[0]}
                  </span>

                  <span className="">
                    {digitWrapper(order[1].toString(), 2)}
                  </span>

                  <span>{bidtotalSize[i][1].toFixed(2)}</span>

                  <div className="absolute left-0 top-1 z-40">
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
      {tab === 'recent' && <RecentTrade />}
    </div>
  );
}

export default OrderBook;
