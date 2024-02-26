import React, { useEffect, useState, useRef } from 'react';
import Big from 'big.js';
import { IoClose, MdArrowDropDown } from '../../../../components/reactIcons';
import { useIntl, IntlShape } from 'react-intl';
import Modal from 'react-modal';
import { debounce } from 'lodash';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import { OrderlyLoading } from '../Common/Icons';
import { TextWrapper } from '../UserBoard';
import { tickToPrecision } from '../UserBoardPerp/math';
import { parseSymbol } from '../RecentTrade';
import {
  orderEditPopUpFailure,
  orderEditPopUpSuccess,
  usePortfolioFailure,
} from '../Common';
import {
  cancelOrder,
  getPortfolioAllOrders,
} from '../../orderly/off-chain-api';
import { useOrderlyContext } from '../../orderly/OrderlyContext';
import { formatDecimalToTwoOrMore } from '../../orderly/utils';
import { MarkPrice, MyOrder, SymbolInfo } from '../../orderly/type';
import { useLeverage } from '../../orderly/state';
import { ONLY_ZEROS } from '../../../../utils/numbers';
import { constOrderlyPageSize } from '~src/pages/Orderly/orderly/constant';

const priceValidator = (
  price: string,
  size: string,
  symbolInfo: any,
  intl: IntlShape,
  side: string,
  orderType: string,
  markPrice: MarkPrice,
  portfolioFailure: ({ tip }: { tip: string }) => void,
  setTips?: (input: string) => void
) => {
  if (!symbolInfo) {
    return;
  }

  if (
    new Big(new Big(price || 0).minus(new Big(symbolInfo.quote_min)))
      .mod(symbolInfo.quote_tick)
      .gt(0)
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'price_should_be_a_multiple_of',
          defaultMessage: 'Price should be a multiple of',
        })} ${symbolInfo.quote_tick}${intl.formatMessage({
          id: 'price_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'price_should_be_a_multiple_of',
          defaultMessage: 'Price should be a multiple of',
        })} ${symbolInfo.quote_tick}${intl.formatMessage({
          id: 'price_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`,
      });
    }
    return;
  }

  if (
    price &&
    size &&
    new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`,
      });
    }
    return;
  }

  if (
    price &&
    size &&
    side === 'Sell' &&
    orderType === 'Limit' &&
    markPrice &&
    new Big(price || 0).gt(
      new Big(markPrice.price || 0).mul(1 + symbolInfo.price_range)
    )
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'perp_buy_limit_order_range',
          defaultMessage:
            'The price of buy limit orders should be less than or equal to',
        })} ${new Big(markPrice.price || 0)
          .mul(1 + symbolInfo.price_range)
          .toFixed(tickToPrecision(symbolInfo.quote_tick))}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'perp_buy_limit_order_range',
          defaultMessage:
            'The price of buy limit orders should be less than or equal to',
        })} ${new Big(markPrice.price || 0)
          .mul(1 + symbolInfo.price_range)
          .toFixed(tickToPrecision(symbolInfo.quote_tick))}`,
      });
    }

    return;
  }

  if (
    price &&
    size &&
    side === 'Buy' &&
    orderType === 'Limit' &&
    markPrice &&
    new Big(price || 0).lt(
      new Big(markPrice.price || 0).mul(1 - symbolInfo.price_range)
    )
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'perp_sell_limit_order_range',
          defaultMessage:
            'The price of sell limit orders should be greater than or equal to',
        })} ${new Big(markPrice.price || 0)
          .mul(1 - symbolInfo.price_range)
          .toFixed(tickToPrecision(symbolInfo.quote_tick), 3)}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'perp_sell_limit_order_range',
          defaultMessage:
            'The price of sell limit orders should be greater than or equal to',
        })} ${new Big(markPrice.price || 0)
          .mul(1 - symbolInfo.price_range)
          .toFixed(tickToPrecision(symbolInfo.quote_tick), 3)}`,
      });
    }

    return;
  }

  if (
    price &&
    size &&
    side === 'Buy' &&
    orderType === 'Limit' &&
    markPrice &&
    new Big(price || 0).gt(
      new Big(markPrice.price || 0).mul(1 + symbolInfo.price_scope)
    )
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'perp_sell_limit_order_scope',
          defaultMessage:
            'The price of a sell limit order cannot be higher than',
        })} ${new Big(markPrice.price || 0)
          .mul(1 + symbolInfo.price_scope)
          .toFixed(tickToPrecision(symbolInfo.quote_tick))}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'perp_sell_limit_order_scope',
          defaultMessage:
            'The price of a sell limit order cannot be higher than',
        })} ${new Big(markPrice.price || 0)
          .mul(1 + symbolInfo.price_scope)
          .toFixed(tickToPrecision(symbolInfo.quote_tick))}`,
      });
    }

    return;
  }

  if (
    price &&
    size &&
    side === 'Sell' &&
    orderType === 'Limit' &&
    markPrice &&
    new Big(price || 0).lt(
      new Big(markPrice.price || 0).mul(1 - symbolInfo.price_scope)
    )
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'perp_buy_limit_order_scope',
          defaultMessage: 'The price of a buy limit order cannot be lower than',
        })} ${new Big(markPrice.price || 0)
          .mul(1 - symbolInfo.price_scope)
          .toFixed(tickToPrecision(symbolInfo.quote_tick), 3)}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'perp_buy_limit_order_scope',
          defaultMessage: 'The price of a buy limit order cannot be lower than',
        })} ${new Big(markPrice.price || 0)
          .mul(1 - symbolInfo.price_scope)
          .toFixed(tickToPrecision(symbolInfo.quote_tick), 3)}`,
      });
    }

    return;
  }

  setTips && setTips('');
  return true;
};

const sizeValidator = (
  price: string,
  size: string,
  symbolInfo: any,
  intl: IntlShape,
  side: string,
  portfolioFailure: ({ tip }: { tip: string }) => void,
  setTips?: (input: string) => void
) => {
  if (!symbolInfo) {
    return;
  }

  if (new Big(size || 0).lt(symbolInfo.base_min)) {
    if (setTips) {
      setTips(`
        ${
          side === 'Buy'
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
        } ${symbolInfo.base_min}`);
    } else {
      portfolioFailure({
        tip: `${
          side === 'Buy'
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
        } ${symbolInfo.base_min}`,
      });
    }
    return;
  }

  if (new Big(size || 0).gt(symbolInfo.base_max)) {
    if (setTips) {
      setTips(`
        ${
          side === 'Buy'
            ? intl.formatMessage({
                id: 'quantity_to_buy_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to buy should be less than or equal to',
              })
            : intl.formatMessage({
                id: 'quantity_to_sell_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to sell should be less than or equal to',
              })
        } ${symbolInfo.base_max}`);
    } else {
      portfolioFailure({
        tip: `${
          side === 'Buy'
            ? intl.formatMessage({
                id: 'quantity_to_buy_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to buy should be less than or equal to',
              })
            : intl.formatMessage({
                id: 'quantity_to_sell_should_be_less_than_or_equal_to',
                defaultMessage:
                  'Quantity to sell should be less than or equal to',
              })
        } ${symbolInfo.base_max}`,
      });
    }

    return;
  }

  if (
    new Big(new Big(size || 0).minus(new Big(symbolInfo.base_min)))
      .mod(symbolInfo.base_tick)
      .gt(0)
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of',
          defaultMessage: 'Quantity should be a multiple of',
        })} ${symbolInfo.base_tick}${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of',
          defaultMessage: 'Quantity should be a multiple of',
        })} ${symbolInfo.base_tick}${intl.formatMessage({
          id: 'quantity_should_be_a_multiple_of_zh',
          defaultMessage: ' ',
        })}`,
      });
    }

    return;
  }

  if (
    price &&
    size &&
    new Big(price || 0).times(new Big(size || 0)).lt(symbolInfo.min_notional)
  ) {
    if (setTips) {
      setTips(
        `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`
      );
    } else {
      portfolioFailure({
        tip: `${intl.formatMessage({
          id: 'the_order_value_should_be_be_greater_than_or_equal_to',
          defaultMessage:
            'The order value should be be greater than or equal to',
        })} ${symbolInfo.min_notional}`,
      });
    }

    return;
  }

  setTips && setTips('');
  return true;
};

