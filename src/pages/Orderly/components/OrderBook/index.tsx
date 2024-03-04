import React, { useState, useEffect, useMemo } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import RecentTrade from '../RecentTrade';

import { MyOrder, Orders, SymbolInfo } from '../../orderly/type';
import { MyOrderTip } from '../Common';
import {
  PerpOrSpot,
  digitWrapper,
  numberWithCommas,
  numberWithCommasPadding,
} from '../../utiles';
import {
  MdArrowDropDown,
  IoArrowUpOutline,
} from '../../../../components/reactIcons';
import { Selector } from '../OrderBoard';

import Big from 'big.js';
import { MarkPriceFlag, OrderlyLoading } from '../Common/Icons';
import { useClientMobile } from '../../../../utils/device';

import { FormattedMessage, useIntl } from 'react-intl';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import { tickToPrecision } from '../UserBoardPerp/math';

function getMarkPrice() {
  const intl = useIntl();
  return `<div class=" rounded-md w-p200 text-primaryOrderly  text-xs  text-left">
    ${intl.formatMessage({
      id: 'mark_price_tip',
      defaultMessage: 'Mark price is used for PnL calculating and liquidation.',
    })} 
  </div>`;
}

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
  symbolInfo,
}: {
  orders: Orders | undefined;
  precision: number;
  pendingOrders: MyOrder[];
  symbolInfo: SymbolInfo;
}) {
  // this function is to group orders by precision,

  const decimalPlaces = getDecimalPlaceByNumber(precision);

  // quantity: new BigNumber(asksItem[1]).toFixed(quantityDecimal, 1),

  if (!orders) return {};

  const asks = orders.asks;

  const bids = orders.bids;

  const groupedAsks = asks.reduce((acc, cur) => {
    const groupKey =
      decimalPlaces === 0
        ? new Big(new Big(cur[0]).div(precision).toFixed(0, 3))
            .times(precision)
            .toFixed(0, 3)
        : new Big(cur[0]).toFixed(decimalPlaces, 3);

    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr]
        ? new Big(acc[keyStr]).plus(new Big(cur[1])).toNumber()
        : cur[1],
    };
  }, {} as Record<string, number>);

  const sortedAsks = Object.entries(groupedAsks)
    .map(([price, amount]) => [Number(price), amount])
    .sort((a, b) => a[0] - b[0]);

  const groupedBids = bids.reduce((acc, cur) => {
    const groupKey =
      decimalPlaces === 0
        ? new Big(new Big(cur[0]).div(precision).toFixed(0, 0))
            .times(precision)
            .toFixed(0, 0)
        : new Big(cur[0]).toFixed(decimalPlaces, 0);

    const keyStr = groupKey.toString();

    return {
      ...acc,
      [groupKey]: acc[keyStr]
        ? new Big(acc[keyStr]).plus(new Big(cur[1])).toNumber()
        : cur[1],
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
        [groupKey]: new Big(cur[1])
          .plus(new Big(acc?.[sortedAsks[index - 1]?.[0]?.toString()] || 0))
          .toNumber(),
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
        [groupKey]: new Big(cur[1])
          .plus(new Big(acc?.[sortedBids[index - 1]?.[0]?.toString()] || 0))
          .toNumber(),
      };
    },

    {} as Record<string, number>
  );

  const groupMyPendingOrders = pendingOrders.reduce((acc, cur) => {
    const groupKey = Number(
      decimalPlaces === 0
        ? new Big(
            new Big(cur.price)
              .div(precision)
              .toFixed(0, cur.side === 'BUY' ? 0 : 3)
          )
            .times(precision)
            .toFixed(0, cur.side === 'BUY' ? 0 : 3)
        : new Big(cur.price).toFixed(decimalPlaces, cur.side === 'BUY' ? 0 : 3)
    );

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

export function getDecimalPlaceByNumber(precision: number) {
  const str = precision.toString();
  if (str.indexOf('e-') > -1) {
    return +str.split('e-')[1];
  }
  if (str.indexOf('.') === -1) return 0;
  else return str.split('.')[1].length;
}

export const REF_ORDERLY_PRECISION = 'REF_ORDERLY_PRECISION';

function OrderLine({
  order,
  i,
  totalSize,
  setBridgePrice,
  type,
  pendingOrders,
  groupMyPendingOrders,
  zIndex,
  decimalLength,
  symbolInfo,
  hideTotal,
}: {
  order: number[];
  i: number;
  totalSize: Record<string, number>;
  type: 'bid' | 'ask';
  setBridgePrice: (price: string) => void;
  pendingOrders: MyOrder[];
  groupMyPendingOrders: Record<string, number>;
  zIndex: number;
  setInViewCOunt: (count: number) => void;
  inViewCount: number;
  decimalLength: number;
  symbolInfo: SymbolInfo;
  hideTotal?: boolean;
}) {
  let quantityDecimal =
    Math.log10(symbolInfo.base_tick) > 0
      ? 0
      : -Math.log10(symbolInfo.base_tick);

  quantityDecimal = quantityDecimal > 3 ? 3 : quantityDecimal;
  if (symbolInfo.symbol.toLowerCase().includes('woo')) {
    quantityDecimal = 0;
  }

  return (
    <div
      className={
        'relative font-nunito grid pl-5 pr-4 cursor-pointer hover:bg-symbolHover grid-cols-3 lg:mr-2 py-1 justify-items-end'
      }
      id={`order-id-${order[0]}`}
      key={`orderbook-${type}-` + i}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setBridgePrice(order[0].toString());
      }}
    >
      <span
        className={` ${
          type === 'ask' ? 'text-sellColorNew' : 'text-buyGreen'
        } justify-self-start`}
      >
        {decimalLength === 0
          ? numberWithCommas(order[0])
          : numberWithCommasPadding(order[0], decimalLength)}
      </span>

      <span className="mr-4">
        {numberWithCommas(new Big(order[1]).toFixed(quantityDecimal, 0))}
      </span>
      {!hideTotal && (
        <span>
          {numberWithCommas(
            new Big(totalSize?.[order[0]]).toFixed(quantityDecimal, 0)
          )}
        </span>
      )}

      <div
        className="absolute left-0 top-1 z-40"
        style={{
          zIndex,
        }}
      >
        {pendingOrders && groupMyPendingOrders[order[0]] && (
          <MyOrderTip
            price={order[0]}
            scrollTagID={`${type === 'bid' ? 'buy' : 'sell'}-order-book-panel`}
            quantity={groupMyPendingOrders[order[0]]}
          />
        )}
      </div>
    </div>
  );
}

