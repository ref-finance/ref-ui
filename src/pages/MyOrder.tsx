import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  useMemo,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { isClientMobie, useClientMobile } from 'src/utils/device';
import { SolidButton, ButtonTextWrapper } from '../components/button/Button';
import { useMyOrders } from '../state/swapV3';
import { refSwapV3OldVersionViewFunction } from '../services/near';
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from '../services/swapV3';
import { useToken, useTokens, useTokenPriceList } from '../state/token';
import { SWAP_MODE, SWAP_MODE_KEY } from './SwapPage';
import {
  MobileHistoryOrderStamp,
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '../components/icon/swapV3';
import {
  calculateFeePercent,
  ONLY_ZEROS,
  toPrecision,
} from 'src/utils/numbers';

import { BsCheckCircle } from '../components/reactIcons';

import {
  toReadableNumber,
  scientificNotationToString,
  checkAllocations,
} from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import Big from 'big.js';
import { cancel_order, cancel_order_old } from '../services/swapV3';
import { TIMESTAMP_DIVISOR } from '../components/layout/Proposal';
import moment from 'moment';
import { DownArrowVE, UpArrowVE } from '../components/icon/Referendum';
import { Loading } from 'src/components/icon/Loading';
import { RouterArrowLeft, MyOrderMobileArrow } from '../components/icon/Arrows';
import QuestionMark from '../components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { toRealSymbol } from '../utils/token';
import { QuestionTip, ExclamationTip } from '../components/layout/TipWrapper';
import { MyOrderInstantSwapArrowRight } from '../components/icon/swapV3';
import { TOKEN_LIST_FOR_RATE } from '../services/commonV3';
import BigNumber from 'bignumber.js';
import { isMobile } from '../utils/device';
import { refSwapV3ViewFunction } from '../services/near';
import { useWalletSelector } from '../context/WalletSelectorContext';
import { useHistoryOrderTx, useHistoryOrderSwapInfo } from '../state/myOrder';
import { HiOutlineExternalLink } from '../components/reactIcons';
import getConfig from 'src/services/config';
import _ from 'lodash';
import { HistoryOrderSwapInfo } from '../services/indexer';
import { REF_FI_SWAP_SWAPPAGE_TAB_KEY } from 'src/constants';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

const ORDER_TYPE_KEY = 'REF_FI_ORDER_TYPE_VALUE';

function WarningTip() {
  if (isMobile()) {
    return (
      <svg
        width="33"
        height="30"
        viewBox="0 0 17 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="mb-2"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M10.8582 1.4C9.7805 -0.466667 7.0862 -0.466663 6.00847 1.4L0.379311 11.15C-0.698409 13.0167 0.648743 15.35 2.80418 15.35H14.0625C16.218 15.35 17.5651 13.0167 16.4874 11.15L10.8582 1.4ZM7.39412 2.2C7.856 1.4 9.0107 1.4 9.47258 2.2L15.1017 11.95C15.5636 12.75 14.9863 13.75 14.0625 13.75H2.80418C1.88042 13.75 1.30307 12.75 1.76495 11.95L7.39412 2.2ZM8.84235 3.84998C8.74443 3.81541 8.63956 3.79846 8.53399 3.80015C8.42842 3.79846 8.32354 3.81541 8.22563 3.84998C8.12772 3.88455 8.03877 3.93603 7.96411 4.00134C7.88945 4.06665 7.8306 4.14446 7.79109 4.23011C7.75157 4.31577 7.7322 4.40751 7.73412 4.49986V8.51391C7.7322 8.60626 7.75157 8.698 7.79109 8.78365C7.8306 8.86931 7.88945 8.94711 7.96411 9.01243C8.03877 9.07774 8.12772 9.12922 8.22563 9.16379C8.32354 9.19835 8.42842 9.2153 8.53399 9.21362C8.63947 9.2153 8.74425 9.19838 8.84209 9.16387C8.93993 9.12936 9.02882 9.07797 9.10347 9.01276C9.17812 8.94755 9.23699 8.86986 9.27657 8.78431C9.31615 8.69877 9.33563 8.60713 9.33386 8.51486V4.49986C9.33578 4.40751 9.31641 4.31577 9.27689 4.23011C9.23738 4.14446 9.17853 4.06665 9.10387 4.00134C9.02921 3.93603 8.94026 3.88455 8.84235 3.84998ZM8.84235 10.2906C8.74443 10.256 8.63956 10.2391 8.53399 10.2408C8.32203 10.2413 8.11891 10.3151 7.96903 10.4463C7.81915 10.5774 7.7347 10.7551 7.73412 10.9405V11.5944C7.7322 11.6867 7.75157 11.7785 7.79109 11.8641C7.8306 11.9498 7.88945 12.0276 7.96411 12.0929C8.03877 12.1582 8.12772 12.2097 8.22563 12.2442C8.32354 12.2788 8.42842 12.2958 8.53399 12.2941C8.63956 12.2958 8.74443 12.2788 8.84235 12.2442C8.94026 12.2097 9.02921 12.1582 9.10387 12.0929C9.17853 12.0276 9.23738 11.9498 9.27689 11.8641C9.31641 11.7785 9.33578 11.6867 9.33386 11.5944V10.9405C9.33578 10.8481 9.31641 10.7564 9.27689 10.6707C9.23738 10.5851 9.17853 10.5073 9.10387 10.4419C9.02921 10.3766 8.94026 10.3252 8.84235 10.2906Z"
          fill="#FFA24D"
        />
      </svg>
    );
  }

  return (
    <svg
      width="17"
      height="16"
      viewBox="0 0 17 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M10.8582 1.4C9.7805 -0.466667 7.0862 -0.466663 6.00847 1.4L0.379311 11.15C-0.698409 13.0167 0.648743 15.35 2.80418 15.35H14.0625C16.218 15.35 17.5651 13.0167 16.4874 11.15L10.8582 1.4ZM7.39412 2.2C7.856 1.4 9.0107 1.4 9.47258 2.2L15.1017 11.95C15.5636 12.75 14.9863 13.75 14.0625 13.75H2.80418C1.88042 13.75 1.30307 12.75 1.76495 11.95L7.39412 2.2ZM8.84235 3.84998C8.74443 3.81541 8.63956 3.79846 8.53399 3.80015C8.42842 3.79846 8.32354 3.81541 8.22563 3.84998C8.12772 3.88455 8.03877 3.93603 7.96411 4.00134C7.88945 4.06665 7.8306 4.14446 7.79109 4.23011C7.75157 4.31577 7.7322 4.40751 7.73412 4.49986V8.51391C7.7322 8.60626 7.75157 8.698 7.79109 8.78365C7.8306 8.86931 7.88945 8.94711 7.96411 9.01243C8.03877 9.07774 8.12772 9.12922 8.22563 9.16379C8.32354 9.19835 8.42842 9.2153 8.53399 9.21362C8.63947 9.2153 8.74425 9.19838 8.84209 9.16387C8.93993 9.12936 9.02882 9.07797 9.10347 9.01276C9.17812 8.94755 9.23699 8.86986 9.27657 8.78431C9.31615 8.69877 9.33563 8.60713 9.33386 8.51486V4.49986C9.33578 4.40751 9.31641 4.31577 9.27689 4.23011C9.23738 4.14446 9.17853 4.06665 9.10387 4.00134C9.02921 3.93603 8.94026 3.88455 8.84235 3.84998ZM8.84235 10.2906C8.74443 10.256 8.63956 10.2391 8.53399 10.2408C8.32203 10.2413 8.11891 10.3151 7.96903 10.4463C7.81915 10.5774 7.7347 10.7551 7.73412 10.9405V11.5944C7.7322 11.6867 7.75157 11.7785 7.79109 11.8641C7.8306 11.9498 7.88945 12.0276 7.96411 12.0929C8.03877 12.1582 8.12772 12.2097 8.22563 12.2442C8.32354 12.2788 8.42842 12.2958 8.53399 12.2941C8.63956 12.2958 8.74443 12.2788 8.84235 12.2442C8.94026 12.2097 9.02921 12.1582 9.10387 12.0929C9.17853 12.0276 9.23738 11.9498 9.27689 11.8641C9.31641 11.7785 9.33578 11.6867 9.33386 11.5944V10.9405C9.33578 10.8481 9.31641 10.7564 9.27689 10.6707C9.23738 10.5851 9.17853 10.5073 9.10387 10.4419C9.02921 10.3766 8.94026 10.3252 8.84235 10.2906Z"
        fill="#FFA24D"
      />
    </svg>
  );
}

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

function HistoryLine({
  order,
  index,
  tokensMap,
  sellAmountToBuyAmount,
  orderTx,
}: {
  order: UserOrderInfo;
  index: number;
  tokensMap: { [key: string]: TokenMetadata };
  sellAmountToBuyAmount: any;
  orderTx: string;
}) {
  const [hover, setHover] = useState<boolean>(false);

  const intl = useIntl();

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

  const claimedAmount = toReadableNumber(
    buyToken.decimals,
    order.bought_amount || '0'
  );

  const cancelAmount = sellAmountToBuyAmount(order.cancel_amount, order, price);

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
    pClaimedAmount > 0 && pClaimedAmount < 5
      ? '5'
      : scientificNotationToString(pClaimedAmount.toString()),
    pCancelAmount > 0 && pCancelAmount < 5
      ? '5'
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
        ONLY_ZEROS.test(cancelAmount)
          ? ''
          : `<div class="flex items-center my-1 justify-between">
          <span class="flex items-center ">
              <div class="w-1.5 h-1.5 rounded-full bg-primaryText mr-1">
              </div>

              ${intl.formatMessage({
                id: 'canceled',
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
    <span className="flex items-center col-span-1 ml-8">
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
    <span className="col-span-2 ml-10 xs:ml-0  text-v3Blue xs:text-white">
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
      <span className="whitespace-nowrap col-span-1 flex items-end xs:flex-row xs:items-center flex-col relative right-4 xs:right-0">
        <span className="mr-1 text-white text-sm" title={p}>
          {toPrecision(p, 2)}
        </span>
        <span className="text-v3SwapGray text-xs xs:hidden">
          {`${toRealSymbol(
            sort ? sellToken.symbol : buyToken.symbol
          )}/${toRealSymbol(sort ? buyToken.symbol : sellToken.symbol)}`}
        </span>
        <span className="text-white text-sm lg:hidden md:hidden">
          {`${toRealSymbol(sort ? sellToken.symbol : buyToken.symbol)}`}
        </span>
      </span>
    );
  }, [price, buyToken, sellToken]);

  const claimTip = (
    <div
      className="text-xs xs:relative xs:bottom-2 mt-1 mr-1 w-20 xs:w-full flex items-center xs:flex-row-reverse"
      data-type="info"
      data-place="bottom"
      data-multiline={true}
      data-class="reactTip"
      data-tooltip-html={getClaimAmountTip()}
      data-tooltip-id={'claim_tip_' + order.order_id}
    >
      <span className="mr-1 xs:ml-2">
        <QuestionMark color="dark" />
      </span>
      <div className="flex items-center w-full">
        {displayPercents.map((p, i) => {
          if (ONLY_ZEROS.test(p)) return null;

          const bgColor = i === 0 ? 'bg-gradientFrom' : 'bg-primaryText';

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
      <CustomTooltip
        className="w-20"
        id={'claim_tip_' + order.order_id}
        place="bottom"
      />
    </div>
  );

  const claimed = (
    <span className="whitespace-nowrap col-span-2 xs:flex-col flex items-center ml-12">
      <div>
        <div className="flex items-center xs:justify-end">
          <img
            src={buyToken.icon}
            className="border border-gradientFrom rounded-full w-4 h-4"
            alt=""
          />
          <span
            className="text-white text-sm mx-1"
            title={toReadableNumber(
              buyToken.decimals,
              order.bought_amount || '0'
            )}
          >
            {Number(
              toReadableNumber(buyToken.decimals, order.bought_amount || '0')
            ) > 0 &&
            Number(
              toReadableNumber(buyToken.decimals, order.bought_amount || '0')
            ) < 0.001
              ? '< 0.001'
              : toPrecision(
                  toReadableNumber(
                    buyToken.decimals,
                    order.bought_amount || '0'
                  ),
                  3
                )}
          </span>
        </div>
        <div className="xs:hidden">{claimTip}</div>
      </div>
    </span>
  );

  const created = (
    <span className="col-span-2 relative xs:opacity-50 xs:flex xs:items-center xs:justify-center whitespace-nowrap right-12 xs:right-0  text-white xs:text-xs xs:text-primaryText text-right">
      {moment(
        Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
      ).format('YYYY-MM-DD HH:mm')}
    </span>
  );

  const actions = (
    <div className=" col-span-1  text-primaryText  text-xs flex flex-col items-end justify-self-end p-1.5">
      <span className="flex text-sm text-white items-center whitespace-nowrap">
        {ONLY_ZEROS.test(order.cancel_amount) ? (
          <FormattedMessage id="filled" defaultMessage={'Filled'} />
        ) : new Big(order.cancel_amount).eq(order.original_deposit_amount) ? (
          <FormattedMessage id="canceled" defaultMessage={'Canceled'} />
        ) : (
          <div className="flex flex-col items-end">
            <span className="whitespace-nowrap mb-0.5">
              <FormattedMessage id="partially" defaultMessage={'Partially'} />
            </span>
            <span className="whitespace-nowrap">
              <FormattedMessage id="filled" defaultMessage={'Filled'} />
            </span>
          </div>
        )}
      </span>

      {!!orderTx && (
        <a
          className="flex items-center hover:text-white"
          href={`${getConfig().explorerUrl}/txns/${orderTx}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Tx
          <span className="ml-1.5">
            <HiOutlineExternalLink></HiOutlineExternalLink>
          </span>
        </a>
      )}
    </div>
  );

  const tokenPrice = useContext(PriceContext);

  const sellTokenPrice = tokenPrice?.[sellToken.id]?.price || null;
  const buyTokenPrice = tokenPrice?.[buyToken.id]?.price || null;
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
    <div className="xs:flex xs:flex-col whitespace-nowrap xs:bg-cardBg xs:bg-opacity-50 relative z-10 bottom-4 xs:bottom-0 w-full text-sm text-v3SwapGray bg-cardBg rounded-xl px-5 pb-5 pt-10 xs:px-3 xs:py-4 xs:text-xs">
      <div className="flex items-center justify-between mb-7 xs:mb-7">
        <span className="flex items-center">
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

        <span className="flex items-center">
          <span title={totalIn} className="text-white xs:text-v3SwapGray">
            {Number(totalIn) > 0 && Number(totalIn) < 0.01
              ? '< 0.01'
              : toPrecision(totalIn, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
          <span className="mx-6 xs:mx-2 text-white xs:text-v3SwapGray">
            {isClientMobie() ? (
              <MyOrderInstantSwapArrowRight />
            ) : (
              <MyOrderInstantSwapArrowRight />
            )}
          </span>
          <span
            title={toPrecision(totalOut, buyToken.decimals)}
            className="text-white xs:text-v3SwapGray"
          >
            {Number(totalOut) > 0 && Number(totalOut) < 0.01
              ? '< 0.01'
              : toPrecision(totalOut, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
        </span>
      </div>

      <div className="flex items-center justify-between ">
        <span className="flex items-center ">
          <FormattedMessage
            id="filled_via_swap"
            defaultMessage={'Filled via Swap'}
          />

          <ExclamationTip
            colorhex="#7E8A93"
            id={instant_swap_tip()}
            defaultMessage={instant_swap_tip()}
          />
        </span>

        <span className="flex items-center">
          <BsCheckCircle className="mr-1.5" fill="#42bb17" stroke="#42BB17" />
          <span title={swapIn} className="text-v3SwapGray">
            {Number(swapIn) > 0 && Number(swapIn) < 0.01
              ? '< 0.01'
              : toPrecision(swapIn, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
          <span className="mx-6 xs:mx-2 text-v3SwapGray">
            {isClientMobie() ? (
              <MyOrderInstantSwapArrowRight />
            ) : (
              <MyOrderInstantSwapArrowRight />
            )}
          </span>
          <span title={swapOut} className="text-v3SwapGray">
            {Number(swapOut) > 0 && Number(swapOut) < 0.01
              ? '< 0.01'
              : toPrecision(swapOut, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
        </span>
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
        <span className="text-white font-bold text-sm">{value}</span>
      </div>
    );
  };
  return (
    <>
      <div
        className="mb-4 w-full xs:hidden"
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

      <div
        className="w-full relative mb-4 md:hidden lg:hidden"
        style={{
          zIndex: 20 - index,
        }}
      >
        <MobileHistoryOrderStamp
          state={
            ONLY_ZEROS.test(order.cancel_amount)
              ? 'filled'
              : new Big(order.original_deposit_amount).eq(order.cancel_amount)
              ? 'cancel'
              : 'partially_filled'
          }
        />

        {/* title */}
        <div className="rounded-t-xl relative bg-orderMobileTop px-3 pt-3">
          <div className="absolute right-4 bottom-0.5 z-50  text-xs">
            {!!orderTx && (
              <a
                className="flex items-center bg-black text-primaryText px-1.5  bg-opacity-20 rounded "
                href={`${getConfig().explorerUrl}/txns/${orderTx}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <span className="mr-1.5">
                  <HiOutlineExternalLink></HiOutlineExternalLink>
                </span>
                Tx
              </a>
            )}
          </div>

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
              sort ? buyToken?.symbol : tokensMap[order.sell_token].symbol
            )} Price`}
            value={orderRate}
          />

          <MobileInfoBanner
            text={
              <FormattedMessage defaultMessage={'Claimed'} id="claimed_upper" />
            }
            value={claimed}
          />

          {claimTip}
        </div>

        {/* swap banner */}
        {!ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null}
      </div>
    </>
  );
}

function HistorySwapInfoLine({
  index,
  tokensMap,
  orderTx,
  token_in,
  token_out,
  pool_id,
  point,
  amount_in,
  amount_out,
  timestamp,
}: {
  index: number;
  tokensMap: { [key: string]: TokenMetadata };
  orderTx: string;
  token_in: string;
  token_out: string;
  pool_id: string;
  point: string;
  amount_in: string;
  amount_out: string;
  timestamp: string;
}) {
  const [hover, setHover] = useState<boolean>(false);

  const intl = useIntl();

  const buyToken = tokensMap[token_out];

  const sellToken = tokensMap[token_in];

  if (!buyToken || !sellToken) return null;

  const orderIn = toReadableNumber(sellToken.decimals, amount_in || '0');

  const calPoint =
    sellToken.id === pool_id.split(V3_POOL_SPLITER)[0]
      ? Number(point)
      : -Number(point);

  const price = pointToPrice({
    tokenA: sellToken,
    tokenB: buyToken,
    point: calPoint,
  });

  const buyAmount = toReadableNumber(buyToken.decimals, amount_out || '0');

  const sellTokenAmount = (
    <div className="flex items-center whitespace-nowrap w-28 justify-between">
      <span className="flex flex-shrink-0 items-center col-span-1">
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
    <span className="flex items-center col-span-1 ml-8">
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

  const fee = Number(pool_id.split(V3_POOL_SPLITER)[2]);

  const feeTier = (
    <span className="col-span-2 ml-10 xs:ml-0  text-v3Blue xs:text-white">
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
      <span className="whitespace-nowrap col-span-1 flex items-end xs:flex-row xs:items-center flex-col relative right-4 xs:right-0">
        <span className="mr-1 text-white text-sm" title={p}>
          {toPrecision(p, 2)}
        </span>
        <span className="text-v3SwapGray text-xs xs:hidden">
          {`${toRealSymbol(
            sort ? sellToken.symbol : buyToken.symbol
          )}/${toRealSymbol(sort ? buyToken.symbol : sellToken.symbol)}`}
        </span>
        <span className="text-white text-sm lg:hidden md:hidden">
          {`${toRealSymbol(sort ? sellToken.symbol : buyToken.symbol)}`}
        </span>
      </span>
    );
  }, [price, buyToken, sellToken]);

  const claimed = (
    <span className="whitespace-nowrap col-span-2 xs:flex-col flex items-center ml-12">
      <div>
        <div className="flex items-center xs:justify-end">
          <img
            src={buyToken.icon}
            className="border border-gradientFrom rounded-full w-4 h-4"
            alt=""
          />
          <span
            className="text-white text-sm mx-1"
            title={toReadableNumber(buyToken.decimals, amount_out || '0')}
          >
            {Number(toReadableNumber(buyToken.decimals, amount_out || '0')) >
              0 &&
            Number(toReadableNumber(buyToken.decimals, amount_out || '0')) <
              0.001
              ? '< 0.001'
              : toPrecision(
                  toReadableNumber(buyToken.decimals, amount_out || '0'),
                  3
                )}
          </span>
        </div>
      </div>
    </span>
  );

  const created = (
    <span className="col-span-2 relative xs:opacity-50 xs:flex xs:items-center xs:justify-center whitespace-nowrap right-12 xs:right-0  text-white xs:text-xs xs:text-primaryText text-right">
      {moment(Math.floor(Number(timestamp) / TIMESTAMP_DIVISOR) * 1000).format(
        'YYYY-MM-DD HH:mm'
      )}
    </span>
  );

  const actions = (
    <div className=" col-span-1  text-primaryText  text-xs flex flex-col items-end justify-self-end p-1.5">
      <span className="flex items-center text-sm text-white whitespace-nowrap">
        {<FormattedMessage id="executed" defaultMessage={'Executed'} />}
      </span>

      {!!orderTx && (
        <a
          className="flex items-center hover:text-white"
          href={`${getConfig().explorerUrl}/txns/${orderTx}`}
          target="_blank"
          rel="noopener noreferrer nofollow"
        >
          Tx
          <span className="ml-1.5">
            <HiOutlineExternalLink></HiOutlineExternalLink>
          </span>
        </a>
      )}
    </div>
  );

  const tokenPrice = useContext(PriceContext);

  const sellTokenPrice = tokenPrice?.[sellToken.id]?.price || null;
  const buyTokenPrice = tokenPrice?.[buyToken.id]?.price || null;

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
        <span className="text-white text-sm font-bold">{value}</span>
      </div>
    );
  };
  return (
    <>
      <div
        className="mb-4 w-full xs:hidden"
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
      </div>

      <div
        className="w-full relative mb-4 md:hidden lg:hidden"
        style={{
          zIndex: 20 - index,
        }}
      >
        <MobileHistoryOrderStamp state={'swapped'}></MobileHistoryOrderStamp>

        {/* title */}
        <div className="rounded-t-xl relative bg-orderMobileTop px-3 pt-3">
          <div className="flex items-center relative justify-between">
            {sellTokenAmount}
            <MyOrderMobileArrow />
            {buyTokenAmount}
          </div>

          {created}

          <div className="absolute right-4 bottom-0.5 z-50  text-xs">
            {!!orderTx && (
              <a
                className="flex items-center bg-black text-primaryText px-1.5  bg-opacity-20 rounded "
                href={`${getConfig().explorerUrl}/txns/${orderTx}`}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                <span className="mr-1.5">
                  <HiOutlineExternalLink></HiOutlineExternalLink>
                </span>
                Tx
              </a>
            )}
          </div>
        </div>
        {/*  content */}
        <div className="rounded-b-xl p-3 pb-1 bg-cardBg">
          <MobileInfoBanner
            text={
              <FormattedMessage id="fee_tiers" defaultMessage={'Fee Tiers'} />
            }
            value={feeTier}
          />

          <MobileInfoBanner
            text={`1 ${toRealSymbol(
              sort ? buyToken?.symbol : tokensMap[token_in].symbol
            )} Price`}
            value={orderRate}
          />

          <MobileInfoBanner
            text={
              <FormattedMessage defaultMessage={'Executed'} id="executed" />
            }
            value={claimed}
          />
        </div>
      </div>
    </>
  );
}

function ActiveLine({
  tokensMap,
  order,
  index,
  sellAmountToBuyAmount,
}: {
  order: UserOrderInfo;
  index: number;
  sellAmountToBuyAmount: any;
  tokensMap: { [key: string]: TokenMetadata };
}) {
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const intl = useIntl();

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
      <span className="flex flex-shrink-0 items-center col-span-1">
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
    <span className="flex items-center col-span-1 ml-8">
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
    <span className="col-span-2 ml-10 xs:ml-0  text-v3Blue xs:text-white">
      {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
    </span>
  );

  // const orderRate = (
  //   <span className="whitespace-nowrap col-span-1 flex items-end xs:flex-row xs:items-center flex-col relative right-4 xs:right-0">
  //     <span className="mr-1 text-white text-sm" title={price}>
  //       {toPrecision(price, 2)}
  //     </span>
  //     <span className="text-v3SwapGray text-xs xs:hidden">
  //       {`${toRealSymbol(buyToken.symbol)}/${toRealSymbol(sellToken.symbol)}`}
  //     </span>

  //     <span className="text-white text-sm lg:hidden md:hidden">
  //       {`${toRealSymbol(buyToken.symbol)}`}
  //     </span>
  //   </span>
  // );
  const sort =
    TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;
  const orderRate = useMemo(() => {
    let p = price;
    if (sort) {
      p = new BigNumber(1).dividedBy(price).toFixed();
    }
    return (
      <span className="whitespace-nowrap col-span-1 flex items-end xs:flex-row xs:items-center flex-col relative right-4 xs:right-0">
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
      className="text-xs xs:relative xs:bottom-2 mt-1 mr-1 w-20 xs:w-full flex items-center xs:flex-row-reverse"
      data-type="info"
      data-place="bottom"
      data-multiline={true}
      data-class="reactTip"
      data-tooltip-html={getUnclaimAmountTip()}
      data-tooltip-id={'unclaim_tip_' + order.order_id}
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
      <CustomTooltip
        className="w-20"
        id={'unclaim_tip_' + order.order_id}
        place="bottom"
      />
    </div>
  );

  const claimButton = (
    <div
      data-type="info"
      data-place="top"
      data-multiline={true}
      data-class="reactTip"
      className="xs:w-1/2"
      data-tooltip-html={`
            <div class="text-xs opacity-50">
              <div 
                style="font-weight:400",
              >
              ${intl.formatMessage({
                id: 'v2_paused',

                defaultMessage: 'REF V2 has been paused for maintenance',
              })}
              </div>
            </div>
          `}
      data-tooltip-id="v2_paused_pool_tip_claim"
    >
      <button
        className={`rounded-lg    text-xs xs:text-sm xs:w-full ml-1.5 p-1.5 ${
          ONLY_ZEROS.test(unClaimedAmount)
            ? 'text-v3SwapGray cursor-not-allowe bg-black opacity-20 cursor-not-allowed'
            : `text-white bg-deepBlue hover:text-white hover:bg-deepBlueHover ${
                claimLoading ? ' text-white bg-deepBlueHover ' : ''
              }`
        }`}
        type="button"
        disabled={ONLY_ZEROS.test(unClaimedAmount)}
        // disabled
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
          Text={() => <FormattedMessage id="claim" defaultMessage={'Claim'} />}
          loading={claimLoading}
        ></ButtonTextWrapper>
      </button>
    </div>
  );

  const unclaim = (
    <span className="whitespace-nowrap col-span-2 flex xs:flex-col items-center ml-16">
      <div>
        <div className="flex items-center xs:justify-end">
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
              toReadableNumber(buyToken.decimals, order.unclaimed_amount || '0')
            ) > 0 &&
            Number(
              toReadableNumber(buyToken.decimals, order.unclaimed_amount || '0')
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
        <div className="xs:hidden">{unclaimTip}</div>
      </div>
      <span className="xs:hidden">{claimButton}</span>
    </span>
  );

  const created = (
    <span className="col-span-2 relative xs:flex xs:items-center xs:justify-center whitespace-nowrap right-4 xs:right-0  text-white xs:text-xs xs:text-primaryText text-right xs:opacity-50">
      {moment(
        Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
      ).format('YYYY-MM-DD HH:mm')}
    </span>
  );

  const actions = (
    <div
      data-type="info"
      className="justify-self-end xs:w-1/2"
      data-multiline={true}
      data-class="reactTip"
      data-tooltip-html={`
          <div class="text-xs opacity-50">
            <div 
              style="font-weight:400",
            >
            ${intl.formatMessage({
              id: 'v2_paused',

              defaultMessage: 'REF V2 has been paused for maintenance',
            })}
            </div>
          </div>
        `}
      data-tooltip-id="v2_paused_pool_tip_cancel"
    >
      <button
        className={`border col-span-1 rounded-lg xs:text-sm xs:w-full text-xs justify-self-end p-1.5 ${
          cancelLoading ? 'border border-transparent text-black bg-warn ' : ''
        }  border-warn border-opacity-20 text-warn  ${
          // ONLY_ZEROS.test(order.remain_amount)
          //   ? 'opacity-30 cursor-not-allowed'
          //   :

          'hover:border hover:border-transparent hover:text-black hover:bg-warn'
        }`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setCancelLoading(true);
          cancel_order({
            order_id: order.order_id,
          });
        }}
        // disabled={ONLY_ZEROS.test(order.remain_amount)}
        // disabled
      >
        <ButtonTextWrapper
          Text={() => (
            <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
          )}
          loading={cancelLoading}
        />
      </button>
    </div>
  );

  const tokenPrice = useContext(PriceContext);

  const sellTokenPrice = tokenPrice?.[sellToken.id]?.price || null;
  const buyTokenPrice = tokenPrice?.[buyToken.id]?.price || null;
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
    <div className="xs:flex xs:flex-col whitespace-nowrap xs:bg-cardBg xs:bg-opacity-50 relative z-10 bottom-4 xs:bottom-0 w-full text-sm text-v3SwapGray bg-cardBg rounded-xl px-5 pb-5 pt-10 xs:px-3 xs:py-4 xs:text-xs">
      <div className="flex items-center justify-between mb-7 xs:mb-7">
        <span className="flex items-center">
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

        <span className="flex items-center">
          <span title={totalIn} className="text-white xs:text-v3SwapGray">
            {Number(totalIn) > 0 && Number(totalIn) < 0.01
              ? '< 0.01'
              : toPrecision(totalIn, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
          <span className="mx-6 xs:mx-2 text-white xs:text-v3SwapGray">
            {isClientMobie() ? (
              <MyOrderInstantSwapArrowRight />
            ) : (
              <MyOrderInstantSwapArrowRight />
            )}
          </span>
          <span
            title={toPrecision(totalOut, buyToken.decimals)}
            className="text-white xs:text-v3SwapGray"
          >
            {Number(totalOut) > 0 && Number(totalOut) < 0.01
              ? '< 0.01'
              : toPrecision(totalOut, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
        </span>
      </div>

      <div className="flex items-center justify-between ">
        <span className="flex items-center ">
          <FormattedMessage
            id="filled_via_swap"
            defaultMessage={'Filled via Swap'}
          />

          <ExclamationTip
            colorhex="#7E8A93"
            id={instant_swap_tip()}
            defaultMessage={instant_swap_tip()}
          />
        </span>

        <span className="flex items-center">
          <BsCheckCircle className="mr-1.5" fill="#42bb17" stroke="#42BB17" />
          <span title={swapIn} className="text-v3SwapGray">
            {Number(swapIn) > 0 && Number(swapIn) < 0.01
              ? '< 0.01'
              : toPrecision(swapIn, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
          <span className="mx-6 xs:mx-2 text-v3SwapGray">
            {isClientMobie() ? (
              <MyOrderInstantSwapArrowRight />
            ) : (
              <MyOrderInstantSwapArrowRight />
            )}
          </span>
          <span title={swapOut} className="text-v3SwapGray">
            {Number(swapOut) > 0 && Number(swapOut) < 0.01
              ? '< 0.01'
              : toPrecision(swapOut, 2)}
          </span>

          <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
        </span>
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
      <div
        className="mb-4 w-full xs:hidden"
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
              <FormattedMessage defaultMessage={'Claimed'} id="claimed_upper" />
            }
            value={unclaim}
          />

          {unclaimTip}

          <div className="flex items-center w-full xs:mt-2">
            {actions}
            {claimButton}
          </div>
        </div>

        {/* swap banner */}
        {!ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null}
      </div>
    </>
  );
}

const REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO =
  'REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO';

function OrderCard({
  activeOrder,
  historyOrder,
  tokensMap,
  historySwapInfo,
}: {
  activeOrder: UserOrderInfo[];
  historyOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
  historySwapInfo: HistoryOrderSwapInfo[];
}) {
  const intl = useIntl();

  const [showHistoryInfo, setShowHistoryInfo] = useState<boolean>(
    !!sessionStorage.getItem(REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO) || false
  );

  const handleShowHistoryInfo = () => {
    setShowHistoryInfo(!showHistoryInfo);
    if (!showHistoryInfo) {
      sessionStorage.setItem(REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO, 'true');
    } else {
      sessionStorage.removeItem(REF_FI_MY_ORDER_SHOW_HISTORY_SWAP_INFO);
    }
  };

  const [orderType, setOrderType] = useState<'active' | 'history'>(
    sessionStorage.getItem(ORDER_TYPE_KEY) ||
      activeOrder?.length > 0 ||
      !historyOrder ||
      historyOrder.length === 0
      ? 'active'
      : 'history'
  );

  const orderTxs = useHistoryOrderTx();

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
      <div className="flex whitespace-nowrap xs:justify-center text-white mb-4">
        <button
          className={`mr-7 ${
            orderType === 'active' ? 'text-white' : 'text-primaryText'
          } xs:mr-10 flex flex-col items-center`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            sessionStorage.setItem(ORDER_TYPE_KEY, 'active');
            setOrderType('active');
          }}
        >
          <span>
            <FormattedMessage id="active" defaultMessage={'Active'} />
            {activeOrder && activeOrder.length > 0
              ? ` (${activeOrder.length})`
              : null}
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
          className={`${
            orderType === 'history' ? 'text-white' : 'text-primaryText'
          } flex flex-col items-center`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setOrderType('history');
            sessionStorage.setItem(ORDER_TYPE_KEY, 'history');
          }}
        >
          <span>
            <FormattedMessage id="history" defaultMessage={'History'} />
            {historyOrder && historyOrder.length > 0
              ? ` (${historyOrder.length})`
              : null}
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

  const historyOrderSorting = (a: UserOrderInfo, b: UserOrderInfo) => {
    if (historySortBy === 'created') {
      return sortOrderHistory === 'desc'
        ? Number(b.created_at) - Number(a.created_at)
        : Number(a.created_at) - Number(b.created_at);
    } else if (historySortBy === 'claimed') {
      const claimA = toReadableNumber(
        tokensMap[a.buy_token].decimals,
        a.bought_amount || '0'
      );
      const claimB = toReadableNumber(
        tokensMap[b.buy_token].decimals,
        b.bought_amount || '0'
      );

      return sortOrderHistory === 'desc'
        ? Number(claimB) - Number(claimA)
        : Number(claimA) - Number(claimB);
    }
  };

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

  function getRealTimeOrderTip() {
    const intl = useIntl();
    return `<div class=" rounded-md lg:w-p200 xs:w-44 text-primaryOrderly  text-xs  text-left">
  
      ${intl.formatMessage({
        id: 'real_time_executed_orders_tip',
        defaultMessage:
          'Real-time executed orders are orders placed using limit order function.  Here, you can check real-time executed orders that have been executed between the earliest displayed limit order in History up to the present time.',
      })}
  
    </div>`;
  }

  return (
    <div className="flex flex-col">
      {OrderTab()}
      {orderType === 'active' && (
        <div
          className={`mb-2.5 px-4 xs:hidden ${
            !activeOrder || activeOrder.length === 0 ? 'hidden' : ''
          } text-v3SwapGray text-sm grid grid-cols-10 whitespace-nowrap`}
        >
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
            className="col-span-2 flex items-center ml-28"
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
            className="col-span-2 flex items-center ml-16 text-right"
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
            <FormattedMessage id="executed" defaultMessage={'Executed'} />
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
        <div
          className={`mb-2.5 px-4 xs:hidden ${
            !historyOrder || historyOrder.length === 0 ? 'hidden' : ''
          } text-v3SwapGray text-sm grid grid-cols-10 whitespace-nowrap`}
        >
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
            <FormattedMessage id="executed" defaultMessage={'Executed'} />
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
            <ActiveLine
              tokensMap={tokensMap}
              sellAmountToBuyAmount={sellAmountToBuyAmount}
              index={index}
              key={order.order_id}
              order={order}
            />
          );
        })}
      {orderType === 'history' &&
        historyOrder &&
        historyOrder.sort(historyOrderSorting).map((order, index) => {
          return (
            <HistoryLine
              index={index}
              key={order.order_id}
              order={order}
              tokensMap={tokensMap}
              sellAmountToBuyAmount={sellAmountToBuyAmount}
              orderTx={
                orderTxs?.find((t) => t.order_id === order.order_id)?.tx_id ||
                ''
              }
            />
          );
        })}
      {orderType === 'history' &&
        historySwapInfo &&
        historySwapInfo.length > 0 && (
          <div
            className="inline-flex max-w-max items-center ml-4 text-primaryText mt-7  mb-3"
            data-class="reactTip"
            data-tooltip-id={'real_time_order_tip'}
            data-html={true}
            data-place={'top'}
            data-tip={getRealTimeOrderTip()}
          >
            <span
              className={`underline cursor-pointer ${'lg:hover:text-white'} `}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleShowHistoryInfo();
              }}
              style={{
                textDecorationThickness: '1px',
              }}
            >
              {intl.formatMessage({
                id: showHistoryInfo ? 'hide' : 'show',
                defaultMessage: showHistoryInfo ? 'Hide' : 'Show',
              })}
            </span>

            <span className="ml-1">
              {intl.formatMessage({
                id: 'real_time_executed_orders',
                defaultMessage: 'real-time executed orders',
              })}
            </span>
            <CustomTooltip id={'real_time_order_tip'} place="top" />
          </div>
        )}
      {orderType === 'history' &&
        showHistoryInfo &&
        historySwapInfo &&
        historySwapInfo.length > 0 &&
        historySwapInfo
          .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
          .map((sf, i) => {
            return (
              <HistorySwapInfoLine
                index={i}
                tokensMap={tokensMap}
                key={sf.tx_id}
                token_in={sf.token_in}
                token_out={sf.token_out}
                amount_in={sf.amount_in}
                amount_out={sf.amount_out}
                orderTx={sf.tx_id}
                timestamp={sf.timestamp}
                point={sf.point}
                pool_id={sf.pool_id}
              />
            );
          })}
    </div>
  );
}

function OrderCardOld({
  activeOrder,
  tokensMap,
}: {
  activeOrder: UserOrderInfo[];
  tokensMap: { [key: string]: TokenMetadata };
}) {
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
        <span className="flex flex-shrink-0 items-center col-span-1">
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
      <span className="flex items-center col-span-1 ml-8">
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
      <span className="col-span-2 ml-10 xs:ml-0  text-v3Blue xs:text-white">
        {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
      </span>
    );

    // const orderRate = (
    //   <span className="whitespace-nowrap col-span-1 flex items-end xs:flex-row xs:items-center flex-col relative right-4 xs:right-0">
    //     <span className="mr-1 text-white text-sm" title={price}>
    //       {toPrecision(price, 2)}
    //     </span>
    //     <span className="text-v3SwapGray text-xs xs:hidden">
    //       {`${toRealSymbol(buyToken.symbol)}/${toRealSymbol(sellToken.symbol)}`}
    //     </span>

    //     <span className="text-white text-sm lg:hidden md:hidden">
    //       {`${toRealSymbol(buyToken.symbol)}`}
    //     </span>
    //   </span>
    // );
    const sort =
      TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;
    const orderRate = useMemo(() => {
      let p = price;
      if (sort) {
        p = new BigNumber(1).dividedBy(price).toFixed();
      }
      return (
        <span className="whitespace-nowrap col-span-1 flex items-end xs:flex-row xs:items-center flex-col relative right-4 xs:right-0">
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
        className="text-xs xs:relative xs:bottom-2 mt-1 mr-1 w-20 xs:w-full flex items-center xs:flex-row-reverse"
        data-type="info"
        data-place="bottom"
        data-multiline={true}
        data-class="reactTip"
        data-tooltip-html={getUnclaimAmountTip()}
        data-tooltip-id={'unclaim_tip_' + order.order_id}
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
        <CustomTooltip
          className="w-20"
          id={'unclaim_tip_' + order.order_id}
          place="bottom"
        />
      </div>
    );

    const claimButton = (
      <div
        data-type="info"
        data-place="top"
        data-multiline={true}
        data-class="reactTip"
        className="xs:w-1/2"
        data-tooltip-html={`
              <div class="text-xs opacity-50">
                <div 
                  style="font-weight:400",
                >
                ${intl.formatMessage({
                  id: 'v2_paused',

                  defaultMessage: 'REF V2 has been paused for maintenance',
                })}
                </div>
              </div>
            `}
        data-tooltip-id="v2_paused_pool_tip_claim"
      >
        <button
          className={`rounded-lg    text-xs xs:text-sm xs:w-full ml-1.5 p-1.5 ${
            ONLY_ZEROS.test(unClaimedAmount) || true
              ? 'text-v3SwapGray cursor-not-allowe bg-black opacity-20 cursor-not-allowed'
              : `text-white bg-deepBlue hover:text-white hover:bg-deepBlueHover ${
                  claimLoading ? ' text-white bg-deepBlueHover ' : ''
                }`
          }`}
          type="button"
          // disabled={ONLY_ZEROS.test(unClaimedAmount)}
          disabled
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
      </div>
    );

    const unclaim = (
      <span className="whitespace-nowrap col-span-2 flex xs:flex-col items-center ml-16">
        <div>
          <div className="flex items-center xs:justify-end">
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
          <div className="xs:hidden">{unclaimTip}</div>
        </div>
        <span className="xs:hidden">{claimButton}</span>
      </span>
    );

    const created = (
      <span className="col-span-2 relative xs:flex xs:items-center xs:justify-center whitespace-nowrap right-2 xs:right-0  text-white xs:text-xs xs:text-primaryText text-right xs:opacity-50">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
      </span>
    );

    const actions = (
      <div
        data-type="info"
        className="justify-self-end xs:w-1/2"
        data-multiline={true}
        data-class="reactTip"
        data-tooltip-html={`
            <div class="text-xs opacity-50">
              <div 
                style="font-weight:400; max-width: 178px",
              >
              Canceling will automatically claim your executed tokens.
              </div>
            </div>
          `}
        data-tooltip-id="v2_paused_pool_tip_cancel_old"
      >
        <button
          className={`border col-span-1 rounded-lg xs:text-sm xs:w-full text-xs justify-self-end p-1.5 ${
            cancelLoading ? 'border border-transparent text-black bg-warn ' : ''
          }  border-warn border-opacity-20 text-warn  ${
            // ONLY_ZEROS.test(order.remain_amount)
            //   ? 'opacity-30 cursor-not-allowed'
            //   :

            'hover:border hover:border-transparent hover:text-black hover:bg-warn'
          }`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setCancelLoading(true);
            cancel_order_old({
              order_id: order.order_id,
            });
          }}
          // disabled={ONLY_ZEROS.test(order.remain_amount)}
          // disabled
        >
          <ButtonTextWrapper
            Text={() => (
              <FormattedMessage id="cancel" defaultMessage={'Cancel'} />
            )}
            loading={cancelLoading}
          />
        </button>

        <CustomTooltip
          className="w-20"
          id="v2_paused_pool_tip_cancel_old"
          place={isMobile() ? 'right' : 'top'}
        />
      </div>
    );

    const tokenPrice = useContext(PriceContext);

    const sellTokenPrice = tokenPrice?.[sellToken.id]?.price || null;
    const buyTokenPrice = tokenPrice?.[buyToken.id]?.price || null;
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
      <div className="xs:flex xs:flex-col whitespace-nowrap xs:bg-cardBg xs:bg-opacity-50 relative z-10 bottom-4 xs:bottom-0 w-full text-sm text-v3SwapGray bg-cardBg rounded-xl px-5 pb-5 pt-10 xs:px-3 xs:py-4 xs:text-xs">
        <div className="flex items-center justify-between mb-7 xs:mb-7">
          <span className="flex items-center">
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

          <span className="flex items-center">
            <span title={totalIn} className="text-white xs:text-v3SwapGray">
              {Number(totalIn) > 0 && Number(totalIn) < 0.01
                ? '< 0.01'
                : toPrecision(totalIn, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            <span className="mx-6 xs:mx-2 text-white xs:text-v3SwapGray">
              {isClientMobie() ? (
                <MyOrderInstantSwapArrowRight />
              ) : (
                <MyOrderInstantSwapArrowRight />
              )}
            </span>
            <span
              title={toPrecision(totalOut, buyToken.decimals)}
              className="text-white xs:text-v3SwapGray"
            >
              {Number(totalOut) > 0 && Number(totalOut) < 0.01
                ? '< 0.01'
                : toPrecision(totalOut, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
          </span>
        </div>

        <div className="flex items-center justify-between ">
          <span className="flex items-center ">
            <FormattedMessage
              id="filled_via_swap"
              defaultMessage={'Filled via Swap'}
            />

            <ExclamationTip
              colorhex="#7E8A93"
              id={instant_swap_tip()}
              defaultMessage={instant_swap_tip()}
            />
          </span>

          <span className="flex items-center">
            <BsCheckCircle className="mr-1.5" fill="#42bb17" stroke="#42BB17" />
            <span title={swapIn} className="text-v3SwapGray">
              {Number(swapIn) > 0 && Number(swapIn) < 0.01
                ? '< 0.01'
                : toPrecision(swapIn, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
            <span className="mx-6 xs:mx-2 text-v3SwapGray">
              {isClientMobie() ? (
                <MyOrderInstantSwapArrowRight />
              ) : (
                <MyOrderInstantSwapArrowRight />
              )}
            </span>
            <span title={swapOut} className="text-v3SwapGray">
              {Number(swapOut) > 0 && Number(swapOut) < 0.01
                ? '< 0.01'
                : toPrecision(swapOut, 2)}
            </span>

            <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
          </span>
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
        <div
          className="mb-4 w-full xs:hidden"
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

            <div className="flex items-center w-full xs:mt-2">
              {actions}
              {claimButton}
            </div>
          </div>

          {/* swap banner */}
          {!ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null}
        </div>
      </>
    );
  }

  if (!activeOrder || activeOrder.length === 0) return null;

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

  return (
    <div
      className="flex mb-6 flex-col border border-legacyYellowColor rounded-2xl px-4 pb-0 pt-4 xs:px-2 "
      style={{
        background: 'rgba(244, 159, 80, 0.12)',
      }}
    >
      <div className="text-center flex items-center xs:border-legacyYellowColor lg:justify-center xs:flex-col xs:mb-2 mb-7">
        <WarningTip />

        <span className="text-base xs:mb-2  lg:ml-2 text-legacyYellowColor gotham_bold">
          <FormattedMessage
            id="new_contract_deploy_tip"
            defaultMessage={
              'A new contract has been deployed! Please remove your liquidity from the old contract'
            }
          />
        </span>
        {isMobile() && (
          <span
            style={{
              fontSize: '15px',
            }}
            className="text-v3SwapGray text-center"
          >
            *Canceling will automatically claim your executed tokens.
          </span>
        )}
      </div>

      <div
        className={`mb-2.5 px-4 xs:hidden ${
          !activeOrder || activeOrder.length === 0 ? 'hidden' : ''
        } text-v3SwapGray text-sm grid grid-cols-10 whitespace-nowrap`}
      >
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
          className="col-span-2 flex items-center ml-28"
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
          className="col-span-2 flex items-center ml-16 text-right"
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
          <FormattedMessage id="executed" defaultMessage={'Executed'} />
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

      {activeOrder &&
        activeOrder.sort(activeOrderSorting).map((order, index) => {
          return (
            <ActiveLine index={index} key={order.order_id} order={order} />
          );
        })}
    </div>
  );
}

function MyOrderPage() {
  const { activeOrder, historyOrder } = useMyOrders();

  const [oldOrders, setOldOrders] = useState<UserOrderInfo[]>();

  const { accountId } = useWalletSelector();

  useEffect(() => {
    refSwapV3OldVersionViewFunction({
      methodName: 'list_active_orders',
      args: {
        account_id: accountId,
      },
    }).then((res) => {
      setOldOrders(res);
    });
  }, [accountId]);

  const history = useHistory();

  const minOrderTime =
    _.minBy(historyOrder, (o) => o.created_at)?.created_at || 0;

  const historySwapInfo = useHistoryOrderSwapInfo({
    start_at: Number(minOrderTime),
    end_at: Date.now() * 1000000,
  });

  const tokenPriceList = useTokenPriceList();

  const ActiveTokenIds = activeOrder
    ?.map((order) => [order.sell_token, order.buy_token])
    .flat();

  const HistoryTokenIds = historyOrder
    ?.map((order) => [order.sell_token, order.buy_token])
    .flat();

  const OldActiveTokenIds =
    oldOrders?.map((order) => [order.sell_token, order.buy_token]).flat() || [];

  const HistorySwapInfoTokenIds =
    historySwapInfo?.map((hs) => [hs.token_in, hs.token_out]).flat() || [];

  const tokenIds =
    !activeOrder || !historyOrder
      ? null
      : [
          ...new Set([
            ...ActiveTokenIds,
            ...HistoryTokenIds,
            ...OldActiveTokenIds,
            ...HistorySwapInfoTokenIds,
          ]),
        ];

  const tokens = useTokens(tokenIds || []);
  const intl = useIntl();

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
    <div className="max-w-7xl mx-auto flex flex-col xs:w-11/12 md:5/6 lg:w-1000px">
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
          <div className="flex items-center">
            <FormattedMessage id="your_orders" defaultMessage={'Your Orders'} />
          </div>
        </button>

        <div
          data-type="info"
          data-place="top"
          data-multiline={true}
          data-class="reactTip"
          data-tooltip-html={`
              <div class="text-xs opacity-50">
                <div 
                  style="font-weight:400",
                >
                ${intl.formatMessage({
                  id: 'v2_paused',

                  defaultMessage: 'REF V2 has been paused for maintenance',
                })}
                </div>
              </div>
            `}
          data-tooltip-id="v2_paused_pool_tip"
        >
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
            // disabled
          >
            <FormattedMessage
              id="create_order"
              defaultMessage={'Create Order'}
            />
          </SolidButton>
        </div>
      </div>
      <PriceContext.Provider value={tokenPriceList}>
        <OrderCardOld tokensMap={tokensMap} activeOrder={oldOrders} />

        <OrderCard
          tokensMap={tokensMap}
          activeOrder={activeOrder}
          historyOrder={historyOrder}
          historySwapInfo={historySwapInfo}
        />
      </PriceContext.Provider>
    </div>
  );
}

export default MyOrderPage;
