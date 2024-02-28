import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import {
  IoIosClose,
  IoClose,
  MdArrowDropDown,
  RiArrowDownSFill,
  AiOutlineClose,
  AiOutlineCheck,
} from '../../../../components/reactIcons';
import { FlexRow, FlexRowBetween, QuestionMark } from '../Common';
import { parseSymbol } from '../RecentTrade';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import InfiniteScroll from 'react-infinite-scroll-component';

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
  CancelStamp,
  CheckSelectorWhite,
  MobileEdit,
  MobileFilter,
  NoOrderEmpty,
  OrderStateOutline,
  RejectStamp,
} from '../Common/Icons';
import { TextWrapper } from '../UserBoard';
import Big from 'big.js';
import { CancelButton } from '../OrderBoard';

import { formatTimeDate } from '../OrderBoard';

import { Selector } from '../OrderBoard';

import {
  FlexRowStart,
  CheckBox,
  orderEditPopUpSuccess,
  ErrorTip,
} from '../Common/index';
import {
  cancelOrder,
  cancelOrders,
  editOrder,
  getOrderTrades,
} from '../../orderly/off-chain-api';
import { useOrderBook, useCurHoldings } from './state';
import { useBatchTokenMetaFromSymbols } from '../ChartHeader/state';
import Modal from 'react-modal';

import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import {
  OrderlyLoading,
  FilledStamp,
  HistoryOrderDetailIcon,
} from '../Common/Icons';
import { digitWrapper, numberWithCommas, PerpOrSpot } from '../../utiles';
import { REF_ORDERLY_ACCOUNT_VALID } from '../UserBoard/index';
import {
  ONLY_ZEROS,
  scientificNotationToString,
} from '../../../../utils/numbers';
import { orderEditPopUpFailure } from '../Common/index';
import { Holding } from '../../orderly/type';
import {
  useLargeScreen,
  useClientMobile,
  isMobile,
} from '../../../../utils/device';
import { Images } from '../../../../components/stableswap/CommonComp';

import { SymbolSelectorMobileModal } from '../ChartHeader';
import { FormattedMessage, useIntl } from 'react-intl';
import _ from 'lodash';
import { tickToPrecision } from '../UserBoardPerp/math';
import PositionsTable from './PositionsTable';
import { usePerpData } from '../UserBoardPerp/state';
import { QuestionTip } from '../../../../components/layout/TipWrapper';
import TurnPage from './TurnPage';