function OrderLineShrink({
  order,
  i,
  totalSize,
  setBridgePrice,
  type,
  pendingOrders,
  groupMyPendingOrders,
  zIndex,
  decimalLength,
  symbolInfo,
  hideTotal,
  reverse,
  onFlex,
}: {
  order: number[];
  i: number;
  totalSize: Record<string, number>;
  type: 'bid' | 'ask';
  setBridgePrice: (price: string) => void;
  pendingOrders: MyOrder[];
  groupMyPendingOrders: Record<string, number>;
  zIndex: number;
  setInViewCOunt: (count: number) => void;
  inViewCount: number;
  decimalLength: number;
  symbolInfo: SymbolInfo;
  hideTotal?: boolean;
  reverse?: boolean;
  onFlex?: boolean;
}) {
  let quantityDecimal =
    Math.log10(symbolInfo.base_tick) > 0
      ? 0
      : -Math.log10(symbolInfo.base_tick);

  quantityDecimal = quantityDecimal > 3 ? 3 : quantityDecimal;
  if (symbolInfo.symbol.toLowerCase().includes('woo')) {
    quantityDecimal = 0;
  }

  return (
    <div
      className={`relative font-nunito ${
        reverse ? 'flex-row-reverse flex' : 'frcb'
      } justify-between items-center cursor-pointer hover:bg-symbolHover grid-cols-3 xs:left-1 lg:mr-2 py-1 justify-items-end`}
      id={`order-id-${order[0]}`}
      key={`orderbook-${type}-` + i}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setBridgePrice(order[0].toString());
      }}
    >
      <span
        className={` ${
          type === 'ask' ? 'text-sellColorNew' : 'text-buyGreen'
        } justify-self-start`}
      >
        {decimalLength === 0
          ? numberWithCommas(order[0])
          : numberWithCommasPadding(order[0], decimalLength)}
      </span>

      <span className="">
        {numberWithCommas(new Big(order[1]).toFixed(quantityDecimal, 0))}
      </span>
      {!hideTotal && (
        <span>
          {numberWithCommas(
            new Big(totalSize?.[order[0]]).toFixed(quantityDecimal, 0)
          )}
        </span>
      )}

      <div
        className={`absolute top-1  z-40 ${
          onFlex ? '-right-4' : 'xs:-left-4'
        } `}
        style={{
          zIndex,
        }}
      >
        {pendingOrders && groupMyPendingOrders[order[0]] && (
          <MyOrderTip
            price={order[0]}
            scrollTagID={`${type === 'bid' ? 'buy' : 'sell'}-order-book-panel`}
            quantity={groupMyPendingOrders[order[0]]}
          />
        )}
      </div>
    </div>
  );
}

