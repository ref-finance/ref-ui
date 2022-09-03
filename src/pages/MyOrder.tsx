import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useClientMobile } from '~utils/device';
import { SolidButton, ButtonTextWrapper } from '../components/button/Button';
import { useMyOrders } from '../state/swapV3';
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from '../services/swapV3';
import { useToken, useTokens } from '../state/token';
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
import { toReadableNumber, scientificNotationToString } from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import Big from 'big.js';
import { cancel_order } from '../services/swapV3';
import { TIMESTAMP_DIVISOR } from '../components/layout/Proposal';
import moment from 'moment';
import { DownArrowVE, UpArrowVE } from '../components/icon/Referendum';
import { Loading } from '~components/icon/Loading';
import { RouterArrowLeft, RouterArrowRight } from '../components/icon/Arrows';

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

function OrderCard({
  activeOrder,
  historyOrder,
  tokensMap,
}: {
  activeOrder: UserOrderInfo[];
  historyOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
}) {
  const [orderType, setOrderType] = useState<'active' | 'history'>(
    sessionStorage.getItem(ORDER_TYPE_KEY) ||
      activeOrder?.length > 0 ||
      !historyOrder ||
      historyOrder.length === 0
      ? 'active'
      : 'history'
  );

  const [activeSortBy, setActiveSortBy] = useState<
    'pending' | 'unclaim' | 'created'
  >('created');

  const [sortOrderActive, setSorOrderActive] = useState<'asc' | 'desc'>('desc');

  const [sortOrderHistory, setSorOrderHistory] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [historySortBy, setHistorySortBy] = useState<
    'filled' | 'claimed' | 'created'
  >('created');

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
  function ActiveLine({ order }: { order: UserOrderInfo }) {
    const [claimLoading, setClaimLoading] = useState<boolean>(false);

    const [cancelLoading, setCancelLoading] = useState<boolean>(false);

    const buyToken = tokensMap[order.buy_token];

    const sellToken = tokensMap[order.sell_token];

    if (!buyToken || !sellToken) return null;
    const unClaimedAmount = toReadableNumber(
      buyToken.decimals,
      order.unclaimed_amount || '0'
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

    const sellTokenAmount = (
      <div className="flex items-center justify-between">
        <span className="flex flex-shrink-0 items-center col-span-1">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <span className="text-white text-sm mx-2">
            {toPrecision(
              toReadableNumber(sellToken.decimals, order.original_amount),
              2
            )}
          </span>

          <span className="text-v3SwapGray text-xs">{sellToken.symbol}</span>
        </span>
        <span className="text-white text-lg pl-2 pr-1">
          <RouterArrowRight />
        </span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center col-span-1 mr-4">
        <img
          src={buyToken.icon}
          className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <span
          className="text-white mx-2 text-sm"
          title={sellAmountToBuyAmount(order.original_amount, order, price)}
        >
          {toPrecision(
            sellAmountToBuyAmount(order.original_amount, order, price),
            2
          )}
        </span>

        <span className="text-v3SwapGray text-xs">{buyToken.symbol}</span>
      </span>
    );

    const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

    const feeTier = (
      <span
        style={{
          color: '#78C6FF',
        }}
        className="col-span-1 ml-4"
      >
        {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
      </span>
    );

    const orderRate = (
      <span className="whitespace-nowrap col-span-1 flex items-center relative right-4">
        <span className="mr-1 text-white text-sm">{toPrecision(price, 2)}</span>
        <span className="text-v3SwapGray text-xs">
          {`${buyToken.symbol}/${sellToken.symbol}`}
        </span>
      </span>
    );

    const pending = (
      <span className="whitespace-nowrap col-span-1 flex items-center relative right-1">
        <img
          src={sellToken.icon}
          className="border border-gradientFrom rounded-full w-4 h-4"
          alt=""
        />
        <span className="text-white text-sm mx-1">
          {toPrecision(
            toReadableNumber(buyToken.decimals, order.unclaimed_amount || '0'),
            3
          )}
        </span>

        <button
          className={`rounded-lg  bg-deepBlue  text-xs ml-1.5 p-1.5 ${
            ONLY_ZEROS.test(unClaimedAmount)
              ? 'text-v3SwapGray cursor-not-allowe bg-black bg-opacity-25'
              : `text-white  hover:text-white hover:bg-deepBlueHover ${
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

    const unClaimedPercent = (
      <span
        className={`${
          ONLY_ZEROS.test(order.unclaimed_amount || '0')
            ? 'text-white '
            : 'text-warn'
        } col-span-1 justify-self-center pr-6`}
      >
        {new Big(
          toReadableNumber(buyToken.decimals, order.unclaimed_amount || '0')
        )
          .div(
            ONLY_ZEROS.test(order.original_amount || '0')
              ? 1
              : sellAmountToBuyAmount(order.original_amount, order, price)
          )
          .times(100)
          .toFixed(0)}
        %
      </span>
    );

    const created = (
      <span className="col-span-1 relative whitespace-nowrap right-3 text-white text-right">
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
        ></ButtonTextWrapper>
      </button>
    );

    return (
      <div className="px-4 py-3 text-sm mb-4 grid grid-cols-8 w-full rounded-xl items-center  bg-cardBg">
        {sellTokenAmount}
        {buyTokenAmount}
        {feeTier}
        {orderRate}
        {pending}
        {unClaimedPercent}
        {created}
        {actions}
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
    } else if (historySortBy === 'filled') {
      const calPointa =
        a.sell_token === a.pool_id.split(V3_POOL_SPLITER)[0]
          ? a.point
          : -a.point;

      const pricea = pointToPrice({
        tokenA: tokensMap[a.sell_token],
        tokenB: tokensMap[a.buy_token],
        point: calPointa,
      });

      const fa = new Big(
        buyAmountToSellAmount(a.bought_amount || '0', a, pricea)
      )
        .div(
          toReadableNumber(tokensMap[a.sell_token].decimals, a.original_amount)
        )
        .toNumber();

      const calPointb =
        b.sell_token === b.pool_id.split(V3_POOL_SPLITER)[0]
          ? b.point
          : -b.point;

      const priceb = pointToPrice({
        tokenA: tokensMap[b.sell_token],
        tokenB: tokensMap[b.buy_token],
        point: calPointb,
      });

      const fb = new Big(
        buyAmountToSellAmount(b.bought_amount || '0', b, priceb)
      )
        .div(
          toReadableNumber(tokensMap[b.sell_token].decimals, b.original_amount)
        )
        .toNumber();

      return sortOrderHistory === 'desc' ? fb - fa : fa - fb;
    }
  };

  function HistoryLine({ order }: { order: UserOrderInfo }) {
    const buyToken = tokensMap[order.buy_token];

    const sellToken = tokensMap[order.sell_token];

    if (!buyToken || !sellToken) return null;

    const calPoint =
      sellToken.id === order.pool_id.split(V3_POOL_SPLITER)[0]
        ? order.point
        : -order.point;

    const price = pointToPrice({
      tokenA: sellToken,
      tokenB: buyToken,
      point: calPoint,
    });

    const sellTokenAmount = (
      <div className="flex items-center justify-between">
        <span className="flex flex-shrink-0 items-center col-span-1">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <span className="text-white text-sm mx-2">
            {toPrecision(
              toReadableNumber(sellToken.decimals, order.original_amount),
              2
            )}
          </span>

          <span className="text-v3SwapGray text-xs">{sellToken.symbol}</span>
        </span>
        <span className="text-white text-lg pl-2 pr-1">
          <RouterArrowRight />
        </span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center col-span-1 mr-4">
        <img
          src={buyToken.icon}
          className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <span
          className="text-white mx-2 text-sm"
          title={sellAmountToBuyAmount(order.original_amount, order, price)}
        >
          {toPrecision(
            sellAmountToBuyAmount(order.original_amount, order, price),
            2
          )}
        </span>

        <span className="text-v3SwapGray text-xs">{buyToken.symbol}</span>
      </span>
    );

    const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

    const feeTier = (
      <span
        style={{
          color: '#78C6FF',
        }}
        className="col-span-1 ml-4"
      >
        {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
      </span>
    );

    const orderRate = (
      <span className="whitespace-nowrap col-span-1 flex items-center relative right-4">
        <span className="mr-1 text-white text-sm">{toPrecision(price, 2)}</span>
        <span className="text-v3SwapGray text-xs">
          {`${buyToken.symbol}/${sellToken.symbol}`}
        </span>
      </span>
    );

    const filled = (
      <span className="whitespace-nowrap col-span-1 flex items-center relative right-1">
        <span className="text-white text-sm mx-1">
          {toPrecision(
            new Big(
              buyAmountToSellAmount(order.bought_amount || '0', order, price)
            )
              .div(toReadableNumber(sellToken.decimals, order.original_amount))
              .times(100)
              .toFixed(),
            0
          )}
          %
        </span>
      </span>
    );

    const claimedAmount = (
      <span
        className={`${
          ONLY_ZEROS.test(order.unclaimed_amount || '0')
            ? 'text-white '
            : 'text-warn'
        } col-span-1 justify-self-center flex pr-6 items-center`}
      >
        <img
          src={buyToken.icon}
          className="border border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <span className="mx-1 text-white text-sm">
          {toPrecision(
            toReadableNumber(buyToken.decimals, order.bought_amount || '0'),
            2
          )}
        </span>
      </span>
    );

    const created = (
      <span className="col-span-1 relative whitespace-nowrap right-3 text-white text-right">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
      </span>
    );

    // TODO:
    const actions = (
      <div className=" col-span-1  text-primaryText  text-xs justify-self-end p-1.5">
        {ONLY_ZEROS.test(order.cancel_amount) ? (
          <FormattedMessage id="finish" defaultMessage={'Finish'} />
        ) : (
          <FormattedMessage id="canceled" defaultMessage={'Canceled'} />
        )}
      </div>
    );

    return (
      <div className="px-4 py-3 text-sm mb-4 grid grid-cols-8 w-full rounded-xl items-center  bg-cardBg">
        {sellTokenAmount}
        {buyTokenAmount}
        {feeTier}
        {orderRate}
        {claimedAmount}
        {filled}

        {created}
        {actions}
      </div>
    );
  }

  const activeOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (activeSortBy === 'created') {
      return sortOrderActive === 'desc'
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (activeSortBy === 'pending') {
      return sortOrderActive === 'desc'
        ? Number(b.unclaimed_amount) - Number(a.unclaimed_amount)
        : Number(a.unclaimed_amount) - Number(b.unclaimed_amount);
    } else if (activeSortBy === 'unclaim') {
      const calPointa =
        a.sell_token === a.pool_id.split(V3_POOL_SPLITER)[0]
          ? a.point
          : -a.point;

      const pricea = pointToPrice({
        tokenA: tokensMap[a.sell_token],
        tokenB: tokensMap[a.buy_token],
        point: calPointa,
      });

      const aP = new Big(
        toReadableNumber(
          tokensMap[a.buy_token].decimals,
          a.unclaimed_amount || '0'
        )
      )
        .div(
          ONLY_ZEROS.test(a.original_amount || '0')
            ? 1
            : sellAmountToBuyAmount(a.original_amount, a, pricea)
        )
        .toNumber();

      const calPointb =
        b.sell_token === b.pool_id.split(V3_POOL_SPLITER)[0]
          ? b.point
          : -b.point;

      const priceb = pointToPrice({
        tokenA: tokensMap[b.sell_token],
        tokenB: tokensMap[b.buy_token],
        point: calPointb,
      });

      const bP = new Big(
        toReadableNumber(
          tokensMap[b.buy_token].decimals,
          b.unclaimed_amount || '0'
        )
      )
        .div(
          ONLY_ZEROS.test(b.remain_amount || '0')
            ? 1
            : sellAmountToBuyAmount(b.remain_amount, b, priceb)
        )
        .toNumber();

      return sortOrderActive === 'desc' ? bP - aP : aP - bP;
    }
  };

  return (
    <div className="flex flex-col">
      {OrderTab()}
      {orderType === 'active' && (
        <div className="mb-2.5 px-4 text-v3SwapGray text-sm grid grid-cols-8 whitespace-nowrap">
          <span className="col-span-1 text-left">
            <FormattedMessage id="you_sell" defaultMessage={'You Sell'} />
          </span>

          <span className="col-span-1 ml-4">
            <FormattedMessage id="you_buy" defaultMessage={'You Buy'} />
          </span>

          <span className="col-span-1">
            <FormattedMessage id="fee_tiers" defaultMessage={'Fee Tiers'} />
          </span>

          <span className="col-span-1 text-left relative right-2">
            <FormattedMessage id="order_rates" defaultMessage={'Order Rates'} />
          </span>

          <button
            className="col-span-1 flex items-center mr-4 text-right"
            onClick={() => {
              setActiveSortBy('pending');
              if (activeSortBy === 'pending') {
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
            <FormattedMessage
              id="pending_top_upper"
              defaultMessage={'Pending'}
            />

            <span
              className={`ml-0.5 ${
                activeSortBy === 'pending' ? 'text-gradientFrom' : ''
              }`}
            >
              {activeSortBy === 'pending' && sortOrderActive === 'asc' ? (
                <UpArrowVE />
              ) : (
                <DownArrowVE />
              )}
            </span>
          </button>
          <button
            className="col-span-1 flex items-center  text-right"
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
            <FormattedMessage id="Unclaimed" defaultMessage={'Unclaimed'} />

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

          <button
            className="col-span-1 flex items-center relative lef-3  text-right"
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
          <span className="col-span-1 text-right">
            <FormattedMessage id="actions" defaultMessage={'Actions'} />
          </span>
        </div>
      )}

      {orderType === 'history' && (
        <div className="mb-2.5 px-4 text-v3SwapGray text-sm grid grid-cols-8 whitespace-nowrap">
          <span className="col-span-1 text-left">
            <FormattedMessage id="you_sell" defaultMessage={'You Sell'} />
          </span>

          <span className="col-span-1 ml-4">
            <FormattedMessage id="you_buy" defaultMessage={'You Buy'} />
          </span>

          <span className="col-span-1">
            <FormattedMessage id="fee_tiers" defaultMessage={'Fee Tiers'} />
          </span>

          <span className="col-span-1 text-left relative right-2">
            <FormattedMessage id="order_rates" defaultMessage={'Order Rates'} />
          </span>

          <button
            className="col-span-1 flex items-center  text-right"
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
          <button
            className="col-span-1 flex items-center mr-4 text-right"
            onClick={() => {
              setHistorySortBy('filled');

              if (historySortBy === 'filled') {
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
            <FormattedMessage id="filled" defaultMessage={'Filled'} />

            <span
              className={`ml-0.5 ${
                historySortBy === 'filled' ? 'text-gradientFrom' : ''
              }`}
            >
              {historySortBy === 'filled' && sortOrderHistory === 'asc' ? (
                <UpArrowVE />
              ) : (
                <DownArrowVE />
              )}
            </span>
          </button>
          <button
            className="col-span-1 flex items-center relative lef-3  text-right"
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
          <span className="col-span-1 text-right">
            <FormattedMessage id="status" defaultMessage={'Status'} />
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
        activeOrder.sort(activeOrderSorting).map((order) => {
          return <ActiveLine key={order.order_id} order={order} />;
        })}
      {orderType === 'history' &&
        historyOrder &&
        historyOrder.sort(historyOrderSorting).map((order) => {
          return <HistoryLine key={order.order_id} order={order} />;
        })}
    </div>
  );
}

function MyOrderPage() {
  const { activeOrder, historyOrder } = useMyOrders();

  const history = useHistory();

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
            history.push('/swap/limit');
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

      <OrderCard
        tokensMap={tokensMap}
        activeOrder={activeOrder}
        historyOrder={historyOrder}
      />
    </div>
  );
}

export default MyOrderPage;
