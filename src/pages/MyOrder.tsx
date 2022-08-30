import React, { useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { useClientMobile } from '~utils/device';
import { SolidButton } from '../components/button/Button';
import { useMyOrders } from '../state/swapV3';
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from '../services/swapV3';
import { useToken } from '../state/token';
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
import { toReadableNumber } from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import Big from 'big.js';
import { cancel_order } from '../services/swapV3';
import { TIMESTAMP_DIVISOR } from '../components/layout/Proposal';
import moment from 'moment';
import { DownArrowVE } from '../components/icon/Referendum';

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
}: {
  activeOrder: UserOrderInfo[];
  historyOrder: UserOrderInfo[];
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
  >();

  const [historySortBy, setHistorySortBy] = useState<
    'filled' | 'claimed' | 'created'
  >();

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

  function ActiveLine({ order }: { order: UserOrderInfo }) {
    const buyToken = useToken(order.buy_token);

    const sellToken = useToken(order.sell_token);

    if (!buyToken || !sellToken) return null;
    const unClaimedAmount = toReadableNumber(
      buyToken.decimals,
      order.unclaimed_amount || '0'
    );

    const price = pointToPrice({
      tokenA: sellToken,
      tokenB: buyToken,
      point: order.point,
    });
    const sellTokenAmount = (
      <div className="flex items-center">
        <span className="flex items-center col-span-1">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <span className="text-white text-sm mx-2">
            {toPrecision(
              toReadableNumber(sellToken.decimals, order.orginal_amount),
              2
            )}
          </span>

          <span className="text-v3SwapGray text-xs">{sellToken.symbol}</span>
        </span>
        <span className="text-white text-lg ml-5">{'>'}</span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center col-span-1 mr-4">
        <img
          src={buyToken.icon}
          className="border border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <span className="text-white mx-2 text-sm">
          {toPrecision(
            toReadableNumber(buyToken.decimals, order.bought_amount),
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
          className={`rounded-lg bg-black bg-opacity-25 text-xs ml-1.5 p-1.5 ${
            ONLY_ZEROS.test(unClaimedAmount)
              ? 'text-v3SwapGray cursor-not-allowed'
              : 'text-gradientFrom '
          }`}
          type="button"
          disabled={ONLY_ZEROS.test(unClaimedAmount)}
        >
          <FormattedMessage id="claim" defaultMessage={'Claim'} />
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
        {new Big(order.unclaimed_amount || '0')
          .div(ONLY_ZEROS.test(order.bought_amount) ? 1 : order.bought_amount)
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
        className="border col-span-1 rounded-lg border-warn border-opacity-20 text-warn  text-xs justify-self-end p-1.5"
        onClick={() => {
          cancel_order({
            order_id: order.order_id,
            undecimal_amount: order.unclaimed_amount || '0',
          });
        }}
      >
        <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
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
      return Number(b.created_at) - Number(a.created_at);
    } else if (historySortBy === 'claimed') {
      const claimedA = new Big(a.bought_amount)
        .minus(a.unclaimed_amount)
        .toNumber();

      const claimedB = new Big(b.bought_amount)
        .minus(b.unclaimed_amount)
        .toNumber();

      return claimedB - claimedA;
    } else if (historySortBy === 'filled') {
      const fa = new Big(a.bought_amount)
        .minus(a.unclaimed_amount)
        .div(ONLY_ZEROS.test(a.bought_amount) ? '1' : a.bought_amount)
        .times(100)
        .toNumber();

      const fb = new Big(b.bought_amount)
        .minus(b.unclaimed_amount)
        .div(ONLY_ZEROS.test(b.bought_amount) ? '1' : b.bought_amount)
        .times(100)
        .toNumber();

      return fb - fa;
    }
  };

  function HistoryLine({ order }: { order: UserOrderInfo }) {
    const buyToken = useToken(order.buy_token);

    const sellToken = useToken(order.sell_token);

    if (!buyToken || !sellToken) return null;

    const price = pointToPrice({
      tokenA: sellToken,
      tokenB: buyToken,
      point: order.point,
    });
    const sellTokenAmount = (
      <div className="flex items-center">
        <span className="flex items-center col-span-1">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <span className="text-white text-sm mx-2">
            {toPrecision(
              toReadableNumber(sellToken.decimals, order.orginal_amount),
              2
            )}
          </span>

          <span className="text-v3SwapGray text-xs">{sellToken.symbol}</span>
        </span>
        <span className="text-white text-lg ml-5">{'>'}</span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center col-span-1 mr-4">
        <img
          src={buyToken.icon}
          className="border border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <span className="text-white mx-2 text-sm">
          {toPrecision(
            toReadableNumber(buyToken.decimals, order.bought_amount),
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
          {new Big(order.bought_amount)
            .minus(order.unclaimed_amount || '0')
            .div(
              ONLY_ZEROS.test(order.bought_amount) ? '1' : order.bought_amount
            )
            .times(100)
            .toFixed()}
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
            toReadableNumber(
              buyToken.decimals,
              new Big(order.bought_amount)
                .minus(order.unclaimed_amount || '0')
                .toFixed()
            ),
            0,
            false,
            false
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
        {filled}
        {claimedAmount}
        {created}
        {actions}
      </div>
    );
  }

  const activeOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (activeSortBy === 'created') {
      return Number(b.created_at) - Number(a.created_at);
    } else if (activeSortBy === 'pending') {
      return Number(b.unclaimed_amount) - Number(a.unclaimed_amount);
    } else if (activeSortBy === 'unclaim') {
    } else if (activeSortBy) {
      const aP = new Big(a.unclaimed_amount).div(a.orginal_amount).toNumber();
      const bP = new Big(b.unclaimed_amount).div(b.orginal_amount).toNumber();

      return bP - aP;
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
            }}
          >
            <FormattedMessage id="pending" defaultMessage={'Pending'} />

            <span
              className={`ml-0.5 ${
                activeSortBy === 'pending' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
            </span>
          </button>
          <button
            className="col-span-1 flex items-center  text-right"
            onClick={() => {
              setActiveSortBy('unclaim');
            }}
          >
            <FormattedMessage id="Unclaimed" defaultMessage={'Unclaimed'} />

            <span
              className={`ml-0.5 ${
                activeSortBy === 'unclaim' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
            </span>
          </button>

          <button
            className="col-span-1 flex items-center relative lef-3  text-right"
            onClick={() => {
              setActiveSortBy('created');
            }}
          >
            <FormattedMessage id="created" defaultMessage={'Created'} />

            <span
              className={`ml-0.5 ${
                activeSortBy === 'created' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
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
            className="col-span-1 flex items-center mr-4 text-right"
            onClick={() => {
              setHistorySortBy('filled');
            }}
          >
            <FormattedMessage id="filled" defaultMessage={'Filled'} />

            <span
              className={`ml-0.5 ${
                historySortBy === 'filled' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
            </span>
          </button>
          <button
            className="col-span-1 flex items-center  text-right"
            onClick={() => {
              setHistorySortBy('claimed');
            }}
          >
            <FormattedMessage id="claimed" defaultMessage={'Claimed'} />

            <span
              className={`ml-0.5 ${
                historySortBy === 'claimed' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
            </span>
          </button>

          <button
            className="col-span-1 flex items-center relative lef-3  text-right"
            onClick={() => {
              setHistorySortBy('created');
            }}
          >
            <FormattedMessage id="created" defaultMessage={'Created'} />

            <span
              className={`ml-0.5 ${
                historySortBy === 'created' ? 'text-gradientFrom' : ''
              }`}
            >
              <DownArrowVE />
            </span>
          </button>
          <span className="col-span-1 text-right">
            <FormattedMessage id="status" defaultMessage={'Status'} />
          </span>
        </div>
      )}
      {orderType === 'history' && !historyOrder && (
        <NoOrderCard text="history" />
      )}
      {orderType === 'active' && !activeOrder && <NoOrderCard text="active" />}

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
  const history = useHistory();

  const { activeOrder, historyOrder } = useMyOrders();

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
          <span className="text-xl font-bold mr-3">{'<'}</span>
          <FormattedMessage id="my_orders" defaultMessage={'My Orders'} />
        </button>
        <SolidButton padding="px-4 py-2" className="rounded-lg">
          <FormattedMessage
            id="make_an_order"
            defaultMessage={'Make an Order'}
          />
        </SolidButton>
      </div>
      {/* {noOrder ? (
        <NoOrderCard />
      ) : ( */}
      <OrderCard activeOrder={activeOrder} historyOrder={historyOrder} />
      {/* )} */}
    </div>
  );
}

export default MyOrderPage;
