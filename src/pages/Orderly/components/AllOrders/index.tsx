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
import { FlexRowStart, CheckBox, orderEditPopUpSuccess } from '../Common/index';
import {
  cancelOrder,
  cancelOrders,
  editOrder,
  getOrderTrades,
} from '../../orderly/off-chain-api';
import { useAllOrders } from '../../orderly/state';
import {
  useAllSymbolInfo,
  useOrderBook,
  useCurHolding,
  useCurHoldings,
} from './state';
import { useBatchTokenMetaFromSymbols } from '../ChartHeader/state';
import Modal from 'react-modal';

import { IoChevronBackOutline } from 'react-icons/io5';
import { useHistory } from 'react-router-dom';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { OrderlyLoading } from '../Common/Icons';
import { digitWrapper } from '../../utiles';
import { REF_ORDERLY_ACCOUNT_VALID } from '../UserBoard/index';
import { ONLY_ZEROS } from '../../../../utils/numbers';
import { orderEditPopUpFailure } from '../Common/index';
import { Holding } from '../../orderly/type';
import { useLargeScreen } from '../../../../utils/device';
import {
  getAccountInformation,
  getCurrentHolding,
} from '../../orderly/off-chain-api';

function hasScrolled(id: string, dir = 'vertical') {
  const ele = document.querySelector(`#${id}`);

  if (!ele) return false;

  let eleScroll = dir == 'vertical' ? 'scrollTop' : 'scrollLeft';

  let result = !!ele[eleScroll];
  if (!result) {
    ele[eleScroll] = 1;
    result = !!ele[eleScroll];
    ele[eleScroll] = 0;
  }

  return result;
}

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
      <div className=" rounded-2xl lg:w-96 xs:w-95vw gradientBorderWrapperZ bg-boxBorder text-sm text-white border ">
        <div className="px-5 py-6 flex flex-col ">
          <div className="text-center whitespace-nowrap mt-4">{`Changing the ${editType} of ${symbolFrom} / ${symbolTo}`}</div>
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
              style={{
                height: '38px',
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
              style={{
                height: '38px',
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

export function SymbolWrapper({ symbol }: { symbol: string }) {
  return (
    <span className="text-v3SwapGray bg-menuMoreBgColor rounded px-2 text-10px">
      {symbol}
    </span>
  );
}

function OrderLine({
  order,
  marketInfo,
  showCurSymbol,
  availableSymbols,
  holdingFrom,
  holdingTo,
  setOtherLineOpenTrigger,
  otherLineOpenTrigger,
}: {
  order: MyOrder;
  marketInfo: JSX.Element | undefined;
  showCurSymbol?: boolean;
  availableSymbols: SymbolInfo[];
  holdingFrom: Holding | undefined;
  holdingTo: Holding | undefined;
  setOtherLineOpenTrigger: (orderId?: number) => void;
  otherLineOpenTrigger: number;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(order.symbol);

  const [quantity, setQuantity] = useState<string>(order.quantity.toString());

  const { accountId } = useWalletSelector();

  const { handlePendingOrderRefreshing } = useOrderlyContext();

  const [price, setPrice] = useState<string>(order.price.toString());

  const [openEditQuantity, setOpenEditQuantity] = useState<boolean>(false);

  const [openEditPrice, setOpenEditPrice] = useState<boolean>(false);

  const orderBookThisSymbol = useOrderBook({
    symbol: order.symbol,
    openSig: [openEditPrice, openEditQuantity],
  });

  useEffect(() => {
    if (otherLineOpenTrigger === order.order_id) {
      return;
    }

    if (otherLineOpenTrigger && otherLineOpenTrigger !== order.order_id) {
      setOpenEditPrice(false);
      setOpenEditQuantity(false);
      return;
    }
  }, [otherLineOpenTrigger, openEditQuantity, openEditPrice]);

  const inputRef = React.useRef<HTMLInputElement>(null);

  const inputRefPrice = React.useRef<HTMLInputElement>(null);

  const [showEditModal, setShowEditModal] = useState<boolean>(false);

  const [editType, setEditType] = useState<'quantity' | 'price'>();

  const openEdit = openEditPrice || openEditQuantity;

  const editValidator = (price: string, size: string) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === order.symbol);

    let errorTipMsg = '';

    if (!symbolInfo) return;

    if (
      ONLY_ZEROS.test(order.executed.toString()) &&
      ONLY_ZEROS.test(quantity) &&
      !!quantity
    ) {
      errorTipMsg = `Quantity should be higher than ${symbolInfo.base_min}`;
    }

    if (
      (!symbolInfo || ONLY_ZEROS.test(price) || ONLY_ZEROS.test(size)) &&
      !errorTipMsg
    ) {
      return;
    }

    // price validator

    if (
      !ONLY_ZEROS.test(order.executed ? order.executed.toString() : '0') &&
      new Big(quantity).lte(order.executed || 0)
    ) {
      errorTipMsg = `Quantity should be higher than ${order.executed}`;
    }

    if (
      new Big(quantity || 0).gt(order.quantity || 0) &&
      holdingFrom &&
      holdingTo
    ) {
      let diff = new Big(quantity || 0).minus(new Big(order.quantity || 0));

      let left =
        order.side === 'BUY'
          ? holdingTo.holding + holdingTo.pending_short
          : holdingFrom.holding + holdingFrom.pending_short;

      if (order.side === 'BUY') {
        diff = diff.times(new Big(order.price));
      }

      if (new Big(left).lt(diff)) {
        errorTipMsg = `Insufficient ${
          order.side === 'BUY' ? symbolTo : symbolFrom
        }`;
      }
    }

    if (new Big(price || 0).lt(symbolInfo.quote_min)) {
      errorTipMsg = `Min price should be higher than or equal to ${symbolInfo.quote_min}`;
    }

    if (new Big(price || 0).gt(symbolInfo.quote_max)) {
      errorTipMsg = `Price should be lower than or equal to ${symbolInfo.quote_max}`;
    }

    if (
      new Big(new Big(price || 0).minus(new Big(symbolInfo.quote_min)))
        .mod(symbolInfo.quote_tick)
        .gt(0)
    ) {
      errorTipMsg = `Price should be multiple of ${symbolInfo.quote_tick}`;
    }

    const marketPrice =
      order.side === 'SELL'
        ? orderBookThisSymbol.bids[0].price
        : orderBookThisSymbol.asks[0].price;

    if (
      new Big(price || 0).gt(
        new Big(marketPrice || 0).times(1 + symbolInfo.price_range)
      ) &&
      order.side === 'BUY'
    ) {
      errorTipMsg = `Price should be less than or equal to ${new Big(
        marketPrice || 0
      ).times(1 + symbolInfo.price_range)}`;
    }

    if (
      new Big(price || 0).lt(
        new Big(marketPrice || 0).times(1 - symbolInfo.price_range)
      ) &&
      order.side === 'SELL'
    ) {
      errorTipMsg = `Price should be greater than or equal to ${new Big(
        marketPrice || 0
      ).times(1 - symbolInfo.price_range)}`;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      errorTipMsg = `The order value should be greater than or equal to ${symbolInfo.min_notional}`;
    }

    // size validator

    if (new Big(size || 0).lt(symbolInfo.base_min)) {
      errorTipMsg = `Quantity to ${order.side.toLowerCase()} should be greater than or equal to ${
        symbolInfo.base_min
      }`;
    }

    if (new Big(size || 0).gt(symbolInfo.base_max)) {
      errorTipMsg = `Quantity to ${order.side.toLowerCase()} should be less than or equal to ${
        symbolInfo.base_max
      }`;
    }

    if (
      new Big(new Big(size || 0).minus(new Big(symbolInfo.base_min)))
        .mod(symbolInfo.base_tick)
        .gt(0)
    ) {
      errorTipMsg = `Quantity should be multiple of ${symbolInfo.base_tick}`;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      errorTipMsg = `The order value should be greater than or equal to ${symbolInfo.min_notional}`;
    }
    if (!!errorTipMsg) {
      orderEditPopUpFailure({
        tip: errorTipMsg,
      });
      return false;
    }

    return true;
  };
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
        if (!res.success) {
          orderEditPopUpFailure({
            tip: res.message,
          });
        }

        if (!!res.success) {
          handlePendingOrderRefreshing();
          orderEditPopUpSuccess({
            side: order.side === 'SELL' ? 'Sell' : 'Buy',
            symbolName: order.symbol,
            size: quantity || order.quantity.toString(),
            cancel: false,
            price: price || order.price.toString(),
          });
        }
        return res;
      })
      .then((res) => {
        setOpenEditQuantity(false);
        setOpenEditPrice(false);
        setShowEditModal(false);
        if (!res.success) {
          setPrice(order.price.toString());
          setQuantity(order.quantity.toString());
        }
      });
  }

  const validateChange =
    new Big(order.price).eq(new Big(price || 0)) &&
    new Big(order.quantity).eq(new Big(quantity || 0));

  function getVerticalAlign() {
    const el = document.querySelector(`#order-line-${order.order_id}`);
    if (!el) return;
    if (openEditQuantity || openEditPrice) {
      return 'baseline';
    }
  }

  return (
    <tr
      key={order.order_id}
      id={'order-line-' + order.order_id}
      className={` hover:bg-orderLineHover table table-fixed w-full  pl-5 pr-4 py-3 border-t  border-white border-opacity-10`}
      style={{
        verticalAlign: getVerticalAlign(),
      }}
    >
      <td
        className={`col-span-2 py-3 pl-5 relative  ${
          openEdit ? 'items-start ' : 'items-center'
        } ${showCurSymbol ? 'hidden' : ''}`}
      >
        <div className="flex items-center ">{marketInfo}</div>
      </td>
      <td
        className={`col-span-1 py-3 relative  ${
          openEdit ? 'items-start ' : 'items-center'
        } ${showCurSymbol ? 'pl-5' : 'pl-0'} `}
      >
        <TextWrapper
          className="px-2 text-sm"
          value={order.side === 'BUY' ? 'Buy' : 'Sell'}
          bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
          textC={order.side === 'BUY' ? 'text-buyGreen' : 'text-sellRed'}
        ></TextWrapper>
      </td>
      <td
        className={`relative  col-span-1  ${
          openEdit ? 'items-start relative ' : 'items-center'
        }`}
      >
        <div className="flex items-center">
          <span className="text-white capitalize">
            {order.type === 'FOK' || order.type === 'IOC'
              ? order.type
              : order.type.replace('_', ' ').toLowerCase()}
          </span>

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
        </div>
      </td>
      <td>
        <div
          className={`flex  relative  justify-self-end  ${
            openEditQuantity ? 'items-start' : 'items-center'
          }`}
        >
          <span className="relative ">
            {digitWrapper(order.executed.toString(), 3)}
          </span>
          <span className="mx-1 relative ">/</span>

          <div
            className={`flex flex-col overflow-hidden mb-0.5  rounded-lg ${
              openEditQuantity ? 'border bg-dark2 relative bottom-1.5' : ''
            }  border-border2 text-sm  w-14 text-white`}
          >
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
                setOpenEditPrice(false);
                setPrice(order.price.toString());
                setOtherLineOpenTrigger(order.order_id);
              }}
              className={` px-2 py-1 pt-1.5  ${
                !openEditQuantity ? 'text-left pl-1' : 'text-center'
              }`}
              style={{
                width: `${order.quantity.toString().length * 12}px`,
                minWidth: '48px',
              }}
            />

            <div
              className={`w-full flex items-center border-t border-border2 text-primaryOrderly ${
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
                  if (validateChange) {
                    setOpenEditQuantity(false);
                    return;
                  }
                  if (!editValidator(price, quantity)) return;

                  setShowEditModal(true);
                  setEditType('quantity');
                }}
              >
                <AiOutlineCheck></AiOutlineCheck>
              </div>
            </div>
          </div>
        </div>
      </td>
      <td>
        <div
          className={`flex mb-1 flex-col overflow-hidden  rounded-lg  ${
            openEditPrice ? 'border bg-dark2 ' : ''
          } border-border2 text-sm   max-w-max text-white`}
          style={{
            width: `${order.price.toString().length * 12}px`,
            minWidth: '48px',
          }}
        >
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
              setOpenEditQuantity(false);
              setQuantity(order.quantity.toString());
              setOtherLineOpenTrigger(order.order_id);
            }}
            className={`px-2 py-1 pt-1.5   ${
              !openEditPrice ? 'text-left' : 'text-center'
            }`}
          />

          <div
            className={` w-full flex items-center border-t border-border2 text-primaryOrderly ${
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
                if (validateChange) {
                  setOpenEditPrice(false);
                  return;
                }

                if (!editValidator(price, quantity)) return;

                setShowEditModal(true);
                setEditType('price');
              }}
            >
              <AiOutlineCheck></AiOutlineCheck>
            </div>
          </div>
        </div>
      </td>

      <td
        className={`  col-span-1  relative   justify-self-end text-white  ${
          openEdit ? 'items-start ' : 'items-center'
        }`}
      >
        {digitWrapper(
          new Big(quantity || '0')
            .times(new Big(order.price || order.average_executed_price || 0))
            .toFixed(5),
          3
        )}
      </td>

      <td
        className={`col-span-1 relative transform translate-x-1/3 whitespace-nowrap justify-self-end  text-end text-primaryOrderly  ${
          openEdit ? 'items-start ' : 'items-center'
        }`}
      >
        {formatTimeDate(order.created_time)}
      </td>

      <td
        className={`col-span-1 py-4 justify-self-center pr-4 ${
          openEdit ? ' items-start' : 'items-center'
        }`}
        align="right"
      >
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
                return orderEditPopUpSuccess({
                  side: order.side == 'BUY' ? 'Buy' : 'Sell',
                  size: quantity,
                  price,
                  cancel: true,
                  symbolName: order.symbol,
                });
              }
            });
          }}
        />
      </td>
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
    </tr>
  );
}