export function getTranslateList(
  key: 'type' | 'side' | 'status' | 'instrument'
) {
  const intl = useIntl();
  return {
    type: {
      All: intl.formatMessage({ id: 'All', defaultMessage: 'All' }),
      Limit: intl.formatMessage({
        id: 'limit_orderly',
        defaultMessage: 'Limit',
      }),
      Market: intl.formatMessage({ id: 'market', defaultMessage: 'Market' }),
      'Post Only': 'Post Only',
      IOC: 'IOC',
      FOK: 'FOK',
      Both: intl.formatMessage({ id: 'both', defaultMessage: 'Both' }),
    },
    side: {
      Both: intl.formatMessage({ id: 'both', defaultMessage: 'Both' }),
      Buy: intl.formatMessage({ id: 'buy', defaultMessage: 'Buy' }),
      Sell: intl.formatMessage({ id: 'sell', defaultMessage: 'Sell' }),
    },
    status: {
      All: intl.formatMessage({
        id: 'All',
        defaultMessage: 'All',
      }),
      Cancelled: intl.formatMessage({
        id: 'Cancelled',
        defaultMessage: 'Cancelled',
      }),
      Filled: intl.formatMessage({
        id: 'Filled',
        defaultMessage: 'Filled',
      }),
      Rejected: intl.formatMessage({
        id: 'Rejected',
        defaultMessage: 'Rejected',
      }),
      Both: intl.formatMessage({ id: 'both', defaultMessage: 'Both' }),

      New: 'New',

      'Partial Filled': 'Partial Filled',
    },
    instrument: {
      All: intl.formatMessage({
        id: 'All',
        defaultMessage: 'All',
      }),
    },
  }[key];
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
  const intl = useIntl();
  return (
    <Modal
      {...props}
      style={{
        content: {
          zIndex: 999,
        },
      }}
    >
      <div className=" rounded-2xl lg:w-96 xs:w-95vw gradientBorderWrapperZ bg-boxBorder text-sm text-white border ">
        <div className="px-5 py-6 flex flex-col ">
          <div className="text-center whitespace-nowrap mt-4">
            {
              <FormattedMessage
                id={`change_the_${editType}_of`}
                defaultMessage={`Change the ${editType} of`}
              />
            }
            {` ${symbolFrom} / ${symbolTo} `}
            {
              <FormattedMessage
                id={`change_the_${editType}_of_zh`}
                defaultMessage={' '}
              />
            }
          </div>
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
              {intl.formatMessage({
                id: 'cancel',
                defaultMessage: 'Cancel',
              })}
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
              {intl.formatMessage({
                id: 'confirm',
                defaultMessage: 'Confirm',
              })}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}

function EditOrderModalMobile(
  props: Modal.Props & {
    confirmClick: (value?: string, type?: 'price' | 'quantity') => string;
    defaultInput: string;
    editType: 'price' | 'quantity';
  }
) {
  const { onRequestClose, defaultInput, editType, confirmClick } = props;

  const [value, setValue] = useState<string>(defaultInput);

  const [errorMsg, setErrorMsg] = useState<string>(undefined);

  useEffect(() => {
    setErrorMsg(undefined);
  }, [props.isOpen]);
  const intl = useIntl();
  return (
    <Modal
      {...props}
      style={{
        content: {
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: 'none',
          bottom: '0px',
          left: '0px',
          transform: 'translate(-50%, -20px)',
          outline: 'none',
          zIndex: 999,
        },
      }}
    >
      <div className=" xs:w-screen xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl bg-boxBorder  text-sm text-white ">
        <div className="px-5 py-6 flex flex-col ">
          <div className="text-left whitespace-nowrap text-base font-bold ">
            {intl.formatMessage({
              id: 'change_orderly',
              defaultMessage: 'Change',
            })}
            <span className="">
              {intl.formatMessage({
                id: editType,
                defaultMessage: _.upperFirst(editType),
              })}
            </span>
          </div>

          <input
            className="my-6 text-center text-lg font-bold"
            value={value}
            inputMode="decimal"
            type={'number'}
            onChange={(e) => {
              setValue(e.target.value);
              setErrorMsg(undefined);
            }}
          ></input>

          <div className="relative bottom-5">
            {!!errorMsg && (
              <ErrorTip className={'relative top-3'} text={errorMsg} />
            )}
          </div>

          <div className="flex items-center mb-2 h-10 font-bold w-full justify-center">
            <button
              className="text-primaryText bg-menuMoreBgColor  w-1/2 border-baseGreen ml-2 py-2 rounded-lg flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onRequestClose && onRequestClose(e);
              }}
              style={{
                height: '38px',
              }}
            >
              {intl.formatMessage({
                id: 'cancel',
                defaultMessage: 'Cancel',
              })}
            </button>

            <button
              className="text-white ml-2 py-2 w-1/2 rounded-lg bg-buyGradientGreen flex items-center justify-center"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!errorMsg && errorMsg !== undefined) {
                  return;
                }

                const msg = confirmClick(value, editType);
                setErrorMsg(msg);
              }}
              style={{
                height: '38px',
              }}
            >
              <span className="mr-2">
                <CheckSelectorWhite></CheckSelectorWhite>
              </span>{' '}
              {intl.formatMessage({
                id: 'confirm',
                defaultMessage: 'Confirm',
              })}
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

  const { handlePendingOrderRefreshing, markPrices } = useOrderlyContext();

  const [price, setPrice] = useState<string>(order.price.toString());

  const [openEditQuantity, setOpenEditQuantity] = useState<boolean>(false);

  const [openEditPrice, setOpenEditPrice] = useState<boolean>(false);
  const [mobileEditType, setMobileEditType] = useState<
    'price' | 'quantity' | undefined
  >(undefined);

  const orderBookThisSymbol = useOrderBook({
    symbol: order.symbol,
    openSig: [openEditPrice, openEditQuantity, mobileEditType],
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

  const editValidator = (price: string, size: string, noPop?: boolean) => {
    const symbolInfo = availableSymbols?.find((s) => s.symbol === order.symbol);

    let quantity = size;

    let errorTipMsg = '';

    if (!symbolInfo) return;

    const symbolType = PerpOrSpot(symbolInfo.symbol);

    const markPrice = markPrices.find((m) => m.symbol === symbolInfo.symbol);

    if (
      new Big(order.price).eq(new Big(price || 0)) &&
      new Big(order.quantity).eq(new Big(quantity || 0))
    ) {
      errorTipMsg = intl.formatMessage({
        id: 'at_least_one_of_order_quantity_or_price_has_to_be_changed',
        defaultMessage:
          'At least one of order quantity or price has to be changed',
      });
    }

    if (
      ONLY_ZEROS.test(order.executed.toString()) &&
      ONLY_ZEROS.test(quantity) &&
      !!quantity
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'quantity_should_be_higher_than',
        defaultMessage: 'Quantity should be higher than',
      })} ${symbolInfo.base_min}`;
    }

    if (ONLY_ZEROS.test(price || '0')) {
      errorTipMsg = intl.formatMessage({
        id: 'price_should_be_greater_than_0',
        defaultMessage: 'Price should be greater than 0',
      });
    }

    if (
      holdingTo &&
      new Big(price || 0)
        .minus(order.price)
        .times(new Big(quantity || 0))
        .gt(new Big(holdingTo.holding + holdingTo.pending_short)) &&
      order.side === 'BUY' &&
      symbolType === 'SPOT'
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'insufficient_en',
        defaultMessage: 'Insufficient',
      })} ${symbolTo}${intl.formatMessage({
        id: 'insufficient_zh',
        defaultMessage: ' ',
      })}`;
    }

    if (
      !ONLY_ZEROS.test(order.executed ? order.executed.toString() : '0') &&
      new Big(quantity).lte(new Big(order.executed || 0))
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'quantity_should_be_higher_than',
        defaultMessage: 'Quantity should be higher than',
      })} ${order.executed}`;
    }

    if (
      new Big(quantity || 0).gt(order.quantity || 0) &&
      holdingFrom &&
      holdingTo &&
      symbolType === 'SPOT'
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
        errorTipMsg = `${intl.formatMessage({
          id: 'insufficient_en',
          defaultMessage: 'Insufficient',
        })} ${order.side === 'BUY' ? symbolTo : symbolFrom}${intl.formatMessage(
          {
            id: 'insufficient_zh',
            defaultMessage: ' ',
          }
        )}`;
      }
    }

    if (new Big(price || 0).lt(symbolInfo.quote_min) && symbolType === 'SPOT') {
      errorTipMsg = `${intl.formatMessage({
        id: 'min_price_should_be_higher_than_or_equal_to',
        defaultMessage: 'Min price should be higher than or equal to',
      })} ${symbolInfo.quote_min}`;
    }

    if (new Big(price || 0).gt(symbolInfo.quote_max) && symbolType === 'SPOT') {
      errorTipMsg = `${intl.formatMessage({
        id: 'price_should_be_lower_than_or_equal_to',
        defaultMessage: 'Price should be lower than or equal to',
      })} ${symbolInfo.quote_max}`;
    }

    if (
      new Big(new Big(price || 0).minus(new Big(symbolInfo.quote_min)))
        .mod(symbolInfo.quote_tick)
        .gt(0)
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'price_should_be_a_multiple_of',
        defaultMessage: 'Price should be a multiple of',
      })} ${symbolInfo.quote_tick} ${intl.formatMessage({
        id: 'price_should_be_a_multiple_of_zh',
        defaultMessage: ' ',
      })}`;
    }

    const marketPrice =
      order.side === 'SELL'
        ? orderBookThisSymbol?.bids?.[0]?.price
        : orderBookThisSymbol?.asks?.[0]?.price;

    if (
      new Big(price || 0).gt(
        new Big(marketPrice || 0).times(1 + symbolInfo.price_range)
      ) &&
      order.side === 'BUY' &&
      symbolType === 'SPOT'
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'price_should_be_lower_than_or_equal_to',
        defaultMessage: 'Price should be lower than or equal to',
      })} ${new Big(marketPrice || 0).times(1 + symbolInfo.price_range)}`;
    }

    if (
      new Big(price || 0).lt(
        new Big(marketPrice || 0).times(1 - symbolInfo.price_range)
      ) &&
      order.side === 'SELL' &&
      symbolType === 'SPOT'
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'price_should_be_greater_than_or_equal_to',
        defaultMessage: 'Price should be greater than or equal to',
      })} ${(new Big(marketPrice || 0).times(1 - symbolInfo.price_range), 3)}`;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'the_order_value_should_be_be_greater_than_or_equal_to',
        defaultMessage: 'The order value should be be greater than or equal to',
      })} ${symbolInfo.min_notional}`;
    }

    // size validator

    if (new Big(size || 0).lt(symbolInfo.base_min)) {
      errorTipMsg = `${
        order.side === 'BUY'
          ? intl.formatMessage({
              id: 'quantity_to_buy_should_be_greater_than_or_equal_to',
              defaultMessage:
                'Quantity to buy should be greater than or equal to',
            })
          : intl.formatMessage({
              id: 'quantity_to_sell_should_be_greater_than_or_equal_to',
              defaultMessage:
                'Quantity to sell should be greater than or equal to',
            })
      } ${symbolInfo.base_min}`;
    }

    if (new Big(size || 0).gt(symbolInfo.base_max) && symbolType === 'SPOT') {
      errorTipMsg = `${
        order.side === 'BUY'
          ? intl.formatMessage({
              id: 'quantity_to_buy_should_be_less_than_or_equal_to',
              defaultMessage: 'Quantity to buy should be less than or equal to',
            })
          : intl.formatMessage({
              id: 'quantity_to_sell_should_be_less_than_or_equal_to',
              defaultMessage:
                'Quantity to sell should be less than or equal to',
            })
      } ${symbolInfo.base_max}`;
    }

    if (
      new Big(new Big(size || 0).minus(new Big(symbolInfo.base_min)))
        .mod(symbolInfo.base_tick)
        .gt(0)
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'quantity_should_be_a_multiple_of',
        defaultMessage: 'Quantity should be a multiple of',
      })} ${symbolInfo.base_tick}${intl.formatMessage({
        id: 'quantity_should_be_a_multiple_of_zh',
        defaultMessage: ' ',
      })}`;
    }

    if (
      price &&
      size &&
      new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'the_order_value_should_be_be_greater_than_or_equal_to',
        defaultMessage: 'The order value should be be greater than or equal to',
      })} ${symbolInfo.min_notional}`;
    }

    if (
      price &&
      size &&
      order.side === 'BUY' &&
      markPrice &&
      new Big(price || 0).gt(
        new Big(markPrice.price || 0).mul(1 + symbolInfo.price_range)
      )
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'perp_buy_limit_order_range',
        defaultMessage:
          'The price of buy limit orders should be less than or equal to',
      })} ${new Big(markPrice.price || 0)
        .mul(1 + symbolInfo.price_range)
        .toFixed(tickToPrecision(symbolInfo.quote_tick))}`;
    }

    if (
      price &&
      size &&
      order.side === 'SELL' &&
      markPrice &&
      new Big(price || 0).lt(
        new Big(markPrice.price || 0).mul(1 - symbolInfo.price_range)
      )
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'perp_sell_limit_order_range',
        defaultMessage:
          'The price of sell limit orders should be greater than or equal to',
      })} ${
        (new Big(markPrice.price || 0)
          .mul(1 - symbolInfo.price_range)
          .toFixed(tickToPrecision(symbolInfo.quote_tick)),
        3)
      }`;
    }

    if (
      price &&
      size &&
      order.side === 'SELL' &&
      markPrice &&
      symbolInfo.price_scope &&
      new Big(price || 0).gt(
        new Big(markPrice.price || 0).mul(1 + symbolInfo.price_scope)
      )
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'perp_sell_limit_order_scope',
        defaultMessage: 'The price of a sell limit order cannot be higher than',
      })} ${new Big(markPrice.price || 0)
        .mul(1 + symbolInfo.price_scope)
        .toFixed(tickToPrecision(symbolInfo.quote_tick))}`;
    }

    if (
      price &&
      size &&
      order.side === 'BUY' &&
      markPrice &&
      symbolInfo?.price_scope &&
      new Big(price || 0).lt(
        new Big(markPrice.price || 0).mul(1 - symbolInfo.price_scope)
      )
    ) {
      errorTipMsg = `${intl.formatMessage({
        id: 'perp_buy_limit_order_scope',
        defaultMessage: 'The price of a buy limit order cannot be lower than',
      })} ${
        (new Big(markPrice.price || 0)
          .mul(1 - symbolInfo.price_scope)
          .toFixed(tickToPrecision(symbolInfo.quote_tick)),
        3)
      }`;
    }

    if (!!errorTipMsg && !noPop) {
      orderEditPopUpFailure({
        tip: errorTipMsg,
      });
    }

    return errorTipMsg;
  };

  const [isCancelled, setIsCancelled] = useState<boolean>(false);
  const intl = useIntl();
  const isMobile = useClientMobile();

  async function handleEditOrder(value?: string, type?: 'price' | 'quantity') {
    if (!accountId) return;

    if (
      new Big(order.price).eq(new Big(price)) &&
      new Big(order.quantity).eq(new Big(quantity)) &&
      !isMobile
    )
      return;

    setShowEditModal(false);

    return editOrder({
      order,
      accountId,
      orderlyProps: {
        order_id: order.order_id,
        order_price: parseFloat(
          type === 'price' ? value : price || order.price.toString()
        ),
        symbol: order.symbol,
        side: order.side,
        order_quantity: parseFloat(
          type === 'quantity' ? value : quantity || order.quantity.toString()
        ),
        order_type: order.type,
        broker_id: order.broker_id || 'ref_dex',
        visible_quantity: order.visible,
        reduce_only: order.reduce_only,
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
            size:
              (type === 'quantity' && value) ||
              quantity ||
              order.quantity.toString(),
            cancel: false,
            price:
              (type === 'price' && value) || price || order.price.toString(),
          });
        }
        return res;
      })
      .then((res) => {
        setOpenEditQuantity(false);
        setOpenEditPrice(false);
        setMobileEditType(undefined);

        if (type === 'price') setPrice(value);
        if (type === 'quantity') setQuantity(value);
        if (!res.success) {
          setPrice(order.price.toString());
          setQuantity(order.quantity.toString());
        }

        return res;
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

  const [showMobileOrderDetail, setShowMobileOrderDetail] =
    useState<boolean>(false);

  if (isCancelled) return null;

  return (
    <>
      <tr
        key={order.order_id}
        id={'order-line-' + order.order_id}
        className={`xs:hidden md:hidden hover:bg-orderLineHover table table-fixed w-full  pl-5 pr-4 py-3 lg:border-t  border-white border-opacity-10 xs:w-95vw`}
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
          } ${showCurSymbol ? 'pl-5' : 'pl-0 transform translate-x-1/3'} `}
        >
          <TextWrapper
            className="px-2 text-sm"
            value={intl.formatMessage({
              id: order.side.toLowerCase(),
              defaultMessage: order.side,
            })}
            bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
            textC={order.side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'}
          ></TextWrapper>
        </td>
        <td
          className={`relative  col-span-1  ${
            openEdit ? 'items-start relative ' : 'items-center'
          }`}
        >
          <div className="flex items-center">
            <span className="text-white capitalize">
              {order.type === 'LIMIT'
                ? intl.formatMessage({
                    id: 'limit_orderly',
                    defaultMessage: 'Limit',
                  })
                : order.type === 'MARKET'
                ? intl.formatMessage({
                    id: 'market',
                    defaultMessage: 'Market',
                  })
                : order.type === 'POST_ONLY'
                ? 'Post Only'
                : order.type}
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
            className={`flex  relative  justify-self-end flex-wrap  ${
              openEditQuantity ? 'items-start' : 'items-center'
            }`}
          >
            <span className="relative font-nunito">
              {numberWithCommas(order.executed)}
            </span>
            <span className="mx-1 relative ">/</span>

            <div
              className={`flex flex-col font-nunito overflow-hidden mb-0.5  rounded-lg ${
                openEditQuantity
                  ? 'border bg-dark2 relative bottom-1.5 w-14'
                  : ''
              }  border-border2 text-sm   text-white`}
            >
              <input
                ref={inputRef}
                inputMode="decimal"
                type={'number'}
                value={quantity}
                onChange={(e) => {
                  setQuantity(e.target.value);
                }}
                autoFocus={openEditQuantity}
                onFocus={() => {
                  setOpenEditQuantity(true);
                  setOpenEditPrice(false);
                  setPrice(order.price.toString());
                  setOtherLineOpenTrigger(order.order_id);
                }}
                className={` px-2 py-1 pt-1.5  ${
                  !openEditQuantity ? 'hidden' : 'text-center'
                }`}
                style={{
                  // width: `${order.quantity.toString().length * 12}px`,
                  minWidth: '48px',
                }}
              />

              <div
                className={` px-2 py-1  pt-1.5  ${
                  !openEditQuantity ? 'text-left pl-1' : 'hidden'
                }`}
                onClick={() => {
                  setOpenEditQuantity(true);
                  setOpenEditPrice(false);
                  setPrice(order.price.toString());
                  setOtherLineOpenTrigger(order.order_id);
                }}
              >
                {numberWithCommas(quantity)}
              </div>

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
                    if (editValidator(price, quantity)) return;

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
            className={`flex font-nunito mb-1 flex-col overflow-hidden  rounded-lg  ${
              openEditPrice ? 'border bg-dark2 ' : ''
            } border-border2 text-sm   max-w-max text-white`}
            style={{
              width: `${order.price.toString().length * 12.5}px`,
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
                !openEditPrice ? 'hidden' : 'text-center'
              }`}
            />

            <div
              className={`px-2 py-1 pt-1.5   ${
                !openEditPrice ? 'text-left break-all' : 'hidden'
              }`}
              onClick={() => {
                setOpenEditPrice(true);
                setOpenEditQuantity(false);
                setQuantity(order.quantity.toString());
                setOtherLineOpenTrigger(order.order_id);
              }}
            >
              {numberWithCommas(price)}
            </div>

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

                  if (editValidator(price, quantity)) return;

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
          className={` font-nunito col-span-1  relative   justify-self-end text-white  ${
            openEdit ? 'items-start ' : 'items-center'
          }`}
        >
          {numberWithCommas(
            new Big(quantity || '0')
              .times(new Big(order.average_executed_price || order.price || 0))
              .toNumber()
          )}
        </td>

        <td
          className={`col-span-1 font-nunito relative transform translate-x-1/3 whitespace-nowrap justify-self-end  text-end text-primaryOrderly  ${
            openEdit ? 'items-start ' : 'items-center'
          }`}
        >
          {formatTimeDate(order.created_time)}
        </td>

        <td
          className={`col-span-1 font-nunito relative transform translate-x-2/3 whitespace-nowrap justify-self-end right-2 text-end text-primaryOrderly  ${
            openEdit ? 'items-start ' : 'items-center'
          }`}
        >
          {order.broker_name.replace('DEX', '')}
        </td>

        <td
          className={`col-span-1 py-4 justify-self-center pr-4 ${
            openEdit ? ' items-start' : 'items-center'
          }`}
          align="right"
        >
          <CancelButton
            text={intl.formatMessage({
              id: 'cancel',
              defaultMessage: 'Cancel',
            })}
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
                  setIsCancelled(true);

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
      </tr>

      <div
        className="lg:hidden p-2.5 pb-3 text-sm bg-menuMoreBgColor flex flex-col  items-stretch w-95vw mx-auto rounded-2xl mb-5 justify-between"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setShowMobileOrderDetail(true);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center ">
            <div className="flex items-center mr-2">
              <TextWrapper
                className="px-2 text-sm w-11"
                value={intl.formatMessage({
                  id: order.side.toLowerCase(),
                  defaultMessage: order.side,
                })}
                bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-redLight'}
                textC={'text-black font-bold'}
                bgOpacity="bg-opacity-100"
              />
            </div>
            {marketInfo}
          </div>
          <div className="flex items-center">
            <span className="font-nunito">
              <span>
                {order.executed > 0 && order.executed / order.quantity < 0.01
                  ? '1'
                  : order.quantity > 0
                  ? new Big(new Big(order.executed || 0))
                      .div(new Big(order.quantity || 1))
                      .times(100)
                      .toFixed(0, 0)
                  : 0}
              </span>
              %
            </span>

            <span className="mx-1.5">
              {intl.formatMessage({
                id: 'filled',
                defaultMessage: 'Filled',
              })}
            </span>

            <div
              className="flex items-center relative ml-1.5 justify-center border border-dashed rounded-full border-portfolioGreenColor"
              style={{
                height: '14px',
                width: '14px',
              }}
            >
              <div
                className=""
                style={{
                  height: '9px',
                  width: '9px',
                }}
              >
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
              </div>
            </div>
          </div>
        </div>
        <div
          className={`flex  ${
            openEditQuantity || openEditPrice ? 'items-start' : 'items-center'
          } py-2 justify-between`}
        >
          <div
            className={`flex   ${
              openEditQuantity || openEditPrice ? 'items-start' : 'items-center'
            } text-white`}
          >
            {
              <span
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className="pr-1 font-nunito"
              >
                {numberWithCommas(quantity)}
              </span>
            }

            <TextWrapper
              value={symbolFrom}
              className="ml-2 text-xs py-0 px-1"
              textC="text-primaryText"
            />

            <span className="flex items-center justify-center relative top-1 ml-3 mr-2">
              *
            </span>

            <div>
              <span
                className={'pr-1 font-nunito break-all'}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                {numberWithCommas(order.price)}
              </span>
            </div>

            <TextWrapper
              value={symbolTo}
              className="ml-2 text-xs py-0 px-1"
              textC="text-primaryText"
            />
          </div>
          <div className="flex items-center">
            <span className="text-primaryText mr-1.5">
              {intl.formatMessage({
                id: 'total_orderly',
                defaultMessage: 'Total',
              })}
            </span>

            <span className="text-white font-nunito font-bold">
              {numberWithCommas(
                new Big(quantity || '0')
                  .times(
                    new Big(order.average_executed_price || order.price || 0)
                  )
                  .toNumber()
              )}
            </span>
          </div>
        </div>

        <div className="whitespace-nowrap font-nunito text-primaryText text-xs frcb">
          <span>{formatTimeDate(order.created_time)}</span>

          <div className="frcs gap-2">
            {order.broker_name && (
              <span>
                <FormattedMessage
                  id="from"
                  defaultMessage={'From'}
                ></FormattedMessage>
              </span>
            )}

            <span>{order.broker_name.replace('DEX', '')}</span>
          </div>
        </div>
      </div>

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
      {mobileEditType !== undefined && (
        <EditOrderModalMobile
          isOpen={mobileEditType !== undefined}
          onRequestClose={() => {
            setMobileEditType(undefined);
          }}
          editType={mobileEditType}
          defaultInput={(mobileEditType === 'price'
            ? order.price
            : order.quantity
          ).toString()}
          confirmClick={(value, type) => {
            const valRes = editValidator(
              type === 'price' ? value : order.price.toString(),
              type === 'quantity' ? value : order.quantity.toString(),
              true
            );

            if (valRes) return valRes;

            handleEditOrder(value, type);

            return '';
          }}
        ></EditOrderModalMobile>
      )}
      {showMobileOrderDetail && (
        <MobileOpenOrderDetail
          isOpen={showMobileOrderDetail}
          onRequestClose={() => {
            setShowMobileOrderDetail(false);
          }}
          titleList={[
            intl.formatMessage({
              id: 'instrument',
              defaultMessage: 'Instrument',
            }),
            intl.formatMessage({
              id: 'Side',
              defaultMessage: 'Side',
            }),
            intl.formatMessage({
              id: 'type',
              defaultMessage: 'Type',
            }),
            intl.formatMessage({
              id: 'filled_qty',
              defaultMessage: 'Filled / Qty',
            }),
            intl.formatMessage({
              id: 'price',
              defaultMessage: 'Price',
            }),
            intl.formatMessage({
              id: 'est_total',
              defaultMessage: 'Est.Total',
            }),
            intl.formatMessage({
              id: 'create_time',
              defaultMessage: 'Create Time',
            }),
          ]}
          valueList={[
            marketInfo,
            <TextWrapper
              className="px-2 text-sm"
              value={intl.formatMessage({
                id: order.side.toLowerCase(),
                defaultMessage: order.side,
              })}
              bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
              textC={
                order.side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
              }
            ></TextWrapper>,
            <div className="flex items-center">
              <span className="text-white capitalize ">
                {order.type === 'LIMIT'
                  ? intl.formatMessage({
                      id: 'limit_orderly',
                      defaultMessage: 'Limit',
                    })
                  : order.type === 'MARKET'
                  ? intl.formatMessage({
                      id: 'market',
                      defaultMessage: 'Market',
                    })
                  : order.type === 'POST_ONLY'
                  ? 'Post Only'
                  : order.type}
              </span>

              <div
                className="flex items-center relative ml-1.5 justify-center border border-dashed rounded-full border-portfolioGreenColor"
                style={{
                  height: '14px',
                  width: '14px',
                }}
              >
                <div
                  className=""
                  style={{
                    height: '9px',
                    width: '9px',
                  }}
                >
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
                </div>
              </div>
            </div>,
            <span className="flex items-center">
              <span className="font-nunito">
                {numberWithCommas(order.executed)}
              </span>
              /{' '}
              <span className="font-nunito">
                {numberWithCommas(order.quantity)}
              </span>
            </span>,
            <span className="font-nunito">
              {numberWithCommas(order.price)}
            </span>,
            <span className="font-nunito">
              {numberWithCommas(
                new Big(quantity || '0')
                  .times(
                    new Big(order.average_executed_price || order.price || 0)
                  )
                  .toNumber()
              )}
            </span>,
            <span className="font-nunito">
              {formatTimeDate(order.created_time)}
            </span>,
          ]}
          cancelClick={() => {
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
                setIsCancelled(true);

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
          order={order}
          editValidator={editValidator}
          mobileEditType={mobileEditType}
          setMobileEditType={setMobileEditType}
          handleEditOrder={handleEditOrder}
        ></MobileOpenOrderDetail>
      )}
    </>
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
  const intl = useIntl();
  const { accountId } = useWalletSelector();

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

  const [showMobileOrderDetail, setShowMobileOrderDetail] =
    useState<boolean>(false);

  const { symbolFrom, symbolTo } = parseSymbol(order.symbol);

  return (
    <>
      <div
        className="hover:bg-orderLineHover xs:hidden md:hidden"
        key={order.order_id}
      >
        <tr
          className={`
          table table-fixed w-full pl-5 pr-4 py-3 border-t border-white border-opacity-10`}
        >
          <td
            className={` py-3 pl-5 relative top-1  ${
              showCurSymbol ? 'hidden' : ''
            }`}
          >
            {marketInfo}
          </td>

          <td
            className={`col-span-1 py-3 ${
              showCurSymbol ? 'pl-5' : 'transform translate-x-1/3'
            }`}
          >
            <TextWrapper
              className="px-2 text-sm"
              value={intl.formatMessage({
                id: order.side.toLowerCase(),
                defaultMessage: order.side,
              })}
              bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
              textC={
                order.side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
              }
            />
          </td>

          <td>
            <FlexRow className="relative col-span-1">
              <span className={`text-white capitalize `}>
                {order.type === 'LIMIT'
                  ? intl.formatMessage({
                      id: 'limit_orderly',
                      defaultMessage: 'Limit',
                    })
                  : order.type === 'MARKET'
                  ? intl.formatMessage({
                      id: 'market',
                      defaultMessage: 'Market',
                    })
                  : order.type === 'POST_ONLY'
                  ? 'Post Only'
                  : order.type}
              </span>

              <div
                className={
                  order.type !== 'MARKET'
                    ? 'flex items-center relative ml-1.5 justify-center border border-dashed rounded-full border-portfolioGreenColor '
                    : 'hidden'
                }
                style={{
                  height: '14px',
                  width: '14px',
                }}
              >
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
            <FlexRow className="col-span-1 flex-wrap">
              <span className="font-nunito">
                {numberWithCommas(order.executed.toString())}
              </span>

              <span className="mx-1 ">/</span>

              <span className="text-white font-nunito">
                {numberWithCommas(order.quantity || order.executed)}
              </span>
            </FlexRow>
          </td>

          <td
            className={`col-span-1 font-nunito text-white justify-self-end relative break-all`}
          >
            <span>
              {order.price || order.average_executed_price
                ? numberWithCommas(order.price || order.average_executed_price)
                : '-'}
            </span>
          </td>

          <td
            className={`col-span-1 font-nunito relative justify-self-end text-white break-all`}
          >
            <span>
              {order.average_executed_price === null
                ? '-'
                : numberWithCommas(order.average_executed_price.toString())}
            </span>
          </td>

          <td
            className={`col-span-1 ml-4 font-nunito justify-self-end relative   text-white`}
          >
            {numberWithCommas(
              new Big(order.quantity || order.executed || '0')
                .times(
                  new Big(order.average_executed_price || order.price || '0')
                )
                .toNumber()
            )}
          </td>

          <td
            className={`col-span-1 font-nunito py-4 whitespace-nowrap text-primaryOrderly justify-self-end relative   text-end`}
          >
            {formatTimeDate(order.created_time)}
          </td>
          <td
            className={`col-span-1 font-nunito py-4  whitespace-nowrap text-primaryOrderly justify-self-end relative transform translate-x-1/2  text-left`}
          >
            {order.broker_name.replace('DEX', '')}
          </td>

          <td className="pr-6" align="right">
            <div className="flex items-center justify-end text-white">
              <span className="">
                {intl.formatMessage({
                  id: _.upperFirst(order.status.toLowerCase()),
                  defaultMessage: _.upperFirst(order.status.toLowerCase()),
                })}
              </span>
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
        {openFilledDetail && orderTradesHistory && (
          <tr
            className={`table table-fixed 
              
            }`}
          >
            <table
              className={`table-fixed text-right flex-col items-end `}
              style={{
                width: showCurSymbol ? '75%' : '66%',
              }}
              // @ts-ignore
              align="right"
            >
              <thead
                className={`w-full   text-xs grid-cols-6 justify-items-start  border-white mt-2 pb-3 pt-1 border-opacity-10  `}
              >
                <tr className="w-full">
                  <td className="">
                    {intl.formatMessage({
                      id: 'qty',
                      defaultMessage: 'Qty',
                    })}
                  </td>

                  <td className="">
                    {intl.formatMessage({
                      id: 'price',
                      defaultMessage: 'Price',
                    })}
                  </td>

                  <td className="">
                    {intl.formatMessage({
                      id: 'total',
                      defaultMessage: 'Total',
                    })}
                  </td>

                  <td className="">
                    <div className="flex items-center justify-end">
                      {intl.formatMessage({
                        id: 'fee_orderly',
                        defaultMessage: 'Fee',
                      })}
                      <TextWrapper
                        value={order.fee_asset}
                        className="ml-2 text-xs py-0 px-1"
                        textC="text-primaryText"
                      />
                    </div>
                  </td>

                  <td className="text-right pr-6" align="right" colSpan={2}>
                    {intl.formatMessage({
                      id: 'time',
                      defaultMessage: 'Time',
                    })}
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
                    <td className="font-nunito">
                      {numberWithCommas(trade.executed_quantity)}
                    </td>
                    <td className="font-nunito">
                      {numberWithCommas(trade.executed_price)}
                    </td>
                    <td className="font-nunito">
                      {numberWithCommas(
                        new Big(trade.executed_quantity || '0')
                          .times(new Big(trade.executed_price || '0'))
                          .toNumber()
                      )}
                    </td>
                    <td className="font-nunito">
                      {scientificNotationToString(trade.fee.toString())}
                    </td>

                    <td
                      className=" pr-6 py-3 font-nunito text-primaryOrderly "
                      align="right"
                      colSpan={2}
                    >
                      {formatTimeDate(trade.executed_timestamp)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </tr>
        )}
      </div>

      <div
        className="lg:hidden relative overflow-hidden p-2.5 pb-3 text-sm bg-menuMoreBgColor flex flex-col  items-stretch w-95vw mx-auto rounded-2xl mb-5 justify-between"
        onClick={() => {
          handleSubmit();
          setShowMobileOrderDetail(!showMobileOrderDetail);
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center ">
            <div className="flex items-center mr-2">
              <TextWrapper
                className="px-2 text-sm  w-11"
                value={intl.formatMessage({
                  id: order.side.toLowerCase(),
                  defaultMessage: order.side,
                })}
                bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-redLight'}
                textC={'text-black font-bold'}
                bgOpacity="bg-opacity-100"
              ></TextWrapper>
            </div>
            {marketInfo}
          </div>
          {order.type === 'MARKET' ? (
            <span>
              {intl.formatMessage({
                id: 'market',
                defaultMessage: 'Market',
              })}
            </span>
          ) : (
            <div className="flex items-center ">
              <span className="font-nunito">
                {parseFloat(
                  order.executed > 0 && order.executed / order.quantity < 0.01
                    ? '1'
                    : order.quantity > 0
                    ? new Big(new Big(order.executed || 0))
                        .div(new Big(order.quantity || 1))
                        .times(100)
                        .toFixed(2)
                    : '0'
                )}
                %
              </span>

              <span className="mx-1.5">
                {intl.formatMessage({
                  id: 'filled',
                  defaultMessage: 'filled',
                })}
              </span>

              <div
                className="flex items-center relative ml-1.5 justify-center
                 border border-dashed rounded-full border-portfolioGreenColor 
                
                "
                style={{
                  height: '14px',
                  width: '14px',
                }}
              >
                <div
                  className=""
                  style={{
                    height: '9px',
                    width: '9px',
                  }}
                >
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
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={`flex  ${'items-center'} py-2 justify-between`}>
          <div className={`flex  ${'items-center'} text-white`}>
            <span className="font-nunito">
              {numberWithCommas(order.quantity || order.executed)}
            </span>

            <TextWrapper
              value={symbolFrom}
              className="ml-3 text-xs py-0 px-1"
              textC="text-primaryText"
            />

            <span className="flex items-center justify-center relative top-1 ml-3 mr-2">
              *
            </span>

            <div className="mr-1 ">
              {order.price || order.average_executed_price ? (
                <span className="font-nunito break-all">
                  {numberWithCommas(
                    order.price || order.average_executed_price
                  )}
                </span>
              ) : (
                '-'
              )}
            </div>

            <TextWrapper
              value={symbolTo}
              className="ml-2  text-xs py-0 px-1"
              textC="text-primaryText"
            />
          </div>
          <div className="flex items-center">
            <span className="text-primaryText mr-1.5">
              {intl.formatMessage({
                id: 'total',
                defaultMessage: 'Total',
              })}
            </span>

            <span className="text-white font-bold font-nunito">
              {numberWithCommas(
                new Big(order.quantity || order.executed || '0')
                  .times(
                    new Big(order.average_executed_price || order.price || '0')
                  )
                  .toNumber()
              )}
            </span>
          </div>
        </div>

        {/* ok  */}

        <div className="whitespace-nowrap font-nunito text-primaryText text-xs frcb">
          <span>{formatTimeDate(order.created_time)}</span>

          <div className="frcs gap-2">
            {order.broker_name && (
              <span>
                <FormattedMessage
                  id="from"
                  defaultMessage={'From'}
                ></FormattedMessage>
              </span>
            )}

            <span>{order.broker_name.replace('DEX', '')}</span>
          </div>
        </div>

        {order.status === 'CANCELLED' && <CancelStamp></CancelStamp>}
        {order.status === 'REJECTED' && <RejectStamp></RejectStamp>}

        {order.status === 'FILLED' && <FilledStamp></FilledStamp>}
      </div>

      {showMobileOrderDetail && (
        <MobileHistoryOrderDetail
          isOpen={showMobileOrderDetail}
          onRequestClose={() => {
            setShowMobileOrderDetail(false);
          }}
          order={order}
          symbol={order.symbol}
          orderTradesHistory={orderTradesHistory}
          titleList={[
            intl.formatMessage({
              id: 'instrument',
              defaultMessage: 'Instrument',
            }),
            intl.formatMessage({
              id: 'Side',
              defaultMessage: 'Side',
            }),
            intl.formatMessage({
              id: 'type',
              defaultMessage: 'Type',
            }),
            intl.formatMessage({
              id: 'filled_qty',
              defaultMessage: 'Filled / Qty',
            }),
            intl.formatMessage({
              id: 'price',
              defaultMessage: 'Price',
            }),
            intl.formatMessage({
              id: 'avg_price',
              defaultMessage: 'Avg.Price',
            }),
            intl.formatMessage({
              id: 'total',
              defaultMessage: 'Total',
            }),
            intl.formatMessage({
              id: 'create_time',
              defaultMessage: 'Create Time',
            }),
            intl.formatMessage({
              id: 'status',
              defaultMessage: 'Status',
            }),
          ]}
          valueList={[
            marketInfo,
            <TextWrapper
              className="px-2 text-sm"
              value={intl.formatMessage({
                id: order.side.toLowerCase(),
                defaultMessage: order.side,
              })}
              bg={order.side === 'BUY' ? 'bg-buyGreen' : 'bg-sellRed'}
              textC={
                order.side === 'BUY' ? 'text-buyGreen' : 'text-sellColorNew'
              }
            ></TextWrapper>,
            <FlexRow className="">
              <span className={`text-white capitalize `}>
                {order.type === 'LIMIT'
                  ? intl.formatMessage({
                      id: 'limit_orderly',
                      defaultMessage: 'Limit',
                    })
                  : order.type === 'MARKET'
                  ? intl.formatMessage({
                      id: 'market',
                      defaultMessage: 'Market',
                    })
                  : order.type === 'POST_ONLY'
                  ? 'Post Only'
                  : order.type}
              </span>

              <div
                className={
                  order.type === 'MARKET'
                    ? 'hidden'
                    : 'flex items-center relative ml-1.5 justify-center border border-dashed rounded-full border-portfolioGreenColor '
                }
                style={{
                  height: '14px',
                  width: '14px',
                }}
              >
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
            </FlexRow>,
            <FlexRow className="col-span-1  ">
              <span className="font-nunito">
                {numberWithCommas(order.executed)}
              </span>

              <span className="mx-1 ">/</span>

              <span className="text-white font-nunito">
                {numberWithCommas(order.quantity || order.executed)}
              </span>
            </FlexRow>,
            <span className="font-nunito">
              {order.price || order.average_executed_price
                ? numberWithCommas(order.price || order.average_executed_price)
                : '-'}
            </span>,
            order.average_executed_price === null ? (
              '-'
            ) : (
              <span className="font-nunito">
                {numberWithCommas(order.average_executed_price)}
              </span>
            ),
            <span className="font-nunito">
              {numberWithCommas(
                new Big(order.quantity || order.executed || '0')
                  .times(
                    new Big(order.average_executed_price || order.price || '0')
                  )
                  .toNumber()
              )}
            </span>,
            <span className="font-nunito">
              {formatTimeDate(order.created_time)}
            </span>,

            <span className="capitalize">
              {intl.formatMessage({
                id: _.upperFirst(order.status.toLowerCase()),
                defaultMessage: _.upperFirst(order.status.toLowerCase()),
              })}
            </span>,
          ]}
        ></MobileHistoryOrderDetail>
      )}
    </>
  );
}

function MobileFilterModal(
  props: {
    curInstrument: JSX.Element | string;
    typeList?: string[];
    curSymbol?: string;
    sideList?: string[];
    statusList?: string[];
    curType?: string;
    curSide: string;
    curStatus?: string;
    setType?: (value: any) => void;
    setSide: (value: any) => void;
    setStatus?: (value: any) => void;
    setInstrument?: (value: string) => void;
    setShowCurSymbol?: (value: boolean) => void;
    showRefOnly: boolean;
    setShowRefOnly: (c: boolean) => void;
  } & Modal.Props
) {
  const {
    curInstrument,
    typeList,
    sideList,
    statusList,
    curSide,
    curStatus,
    curType,
    setType,
    setSide,
    setStatus,
    curSymbol,
    setInstrument,
    setShowCurSymbol,
    showRefOnly,
    setShowRefOnly,
  } = props;

  const [showSymbolSelector, setShowSymbolSelector] = useState<boolean>(false);

  const { setSymbol } = useOrderlyContext();

  function SelectList({
    curSelect,
    list,
    listKey,
    setCurSelect,
    keyTranslate,
  }: {
    listKey: string;
    curSelect: string;
    list: string[];
    setCurSelect: (value: string) => void;
    keyTranslate: 'type' | 'status' | 'side' | 'instrument';
  }) {
    return (
      <div className="mb-5 flex items-start w-full justify-between">
        <div className="text-gray2">{listKey}</div>

        <div
          className={` flex-shrink-0 items-center ${
            list.length > 3 ? 'grid' : 'flex'
          }  grid-cols-2`}
        >
          {list.map((item, index) => {
            return (
              <div
                className="flex items-center ml-4 mb-1"
                key={'mobile-select-list-' + item + index}
                onClick={() => {
                  setCurSelect(item);
                }}
              >
                <CheckBox
                  check={item === curSelect}
                  setCheck={() => setCurSelect(item)}
                ></CheckBox>

                <span className="ml-2">
                  {getTranslateList(keyTranslate)[item]}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  }
  // TODOX
  function SelectListDex({ listKey }: { listKey: string }) {
    return (
      <div className="mb-5 flex items-start w-full justify-between">
        <div className="text-gray2">{listKey}</div>

        <div className={` flex-shrink-0 items-center ${'flex'}  grid-cols-2`}>
          <div
            className="flex items-center ml-4 mb-1"
            onClick={() => {
              setShowRefOnly(true);
            }}
          >
            <CheckBox
              check={showRefOnly}
              setCheck={() => setShowRefOnly(true)}
            ></CheckBox>

            <span className="ml-2">
              {intl.formatMessage({
                id: 'ref_order',
                defaultMessage: 'REF Dex only',
              })}
            </span>
          </div>

          <div
            className="flex items-center ml-4 mb-1"
            onClick={() => {
              setShowRefOnly(false);
            }}
          >
            <CheckBox
              check={!showRefOnly}
              setCheck={() => setShowRefOnly(false)}
            ></CheckBox>

            <span className="ml-2">
              {intl.formatMessage({
                id: 'all',
                defaultMessage: 'All',
              })}
            </span>
            <TurnPage />
          </div>
        </div>
      </div>
    );
  }

  const intl = useIntl();

  return (
    <>
      <Modal
        {...props}
        style={{
          content: {
            position: 'fixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: 'none',
            bottom: '0px',
            left: '0px',
            transform: 'translate(-50%, -20px)',
            outline: 'none',
            zIndex: 999,
          },
        }}
      >
        <div className="bg-darkBg px-5 overflow-auto  xs:w-screen xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl  text-base   rounded-lg   border-t border-borderC  py-4 text-white">
          <div className="text-left font-bold flex items-center justify-between">
            <span>
              {intl.formatMessage({
                id: 'filter',
                defaultMessage: 'Filter',
              })}
            </span>

            <span
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();

                props.onRequestClose && props.onRequestClose(e);
              }}
            >
              <IoClose size={20} className="text-primaryText"></IoClose>
            </span>
          </div>

          <div className="flex items-center justify-between my-5">
            <span>
              {intl.formatMessage({
                id: 'instrument',
                defaultMessage: 'Instrument',
              })}
            </span>
            <div
              className="flex items-center"
              onClick={() => {
                setShowSymbolSelector(true);
              }}
            >
              <span className={curInstrument === 'All' ? 'mr-2' : ''}>
                {curInstrument === 'All'
                  ? intl.formatMessage({
                      id: 'All',
                      defaultMessage: 'All',
                    })
                  : curInstrument}
              </span>
              <RiArrowDownSFill
                color="white"
                className="relative bottom-0.5 right-1"
                size="22"
              />
            </div>
          </div>
          {typeList && (
            <SelectList
              curSelect={curType}
              listKey={intl.formatMessage({
                id: 'type',
                defaultMessage: 'Type',
              })}
              list={typeList}
              setCurSelect={setType}
              keyTranslate="type"
            />
          )}

          <SelectList
            curSelect={curSide}
            listKey={intl.formatMessage({
              id: 'Side',
              defaultMessage: 'Side',
            })}
            list={sideList}
            setCurSelect={setSide}
            keyTranslate="side"
          />

          {statusList && (
            <SelectList
              curSelect={curStatus}
              listKey={intl.formatMessage({
                id: 'status',
                defaultMessage: 'Status',
              })}
              list={statusList}
              setCurSelect={setStatus}
              keyTranslate="status"
            />
          )}

          <SelectListDex
            listKey={intl.formatMessage({
              id: 'dex',
              defaultMessage: 'Dex',
            })}
          />
        </div>
      </Modal>

      {showSymbolSelector && (
        <SymbolSelectorMobileModal
          isOpen={showSymbolSelector}
          setSymbol={(value: string) => {
            setShowCurSymbol(true);
            setSymbol(value);
            setInstrument(value);
          }}
          onRequestClose={() => {
            setShowSymbolSelector(false);
          }}
          fromList
          all={curInstrument === 'All'}
          curSymbol={curSymbol}
          fromListClick={() => {
            setShowCurSymbol(false);
            setInstrument('all_markets');
          }}
        ></SymbolSelectorMobileModal>
      )}
    </>
  );
}
function InfoLineOpenOrder({
  value,
  title,
  editType,
  setMobileEditType,
}: {
  value: JSX.Element | string;
  title: string;
  editType?: 'price' | 'quantity';
  setMobileEditType: (value: 'price' | 'quantity') => void;
}) {
  return (
    <div className="flex items-center justify-between mt-4 text-base">
      <div className="text-primaryText">{title}</div>
      <div
        className={`text-white flex items-center ${
          title === 'Instrument' ? 'relative left-2' : ''
        } `}
      >
        {value}

        <span
          className="pl-2"
          onClick={() => {
            if (editType) {
              setMobileEditType(editType);
            }
          }}
        >
          {editType && <MobileEdit></MobileEdit>}
        </span>
      </div>
    </div>
  );
}

function MobileOpenOrderDetail(
  props: Modal.Props & {
    valueList: (JSX.Element | string)[];

    titleList: string[];

    cancelClick: () => void;
    mobileEditType: 'price' | 'quantity';
    setMobileEditType: (value: 'price' | 'quantity') => void;
    editValidator: (value1: string, value2: string, noPop?: boolean) => string;
    handleEditOrder: (value: string, value2: 'price' | 'quantity') => void;
    order: MyOrder;
  }
) {
  const {
    editValidator,
    order,
    titleList,
    valueList,
    cancelClick,
    mobileEditType,
    setMobileEditType,
    handleEditOrder,
  } = props;

  const intl = useIntl();

  return (
    <>
      <Modal
        {...props}
        style={{
          content: {
            position: 'fixed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            top: 'none',
            bottom: '0px',
            left: '0px',
            transform: 'translate(-50%, -20px)',
            outline: 'none',
            zIndex: 999,
          },
        }}
      >
        <div className="bg-darkBg px-5 pb-6 overflow-auto  xs:w-screen  xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl  text-base   rounded-lg   border-t border-borderC  py-4 text-white">
          <div className="text-left font-bold">
            {intl.formatMessage({
              id: 'open_order_detail',
              defaultMessage: 'Open Order Detail',
            })}
          </div>

          {titleList.map((title, index) => {
            return (
              <InfoLineOpenOrder
                key={'mobile-detail-list-' + title}
                title={title}
                value={valueList[index]}
                editType={
                  index === 3 ? 'quantity' : index === 4 ? 'price' : undefined
                }
                setMobileEditType={setMobileEditType}
              />
            );
          })}

          <button
            className="flex items-center py-3 mt-3 justify-center w-full text-warn bg-menuMoreBgColor rounded-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              cancelClick();
            }}
          >
            {intl.formatMessage({
              id: 'cancel_order',
              defaultMessage: 'Cancel Order',
            })}
          </button>
        </div>
      </Modal>
      {mobileEditType !== undefined && (
        <EditOrderModalMobile
          isOpen={mobileEditType !== undefined}
          onRequestClose={() => {
            setMobileEditType(undefined);
          }}
          editType={mobileEditType}
          defaultInput={(mobileEditType === 'price'
            ? order.price
            : order.quantity
          ).toString()}
          confirmClick={(value, type) => {
            const valRes = editValidator(
              type === 'price' ? value : order.price.toString(),
              type === 'quantity' ? value : order.quantity.toString(),
              true
            );

            if (valRes) return valRes;

            handleEditOrder(value, type);

            return '';
          }}
        ></EditOrderModalMobile>
      )}
    </>
  );
}
function InfoLine({
  value,
  title,
}: {
  value: JSX.Element | string;
  title: string;
}) {
  return (
    <div className="flex px-5 items-center justify-between mt-4 text-base">
      <div className="text-primaryText">{title}</div>

      <div
        className={`text-white ${
          title === 'Instrument' ? 'relative left-2' : ''
        } `}
      >
        {value}
      </div>
    </div>
  );
}

function DetailTable({
  orderTradesHistory,
}: {
  orderTradesHistory: OrderTrade[];
}) {
  const intl = useIntl();

  if (!orderTradesHistory || orderTradesHistory.length === 0) return null;
  return (
    <table className="table-fixed w-full bg-one_level_menu_color">
      <thead className="text-primaryText text-13px">
        <th align="left" className="pl-5">
          {intl.formatMessage({
            id: 'qty',
            defaultMessage: 'Qty',
          })}
        </th>

        <th align="left">
          {intl.formatMessage({
            id: 'price',
            defaultMessage: 'Price',
          })}
        </th>
        <th align="left">
          {intl.formatMessage({
            id: 'total',
            defaultMessage: 'Total',
          })}
        </th>
        <th align="left" className="whitespace-nowrap">
          {intl.formatMessage({
            id: 'fee_orderly',
            defaultMessage: 'Fee',
          })}
          <TextWrapper
            value={orderTradesHistory[0].fee_asset}
            className="ml-1 text-xs py-0 px-1"
            textC="text-primaryText"
          />
        </th>
        <th align="right" className="pr-5">
          {intl.formatMessage({
            id: 'time',
            defaultMessage: 'Time',
          })}
        </th>
      </thead>

      <tbody className="text-xs">
        {orderTradesHistory.map((h) => {
          return (
            <tr
              style={{
                verticalAlign: 'baseline',
              }}
            >
              <td className="pl-5">{numberWithCommas(h.executed_quantity)}</td>
              <td>{numberWithCommas(h.executed_price)}</td>

              <td>
                {numberWithCommas(
                  new Big(h.executed_quantity || '0')
                    .times(new Big(h.executed_price || '0'))
                    .toNumber()
                )}
              </td>

              <td>
                {h.fee < 0.00001
                  ? '< 0.00001'
                  : scientificNotationToString(h.fee.toString())}
              </td>
              <td className="text-primaryText pr-5 w-11" align="right">
                {formatTimeDate(h.executed_timestamp)
                  .split(' ')
                  .map((s, i) => {
                    return (
                      <div
                        className={`${
                          i === 0 ? 'relative right-3' : ''
                        } whitespace-nowrap text-right `}
                        key={s}
                      >
                        {s}
                      </div>
                    );
                  })}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function MobileHistoryOrderDetail(
  props: Modal.Props & {
    valueList: (JSX.Element | string)[];

    titleList: string[];
    orderTradesHistory: OrderTrade[];
    symbol: string;
    order: MyOrder;
    type?: string;
  }
) {
  const {
    titleList,
    order,
    valueList,
    symbol,
    orderTradesHistory,
    type = 'history',
  } = props;

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [showDetail, setShowDetail] = useState<boolean>(false);
  const intl = useIntl();
  return (
    <Modal
      {...props}
      style={{
        content: {
          position: 'fixed',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          top: 'none',
          bottom: '0px',
          left: '0px',
          transform: 'translate(-50%, -20px)',
          outline: 'none',
          zIndex: 999,
        },
      }}
    >
      <div className="bg-darkBg  pb-6 overflow-auto  xs:w-screen  xs:fixed xs:bottom-0 xs:left-0 rounded-t-2xl  text-base   rounded-lg   border-t border-borderC  py-4 text-white">
        <div className="text-left px-5 font-bold">
          {intl.formatMessage({
            id: `${type}_order_detail`,
            defaultMessage: 'History Order Detail',
          })}
        </div>

        {titleList.map((title, index) => {
          return (
            <InfoLine
              key={'mobile-detail-list-' + title}
              title={title}
              value={valueList[index]}
            />
          );
        })}

        <button
          className={
            !(order.executed !== null && order.executed > 0)
              ? 'hidden'
              : ' text-white px-5 mx-5 py-3 my-3 justify-center w-full flex items-center bg-menuMoreBgColor rounded-lg'
          }
          style={{
            width: 'calc(100% - 40px)',
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setShowDetail(!showDetail);
          }}
        >
          <span>
            {intl.formatMessage({
              id: 'detail',
              defaultMessage: 'Detail',
            })}
          </span>
          <span
            className={`text-white ml-2 ${
              !showDetail ? 'transform rotate-180' : ''
            } `}
          >
            <HistoryOrderDetailIcon />
          </span>
        </button>
        {showDetail && orderTradesHistory && (
          <DetailTable orderTradesHistory={orderTradesHistory}></DetailTable>
        )}
      </div>
    </Modal>
  );
}

function OpenOrders({
  orders,
  symbol,
  hidden,
  setOpenCount,
  allTokens,
  availableSymbols,
  showCurSymbol,
  loading,
  mobileFilterOpen,
  setMobileFilterOpen,
  setShowCurSymbol,
  setMobileFilterSize,
  mobileFilterSize,
  tab,
  showRefOnly,
  setShowRefOnly,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;
  allTokens: {
    [key: string]: TokenMetadata;
  };
  tab: 'open' | 'history' | 'positions';
  mobileFilterSize: number;
  setMobileFilterSize: (s: number) => void;
  mobileFilterOpen: 'open' | 'history' | undefined;
  showCurSymbol: boolean;
  availableSymbols: SymbolInfo[] | undefined;
  setOpenCount: (c: number) => void;
  setMobileFilterOpen: (c: 'open' | 'history' | undefined) => void;
  setShowCurSymbol: (c: boolean) => void;
  loading: boolean;
  showRefOnly: boolean;
  setShowRefOnly: (c: boolean) => void;
}) {
  const [showSideSelector, setShowSideSelector] = useState<boolean>(false);

  const [otherLineOpenTrigger, setOtherLineOpenTrigger] = useState<number>();

  const { holdings: curHoldings } = useOrderlyContext();

  const [chooseSide, setChooseSide] = useState<'Both' | 'Buy' | 'Sell'>('Both');

  const { symbolFrom, symbolTo } = parseSymbol(symbol);

  const [chooseMarketSymbol, setChooseMarketSymbol] = useState<string>(
    showCurSymbol && !isMobile() ? symbol : 'all_markets'
  );
  const [chooseStatus, setChooseStatus] = useState<
    'All' | 'New' | 'Partial Filled'
  >('All');

  const [showMarketSelector, setShowMarketSelector] = useState<boolean>(false);

  useEffect(() => {
    if (tab !== 'open') return;

    const count =
      (chooseMarketSymbol !== 'all_markets' ? 1 : 0) +
      (chooseSide !== 'Both' ? 1 : 0) +
      (chooseStatus !== 'All' ? 1 : 0) +
      (showRefOnly ? 1 : 0);

    setMobileFilterSize(count);
  }, [chooseMarketSymbol, chooseSide, tab, chooseStatus, showRefOnly]);

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

    const d =
      chooseStatus === 'All' ||
      (order.status === 'NEW' && chooseStatus === 'New') ||
      (chooseStatus === 'Partial Filled' && order.status === 'PARTIAL_FILLED');

    return a && b && c && d;
  };

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
  }, [chooseSide, chooseMarketSymbol, !!orders, chooseType, showRefOnly]);

  useEffect(() => {
    if (showCurSymbol) {
      setChooseMarketSymbol(symbol);
    } else {
      setChooseMarketSymbol('all_markets');
    }
  }, [showCurSymbol, symbol]);
  const intl = useIntl();

  const generateMarketList = () => {
    if (!availableSymbols || !allTokens) return [];
    const marketList = [
      {
        text: (
          <div className="flex items-center p-0.5 pr-4 my-0.5">
            <div className="mr-2 ml-1 text-white text-sm ">
              <AllMarketIcon />
            </div>
            <span className="text-white">
              {intl.formatMessage({
                id: 'all',
                defaultMessage: 'All',
              })}
            </span>
          </div>
        ),
        textId: 'all_markets',
      },
    ];

    availableSymbols
      .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
      .forEach((symbol) => {
        const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);

        const symbolType = PerpOrSpot(symbol.symbol);

        const fromToken = allTokens[symbolFrom === 'BTC' ? 'WBTC' : symbolFrom];

        const tokenList =
          isMobile() && symbolType === 'PERP'
            ? [fromToken]
            : [fromToken, allTokens[symbolTo]];

        const render = (
          <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
            <img
              src={fromToken?.icon}
              alt=""
              className="rounded-full xs:hidden md:hidden flex-shrink-0 w-5 h-5 mr-2.5"
            />

            <Images
              tokens={tokenList}
              size="5"
              className="lg:hidden"
              borderStyle="border-gradientFrom"
            />

            <span className="xs:text-white  xs:font-bold">{symbolFrom}</span>

            <span className="text-primaryOrderly xs:text-white xs:font-bold">
              {symbolType === 'SPOT' ? '/' : ' '}
              <span className={symbolType === 'PERP' ? 'ml-1' : ''}>
                {symbolType === 'SPOT' ? symbolTo : ` PERP`}
              </span>
            </span>
          </div>
        );

        marketList.push({
          text: render,
          textId: symbol.symbol,
        });
      });

    return marketList;
  };
  const marketList = useMemo(
    () => generateMarketList(),
    [JSON.stringify(availableSymbols), JSON.stringify(allTokens)]
  );

  const symbolType = PerpOrSpot(symbol);

  const typeList =
    symbolType === 'SPOT'
      ? [
          {
            text: intl.formatMessage({
              id: 'All',
              defaultMessage: 'All',
            }),
            textId: 'All',
            className: 'text-white',
          },
          {
            text: intl.formatMessage({
              id: 'limit_orderly',
              defaultMessage: 'Limit',
            }),
            textId: 'Limit',
            className: 'text-white',
          },
          {
            text: intl.formatMessage({
              id: 'market',
              defaultMessage: 'Market',
            }),
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
        ]
      : [
          {
            text: intl.formatMessage({
              id: 'All',
              defaultMessage: 'All',
            }),
            textId: 'All',
            className: 'text-white',
          },
          {
            text: intl.formatMessage({
              id: 'limit_orderly',
              defaultMessage: 'Limit',
            }),
            textId: 'Limit',
            className: 'text-white',
          },
          {
            text: 'Post Only',
            textId: 'Post Only',
            className: 'text-white',
          },
        ];

  const orderData = orders
    .sort(sortingFunc)
    .filter(filterFunc)
    .map((order) => {
      return (
        <OrderLine
          marketInfo={marketList.find((m) => m.textId === order.symbol)?.text}
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
    });

  if (hidden) return null;

  return (
    <>
      {mobileFilterSize > 0 && isMobile() && tab === 'open' && (
        <div className="w-95vw mx-auto px-2 pl-3 rounded-xl py-2.5 mb-3 flex justify-between bg-menuMoreBgColor text-primaryText text-sm">
          <div>
            {intl.formatMessage({
              id: 'filter',
              defaultMessage: 'Filter',
            })}
            :
          </div>

          <div className="flex flex-wrap items-center justify-end">
            {chooseMarketSymbol !== 'all_markets' && (
              <div className="flex items-center mr-2">
                {symbolType === 'SPOT' && (
                  <span>
                    {parseSymbol(chooseMarketSymbol).symbolFrom}-
                    {parseSymbol(chooseMarketSymbol).symbolTo}
                  </span>
                )}
                {symbolType === 'PERP' && (
                  <span>
                    {`${parseSymbol(chooseMarketSymbol).symbolFrom} PERP`}
                  </span>
                )}
                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setChooseMarketSymbol('all_markets');
                    setShowCurSymbol(false);
                  }}
                >
                  <IoIosClose strokeWidth={3}></IoIosClose>
                </span>
              </div>
            )}

            {chooseSide !== 'Both' && (
              <div className="flex items-center mr-2">
                <span>
                  {intl.formatMessage({
                    id: chooseSide.toLowerCase(),
                    defaultMessage: chooseSide,
                  })}
                </span>

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setChooseSide('Both');
                  }}
                >
                  <IoIosClose></IoIosClose>
                </span>
              </div>
            )}

            {chooseStatus !== 'All' && (
              <div className="flex items-center mr-2">
                <span>{getTranslateList('status')[chooseStatus]}</span>

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setChooseStatus('All');
                  }}
                >
                  <IoIosClose></IoIosClose>
                </span>
              </div>
            )}

            {showRefOnly && (
              <div className="flex items-center mr-2">
                <span>
                  {intl.formatMessage({
                    id: 'ref_order',
                    defaultMessage: 'REF Dex only',
                  })}
                </span>

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setShowRefOnly(false);
                  }}
                >
                  <IoIosClose></IoIosClose>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <table className="table-fixed w-full">
        {/* Header */}
        <thead
          className={`w-full xs:hidden table table-fixed  pl-5 pr-4 py-2    border-white border-opacity-10`}
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
                      intl.formatMessage({
                        id: 'instrument',
                        defaultMessage: 'Instrument',
                      })
                    ) : (
                      <>
                        <span className="text-white">
                          {parseSymbol(chooseMarketSymbol).symbolFrom}
                        </span>
                        <span className={symbolType === 'PERP' ? 'ml-1' : ''}>
                          {symbolType === 'PERP'
                            ? ` PERP`
                            : `/${parseSymbol(chooseMarketSymbol).symbolTo}`}
                        </span>
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
                className={`col-span-1  ${
                  showCurSymbol ? 'pl-5' : 'left-1/3'
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
                  <span>
                    {chooseSide === 'Both'
                      ? intl.formatMessage({
                          id: 'Side',
                          defaultMessage: 'Side',
                        })
                      : intl.formatMessage({
                          id: chooseSide.toLocaleLowerCase(),
                          defaultMessage: chooseSide,
                        })}
                  </span>

                  <MdArrowDropDown
                    size={22}
                    color={showSideSelector ? 'white' : '#7E8A93'}
                  />
                </div>

                {showSideSelector && (
                  <Selector
                    selected={intl.formatMessage({
                      id: chooseSide.toLowerCase(),
                      defaultMessage: chooseSide,
                    })}
                    setSelect={(value: any) => {
                      setChooseSide(value);
                      setShowSideSelector(false);
                    }}
                    list={[
                      {
                        text: intl.formatMessage({
                          id: 'both',
                          defaultMessage: 'Both',
                        }),
                        textId: 'Both',
                        className: 'text-white',
                      },
                      {
                        text: intl.formatMessage({
                          id: 'buy',
                          defaultMessage: 'Buy',
                        }),
                        textId: 'Buy',
                        className: 'text-buyGreen',
                      },
                      {
                        text: intl.formatMessage({
                          id: 'sell',
                          defaultMessage: 'Sell',
                        }),
                        textId: 'Sell',
                        className: 'text-sellColorNew',
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
                    if (symbolType === 'SPOT') return;
                    e.preventDefault();
                    e.stopPropagation();
                    setShowTypeSelector(!showTypeSelector);
                    setShowMarketSelector(false);
                    setShowSideSelector(false);
                  }}
                >
                  <span>
                    {chooseType === 'All'
                      ? intl.formatMessage({
                          id: 'type',
                          defaultMessage: 'Type',
                        })
                      : chooseType === 'Limit'
                      ? intl.formatMessage({
                          id: 'limit_orderly',
                          defaultMessage: 'Limit',
                        })
                      : chooseType}
                  </span>

                  {symbolType === 'PERP' && (
                    <MdArrowDropDown
                      size={22}
                      color={showTypeSelector ? 'white' : '#7E8A93'}
                    />
                  )}
                </div>
                {showTypeSelector && (
                  <Selector
                    selected={chooseType}
                    setSelect={(value: any) => {
                      setChooseType(value);
                      setShowTypeSelector(false);
                    }}
                    list={typeList}
                  />
                )}
              </FlexRow>
            </th>

            <th>
              <FlexRow className="col-span-1 relative ">
                <span className="whitespace-nowrap">
                  {intl.formatMessage({
                    id: 'filled_qty',
                    defaultMessage: 'Filled / Qty',
                  })}
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
              <FlexRow
                className={`col-span-2 relative py-2  justify-self-center`}
              >
                <span>
                  {intl.formatMessage({
                    id: 'price',
                    defaultMessage: 'Price',
                  })}
                </span>
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
                {intl.formatMessage({
                  id: 'est_total',
                  defaultMessage: 'Est.Total',
                })}
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
                <span>
                  {intl.formatMessage({
                    id: 'time',
                    defaultMessage: 'Time',
                  })}
                </span>
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

            <th>
              <div
                className={`cursor-pointe text-left transform translate-x-2/3`}
              >
                <span>
                  {intl.formatMessage({
                    id: 'dex',
                    defaultMessage: 'Dex',
                  })}
                </span>
              </div>
            </th>

            <th align="right">
              <span className="pr-6">
                {' '}
                {intl.formatMessage({
                  id: 'action',
                  defaultMessage: 'Action',
                })}
              </span>
            </th>
          </tr>
        </thead>
        <tbody
          className=" lg:max-h-vh65   block overflow-auto  flex-col "
          id="all-orders-body-open"
        >
          {loading ? (
            <OrderlyLoading></OrderlyLoading>
          ) : orders.filter(filterFunc).length === 0 ? (
            <div className="text-primaryText text-opacity-30 mt-10 mb-4 text-center text-sm flex flex-col justify-center items-center gap-2">
              {isMobile() && <NoOrderEmpty></NoOrderEmpty>}
              {intl.formatMessage({
                id: 'no_orders_found',
                defaultMessage: 'No orders found',
              })}
            </div>
          ) : (
            orderData
          )}
        </tbody>
      </table>

      <MobileFilterModal
        isOpen={mobileFilterOpen === 'open'}
        onRequestClose={() => {
          setMobileFilterOpen(undefined);
        }}
        curInstrument={
          chooseMarketSymbol === 'all_markets'
            ? 'All'
            : marketList.find((m) => m.textId === symbol)?.text
        }
        curSymbol={showCurSymbol ? symbol : ''}
        sideList={['Both', 'Buy', 'Sell']}
        setSide={setChooseSide}
        curSide={chooseSide}
        setInstrument={(value: string) => {
          setChooseMarketSymbol(value);
        }}
        setShowCurSymbol={setShowCurSymbol}
        statusList={['All', 'New', 'Partial Filled']}
        setStatus={setChooseStatus}
        curStatus={chooseStatus}
        showRefOnly={showRefOnly}
        setShowRefOnly={setShowRefOnly}
      ></MobileFilterModal>
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
  showCurSymbol,
  loading,
  mobileFilterOpen,
  setMobileFilterOpen,
  setShowCurSymbol,
  setMobileFilterSize,
  mobileFilterSize,
  tab,
  showRefOnly,
  setShowRefOnly,
}: {
  orders: MyOrder[];
  symbol: string;
  hidden?: boolean;
  allTokens: {
    [key: string]: TokenMetadata;
  };
  showRefOnly: boolean;
  setShowRefOnly: (c: boolean) => void;
  mobileFilterOpen: 'open' | 'history' | undefined;
  availableSymbols: SymbolInfo[] | undefined;
  setHistoryCount: (c: number) => void;
  showCurSymbol: boolean;
  loading: boolean;
  tab: 'open' | 'history' | 'positions';
  mobileFilterSize: number;
  setMobileFilterSize: (s: number) => void;
  setMobileFilterOpen: (c: 'open' | 'history' | undefined) => void;
  setShowCurSymbol: (c: boolean) => void;
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
    showCurSymbol && !isMobile() ? symbol : 'all_markets'
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
  }, [chooseSide, chooseType, chooseStatus, orders, chooseMarketSymbol]);

  useEffect(() => {
    if (tab !== 'history') return;
    const count =
      (chooseMarketSymbol !== 'all_markets' ? 1 : 0) +
      (chooseSide !== 'Both' ? 1 : 0) +
      (chooseStatus !== 'All' ? 1 : 0) +
      (chooseType !== 'All' ? 1 : 0) +
      (showRefOnly ? 1 : 0);

    setMobileFilterSize(count);
  }, [
    chooseMarketSymbol,
    chooseSide,
    chooseStatus,
    chooseType,
    tab,
    showRefOnly,
  ]);

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
  const intl = useIntl();

  const generateMarketList = () => {
    if (!availableSymbols || !allTokens) return [];
    const marketList = [
      {
        text: (
          <div className="flex items-center p-0.5 pr-4 my-0.5">
            <div className="mr-2 ml-1 text-white text-sm ">
              <AllMarketIcon />
            </div>
            <span className="text-white">
              {intl.formatMessage({
                id: 'all',
                defaultMessage: 'All',
              })}
            </span>
          </div>
        ),
        textId: 'all_markets',
      },
    ];

    availableSymbols
      .sort((a, b) => (a.symbol > b.symbol ? 1 : -1))
      .forEach((symbol) => {
        const { symbolFrom, symbolTo } = parseSymbol(symbol.symbol);
        const fromToken = allTokens[symbolFrom === 'BTC' ? 'WBTC' : symbolFrom];

        const symbolType = PerpOrSpot(symbol.symbol);
        const tokenList =
          isMobile() && symbolType === 'PERP'
            ? [fromToken]
            : [fromToken, allTokens[symbolTo]];

        const render = (
          <div className="flex items-center p-0.5 pr-4 text-white text-sm my-0.5">
            <img
              src={fromToken?.icon}
              alt=""
              className="rounded-full xs:hidden md:hidden flex-shrink-0 w-5 h-5 mr-2.5"
            />

            <Images
              tokens={tokenList}
              size="5"
              className="lg:hidden"
              borderStyle="border-gradientFrom"
            />

            <span className="xs:text-white  xs:font-bold">{symbolFrom}</span>

            <span className="text-primaryOrderly xs:text-white xs:font-bold">
              {symbolType === 'SPOT' ? '/' : ' '}
              <span className={symbolType === 'PERP' ? 'ml-1' : ''}>
                {symbolType === 'SPOT' ? symbolTo : ` PERP`}
              </span>
            </span>
          </div>
        );

        marketList.push({
          text: render,
          textId: symbol.symbol,
        });
      });

    return marketList;
  };

  const marketList = useMemo(
    () => generateMarketList(),
    [JSON.stringify(availableSymbols), JSON.stringify(allTokens)]
  );

  const data = orders
    .sort(sortingFunc)
    .filter(filterFunc)
    .map((order) => {
      return (
        <HistoryOrderLine
          marketInfo={marketList.find((m) => m.textId === order.symbol)?.text}
          symbol={symbol}
          order={order}
          key={order.order_id}
          showCurSymbol={showCurSymbol}
        />
      );
    });
  const itemsPerPage = 25;
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [records, setRecords] = useState<number>(itemsPerPage);

  const loadMore = () => {
    if (records === data.length) {
      setHasMore(false);
    } else {
      setTimeout(() => {
        setRecords(records + itemsPerPage);
      }, 500);
    }
  };

  const symbolType = PerpOrSpot(symbol);

  const typeList = [
    {
      text: intl.formatMessage({
        id: 'All',
        defaultMessage: 'All',
      }),
      textId: 'All',
      className: 'text-white',
    },
    {
      text: intl.formatMessage({
        id: 'limit_orderly',
        defaultMessage: 'Limit',
      }),
      textId: 'Limit',
      className: 'text-white',
    },
    {
      text: intl.formatMessage({
        id: 'market',
        defaultMessage: 'Market',
      }),
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
  ];

  return (
    <>
      {mobileFilterSize > 0 && isMobile() && tab === 'history' && (
        <div className="w-95vw mx-auto px-2 pl-3 rounded-xl py-2.5 mb-3 flex justify-between bg-menuMoreBgColor text-primaryText text-sm">
          <div>
            {' '}
            {intl.formatMessage({
              id: 'filter',
              defaultMessage: 'Filter',
            })}
            :
          </div>

          <div className="flex flex-wrap items-center justify-end">
            {chooseMarketSymbol !== 'all_markets' && (
              <div className="flex items-center mr-2 ">
                {symbolType === 'SPOT' && (
                  <span>
                    {parseSymbol(chooseMarketSymbol).symbolFrom}-
                    {parseSymbol(chooseMarketSymbol).symbolTo}
                  </span>
                )}
                {symbolType === 'PERP' && (
                  <span>
                    {`${parseSymbol(chooseMarketSymbol).symbolFrom} PERP`}
                  </span>
                )}

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setChooseMarketSymbol('all_markets');
                    setShowCurSymbol(false);
                  }}
                >
                  <IoIosClose strokeWidth={3}></IoIosClose>
                </span>
              </div>
            )}

            {chooseType !== 'All' && (
              <div className="flex items-center mr-2 ">
                <span>
                  {' '}
                  {chooseType === 'Limit'
                    ? intl.formatMessage({
                        id: 'limit_orderly',
                        defaultMessage: 'Limit',
                      })
                    : chooseType === 'Market'
                    ? intl.formatMessage({
                        id: 'market',
                        defaultMessage: 'Market',
                      })
                    : chooseType}
                </span>

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setChooseType('All');
                  }}
                >
                  <IoIosClose></IoIosClose>
                </span>
              </div>
            )}

            {chooseSide !== 'Both' && (
              <div className="flex items-center mr-2 ">
                <span>
                  {intl.formatMessage({
                    id: chooseSide.toLowerCase(),
                    defaultMessage: chooseSide,
                  })}
                </span>

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setChooseSide('Both');
                  }}
                >
                  <IoIosClose></IoIosClose>
                </span>
              </div>
            )}

            {chooseStatus !== 'All' && (
              <div className="flex items-center mr-2">
                <span>
                  {intl.formatMessage({
                    id: chooseStatus,
                    defaultMessage: chooseStatus,
                  })}
                </span>

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setChooseStatus('All');
                  }}
                >
                  <IoIosClose></IoIosClose>
                </span>
              </div>
            )}

            {showRefOnly && (
              <div className="flex items-center mr-2">
                <span>
                  {intl.formatMessage({
                    id: 'ref_order',
                    defaultMessage: 'REF Dex only',
                  })}
                </span>

                <span
                  className="ml-2 flex items-center justify-center rounded-full w-4 h-4 bg-mobileOrderListTab text-primaryText"
                  onClick={() => {
                    setShowRefOnly(false);
                  }}
                >
                  <IoIosClose></IoIosClose>
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <table className={`table-fixed w-full ${hidden ? 'hidden' : ''} `}>
        {/* Header */}
        <thead
          className={`table xs:hidden table-fixed  pl-5 pr-4 py-2   border-white border-opacity-10`}
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
                        intl.formatMessage({
                          id: 'instrument',
                          defaultMessage: 'Instrument',
                        })
                      ) : (
                        <>
                          <span className="text-white">
                            {parseSymbol(chooseMarketSymbol).symbolFrom}
                          </span>
                          <span className={symbolType === 'PERP' ? 'ml-1' : ''}>
                            {symbolType === 'PERP'
                              ? ` PERP`
                              : `/${parseSymbol(chooseMarketSymbol).symbolTo}`}
                          </span>
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
                      width="w-p200"
                    />
                  )}
                </FlexRow>
              )}
            </th>

            <th className={`py-2.5 `}>
              <FlexRow
                className={`col-span-1  relative ${
                  showCurSymbol ? 'pl-5' : 'left-1/3'
                }`}
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
                  <span>
                    {chooseSide === 'Both'
                      ? intl.formatMessage({
                          id: 'Side',
                          defaultMessage: 'Side',
                        })
                      : intl.formatMessage({
                          id: chooseSide.toLowerCase(),
                          defaultMessage: chooseSide,
                        })}
                  </span>

                  <MdArrowDropDown
                    size={22}
                    color={showSideSelector ? 'white' : '#7E8A93'}
                  />
                </div>

                {showSideSelector && (
                  <Selector
                    selected={intl.formatMessage({
                      id: chooseSide.toLowerCase(),
                      defaultMessage: chooseSide,
                    })}
                    setSelect={(value: any) => {
                      setChooseSide(value);
                      setShowSideSelector(false);
                    }}
                    list={[
                      {
                        text: intl.formatMessage({
                          id: 'both',
                          defaultMessage: 'Both',
                        }),
                        textId: 'Both',
                        className: 'text-white',
                      },
                      {
                        text: intl.formatMessage({
                          id: 'buy',
                          defaultMessage: 'Buy',
                        }),
                        textId: 'Buy',
                        className: 'text-buyGreen',
                      },
                      {
                        text: intl.formatMessage({
                          id: 'sell',
                          defaultMessage: 'Sell',
                        }),
                        textId: 'Sell',
                        className: 'text-sellColorNew',
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
                  <span>
                    {chooseType === 'All'
                      ? intl.formatMessage({
                          id: 'type',
                          defaultMessage: 'Type',
                        })
                      : chooseType === 'Limit'
                      ? intl.formatMessage({
                          id: 'limit_orderly',
                          defaultMessage: 'Limit',
                        })
                      : chooseType === 'Market'
                      ? intl.formatMessage({
                          id: 'market',
                          defaultMessage: 'Market',
                        })
                      : chooseType}
                  </span>

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
                    list={typeList}
                  />
                )}
              </FlexRow>
            </th>

            <th>
              <FlexRow className="col-span-1 relative ">
                <span>
                  {intl.formatMessage({
                    id: 'filled_qty',
                    defaultMessage: 'Filled / Qty',
                  })}
                </span>
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
                <span>
                  {' '}
                  {intl.formatMessage({
                    id: 'price',
                    defaultMessage: 'Price',
                  })}
                </span>

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
                <span>
                  {intl.formatMessage({
                    id: 'avg_price',
                    defaultMessage: 'Avg.Price',
                  })}
                </span>
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
                <span>
                  {intl.formatMessage({
                    id: 'total_orderly',
                    defaultMessage: 'Both',
                  })}
                </span>
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
                <span>
                  {intl.formatMessage({
                    id: 'time',
                    defaultMessage: 'Time',
                  })}
                </span>
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
            <th>
              <div
                className={`cursor-pointer text-left transform translate-x-1/2`}
              >
                <span>
                  {intl.formatMessage({
                    id: 'dex',
                    defaultMessage: 'Dex',
                  })}
                </span>
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
                  <span>
                    {chooseStatus === 'All'
                      ? intl.formatMessage({
                          id: 'status',
                          defaultMessage: 'Status',
                        })
                      : intl.formatMessage({
                          id: chooseStatus,
                          defaultMessage: chooseStatus,
                        })}
                  </span>

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
                        text: intl.formatMessage({
                          id: 'All',
                          defaultMessage: 'All',
                        }),
                        textId: 'All',
                        className: 'text-white',
                      },
                      {
                        text: intl.formatMessage({
                          id: 'Filled',
                          defaultMessage: 'Filled',
                        }),
                        textId: 'Filled',
                        className: 'text-white',
                      },
                      {
                        text: intl.formatMessage({
                          id: 'Cancelled',
                          defaultMessage: 'Cancelled',
                        }),
                        textId: 'Cancelled',
                        className: 'text-white',
                      },
                      {
                        text: intl.formatMessage({
                          id: 'Rejected',
                          defaultMessage: 'Rejected',
                        }),
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
          className=" overflow-auto lg:max-h-vh65  flex-col block"
          id="all-orders-body-history"
        >
          {loading ? (
            <OrderlyLoading></OrderlyLoading>
          ) : orders.filter(filterFunc).length === 0 ? (
            <div className="text-primaryText text-opacity-30 mt-10 mb-4 text-center text-sm flex flex-col justify-center items-center gap-2">
              {isMobile() && <NoOrderEmpty></NoOrderEmpty>}
              {intl.formatMessage({
                id: 'no_orders_found',
                defaultMessage: 'No orders found',
              })}
            </div>
          ) : (
            <InfiniteScroll
              next={loadMore}
              hasMore={hasMore}
              dataLength={records}
              loader={null}
              style={{ overflow: 'static' }}
              scrollableTarget={isMobile() ? null : 'all-orders-body-history'}
            >
              {data.slice(0, records)}
            </InfiniteScroll>
          )}
        </tbody>
      </table>

      <MobileFilterModal
        isOpen={mobileFilterOpen === 'history'}
        onRequestClose={() => {
          setMobileFilterOpen(undefined);
        }}
        curInstrument={
          chooseMarketSymbol === 'all_markets'
            ? 'All'
            : marketList.find((m) => m.textId === symbol)?.text
        }
        curSymbol={showCurSymbol ? symbol : ''}
        typeList={['All', 'Limit', 'Market', 'Post Only', 'IOC', 'FOK']}
        setType={setChooseType}
        curType={chooseType}
        sideList={['Both', 'Buy', 'Sell']}
        setSide={setChooseSide}
        curSide={chooseSide}
        setInstrument={(value: string) => {
          setChooseMarketSymbol(value);
        }}
        curStatus={chooseStatus}
        setStatus={setChooseStatus}
        statusList={['All', 'Cancelled', 'Filled', 'Rejected']}
        setShowCurSymbol={setShowCurSymbol}
        showRefOnly={showRefOnly}
        setShowRefOnly={setShowRefOnly}
      ></MobileFilterModal>
    </>
  );
}

function AllOrderBoard({
  maintenance,
  defaultOpen,
  subOrderTab,
  setSubOrderTab,
  setDisplayOrderCount,
  displayOrderCount,
}: {
  maintenance?: boolean;
  defaultOpen?: boolean;
  subOrderTab?: 'open' | 'history';
  setSubOrderTab?: (c: 'open' | 'history') => void;
  displayOrderCount?: number;
  setDisplayOrderCount?: (c: number) => void;
}) {
  const {
    symbol,
    tokenInfo,
    availableSymbols: AllAvailableSymbols,
    allOrders,
    storageEnough,
  } = useOrderlyContext();
  const symbolType = PerpOrSpot(symbol);

  const availableSymbols = AllAvailableSymbols?.filter(
    (s) => s.symbol.indexOf(symbolType) > -1
  );

  const [mobileFilterOpen, setMobileFilterOpen] = useState<
    'open' | 'history' | undefined
  >(undefined);

  const allTokenSymbols = [
    ...new Set(
      !availableSymbols
        ? []
        : availableSymbols.flatMap((s) => {
            const { symbolFrom, symbolTo } = parseSymbol(s.symbol);

            return [symbolFrom === 'BTC' ? 'WBTC' : symbolFrom, symbolTo];
          })
    ),
  ];
  const allTokens = useBatchTokenMetaFromSymbols(
    allTokenSymbols.length > 0 ? allTokenSymbols : null,
    tokenInfo
  );

  const isMobile = useClientMobile();

  const { accountId } = useWalletSelector();

  const loading =
    typeof allOrders === 'undefined' &&
    !!accountId &&
    storageEnough &&
    !!localStorage.getItem(REF_ORDERLY_ACCOUNT_VALID) &&
    !maintenance;

  const [tab, setTab] = useState<'open' | 'history' | 'positions'>(
    symbolType === 'PERP' ? (defaultOpen ? 'open' : 'positions') : 'open'
  );

  useEffect(() => {
    if (symbolType === 'SPOT' && tab === 'positions') {
      setTab('open');
      setSubOrderTab && setSubOrderTab('open');
    }
    if (symbolType === 'PERP' && !defaultOpen) {
      setTab('positions');
    }
  }, [symbolType]);

  const { newPositions } = usePerpData();

  const [showCurSymbol, setShowCurSymbol] = useState<boolean>(false);

  const [showRefOnly, setShowRefOnly] = useState<boolean>(false);

  const openOrders = allOrders?.filter((o) => {
    return (
      (o.status === 'NEW' || o.status === 'PARTIAL_FILLED') &&
      // o.symbol === symbol &&
      (!showRefOnly || o.broker_id === 'ref_dex')
    );
  });

  const historyOrders = allOrders?.filter((o) => {
    return (
      openOrders?.map((o) => o.order_id).indexOf(o.order_id) === -1 &&
      // o.symbol === symbol &&
      (!showRefOnly || o.broker_id === 'ref_dex')
    );
  });

  const [openCount, setOpenCount] = useState<number>();

  const [historyCount, setHistoryCount] = useState<number>();

  useEffect(() => {
    if (subOrderTab && subOrderTab === 'open') {
      setDisplayOrderCount && setDisplayOrderCount(openCount);
    }
  }, [openCount, subOrderTab]);

  useEffect(() => {
    if (subOrderTab && subOrderTab === 'history') {
      setDisplayOrderCount && setDisplayOrderCount(historyCount);
    }
  }, [historyCount, subOrderTab]);

  const intl = useIntl();

  const [mobileFilterSize, setMobileFilterSize] = useState<number>(0);

  useEffect(() => {
    if (openOrders !== undefined) {
      setOpenCount(openOrders.length);
    }

    if (historyOrders !== undefined) {
      setHistoryCount(historyOrders.length);
    }
  }, [openOrders?.length, historyOrders?.length]);

  return (
    <>
      <div
        className="w-full relative  xs:mt-6 lg:rounded-2xl shadow-sm  lg:border md:border-none xs:border-none  text-primaryOrderly border-boxBorder    text-sm lg:bg-black  lg:bg-opacity-10 pb-4"
        style={{
          minHeight: isMobile ? '' : 'calc(100vh - 680px)',
        }}
      >
        <FlexRowBetween className="pb-1.5 xs:mb-5 py-3  rounded-t-2xl lg:border-b xs:px-0 xs:py-0 px-5 mt-0 border-white border-opacity-10">
          <FlexRow
            className={`min-h-8 xs:ml-3 xs:p-1 xs:py-0.5 xs:border lg:gap-8 border-white border-opacity-10 xs:rounded-xl`}
          >
            <FlexRow
              onClick={() => {
                setTab('positions');
              }}
              className={`font-gothamBold justify-center  xs:py-0.5 xs:px-2 xs:rounded-lg ${
                tab === 'positions' ? 'xs:bg-mobileOrderBg ' : ''
              } ${
                symbolType === 'SPOT' || !!isMobile ? 'hidden' : ''
              } cursor-pointer`}
            >
              <span
                className={
                  tab === 'positions'
                    ? 'text-white relative'
                    : 'text-primaryOrderly relative'
                }
              >
                {intl.formatMessage({
                  id: 'positions',
                  defaultMessage: 'Positions',
                })}

                {tab === 'positions' && !isMobile && (
                  <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-3 left-0"></div>
                )}
              </span>

              <span
                className={`flex items-center justify-center h-4 px-1.5 min-w-fit text-xs rounded-md  ml-2 ${
                  tab === 'positions'
                    ? 'text-white bg-grayBgLight'
                    : 'text-primaryOrderly bg-symbolHover'
                } 
                  ${isMobile ? 'hidden' : ''}
                `}
              >
                {!newPositions ||
                newPositions?.rows?.filter(
                  (p) =>
                    p.position_qty !== 0 &&
                    (showCurSymbol ? p.symbol === symbol : true)
                )?.length === undefined
                  ? '-'
                  : newPositions?.rows?.filter(
                      (p) =>
                        p.position_qty !== 0 &&
                        (showCurSymbol ? p.symbol === symbol : true)
                    )?.length}
              </span>
            </FlexRow>

            <FlexRow
              onClick={() => {
                setTab('open');
                setSubOrderTab && setSubOrderTab('open');
              }}
              className={`font-gothamBold justify-center  xs:py-0.5 xs:px-2 xs:rounded-lg ${
                tab === 'open' ? 'xs:bg-mobileOrderBg ' : ''
              } cursor-pointer `}
            >
              <span
                className={
                  tab === 'open'
                    ? 'text-white relative'
                    : 'text-primaryOrderly relative'
                }
              >
                {intl.formatMessage({
                  id: 'open_orders',
                  defaultMessage: 'Open Orders',
                })}

                {tab === 'open' && !isMobile && (
                  <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-3 left-0"></div>
                )}
              </span>

              <span
                className={`flex items-center justify-center h-4 px-1.5 min-w-fit text-xs rounded-md  ml-2 ${
                  tab === 'open'
                    ? allOrders === undefined || loading
                      ? 'text-white bg-grayBgLight'
                      : 'bg-baseGreen text-black'
                    : 'text-primaryOrderly bg-symbolHover'
                } 
                  ${isMobile ? 'hidden' : ''}
                `}
              >
                {allOrders === undefined || loading ? '-' : openCount}
              </span>
            </FlexRow>

            <FlexRow
              onClick={() => {
                setTab('history');
                setSubOrderTab && setSubOrderTab('history');
              }}
              className={`font-gothamBold justify-center  xs:py-0.5 xs:px-2 xs:rounded-lg ${
                tab === 'history' ? 'xs:bg-mobileOrderBg ' : ''
              } cursor-pointer `}
            >
              <span
                className={
                  tab === 'history'
                    ? 'text-white relative'
                    : 'text-primaryOrderly relative'
                }
              >
                {intl.formatMessage({
                  id: 'history_orderly',
                  defaultMessage: 'History',
                })}

                {tab === 'history' && !isMobile && (
                  <div className="h-0.5 bg-gradientFromHover rounded-lg w-full absolute -bottom-3 left-0"></div>
                )}
              </span>

              <span
                className={`flex items-center justify-center xs:h-6 px-1.5 min-w-fit  text-xs rounded-md  ml-2 ${
                  tab === 'history'
                    ? allOrders === undefined || loading
                      ? 'text-white bg-grayBgLight'
                      : 'bg-baseGreen text-black'
                    : 'text-primaryOrderly bg-symbolHover'
                } 
                
                ${isMobile ? 'hidden' : ''}
                `}
              >
                {allOrders === undefined || loading ? '-' : historyCount}
              </span>
            </FlexRow>
          </FlexRow>

          <FlexRow
            className={
              !accountId || isMobile || tab === 'positions' ? 'hidden' : ''
            }
          >
            <div className="frcs gap-2">
              <CheckBox
                check={showRefOnly}
                setCheck={() => {
                  setShowRefOnly(true);
                }}
              />

              <span
                className=" cursor-pointer"
                onClick={() => {
                  setShowRefOnly(true);
                }}
              >
                {intl.formatMessage({
                  id: 'ref_order',
                  defaultMessage: 'REF Dex only',
                })}
              </span>
            </div>

            <div className="ml-6 frcs">
              <CheckBox
                check={!showRefOnly}
                setCheck={() => {
                  setShowRefOnly(false);
                }}
              ></CheckBox>

              <span
                className="ml-2 frcs cursor-pointer gap-1"
                onClick={() => {
                  setShowRefOnly(false);
                }}
              >
                {intl.formatMessage({
                  id: 'All',
                  defaultMessage: 'All',
                })}

                <QuestionTip
                  id="display_all_orders_dexes"
                  defaultMessage="Display orders placed through all channels on Orderly."
                  uniquenessId="display_all_orders_dexes"
                ></QuestionTip>
              </span>
              <TurnPage />
            </div>
          </FlexRow>

          <FlexRow className={'lg:hidden'}>
            <div
              className="flex relative items-center justify-center pr-5"
              onClick={() => {
                tab === 'open'
                  ? setMobileFilterOpen('open')
                  : setMobileFilterOpen('history');
              }}
            >
              <MobileFilter></MobileFilter>
              {mobileFilterSize > 0 && (
                <div className="absolute  -bottom-1 right-3 text-10px w-3 h-3 rounded-full flex items-center justify-center font-bold text-black bg-gradientFrom">
                  {mobileFilterSize}
                </div>
              )}
            </div>
          </FlexRow>
        </FlexRowBetween>
        <OpenOrders
          availableSymbols={availableSymbols}
          allTokens={allTokens}
          orders={openOrders || []}
          setOpenCount={setOpenCount}
          symbol={symbol}
          hidden={tab !== 'open'}
          showCurSymbol={showCurSymbol}
          loading={loading}
          mobileFilterOpen={mobileFilterOpen}
          setMobileFilterOpen={setMobileFilterOpen}
          setShowCurSymbol={setShowCurSymbol}
          setMobileFilterSize={setMobileFilterSize}
          mobileFilterSize={mobileFilterSize}
          tab={tab}
          showRefOnly={showRefOnly}
          setShowRefOnly={setShowRefOnly}
        />
        <HistoryOrders
          tab={tab}
          availableSymbols={availableSymbols}
          allTokens={allTokens}
          setHistoryCount={setHistoryCount}
          orders={historyOrders || []}
          symbol={symbol}
          hidden={tab !== 'history'}
          showCurSymbol={showCurSymbol}
          loading={loading}
          mobileFilterOpen={mobileFilterOpen}
          setMobileFilterOpen={setMobileFilterOpen}
          setShowCurSymbol={setShowCurSymbol}
          setMobileFilterSize={setMobileFilterSize}
          mobileFilterSize={mobileFilterSize}
          showRefOnly={showRefOnly}
          setShowRefOnly={setShowRefOnly}
        />

        <PositionsTable
          hidden={tab !== 'positions' || !!isMobile}
          showCurSymbol={showCurSymbol}
          futureOrders={openOrders}
        />
      </div>
    </>
  );
}
export default AllOrderBoard;
