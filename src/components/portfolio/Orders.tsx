import React, { useEffect, useMemo, useState, useContext } from 'react';
import { useMyOrders } from '../../state/swapV3';
import { useTokens } from '../../state/token';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from '../../services/swapV3';
import {
  calculateFeePercent,
  ONLY_ZEROS,
  toPrecision,
} from 'src/utils/numbers';

import { BsCheckCircle } from '../reactIcons';

import {
  toReadableNumber,
  scientificNotationToString,
  checkAllocations,
} from '../../utils/numbers';
import { TokenMetadata } from '../../services/ft-contract';
import Big from 'big.js';
import { TIMESTAMP_DIVISOR } from '../../components/layout/Proposal';
import moment from 'moment';
import QuestionMark from '../../components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { toRealSymbol } from '../../utils/token';
import { ExclamationTip } from '../../components/layout/TipWrapper';
import { MyOrderInstantSwapArrowRight } from '../../components/icon/swapV3';
import { TOKEN_LIST_FOR_RATE, openUrl } from '../../services/commonV3';
import { getLimitOrderLogsByAccount } from '../../services/indexer';
import {
  PurpleCircleIcon,
  LinkIcon,
  ArrowRightForOrder,
  GreenCircleIcon,
} from '../../components/icon/Portfolio';
import BigNumber from 'bignumber.js';
import { PortfolioData } from '../../pages/Portfolio';
import { BlueCircleLoading } from '../../components/layout/Loading';
import {
  UpDownButton,
  NoDataCard,
  useTotalOrderData,
  getAccountId,
} from './Tool';
import { WalletContext } from '../../utils/wallets-integration';
import getConfig from 'src/services/config';
import { isMobile } from 'src/utils/device';
import { SWAP_MODE_KEY, SWAP_MODE } from '../../pages/SwapPage';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
const is_mobile = isMobile();
const { explorerUrl } = getConfig();