const priceAndSizeValidator = (
  price: string,
  size: string,
  symbolInfo: any,
  intl: IntlShape,
  side: string,
  orderType: string,
  markPrice: MarkPrice,
  portfolioFailure: ({ tip }: { tip: string }) => void
) => {
  if (!symbolInfo || (ONLY_ZEROS.test(price) && ONLY_ZEROS.test(size))) {
    return;
  }

  let resPrice;
  let resSize;

  if (!ONLY_ZEROS.test(price)) {
    resPrice = priceValidator(
      price,
      size,
      symbolInfo,
      intl,
      side,
      orderType,
      markPrice,
      portfolioFailure
    );
  } else {
    resPrice = true;
  }

  if (!ONLY_ZEROS.test(size)) {
    resSize = sizeValidator(
      price,
      size,
      symbolInfo,
      intl,
      side,
      portfolioFailure
    );
  } else {
    resSize = true;
  }

  return resPrice === true && resSize === true;
};

const debouncedPriceAndSizeValidator = debounce(
  (
    closingPrice,
    closingQuantity,
    symbolInfo,
    intl,
    side,
    priceType,
    referenceMark,
    portfolioFailure
  ) => {
    priceAndSizeValidator(
      closingPrice,
      closingQuantity,
      symbolInfo,
      intl,
      side,
      priceType,
      referenceMark,
      portfolioFailure
    );
  },
  1000
);

export const FutureTableFormHeaders: React.FC = () => {
  const intl = useIntl();

  const TableHeader: React.FC = ({ children }) => (
    <th className={`col-span-3 pb-2 flex items-center`}>
      <div className={`flex items-center relative text-left`}>
        <span
          className="hidden md:flex lg:flex items-center "
          style={{ color: '#7E8A93' }}
        >
          <span className={`ml-2`}>{children}</span>
        </span>
      </div>
    </th>
  );

  return (
    <>
      <TableHeader>
        {intl.formatMessage({
          id: 'qty.',
          defaultMessage: 'Qty.',
        })}
      </TableHeader>
      <TableHeader>
        {intl.formatMessage({
          id: 'price',
          defaultMessage: 'Price',
        })}
      </TableHeader>
    </>
  );
};

