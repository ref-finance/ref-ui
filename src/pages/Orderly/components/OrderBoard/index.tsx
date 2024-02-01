import React, { useCallback, useEffect, useState } from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { FlexRow, FlexRowBetween } from '../Common';
import { parseSymbol } from '../RecentTrade';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {
  MyOrder,
  EditOrderlyOrder,
  orderStatus,
  OrderTrade,
  TokenInfo,
} from '../../orderly/type';
import { OrderStateOutline, CheckSelector } from '../Common/Icons';
import { TextWrapper } from '../UserBoard';
import Big from 'big.js';

import moment from 'moment';

import {
  AiOutlineClose,
  AiOutlineCheck,
  MdArrowDropDown,
} from '../../../../components/reactIcons';
import { FlexRowStart } from '../Common/index';
import {
  cancelOrder,
  cancelOrders,
  editOrder,
  getOrderTrades,
} from '../../orderly/off-chain-api';
import { EditConfirmOrderModal } from '../AllOrders/index';
import { useTokenMetaFromSymbol } from '../ChartHeader/state';
import { useHistory } from 'react-router-dom';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { ButtonTextWrapper } from '../../../../components/button/Button';

export function CancelButton({
  text,
  onClick,
}: {
  text: string;
  onClick: () => void;
}) {
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <button
      className={`px-1.5 ${
        loading ? 'opacity-70' : ''
      } rounded-lg py-1 flex items-center border  text-xs border-opacity-50 justify-center cursor-pointer text-warn border-warn`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        onClick();
      }}
      disabled={loading}
    >
      <ButtonTextWrapper
        loading={loading}
        loadingColor={'#FFA24D'}
        Text={() => {
          return (
            <span className="whitespace-nowrap text-opacity-50">{text}</span>
          );
        }}
      ></ButtonTextWrapper>
    </button>
  );
}

export function formatTimeDate(ts: number) {
  return moment(ts).format('YYYY-MM-DD HH:mm:ss');
}

