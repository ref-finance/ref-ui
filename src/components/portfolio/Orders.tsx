import React, {
  useEffect,
  useMemo,
  useState,
  useContext,
  createContext,
} from 'react';
import { useMyOrders } from '../../state/swapV3';
import { useTokens } from '../../state/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { isClientMobie, useClientMobile } from '~utils/device';
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from '../../services/swapV3';
import { calculateFeePercent, ONLY_ZEROS, toPrecision } from '~utils/numbers';

import { BsCheckCircle } from 'react-icons/bs';

import {
  toReadableNumber,
  scientificNotationToString,
  checkAllocations,
} from '../../utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import Big from 'big.js';
import { TIMESTAMP_DIVISOR } from '../../components/layout/Proposal';
import moment from 'moment';
import { MyOrderMobileArrow } from '../../components/icon/Arrows';
import QuestionMark from '../../components/farm/QuestionMark';
import ReactTooltip from 'react-tooltip';
import { toRealSymbol } from '../../utils/token';
import { ExclamationTip } from '../../components/layout/TipWrapper';
import { MyOrderInstantSwapArrowRight } from '../../components/icon/swapV3';
import { TOKEN_LIST_FOR_RATE } from '../../services/commonV3';
import { PurpleCircleIcon } from '../../components/icon/Portfolio';
import BigNumber from 'bignumber.js';
import { PortfolioData } from '../../pages/Portfolio';
import { BlueCircleLoading } from '../../components/layout/Loading';
import { UpDownButton, NoDataCard } from './Tool';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';

