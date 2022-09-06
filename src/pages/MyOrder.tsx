import React, { useEffect, useState, useContext, createContext } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useClientMobile } from '~utils/device';
import { SolidButton, ButtonTextWrapper } from '../components/button/Button';
import { useMyOrders } from '../state/swapV3';
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from '../services/swapV3';
import { useToken, useTokens, useTokenPriceList } from '../state/token';
import {
  SWAP_MODE,
  SWAP_MODE_KEY,
  REF_FI_SWAP_SWAPPAGE_TAB_KEY,
} from './SwapPage';
import {
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '../components/icon/swapV3';
import { calculateFeePercent, ONLY_ZEROS, toPrecision } from '~utils/numbers';
import {
  toReadableNumber,
  scientificNotationToString,
  checkAllocations,
} from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import Big from 'big.js';
import { cancel_order } from '../services/swapV3';
import { TIMESTAMP_DIVISOR } from '../components/layout/Proposal';
import moment from 'moment';
import { DownArrowVE, UpArrowVE } from '../components/icon/Referendum';
import { Loading } from '~components/icon/Loading';
import { RouterArrowLeft, RouterArrowRight } from '../components/icon/Arrows';
import QuestionMark from '../components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import { toRealSymbol } from '../utils/token';
import { QuestionTip } from '../components/layout/TipWrapper';

const ORDER_TYPE_KEY = 'REF_FI_ORDER_TYPE_VALUE';

function NoOrderCard({ text }: { text: 'active' | 'history' }) {
  return (
    <div
      className="w-full rounded-xl overflow-hidden h-48 relative text-white font-normal  flex items-center justify-center"
      style={{
        background: 'rgb(26,36,43)',
      }}
    >
      <div className="flex items-center flex-col relative text-center z-50 mx-auto">
        <span className="mb-4">
          <MyOrderCircle />
        </span>

        <span>
          <FormattedMessage
            id={`your_${text}_orders_will_appear_here`}
            defaultMessage={'Your orders will appear here'}
          />
          .
        </span>
      </div>

      <MyOrderMask />
      <MyOrderMask2 />
    </div>
  );
}

const PriceContext = createContext(null);

function OrderCard({
  activeOrder,
  historyOrder,
  tokensMap,
}: {
  activeOrder: UserOrderInfo[];
  historyOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
}) {
  const intl = useIntl();

  const [orderType, setOrderType] = useState<'active' | 'history'>(
    sessionStorage.getItem(ORDER_TYPE_KEY) ||
      activeOrder?.length > 0 ||
      !historyOrder ||
      historyOrder.length === 0
      ? 'active'
      : 'history'
  );

  const [activeSortBy, setActiveSortBy] = useState<'unclaim' | 'created'>(
    'created'
  );

  const [sortOrderActive, setSorOrderActive] = useState<'asc' | 'desc'>('desc');

  const [sortOrderHistory, setSorOrderHistory] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [historySortBy, setHistorySortBy] = useState<'claimed' | 'created'>(
    'created'
  );

  function OrderTab() {
    return (
      <div className="flex whitespace-nowrap text-white mb-4">
        <button
          className="mr-7 flex flex-col items-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sessionStorage.setItem(ORDER_TYPE_KEY, 'active');
            setOrderType('active');
          }}
        >
          <span>
            <FormattedMessage id="active" defaultMessage={'Active'} />
          </span>

          {orderType === 'active' && (
            <div
              className="w-full mt-2"
              style={{
                background: 'linear-gradient(90deg, #04F7D4 0%, #5846FE 100%)',
                borderRadius: '3px',
                height: '3px',
              }}
            ></div>
          )}
        </button>

        <button
          className="flex flex-col items-center"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOrderType('history');
            sessionStorage.setItem(ORDER_TYPE_KEY, 'history');
          }}
        >
          <span>
            <FormattedMessage id="history" defaultMessage={'History'} />
          </span>

          {orderType === 'history' && (
            <div
              className="w-full mt-2"
              style={{
                background: 'linear-gradient(90deg, #04F7D4 0%, #5846FE 100%)',
                borderRadius: '3px',
                height: '3px',
              }}
            ></div>
          )}
        </button>
      </div>
    );
  }

  const sellAmountToBuyAmount = (
    undecimaled_amount: string,
    order: UserOrderInfo,
    price: string
  ) => {
    const buy_amount = new Big(
      toReadableNumber(
        tokensMap[order.sell_token].decimals,
        undecimaled_amount || '0'
      )
    )
      .times(price)
      .toFixed(tokensMap[order.sell_token].decimals);
    return scientificNotationToString(buy_amount);
  };

  const buyAmountToSellAmount = (
    undecimaled_amount: string,
    order: UserOrderInfo,
    price: string
  ) => {
    const sell_amount = new Big(
      toReadableNumber(
        tokensMap[order.buy_token].decimals,
        undecimaled_amount || '0'
      )
    )
      .div(price)
      .toString();
    return scientificNotationToString(sell_amount);
  };
  function ActiveLine({
    order,
    index,
  }: {
    order: UserOrderInfo;
    index: number;
  }) {
    const [claimLoading, setClaimLoading] = useState<boolean>(false);

    const [cancelLoading, setCancelLoading] = useState<boolean>(false);

    const [hover, setHover] = useState<boolean>(false);

    const buyToken = tokensMap[order.buy_token];

    const sellToken = tokensMap[order.sell_token];

    if (!buyToken || !sellToken) return null;

    const swapIn = toReadableNumber(
      sellToken.decimals,
      scientificNotationToString(
        new Big(order.original_deposit_amount || '0')
          .minus(order.original_amount || '0')
          .toString()
      )
    );

    const swapOut = toReadableNumber(
      buyToken.decimals,
      order.swap_earn_amount || '0'
    );

    const orderIn = toReadableNumber(
      sellToken.decimals,
      order.original_amount || '0'
    );

    const calPoint =
      sellToken.id === order.pool_id.split(V3_POOL_SPLITER)[0]
        ? order.point
        : -order.point;

    const price = pointToPrice({
      tokenA: sellToken,
      tokenB: buyToken,
      point: calPoint,
    });

    const unClaimedAmount = toReadableNumber(
      buyToken.decimals,
      order.unclaimed_amount || '0'
    );

    const claimedAmount = toReadableNumber(
      buyToken.decimals,
      order.bought_amount || '0'
    );

    const buyAmount = sellAmountToBuyAmount(
      order.original_amount,
      order,
      price
    );

    const pendingAmount = scientificNotationToString(
      new Big(buyAmount || 0)
        .minus(unClaimedAmount || 0)
        .minus(claimedAmount || 0)
        .toString()
    );

    const pUnClaimedAmount = new Big(unClaimedAmount)
      .div(buyAmount)
      .times(100)
      .toNumber();

    const pClaimedAmount = new Big(claimedAmount)
      .div(buyAmount)
      .times(100)
      .toNumber();

    const pPendingAmount = new Big(pendingAmount)
      .div(buyAmount)
      .times(100)
      .toNumber();

    const displayPercents = checkAllocations('100', [
      pUnClaimedAmount > 0 && pUnClaimedAmount < 4
        ? '4'
        : scientificNotationToString(pUnClaimedAmount.toString()),
      pClaimedAmount > 0 && pClaimedAmount < 4
        ? '4'
        : scientificNotationToString(pClaimedAmount.toString()),
      pPendingAmount > 0 && pPendingAmount < 4
        ? '4'
        : scientificNotationToString(pPendingAmount.toString()),
    ]);

    const getUnclaimAmountTip = () => {
      return `
        <div 
          class="flex flex-col text-xs min-w-36 text-farmText z-50"
        >
        ${
          ONLY_ZEROS.test(claimedAmount)
            ? ''
            : `
        <div class="flex items-center justify-between my-1">
            <span class="flex items-center mr-1">
                <div class="w-1.5 h-1.5 rounded-full bg-gradientFrom mr-1">
                </div>

                ${intl.formatMessage({ id: 'claimed' })}

            </span>

            <span>
            ${
              Number(claimedAmount) > 0 && Number(claimedAmount) < 0.001
                ? '< 0.001'
                : toPrecision(claimedAmount, 3)
            }
            </span>

        </div>
        `
        }


        ${
          ONLY_ZEROS.test(unClaimedAmount)
            ? ''
            : `<div class="flex items-center my-1 justify-between">
            <span class="flex items-center mr-1">
                <div class="w-1.5 h-1.5 rounded-full bg-deepBlue mr-1">
                </div>

                ${intl.formatMessage({ id: 'unclaimed' })}

            </span>

            <span>
            ${
              Number(unClaimedAmount) > 0 && Number(unClaimedAmount) < 0.001
                ? '< 0.001'
                : toPrecision(unClaimedAmount, 3)
            }
            </span>

        </div>`
        }

        ${
          ONLY_ZEROS.test(pendingAmount)
            ? ''
            : `<div class="flex items-center my-1 justify-between">
            <span class="flex items-center ">
                <div class="w-1.5 h-1.5 rounded-full bg-primaryText mr-1">
                </div>

                ${intl.formatMessage({
                  id: 'pending_upper',
                  defaultMessage: 'Pending',
                })}

            </span>

            <span>
            ${
              Number(pendingAmount) > 0 && Number(pendingAmount) < 0.001
                ? '< 0.001'
                : toPrecision(pendingAmount, 3)
            }

            </span>

        </div>`
        }

        </div>
    `;
    };

    const sellTokenAmount = (
      <div className="flex items-center whitespace-nowrap w-28 justify-between">
        <span className="flex flex-shrink-0 items-center col-span-1">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <div className="flex flex-col ml-2">
            <span className="text-white text-sm mr-2" title={orderIn}>
              {Number(orderIn) > 0 && Number(orderIn) < 0.01
                ? '< 0.01'
                : toPrecision(orderIn, 2)}
            </span>

            <span className="text-v3SwapGray text-xs">
              {toRealSymbol(sellToken.symbol)}
            </span>
          </div>
        </span>

        <span className="text-white text-lg pl-2  pr-1">
          <RouterArrowRight />
        </span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center col-span-1 ml-8">
        <img
          src={buyToken.icon}
          className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <div className="flex flex-col ml-2">
          <span
            className="text-white mr-2 text-sm whitespace-nowrap"
            title={buyAmount}
          >
            {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
              ? '< 0.01'
              : toPrecision(buyAmount, 2)}
          </span>

          <span className="text-v3SwapGray text-xs">
            {toRealSymbol(buyToken.symbol)}
          </span>
        </div>
      </span>
    );

    const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

    const feeTier = (
      <span
        style={{
          color: '#78C6FF',
        }}
        className="col-span-2 ml-10"
      >
        {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
      </span>
    );

    const orderRate = (
      <span className="whitespace-nowrap col-span-1 flex items-end flex-col relative right-4">
        <span className="mr-1 text-white text-sm" title={price}>
          {toPrecision(price, 2)}
        </span>
        <span className="text-v3SwapGray text-xs">
          {`${toRealSymbol(buyToken.symbol)}/${toRealSymbol(sellToken.symbol)}`}
        </span>
      </span>
    );

    const unclaimTip = (
      <div
        className="text-xs mt-1 mr-1 w-20 flex items-center"
        data-type="info"
        data-place="bottom"
        data-multiline={true}
        data-class="reactTip"
        data-html={true}
        data-tip={getUnclaimAmountTip()}
        data-for={'unclaim_tip_' + order.order_id}
      >
        <QuestionMark color="dark" />
        <div className="flex items-center w-full">
          {displayPercents.map((p, i) => {
            if (ONLY_ZEROS.test(p)) return null;

            const bgColor =
              i === 0
                ? 'bg-gradientFrom'
                : i === 1
                ? 'bg-deepBlue'
                : 'bg-primaryText';

            return (
              <div
                className={`mx-0.5 h-1 rounded-lg ${bgColor}`}
                style={{
                  width: p + '%',
                }}
              />
            );
          })}
        </div>
        <ReactTooltip
          className="w-20"
          id={'unclaim_tip_' + order.order_id}
          backgroundColor="#1D2932"
          place="bottom"
          border
          borderColor="#7e8a93"
          textColor="#C6D1DA"
          effect="solid"
        />
      </div>
    );

    const unclaim = (
      <span className="whitespace-nowrap col-span-2 flex items-center ml-12">
        <div>
          <div className="flex items-center">
            <img
              src={buyToken.icon}
              className="border border-gradientFrom rounded-full w-4 h-4"
              alt=""
            />
            <span
              className="text-white text-sm mx-1"
              title={toReadableNumber(
                buyToken.decimals,
                order.unclaimed_amount || '0'
              )}
            >
              {Number(
                toReadableNumber(
                  buyToken.decimals,
                  order.unclaimed_amount || '0'
                )
              ) > 0 &&
              Number(
                toReadableNumber(
                  buyToken.decimals,
                  order.unclaimed_amount || '0'
                )
              ) < 0.001
                ? '< 0.001'
                : toPrecision(
                    toReadableNumber(
                      buyToken.decimals,
                      order.unclaimed_amount || '0'
                    ),
                    3
                  )}
            </span>
          </div>

          {unclaimTip}
        </div>

        <button
          className={`rounded-lg    text-xs ml-1.5 p-1.5 ${
            ONLY_ZEROS.test(unClaimedAmount)
              ? 'text-v3SwapGray cursor-not-allowe bg-black opacity-20 cursor-not-allowed'
              : `text-white bg-deepBlue hover:text-white hover:bg-deepBlueHover ${
                  claimLoading ? ' text-white bg-deepBlueHover ' : ''
                }`
          }`}
          type="button"
          disabled={ONLY_ZEROS.test(unClaimedAmount)}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            setClaimLoading(true);

            cancel_order({
              order_id: order.order_id,
              undecimal_amount: '0',
            });
          }}
        >
          <ButtonTextWrapper
            Text={() => (
              <FormattedMessage id="claim" defaultMessage={'Claim'} />
            )}
            loading={claimLoading}
          ></ButtonTextWrapper>
        </button>
      </span>
    );

    const created = (
      <span className="col-span-2 relative whitespace-nowrap right-12 text-white text-right">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
      </span>
    );

    const actions = (
      <button
        className={`border col-span-1 rounded-lg  text-xs justify-self-end p-1.5 ${
          cancelLoading ? 'border border-transparent text-black bg-warn ' : ''
        }  border-warn border-opacity-20 text-warn  ${
          ONLY_ZEROS.test(order.remain_amount)
            ? 'opacity-30 cursor-not-allowed'
            : 'hover:border hover:border-transparent hover:text-black hover:bg-warn'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setCancelLoading(true);
          cancel_order({
            order_id: order.order_id,
            undecimal_amount: order.remain_amount || '0',
          });
        }}
        disabled={ONLY_ZEROS.test(order.remain_amount)}
      >
        <ButtonTextWrapper
          Text={() => (
            <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
          )}
          loading={cancelLoading}
        />
      </button>
    );

    const tokenPrice = useContext(PriceContext);

    const sellTokenPrice = tokenPrice?.[sellToken.id]?.price || null;

    const swapBanner = (
      <div className=" whitespace-nowrap relative z-10 bottom-4 w-full text-sm text-v3SwapGray bg-cardBg rounded-xl px-5 pb-5 pt-10">
        <div className="flex items-center justify-between mb-7">
          <span className="flex items-center">
            <FormattedMessage
              id="initial_order"
              defaultMessage={'Initial Order'}
            />
            <QuestionTip
              id="this_order_has_been_partially_instant_swapped "
              defaultMessage="This order has been partially instant swapped "
              dataPlace="right"
            />
          </span>

          <span className="flex items-center">
            <span title={orderIn} className="text-white">
              {Number(orderIn) > 0 && Number(orderIn) < 0.01
                ? '< 0.01'
                : toPrecision(orderIn, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            <span className="mx-6">
              <RouterArrowRight />
            </span>
            <span title={buyAmount} className="text-white">
              {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
                ? '< 0.01'
                : toPrecision(buyAmount, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
          </span>
        </div>

        <div className="flex items-center justify-between ">
          <span className="flex items-center ">
            <FormattedMessage
              id="instant_swap"
              defaultMessage={'Instant Swap'}
            />
            <span className="flex items-center text-white ml-4">
              {`1 ${toRealSymbol(sellToken.symbol)} `}&nbsp;
              {!!sellTokenPrice ? (
                <span className=" text-v3SwapGray mr-1">
                  {`($${toPrecision(sellTokenPrice, 2)})`}
                </span>
              ) : null}
              {` = `}
              <span
                className="mx-1"
                title={new Big(swapOut)
                  .div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn)
                  .toFixed(buyToken.decimals)}
              >
                {`${new Big(swapOut)
                  .div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn)
                  .toFixed(3)}`}
              </span>
              {` ${toRealSymbol(buyToken.symbol)}`}
            </span>
          </span>
          <span className="flex items-center">
            <span title={swapIn} className="text-white">
              {Number(swapIn) > 0 && Number(swapIn) < 0.01
                ? '< 0.01'
                : toPrecision(swapIn, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            <span className="mx-6">
              <RouterArrowRight />
            </span>
            <span title={swapOut} className="text-white">
              {Number(swapOut) > 0 && Number(swapOut) < 0.01
                ? '< 0.01'
                : toPrecision(swapOut, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
          </span>
        </div>
      </div>
    );

    return (
      <div
        className="mb-4 w-full"
        onMouseLeave={() => {
          setHover(false);
        }}
        style={{
          zIndex: 20 - index,
        }}
      >
        <div
          className={`px-4 py-3 text-sm   z-20 grid grid-cols-10 relative  w-full rounded-xl items-center  bg-cardBg ${
            hover ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'
          }`}
          onMouseEnter={() => {
            setHover(true);
          }}
        >
          {sellTokenAmount}
          {buyTokenAmount}
          {feeTier}
          {orderRate}
          {created}

          {unclaim}

          {actions}
        </div>
        {hover && !ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null}
      </div>
    );
  }

  const historyOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (historySortBy === 'created') {
      return sortOrderHistory === 'desc'
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (historySortBy === 'claimed') {
      return sortOrderHistory === 'desc'
        ? Number(b.bought_amount) - Number(a.bought_amount)
        : Number(a.bought_amount) - Number(b.bought_amount);
    }
  };

  function HistoryLine({
    order,
    index,
  }: {
    order: UserOrderInfo;
    index: number;
  }) {
    const [hover, setHover] = useState<boolean>(false);

    const buyToken = tokensMap[order.buy_token];

    const sellToken = tokensMap[order.sell_token];

    if (!buyToken || !sellToken) return null;

    const swapIn = toReadableNumber(
      sellToken.decimals,
      scientificNotationToString(
        new Big(order.original_deposit_amount || '0')
          .minus(order.original_amount || '0')
          .toString()
      )
    );

    const swapOut = toReadableNumber(
      buyToken.decimals,
      order.swap_earn_amount || '0'
    );

    const orderIn = toReadableNumber(
      sellToken.decimals,
      order.original_amount || '0'
    );

    const calPoint =
      sellToken.id === order.pool_id.split(V3_POOL_SPLITER)[0]
        ? order.point
        : -order.point;

    const price = pointToPrice({
      tokenA: sellToken,
      tokenB: buyToken,
      point: calPoint,
    });

    const buyAmount = sellAmountToBuyAmount(
      order.original_amount,
      order,
      price
    );

    const claimedAmount = toReadableNumber(
      buyToken.decimals,
      order.bought_amount || '0'
    );

    const cancelAmount = sellAmountToBuyAmount(
      order.cancel_amount,
      order,
      price
    );

    const amountTotal = new Big(claimedAmount || '0').plus(cancelAmount || '0');

    const pClaimedAmount = new Big(claimedAmount || '0')
      .div(amountTotal.lte(0) ? 1 : amountTotal)
      .times(100)
      .toNumber();

    const pCancelAmount = new Big(cancelAmount || '0')
      .div(amountTotal.lte(0) ? 1 : amountTotal)
      .times(100)
      .toNumber();

    const displayPercents = checkAllocations('100', [
      pClaimedAmount > 0 && pClaimedAmount < 4
        ? '4'
        : scientificNotationToString(pClaimedAmount.toString()),
      pCancelAmount > 0 && pCancelAmount < 4
        ? '4'
        : scientificNotationToString(pCancelAmount.toString()),
    ]);

    const getClaimAmountTip = () => {
      return `
        <div 
          class="flex flex-col text-xs min-w-36 text-farmText z-50"
        >
        ${
          ONLY_ZEROS.test(claimedAmount)
            ? ''
            : `
        <div class="flex items-center justify-between my-1">
            <span class="flex items-center mr-1">
                <div class="w-1.5 h-1.5 rounded-full bg-gradientFrom mr-1">
                </div>

                ${intl.formatMessage({ id: 'claimed' })}

            </span>

            <span>
            ${
              Number(claimedAmount) > 0 && Number(claimedAmount) < 0.001
                ? '< 0.001'
                : toPrecision(claimedAmount, 3)
            }
            </span>

        </div>
        `
        }




        ${
          ONLY_ZEROS.test(cancelAmount)
            ? ''
            : `<div class="flex items-center my-1 justify-between">
            <span class="flex items-center ">
                <div class="w-1.5 h-1.5 rounded-full bg-primaryText mr-1">
                </div>

                ${intl.formatMessage({
                  id: 'cancelled',
                  defaultMessage: 'Canceled',
                })}

            </span>

            <span>
            ${
              Number(cancelAmount) > 0 && Number(cancelAmount) < 0.001
                ? '< 0.001'
                : toPrecision(cancelAmount, 3)
            }

            </span>

        </div>`
        }

        </div>
    `;
    };

    const sellTokenAmount = (
      <div className="flex items-center whitespace-nowrap w-28 justify-between">
        <span className="flex flex-shrink-0 items-center col-span-1">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <div className="flex flex-col ml-2">
            <span className="text-white text-sm mr-2" title={orderIn}>
              {Number(orderIn) > 0 && Number(orderIn) < 0.01
                ? '< 0.01'
                : toPrecision(orderIn, 2)}
            </span>

            <span className="text-v3SwapGray text-xs">
              {toRealSymbol(sellToken.symbol)}
            </span>
          </div>
        </span>

        <span className="text-white text-lg pl-2  pr-1">
          <RouterArrowRight />
        </span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center col-span-1 ml-8">
        <img
          src={buyToken.icon}
          className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <div className="flex flex-col ml-2">
          <span
            className="text-white mr-2 text-sm whitespace-nowrap"
            title={buyAmount}
          >
            {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
              ? '< 0.01'
              : toPrecision(buyAmount, 2)}
          </span>

          <span className="text-v3SwapGray text-xs">
            {toRealSymbol(buyToken.symbol)}
          </span>
        </div>
      </span>
    );

    const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

    const feeTier = (
      <span
        style={{
          color: '#78C6FF',
        }}
        className="col-span-2 ml-10"
      >
        {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
      </span>
    );

    const orderRate = (
      <span className="whitespace-nowrap col-span-1 flex items-end flex-col relative right-4">
        <span className="mr-1 text-white text-sm" title={price}>
          {toPrecision(price, 2)}
        </span>
        <span className="text-v3SwapGray text-xs">
          {`${toRealSymbol(buyToken.symbol)}/${toRealSymbol(sellToken.symbol)}`}
        </span>
      </span>
    );

    const claimTip = (
      <div
        className="text-xs mt-1 mr-1 w-20 flex items-center"
        data-type="info"
        data-place="bottom"
        data-multiline={true}
        data-class="reactTip"
        data-html={true}
        data-tip={getClaimAmountTip()}
        data-for={'claim_tip_' + order.order_id}
      >
        <QuestionMark color="dark" />
        <div className="flex items-center w-full">
          {displayPercents.map((p, i) => {
            if (ONLY_ZEROS.test(p)) return null;

            const bgColor = i === 0 ? 'bg-gradientFrom' : 'bg-primaryText';

            return (
              <div
                className={`mx-0.5 h-1 rounded-lg ${bgColor}`}
                style={{
                  width: p + '%',
                }}
              />
            );
          })}
        </div>
        <ReactTooltip
          className="w-20"
          id={'claim_tip_' + order.order_id}
          backgroundColor="#1D2932"
          place="bottom"
          border
          borderColor="#7e8a93"
          textColor="#C6D1DA"
          effect="solid"
        />
      </div>
    );

    const claimed = (
      <span className="whitespace-nowrap col-span-2 flex items-center ml-12">
        <div>
          <div className="flex items-center">
            <img
              src={buyToken.icon}
              className="border border-gradientFrom rounded-full w-4 h-4"
              alt=""
            />
            <span
              className="text-white text-sm mx-1"
              title={toReadableNumber(
                buyToken.decimals,
                order.unclaimed_amount || '0'
              )}
            >
              {Number(
                toReadableNumber(
                  buyToken.decimals,
                  order.unclaimed_amount || '0'
                )
              ) > 0 &&
              Number(
                toReadableNumber(
                  buyToken.decimals,
                  order.unclaimed_amount || '0'
                )
              ) < 0.001
                ? '< 0.001'
                : toPrecision(
                    toReadableNumber(
                      buyToken.decimals,
                      order.unclaimed_amount || '0'
                    ),
                    3
                  )}
            </span>
          </div>

          {claimTip}
        </div>
      </span>
    );

    const created = (
      <span className="col-span-2 relative whitespace-nowrap right-12 text-white text-right">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
      </span>
    );

    const actions = (
      <div className=" col-span-1  text-primaryText  text-xs justify-self-end p-1.5">
        {ONLY_ZEROS.test(order.cancel_amount) ? (
          <FormattedMessage id="finish" defaultMessage={'Finish'} />
        ) : (
          <FormattedMessage id="canceled" defaultMessage={'Canceled'} />
        )}
      </div>
    );

    const tokenPrice = useContext(PriceContext);

    const sellTokenPrice = tokenPrice?.[sellToken.id]?.price || null;

    const swapBanner = (
      <div className=" whitespace-nowrap relative z-10 bottom-4 w-full text-sm text-v3SwapGray bg-cardBg rounded-xl px-5 pb-5 pt-10">
        <div className="flex items-center justify-between mb-7">
          <span className="flex items-center">
            <FormattedMessage
              id="initial_order"
              defaultMessage={'Initial Order'}
            />

            <QuestionTip
              id="this_order_has_been_partially_instant_swapped "
              defaultMessage="This order has been partially instant swapped "
              dataPlace="right"
            />
          </span>

          <span className="flex items-center">
            <span title={orderIn} className="text-white">
              {Number(orderIn) > 0 && Number(orderIn) < 0.01
                ? '< 0.01'
                : toPrecision(orderIn, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            <span className="mx-6">
              <RouterArrowRight />
            </span>
            <span title={buyAmount} className="text-white">
              {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
                ? '< 0.01'
                : toPrecision(buyAmount, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
          </span>
        </div>

        <div className="flex items-center justify-between ">
          <span className="flex items-center ">
            <FormattedMessage
              id="instant_swap"
              defaultMessage={'Instant Swap'}
            />

            <span className="flex items-center text-white ml-4">
              {`1 ${toRealSymbol(sellToken.symbol)}`} &nbsp;
              {!!sellTokenPrice ? (
                <span className=" text-v3SwapGray mr-1">
                  {`($${toPrecision(sellTokenPrice, 2)})`}
                </span>
              ) : null}
              {`= `}
              <span
                className="mx-1"
                title={new Big(swapOut)
                  .div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn)
                  .toFixed(buyToken.decimals)}
              >
                {`${new Big(swapOut)
                  .div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn)
                  .toFixed(3)}`}
              </span>
              {` ${toRealSymbol(buyToken.symbol)}`}
            </span>
          </span>
          <span className="flex items-center">
            <span title={swapIn} className="text-white">
              {Number(swapIn) > 0 && Number(swapIn) < 0.01
                ? '< 0.01'
                : toPrecision(swapIn, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            <span className="mx-6">
              <RouterArrowRight />
            </span>
            <span title={swapOut} className="text-white">
              {Number(swapOut) > 0 && Number(swapOut) < 0.01
                ? '< 0.01'
                : toPrecision(swapOut, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
          </span>
        </div>
      </div>
    );

    return (
      <div
        className="mb-4 w-full"
        onMouseLeave={() => {
          setHover(false);
        }}
        style={{
          zIndex: 20 - index,
        }}
      >
        <div
          className={`px-4 py-3 text-sm   z-20 grid grid-cols-10 relative  w-full rounded-xl items-center  bg-cardBg ${
            hover ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'
          }`}
          onMouseEnter={() => {
            setHover(true);
          }}
        >
          {sellTokenAmount}
          {buyTokenAmount}
          {feeTier}
          {orderRate}
          {created}

          {claimed}

          {actions}
        </div>
        {hover && !ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null}
      </div>
    );
  }

  const activeOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (activeSortBy === 'created') {
      return sortOrderActive === 'desc'
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (activeSortBy === 'unclaim') {
      return sortOrderActive === 'desc'
        ? Number(b.unclaimed_amount) - Number(a.unclaimed_amount)
        : Number(a.unclaimed_amount) - Number(b.unclaimed_amount);
    }
  };

  return (
    <div className="flex flex-col">
      {OrderTab()}
      {orderType === 'active' && (
        <div className="mb-2.5 px-4 text-v3SwapGray text-sm grid grid-cols-10 whitespace-nowrap">
          <span className="col-span-1 text-left">
            <FormattedMessage id="you_sell" defaultMessage={'You Sell'} />
          </span>

          <span className="col-span-1 ml-8">
            <FormattedMessage id="you_buy" defaultMessage={'You Buy'} />
          </span>

          <span className="col-span-2 ml-10">
            <FormattedMessage id="fee_tiers" defaultMessage={'Fee Tiers'} />
          </span>

          <span className="col-span-1">
            <FormattedMessage id="order_rates" defaultMessage={'Order Rates'} />
          </span>

          <button
            className="col-span-2 flex items-center ml-20"
            onClick={() => {
              setActiveSortBy('created');
              if (activeSortBy === 'created') {
                if (sortOrderActive === 'asc') {
                  setSorOrderActive('desc');
                } else {
                  setSorOrderActive('asc');
                }
              } else {
                setSorOrderActive('desc');
              }
            }}
          >
            <FormattedMessage id="created" defaultMessage={'Created'} />

            <span
              className={`ml-0.5 ${
                activeSortBy === 'created' ? 'text-gradientFrom' : ''
              }`}
            >
              {activeSortBy === 'created' && sortOrderActive === 'asc' ? (
                <UpArrowVE />
              ) : (
                <DownArrowVE />
              )}
            </span>
          </button>

          <button
            className="col-span-2 flex items-center ml-12 text-right"
            onClick={() => {
              setActiveSortBy('unclaim');
              if (activeSortBy === 'unclaim') {
                if (sortOrderActive === 'asc') {
                  setSorOrderActive('desc');
                } else {
                  setSorOrderActive('asc');
                }
              } else {
                setSorOrderActive('desc');
              }
            }}
          >
            <FormattedMessage id="unclaimed" defaultMessage={'Unclaimed'} />
            <span
              className={`ml-0.5 ${
                activeSortBy === 'unclaim' ? 'text-gradientFrom' : ''
              }`}
            >
              {activeSortBy === 'unclaim' && sortOrderActive === 'asc' ? (
                <UpArrowVE />
              ) : (
                <DownArrowVE />
              )}
            </span>
          </button>

          <span className="col-span-1 text-right">
            <FormattedMessage id="actions" defaultMessage={'Actions'} />
          </span>
        </div>
      )}

      {orderType === 'history' && (
        <div className="mb-2.5 px-4 text-v3SwapGray text-sm grid grid-cols-10 whitespace-nowrap">
          <span className="col-span-1 text-left">
            <FormattedMessage id="you_sell" defaultMessage={'You Sell'} />
          </span>

          <span className="col-span-1 ml-8">
            <FormattedMessage id="you_buy" defaultMessage={'You Buy'} />
          </span>

          <span className="col-span-2 ml-10">
            <FormattedMessage id="fee_tiers" defaultMessage={'Fee Tiers'} />
          </span>

          <span className="col-span-1">
            <FormattedMessage id="order_rates" defaultMessage={'Order Rates'} />
          </span>

          <button
            className="col-span-2 flex items-center ml-20"
            onClick={() => {
              setHistorySortBy('created');
              if (historySortBy === 'created') {
                if (sortOrderHistory === 'asc') {
                  setSorOrderHistory('desc');
                } else {
                  setSorOrderHistory('asc');
                }
              } else {
                setSorOrderHistory('desc');
              }
            }}
          >
            <FormattedMessage id="created" defaultMessage={'Created'} />

            <span
              className={`ml-0.5 ${
                historySortBy === 'created' ? 'text-gradientFrom' : ''
              }`}
            >
              {historySortBy === 'created' && sortOrderHistory === 'asc' ? (
                <UpArrowVE />
              ) : (
                <DownArrowVE />
              )}
            </span>
          </button>

          <button
            className="col-span-2 flex items-center ml-12 text-right"
            onClick={() => {
              setHistorySortBy('claimed');
              if (historySortBy === 'claimed') {
                if (sortOrderHistory === 'asc') {
                  setSorOrderHistory('desc');
                } else {
                  setSorOrderHistory('asc');
                }
              } else {
                setSorOrderHistory('desc');
              }
            }}
          >
            <FormattedMessage id="claimed" defaultMessage={'Claimed'} />
            <span
              className={`ml-0.5 ${
                historySortBy === 'claimed' ? 'text-gradientFrom' : ''
              }`}
            >
              {historySortBy === 'claimed' && sortOrderHistory === 'asc' ? (
                <UpArrowVE />
              ) : (
                <DownArrowVE />
              )}
            </span>
          </button>

          <span className="col-span-1 text-right">
            <FormattedMessage id="state" defaultMessage={'State'} />
          </span>
        </div>
      )}
      {orderType === 'history' &&
        (!historyOrder || historyOrder.length === 0) && (
          <NoOrderCard text="history" />
        )}
      {orderType === 'active' && (!activeOrder || activeOrder.length === 0) && (
        <NoOrderCard text="active" />
      )}

      {orderType === 'active' &&
        activeOrder &&
        activeOrder.sort(activeOrderSorting).map((order, index) => {
          return (
            <ActiveLine index={index} key={order.order_id} order={order} />
          );
        })}
      {orderType === 'history' &&
        historyOrder &&
        historyOrder.sort(historyOrderSorting).map((order, index) => {
          return (
            <HistoryLine index={index} key={order.order_id} order={order} />
          );
        })}
    </div>
  );
}

function MyOrderPage() {
  const { activeOrder, historyOrder } = useMyOrders();

  const history = useHistory();

  const tokenPriceList = useTokenPriceList();

  const ActiveTokenIds = activeOrder
    ?.map((order) => [order.sell_token, order.buy_token])
    .flat();

  const HistoryTokenIds = historyOrder
    ?.map((order) => [order.sell_token, order.buy_token])
    .flat();

  const tokenIds =
    !activeOrder || !historyOrder
      ? null
      : [...new Set([...ActiveTokenIds, ...HistoryTokenIds])];

  const tokens = useTokens(tokenIds || []);

  if (
    !tokenIds ||
    !activeOrder ||
    !historyOrder ||
    (tokenIds?.length > 0 && tokens?.length === 0)
  ) {
    return <Loading />;
  }

  const tokensMap = tokens.reduce((acc, cur, index) => {
    return {
      ...acc,
      [cur.id]: cur,
    };
  }, {});

  return (
    <div
      className="max-w-7xl mx-auto flex flex-col "
      style={{
        width: '1000px',
      }}
    >
      <div className="flex items-center justify-between text-white mb-7">
        <button
          className="whitespace-nowrap flex items-center "
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            history.push('/swap');
            localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          }}
        >
          <span className="text-xl font-bold mr-3">
            <RouterArrowLeft />
          </span>
          <FormattedMessage id="my_orders" defaultMessage={'My Orders'} />
        </button>
        <SolidButton
          padding="px-4 py-2"
          className="rounded-lg"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            history.push('/swap');
            localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
            localStorage.setItem(REF_FI_SWAP_SWAPPAGE_TAB_KEY, 'normal');
          }}
        >
          <FormattedMessage
            id="make_an_order"
            defaultMessage={'Make an Order'}
          />
        </SolidButton>
      </div>
      <PriceContext.Provider value={tokenPriceList}>
        <OrderCard
          tokensMap={tokensMap}
          activeOrder={activeOrder}
          historyOrder={historyOrder}
        />
      </PriceContext.Provider>
    </div>
  );
}

export default MyOrderPage;