export function Selector({
  list,
  selected,
  setSelect,
  className,
  width,
  style,
  top = 6,
}: {
  list: { text: JSX.Element | string; textId: string; className?: string }[];
  selected: string;
  setSelect: (value: any) => void;
  className?: string;
  width?: string;
  style?: any;
  top?: number;
}) {
  return (
    <div className={`absolute top-${top} z-50`} style={style}>
      <div
        className={`${className}  flex flex-col ${
          width || 'min-w-28'
        }  items-start py-2 px-1.5 rounded-lg border border-borderC text-sm  bg-darkBg `}
        style={{
          maxHeight: '275px',
          overflowY: 'auto',
        }}
      >
        {list.map((item, index) => {
          return (
            <div
              className={`whitespace-nowrap flex items-center justify-between cursor-pointer min-w-fit my-0.5 text-left px-1 py-1 w-full rounded-md ${
                item.className
              } ${
                selected === item.textId ? 'bg-symbolHover2' : ''
              } hover:bg-symbolHover2 `}
              key={item.textId + index}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSelect(item.textId);
              }}
            >
              <span className="whitespace-nowrap pr-2">{item.text}</span>
              {selected === item.textId && <CheckSelector />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrderLine({
  order,
  tokenInfo,
}: {
  order: MyOrder;
  tokenInfo: TokenInfo[] | undefined;
}) {
  const [quantity, setQuantity] = useState<string>(order.quantity.toString());

  const { symbolFrom, symbolTo } = parseSymbol(order.symbol);

  const tokenIn = useTokenMetaFromSymbol(symbolFrom, tokenInfo);

  const { accountId } = useWalletSelector();

  const { handlePendingOrderRefreshing } = useOrderlyContext();

  const [price, setPrice] = useState<string>(order.price.toString());

  const [openEditQuantity, setOpenEditQuantity] = useState<boolean>(false);

  const [openEditPrice, setOpenEditPrice] = useState<boolean>(false);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const inputRefPrice = React.useRef<HTMLInputElement>(null);
  const [editType, setEditType] = useState<'quantity' | 'price'>();

  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  function handleEditOrder() {
    if (!accountId) return;

    if (
      new Big(order.price).eq(new Big(price)) &&
      new Big(order.quantity).eq(new Big(quantity))
    )
      return;

    editOrder({
      order,
      accountId,
      orderlyProps: {
        order_id: order.order_id,
        order_price: Number(price || order.price.toString()),
        symbol: order.symbol,
        side: order.side,
        order_quantity: Number(quantity || order.quantity.toString()),
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
      className="grid hover:bg-orderLineHover grid-cols-10 pl-5 pr-4 py-2 border-t border-white border-opacity-10"
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

      <FlexRowStart className="col-span-2 items-start relative left-6">
        <span className="relative top-1.5">{order.executed}</span>

        <span className="mx-1 relative top-1.5">/</span>

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
      </FlexRowStart>

      <FlexRowStart className="col-span-2 items-start">
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

      <FlexRow className="col-span-2 text-white ml-4">
        {new Big(quantity || '0').times(new Big(order.price || '0')).toFixed(2)}
      </FlexRow>

      <FlexRow className="col-span-1 text-primaryOrderly whitespace-nowrap justify-self-end relative right-8">
        {formatTimeDate(order.created_time)}
      </FlexRow>

      <FlexRow className="col-span-1 justify-self-end relative right-1">
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
}: {
  order: MyOrder;
  symbol: string;
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
        className="grid  grid-cols-12 pl-5 pr-4 py-2 border-t border-white border-opacity-10"
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

        <FlexRowStart className="col-span-2 ml-4 items-start">
          <span className="text-white">{order.quantity || order.executed}</span>

          <span className="mx-1 ">/</span>

          <span className="">{order.executed}</span>
        </FlexRowStart>

        <FlexRowStart className="col-span-2 ml-4 items-start">
          <span>{order.type === 'MARKET' ? '-' : order.price}</span>
        </FlexRowStart>

        <FlexRow className="col-span-2 ml-6 text-white">
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

        <FlexRow className="col-span-2 text-primaryOrderly">
          {formatTimeDate(order.created_time)}
        </FlexRow>

        <FlexRow className="col-span-1 text-white">
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
          <div className="w-10/12 border-b border-white border-opacity-10 pb-2"></div>
          <div className="grid grid-cols-11  border-white mt-2 pb-3 pt-1 border-opacity-10 w-10/12 ">
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

            <div className=" col-span-2">Time</div>

            <div className="col-span-1"></div>
          </div>
          <div className="w-10/12">
            {orderTradesHistory.map((trade) => (
              <div
                key={order.order_id + '_' + trade.id}
                className="text-white  pb-2 grid-cols-11 grid"
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

                <div className="col-span-2 text-primaryOrderly pr-6 relative right-10">
                  {formatTimeDate(trade.executed_timestamp)}
                </div>

                <div className="col-span-1"></div>
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
  tokenInfo,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;
  tokenInfo: TokenInfo[] | undefined;
  setOpenCount: (c: number) => void;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);

  const [chooseSide, setChooseSide] = useState<'Both' | 'Buy' | 'Sell'>('Both');

  const [timeSorting, setTimeSorting] = useState<'asc' | 'dsc'>();

  const sortingFunc = (a: MyOrder, b: MyOrder) => {
    if (timeSorting === 'asc') {
      return a.created_time - b.created_time;
    } else {
      return b.created_time - a.created_time;
    }
  };

  const filterFunc = (order: MyOrder) => {
    if (chooseSide === 'Both') return true;

    return order.side.toLowerCase() === chooseSide.toLowerCase();
  };

  useEffect(() => {
    if (showSideSelector)
      document.addEventListener('click', () => {
        setShowSideSelector(false);
      });
  }, [showSideSelector]);

  useEffect(() => {
    if (!orders) return;

    setOpenCount(orders.filter(filterFunc).length);
  }, [chooseSide, !!orders]);

  if (hidden) return null;

  return (
    <>
      {/* Header */}
      <div className="grid grid-cols-10 pl-5  pr-4 py-2 border-b   border-white border-opacity-10">
        <FlexRow className="col-span-1  relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowSideSelector(!showSideSelector);
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
        <FlexRow className="col-span-1">Type</FlexRow>

        <FlexRow className="col-span-2">
          <span>Filled/Qty</span>

          <span
            className="ml-1.5 rounded
            px-1 bg-symbolHover
          
          "
            style={{
              fontSize: '10px',
            }}
          >
            {symbolFrom}
          </span>
        </FlexRow>

        <FlexRow className="col-span-2">
          <span>Price</span>

          <span
            className="ml-1.5 rounded
            px-1 bg-symbolHover
          
          "
            style={{
              fontSize: '10px',
            }}
          >
            {symbolTo}
          </span>
        </FlexRow>

        <FlexRow className="col-span-2">
          <span>Est. Total</span>
        </FlexRow>

        <FlexRow className=" flex items-center justify-center col-span-1 ">
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

        <FlexRow className="col-span-1 justify-self-end relative right-1">
          <span>Actions</span>
        </FlexRow>
      </div>

      {
        <div
          className="flex flex-col h-full overflow-auto"
          style={{
            height: 'calc(100vh - 570px)',
          }}
        >
          {orders.filter(filterFunc).length === 0 ? (
            <div className="text-dark4 mt-10 text-center mb-4 text-sm">
              No orders found
            </div>
          ) : (
            orders
              .sort(sortingFunc)
              .filter(filterFunc)
              .map((order) => {
                return (
                  <OrderLine
                    tokenInfo={tokenInfo}
                    order={order}
                    key={order.order_id}
                  />
                );
              })
          )}
        </div>
      }
    </>
  );
}

function HistoryOrders({
  orders,
  symbol,
  hidden,
  setHistoryCount,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;

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

    return side && type && status;
  };

  useEffect(() => {
    if (!orders) return;

    setHistoryCount(orders.filter(filterFunc).length);
  }, [chooseSide, chooseType, chooseStatus, !!orders]);

  useEffect(() => {
    if (showSideSelector || showTypeSelector || showStatuesSelector)
      document.addEventListener('click', () => {
        setShowSideSelector(false);
        setShowTypeSelector(false);

        setShowStatuesSelector(false);
      });
  }, [showSideSelector, showTypeSelector, showStatuesSelector]);

  if (hidden) return null;

  return (
    <>
      {/* Header */}
      <div className="grid grid-cols-12 pl-5 pr-4 py-2 border-b   border-white border-opacity-10">
        <FlexRow className="col-span-1 relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowTypeSelector(!showTypeSelector);
              setShowStatuesSelector(false);
              setShowSideSelector(false);
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

        <FlexRow className="col-span-2">
          <span>Qty/Filled</span>

          <span
            className="ml-1.5 rounded
            px-1 bg-symbolHover
          "
            style={{
              fontSize: '10px',
            }}
          >
            {symbolFrom}
          </span>
        </FlexRow>

        <FlexRow className="col-span-2">
          <span>Price</span>

          <span
            className="ml-1.5 rounded
            px-1 bg-symbolHover
          
          "
            style={{
              fontSize: '10px',
            }}
          >
            {symbolTo}
          </span>
        </FlexRow>

        <FlexRow className="col-span-2">
          <span>
            Avg. Price
            {}
          </span>

          <span
            className="ml-1.5 rounded
            px-1 bg-symbolHover
          
          "
            style={{
              fontSize: '10px',
            }}
          >
            {symbolTo}
          </span>
        </FlexRow>
        <FlexRow className="col-span-1">
          <span>Est. Total</span>
        </FlexRow>

        <FlexRow className="justify-center col-span-2 ">
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

        <FlexRow className="col-span-1 relative">
          <div
            className="cursor-pointer flex items-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowStatuesSelector(!showStatuesSelector);
              setShowTypeSelector(false);
              setShowSideSelector(false);
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
              setSelect={(value: any) => {
                setChooseStatus(value);
                setShowStatuesSelector(false);
              }}
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
      <div
        className="flex flex-col overflow-auto"
        style={{
          height: 'calc(100vh - 570px)',
        }}
      >
        {orders.filter(filterFunc).length === 0 ? (
          <div className="text-dark4 mt-10 text-center mb-4 text-sm">
            No orders found
          </div>
        ) : (
          orders
            .sort(sortingFunc)
            .filter(filterFunc)
            .map((order) => {
              return (
                <HistoryOrderLine
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

function OrderBoard() {
  const { symbol, allOrdersSymbol, tokenInfo, handlePendingOrderRefreshing } =
    useOrderlyContext();

  const { accountId } = useWalletSelector();

  const history = useHistory();

  const [tab, setTab] = useState<'open' | 'history'>('open');

  const openOrders = allOrdersSymbol?.filter((o) => {
    return (
      o.type === 'LIMIT' &&
      (o.status === 'NEW' || o.status === 'PARTIAL_FILLED')
    );
  });

  // get history orders, which is orders that are not open orders
  const historyOrders = allOrdersSymbol?.filter((o) => {
    return openOrders?.map((o) => o.order_id).indexOf(o.order_id) === -1;
  });

  const [openCount, setOpenCount] = useState<number>();

  const [historyCount, setHistoryCount] = useState<number>();

  useEffect(() => {
    if (openOrders !== undefined) {
      setOpenCount(openOrders.length);
    }

    if (historyOrders !== undefined) {
      setHistoryCount(historyOrders.length);
    }
  }, [allOrdersSymbol, openOrders?.length, historyOrders?.length]);

  return (
    <div className="rounded-2xl border text-primaryOrderly border-boxBorder    w-full text-sm bg-black  bg-opacity-10 py-4">
      <FlexRowBetween className="pb-3  pl-5 pr-3 border-boxBorder">
        <FlexRow className="min-h-8">
          <FlexRow
            onClick={() => {
              setTab('open');
            }}
            className="justify-center cursor-pointer"
          >
            <span
              className={tab === 'open' ? 'text-white' : 'text-primaryOrderly'}
            >
              Open Orders
            </span>

            <span
              className={`flex items-center justify-center h-4 px-1.5 min-w-fit text-xs rounded-md  ml-2 ${
                tab === 'open'
                  ? allOrdersSymbol === undefined
                    ? 'text-white bg-grayBgLight'
                    : 'bg-baseGreen text-black'
                  : 'text-primaryOrderly bg-symbolHover'
              } `}
            >
              {allOrdersSymbol === undefined ? '-' : openCount}
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
              {allOrdersSymbol === undefined ? '-' : historyCount}
            </span>
          </FlexRow>
        </FlexRow>

        {!!window.selectorAccountId && (
          <span
            className="text-sm py-1.5   mb-3 px-3 mr-4 rounded-lg bg-symbolHover cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push('/orderly/all-orders');
            }}
          >
            See all
          </span>
        )}
      </FlexRowBetween>
      {
        <OpenOrders
          tokenInfo={tokenInfo}
          orders={openOrders || []}
          setOpenCount={setOpenCount}
          symbol={symbol}
          hidden={tab === 'history'}
        />
      }
      {
        <HistoryOrders
          setHistoryCount={setHistoryCount}
          orders={historyOrders || []}
          symbol={symbol}
          hidden={tab === 'open'}
        />
      }
    </div>
  );
}

export default OrderBoard;