function HistoryOrderLine({
  order,
  symbol,
  marketInfo,
  showCurSymbol,
}: {
  order: MyOrder;
  symbol: string;
  marketInfo: JSX.Element | undefined;
  showCurSymbol?: boolean;
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

  const [hover, setHover] = useState<boolean>(false);

  return (
    <>
      <tr
        key={order.order_id}
        className={`${
          hover ? 'bg-orderLineHover' : ''
        }  table table-fixed w-full pl-5 pr-4 py-3 border-t border-white border-opacity-10`}
        onMouseEnter={()=>{
          setHover(true)
        }}
        onMouseLeave={()=>{
          setHover(false)
        }}
      >
        <td
          className={` py-3 pl-5 relative   ${showCurSymbol ? 'hidden' : ''}`}
        >
          {marketInfo}
        </td>

        <td className={`col-span-1 py-3 ${showCurSymbol ? 'pl-5' : ''}`}>
          <TextWrapper
            className="px-2 text-sm"
            value={order.side === 'BUY' ? 'Buy' : 'Sell'}
            bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
            textC={order.side === 'BUY' ? 'text-buyGreen' : 'text-sellRed'}
          />
        </td>

        <td>
          <FlexRow className="relative col-span-1">
            <span className={`text-white capitalize `}>
              {order.type === 'FOK' || order.type === 'IOC'
                ? order.type
                : order.type.replace('_', ' ').toLowerCase()}
            </span>

            <div
              className={
                order.type !== 'MARKET'
                  ? 'flex items-center relative ml-1.5 justify-center'
                  : 'hidden'
              }
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
                {order.type !== 'MARKET' && (
                  <CircularProgressbar
                    styles={buildStyles({
                      pathColor: '#62C340',
                      strokeLinecap: 'butt',
                      trailColor: 'transparent',
                    })}
                    background={false}
                    strokeWidth={50}
                    value={order.executed || 0}
                    maxValue={order.quantity}
                  />
                )}
              </div>
            </div>
          </FlexRow>
        </td>

        <td>
          <FlexRow className="col-span-1  ">
            <span className="">
              {digitWrapper(order.executed.toString(), 3)}
            </span>

            <span className="mx-1 ">/</span>

            <span className="text-white ">
              {digitWrapper((order.quantity || order.executed).toString(), 3)}
            </span>
          </FlexRow>
        </td>

        <td className={`col-span-1 text-white  justify-self-end relative `}>
          <span>
            {order.price || order.average_executed_price
              ? digitWrapper(
                  (order.price || order.average_executed_price).toString(),
                  3
                )
              : '-'}
          </span>
        </td>

        <td className={`col-span-1 relative justify-self-end  text-white`}>
          <span>
            {order.average_executed_price === null
              ? '-'
              : digitWrapper(order.average_executed_price.toString(), 2)}
          </span>
        </td>

        <td
          className={`col-span-1 ml-4 justify-self-end relative   text-white`}
        >
          {digitWrapper(
            new Big(order.quantity || '0')
              .times(
                new Big(order.price || order.average_executed_price || '0')
              )
              .toFixed(4, 0),
            2
          )}
        </td>

        <td
          className={`col-span-1 py-4 whitespace-nowrap text-primaryOrderly justify-self-end relative   text-end`}
        >
          {formatTimeDate(order.created_time)}
        </td>

        <td className="pr-6" align="right">
          <div className="flex items-center justify-end text-white">
            <span className="capitalize">{order.status.toLowerCase()}</span>
            {order.executed !== null && order.executed > 0 && (
              <div
                className={`cursor-pointer  rounded-md  ml-2 ${
                  openFilledDetail ? 'bg-light1' : 'bg-symbolHover3'
                }  w-5 h-5 flex items-center justify-center`}
                onClick={() => {
                  handleSubmit();
                }}
              >
                <div className="transform scale-95">
                  <MdArrowDropDown
                    size={22}
                    color={
                      openFilledDetail ? '#FFFFFF' : '#limitOrderInputColor'
                    }
                    className={`${
                      openFilledDetail ? 'transform rotate-180' : ''
                    } `}
                  ></MdArrowDropDown>
                </div>
              </div>
            )}
          </div>
        </td>
      </tr>

      <tr
        className={`table table-fixed 
              ${hover ? 'bg-orderLineHover' : ''}
            }`}
            onMouseEnter={()=>{
              setHover(true)
            }}
            onMouseLeave={()=>{
              setHover(false)
            }}
      >
        {openFilledDetail && orderTradesHistory && (
          <table
            className={`table-fixed ${
              hover ? 'bg-orderLineHover' : ''
            } flex-col items-end `}
            align="right"
            style={{
              width: showCurSymbol ? '75%' : '66%',
            }}
          >
            <thead
              className={`w-full   text-xs grid-cols-6 justify-items-start  border-white mt-2 pb-3 pt-1 border-opacity-10  `}
            >
              <tr className="w-full">
                <td className="">Qty</td>

                <td className="">Price</td>

                <td className="">Total</td>

                <td className="">
                  <div className="flex items-center">
                    Fee
                    <TextWrapper
                      value={order.fee_asset}
                      className="ml-2 text-xs py-0 px-1"
                      textC="text-primaryText"
                    />
                  </div>
                </td>

                <td className="text-right pr-6" align="right" colSpan={2}>
                  Time
                </td>
              </tr>
            </thead>
            <tbody className="w-full">
              {orderTradesHistory.map((trade) => (
                <tr
                  key={order.order_id + '_' + trade.id}
                  className="text-white  pb-2 "
                  style={{
                    height: '30px',
                  }}
                >
                  <td className="">
                    {digitWrapper(trade.executed_quantity.toString(), 2)}
                  </td>
                  <td className="">
                    {digitWrapper(trade.executed_price.toString(), 2)}
                  </td>
                  <td className="">
                    {digitWrapper(
                      new Big(trade.executed_quantity || '0')
                        .times(new Big(trade.executed_price || '0'))
                        .toFixed(4),
                      2
                    )}
                  </td>
                  <td className="">{trade.fee}</td>

                  <td
                    className=" pr-6 py-3  text-primaryOrderly "
                    align="right"
                    colSpan={2}
                  >
                    {formatTimeDate(trade.executed_timestamp)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </tr>
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
  showCurSymbol,
  loading,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;
  allTokens: {
    [key: string]: TokenMetadata;
  };
  showCurSymbol: boolean;
  setSelectedMarketSymbol: (s: string) => void;
  availableSymbols: SymbolInfo[] | undefined;
  setOpenCount: (c: number) => void;
  loading: boolean;
}) {
  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);

  const [otherLineOpenTrigger, setOtherLineOpenTrigger] = useState<number>();

  const curHoldings = useCurHoldings();

  const [chooseSide, setChooseSide] = useState<'Both' | 'Buy' | 'Sell'>('Both');

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [chooseMarketSymbol, setChooseMarketSymbol] = useState<string>(
    showCurSymbol ? symbol : 'all_markets'
  );
  const [showMarketSelector, setShowMarketSelector] = useState<boolean>(false);

  const [timeSorting, setTimeSorting] = useState<'asc' | 'dsc'>(
    loading ? undefined : 'dsc'
  );

  const [chooseType, setChooseType] = useState<'All' | 'Limit' | 'Post Only'>(
    'All'
  );

  const [showTypeSelector, setShowTypeSelector] = useState<boolean>(false);

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

    const c =
      chooseType === 'All' ||
      (order.type === 'LIMIT' && chooseType === 'Limit') ||
      (order.type === 'POST_ONLY' && chooseType === 'Post Only');

    return a && b && c;
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
  }, [chooseMarketSymbol, orders, chooseType]);

  useEffect(() => {
    if (showSideSelector || showMarketSelector || showTypeSelector)
      document.addEventListener('click', () => {
        setShowSideSelector(false);
        setShowMarketSelector(false);
        setShowTypeSelector(false);
      });
  }, [showSideSelector, showMarketSelector, showTypeSelector]);

  useEffect(() => {
    if (!orders) return;

    setOpenCount(orders.filter(filterFunc).length);
  }, [chooseSide, chooseMarketSymbol, !!orders, chooseType]);

  useEffect(() => {
    if (showCurSymbol) {
      setChooseMarketSymbol(symbol);
    } else {
      setChooseMarketSymbol('all_markets');
    }
  }, [showCurSymbol, symbol]);
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
            <span className="text-white">All Instrument</span>
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
    <table className="table-fixed w-full">
      {/* Header */}
      <thead
        className={`w-full table table-fixed  pl-5 pr-4 py-2    border-white border-opacity-10`}
        style={{
          width: 'calc(100% - 9px)',
        }}
      >
        <tr className="w-full table-fixed">
          <th className={showCurSymbol ? 'hidden' : 'pl-5 py-2'}>
            <FlexRow
              className={showCurSymbol ? 'hidden' : 'col-span-2  relative'}
            >
              <div
                className="cursor-pointer flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowMarketSelector(!showMarketSelector);
                  setShowSideSelector(false);
                  setShowTypeSelector(false);
                }}
              >
                <span className="flex items-center">
                  {chooseMarketSymbol === 'all_markets' ? (
                    'All Instrument'
                  ) : (
                    <>
                      <span className="text-white">
                        {parseSymbol(chooseMarketSymbol).symbolFrom}
                      </span>
                      /{parseSymbol(chooseMarketSymbol).symbolTo}
                    </>
                  )}
                </span>

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
          </th>

          <th>
            <FlexRow
              className={`col-span-1 py-2 ${
                showCurSymbol ? 'pl-5' : ''
              } relative`}
            >
              <div
                className="cursor-pointer flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowSideSelector(!showSideSelector);
                  setShowMarketSelector(false);
                  setShowTypeSelector(false);
                }}
              >
                <span>{chooseSide === 'Both' ? 'Side' : chooseSide}</span>

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
          </th>

          <th>
            <FlexRow className="col-span-1 relative">
              <div
                className="cursor-pointer flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowTypeSelector(!showTypeSelector);
                  setShowMarketSelector(false);
                  setShowSideSelector(false);
                }}
              >
                <span>{chooseType === 'All' ? 'Type' : chooseType}</span>

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
                      text: 'All',
                      textId: 'All',
                      className: 'text-white',
                    },
                    {
                      text: 'Limit',
                      textId: 'Limit',
                      className: 'text-white',
                    },
                    {
                      text: 'Post Only',
                      textId: 'Post Only',
                      className: 'text-white',
                    },
                  ]}
                />
              )}
            </FlexRow>
          </th>

          <th>
            <FlexRow className="col-span-1 relative ">
              <span className="whitespace-nowrap">
                {`Filled / Qty`}
                {showCurSymbol && (
                  <TextWrapper
                    value={symbolFrom}
                    className="ml-2 text-xs py-0 px-1"
                    textC="text-primaryText"
                  />
                )}
              </span>
            </FlexRow>
          </th>

          <th>
            <FlexRow className={`col-span-2 relative   justify-self-center`}>
              <span>Price</span>
              {showCurSymbol && (
                <TextWrapper
                  value={symbolTo}
                  className="ml-2"
                  textC="text-primaryText text-xs py-0 px-1"
                />
              )}
            </FlexRow>
          </th>
          <th>
            <div className="whitespace-nowrap flex items-center">
              Est.Total
              {showCurSymbol && (
                <TextWrapper
                  value={symbolTo}
                  className="ml-2"
                  textC="text-primaryText text-xs py-0 px-1"
                />
              )}
            </div>
          </th>

          <th>
            <div
              className={`cursor-pointer flex transform translate-x-1/3`}
              onClick={() => {
                setTimeSorting(timeSorting === 'asc' ? 'dsc' : 'asc');
              }}
            >
              <span>Time</span>
              {
                <MdArrowDropDown
                  className={
                    timeSorting === 'asc' ? 'transform rotate-180' : ''
                  }
                  size={22}
                  color={'#7e8a93'}
                />
              }
            </div>
          </th>
          <th align="right">
            <span className="pr-6"> Action</span>
          </th>
        </tr>
      </thead>
      <tbody
        className=" max-h-vh65   block overflow-auto  flex-col "
        id="all-orders-body-open"
      >
        {loading ? (
          <OrderlyLoading></OrderlyLoading>
        ) : orders.filter(filterFunc).length === 0 ? (
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
                  marketInfo={
                    marketList.find((m) => m.textId === order.symbol)?.text
                  }
                  setOtherLineOpenTrigger={setOtherLineOpenTrigger}
                  otherLineOpenTrigger={otherLineOpenTrigger}
                  holdingFrom={curHoldings?.find((h) => {
                    const token = parseSymbol(order.symbol).symbolFrom;

                    return h.token === token;
                  })}
                  holdingTo={curHoldings?.find((h) => {
                    const token = parseSymbol(order.symbol).symbolTo;

                    return h.token === token;
                  })}
                  showCurSymbol={showCurSymbol}
                  order={order}
                  key={order.order_id}
                  availableSymbols={availableSymbols}
                />
              );
            })
        )}
      </tbody>
    </table>
  );
}

