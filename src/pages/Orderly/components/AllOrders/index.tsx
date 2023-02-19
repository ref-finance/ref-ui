import React, { useCallback, useEffect, useState } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { FlexRow, FlexRowBetween } from '../Common';
import { parseSymbol } from '../RecentTrade';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import { MdArrowDropDown, MdArrowDropUp } from 'react-icons/md';
import {
  MyOrder,
  EditOrderlyOrder,
  orderStatus,
  OrderTrade,
  TokenMetadata,
  SymbolInfo,
} from '../../orderly/type';
import {
  AllMarketIcon,
  ArrowParallel,
  OrderStateOutline,
  OrderlyIcon,
} from '../Common/Icons';
import { TextWrapper } from '../UserBoard';
import Big from 'big.js';
import { CancelButton } from '../OrderBoard';

import { formatTimeDate } from '../OrderBoard';

import { Selector } from '../OrderBoard';

import { AiOutlineClose, AiOutlineCheck } from 'react-icons/ai';
import { FlexRowStart, orderPopUp } from '../Common/index';
import {
  cancelOrder,
  cancelOrders,
  editOrder,
  getOrderTrades,
} from '../../orderly/off-chain-api';
import { useAllOrders } from '../../orderly/state';
import { useAllSymbolInfo } from './state';
import { useBatchTokenMetaFromSymbols } from '../ChartHeader/state';
import Modal from 'react-modal';

import { IoChevronBackOutline } from 'react-icons/io5';
import { useHistory } from 'react-router-dom';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';