const PendingOrderRow: React.FC<{
  order: any;
  onUpdateData: any;
}> = ({ order, onUpdateData }) => {
  const intl = useIntl();
  const { accountId } = useWalletSelector();
  const { handlePendingOrderRefreshing } = useOrderlyContext();
  const { symbol, quantity, price, order_id, side } = order;
  const [loading, setLoading] = useState(false);

  return (
    <div className="px-4 py-2 grid grid-cols-4 gap-2 rounded-lg hover:bg-symbolHover3">
      <div className="col-span-3 text-sm flex justify-between">
        <span className="pr-3">
          <span className="whitespace-nowrap">{quantity}&nbsp;</span>
          <span className="text-primaryText whitespace-nowrap">
            {parseSymbol(symbol).symbolFrom}
          </span>
        </span>
        <span className="text-left">
          <span className="text-primaryText">
            {intl.formatMessage({ id: 'at_orderly', defaultMessage: 'at' })}
          </span>
          &nbsp;
          <span className="whitespace-nowrap">
            $
            {price?.toFixed(
              symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 3
            )}
          </span>
        </span>
      </div>
      <div className="col-span-1 flex justify-end items-center">
        <div
          className="cursor-pointer"
          onClick={async () => {
            if (!accountId || loading) return;
            try {
              setLoading(true);

              const res = await cancelOrder({
                accountId,
                DeleteParams: {
                  order_id,
                  symbol,
                },
              });

              if (res.success === true) {
                setLoading(false);
                return orderEditPopUpSuccess({
                  side: side == 'BUY' ? 'Buy' : 'Sell',
                  size: quantity,
                  price,
                  cancel: true,
                  symbolName: symbol,
                });
              }
            } catch (err) {
              setLoading(false);
              return orderEditPopUpFailure({
                tip: err.message,
              });
            } finally {
              // Orderly API does not instantly update with the latest result
              setTimeout(() => {
                handlePendingOrderRefreshing();
                onUpdateData();
              }, 500);
            }
          }}
        >
          {loading ? (
            <OrderlyLoading className="animate-spin" />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 1.81818C5.48131 1.81818 1.81818 5.48131 1.81818 10C1.81818 14.5187 5.48131 18.1818 10 18.1818C14.5187 18.1818 18.1818 14.5187 18.1818 10C18.1818 5.48131 14.5187 1.81818 10 1.81818ZM0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
                fill="#FF6A8E"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.24243 9.99972C4.24243 9.33028 4.78512 8.7876 5.45455 8.7876L14.5455 8.7876C15.2149 8.7876 15.7576 9.33028 15.7576 9.99972C15.7576 10.6692 15.2149 11.2118 14.5455 11.2118L5.45455 11.2118C4.78512 11.2118 4.24243 10.6692 4.24243 9.99972Z"
                fill="#FF6A8E"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

export const FutureTableFormCells: React.FC<{
  position_qty: number;
  closingQuantity: number;
  mark_price: number;
  setClosingQuantity: (input: number) => void;
  closingPrice: string | 'Market';
  setClosingPrice: (input: string | 'Market') => void;
  open: boolean;
  setOpen: (input: boolean) => void;
  showFloatingBox: boolean;
  setShowFloatingBox: (input: boolean) => void;
  isFocus: string;
  setIsFocus: (input: string) => void;
  handleOpenClosing: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  row: any;
  markPrices: MarkPrice[];
  futureOrders: MyOrder[];
}> = ({
  position_qty,
  mark_price,
  closingQuantity,
  setClosingQuantity,
  closingPrice,
  setClosingPrice,
  open,
  setOpen,
  showFloatingBox,
  setShowFloatingBox,
  handleOpenClosing,
  row,
  markPrices,
  futureOrders,
}) => {
  const intl = useIntl();
  const { availableSymbols, everyTickers } = useOrderlyContext();
  const [orders, setOrders] = useState<MyOrder[]>([]);
  const symbolInfo = availableSymbols?.find((s) => s.symbol === row.symbol);
  const referenceMark = markPrices?.find((m) => m.symbol === row.symbol);
  const portfolioFailure = usePortfolioFailure();
  const { accountId } = useWalletSelector();

  // get close price from everyTickers for this symbol

  const closePrice = everyTickers?.find((t) => t.symbol === row.symbol)?.close;

  useEffect(() => {
    const closePrice = everyTickers?.find(
      (t) => t.symbol === row.symbol
    )?.close;

    if (closingPrice !== 'Market' && closePrice) {
      setClosingPrice(closePrice?.toString());
    }
  }, [row.symbol]);

  useEffect(() => {
    getPendingOrders();
  }, []);

  useEffect(() => {
    setClosingQuantity(Math.abs(position_qty));
  }, [position_qty]);

  useEffect(() => {
    if (open)
      document.addEventListener('click', () => {
        setOpen(false);
      });
  }, [open]);

  const getPendingOrders = async () => {
    const res = await getPortfolioAllOrders({
      accountId,
      OrderProps: {
        page: 1,
        size: 500,
        status: 'INCOMPLETE',
      },
    });
    const filterOrders: MyOrder[] = res?.data?.rows?.filter((order: MyOrder) =>
      order.symbol.includes('PERP')
    );

    const data = filterOrders.filter(
      (order) =>
        order.symbol === row.symbol &&
        order.side === (position_qty > 0 ? 'SELL' : 'BUY')
    );

    data && setOrders(data);
  };

  return (
    <>
      <td className={`col-span-3 flex items-center py-5 relative break-words`}>
        <div className={`flex items-center text-white`}>
          <input
            id={`${row.symbol}-input`}
            className={`border border-orderTypeBg px-4 py-1.5 text-xs ${
              position_qty > 0 ? 'text-buyGreen' : 'text-sellColorNew'
            }`}
            style={{
              borderRadius: '6px',
              backgroundColor: 'rgba(0, 0, 0, 0.10)',
            }}
            type="number"
            placeholder="0.0"
            onChange={({ target }) => {
              if (target.value) {
                debouncedPriceAndSizeValidator(
                  closingPrice === 'Market'
                    ? mark_price.toString()
                    : closingPrice.toString(),
                  target.value,
                  symbolInfo,
                  intl,
                  position_qty > -1 ? 'Buy' : 'Sell',
                  closingPrice === 'Market' ? 'Market' : 'Limit',
                  referenceMark,
                  portfolioFailure
                );
              }

              let value: number = parseFloat(target.value);
              if (value > Math.abs(position_qty))
                value = Math.abs(position_qty);
              if (value < 0) value = 0;
              setClosingQuantity(value);
            }}
            // @ts-ignore
            onWheel={(e) => e.target.blur()}
            onBlur={() => {
              if (isNaN(closingQuantity))
                setClosingQuantity(Math.abs(position_qty));
            }}
            value={closingQuantity}
          />
        </div>
      </td>
      <td className={`col-span-3 flex items-center py-5 relative break-words`}>
        <div className={`flex items-center text-white relative  w-full`}>
          <div
            className="absolute w-full z-10 border border-orderTypeBg"
            style={{
              borderRadius: '6px',
              backgroundColor: open ? '#101E28' : 'rgba(0, 0, 0, 0.10)',
              top: '-15px',
            }}
          >
            <div className="w-full px-2.5 py-1.5 text-white relative">
              <input
                className="w-full pr-2"
                placeholder={mark_price.toString()}
                onChange={({ target }) => {
                  if (target.value) {
                    debouncedPriceAndSizeValidator(
                      closingPrice === 'Market'
                        ? mark_price.toString()
                        : target.value,
                      closingQuantity.toString(),
                      symbolInfo,
                      intl,
                      position_qty > -1 ? 'Buy' : 'Sell',
                      closingPrice === 'Market' ? 'Market' : 'Limit',
                      referenceMark,
                      portfolioFailure
                    );
                  }

                  const value: string = target.value;
                  if (
                    value &&
                    value !== 'Market' &&
                    !/^(?:0|[1-9]\d*)(?:\.\d*)?$/.test(value)
                  )
                    return;
                  setClosingPrice(value);
                }}
                // @ts-ignore
                onWheel={(e) => e.target.blur()}
                value={closingPrice}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (closingPrice === 'Market')
                    setClosingPrice(
                      closePrice?.toString() || mark_price.toString()
                    );
                  else setOpen(true);
                }}
              />
              {closingPrice !== 'Market' && (
                <svg
                  className="absolute right-1 top-1/2 cursor-pointer"
                  style={{ transform: 'translateY(-50%)' }}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOpen(!open);
                  }}
                  width="10"
                  height="6"
                  viewBox="0 0 10 6"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5.38406 5.53907C5.18417 5.77894 4.81574 5.77894 4.61584 5.53907L0.683364 0.820091C0.411977 0.494427 0.643556 -9.9678e-07 1.06747 -9.5972e-07L8.93243 -2.72144e-07C9.35635 -2.35083e-07 9.58793 0.494429 9.31654 0.820092L5.38406 5.53907Z"
                    fill={closingPrice ? 'white' : '#7E8A93'}
                  />
                </svg>
              )}
            </div>
            {open && (
              <div
                className="cursor-pointer text-primaryText px-2.5 py-1.5 w-full rounded-md hover:bg-dclSelectTokenHover hover:text-white"
                onClick={() => {
                  setClosingPrice('Market');
                  setOpen(false);
                }}
              >
                {intl.formatMessage({
                  id: 'market',
                  defaultMessage: 'Market',
                })}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className={`col-span-3 flex items-center py-5 break-all`}>
        <div className={`flex items-center text-white w-full`}>
          <div
            className="w-full relative"
            onMouseEnter={() => setShowFloatingBox(true)}
            onMouseLeave={() => setShowFloatingBox(false)}
          >
            <div
              className={`border w-full text-center border-orderTypeBg ${
                orders.length > 0 ? 'px-1.5' : 'px-3'
              } py-1.5 whitespace-nowrap rounded-md text-xs text-primaryText cursor-pointer`}
              onClick={() => {
                const pass = priceAndSizeValidator(
                  closingPrice === 'Market'
                    ? mark_price.toString()
                    : closingPrice,
                  closingQuantity.toString(),
                  symbolInfo,
                  intl,
                  position_qty > -1 ? 'Buy' : 'Sell',
                  closingPrice === 'Market' ? 'Market' : 'Limit',
                  referenceMark,
                  portfolioFailure
                );
                if (pass) {
                  handleOpenClosing(
                    closingQuantity,
                    closingPrice === ''
                      ? mark_price
                      : closingPrice === 'Market'
                      ? closingPrice
                      : parseFloat(closingPrice),
                    row
                  );
                }
              }}
            >
              {intl.formatMessage({
                id: 'close',
                defaultMessage: 'Close',
              })}
              {orders.length > 0 && `(${orders.length})`}
            </div>
            {showFloatingBox && orders.length > 0 && (
              <div
                className="absolute bg-boxBorder border border-orderTypeBg rounded-xl py-3 px-1.5 z-20"
                style={{
                  bottom: '100%',
                  right: 0,
                  width: '300px',
                }}
              >
                <div className="px-4 flex items-center pb-2 border-b border-gray1">
                  <span className="text-white text-sm gotham_bold">
                    {intl.formatMessage({
                      id: 'pending_orders_title',
                      defaultMessage: 'Pending Close Orders',
                    })}
                  </span>
                </div>
                <div>
                  {orders.map((order: any) => (
                    <PendingOrderRow
                      key={order.order_id}
                      order={order}
                      onUpdateData={getPendingOrders}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </td>
    </>
  );
};

function FutureQuantityModal(
  props: Modal.Props & {
    onClose: (input: number) => void;
    quantity: number;
    position_qty: number;
    mark_price: number;
    price: number | 'Market';
    symbolInfo: SymbolInfo;
  }
) {
  const { onClose, quantity, position_qty, mark_price, price, symbolInfo } =
    props;
  const intl = useIntl();
  const [inputQuantity, setInputQuantity] = useState<number>(
    Math.abs(position_qty)
  );

  const [tips, setTips] = useState<string>('');
  const portfolioFailure = usePortfolioFailure();

  useEffect(() => {
    setInputQuantity(quantity);
  }, [quantity]);

  const scrollBack = () => {
    const storedScrollTop = localStorage.getItem('mobile_scroll_top');

    if (storedScrollTop) {
      window.scrollTo(0, Number(storedScrollTop));
      localStorage.removeItem('mobile_scroll_top');
    }
  };

  return (
    <Modal
      {...props}
      onRequestClose={() => {
        onClose && onClose(quantity);
        scrollBack();
      }}
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
        },
      }}
    >
      <div
        className={`rounded-t-2xl fixed w-screen bottom-0 left-0 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className=" py-6 text-primaryOrderly text-sm flex flex-col  lg:w-p400  lg:h-p560">
          <div className="flex px-4 items-center pb-6 justify-between">
            <span className="text-white text-base gotham_bold">
              {intl.formatMessage({ id: 'quantity' })}
            </span>

            <span
              className="cursor-pointer"
              onClick={(e: any) => {
                onClose && onClose(quantity);
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div
            className={`flex px-4 items-center ${
              tips ? 'pb-3' : 'pb-6'
            } justify-between`}
          >
            <input
              type="number"
              step="any"
              inputMode="decimal"
              placeholder="0.0"
              value={inputQuantity}
              onChange={({ target }) => {
                sizeValidator(
                  price === 'Market' ? mark_price.toString() : target.value,
                  target.value.toString(),
                  symbolInfo,
                  intl,
                  position_qty > -1 ? 'Buy' : 'Sell',
                  portfolioFailure,
                  setTips
                );
                let value: any = target.value;
                if (parseFloat(value) > Math.abs(position_qty))
                  value = Math.abs(position_qty);
                if (parseFloat(value) < 0) value = 0;
                setInputQuantity(value);
              }}
              onFocus={() => {
                const scrollTop = document.documentElement.scrollTop;
                localStorage.setItem('mobile_scroll_top', scrollTop.toString());
              }}
              className="text-white text-xl leading-tight px-2.5 pb-2 w-10/12 mr-2 input-field"
              style={{ borderBottomColor: '#FFFFFF1A', borderBottomWidth: 1 }}
            />
            <button
              className="text-white py-1 px-4 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center disabled:opacity-40"
              disabled={!!tips}
              onClick={() => {
                // @ts-ignore
                onClose && onClose(parseFloat(inputQuantity));
                scrollBack();
              }}
            >
              <span>{intl.formatMessage({ id: 'save' })}</span>
            </button>
          </div>
          {tips && (
            <div className="flex items-center pb-6 justify-between">
              <span className="text-error text-xs leading-tight px-2.5 pb-2 w-full mr-2">
                {tips}
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

function FuturePriceModal(
  props: Modal.Props & {
    onClose: (input: number | 'Market') => void;
    price: number | 'Market';
    mark_price: number;
    position_qty: number;
    priceMode: 'market_price' | 'limit_price';
    setPriceMode: (input: 'market_price' | 'limit_price') => void;
    symbolInfo: SymbolInfo;
    referenceMark: MarkPrice;
    quantity: number;
  }
) {
  const {
    onClose,
    priceMode,
    setPriceMode,
    price,
    mark_price,
    symbolInfo,
    position_qty,
    referenceMark,
    quantity,
    isOpen,
  } = props;
  const [inputPrice, setInputPrice] = useState<string>(price.toString());
  const [openOnMarket, setOpenOnMarket] = useState<boolean>(true);
  const intl = useIntl();
  const [tips, setTips] = useState<string>('');
  const portfolioFailure = usePortfolioFailure();

  const { everyTickers } = useOrderlyContext();

  const closePrice = everyTickers?.find(
    (t) => t.symbol === symbolInfo.symbol
  )?.close;

  useEffect(() => {
    if (isOpen && openOnMarket) {
      setPriceMode('market_price');
    }
  }, [isOpen]);

  return (
    <Modal
      {...props}
      onRequestClose={() => {
        if (onClose) {
          priceMode === 'market_price' && setOpenOnMarket(true);
          setTips('');
          onClose(price);
        }
      }}
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
        },
      }}
    >
      <div
        className={`rounded-t-2xl fixed w-screen bottom-0 left-0 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className=" py-6 text-primaryOrderly text-sm flex flex-col  lg:w-p400  lg:h-p560">
          <div className="flex px-4 items-center pb-6 justify-between">
            <span className="text-white text-base gotham_bold">
              {intl.formatMessage({ id: 'price' })}
            </span>

            <span
              className="cursor-pointer"
              onClick={(e: any) => {
                if (onClose) {
                  priceMode === 'market_price' && setOpenOnMarket(true);
                  setTips('');
                  onClose(price);
                }
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4">
            {['market_price', 'limit_price'].map(
              (item: 'market_price' | 'limit_price') => (
                <div
                  key={item}
                  className={`relative text-center px-7 py-4 w-150 rounded-md border ${
                    priceMode !== item
                      ? 'text-primaryText border-orderTypeBg'
                      : 'text-white border-mobileOrderBg bg-mobileOrderBg'
                  }`}
                  onClick={() => {
                    setInputPrice(
                      closePrice?.toString() || mark_price.toString()
                    );
                    setTips('');
                    setPriceMode(item);
                  }}
                >
                  {intl.formatMessage({ id: item })}
                  {priceMode === item && (
                    <div
                      className="absolute bg-gradientFromHover rounded-full flex justify-center items-center -top-0.5 -right-1.5"
                      style={{ width: '22px', height: '22px' }}
                    >
                      <svg
                        width="11"
                        height="8"
                        viewBox="0 0 11 8"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M1 4L4 7L10 1"
                          stroke="black"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
          {priceMode === 'limit_price' && (
            <div className="flex px-4 items-center pb-6 justify-between">
              <input
                type="number"
                placeholder="0.0"
                value={inputPrice}
                onChange={({ target }) => {
                  priceValidator(
                    target.value === 'Market'
                      ? mark_price.toString()
                      : target.value,
                    quantity.toString(),
                    symbolInfo,
                    intl,
                    position_qty > -1 ? 'Buy' : 'Sell',
                    target.value === 'Market' ? 'Market' : 'Limit',
                    referenceMark,
                    portfolioFailure,
                    setTips
                  );
                  setInputPrice(target.value);
                }}
                className="text-white text-xl leading-tight px-2.5 pb-2 w-10/12 mr-2"
                style={{ borderBottomColor: '#FFFFFF1A', borderBottomWidth: 1 }}
                min={0}
              />
              <button
                className="text-white py-1 px-4 relative bg-buyGradientGreen rounded-lg text-white font-bold flex items-center justify-center disabled:opacity-40"
                disabled={!!tips}
                onClick={() => {
                  if (onClose) {
                    priceMode === 'limit_price' && setOpenOnMarket(false);
                    onClose(parseFloat(inputPrice));
                  }
                }}
              >
                <span>{intl.formatMessage({ id: 'save' })}</span>
              </button>
            </div>
          )}
          {tips && (
            <div className="flex items-center pb-6 justify-between">
              <span className="text-error text-xs leading-tight px-2.5 pb-2 w-full mr-2">
                {tips}
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

const PendingOrderMobileRow: React.FC<{
  order: any;
  onUpdateData: any;
}> = ({ order, onUpdateData }) => {
  const intl = useIntl();
  const { accountId } = useWalletSelector();
  const { handlePendingOrderRefreshing } = useOrderlyContext();
  const { symbol, quantity, price, order_id, side } = order;
  const [loading, setLoading] = useState(false);

  return (
    <div
      key={order_id}
      className="px-4 py-6 grid grid-cols-4 gap-2 border-b"
      style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
    >
      <div className="col-span-3 text-base">
        <span className="pr-3">
          <span className="text-white">{quantity}&nbsp;</span>
          <span>{parseSymbol(symbol).symbolFrom}</span>
        </span>
        <span>
          <span className="italic">
            {intl.formatMessage({ id: 'at_orderly', defaultMessage: 'at' })}
          </span>
          &nbsp;
          <span className="text-white">
            $
            {price?.toFixed(
              symbol.includes('BTC') || symbol.includes('ETH') ? 2 : 3
            )}
          </span>
        </span>
      </div>
      <div className="col-span-1 flex justify-end items-center">
        <div
          className="cursor-pointer"
          onClick={async () => {
            if (!accountId || loading) return;
            try {
              setLoading(true);

              const res = await cancelOrder({
                accountId,
                DeleteParams: {
                  order_id,
                  symbol,
                },
              });

              if (res.success === true) {
                setLoading(false);

                return orderEditPopUpSuccess({
                  side: side == 'BUY' ? 'Buy' : 'Sell',
                  size: quantity,
                  price,
                  cancel: true,
                  symbolName: symbol,
                });
              }
            } catch (err) {
              setLoading(false);
              return orderEditPopUpFailure({
                tip: err.message,
              });
            } finally {
              // Orderly API does not instantly update with the latest result
              setTimeout(() => {
                handlePendingOrderRefreshing();
                onUpdateData();
              }, 500);
            }
          }}
        >
          {loading ? (
            <OrderlyLoading className="animate-spin" />
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10 1.81818C5.48131 1.81818 1.81818 5.48131 1.81818 10C1.81818 14.5187 5.48131 18.1818 10 18.1818C14.5187 18.1818 18.1818 14.5187 18.1818 10C18.1818 5.48131 14.5187 1.81818 10 1.81818ZM0 10C0 4.47715 4.47715 0 10 0C15.5228 0 20 4.47715 20 10C20 15.5228 15.5228 20 10 20C4.47715 20 0 15.5228 0 10Z"
                fill="#FF6A8E"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.24243 9.99972C4.24243 9.33028 4.78512 8.7876 5.45455 8.7876L14.5455 8.7876C15.2149 8.7876 15.7576 9.33028 15.7576 9.99972C15.7576 10.6692 15.2149 11.2118 14.5455 11.2118L5.45455 11.2118C4.78512 11.2118 4.24243 10.6692 4.24243 9.99972Z"
                fill="#FF6A8E"
              />
            </svg>
          )}
        </div>
      </div>
    </div>
  );
};

function PendingOrdersModal(
  props: Modal.Props & {
    onClose: () => void;
    rows: any;
    onUpdateData: any;
  }
) {
  const intl = useIntl();
  const { onClose, rows, onUpdateData } = props;

  useEffect(() => {
    rows.length < 1 && onClose();
  }, [rows]);

  return (
    <Modal
      {...props}
      onRequestClose={() => onClose && onClose()}
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
        },
      }}
    >
      <div
        className={`rounded-t-2xl fixed w-screen bottom-0 left-0 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className="py-6 text-primaryOrderly text-sm flex flex-col  lg:w-p400  lg:h-p560">
          <div className="px-4 flex items-center pb-6 justify-between">
            <span className="text-white text-base gotham_bold">
              {intl.formatMessage({
                id: 'pending_orders_title',
                defaultMessage: 'Pending Close Orders 2',
              })}
            </span>

            <span
              className="cursor-pointer"
              onClick={(e: any) => {
                onClose && onClose();
              }}
            >
              <IoClose size={20} />
            </span>
          </div>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {rows.map((order: any) => (
              <PendingOrderMobileRow
                key={order.order_id}
                order={order}
                onUpdateData={onUpdateData}
              />
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export function ClosingModal(
  props: Modal.Props & {
    onClick: () => Promise<any>;
    row: any;
    closingPrice: number | 'Market';
    closingQuantity: number;
    marketList: {
      text: JSX.Element;
      withSymbol: JSX.Element;
      textId: string;
    }[];
  }
) {
  const {
    onRequestClose,
    onClick,
    closingPrice,
    closingQuantity,
    marketList,
    row,
  } = props;

  const { symbol } = row;

  const { symbolFrom } = parseSymbol(symbol);

  const [loading, setLoading] = useState<boolean>(false);

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
      <div
        className={`rounded-2xl lg:w-96 xs:w-95vw border border-gradientFrom border-opacity-30 bg-boxBorder text-sm text-primaryOrderly`}
      >
        <div className="px-5 py-6 flex flex-col ">
          <div className="w-full grid grid-cols-2 gap-4">
            <div className="col-span-2 m-4">
              <div className="flex items-center justify-center text-white text-center gotham_bold">
                <span>
                  {intl.formatMessage({ id: 'closing_1' })}&nbsp;
                  <span
                    className={
                      row.position_qty < 0
                        ? 'text-sellColorNew'
                        : 'text-buyGreen'
                    }
                  >
                    {closingQuantity}
                  </span>
                  &nbsp;
                  {intl.formatMessage(
                    { id: 'closing_2' },
                    { type: closingPrice === 'Market' ? 'market' : 'limit' }
                  )}
                </span>
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center ">
                {marketList.find((m) => m.textId === symbol)?.text}
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center justify-end  text-white">
                {closingPrice === 'Market'
                  ? intl.formatMessage({ id: 'market' })
                  : intl.formatMessage({ id: 'limit' })}
                <TextWrapper
                  className="px-2 text-sm ml-2"
                  value={intl.formatMessage({
                    id: row.position_qty < 0 ? 'buy' : 'sell',
                    defaultMessage: row.position_qty < 0 ? 'buy' : 'sell',
                  })}
                  bg={row.position_qty < 0 ? 'bg-buyGreen' : 'bg-sellRed'}
                  textC={
                    row.position_qty < 0 ? 'text-buyGreen' : 'text-sellColorNew'
                  }
                />
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center text-white">
                {intl.formatMessage({ id: 'size' })}
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center justify-end text-white">
                {formatDecimalToTwoOrMore(closingQuantity)} {symbolFrom}
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center text-white">
                {intl.formatMessage({ id: 'price' })}
              </div>
            </div>
            <div className="col-span-1 mb-2">
              <div className="flex items-center justify-end text-white">
                {closingPrice === 'Market'
                  ? intl.formatMessage({ id: 'market' })
                  : `$${closingPrice}`}
              </div>
            </div>
            {closingPrice !== 'Market' && (
              <>
                <div className="col-span-1 mb-2">
                  <div className="flex items-center text-white">
                    {intl.formatMessage({ id: 'total' })}
                  </div>
                </div>
                <div className="col-span-1 mb-2">
                  <div className="flex items-center justify-end text-white">
                    $
                    {new Big(closingPrice)
                      .mul(new Big(closingQuantity))
                      .toFixed(4)}
                  </div>
                </div>
              </>
            )}
            <div className="col-span-1 mb-2">
              <button
                className={`w-full rounded-lg ${
                  loading
                    ? 'opacity-70 cursor-not-allowed border-buttonGradientBgOpacity'
                    : ''
                } flex items-center justify-center py-1.5 border border-greenColor text-xs text-greenColor`}
                onClick={(e: any) => {
                  e.preventDefault();
                  e.stopPropagation();

                  onRequestClose && onRequestClose(e);
                }}
                disabled={loading}
              >
                {intl.formatMessage({ id: 'cancel' })}
              </button>
            </div>
            <div className="col-span-1 mb-2">
              <button
                className={`w-full rounded-lg ${
                  loading
                    ? 'opacity-70 cursor-not-allowed bg-buttonGradientBgOpacity'
                    : ''
                } flex items-center justify-center  bg-buttonGradientBg hover:bg-buttonGradientBgOpacity text-xs text-white`}
                style={{ paddingTop: '0.4375rem', paddingBottom: '0.4375rem' }}
                onClick={(e: any) => {
                  e.preventDefault();
                  e.stopPropagation();

                  setLoading(true);
                  onClick().then(() => {
                    setLoading(false);
                    onRequestClose && onRequestClose(e);
                  });
                }}
                disabled={loading}
              >
                {intl.formatMessage({ id: 'Confirm' })}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

const FutureMobileRow: React.FC<{
  row: {
    symbol: string;
    position_qty: number;
    average_open_price: number;
    unsettled_pnl: number;
    display_est_liq_price: number;
  };
  marketList: { text: JSX.Element; withSymbol: JSX.Element; textId: string }[];
  handleOpenClosing: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  unrealMode: string;
  setUnrealMode: (mode: 'mark_price' | 'last_price') => void;
  futureOrders: MyOrder[];
  markPrices: MarkPrice[];
  lastPrices: {
    symbol: string;
    close: number;
  }[];
}> = ({
  row,
  marketList,
  handleOpenClosing,
  unrealMode,
  setUnrealMode,
  futureOrders,
  markPrices,
  lastPrices,
}) => {
  const intl = useIntl();
  const { symbol, position_qty, average_open_price, display_est_liq_price } =
    row;
  const [showPnlSelector, setShowPnlSelector] = useState<boolean>(false);
  const [futureQuantityOpen, setFutureQuantityOpen] = useState<boolean>(false);
  const [futurePriceOpen, setFuturePriceOpen] = useState<boolean>(false);
  const [quantity, setQuantity] = useState<number>(Math.abs(position_qty));
  const [priceMode, setPriceMode] = useState<'market_price' | 'limit_price'>(
    'market_price'
  );
  const mark_price = markPrices?.find((i) => i.symbol === symbol)?.price;
  const [price, setPrice] = useState<number | 'Market'>('Market');
  const [orders, setOrders] = useState<any>([]);
  const [pendingOpen, setPendingOpen] = useState<boolean>(false);
  const [unrealPnl, setUnrealPnl] = useState<number>(0);
  const [unrealPercentage, setUnrealPercentage] = useState<string>('0');
  const { availableSymbols } = useOrderlyContext();
  const { curLeverage } = useLeverage();
  const symbolInfo = availableSymbols?.find((s) => s.symbol === row.symbol);
  const referenceMark = markPrices?.find((m) => m.symbol === row.symbol);
  const portfolioFailure = usePortfolioFailure();
  const { accountId } = useWalletSelector();

  useEffect(() => {
    const price =
      unrealMode === 'mark_price'
        ? markPrices?.find((i) => i.symbol === symbol)?.price
        : lastPrices?.find((i) => i.symbol === symbol)?.close;
    const value =
      position_qty >= 0
        ? (price - average_open_price) * position_qty
        : (average_open_price - price) * position_qty * -1;
    const percentage =
      position_qty >= 0
        ? ((average_open_price - price) / (average_open_price / curLeverage)) *
          -100
        : ((average_open_price - price) / (average_open_price / curLeverage)) *
          100;
    const percentageParse = percentage.toPrecision(
      percentage.toString().split('.')[0].length + 2
    );
    const percentageTrue = percentageParse.substring(
      0,
      percentageParse.length - (percentageParse.charAt(0) === '-' ? 2 : 1)
    );

    setUnrealPnl(value);
    setUnrealPercentage(percentageTrue);
  }, [unrealMode, markPrices, lastPrices]);

  useEffect(() => {
    setQuantity(Math.abs(position_qty));
  }, [row.position_qty]);

  useEffect(() => {
    getPendingOrders();
  }, []);

  useEffect(() => {
    if (showPnlSelector)
      document.addEventListener('click', () => {
        setShowPnlSelector(false);
      });
  }, [showPnlSelector]);

  const getPendingOrders = async () => {
    const res = await getPortfolioAllOrders({
      accountId,
      OrderProps: {
        page: 1,
        size: 500,
        status: 'INCOMPLETE',
      },
    });
    const filterOrders: MyOrder[] = res?.data?.rows?.filter((order: MyOrder) =>
      order.symbol.includes('PERP')
    );

    const data = filterOrders.filter(
      (order) =>
        order.symbol === row.symbol &&
        order.side === (position_qty > 0 ? 'SELL' : 'BUY')
    );

    setOrders(data);
  };

  return (
    <>
      <div
        className={`w-full gap-2 rounded-xl my-3`}
        style={{ backgroundColor: '#7E8A931A' }}
      >
        <div className="w-full grid grid-cols-2 p-5">
          <div className="col-span-1 mb-3">
            <div className="flex items-center ">
              {marketList.find((m) => m.textId === symbol)?.withSymbol}
            </div>
          </div>
          <div className="col-span-1 flex justify-end items-center mb-3">
            {orders.length > 0 && (
              <div
                className="cursor-pointer text-center whitespace-nowrap py-1 px-3 mr-2 border border-orderTypeBg rounded-md"
                onClick={() => {
                  setPendingOpen(true);
                }}
              >
                {intl.formatMessage({ id: 'pending_cap' })}&#40;{orders.length}
                &#41;
              </div>
            )}
            <div
              className="cursor-pointer text-center whitespace-nowrap py-1 px-3 border border-orderTypeBg rounded-md"
              onClick={() => {
                const pass = priceAndSizeValidator(
                  price === 'Market' ? mark_price.toString() : price.toString(),
                  quantity.toString(),
                  symbolInfo,
                  intl,
                  position_qty > -1 ? 'Buy' : 'Sell',
                  price === 'Market' ? 'Market' : 'Limit',
                  referenceMark,
                  portfolioFailure
                );
                pass && handleOpenClosing(quantity, price, row);
              }}
            >
              {intl.formatMessage({ id: 'close' })}
            </div>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'qty.' })}
              <div
                className="text-10px p-0.5 ml-1"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolFrom}
              </div>
            </div>
            <span className="text-white">
              {position_qty?.toFixed(4) || '-'}
            </span>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'avg_open' })}
              <div
                className="text-10px p-0.5 ml-1"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolTo}
              </div>
            </div>
            <span className="text-white">
              {average_open_price?.toFixed(3) || '-'}
            </span>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'mark_orderly' })}
              <div
                className="text-10px p-0.5 ml-1"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolTo}
              </div>
            </div>
            <span className="text-white">
              {markPrices?.find((i) => i.symbol === symbol)?.price.toFixed(3) ||
                '-'}
            </span>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'liq_price' })}
              <div
                className="text-10px p-0.5 ml-1"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolTo}
              </div>
            </div>
            <span className="text-white">
              {mark_price && display_est_liq_price > mark_price * 10
                ? '-'
                : display_est_liq_price
                ? display_est_liq_price.toFixed(3)
                : '-'}
            </span>
          </div>
          <div
            className="col-span-1 my-3"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowPnlSelector(true);
            }}
          >
            <div className="relative flex items-center">
              <span
                className=" underline"
                style={{ textDecorationStyle: 'dashed' }}
              >
                {intl.formatMessage({ id: 'unreal_pnl' })}
              </span>
              <div
                className="text-10px p-0.5 ml-1 no-underline"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolTo}
              </div>

              {showPnlSelector && (
                <div className="absolute top-full z-50">
                  <div
                    className={`flex flex-col min-w-28 items-start py-2 px-1.5 rounded-lg border border-borderC text-sm  bg-darkBg `}
                  >
                    {['mark_price', 'last_price'].map(
                      (item: 'mark_price' | 'last_price', index) => {
                        return (
                          <div
                            className={`whitespace-nowrap frcs cursor-pointer min-w-fit my-0.5 text-left px-1 py-1 w-full rounded-md`}
                            key={item + index}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              setUnrealMode(item);
                              setShowPnlSelector(false);
                            }}
                          >
                            <div className="mr-2 border border-baseGreen bg-symbolHover2 border-solid w-3 h-3 rounded-full">
                              {unrealMode === item && (
                                <div className="w-2 h-2 bg-baseGreen rounded-full m-px" />
                              )}
                            </div>
                            <span className="whitespace-nowrap pr-2">
                              {intl.formatMessage({ id: item })}
                            </span>
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}
            </div>
            <span className="text-white">
              {unrealPnl?.toFixed(2) || '-'} ({unrealPercentage}%)
            </span>
          </div>
          <div className="col-span-1 my-3">
            <div className="relative flex items-center">
              <span>{intl.formatMessage({ id: 'notional' })}</span>
              <div
                className="text-10px p-0.5 ml-1"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolTo}
              </div>
            </div>
            <span className="text-white">
              {!markPrices
                ? '-'
                : Math.abs(
                    markPrices?.find((i) => i.symbol === symbol)?.price *
                      position_qty
                  )?.toFixed(2) || '-'}
            </span>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'quantity' })}
              <div
                className="text-10px p-0.5 ml-1 no-underline"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolFrom}
              </div>
            </div>
            <span
              className="text-white flex items-center cursor-pointer underline"
              onClick={() => setFutureQuantityOpen(true)}
            >
              {quantity}
              <MdArrowDropDown
                className="ml-0.5"
                style={{ flex: '0 0 22px' }}
                size={22}
                color={'#7E8A93'}
              />
            </span>
          </div>
          <div className="col-span-1 my-3">
            <div className="flex items-center">
              {intl.formatMessage({ id: 'price' })}
              <div
                className="text-10px p-0.5 ml-1 no-underline"
                style={{
                  borderRadius: '4px',
                  backgroundColor: 'rgba(126, 138, 147, 0.15)',
                }}
              >
                {parseSymbol(symbol).symbolTo}
              </div>
            </div>
            <span
              className="text-white flex items-center cursor-pointer underline"
              onClick={() => setFuturePriceOpen(true)}
            >
              {priceMode === 'market_price' ? 'Market' : price}
              <MdArrowDropDown
                className="ml-0.5"
                style={{ flex: '0 0 22px' }}
                size={22}
                color={'#7E8A93'}
              />
            </span>
          </div>
        </div>
      </div>

      <FutureQuantityModal
        isOpen={futureQuantityOpen}
        onClose={(input: number) => {
          setQuantity(input);
          setFutureQuantityOpen(false);
        }}
        position_qty={position_qty}
        quantity={quantity}
        mark_price={referenceMark?.price}
        price={price}
        symbolInfo={symbolInfo}
      />

      <FuturePriceModal
        isOpen={futurePriceOpen}
        onClose={(input: number | 'Market') => {
          setPrice(priceMode === 'market_price' ? 'Market' : input);

          setFuturePriceOpen(false);
        }}
        priceMode={priceMode}
        setPriceMode={setPriceMode}
        price={price}
        mark_price={mark_price}
        symbolInfo={symbolInfo}
        referenceMark={referenceMark}
        position_qty={position_qty}
        quantity={quantity}
      />

      <PendingOrdersModal
        isOpen={pendingOpen}
        onClose={() => {
          setPendingOpen(false);
        }}
        rows={orders}
        onUpdateData={getPendingOrders}
      />
    </>
  );
};

export const FutureMobileViewPerpPage: React.FC<{
  rows: {
    symbol: string;
    position_qty: number;
    average_open_price: number;
    mark_price: number;
    unsettled_pnl: number;
  }[];
  marketList: { text: JSX.Element; withSymbol: JSX.Element; textId: string }[];
  handleOpenClosing: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  unrealMode: string;
  setUnrealMode: (mode: 'mark_price' | 'last_price') => void;
  futureOrders: MyOrder[];
  markPrices: MarkPrice[];
  lastPrices: {
    symbol: string;
    close: number;
  }[];
  portfolioUnsettle: string;
  totalPortfoliouPnl: string;
  totalDailyReal: string;
  totalNotional: string;
  newPositions: any;
  showCurSymbol: boolean;
}> = ({
  marketList,
  children,
  handleOpenClosing,
  unrealMode,
  setUnrealMode,
  futureOrders,
  markPrices,
  lastPrices,
  portfolioUnsettle,
  totalPortfoliouPnl,
  totalDailyReal,
  totalNotional,
  newPositions,
  showCurSymbol,
}) => {
  const intl = useIntl();

  const { rows } = newPositions || {};

  const { symbol } = useOrderlyContext();

  const filterFunc = (row: any) => {
    const c1 = row.position_qty !== 0;

    if (showCurSymbol) {
      return row.symbol === symbol && c1;
    } else return c1;
  };

  return (
    <div className="w-full">
      {rows?.filter(filterFunc).map((row: any) => (
        <FutureMobileRow
          key={row.symbol}
          row={row}
          marketList={marketList}
          handleOpenClosing={handleOpenClosing}
          unrealMode={unrealMode}
          setUnrealMode={setUnrealMode}
          futureOrders={futureOrders}
          markPrices={markPrices}
          lastPrices={lastPrices}
        />
      ))}
    </div>
  );
};

export const FutureMobileView: React.FC<{
  rows: {
    symbol: string;
    position_qty: number;
    average_open_price: number;
    mark_price: number;
    unsettled_pnl: number;
  }[];
  marketList: { text: JSX.Element; withSymbol: JSX.Element; textId: string }[];
  handleOpenClosing: (
    closingQuantity: number,
    closingPrice: number | 'Market',
    row: any
  ) => void;
  unrealMode: string;
  setUnrealMode: (mode: 'mark_price' | 'last_price') => void;
  futureOrders: MyOrder[];
  markPrices: MarkPrice[];
  lastPrices: {
    symbol: string;
    close: number;
  }[];
  portfolioUnsettle: string;
  totalPortfoliouPnl: string;
  totalDailyReal: string;
  totalNotional: string;
  newPositions: any;
}> = ({
  marketList,
  children,
  handleOpenClosing,
  unrealMode,
  setUnrealMode,
  futureOrders,
  markPrices,
  lastPrices,
  portfolioUnsettle,
  totalPortfoliouPnl,
  totalDailyReal,
  totalNotional,
  newPositions,
}) => {
  const intl = useIntl();

  const { rows } = newPositions || {};

  return (
    <div className="w-full p-3">
      <div
        className={`w-full gap-2 rounded-xl my-3`}
        style={{ backgroundColor: '#7E8A931A' }}
      >
        <div className="w-full grid grid-cols-2 p-5">
          <div className="col-span-1">
            {intl.formatMessage({
              id: 'fut_unreal_pnl',
              defaultMessage: 'Fut. Unreal. PnL',
            })}
            <span
              className={`pl-2 ${
                parseFloat(totalPortfoliouPnl) >= 0
                  ? 'text-buyGreen'
                  : 'text-sellRed'
              }`}
            >
              {totalPortfoliouPnl}
            </span>
          </div>
          <div className="col-span-1 text-right">
            {intl.formatMessage({
              id: 'fut_daily_real',
              defaultMessage: 'Fut. Daily Real.',
            })}
            <span
              className={`pl-2 ${
                parseFloat(totalDailyReal) >= 0
                  ? 'text-buyGreen'
                  : 'text-sellRed'
              }`}
            >
              {totalDailyReal}
            </span>
          </div>
          <div className="col-span-2 text-right mt-2">
            {intl.formatMessage({
              id: 'fut_notional',
              defaultMessage: 'Fut. Notional',
            })}
            <span className="text-white pl-2">{totalNotional}</span>
          </div>
          <div className="h-px col-span-2 w-full border border-white opacity-10 my-2.5" />
          <div className="col-span-1 flex items-center">
            {intl.formatMessage({
              id: 'fut_unsettle_pnl',
              defaultMessage: 'Unsettle PnL',
            })}
            <span
              className={`pl-2 ${
                parseFloat(portfolioUnsettle) >= 0
                  ? 'text-buyGreen'
                  : 'text-sellRed'
              }`}
            >
              {portfolioUnsettle}
            </span>
          </div>
          <div className="col-span-1 text-right flex justify-end">
            {children}
          </div>
        </div>
      </div>
      {rows
        ?.filter((row: any) => row.position_qty !== 0)
        .map((row: any) => (
          <FutureMobileRow
            key={row.symbol}
            row={row}
            marketList={marketList}
            handleOpenClosing={handleOpenClosing}
            unrealMode={unrealMode}
            setUnrealMode={setUnrealMode}
            futureOrders={futureOrders}
            markPrices={markPrices}
            lastPrices={lastPrices}
          />
        ))}
    </div>
  );
};

export const FutureTopComponent = ({
  portfolioUnsettle,
  totalPortfoliouPnl,
  totalDailyReal,
  totalNotional,
}: {
  portfolioUnsettle: string;
  totalPortfoliouPnl: string;
  totalDailyReal: string;
  totalNotional: string;
}) => {
  const intl = useIntl();

  return (
    <div className="w-full px-5 mb-4">
      <div
        className="w-full flex justify-start items-center py-3 px-5 rounded-full"
        style={{ backgroundColor: '#7E8A931A' }}
      >
        <div className="mr-5">
          {intl.formatMessage({
            id: 'fut_unreal_pnl',
            defaultMessage: 'Fut. Unreal. PnL',
          })}
          <span
            className={`pl-2 ${
              parseFloat(totalPortfoliouPnl) >= 0
                ? 'text-buyGreen'
                : 'text-sellRed'
            }`}
          >
            {totalPortfoliouPnl}
          </span>
        </div>
        <div className="mr-5">
          {intl.formatMessage({
            id: 'fut_daily_real',
            defaultMessage: 'Fut. Daily Real.',
          })}
          <span
            className={`pl-2 ${
              parseFloat(totalDailyReal) >= 0 ? 'text-buyGreen' : 'text-sellRed'
            }`}
          >
            {totalDailyReal}
          </span>
        </div>
        <div className="mr-5">
          {intl.formatMessage({
            id: 'fut_notional',
            defaultMessage: 'Fut. Notional',
          })}
          <span className="text-white pl-2">{totalNotional}</span>
        </div>
        <div className="ml-auto">
          {intl.formatMessage({
            id: 'fut_unsettle_pnl',
            defaultMessage: 'Unsettle PnL',
          })}
          <span
            className={`pl-2 ${
              parseFloat(portfolioUnsettle) >= 0
                ? 'text-buyGreen'
                : 'text-sellRed'
            }`}
          >
            {portfolioUnsettle}
          </span>
        </div>
      </div>
    </div>
  );
};