function HistoryOrders({
  orders,
  symbol,
  hidden,
  setHistoryCount,
  allTokens,
  availableSymbols,
  showCurSymbol,
  loading,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;
  allTokens: {
    [key: string]: TokenMetadata;
  };
  availableSymbols: SymbolInfo[] | undefined;
  setHistoryCount: (c: number) => void;
  showCurSymbol: boolean;
  loading: boolean;
}) {
  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);

  const [showStatuesSelector, setShowStatuesSelector] =
    useState<boolean>(false);

  const [chooseSide, setChooseSide] = useState<'Both' | 'Buy' | 'Sell'>('Both');

  const [chooseType, setChooseType] = useState<
    'All' | 'Limit' | 'Market' | 'Post Only' | 'IOC' | 'FOK'
  >('All');

  const [chooseStatus, setChooseStatus] = useState<
    'All' | 'Cancelled' | 'Filled' | 'Rejected'
  >('All');

  const [showTypeSelector, setShowTypeSelector] = useState<boolean>(false);

  const [timeSorting, setTimeSorting] = useState<'asc' | 'dsc'>(
    loading ? undefined : 'dsc'
  );

  const [chooseMarketSymbol, setChooseMarketSymbol] = useState<string>(
    showCurSymbol ? symbol : 'all_markets'
  );
  const [showMarketSelector, setShowMarketSelector] = useState<boolean>(false);

  const sortingFunc = (a: MyOrder, b: MyOrder) => {
    if (timeSorting === 'asc') {
      return a.created_time - b.created_time;
    } else {
      return b.created_time - a.created_time;
    }
  };

  useEffect(() => {
    if (showCurSymbol) {
      setChooseMarketSymbol(symbol);
    } else {
      setChooseMarketSymbol('all_markets');
    }
  }, [showCurSymbol, symbol]);

  const filterFunc = (order: MyOrder) => {
    const side =
      chooseSide === 'Both' ||
      order.side.toLowerCase() === chooseSide.toLowerCase();

    const type =
      chooseType === 'All' ||
      (order.type === 'MARKET' && chooseType === 'Market') ||
      (order.type === 'LIMIT' && chooseType === 'Limit') ||
      (order.type === 'FOK' && chooseType === 'FOK') ||
      (order.type === 'IOC' && chooseType === 'IOC') ||
      (order.type === 'POST_ONLY' && chooseType === 'Post Only');

    const status =
      chooseStatus === 'All' ||
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

  const generateMarketList = () => {
    if (!availableSymbols || !allTokens) return [];
    const marketList = [
      {
        text: (
          <div className="flex items-center ">
            <div className="mr-2 ml-1 text-white text-sm">
              <AllMarketIcon />
            </div>
            <span className="text-white">All Instrument</span>
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

  const historyHasScrolled = hasScrolled('all-orders-body-history');

  const marketList = generateMarketList();

  return (
    <table className={`table-fixed w-full ${hidden ? 'hidden' : ''} `}>
      {/* Header */}
      <thead
        className={`table table-fixed  pl-5 pr-4 py-2   border-white border-opacity-10`}
        style={{
          width: 'calc(100% - 9px)',
        }}
      >
        <tr className="w-full table-fixed">
          <th className={showCurSymbol ? 'hidden' : 'pl-5 py-2'}>
            {!showCurSymbol && (
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
                  <span className="flex items-center">
                    {chooseMarketSymbol === 'all_markets' ? (
                      'All Instrument'
                    ) : (
                      <>
                        <span className="text-white">
                          {parseSymbol(chooseMarketSymbol).symbolFrom}
                        </span>
                        /{parseSymbol(chooseMarketSymbol).symbolTo}
                      </>
                    )}
                  </span>

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
            )}
          </th>

          <th className="py-2.5">
            <FlexRow
              className={`col-span-1  relative ${showCurSymbol ? 'pl-5' : ''}`}
            >
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
                <span>{chooseSide === 'Both' ? 'Side' : chooseSide}</span>

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
          </th>

          <th>
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
                <span>{chooseType === 'All' ? 'Type' : chooseType}</span>

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
                      text: 'All',
                      textId: 'All',
                      className: 'text-white',
                    },
                    {
                      text: 'Limit',
                      textId: 'Limit',
                      className: 'text-white',
                    },
                    {
                      text: 'Market',
                      textId: 'Market',
                      className: 'text-white',
                    },
                    {
                      text: 'IOC',
                      textId: 'IOC',
                      className: 'text-white',
                    },
                    {
                      text: 'FOK',
                      textId: 'FOK',
                      className: 'text-white',
                    },
                    {
                      text: 'Post Only',
                      textId: 'Post Only',
                      className: 'text-white',
                    },
                  ]}
                />
              )}
            </FlexRow>
          </th>

          <th>
            <FlexRow className="col-span-1 relative ">
              <span>Filled / Qty</span>
              {showCurSymbol && (
                <TextWrapper
                  value={symbolFrom}
                  className="ml-2 text-xs py-0 px-1"
                  textC="text-primaryText"
                />
              )}
            </FlexRow>
          </th>

          <th>
            <FlexRow className="col-span-1">
              <span>Price</span>

              {showCurSymbol && (
                <TextWrapper
                  value={symbolTo}
                  className="ml-2 text-xs py-0 px-1"
                  textC="text-primaryText"
                />
              )}
            </FlexRow>
          </th>

          <th>
            <FlexRow className="col-span-1">
              <span>Avg.Price</span>
              {showCurSymbol && (
                <TextWrapper
                  value={symbolTo}
                  className="ml-2 text-xs py-0 px-1"
                  textC="text-primaryText"
                />
              )}
            </FlexRow>
          </th>

          <th>
            <FlexRow className="col-span-1  justify-self-center">
              <span>Total</span>
              {showCurSymbol && (
                <TextWrapper
                  value={symbolTo}
                  className="ml-2 text-xs py-0 px-1"
                  textC="text-primaryText"
                />
              )}
            </FlexRow>
          </th>

          <th>
            <div
              className="cursor-pointer flex items-center"
              onClick={() => {
                setTimeSorting(timeSorting === 'asc' ? 'dsc' : 'asc');
              }}
            >
              <span>Time</span>
              {
                <MdArrowDropDown
                  className={
                    timeSorting === 'asc' ? 'transform rotate-180' : ''
                  }
                  size={22}
                  color={ 'white'}
                />
              }
            </div>
          </th>

          <th className="pr-6" align="right">
            <div className="flex relative items-center justify-end">
              <div
                className="cursor-pointer justify-end flex items-center"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowStatuesSelector(!showStatuesSelector);
                  setShowMarketSelector(false);
                  setShowSideSelector(false);
                  setShowTypeSelector(false);
                }}
              >
                <span>{chooseStatus === 'All' ? 'Status' : chooseStatus}</span>

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
                      text: 'All',
                      textId: 'All',
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
            </div>
          </th>
        </tr>
      </thead>
      <tbody
        className=" overflow-auto max-h-vh65  flex-col block"
        id="all-orders-body-history"
      >
        {loading ? (
          <OrderlyLoading></OrderlyLoading>
        ) : orders.filter(filterFunc).length === 0 ? (
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
                  showCurSymbol={showCurSymbol}
                />
              );
            })
        )}
      </tbody>
    </table>
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

  const { storageEnough } = useOrderlyContext();

  const [selectedMarketSymbol, setSelectedMarketSymbol] = useState<string>();

  const allTokens = useBatchTokenMetaFromSymbols(
    allTokenSymbols.length > 0 ? allTokenSymbols : null,
    tokenInfo
  );

  const allOrders = useAllOrders({ refreshingTag: myPendingOrdersRefreshing });

  const { accountId } = useWalletSelector();

  const loading =
    typeof allOrders === 'undefined' &&
    !!accountId &&
    storageEnough &&
    !!localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID);

  const [tab, setTab] = useState<'open' | 'history'>('open');

  const [showCurSymbol, setShowCurSymbol] = useState<boolean>(true);

  const openOrders = allOrders?.filter((o) => {
    return (
      (o.status === 'NEW' || o.status === 'PARTIAL_FILLED') &&
      (!showCurSymbol || o.symbol === symbol)
    );
  });

  // get history orders, which is orders that are not open orders
  const historyOrders = allOrders?.filter((o) => {
    return (
      openOrders?.map((o) => o.order_id).indexOf(o.order_id) === -1 &&
      (!showCurSymbol || o.symbol === symbol)
    );
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
      {/* <div className="w-1000px m-auto flex items-center mb-6">
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
      </div> */}

      <div
        className="w-full relative  rounded-2xl shadow-sm border text-primaryOrderly border-boxBorder    text-sm bg-black  bg-opacity-10 pb-4"
        style={{
          minHeight: 'calc(100vh - 680px)',
        }}
      >
        <FlexRowBetween className="pb-3 py-3 rounded-t-2xl border-b px-5 mt-0 border-white border-opacity-10">
          <FlexRow className="min-h-8">
            <FlexRow
              onClick={() => {
                setTab('open');
              }}
              className="justify-center cursor-pointer"
            >
              <span
                className={
                  tab === 'open'
                    ? 'text-white relative'
                    : 'text-primaryOrderly relative'
                }
              >
                Open Orders
                {tab === 'open' && (
                  <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-5 left-0"></div>
                )}
              </span>

              <span
                className={`flex items-center justify-center h-4 px-1.5 min-w-fit text-xs rounded-md  ml-2 ${
                  tab === 'open'
                    ? allOrders === undefined || loading
                      ? 'text-white bg-grayBgLight'
                      : 'bg-baseGreen text-black'
                    : 'text-primaryOrderly bg-symbolHover'
                } `}
              >
                {allOrders === undefined || loading ? '-' : openCount}
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
                  tab === 'history'
                    ? 'text-whites relative'
                    : 'text-primaryOrderly relative'
                }
              >
                History
                {tab === 'history' && (
                  <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-5 left-0"></div>
                )}
              </span>

              <span
                className={`flex items-center justify-center px-1.5 min-w-fit  text-xs rounded-md  ml-2 ${
                  tab === 'history'
                    ? allOrders === undefined || loading
                      ? 'text-white bg-grayBgLight'
                      : 'bg-baseGreen text-black'
                    : 'text-primaryOrderly bg-symbolHover'
                } `}
              >
                {allOrders === undefined || loading ? '-' : historyCount}
              </span>
            </FlexRow>
          </FlexRow>

          <FlexRow className={!accountId ? 'hidden' : ''}>
            <FlexRow>
              <CheckBox
                check={showCurSymbol}
                setCheck={() => {
                  setShowCurSymbol(true);
                }}
              ></CheckBox>

              <span
                className="ml-2 cursor-pointer"
                onClick={() => {
                  setShowCurSymbol(true);
                }}
              >
                Current Instrument
              </span>
            </FlexRow>

            <FlexRow className="ml-6">
              <CheckBox
                check={!showCurSymbol}
                setCheck={() => {
                  setShowCurSymbol(false);
                }}
              ></CheckBox>

              <span
                className="ml-2 cursor-pointer"
                onClick={() => {
                  setShowCurSymbol(false);
                }}
              >
                All
              </span>
            </FlexRow>
          </FlexRow>
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
            showCurSymbol={showCurSymbol}
            loading={loading}
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
            showCurSymbol={showCurSymbol}
            loading={loading}
          />
        }
      </div>
    </>
  );
}
export default AllOrderBoard;