export function EditConfirmOrderModal(
  props: Modal.Props & {
    confirmClick: () => void;
    symbolFrom: string;
    symbolTo: string;
    changeFrom: string;
    changeTo: string;
    editType: 'price' | 'quantity';
  }
) {
  const {
    onRequestClose,
    symbolFrom,
    symbolTo,
    changeFrom,
    changeTo,
    editType,
    confirmClick,
  } = props;

  return (
    <Modal {...props}>
      <div className=" rounded-2xl lg:w-80 xs:w-95vw gradientBorderWrapperNoShadow bg-boxBorder text-sm text-white border ">
        <div className="px-5 py-6 flex flex-col ">
          <div className="text-center mt-4">{`Changing the ${editType} of ${symbolFrom} / ${symbolTo}`}</div>
          <div className="flex mt-4 mb-6 items-center justify-center">
            <span className="text-primaryOrderly">{changeFrom}</span>
            <span className="mx-5">
              <ArrowParallel></ArrowParallel>
            </span>
            <span className="text-white">{changeTo}</span>
          </div>

          <div className="flex items-center mb-2 h-10 font-bold w-full justify-center">
            <button
              className="text-baseGreen border w-1/2 border-baseGreen ml-2 py-2 rounded-lg flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestClose && onRequestClose(e);
              }}
            >
              Cancel
            </button>

            <button
              className="text-white ml-2 py-2 w-1/2 rounded-lg bg-buyGradientGreen flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                confirmClick();
              }}
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function OrderLine({
  order,
  marketInfo,
  tokenIn,
}: {
  tokenIn: TokenMetadata;
  order: MyOrder;
  marketInfo: JSX.Element | undefined;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(order.symbol);

  const [quantity, setQuantity] = useState<string>(order.quantity.toString());

  const { accountId } = useWalletSelector();

  const { handlePendingOrderRefreshing } = useOrderlyContext();

  const [price, setPrice] = useState<string>(order.price.toString());

  const [openEditQuantity, setOpenEditQuantity] = useState<boolean>(false);

  const [openEditPrice, setOpenEditPrice] = useState<boolean>(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const inputRefPrice = React.useRef<HTMLInputElement>(null);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const [editType, setEditType] = useState<'quantity' | 'price'>();

  function handleEditOrder() {
    if (!accountId) return;

    if (
      new Big(order.price).eq(new Big(price)) &&
      new Big(order.quantity).eq(new Big(quantity))
    )
      return;

    editOrder({
      accountId,
      orderlyProps: {
        order_id: order.order_id,
        order_price: price || order.price.toString(),
        symbol: order.symbol,
        side: order.side,
        order_quantity: quantity || order.quantity.toString(),
        order_type: order.type,
        broker_id: 'ref_dex',
      },
    })
      .then((res) => {
        if (!!res.success) {
          handlePendingOrderRefreshing();
          return res;
        }
      })
      .then((res) => {
        setOpenEditQuantity(false);
        setOpenEditPrice(false);
        setShowEditModal(false);
        return res;
      })
      .then((res) => {
        return orderPopUp({
          orderType: 'Limit',
          side: order.side === 'SELL' ? 'Sell' : 'Buy',
          symbolName: order.symbol,
          price: price,
          size: quantity,
          tokenIn,
          timeStamp: res.timestamp,
        });
      });
  }
  const validateChange =
    new Big(price || 0).lte(0) ||
    new Big(quantity || 0).lte(0) ||
    (new Big(order.price).eq(new Big(price || 0)) &&
      new Big(order.quantity).eq(new Big(quantity || 0)));
  return (
    <div
      key={order.order_id}
      className="grid hover:bg-orderLineHover grid-cols-10 pl-5 pr-4 py-3 border-t border-white border-opacity-10"
    >
      <FlexRow className="relative col-span-1">
        <span>Limit</span>

        <div
          className="flex items-center relative ml-1.5 justify-center"
          style={{
            height: '14px',
            width: '14px',
          }}
        >
          <div className="absolute top-0 left-0  ">
            <OrderStateOutline />
          </div>

          <div
            className=""
            style={{
              height: '9px',
              width: '9px',
            }}
          >
            {order.status === 'PARTIAL_FILLED' && (
              <CircularProgressbar
                styles={buildStyles({
                  pathColor: '#62C340',
                  strokeLinecap: 'butt',
                  trailColor: 'transparent',
                })}
                background={false}
                strokeWidth={50}
                value={order.executed}
                maxValue={order.quantity}
              />
            )}
          </div>
        </div>
      </FlexRow>

      <FlexRow className="col-span-1">
        <TextWrapper
          className="px-2 text-sm"
          value={order.side === 'BUY' ? 'Buy' : 'Sell'}
          bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
          textC={order.side === 'BUY' ? 'text-buyGreen' : 'text-sellRed'}
        ></TextWrapper>
      </FlexRow>

      <FlexRow className="col-span-2">{marketInfo}</FlexRow>

      <FlexRowStart className="col-span-1 relative right-5 items-start">
        <div className="flex flex-col overflow-hidden bg-dark2 rounded-lg border border-border2 text-sm  w-14 text-white">
          <input
            ref={inputRef}
            inputMode="decimal"
            type={'number'}
            value={quantity}
            onChange={(e) => {
              setQuantity(e.target.value);
            }}
            onFocus={() => {
              setOpenEditQuantity(true);
            }}
            className="px-2 py-1 text-center"
          />

          <div
            className={`relative pb-2 top-2 w-full flex items-center border-t border-border2 text-primaryOrderly ${
              openEditQuantity ? '' : 'hidden'
            } `}
          >
            <div
              className="w-1/2 border-r border-border2 flex items-center py-1 justify-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenEditQuantity(false);
                setQuantity(order.quantity.toString());
              }}
            >
              <AiOutlineClose></AiOutlineClose>
            </div>

            <div
              className="w-1/2 flex items-center justify-center cursor-pointer py-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                //   handleEditOrder();
                if (validateChange) return;

                setShowEditModal(true);
                setEditType('quantity');
              }}
            >
              <AiOutlineCheck></AiOutlineCheck>
            </div>
          </div>
        </div>

        <span className="mx-1 relative top-1.5">/</span>

        <span className="relative top-1.5">{order.executed}</span>
      </FlexRowStart>

      <FlexRowStart className="col-span-1 relative right-2 items-start">
        <div className="flex flex-col overflow-hidden bg-dark2 rounded-lg border border-border2 text-sm  w-14 text-white">
          <input
            ref={inputRefPrice}
            inputMode="decimal"
            type={'number'}
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
            }}
            onFocus={() => {
              setOpenEditPrice(true);
            }}
            className="px-2 py-1 text-center"
          />

          <div
            className={`relative pb-2 top-2 w-full flex items-center border-t border-border2 text-primaryOrderly ${
              openEditPrice ? '' : 'hidden'
            } `}
          >
            <div
              className="w-1/2 border-r border-border2 flex items-center py-1 justify-center cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOpenEditPrice(false);
                setPrice(order.price.toString());
              }}
            >
              <AiOutlineClose></AiOutlineClose>
            </div>

            <div
              className="w-1/2 relative z-50 flex items-center justify-center cursor-pointer py-1"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                //   handleEditOrder();
                if (validateChange) return;
                setShowEditModal(true);
                setEditType('price');
              }}
            >
              <AiOutlineCheck></AiOutlineCheck>
            </div>
          </div>
        </div>
      </FlexRowStart>

      <FlexRow className="col-span-1 text-white ml-6">
        <span>
          {order.status === 'PARTIAL_FILLED'
            ? order.average_executed_price.toFixed(2)
            : order.price.toFixed(2)}
        </span>
      </FlexRow>

      <FlexRow className="col-span-1 text-white ml-4">
        {new Big(quantity || '0')
          .times(
            new Big(
              order.status === 'PARTIAL_FILLED'
                ? order.average_executed_price
                : order.price
            )
          )
          .toFixed(2)}
      </FlexRow>

      <FlexRow className="col-span-1 relative right-4 text-end text-primaryOrderly">
        {formatTimeDate(order.created_time)}
      </FlexRow>

      <FlexRow className="col-span-1 justify-self-center">
        <CancelButton
          text="Cancel"
          onClick={() => {
            if (!accountId) return;
            cancelOrder({
              accountId,
              DeleteParams: {
                order_id: order.order_id,
                symbol: order.symbol,
              },
            }).then((res) => {
              if (res.success === true) {
                handlePendingOrderRefreshing();
              }
            });
          }}
        />
      </FlexRow>
      {showEditModal && editType && (
        <EditConfirmOrderModal
          isOpen={showEditModal}
          onRequestClose={() => {
            setShowEditModal(false);
          }}
          editType={editType}
          symbolFrom={symbolFrom}
          symbolTo={symbolTo}
          confirmClick={handleEditOrder}
          changeFrom={
            editType === 'price'
              ? order.price.toString()
              : order.quantity.toString()
          }
          changeTo={editType === 'price' ? price : quantity}
        />
      )}
    </div>
  );
}