export default function Orders(props: any) {
  const {
    tokenPriceList,
    set_active_order_value_done,
    set_active_order_Loading_done,
    set_active_order_quanity,
    set_active_order_value,
  } = useContext(PortfolioData);
  const { activeOrder, activeOrderDone } = useMyOrders();
  const [activeOrderTxMap, setActiveOrderTxMap] = useState({});
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
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      getLimitOrderLogsByAccount()
        .then((res) => {
          const temp_map = res.reduce((acc, cur) => {
            const { order_id, tx_id } = cur;
            return {
              ...acc,
              [order_id]: tx_id,
            };
          }, {});
          setActiveOrderTxMap(temp_map);
        })
        .catch();
    }
  }, [isSignedIn]);
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
  return (
    <>
      <OrderCard
        tokensMap={tokensMap}
        activeOrder={activeOrder}
        activeOrderTxMap={activeOrderTxMap}
      />
    </>
  );
}
function OrderCard({
  activeOrder,
  tokensMap,
  activeOrderTxMap,
}: {
  activeOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
  activeOrderTxMap: Record<string, string>;
}) {
  const {
    activeTab,
    setActiveTab,
    active_order_value_done,
    active_order_Loading_done,
    active_order_quanity,
    active_order_value,
  } = useContext(PortfolioData);
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  const intl = useIntl();
  const [activeSortBy, setActiveSortBy] = useState<'unclaim' | 'created'>(
    'created'
  );
  const [sortOrderActive, setSorOrderActive] = useState<'asc' | 'desc'>('desc');
  const { total_active_orders_value, total_active_orders_quanity } =
    useTotalOrderData({
      active_order_value_done,
      active_order_Loading_done,
      active_order_quanity,
      active_order_value,
    });
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
    const p = new Big(price).eq(0) ? '1' : price;
    const sell_amount = new Big(
      toReadableNumber(
        tokensMap[order.buy_token].decimals,
        undecimaled_amount || '0'
      )
    )
      .div(p)
      .toFixed(tokensMap[order.buy_token].decimals);

    // return scientificNotationToString(sell_amount);
    return display_amount(sell_amount);
  };
  function display_amount(amount: string) {
    try {
      if (new Big(amount).eq(0)) {
        return '0';
      } else if (Number(amount) > 0 && Number(amount) < 0.01) {
        return '< 0.01';
      } else {
        return toPrecision(amount, 2);
      }
    } catch (error) {
      return amount;
    }
  }
  function display_amount_3_decimal(amount: string) {
    if (new Big(amount).eq(0)) {
      return '0';
    } else if (Number(amount) > 0 && Number(amount) < 0.001) {
      return '< 0.001';
    } else {
      return toPrecision(amount, 3);
    }
  }
  function ActiveLine({
    order,
    index,
  }: {
    order: UserOrderInfo;
    index: number;
  }) {
    const tx_record = activeOrderTxMap[order.order_id];
    const { tokenPriceList } = useContext(PortfolioData);
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

    const unDecimals_claimedAmount = new Big(order.bought_amount || '0')
      .minus(order.unclaimed_amount || '0')
      .toString();
    const claimedAmount = toReadableNumber(
      buyToken.decimals,
      scientificNotationToString(unDecimals_claimedAmount)
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
            ${display_amount_3_decimal(claimedAmount)}
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
            ${display_amount_3_decimal(unClaimedAmount)}
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
            ${display_amount_3_decimal(pendingAmount)}

            </span>

        </div>`
        }

        </div>
    `;
    };

    const sellAmountToClaimedAmount = buyAmountToSellAmount(
      unDecimals_claimedAmount,
      order,
      price
    );

    const sellAmountToUnClaimedAmount =
      displayPercents[1] == '100'
        ? display_amount(orderIn)
        : buyAmountToSellAmount(order.unclaimed_amount || '0', order, price);
    const sellTokenAmount = (
      <div className="flex items-center whitespace-nowrap w-28 justify-between xsm:w-1 xsm:flex-grow">
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
      <span className="flex items-center ml-6 xsm:w-1 xsm:flex-grow xsm:m-0 xsm:justify-end">
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
        className="text-xs mt-1 mr-1 w-40 xs:w-full xsm:mt-0 xsm:mr-0 flex items-center xs:flex-row-reverse"
        data-type="info"
        data-place="bottom"
        data-multiline={true}
        data-class="reactTip"
        data-tooltip-html={getUnclaimAmountTip()}
        data-tooltip-id={'unclaim_tip_' + order.order_id}
      >
        <span className="mr-1 xsm:ml-2.5 xsm:mr-3.5">
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
                key={i}
                className={`mx-px h-1 xs:h-2 rounded-lg ${bgColor}`}
                style={{
                  width: p + '%',
                }}
              />
            );
          })}
        </div>
        <CustomTooltip
          className="w-20"
          id={'unclaim_tip_' + order.order_id}
          place="bottom"
        />
      </div>
    );

    const unclaim = (
      <span className="flex items-center w-44 whitespace-nowrap mr-1">
        <div className="xs:hidden">{unclaimTip}</div>
      </span>
    );
    const created = (
      <div className="flex items-center justify-end text-xs text-v3SwapGray">
        <span className="mr-1">
          <FormattedMessage id="created" />
        </span>
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
        <LinkIcon
          onClick={() => {
            const txHash = activeOrderTxMap[order.order_id];
            openUrl(`${explorerUrl}/txns/${txHash}`);
          }}
          className={`ml-1.5 text-v3SwapGray cursor-pointer hover:text-white ${
            tx_record ? '' : 'hidden'
          }`}
        ></LinkIcon>
      </div>
    );

    const sellTokenPrice = tokenPriceList?.[sellToken.id]?.price || null;
    const buyTokenPrice = tokenPriceList?.[buyToken.id]?.price || null;
    function instant_swap_tip() {
      const token_sell_symbol = toRealSymbol(sellToken.symbol);
      const token_buy_symbol = toRealSymbol(buyToken.symbol);
      const sell_token_price = sellTokenPrice
        ? `($${toPrecision(sellTokenPrice, 2)})`
        : '';
      const buy_token_price = buyTokenPrice
        ? `($${toPrecision(buyTokenPrice, 2)})`
        : '';
      let rate = new Big(swapOut).div(ONLY_ZEROS.test(swapIn) ? 1 : swapIn);
      if (sort) {
        rate = new Big(1).div(rate.eq(0) ? '1' : rate);
      }
      const display_rate = rate.toFixed(3);
      let result = '';
      if (sort) {
        result = `1 ${token_buy_symbol} ${buy_token_price} = ${display_rate} ${token_sell_symbol}`;
      } else {
        result = `1 ${token_sell_symbol} ${sell_token_price} = ${display_rate} ${token_buy_symbol}`;
      }
      return result;
    }
    const swapBanner = (
      <div>
        <div
          className={`flex items-center justify-between mb-6 ${
            ONLY_ZEROS.test(swapIn || '0') ? 'hidden' : ''
          }`}
        >
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
                {display_amount(totalIn)}
              </span>
              <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            </div>
            <span className="mx-2 text-white xs:text-v3SwapGray">
              <MyOrderInstantSwapArrowRight />
            </span>
            <div className="flex items-center w-40 justify-end">
              <span
                title={toPrecision(totalOut, buyToken.decimals)}
                className="text-white xs:text-v3SwapGray"
              >
                {display_amount(totalOut)}
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
            <FormattedMessage id="instant_swap" />
            <ExclamationTip
              colorhex="#7E8A93"
              id={instant_swap_tip()}
              defaultMessage={instant_swap_tip()}
            />
          </span>

          <div className="flex items-center text-sm text-v3SwapGray">
            <div className="flex items-center w-24">
              <BsCheckCircle fill="#42bb17" stroke="#42BB17" />
              <span className="text-xs text-v3SwapGray ml-1.5">
                <FormattedMessage id="swapped" />
              </span>
            </div>
            <div className="flex items-center w-28">
              <span title={swapIn} className="text-white">
                {display_amount(swapIn)}
              </span>

              <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            </div>
            <span className="mx-2 text-v3SwapGray">
              <MyOrderInstantSwapArrowRight />
            </span>
            <div className="flex items-end justify-end w-40">
              <span title={swapOut} className="text-white">
                {display_amount(swapOut)}
              </span>

              <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-start justify-between">
          <span className="text-sm text-v3SwapGray">
            <FormattedMessage id="executing" />
          </span>
          <div>
            <div className="flex items-center mb-6">
              <div className="flex items-center w-24">
                <GreenCircleIcon></GreenCircleIcon>
                <span className="text-xs text-v3SwapGray ml-1.5">
                  <FormattedMessage id="claimed_upper" />
                </span>
              </div>
              <div className="flex items-center w-28">
                <span
                  title={sellAmountToClaimedAmount}
                  className="text-white text-sm"
                >
                  {display_amount(sellAmountToClaimedAmount)}
                </span>
                <span className="ml-1.5 text-v3SwapGray text-sm">
                  {toRealSymbol(sellToken.symbol)}
                </span>
              </div>
              <span className="mx-2 text-v3SwapGray">
                <MyOrderInstantSwapArrowRight />
              </span>
              <div className="flex items-center justify-end w-40">
                <span title={claimedAmount} className="text-sm text-white">
                  {display_amount(claimedAmount)}
                </span>
                <span className="ml-1.5 text-sm text-v3SwapGray">
                  {toRealSymbol(buyToken.symbol)}
                </span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center w-24">
                <PurpleCircleIcon></PurpleCircleIcon>
                <span className="text-xs text-v3SwapGray ml-1.5">
                  <FormattedMessage id="filled" />
                </span>
              </div>
              <div className="flex items-center w-28">
                <span
                  title={sellAmountToUnClaimedAmount}
                  className="text-white text-sm"
                >
                  {sellAmountToUnClaimedAmount}
                </span>
                <span className="ml-1.5 text-v3SwapGray text-sm">
                  {toRealSymbol(sellToken.symbol)}
                </span>
              </div>
              <span className="mx-2 text-v3SwapGray">
                <MyOrderInstantSwapArrowRight />
              </span>
              <div className="flex items-center justify-end w-40">
                <span title={unClaimedAmount} className="text-sm text-white">
                  {display_amount(unClaimedAmount)}
                </span>
                <span className="ml-1.5 text-sm text-v3SwapGray">
                  {toRealSymbol(buyToken.symbol)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
    const mobile_l_width = 16;
    const mobile_r_width = 12;
    const swapBannerMobile = (
      <>
        <div
          className={`flex items-center justify-between ${
            ONLY_ZEROS.test(swapIn || '0') ? 'hidden' : ''
          }`}
        >
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
          <div className="flex items-center text-sm text-v3SwapGray">
            <span
              title={totalIn}
              className={`text-white xs:text-v3SwapGray whitespace-nowrap text-right w-${mobile_l_width}`}
            >
              {display_amount(totalIn)}
            </span>
            <span className="mx-2 text-white xs:text-v3SwapGray">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              title={toPrecision(totalOut, buyToken.decimals)}
              className={`text-white xs:text-v3SwapGray text-right whitespace-nowrap w-${mobile_r_width}`}
            >
              {display_amount(totalOut)}
            </span>
          </div>
        </div>
        <div
          className={`flex items-center justify-between mt-4  ${
            ONLY_ZEROS.test(swapIn || '0') ? 'hidden' : ''
          }`}
        >
          <span className="flex items-center text-sm text-v3SwapGray">
            <FormattedMessage id="instant_swap" />
            <ExclamationTip
              colorhex="#7E8A93"
              id={instant_swap_tip()}
              defaultMessage={instant_swap_tip()}
            />
          </span>
          <div className="flex items-center text-sm text-v3SwapGray">
            <div
              className={`flex items-center justify-between whitespace-nowrap w-${mobile_l_width}`}
            >
              <BsCheckCircle className="mr-3" fill="#42bb17" stroke="#42BB17" />
              <span
                title={swapIn}
                className="text-v3SwapGray whitespace-nowrap"
              >
                {display_amount(swapIn)}
              </span>
            </div>
            <span className="mx-2 text-v3SwapGray">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              title={swapOut}
              className={`text-v3SwapGray text-right whitespace-nowrap w-${mobile_r_width}`}
            >
              {display_amount(swapOut)}
            </span>
          </div>
        </div>
        <div className={`flex items-center justify-between mt-4`}>
          <span className="flex items-center text-sm text-v3SwapGray">
            <FormattedMessage id="claimed_upper" />
          </span>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-between whitespace-nowrap w-${mobile_l_width}`}
            >
              <GreenCircleIcon className="flex-shrink-0"></GreenCircleIcon>
              <span className="text-primaryText text-sm whitespace-nowrap">
                {display_amount(sellAmountToClaimedAmount)}
              </span>
            </div>
            <span className="mx-2 text-v3SwapGray">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              className={`text-primaryText text-sm whitespace-nowrap text-right w-${mobile_r_width}`}
            >
              {display_amount(claimedAmount)}
            </span>
          </div>
        </div>
        <div className={`flex items-center justify-between mt-4 `}>
          <span className="flex items-center text-sm text-v3SwapGray">
            <FormattedMessage id="filled" />
          </span>
          <div className="flex items-center">
            <div
              className={`flex items-center justify-between whitespace-nowrap w-${mobile_l_width}`}
            >
              <PurpleCircleIcon className="flex-shrink-0"></PurpleCircleIcon>
              <span className="text-white text-sm whitespace-nowrap">
                {sellAmountToUnClaimedAmount}
              </span>
            </div>
            <span className="mx-2 text-v3SwapGray">
              <MyOrderInstantSwapArrowRight />
            </span>
            <span
              className={`text-white text-sm whitespace-nowrap text-right w-${mobile_r_width}`}
            >
              {display_amount(unClaimedAmount)}
            </span>
          </div>
        </div>
      </>
    );
    return (
      <>
        {/* PC */}
        <div
          className={`rounded-xl mt-3 bg-portfolioBgColor px-5 xsm:hidden ${
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
                set_switch_off={() => {
                  set_switch_off(!switch_off);
                }}
                switch_off={switch_off}
              ></UpDownButton>
            </div>
          </div>
          <div className={`${switch_off ? 'hidden' : ''}`}>
            <div className="bg-primaryText rounded-xl px-3.5 py-5 bg-opacity-10 mt-3 mb-4">
              {swapBanner}
            </div>
            {created}
          </div>
        </div>
        {/* Mobile */}
        <div
          className={`lg:hidden mx-5 mb-3 rounded-lg ${
            switch_off
              ? 'bg-portfolioBgColor'
              : 'border border-border_light_grey_color bg-portfolioBarBgColor'
          }`}
        >
          {/* title */}
          <div className="p-3">
            <div className="flex items-center justify-between">
              {sellTokenAmount}
              <ArrowRightForOrder></ArrowRightForOrder>
              {buyTokenAmount}
            </div>
            <div className="flex items-center justify-between mt-3.5">
              {unclaimTip}
              <UpDownButton
                set_switch_off={() => {
                  set_switch_off(!switch_off);
                }}
                switch_off={switch_off}
              ></UpDownButton>
            </div>
          </div>
          {/* content */}
          <div className={`${switch_off ? 'hidden' : ''}`}>
            <div className="pb-3">
              <div className="flex items-center justify-between p-3">
                <span className="text-sm text-v3SwapGray">
                  <FormattedMessage id="order_progress" />
                </span>
                <div className="flex items-center">
                  <div className="flex items-center text-v3SwapGray text-sm ">
                    <FormattedMessage id="from_2" />
                    <span className="text-xs text-v3SwapGray px-0.5 bg-menuMoreBgColor rounded ml-1.5">
                      {toRealSymbol(sellToken.symbol)}
                    </span>
                  </div>
                  <div className="flex items-center justify-end text-v3SwapGray text-sm w-20">
                    <FormattedMessage id="to_2" />
                    <span className="text-xs text-v3SwapGray px-0.5 bg-menuMoreBgColor rounded ml-1.5">
                      {toRealSymbol(buyToken.symbol)}
                    </span>
                  </div>
                </div>
              </div>
              <div className="px-3 py-4 border-t border-b border-limitOrderFeeTiersBorderColor">
                {swapBannerMobile}
              </div>
            </div>
            {/* created time */}
            <div className="flex items-center justify-end px-3 pb-3">
              {created}
            </div>
          </div>
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
  const noData_status =
    !loading_status && (activeOrder?.length === 0 || !isSignedIn);
  return (
    <div className="flex flex-col">
      {/* pc loading */}
      {loading_status && !is_mobile ? (
        <div className="flex items-center justify-center my-20">
          <BlueCircleLoading></BlueCircleLoading>
        </div>
      ) : null}
      {/* pc no data */}
      {noData_status && !is_mobile ? (
        <NoDataCard
          text={intl.formatMessage({ id: 'active_order_appear_here_tip' })}
        />
      ) : null}
      {/* list data */}

      {/* for pc banner */}
      <div
        className={`flex items-center justify-between  pl-6 xs:hidden text-v3SwapGray text-sm  whitespace-nowrap xsm:hidden ${
          loading_status || noData_status ? 'hidden' : ''
        }`}
      >
        <div className="flex items-center">
          <span className="text-left">
            <FormattedMessage id="you_sell" defaultMessage={'You Sell'} />
          </span>

          <span className="ml-20">
            <FormattedMessage id="you_buy" defaultMessage={'You Buy'} />
          </span>
        </div>
        <div className="flex items-center">
          <span className="w-32">
            @<FormattedMessage id="price"></FormattedMessage>
          </span>
          <div className="flex items-center justify-between w-56">
            <span className="">
              <FormattedMessage id="execute_status" />
            </span>
            <span
              onClick={() => {
                localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
                openUrl('/');
              }}
              className="flex items-center justify-center text-xs text-v3SwapGray bg-selectTokenV3BgColor rounded-md px-1.5 cursor-pointer hover:text-white py-0.5"
            >
              <FormattedMessage id="your_orders_2" />{' '}
              <LinkIcon className="ml-1"></LinkIcon>
            </span>
          </div>
        </div>
      </div>
      <div className="xsm:border-b xsm:border-cardBg">
        {/* for mobile banner */}
        <div
          className="flex items-center justify-between lg:hidden p-5"
          onClick={() => {
            setActiveTab(activeTab == '1' ? '' : '1');
          }}
        >
          <span className="text-base text-white gotham_bold">
            <FormattedMessage id="active_orders" /> (
            {total_active_orders_quanity})
          </span>
          <div className="flex items-center">
            <span className="text-base text-white gotham_bold mr-2">
              {total_active_orders_value}
            </span>
            <UpDownButton
              set_switch_off={() => {
                setActiveTab(activeTab == '1' ? '' : '1');
              }}
              switch_off={activeTab != '1'}
            ></UpDownButton>
          </div>
        </div>
        {/* for mobile loading */}
        {loading_status && is_mobile && activeTab == '1' ? (
          <div className={`flex items-center justify-center my-10`}>
            <BlueCircleLoading></BlueCircleLoading>
          </div>
        ) : null}
        {/* for mobile no data */}
        {noData_status && is_mobile && activeTab == '1' ? (
          <NoDataCard
            text={intl.formatMessage({ id: 'active_order_appear_here_tip' })}
          />
        ) : null}
        {/* your orders link for mobile */}
        <div
          className={`flex items-center mx-5 lg:hidden ${
            loading_status || noData_status || activeTab != '1' ? 'hidden' : ''
          }`}
        >
          <span
            onClick={() => {
              localStorage.setItem(SWAP_MODE_KEY, SWAP_MODE.LIMIT);
              openUrl('/');
            }}
            className="flex items-center justify-center text-xs text-v3SwapGray relative -top-3 "
          >
            <FormattedMessage id="your_orders_2" />{' '}
            <LinkIcon className="ml-1.5 transform scale-125"></LinkIcon>
          </span>
        </div>
        {/* active order list */}
        <div className={`${activeTab == '1' ? '' : 'hidden'}`}>
          {activeOrder?.sort(activeOrderSorting).map((order, index) => {
            return (
              <ActiveLine index={index} key={order.order_id} order={order} />
            );
          })}
        </div>
      </div>
    </div>
  );
}