const PriceContext = createContext(null);
export default function Orders(props: any) {
  const {
    tokenPriceList,
    set_active_order_value_done,
    set_active_order_Loading_done,
    set_active_order_quanity,
    set_active_order_value,
  } = useContext(PortfolioData);
  const { activeOrder, activeOrderDone } = useMyOrders();
  const ActiveTokenIds = activeOrder
    ?.map((order) => [order.sell_token, order.buy_token])
    .flat();
  const tokenIds = !activeOrder ? null : [...new Set([...ActiveTokenIds])];
  const tokens = useTokens(tokenIds || []);
  const tokensMap = tokens?.reduce((acc, cur, index) => {
    return {
      ...acc,
      [cur.id]: cur,
    };
  }, {});
  useEffect(() => {
    if (
      activeOrder?.length > 0 &&
      Object.keys(tokenPriceList).length > 0 &&
      Object.keys(tokensMap || {}).length > 0
    ) {
      const total_value = get_total_active_orders_value();
      set_active_order_value_done(true);
      set_active_order_value(total_value);
    }
    if (activeOrderDone) {
      if (activeOrder?.length == 0) {
        set_active_order_value_done(true);
        set_active_order_value('0');
      }
      const total_quantity = activeOrder.length;
      set_active_order_Loading_done(true);
      set_active_order_quanity(total_quantity);
    }
  }, [activeOrder, tokenPriceList, tokensMap]);

  function get_total_active_orders_value() {
    let total_value = new BigNumber(0);
    activeOrder.forEach((order: UserOrderInfo) => {
      const { sell_token, original_deposit_amount } = order;
      const price = tokenPriceList[sell_token]?.price || '0';
      const sell_token_meta = tokensMap[sell_token];
      const amount = toReadableNumber(
        sell_token_meta.decimals,
        original_deposit_amount
      );
      total_value = total_value.plus(
        new BigNumber(amount || 0).multipliedBy(price)
      );
    });
    return total_value.toFixed();
  }
  return <OrderCard tokensMap={tokensMap} activeOrder={activeOrder} />;
}
function OrderCard({
  activeOrder,
  tokensMap,
}: {
  activeOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
}) {
  const { globalState } = useContext(WalletContext);
  const accountId = getCurrentWallet()?.wallet?.getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  const intl = useIntl();

  const [activeSortBy, setActiveSortBy] = useState<'unclaim' | 'created'>(
    'created'
  );

  const [sortOrderActive, setSorOrderActive] = useState<'asc' | 'desc'>('desc');

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

  function ActiveLine({
    order,
    index,
  }: {
    order: UserOrderInfo;
    index: number;
  }) {
    const [switch_off, set_switch_off] = useState<boolean>(true);

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

    const totalIn = toReadableNumber(
      sellToken.decimals,
      order.original_deposit_amount || '0'
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
      scientificNotationToString(
        new Big(order.bought_amount || '0')
          .minus(order.unclaimed_amount || '0')
          .toString()
      )
    );

    const buyAmountRaw = sellAmountToBuyAmount(
      order.original_amount,
      order,
      price
    );

    const buyAmount = new Big(buyAmountRaw).gt(
      toReadableNumber(buyToken.decimals, order.bought_amount || '0')
    )
      ? buyAmountRaw
      : toReadableNumber(buyToken.decimals, order.bought_amount || '0');

    const totalOut = scientificNotationToString(
      new Big(buyAmount).plus(swapOut).toString()
    );

    const pendingAmount = scientificNotationToString(
      new Big(toPrecision(buyAmount || '0', 5, false, false) || 0)
        .minus(
          toPrecision(
            toReadableNumber(buyToken.decimals, order.bought_amount || '0') ||
              '0',
            5,
            false,
            false
          )
        )
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
      pClaimedAmount > 0 && pClaimedAmount < 5
        ? '5'
        : scientificNotationToString(pClaimedAmount.toString()),
      pUnClaimedAmount > 0 && pUnClaimedAmount < 5
        ? '5'
        : scientificNotationToString(pUnClaimedAmount.toString()),

      pPendingAmount > 0 && pPendingAmount < 5
        ? '5'
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

                ${intl.formatMessage({
                  id: 'claimed_upper',
                  defaultMessage: 'Claimed',
                })}

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

                ${intl.formatMessage({
                  id: 'filled',
                  defaultMessage: 'Filled',
                })}

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
                  id: 'open_my_order',
                  defaultMessage: 'Open',
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
        <span className="flex flex-shrink-0 items-center">
          <img
            src={sellToken.icon}
            className="border border-gradientFrom rounded-full w-7 h-7"
            alt=""
          />

          <div className="flex   xs:flex-row flex-col ml-2">
            <span className="text-white text-sm mr-2" title={orderIn}>
              {Number(orderIn) > 0 && Number(orderIn) < 0.01
                ? '< 0.01'
                : toPrecision(orderIn, 2)}
            </span>

            <span className="text-v3SwapGray text-xs xs:relative xs:top-0.5">
              {toRealSymbol(sellToken.symbol)}
            </span>
          </div>
        </span>

        <span className="text-white text-lg xs:hidden pl-2  pr-1">
          <MyOrderInstantSwapArrowRight />
        </span>
      </div>
    );

    const buyTokenAmount = (
      <span className="flex items-center ml-6">
        <img
          src={buyToken.icon}
          className="border flex-shrink-0 border-gradientFrom rounded-full w-7 h-7"
          alt=""
        />

        <div className="flex xs:flex-row flex-col ml-2">
          <span
            className="text-white mr-2 text-sm whitespace-nowrap"
            title={buyAmount}
          >
            {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
              ? '< 0.01'
              : toPrecision(buyAmount, 2)}
          </span>

          <span className="text-v3SwapGray text-xs xs:relative xs:top-0.5">
            {toRealSymbol(buyToken.symbol)}
          </span>
        </div>
      </span>
    );

    const fee = Number(order.pool_id.split(V3_POOL_SPLITER)[2]);

    const feeTier = (
      <span className="text-xs text-v3SwapGray px-2.5 py-0.5 rounded-md bg-portfolioFeeBgColor ml-5">
        {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
      </span>
    );
    const sort =
      TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;
    const orderRate = useMemo(() => {
      let p = price;
      if (sort) {
        p = new BigNumber(1).dividedBy(price).toFixed();
      }
      return (
        <span className="whitespace-nowrap flex items-start xs:flex-row xs:items-center flex-col w-32">
          <span className="mr-1 text-white text-sm" title={p}>
            {toPrecision(p, 2)}
          </span>
          <span className="text-v3SwapGray text-xs xs:hidden">
            {`${toRealSymbol(
              sort ? sellToken?.symbol : buyToken.symbol
            )}/${toRealSymbol(sort ? buyToken.symbol : sellToken.symbol)}`}
          </span>
          <span className="text-white text-sm lg:hidden md:hidden">
            {`${toRealSymbol(sort ? sellToken.symbol : buyToken.symbol)}`}
          </span>
        </span>
      );
    }, [buyToken, sellToken, price]);

    const unclaimTip = (
      <div
        className="text-xs xs:relative xs:bottom-2 mt-1 mr-1 w-32 xs:w-full flex items-center xs:flex-row-reverse"
        data-type="info"
        data-place="bottom"
        data-multiline={true}
        data-class="reactTip"
        data-html={true}
        data-tip={getUnclaimAmountTip()}
        data-for={'unclaim_tip_' + order.order_id}
      >
        <span className="mr-1 xs:ml-2">
          <QuestionMark color="dark" />
        </span>
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
                className={`mx-px h-1 xs:h-2 rounded-lg ${bgColor}`}
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
      <span className="flex items-center w-36 whitespace-nowrap">
        <div className="xs:hidden">{unclaimTip}</div>
      </span>
    );

    const created = (
      <div className="flex items-center justify-end text-xs text-v3SwapGray">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
        <span className="ml-1">created</span>
      </div>
    );

    const tokenPrice = useContext(PriceContext);

    const sellTokenPrice = tokenPrice?.[sellToken.id]?.price || null;

    const swapBanner = (
      <div>
        <div className="flex items-center justify-between mb-6">
          <span className="flex items-center text-sm text-v3SwapGray">
            <FormattedMessage
              id="initial_order"
              defaultMessage={'Initial Order'}
            />
            <ExclamationTip
              id="this_order_has_been_partially_filled"
              defaultMessage="This order has been partially filled "
              dataPlace="right"
              colorhex="#7E8A93"
            />
          </span>

          <span className="flex items-center text-sm text-v3SwapGray">
            <div className="flex items-center w-28">
              <span title={totalIn} className="text-white xs:text-v3SwapGray">
                {Number(totalIn) > 0 && Number(totalIn) < 0.01
                  ? '< 0.01'
                  : toPrecision(totalIn, 2)}
              </span>
              <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            </div>
            <span className="mx-2 text-white xs:text-v3SwapGray">
              {isClientMobie() ? (
                <MyOrderInstantSwapArrowRight />
              ) : (
                <MyOrderInstantSwapArrowRight />
              )}
            </span>
            <div className="flex items-center w-40 justify-end">
              <span
                title={toPrecision(totalOut, buyToken.decimals)}
                className="text-white xs:text-v3SwapGray"
              >
                {Number(totalOut) > 0 && Number(totalOut) < 0.01
                  ? '< 0.01'
                  : toPrecision(totalOut, 2)}
              </span>

              <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
            </div>
          </span>
        </div>

        <div
          className={`flex items-center justify-between mb-6 ${
            ONLY_ZEROS.test(swapIn || '0') ? 'hidden' : ''
          }`}
        >
          <span className="flex items-center text-sm text-v3SwapGray">
            Instant Swap
            <ExclamationTip
              colorhex="#7E8A93"
              id={`1 ${toRealSymbol(sellToken.symbol)} ${
                sellTokenPrice ? `($${toPrecision(sellTokenPrice, 2)})` : ''
              } = 
                ${new Big(swapOut)
                  .div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn)
                  .toFixed(3)} ${toRealSymbol(buyToken.symbol)}
                `}
              defaultMessage={`1 ${toRealSymbol(sellToken.symbol)} ${
                sellTokenPrice ? `($${toPrecision(sellTokenPrice, 2)})` : ''
              } = 
                ${new Big(swapOut)
                  .div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn)
                  .toFixed(3)} ${toRealSymbol(buyToken.symbol)}
                `}
            />
          </span>

          <span className="flex items-center text-sm text-v3SwapGray">
            <BsCheckCircle className="mr-3" fill="#42bb17" stroke="#42BB17" />
            <div className="flex items-center w-28">
              <span title={swapIn} className="text-v3SwapGray">
                {Number(swapIn) > 0 && Number(swapIn) < 0.01
                  ? '< 0.01'
                  : toPrecision(swapIn, 2)}
              </span>

              <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            </div>
            <span className="mx-2 text-v3SwapGray">
              {isClientMobie() ? (
                <MyOrderInstantSwapArrowRight />
              ) : (
                <MyOrderInstantSwapArrowRight />
              )}
            </span>
            <div className="flex items-end justify-end w-40">
              <span title={swapOut} className="text-v3SwapGray">
                {Number(swapOut) > 0 && Number(swapOut) < 0.01
                  ? '< 0.01'
                  : toPrecision(swapOut, 2)}
              </span>

              <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
            </div>
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm text-v3SwapGray">Executed</span>
          <div className="flex items-center">
            <PurpleCircleIcon className="mr-3"></PurpleCircleIcon>
            <div className="w-28">
              <span title={orderIn} className="text-white text-sm">
                {Number(orderIn) > 0 && Number(orderIn) < 0.01
                  ? '< 0.01'
                  : toPrecision(orderIn, 2)}
              </span>
              <span className="ml-1.5 text-v3SwapGray text-sm">
                {toRealSymbol(sellToken.symbol)}
              </span>
            </div>
            <span className="mx-2 text-v3SwapGray">
              {isClientMobie() ? (
                <MyOrderInstantSwapArrowRight />
              ) : (
                <MyOrderInstantSwapArrowRight />
              )}
            </span>
            <div className="flex items-center justify-end w-40">
              <span
                title={buyAmount}
                className="flex items-center text-sm text-white"
              >
                <label className="text-sm text-greenColor">
                  {Number(claimedAmount) > 0 && Number(claimedAmount) < 0.001
                    ? '< 0.001'
                    : toPrecision(claimedAmount, 3)}
                </label>
                /
                {Number(buyAmount) > 0 && Number(buyAmount) < 0.01
                  ? '< 0.01'
                  : toPrecision(buyAmount, 2)}
              </span>
              <span className="ml-1.5 text-sm text-v3SwapGray">
                {toRealSymbol(buyToken.symbol)}
              </span>
            </div>
          </div>
        </div>
      </div>
    );

    const MobileInfoBanner = ({
      text,
      value,
    }: {
      text: string | JSX.Element;
      value: string | JSX.Element;
    }) => {
      return (
        <div className="flex mb-4 items-center justify-between whitespace-nowrap">
          <span className="text-xs text-v3SwapGray">{text}</span>
          <span className="text-white text-sm">{value}</span>
        </div>
      );
    };

    return (
      <>
        {/* PC */}
        <div
          className={`rounded-xl mt-3 bg-portfolioBgColor px-5 ${
            switch_off ? '' : 'pb-4'
          }`}
        >
          <div className={`flex items-center justify-between h-14`}>
            <div className="flex items-center">
              {sellTokenAmount}
              {buyTokenAmount}
              {feeTier}
            </div>
            <div className="flex items-center">
              {orderRate}
              {unclaim}
              <UpDownButton
                set_switch_off={set_switch_off}
                switch_off={switch_off}
              ></UpDownButton>
            </div>
          </div>
          <div className={`${switch_off ? 'hidden' : ''}`}>
            <div className="flex items-center text-sm text-v3SwapGray ml-2">
              Order Progress
            </div>
            <div className="bg-primaryText rounded-xl px-3.5 py-5 bg-opacity-10 mt-3 mb-4">
              {swapBanner}
            </div>
            {created}
          </div>
        </div>
        {/* Mobile */}
        <div
          className="w-full mb-4 md:hidden lg:hidden"
          style={{
            zIndex: 20 - index,
          }}
        >
          {/* title */}
          <div className="rounded-t-xl bg-orderMobileTop px-3 pt-3">
            <div className="flex items-center relative justify-between">
              {sellTokenAmount}
              <MyOrderMobileArrow />
              {buyTokenAmount}
            </div>

            {created}
          </div>
          {/*  content */}
          <div className="rounded-b-xl p-3 bg-cardBg">
            <MobileInfoBanner
              text={
                <FormattedMessage id="fee_tiers" defaultMessage={'Fee Tiers'} />
              }
              value={feeTier}
            />

            <MobileInfoBanner
              text={`1 ${toRealSymbol(
                sort ? buyToken.symbol : tokensMap[order.sell_token].symbol
              )} Price`}
              value={orderRate}
            />

            <MobileInfoBanner
              text={
                <FormattedMessage
                  defaultMessage={'Claimed'}
                  id="claimed_upper"
                />
              }
              value={unclaim}
            />

            {unclaimTip}
          </div>

          {/* swap banner */}
          {!ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null}
        </div>
      </>
    );
  }

  const activeOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (activeSortBy === 'created') {
      return sortOrderActive === 'desc'
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (activeSortBy === 'unclaim') {
      const unclaimA = toReadableNumber(
        tokensMap[a.buy_token].decimals,
        a.unclaimed_amount
      );
      const unclaimB = toReadableNumber(
        tokensMap[b.buy_token].decimals,
        b.unclaimed_amount
      );

      return sortOrderActive === 'desc'
        ? Number(unclaimB) - Number(unclaimA)
        : Number(unclaimA) - Number(unclaimB);
    }
  };
  const loading_status =
    (!activeOrder ||
      (activeOrder.length > 0 && Object.keys(tokensMap || {}).length == 0)) &&
    isSignedIn;
  const noData_status = !activeOrder || activeOrder.length === 0;
  return (
    <div className="flex flex-col">
      {loading_status ? (
        <div className="flex items-center justify-center my-20">
          <BlueCircleLoading></BlueCircleLoading>
        </div>
      ) : (
        <>
          {noData_status ? (
            <NoDataCard text="Your active order(s) will appear here." />
          ) : (
            <>
              {activeOrder ? (
                <>
                  <div
                    className={`flex items-center justify-between  px-6 xs:hidden text-v3SwapGray text-sm  whitespace-nowrap`}
                  >
                    <div className="flex items-center">
                      <span className="text-left">
                        <FormattedMessage
                          id="you_sell"
                          defaultMessage={'You Sell'}
                        />
                      </span>

                      <span className="ml-20">
                        <FormattedMessage
                          id="you_buy"
                          defaultMessage={'You Buy'}
                        />
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="w-32">@Price</span>
                      <span className="w-40 mr-1">Execute Status</span>
                    </div>
                  </div>
                  {activeOrder.sort(activeOrderSorting).map((order, index) => {
                    return (
                      <ActiveLine
                        index={index}
                        key={order.order_id}
                        order={order}
                      />
                    );
                  })}
                </>
              ) : null}
            </>
          )}
        </>
      )}
    </div>
  );
}