function HistoryOrderLine({
  order,
  symbol,
  marketInfo,
}: {
  order: MyOrder;
  symbol: string;
  marketInfo: JSX.Element | undefined;
}) {
  const [openFilledDetail, setOpenFilledDetail] = useState<boolean>(false);

  const [orderTradesHistory, setOrderTradesHistory] = useState<OrderTrade[]>();

  const { accountId } = useWalletSelector();

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  async function handleSubmit() {
    if (!!orderTradesHistory) {
      setOpenFilledDetail(!openFilledDetail);
      return;
    }
    if (!accountId) return;

    const res = await getOrderTrades({
      accountId,
      order_id: order.order_id,
    });
    if (!res.success) {
      return;
    }

    setOrderTradesHistory(res.data.rows);
    setOpenFilledDetail(!openFilledDetail);
  }

  return (
    <div className="hover:bg-orderLineHover">
      <div
        key={order.order_id}
        className="grid  grid-cols-10 pl-5 pr-4 py-3 border-t border-white border-opacity-10"
      >
        <FlexRow className="relative col-span-1">
          <span>{order.type === 'MARKET' ? 'Market' : 'Limit'}</span>
        </FlexRow>

        <FlexRow className="col-span-1">
          <TextWrapper
            className="px-2 text-sm"
            value={order.side === 'BUY' ? 'Buy' : 'Sell'}
            bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
            textC={order.side === 'BUY' ? 'text-buyGreen' : 'text-sellRed'}
          ></TextWrapper>
        </FlexRow>

        <FlexRow className="col-span-2">{marketInfo}</FlexRow>

        <FlexRow className="col-span-1 ml-2 ">
          <span className="text-white">{order.quantity || order.executed}</span>

          <span className="mx-1 ">/</span>

          <span className="">{order.executed}</span>
        </FlexRow>

        <FlexRow className="col-span-1 ml-4">
          <span>{order.type === 'MARKET' ? '-' : order.price}</span>
        </FlexRow>

        <FlexRow className="col-span-1 ml-6 text-white">
          <span>
            {order.status !== 'FILLED' ? '-' : order.average_executed_price}
          </span>
        </FlexRow>

        <FlexRow className="col-span-1 ml-4 text-white">
          {new Big(order.executed || '0')
            .times(new Big(order.average_executed_price || '0'))
            .minus(order.total_fee)
            .toFixed(2)}
        </FlexRow>

        <FlexRow className="col-span-1 text-primaryOrderly relative right-4 text-end">
          {formatTimeDate(order.created_time)}
        </FlexRow>

        <FlexRow className="col-span-1 text-white justify-self-center">
          <div className="flex items-center justify-center">
            <span className="capitalize">{order.status.toLowerCase()}</span>
            {order.status === 'FILLED' && (
              <div
                className={`cursor-pointer  rounded-full  ml-2 ${
                  openFilledDetail ? 'bg-baseGreen' : 'bg-dark3'
                }  w-3 h-3 flex items-center justify-center`}
                onClick={() => {
                  handleSubmit();
                }}
              >
                <div className="transform scale-95">
                  <MdArrowDropDown
                    size={22}
                    color={openFilledDetail ? '#1C272F' : '#17252E'}
                    className={`${
                      openFilledDetail ? 'transform rotate-180' : ''
                    } `}
                  ></MdArrowDropDown>
                </div>
              </div>
            )}
          </div>
        </FlexRow>
      </div>

      {openFilledDetail && orderTradesHistory && (
        <div className="flex flex-col items-end w-full mb-3">
          <div className="w-4/5 border-b border-white border-opacity-10 pb-2"></div>
          <div className="grid grid-cols-10  border-white mt-2 pb-3 pt-1 border-opacity-10 w-4/5 ">
            <div className="col-span-1 text-right">Qty{`(${symbolFrom})`}</div>
            <div className="col-span-1"></div>

            <div className="col-span-1 text-right">
              Price
              {`(${symbolTo})`}
            </div>
            <div className="col-span-1"></div>

            <div className="col-span-1 text-right">
              Fee
              {`(${symbolTo})`}
            </div>
            <div className="col-span-1"></div>

            <div className="col-span-1 text-right">
              Total
              {`(${symbolTo})`}
            </div>

            <div className="col-span-1"></div>

            <div className=" col-span-2 right-7 relative justify-self-end">
              Time
            </div>
          </div>
          <div className="w-4/5">
            {orderTradesHistory.map((trade) => (
              <div
                key={order.order_id + '_' + trade.id}
                className="text-white  pb-2 grid-cols-10 grid"
                style={{
                  height: '30px',
                }}
              >
                <div className="col-span-1 text-right">
                  {trade.executed_quantity}
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-1 text-right">
                  {trade.executed_price}
                </div>
                <div className="col-span-1"></div>
                <div className="col-span-1 text-right">{trade.fee}</div>
                <div className="col-span-1"></div>
                <div className="col-span-1 text-right">
                  {new Big(trade.executed_quantity || '0')
                    .times(new Big(trade.executed_price || '0'))
                    .minus(trade.fee)
                    .toFixed(2)}
                </div>

                <div className="col-span-1"></div>

                <div className="col-span-2 right-7 justify-self-end relative text-primaryOrderly ">
                  {formatTimeDate(trade.executed_timestamp)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function OpenOrders({
  orders,
  symbol,
  hidden,
  setOpenCount,
  allTokens,
  availableSymbols,
  setSelectedMarketSymbol,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;
  allTokens: {
    [key: string]: TokenMetadata;
  };
  setSelectedMarketSymbol: (s: string) => void;
  availableSymbols: SymbolInfo[] | undefined;
  setOpenCount: (c: number) => void;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);

  const [chooseSide, setChooseSide] = useState<'Both' | 'Buy' | 'Sell'>('Both');

  const [chooseMarketSymbol, setChooseMarketSymbol] =
    useState<string>('all_markets');
  const [showMarketSelector, setShowMarketSelector] = useState<boolean>(false);

  const [timeSorting, setTimeSorting] = useState<'asc' | 'dsc'>();

  const sortingFunc = (a: MyOrder, b: MyOrder) => {
    if (timeSorting === 'asc') {
      return a.created_time - b.created_time;
    } else {
      return b.created_time - a.created_time;
    }
  };

  const filterFunc = (order: MyOrder) => {
    const a =
      chooseSide === 'Both' ||
      order.side.toLowerCase() === chooseSide.toLowerCase();

    const b =
      chooseMarketSymbol === 'all_markets' ||
      order.symbol === chooseMarketSymbol;

    return a && b;
  };

  useEffect(() => {
    const showOrders = orders.filter(filterFunc).map((o) => o.symbol);

    if (
      showOrders.length === 0 ||
      new Set(showOrders).size !== showOrders.length
    ) {
      return;
    }

    setSelectedMarketSymbol(showOrders[0]);
  }, [chooseMarketSymbol, orders]);

  useEffect(() => {
    if (showSideSelector || showMarketSelector)
      document.addEventListener('click', () => {
        setShowSideSelector(false);
        setShowMarketSelector(false);
      });
  }, [showSideSelector, showMarketSelector]);

  useEffect(() => {
    if (!orders) return;

    setOpenCount(orders.filter(filterFunc).length);
  }, [chooseSide, chooseMarketSymbol, !!orders]);

  if (hidden) return null;

  const generateMarketList = () => {
    if (!availableSymbols || !allTokens) return [];
    const marketList = [
      {
        text: (
          <div className="flex items-center ">
            <div className="mr-2 ml-1 text-white text-sm">
              <AllMarketIcon />
            </div>
            <span className="text-white">All Markets</span>
          </div>
        ),
        textId: 'all_markets',
      },
    ];

    availableSymbols.forEach((symbol) => {
      const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);
      const fromToken = allTokens[symbolFrom];

      const render = (
        <div className="flex items-center text-white text-sm">
          <img
            src={fromToken?.icon}
            alt=""
            className="rounded-full w-5 h-5 mr-2"
          />

          <span>{symbolFrom}</span>

          <span className="text-primaryOrderly">/{symbolTo}</span>
        </div>
      );

      marketList.push({
        text: render,
        textId: symbol.symbol,
      });
    });

    return marketList;
  };

  const marketList = generateMarketList();

  return (
    <>
      {/* Header */}
      <div className="grid grid-cols-10 pl-5 pr-4 py-2 border-b   border-white border-opacity-10">
        <FlexRow className="col-span-1">Type</FlexRow>

        <FlexRow className="col-span-1  relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSideSelector(!showSideSelector);
              setShowMarketSelector(false);
            }}
          >
            <span>Side</span>

            <MdArrowDropDown
              size={22}
              color={showSideSelector ? 'white' : '#7E8A93'}
            />
          </div>

          {showSideSelector && (
            <Selector
              selected={chooseSide}
              setSelect={(value: any) => {
                setChooseSide(value);
                setShowSideSelector(false);
              }}
              list={[
                {
                  text: 'Both',
                  textId: 'Both',
                  className: 'text-white',
                },
                {
                  text: 'Buy',
                  textId: 'Buy',
                  className: 'text-buyGreen',
                },
                {
                  text: 'Sell',
                  textId: 'Sell',
                  className: 'text-sellRed',
                },
              ]}
            />
          )}
        </FlexRow>

        <FlexRow className="col-span-2  relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMarketSelector(!showMarketSelector);
              setShowSideSelector(false);
            }}
          >
            <span>Market</span>

            <MdArrowDropDown
              size={22}
              color={showMarketSelector ? 'white' : '#7E8A93'}
            />
          </div>

          {showMarketSelector && (
            <Selector
              selected={chooseMarketSymbol}
              setSelect={(value: any) => {
                setChooseMarketSymbol(value);
                setShowMarketSelector(false);
              }}
              list={marketList}
            />
          )}
        </FlexRow>

        <FlexRow className="col-span-1 relative right-3">
          <span>Qty/Filled</span>
        </FlexRow>

        <FlexRow className="col-span-1">
          <span>Price</span>
        </FlexRow>

        <FlexRow className="col-span-1">
          <span>Avg.Price</span>
        </FlexRow>
        <FlexRow className="col-span-1 ">
          <div>Est.Total</div>
        </FlexRow>

        <FlexRow className=" flex items-center justify-center col-span-1">
          <div
            className="cursor-pointer flex"
            onClick={() => {
              setTimeSorting(timeSorting === 'asc' ? 'dsc' : 'asc');
            }}
          >
            <span>Time</span>
            {
              <MdArrowDropDown
                className={timeSorting === 'asc' ? 'transform rotate-180' : ''}
                size={22}
                color={timeSorting === undefined ? '#7e8a93' : 'white'}
              />
            }
          </div>
        </FlexRow>

        <FlexRow className="col-span-1 justify-self-center">
          <span className="text-center"> Actions</span>
        </FlexRow>
      </div>
      <div className="flex max-h-vh65   overflow-auto  flex-col ">
        {orders.filter(filterFunc).length === 0 ? (
          <div className="text-dark4 mt-10 mb-4 text-center text-sm">
            No orders found
          </div>
        ) : (
          orders
            .sort(sortingFunc)
            .filter(filterFunc)
            .map((order) => {
              return (
                <OrderLine
                  tokenIn={allTokens[parseSymbol(order.symbol).symbolFrom]}
                  marketInfo={
                    marketList.find((m) => m.textId === order.symbol)?.text
                  }
                  order={order}
                  key={order.order_id}
                />
              );
            })
        )}
      </div>
    </>
  );
}

function HistoryOrders({
  orders,
  symbol,
  hidden,
  setHistoryCount,
  allTokens,
  availableSymbols,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;
  allTokens: {
    [key: string]: TokenMetadata;
  };
  availableSymbols: SymbolInfo[] | undefined;
  setHistoryCount: (c: number) => void;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);

  const [showStatuesSelector, setShowStatuesSelector] =
    useState<boolean>(false);

  const [chooseSide, setChooseSide] = useState<'Both' | 'Buy' | 'Sell'>('Both');

  const [chooseType, setChooseType] = useState<
    'All Type' | 'Limit Order' | 'Market Order'
  >('All Type');

  const [chooseStatus, setChooseStatus] = useState<
    'All Status' | 'Cancelled' | 'Filled' | 'Rejected'
  >('All Status');

  const [showTypeSelector, setShowTypeSelector] = useState<boolean>(false);

  const [timeSorting, setTimeSorting] = useState<'asc' | 'dsc'>();

  const [chooseMarketSymbol, setChooseMarketSymbol] =
    useState<string>('all_markets');
  const [showMarketSelector, setShowMarketSelector] = useState<boolean>(false);

  const sortingFunc = (a: MyOrder, b: MyOrder) => {
    if (timeSorting === 'asc') {
      return a.created_time - b.created_time;
    } else {
      return b.created_time - a.created_time;
    }
  };

  const filterFunc = (order: MyOrder) => {
    const side =
      chooseSide === 'Both' ||
      order.side.toLowerCase() === chooseSide.toLowerCase();

    const type =
      chooseType === 'All Type' ||
      (order.type === 'MARKET' && chooseType === 'Market Order') ||
      (order.type === 'LIMIT' && chooseType === 'Limit Order');

    const status =
      chooseStatus === 'All Status' ||
      order.status.toLowerCase() === chooseStatus.toLowerCase();

    const market =
      chooseMarketSymbol === 'all_markets' ||
      order.symbol === chooseMarketSymbol;

    return side && type && status && market;
  };

  useEffect(() => {
    if (!orders) return;

    setHistoryCount(orders.filter(filterFunc).length);
  }, [chooseSide, chooseType, chooseStatus, !!orders, chooseMarketSymbol]);

  useEffect(() => {
    if (
      showSideSelector ||
      showTypeSelector ||
      showStatuesSelector ||
      showMarketSelector
    )
      document.addEventListener('click', () => {
        setShowSideSelector(false);
        setShowTypeSelector(false);
        setShowMarketSelector(false);
        setShowStatuesSelector(false);
      });
  }, [
    showSideSelector,
    showTypeSelector,
    showStatuesSelector,
    showMarketSelector,
  ]);

  if (hidden) return null;

  const generateMarketList = () => {
    if (!availableSymbols || !allTokens) return [];
    const marketList = [
      {
        text: (
          <div className="flex items-center ">
            <div className="mr-2 ml-1 text-white text-sm">
              <AllMarketIcon />
            </div>
            <span className="text-white">All Markets</span>
          </div>
        ),
        textId: 'all_markets',
      },
    ];

    availableSymbols.forEach((symbol) => {
      const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);
      const fromToken = allTokens[symbolFrom];

      const render = (
        <div className="flex items-center text-white text-sm">
          <img
            src={fromToken?.icon}
            alt=""
            className="rounded-full w-5 h-5 mr-2"
          />

          <span>{symbolFrom}</span>

          <span className="text-primaryOrderly">/{symbolTo}</span>
        </div>
      );

      marketList.push({
        text: render,
        textId: symbol.symbol,
      });
    });

    return marketList;
  };

  const marketList = generateMarketList();

  return (
    <>
      {/* Header */}
      <div className="grid grid-cols-10 pl-5 pr-4 py-2 border-b   border-white border-opacity-10">
        <FlexRow className="col-span-1 relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTypeSelector(!showTypeSelector);
              setShowMarketSelector(false);
              setShowSideSelector(false);
              setShowStatuesSelector(false);
            }}
          >
            <span>Type</span>

            <MdArrowDropDown
              size={22}
              color={showTypeSelector ? 'white' : '#7E8A93'}
            />
          </div>
          {showTypeSelector && (
            <Selector
              selected={chooseType}
              setSelect={(value: any) => {
                setChooseType(value);
                setShowTypeSelector(false);
              }}
              list={[
                {
                  text: 'All Type',
                  textId: 'All Type',
                  className: 'text-white',
                },
                {
                  text: 'Limit Order',
                  textId: 'Limit Order',
                  className: 'text-white',
                },
                {
                  text: 'Market Order',
                  textId: 'Market Order',
                  className: 'text-white',
                },
              ]}
            />
          )}
        </FlexRow>

        <FlexRow className="col-span-1  relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSideSelector(!showSideSelector);
              setShowMarketSelector(false);
              setShowTypeSelector(false);
              setShowStatuesSelector(false);
            }}
          >
            <span>Side</span>

            <MdArrowDropDown
              size={22}
              color={showSideSelector ? 'white' : '#7E8A93'}
            />
          </div>

          {showSideSelector && (
            <Selector
              selected={chooseSide}
              setSelect={(value: any) => {
                setChooseSide(value);
                setShowSideSelector(false);
              }}
              list={[
                {
                  text: 'Both',
                  textId: 'Both',
                  className: 'text-white',
                },
                {
                  text: 'Buy',
                  textId: 'Buy',
                  className: 'text-buyGreen',
                },
                {
                  text: 'Sell',
                  textId: 'Sell',
                  className: 'text-sellRed',
                },
              ]}
            />
          )}
        </FlexRow>

        <FlexRow className="col-span-2  relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowMarketSelector(!showMarketSelector);
              setShowSideSelector(false);
              setShowTypeSelector(false);
              setShowStatuesSelector(false);
            }}
          >
            <span>Market</span>

            <MdArrowDropDown
              size={22}
              color={showMarketSelector ? 'white' : '#7E8A93'}
            />
          </div>

          {showMarketSelector && (
            <Selector
              selected={chooseMarketSymbol}
              setSelect={(value: any) => {
                setChooseMarketSymbol(value);
                setShowMarketSelector(false);
              }}
              list={marketList}
            />
          )}
        </FlexRow>

        <FlexRow className="col-span-1 relative right-3">
          <span>Qty/Filled</span>
        </FlexRow>

        <FlexRow className="col-span-1">
          <span>Price</span>
        </FlexRow>

        <FlexRow className="col-span-1">
          <span>Avg.Price</span>
        </FlexRow>
        <FlexRow className="col-span-1">
          <span>Est.Total</span>
        </FlexRow>

        <FlexRow className="justify-center col-span-1 ">
          <div
            className="cursor-pointer flex"
            onClick={() => {
              setTimeSorting(timeSorting === 'asc' ? 'dsc' : 'asc');
            }}
          >
            <span>Time</span>
            {
              <MdArrowDropDown
                className={timeSorting === 'asc' ? 'transform rotate-180' : ''}
                size={22}
                color={timeSorting === undefined ? '#7e8a93' : 'white'}
              />
            }
          </div>
        </FlexRow>

        <FlexRow className="col-span-1 relative justify-self-center">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowStatuesSelector(!showStatuesSelector);
            }}
          >
            <span>Status</span>

            <MdArrowDropDown
              size={22}
              color={showStatuesSelector ? 'white' : '#7E8A93'}
            />
          </div>

          {showStatuesSelector && (
            <Selector
              selected={chooseStatus}
              setSelect={setChooseStatus}
              list={[
                {
                  text: 'All Status',
                  textId: 'All Status',
                  className: 'text-white',
                },
                {
                  text: 'Filled',
                  textId: 'Filled',
                  className: 'text-white',
                },
                {
                  text: 'Cancelled',
                  textId: 'Cancelled',
                  className: 'text-white',
                },
                {
                  text: 'Rejected',
                  textId: 'Rejected',
                  className: 'text-white',
                },
              ]}
            />
          )}
        </FlexRow>
      </div>
      <div className="flex overflow-auto max-h-vh65  flex-col ">
        {orders.filter(filterFunc).length === 0 ? (
          <div className="text-dark4 mt-10 mb-4 text-center text-sm">
            No orders found
          </div>
        ) : (
          orders
            .sort(sortingFunc)
            .filter(filterFunc)
            .map((order) => {
              return (
                <HistoryOrderLine
                  marketInfo={
                    marketList.find((m) => m.textId === order.symbol)?.text
                  }
                  symbol={symbol}
                  order={order}
                  key={order.order_id}
                />
              );
            })
        )}
      </div>
    </>
  );
}