function OrderBook({ maintenance }: { maintenance: boolean }) {
  const {
    orders,
    symbol,
    pendingOrders,
    recentTrades,
    ordersUpdate,
    setBridgePrice,
    handlePendingOrderRefreshing,
    availableSymbols,
    indexprices,
    markPrices,
  } = useOrderlyContext();

  const curMarkPrice = markPrices?.find((i) => i.symbol === symbol)?.price;

  const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol) || {
    created_time: 1575441595650, // Unix epoch time in milliseconds
    updated_time: 1575441595650, // Unix epoch time in milliseconds
    symbol: 'SPOT_BTC_USDT',
    quote_min: 100,
    quote_max: 100000,
    quote_tick: 0.01,
    base_min: 0.0001,
    base_max: 20,
    base_tick: 0.0001,
    min_notional: 0.02,
    price_range: 0.99,
  };

  const storedPrecision = sessionStorage.getItem(REF_ORDERLY_PRECISION);

  const [inViewAsk, setInViewAsk] = useState<number>(0);

  const [inViewBid, setInViewBid] = useState<number>(0);

  const [precision, setPrecision] = useState<number>(0.01);

  useEffect(() => {
    if (!symbolInfo) return;
    let precision = symbolInfo.quote_tick;

    const storedNumberPrecision = storedPrecision ? Number(storedPrecision) : 0;

    if (
      storedNumberPrecision > 0 &&
      storedNumberPrecision > precision / 10 &&
      storedNumberPrecision < precision * 10 ** 5
    ) {
      precision = storedNumberPrecision;
    }

    setPrecision(precision);
  }, [JSON.stringify(symbolInfo)]);

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

  useEffect(() => {
    if (showPrecisionSelector) {
      document.documentElement.onclick = () => {
        setShowPrecisionSelector(false);
      };
    }
  }, [showPrecisionSelector]);

  const { asks, bids, asktotalSize, bidtotalSize, groupMyPendingOrders } =
    groupOrdersByPrecision({
      orders,
      precision,
      pendingOrders,
      symbolInfo,
    });

  const isMobile = useClientMobile();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);
  const [tab, setTab] = useState<'recent' | 'book'>('book');

  const [loading, setLoading] = useState<boolean>(orders === undefined);

  useEffect(() => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!!orders && symbolInfo) {
      setLoading(false);
    }
    if (maintenance) {
      setLoading(false);
    }
  }, [!!orders, availableSymbols, maintenance]);

  const [preMedian, setPreMedian] = useState<number>();

  const [curMedian, setCurMedian] = useState<number>();

  const recentTradePrice = recentTrades?.at(0)?.executed_price || 0;

  const ask_0 = orders?.asks?.[0]?.[0] || 0;

  const bid_0 = orders?.bids?.[0]?.[0] || 0;

  useEffect(() => {
    const newMedian = [recentTradePrice, ask_0, bid_0].sort((a, b) => a - b)[1];
    if (newMedian === 0) return;

    setPreMedian(curMedian);
    setCurMedian(newMedian);
  }, [recentTrades, ask_0, bid_0]);

  const displayMedian = numberWithCommasPadding(
    curMedian || 0,
    tickToPrecision(symbolInfo.quote_tick)
  );

  // const displayMedian = numberWithCommas(curMedian || 0);

  const diff = preMedian === undefined ? 0 : curMedian - preMedian || 0;

  const intl = useIntl();

  const symbolType = PerpOrSpot(symbol);

  const displayMarkPrice = (
    <div className="frcs gap-2">
      <MarkPriceFlag></MarkPriceFlag>

      {!curMarkPrice ? (
        '-'
      ) : (
        <span
          className="whitespace-nowrap text-xs text-white underline"
          style={{
            textDecorationLine: 'underline',
            textDecorationStyle: 'dashed',
            textUnderlineOffset: '3px',
            WebkitTextDecorationColor: '#7E8A93',
            textDecorationColor: '#7E8A93',
          }}
        >
          {/* {numberWithCommas(curMarkPrice)} */}
          {numberWithCommasPadding(
            curMarkPrice,
            tickToPrecision(symbolInfo.quote_tick)
          )}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full h-full flex flex-col  relative border  border-boxBorder text-sm rounded-2xl bg-black bg-opacity-10 py-4 ">
      <div className="px-4 relative flex mb-2 border-b border-white border-opacity-10 items-center ">
        <div
          onClick={() => {
            setTab('book');
          }}
          className={`cursor-pointer text-left relative ${
            tab === 'book' ? 'text-white' : 'text-primaryOrderly'
          } font-bold mb-1`}
        >
          {intl.formatMessage({
            id: 'orderbook',
            defaultMessage: 'Order Book',
          })}
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
          } ml-5 font-bold mb-1`}
        >
          {intl.formatMessage({
            id: 'trades',
            defaultMessage: 'Trades',
          })}
          {tab === 'recent' && (
            <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-1.5 left-0"></div>
          )}
        </div>
        {tab === 'book' && (
          <div
            className="max-w-fit min-w-p72 cursor-pointer rounded-md lg:bg-symbolHover pl-2 absolute   right-4 bottom-1 xs:bg-none md:bg-none xs:text-10px text-white flex justify-center items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isMobile) return;
              setShowPrecisionSelector(!showPrecisionSelector);
            }}
          >
            <span
              className="relative right-2 flex items-center justify-center text-primaryText text-xs"
              style={{
                height: '22px',
              }}
            >
              {!symbolInfo ? '-' : precision}
            </span>
            {isMobile && (
              <>
                <span
                  className="text-xl mr-2 rounded-md w-5 flex items-center justify-center h-5 bg-selectTokenV3BgColor text-primaryText"
                  onClick={() => {
                    if (precision > symbolInfo.quote_tick) {
                      setPrecision(precision / 10);
                    }
                  }}
                >
                  -
                </span>

                <span
                  className="text-xl flex items-center justify-center w-5 h-5 rounded-md bg-selectTokenV3BgColor text-primaryText"
                  onClick={() => {
                    if (precision < symbolInfo.quote_tick * 10 ** 4) {
                      setPrecision(precision * 10);
                    }
                  }}
                >
                  +
                </span>
              </>
            )}
            {!isMobile && (
              <MdArrowDropDown
                size={22}
                className="text-primaryOrderly absolute right-0 justify-self-end"
              ></MdArrowDropDown>
            )}

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
                    text: `${symbolInfo.quote_tick}`,
                    textId: `${symbolInfo.quote_tick}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10}`,
                    textId: `${symbolInfo.quote_tick * 10}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10 ** 2}`,
                    textId: `${symbolInfo.quote_tick * 10 ** 2}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10 ** 3}`,
                    textId: `${symbolInfo.quote_tick * 10 ** 3}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10 ** 4}`,
                    textId: `${symbolInfo.quote_tick * 10 ** 4}`,
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
          <div className="px-4 flex items-center text-xs mb-2 lg:mr-2 text-primaryOrderly justify-between ">
            <div className="flex items-center">
              <span className="flex items-center">
                {intl.formatMessage({
                  id: 'price',
                  defaultMessage: 'Price',
                })}
              </span>

              <span className="text-primaryText rounded-md ml-1 pt-0.5 px-1 text-xs py-0 bg-primaryOrderly bg-opacity-10">
                {symbolTo}
              </span>
            </div>

            <div className="flex items-center">
              <span>
                {intl.formatMessage({
                  id: 'qty',
                  defaultMessage: 'Qty',
                })}
              </span>

              <span className="text-primaryText rounded-md ml-1 pt-0.5 px-1 text-xs py-0 bg-primaryOrderly bg-opacity-10">
                {symbolFrom}
              </span>
            </div>

            <div className="flex items-center">
              {intl.formatMessage({
                id: 'total_orderly',
                defaultMessage: 'Total',
              })}
              <span className="text-primaryText rounded-md ml-1 pt-0.5 px-1 text-xs py-0 bg-primaryOrderly bg-opacity-10">
                {symbolFrom}
              </span>
            </div>
          </div>

          {/* sell  */}
          <section
            className="text-xs flex flex-shrink-0  flex-col-reverse overflow-auto text-white "
            id="sell-order-book-panel"
            style={{
              maxHeight: 'calc(50% - 50px)',
            }}
          >
            {!maintenance &&
              asks?.map((order, i) => {
                return (
                  <OrderLine
                    type="ask"
                    setBridgePrice={setBridgePrice}
                    order={order}
                    i={i}
                    pendingOrders={pendingOrders}
                    groupMyPendingOrders={groupMyPendingOrders}
                    totalSize={asktotalSize}
                    zIndex={31}
                    inViewCount={inViewAsk}
                    setInViewCOunt={setInViewAsk}
                    decimalLength={getDecimalPlaceByNumber(precision)}
                    symbolInfo={symbolInfo}
                  />
                );
              })}
          </section>

          {/* market trade */}
          {!maintenance && symbolType == 'SPOT' && (
            <div
              className={`text-center font-nunito flex items-center py-1 justify-center ${
                diff > 0
                  ? 'text-buyGreen'
                  : diff < 0
                  ? 'text-sellRed'
                  : 'text-primaryText'
              } text-lg`}
            >
              {orders &&
                recentTrades?.length > 0 &&
                curMedian !== undefined &&
                displayMedian}

              {orders && recentTrades?.length > 0 && diff !== 0 && (
                <IoArrowUpOutline
                  className={diff < 0 ? 'transform rotate-180' : ''}
                />
              )}
            </div>
          )}

          {!maintenance && symbolType == 'PERP' && (
            <div
              className={`text-center text-sm relative font-nunito flex items-center py-2 justify-center ${
                diff > 0
                  ? 'text-buyGreen'
                  : diff < 0
                  ? 'text-sellRed'
                  : 'text-primaryText'
              } text-lg`}
            >
              {
                <span className="top-0.5 whitespace-nowrap absolute left-4  text-lg">
                  {orders &&
                    recentTrades?.length > 0 &&
                    curMedian !== undefined &&
                    displayMedian}
                </span>
              }

              <div
                className="pl-1 text-white text-base"
                data-tooltip-id={'orderbook_mark_price'}
                data-class="reactTip"
                data-tooltip-html={getMarkPrice()}
                data-multiline={true}
              >
                {orders && curMarkPrice && displayMarkPrice}
                <CustomTooltip id={'orderbook_mark_price'} place="top" />
              </div>
            </div>
          )}

          {/* buy */}

          <section
            className="text-xs flex-row  overflow-auto  overflow-x-visible text-white"
            id="buy-order-book-panel"
          >
            {!maintenance &&
              bids?.map((order, i) => {
                return (
                  <OrderLine
                    type="bid"
                    setBridgePrice={setBridgePrice}
                    order={order}
                    i={i}
                    pendingOrders={pendingOrders}
                    groupMyPendingOrders={groupMyPendingOrders}
                    totalSize={bidtotalSize}
                    zIndex={30}
                    inViewCount={inViewBid}
                    setInViewCOunt={setInViewBid}
                    decimalLength={getDecimalPlaceByNumber(precision)}
                    symbolInfo={symbolInfo}
                  />
                );
              })}
          </section>
        </>
      )}
      {tab === 'recent' && !loading && <RecentTrade />}
    </div>
  );
}

export function OrderBookMobile({
  maintenance,
  shrink,
}: {
  maintenance: boolean;
  shrink?: boolean;
}) {
  const {
    orders,
    symbol,
    pendingOrders,
    recentTrades,
    ordersUpdate,
    setBridgePrice,
    handlePendingOrderRefreshing,
    availableSymbols,
    indexprices,
    markPrices,
  } = useOrderlyContext();

  const curMarkPrice = markPrices?.find((i) => i.symbol === symbol)?.price;

  const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol) || {
    created_time: 1575441595650, // Unix epoch time in milliseconds
    updated_time: 1575441595650, // Unix epoch time in milliseconds
    symbol: 'SPOT_BTC_USDT',
    quote_min: 100,
    quote_max: 100000,
    quote_tick: 0.01,
    base_min: 0.0001,
    base_max: 20,
    base_tick: 0.0001,
    min_notional: 0.02,
    price_range: 0.99,
  };

  const storedPrecision = sessionStorage.getItem(REF_ORDERLY_PRECISION);

  const [inViewAsk, setInViewAsk] = useState<number>(0);

  const [inViewBid, setInViewBid] = useState<number>(0);

  const [precision, setPrecision] = useState<number>(0.01);

  useEffect(() => {
    if (!symbolInfo) return;
    let precision = symbolInfo.quote_tick;

    const storedNumberPrecision = storedPrecision ? Number(storedPrecision) : 0;

    if (
      storedNumberPrecision > 0 &&
      storedNumberPrecision > precision / 10 &&
      storedNumberPrecision < precision * 10 ** 5
    ) {
      precision = storedNumberPrecision;
    }

    setPrecision(precision);
  }, [JSON.stringify(symbolInfo)]);

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

  useEffect(() => {
    if (showPrecisionSelector) {
      document.documentElement.onclick = () => {
        setShowPrecisionSelector(false);
      };
    }
  }, [showPrecisionSelector]);

  const { asks, bids, asktotalSize, bidtotalSize, groupMyPendingOrders } =
    groupOrdersByPrecision({
      orders,
      precision,
      pendingOrders,
      symbolInfo,
    });

  const { symbolFrom, symbolTo } = parseSymbol(symbol);
  const [tab, setTab] = useState<'recent' | 'book'>('book');

  const [loading, setLoading] = useState<boolean>(orders === undefined);

  useEffect(() => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!!orders && symbolInfo) {
      setLoading(false);
    }
    if (maintenance) {
      setLoading(false);
    }
  }, [!!orders, availableSymbols, maintenance]);

  const [preMedian, setPreMedian] = useState<number>();

  const [curMedian, setCurMedian] = useState<number>();

  const recentTradePrice = recentTrades?.at(0)?.executed_price || 0;

  const ask_0 = orders?.asks?.[0]?.[0] || 0;

  const bid_0 = orders?.bids?.[0]?.[0] || 0;

  useEffect(() => {
    const newMedian = [recentTradePrice, ask_0, bid_0].sort((a, b) => a - b)[1];
    if (newMedian === 0) return;

    setPreMedian(curMedian);
    setCurMedian(newMedian);
  }, [recentTrades, ask_0, bid_0]);

  const intl = useIntl();

  return (
    <div className="w-full  mt-4 flex flex-col  relative   border-boxBorder text-sm rounded-2xl bg-black bg-opacity-10 py-4 ">
      <div
        className="relative right-2  flex mb-2 border-b border-white border-opacity-10 items-center "
        style={{
          width: 'calc(100% + 16px)',
        }}
      >
        <div
          onClick={() => {
            setTab('book');
          }}
          className={`cursor-pointer pl-4 text-left relative ${
            tab === 'book' ? 'text-white' : 'text-primaryOrderly'
          } font-bold mb-1`}
        >
          {intl.formatMessage({
            id: 'orderbook',
            defaultMessage: 'Order Book',
          })}
          {tab === 'book' && (
            <div className="h-0.5 ml-3 bg-gradientFromHover rounded-lg w-full absolute -bottom-1.5 left-0"></div>
          )}
        </div>
        <div
          onClick={() => {
            setTab('recent');
          }}
          className={`cursor-pointer text-left relative ${
            tab === 'recent' ? 'text-white' : 'text-primaryOrderly'
          } ml-5 font-bold mb-1`}
        >
          {intl.formatMessage({
            id: 'trades',
            defaultMessage: 'Trades',
          })}
          {tab === 'recent' && (
            <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-1.5 left-0"></div>
          )}
        </div>
      </div>

      {!loading && tab === 'book' && (
        <div
          className="mb-2 relative right-2"
          style={{
            width: 'calc(100% + 16px)',
          }}
        >
          <div className="relative  text-primaryText border-b pb-2 border-opacity-10 border-white frcs">
            <div className="w-1/2 text-13px relative left-4">
              <FormattedMessage
                id={tab == 'book' ? 'buy' : 'price'}
                defaultMessage={tab == 'book' ? 'Buy' : 'Price'}
              ></FormattedMessage>
            </div>

            {tab === 'book' && (
              <div className="w-1/2 text-13px">
                <FormattedMessage
                  id="sell"
                  defaultMessage={'Sell'}
                ></FormattedMessage>
              </div>
            )}

            {tab === 'book' && (
              <div
                className=" w-full right-4 top-0 border border-white border-opacity-20 cursor-pointer rounded-md  pl-2 absolute  text-10px text-white frcs"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowPrecisionSelector(!showPrecisionSelector);
                }}
                style={{
                  maxWidth: '80px',
                }}
              >
                <span
                  className="relative  flex items-center justify-center text-white pl-1 text-xs"
                  style={{
                    height: '22px',
                  }}
                >
                  {!symbolInfo ? '-' : precision}
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
                    style={{
                      transform: 'translateY(calc(-100% - 30px))',
                    }}
                    className=" min-w-p72 -left-2 bottom-0  relative"
                    list={[
                      {
                        text: `${symbolInfo.quote_tick}`,
                        textId: `${symbolInfo.quote_tick}`,
                      },
                      {
                        text: `${symbolInfo.quote_tick * 10}`,
                        textId: `${symbolInfo.quote_tick * 10}`,
                      },
                      {
                        text: `${symbolInfo.quote_tick * 10 ** 2}`,
                        textId: `${symbolInfo.quote_tick * 10 ** 2}`,
                      },
                      {
                        text: `${symbolInfo.quote_tick * 10 ** 3}`,
                        textId: `${symbolInfo.quote_tick * 10 ** 3}`,
                      },
                      {
                        text: `${symbolInfo.quote_tick * 10 ** 4}`,
                        textId: `${symbolInfo.quote_tick * 10 ** 4}`,
                      },
                    ]}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {loading && <OrderlyLoading></OrderlyLoading>}

      {tab === 'book' && !loading && (
        <>
          <div
            className={`px-2 flex items-center text-xs mb-2 lg:mr-2 text-primaryOrderly justify-between `}
          >
            <div className="flex items-center">
              {intl.formatMessage({
                id: 'amount',
                defaultMessage: 'Amount',
              })}
              <span className="text-primaryText rounded-md ml-1 pt-0.5 px-1 text-xs py-0 bg-primaryOrderly bg-opacity-10">
                {symbolFrom}
              </span>
            </div>

            <div className="flex items-center">
              <span>
                {intl.formatMessage({
                  id: 'price',
                  defaultMessage: 'Price',
                })}
              </span>
            </div>

            <div className="flex items-center">
              {intl.formatMessage({
                id: 'amount',
                defaultMessage: 'Amount',
              })}
              <span className="text-primaryText rounded-md ml-1 pt-0.5 px-1 text-xs py-0 bg-primaryOrderly bg-opacity-10">
                {symbolFrom}
              </span>
            </div>
          </div>

          {/* sell  */}

          <div className="flex gap-3 px-1.5 relative right-1 w-full">
            {/* buy */}

            <section
              className="text-xs w-1/2 flex-row   overflow-x-visible text-white"
              id="buy-order-book-panel"
            >
              {!maintenance &&
                bids?.slice(0, 14).map((order, i) => {
                  return (
                    <OrderLineShrink
                      type="bid"
                      setBridgePrice={setBridgePrice}
                      order={order}
                      i={i}
                      pendingOrders={pendingOrders}
                      groupMyPendingOrders={groupMyPendingOrders}
                      totalSize={bidtotalSize}
                      zIndex={30}
                      inViewCount={inViewBid}
                      setInViewCOunt={setInViewBid}
                      decimalLength={getDecimalPlaceByNumber(precision)}
                      hideTotal={true}
                      reverse={true}
                      symbolInfo={symbolInfo}
                    />
                  );
                })}
            </section>

            <section
              className="text-xs w-1/2  flex-row flex-shrink-0   text-white "
              id="sell-order-book-panel"
            >
              {!maintenance &&
                asks?.slice(0, 14).map((order, i) => {
                  return (
                    <OrderLineShrink
                      type="ask"
                      setBridgePrice={setBridgePrice}
                      order={order}
                      i={i}
                      pendingOrders={pendingOrders}
                      groupMyPendingOrders={groupMyPendingOrders}
                      totalSize={asktotalSize}
                      zIndex={31}
                      hideTotal={true}
                      inViewCount={inViewAsk}
                      setInViewCOunt={setInViewAsk}
                      decimalLength={getDecimalPlaceByNumber(precision)}
                      symbolInfo={symbolInfo}
                      onFlex={true}
                    />
                  );
                })}
            </section>
          </div>
        </>
      )}
      {tab === 'recent' && !loading && <RecentTrade />}
    </div>
  );
}

export function OrderBookShrink({ maintenance }: { maintenance: boolean }) {
  const {
    orders,
    symbol,
    pendingOrders,
    recentTrades,
    ordersUpdate,
    setBridgePrice,
    handlePendingOrderRefreshing,
    availableSymbols,
    indexprices,
    markPrices,
  } = useOrderlyContext();

  const curMarkPrice = markPrices?.find((i) => i.symbol === symbol)?.price;

  const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol) || {
    created_time: 1575441595650, // Unix epoch time in milliseconds
    updated_time: 1575441595650, // Unix epoch time in milliseconds
    symbol: 'SPOT_BTC_USDT',
    quote_min: 100,
    quote_max: 100000,
    quote_tick: 0.01,
    base_min: 0.0001,
    base_max: 20,
    base_tick: 0.0001,
    min_notional: 0.02,
    price_range: 0.99,
  };

  const storedPrecision = sessionStorage.getItem(REF_ORDERLY_PRECISION);

  const [inViewAsk, setInViewAsk] = useState<number>(0);

  const [inViewBid, setInViewBid] = useState<number>(0);

  const [precision, setPrecision] = useState<number>(0.01);

  useEffect(() => {
    if (!symbolInfo) return;
    let precision = symbolInfo.quote_tick;

    const storedNumberPrecision = storedPrecision ? Number(storedPrecision) : 0;

    if (
      storedNumberPrecision > 0 &&
      storedNumberPrecision > precision / 10 &&
      storedNumberPrecision < precision * 10 ** 5
    ) {
      precision = storedNumberPrecision;
    }

    setPrecision(precision);
  }, [JSON.stringify(symbolInfo)]);

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

  useEffect(() => {
    if (showPrecisionSelector) {
      document.documentElement.onclick = () => {
        setShowPrecisionSelector(false);
      };
    }
  }, [showPrecisionSelector]);

  const { asks, bids, asktotalSize, bidtotalSize, groupMyPendingOrders } =
    groupOrdersByPrecision({
      orders,
      precision,
      pendingOrders,
      symbolInfo: symbolInfo as any,
    });

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [loading, setLoading] = useState<boolean>(orders === undefined);

  useEffect(() => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === symbol);

    if (!!orders && symbolInfo) {
      setLoading(false);
    }
    if (maintenance) {
      setLoading(false);
    }
  }, [!!orders, availableSymbols, maintenance]);

  const [preMedian, setPreMedian] = useState<number>();

  const [curMedian, setCurMedian] = useState<number>();

  const recentTradePrice = recentTrades?.at(0)?.executed_price || 0;

  const ask_0 = orders?.asks?.[0]?.[0] || 0;

  const bid_0 = orders?.bids?.[0]?.[0] || 0;

  useEffect(() => {
    const newMedian = [recentTradePrice, ask_0, bid_0].sort((a, b) => a - b)[1];
    if (newMedian === 0) return;

    setPreMedian(curMedian);
    setCurMedian(newMedian);
  }, [recentTrades, ask_0, bid_0]);

  // const displayMedian = numberWithCommas(curMedian || 0);

  const displayMedian = numberWithCommasPadding(
    curMedian || 0,
    tickToPrecision(symbolInfo.quote_tick)
  );

  const diff = preMedian === undefined ? 0 : curMedian - preMedian || 0;

  const intl = useIntl();

  const symbolType = PerpOrSpot(symbol);

  const displayMarkPrice = (
    <div className="frcs gap-2">
      <MarkPriceFlag></MarkPriceFlag>

      {!curMarkPrice ? (
        '-'
      ) : (
        <span
          className="whitespace-nowrap text-xs text-white underline"
          style={{
            textDecorationLine: 'underline',
            textDecorationStyle: 'dashed',
            textUnderlineOffset: '3px',
            WebkitTextDecorationColor: '#7E8A93',
            textDecorationColor: '#7E8A93',
          }}
        >
          {/* {numberWithCommas(curMarkPrice)} */}

          {numberWithCommasPadding(
            curMarkPrice,
            tickToPrecision(symbolInfo.quote_tick)
          )}
        </span>
      )}
    </div>
  );

  return (
    <div className="w-full  h-full flex flex-col  relative   border-boxBorder text-sm rounded-2xl  pb-4  pt-0">
      {loading && <OrderlyLoading></OrderlyLoading>}

      {!loading && (
        <>
          <div className="frcb text-xs mb-2 relative left-1 lg:mr-2 text-primaryOrderly  ">
            <div className="flex flex-col gap-1">
              <span className="flex items-center text-sm ">
                {intl.formatMessage({
                  id: 'price',
                  defaultMessage: 'Price',
                })}
              </span>

              <span className="text-primaryText rounded-md  px-1 pt-0.5  text-xs py-0 bg-primaryOrderly bg-opacity-10">
                {symbolTo}
              </span>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-sm">
                {intl.formatMessage({
                  id: 'qty',
                  defaultMessage: 'Qty',
                })}
              </span>

              <span className="text-primaryText px-1 rounded-md  pt-0.5  text-xs py-0 bg-primaryOrderly bg-opacity-10">
                {symbolFrom}
              </span>
            </div>
          </div>

          {/* sell  */}
          <section
            className="text-xs flex flex-shrink-0  flex-col-reverse text-white "
            id="sell-order-book-panel"
          >
            {!maintenance &&
              asks?.slice(0, 7).map((order, i) => {
                return (
                  <OrderLineShrink
                    type="ask"
                    setBridgePrice={setBridgePrice}
                    order={order}
                    i={i}
                    pendingOrders={pendingOrders}
                    groupMyPendingOrders={groupMyPendingOrders}
                    totalSize={asktotalSize}
                    zIndex={31}
                    inViewCount={inViewAsk}
                    setInViewCOunt={setInViewAsk}
                    hideTotal={true}
                    decimalLength={getDecimalPlaceByNumber(precision)}
                    symbolInfo={symbolInfo}
                  />
                );
              })}
          </section>

          {/* market trade */}
          {!maintenance && symbolType == 'SPOT' && (
            <div
              className={`font-nunito flex items-center py-1  ${
                diff > 0
                  ? 'text-buyGreen'
                  : diff < 0
                  ? 'text-sellRed'
                  : 'text-primaryText'
              } text-lg`}
            >
              {orders &&
                recentTrades?.length > 0 &&
                curMedian !== undefined &&
                displayMedian}

              {orders && recentTrades?.length > 0 && diff !== 0 && (
                <IoArrowUpOutline
                  className={diff < 0 ? 'transform rotate-180' : ''}
                />
              )}
            </div>
          )}

          {!maintenance && symbolType == 'PERP' && (
            <div
              className={` text-sm relative font-nunito flex flex-col gap-1 xs:items-start items-center py-2  ${
                diff > 0
                  ? 'text-buyGreen'
                  : diff < 0
                  ? 'text-sellRed'
                  : 'text-primaryText'
              } text-lg`}
            >
              <span className="top-0.5 whitespace-nowrap  text-lg">
                {orders &&
                  recentTrades?.length > 0 &&
                  curMedian !== undefined &&
                  displayMedian}
              </span>

              <div
                className="pl-1 text-white text-base"
                data-tooltip-id={'orderbook_mark_price'}
                data-class="reactTip"
                data-tooltip-html={getMarkPrice()}
                data-multiline={true}
              >
                {orders && curMarkPrice && displayMarkPrice}
                <CustomTooltip id={'orderbook_mark_price'} place="top" />
              </div>
            </div>
          )}

          {/* buy */}

          <section
            className="text-xs flex-row    overflow-x-visible text-white"
            id="buy-order-book-panel"
          >
            {!maintenance &&
              bids?.slice(0, 7).map((order, i) => {
                return (
                  <OrderLineShrink
                    type="bid"
                    setBridgePrice={setBridgePrice}
                    order={order}
                    i={i}
                    pendingOrders={pendingOrders}
                    groupMyPendingOrders={groupMyPendingOrders}
                    totalSize={bidtotalSize}
                    zIndex={30}
                    hideTotal={true}
                    inViewCount={inViewBid}
                    setInViewCOunt={setInViewBid}
                    decimalLength={getDecimalPlaceByNumber(precision)}
                    symbolInfo={symbolInfo}
                  />
                );
              })}
          </section>
          <div
            className=" w-full border border-white border-opacity-20 cursor-pointer rounded-md  pl-2 relative top-2 text-10px text-white frcs"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPrecisionSelector(!showPrecisionSelector);
            }}
          >
            <span
              className="relative  flex items-center justify-center text-white pl-1 text-xs"
              style={{
                height: '22px',
              }}
            >
              {!symbolInfo ? '-' : precision}
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
                style={{
                  transform: 'translateY(calc(-100% - 30px))',
                }}
                className=" min-w-p72 -left-2 bottom-0  relative"
                list={[
                  {
                    text: `${symbolInfo.quote_tick}`,
                    textId: `${symbolInfo.quote_tick}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10}`,
                    textId: `${symbolInfo.quote_tick * 10}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10 ** 2}`,
                    textId: `${symbolInfo.quote_tick * 10 ** 2}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10 ** 3}`,
                    textId: `${symbolInfo.quote_tick * 10 ** 3}`,
                  },
                  {
                    text: `${symbolInfo.quote_tick * 10 ** 4}`,
                    textId: `${symbolInfo.quote_tick * 10 ** 4}`,
                  },
                ]}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default OrderBook;