function AllOrderBoard() {
  const {
    symbol,
    myPendingOrdersRefreshing,
    handlePendingOrderRefreshing,
    tokenInfo,
  } = useOrderlyContext();

  const availableSymbols = useAllSymbolInfo();

  const allTokenSymbols = [
    ...new Set(
      !availableSymbols
        ? []
        : availableSymbols.flatMap((s) => {
            const { symbolFrom, symbolTo } = parseSymbol(s.symbol);

            return [symbolFrom, symbolTo];
          })
    ),
  ];

  const [selectedMarketSymbol, setSelectedMarketSymbol] = useState<string>();

  const allTokens = useBatchTokenMetaFromSymbols(
    allTokenSymbols.length > 0 ? allTokenSymbols : null,
    tokenInfo
  );

  const allOrders = useAllOrders({ refreshingTag: myPendingOrdersRefreshing });

  const { accountId } = useWalletSelector();

  const [tab, setTab] = useState<'open' | 'history'>('open');

  const openOrders = allOrders?.filter((o) => {
    return (
      o.type === 'LIMIT' &&
      (o.status === 'NEW' || o.status === 'PARTIAL_FILLED')
    );
  });

  // get history orders, which is orders that are not open orders
  const historyOrders = allOrders?.filter((o) => {
    return openOrders?.map((o) => o.order_id).indexOf(o.order_id) === -1;
  });

  const [openCount, setOpenCount] = useState<number>();

  const [historyCount, setHistoryCount] = useState<number>();

  const history = useHistory();

  useEffect(() => {
    if (openOrders !== undefined) {
      setOpenCount(openOrders.length);
    }

    if (historyOrders !== undefined) {
      setHistoryCount(historyOrders.length);
    }
  }, [allOrders, openOrders?.length, historyOrders?.length]);

  return (
    <>
      <div className="w-1000px m-auto flex items-center mb-6">
        <IoChevronBackOutline
          cursor={'pointer'}
          onClick={() => {
            history.push('/orderly');
          }}
          className="text-white pr-2"
          size={22}
        />

        <span className="mr-2">
          <OrderlyIcon></OrderlyIcon>
        </span>

        <span className="text-xl font-bold text-white">Your Orders</span>
      </div>

      <div className=" w-1000px m-auto  rounded-2xl shadow-sm border text-primaryOrderly border-boxBorder    text-sm bg-black  bg-opacity-10 pb-4">
        <FlexRowBetween className="pb-3 py-3 rounded-t-2xl bg-allOrderHeader px-5 mt-0 border-boxBorder">
          <FlexRow className="min-h-8">
            <FlexRow
              onClick={() => {
                setTab('open');
              }}
              className="justify-center cursor-pointer"
            >
              <span
                className={
                  tab === 'open' ? 'text-white' : 'text-primaryOrderly'
                }
              >
                Open Orders
              </span>

              <span
                className={`flex items-center justify-center h-4 px-1.5 min-w-fit text-xs rounded-md  ml-2 ${
                  tab === 'open'
                    ? allOrders === undefined
                      ? 'text-white bg-grayBgLight'
                      : 'bg-baseGreen text-black'
                    : 'text-primaryOrderly bg-symbolHover'
                } `}
              >
                {allOrders === undefined ? '-' : openCount}
              </span>
            </FlexRow>

            <FlexRow
              onClick={() => {
                setTab('history');
              }}
              className="justify-center ml-12 cursor-pointer"
            >
              <span
                className={
                  tab === 'history' ? 'text-white' : 'text-primaryOrderly'
                }
              >
                History
              </span>

              <span
                className={`flex items-center justify-center px-1.5 min-w-fit  text-xs rounded-md  ml-2 ${
                  tab === 'history'
                    ? 'bg-grayBgLight text-white'
                    : 'text-primaryOrderly bg-symbolHover'
                } `}
              >
                {allOrders === undefined ? '-' : historyCount}
              </span>
            </FlexRow>
          </FlexRow>

          {tab === 'open' && !!openCount && selectedMarketSymbol && (
            <CancelButton
              text="Cancel All"
              onClick={async () => {
                if (!accountId) return;

                return cancelOrders({
                  accountId,
                  DeleteParams: {
                    symbol: selectedMarketSymbol,
                  },
                }).then((res) => {
                  if (res.success === true) {
                    handlePendingOrderRefreshing();
                  }
                });
              }}
            />
          )}
        </FlexRowBetween>
        {
          <OpenOrders
            availableSymbols={availableSymbols}
            setSelectedMarketSymbol={setSelectedMarketSymbol}
            allTokens={allTokens}
            orders={openOrders || []}
            setOpenCount={setOpenCount}
            symbol={symbol}
            hidden={tab === 'history'}
          />
        }
        {
          <HistoryOrders
            availableSymbols={availableSymbols}
            allTokens={allTokens}
            setHistoryCount={setHistoryCount}
            orders={historyOrders || []}
            symbol={symbol}
            hidden={tab === 'open'}
          />
        }
      </div>
    </>
  );
}
export default AllOrderBoard;
