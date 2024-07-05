import React, {
  useEffect,
  useState,
  useContext,
  createContext,
  useMemo,
  Fragment,
  useRef,
} from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useHistory } from 'react-router-dom';
import { isClientMobie, useClientMobile } from '../../../../utils/device';
import {
  SolidButton,
  ButtonTextWrapper,
} from '../../../../components/button/Button';

import { useMyOrders } from '../../../../state/swapV3';
import { refSwapV3OldVersionViewFunction } from '../../../../services/near';
import {
  UserOrderInfo,
  V3_POOL_SPLITER,
  pointToPrice,
} from '../../../../services/swapV3';
import {
  useToken,
  useTokens,
  useTokenPriceList,
} from '../../../../state/token';

import {
  FilledEllipse,
  MobileHistoryOrderStamp,
  MyOrderCircle,
  MyOrderMask,
  MyOrderMask2,
} from '../../../../components/icon/swapV3';
import {
  calculateFeePercent,
  ONLY_ZEROS,
  toPrecision,
} from '../../../../utils/numbers';

import { BsCheckCircle } from '../../../../components/reactIcons';

import {
  toReadableNumber,
  scientificNotationToString,
  checkAllocations,
} from '../../../../utils/numbers';
import { TokenMetadata } from '../../../../services/ft-contract';
import Big from 'big.js';
import { cancel_order, cancel_order_old } from '../../../../services/swapV3';
import { TIMESTAMP_DIVISOR } from '../../../../components/layout/Proposal';
import moment from 'moment';
import { DownArrowVE, UpArrowVE } from '../../../../components/icon/Referendum';
import { Loading } from '../../../../components/icon/Loading';
import {
  RouterArrowLeft,
  MyOrderMobileArrow,
} from '../../../../components/icon/Arrows';
import QuestionMark from '../../../../components/farm/QuestionMark';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { toRealSymbol } from '../../../../utils/token';
import {
  QuestionTip,
  ExclamationTip,
} from '../../../../components/layout/TipWrapper';
import { MyOrderInstantSwapArrowRight } from '../../../../components/icon/swapV3';
import {
  TOKEN_LIST_FOR_RATE,
  sort_tokens_by_base,
} from '../../../../services/commonV3';
import BigNumber from 'bignumber.js';
import { isMobile } from '../../../../utils/device';
import { useWalletSelector } from '../../../../context/WalletSelectorContext';
import {
  useHistoryOrderTx,
  useHistoryOrderSwapInfo,
} from '../../../../state/myOrder';
import { HiOutlineExternalLink } from '../../../../components/reactIcons';
import getConfig from '../../../../services/config';
import _ from 'lodash';
import { HistoryOrderSwapInfo, getTxId } from '../../../../services/indexer';
import { useDclPoolIdByCondition } from '../../../../state/swapV3';
import CustomTooltip from 'src/components/customTooltip/customTooltip';
import {
  NearblocksIcon,
  PikespeakIcon,
  TxLeftArrow,
} from 'src/components/icon/Pool';

const ORDER_TYPE_KEY = 'REF_FI_ORDER_TYPE_VALUE';

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

function NoOrderCard({ text }: { text: 'active' | 'history' }) {
  return (
    <div className="w-full rounded-xl overflow-hidden h-48 relative text-white font-normal  flex items-center justify-center">
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
  hoverOn,
  setHoverOn,
}: {
  order: UserOrderInfo;
  index: number;
  tokensMap: { [key: string]: TokenMetadata };
  sellAmountToBuyAmount: any;
  orderTx: string;
  hoverOn: number;
  setHoverOn: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loadingStates, setLoadingStates] = useState({});
  const [hoveredTx, setHoveredTx] = useState(null);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = (receipt_id) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredTx(receipt_id);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredTx(null);
    }, 200);
  };

  async function handleTxClick(receipt_id, url) {
    setLoadingStates((prevStates) => ({ ...prevStates, [receipt_id]: true }));
    try {
      const data = await getTxId(receipt_id);
      if (data && data.receipts && data.receipts.length > 0) {
        const txHash = data.receipts[0].originated_from_transaction_hash;
        window.open(`${url}/${txHash}`, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error(
        'An error occurred while fetching transaction data:',
        error
      );
    } finally {
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [receipt_id]: false,
      }));
    }
  }
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

  const claimedAmountIn = buyAmountToSellAmount(
    scientificNotationToString(
      new Big(order.bought_amount || '0')
        .minus(order.unclaimed_amount || '0')
        .toString()
    ),
    order,
    price
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
    <span className="flex py-4 pl-3  flex-shrink-0 items-center">
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
  );

  const buyTokenAmount = (
    <span className="flex items-center col-span-1 ">
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
    <span className="rounded-lg relative xsm:right-0 xsm:bg-none right-3 text-left  text-primaryText p-1 lg:bg-menuMoreBgColor xs:text-white">
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
      <span className="whitespace-nowrap col-span-1 flex items-start xs:flex-row xs:items-center flex-col relative xs:right-0">
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
      className="text-xs relative xs:bottom-2 mt-1 mr-1 w-20 xs:w-full flex items-center xs:flex-row-reverse "
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
    <span className="whitespace-nowrap  xs:flex-col flex items-center ">
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
    <span className=" relative  whitespace-nowrap    text-primaryText xs:text-xs flex flex-col   xsm:justify-center  text-left xs:opacity-50">
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD')}
      </span>
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('HH:mm')}
      </span>

      <span className="lg:hidden text-center relative bottom-2">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
      </span>
    </span>
  );
  const actions = (
    <div className=" col-span-1  text-primaryText  text-xs flex flex-col items-end justify-self-end p-1.5 pr-4">
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

      <div className="relative">
        {!!orderTx && (
          <a
            className="flex items-center text-v3SwapGray cursor-pointer"
            onMouseEnter={() => handleMouseEnter(orderTx)}
            onMouseLeave={handleMouseLeave}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {loadingStates[orderTx] ? (
              <>
                Tx
                <span className="loading-dots"></span>
              </>
            ) : (
              <>
                Tx
                <span className="ml-1.5">
                  <HiOutlineExternalLink />
                </span>
              </>
            )}
            {hoveredTx === orderTx && (
              <div className="w-44 absolute top-6 left-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
                <div className="flex flex-col">
                  <div
                    className="mb-2 px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'block';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'none';
                      }
                    }}
                    onClick={() =>
                      handleTxClick(orderTx, `${getConfig().explorerUrl}/txns`)
                    }
                  >
                    <NearblocksIcon />
                    <p className="ml-2 text-sm">nearblocks</p>
                    <div className="ml-3 arrow" style={{ display: 'none' }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'block';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'none';
                      }
                    }}
                    onClick={() =>
                      handleTxClick(
                        orderTx,
                        `${getConfig().pikespeakUrl}/transaction-viewer`
                      )
                    }
                  >
                    <PikespeakIcon />
                    <p className="ml-2 text-sm">Pikespeak...</p>
                    <div className="ml-3 arrow" style={{ display: 'none' }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </a>
        )}
      </div>
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
    <>
      <td
        colSpan={8}
        className=" rounded-b-xl xsm:hidden  w-full relative bottom-1.5 pt-6 bg-portfolioBgColor"
      >
        {new Big(order.original_deposit_amount || '0')
          .minus(order.original_amount || '0')
          .gt(0) && (
          <>
            <div className="flex items-center px-4 pb-4 justify-between ">
              <span className="flex items-center">
                <FormattedMessage
                  id="initial_order"
                  defaultMessage={'Initial Order'}
                />
                <ExclamationTip
                  id="this_order_has_been_partially_filled"
                  defaultMessage="This order has been partially filled "
                  dataPlace="bottom"
                  colorhex="#7E8A93"
                  uniquenessId={
                    'this_order_has_been_partially_filled' + order.order_id
                  }
                />
              </span>

              <span className="flex items-center">
                <span title={totalIn} className="text-v3SwapGray">
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
                  className="text-v3SwapGray"
                >
                  {Number(totalOut) > 0 && Number(totalOut) < 0.01
                    ? '< 0.01'
                    : toPrecision(totalOut, 2)}
                </span>

                <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
              </span>
            </div>

            <div className="frcb px-4 pb-4">
              <span className="flex items-center ">
                <FormattedMessage
                  id="instants_swap"
                  defaultMessage={'Instant Swap'}
                />

                <ExclamationTip
                  colorhex="#7E8A93"
                  id={instant_swap_tip()}
                  defaultMessage={instant_swap_tip()}
                  dataPlace="bottom"
                  uniquenessId={'instant_swap_tip' + order.order_id}
                />
              </span>

              <span className="frcb min-w-p300">
                <div className="frcs text-xs w pr-2 text-v3SwapGray">
                  <BsCheckCircle
                    className="mr-1.5"
                    fill="#42bb17"
                    stroke="#42BB17"
                  />

                  <FormattedMessage
                    id="swappped"
                    defaultMessage={'Swapped'}
                  ></FormattedMessage>
                </div>

                <div className="flex items-center justify-end">
                  <span title={swapIn} className="text-v3SwapGray">
                    {Number(swapIn) > 0 && Number(swapIn) < 0.01
                      ? '< 0.01'
                      : toPrecision(swapIn, 2)}
                  </span>

                  <span className="ml-1.5">
                    {toRealSymbol(sellToken.symbol)}
                  </span>
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

                  <span className="ml-1.5">
                    {toRealSymbol(buyToken.symbol)}
                  </span>
                </div>
              </span>
            </div>
          </>
        )}
        {Number(claimedAmountIn) > 0 && (
          <div className="frcb px-4 pb-4">
            <span>
              <FormattedMessage id="executed" defaultMessage={'Executed'} />
            </span>

            <span className="frcb min-w-p300">
              <div className="frcs text-xs pr-2 text-v3SwapGray">
                <BsCheckCircle
                  className="mr-1.5"
                  fill="#00D6AF"
                  stroke="#00D6AF"
                />

                <FormattedMessage
                  id="claimed"
                  defaultMessage={'Claimed'}
                ></FormattedMessage>
              </div>

              <div className="flex items-center justify-end">
                <span
                  title={toPrecision(claimedAmountIn, sellToken.decimals)}
                  className="text-v3SwapGray"
                >
                  {Number(claimedAmountIn) > 0 && Number(claimedAmountIn) < 0.01
                    ? '< 0.01'
                    : toPrecision(claimedAmountIn, 2)}
                </span>

                <span className="ml-1.5">{toRealSymbol(sellToken.symbol)}</span>
                <span className="mx-6 xs:mx-2 text-v3SwapGray">
                  {isClientMobie() ? (
                    <MyOrderInstantSwapArrowRight />
                  ) : (
                    <MyOrderInstantSwapArrowRight />
                  )}
                </span>
                <span title={claimedAmount} className="text-v3SwapGray">
                  {Number(claimedAmount) > 0 && Number(claimedAmount) < 0.01
                    ? '< 0.01'
                    : toPrecision(claimedAmount, 2)}
                </span>

                <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
              </div>
            </span>
          </div>
        )}
      </td>
    </>
  );

  return (
    <Fragment>
      <tr>
        <td>
          <div className="pb-2.5"></div>
        </td>
      </tr>
      <tr
        className={`mb-4 overflow-visible xs:hidden px-4 py-3 text-sm w-full  items-center ${
          hoverOn === index
            ? 'bg-portfolioBarBgColor rounded-t-xl'
            : 'bg-portfolioBgColor rounded-xl'
        }`}
        onMouseEnter={() => {
          setHoverOn(index);
        }}
        style={{
          zIndex: 21,
        }}
      >
        <td
          className={
            hoverOn === index &&
            (new Big(order.original_deposit_amount || '0')
              .minus(order.original_amount || '0')
              .gt(0) ||
              Number(claimedAmountIn) > 0)
              ? ' rounded-tl-xl'
              : ' rounded-l-xl'
          }
        >
          {sellTokenAmount}
        </td>

        <td>
          <span className="text-white text-lg frcs w-7 xs:hidden ">
            <MyOrderInstantSwapArrowRight />
          </span>
        </td>

        <td>{buyTokenAmount}</td>

        <td>{feeTier}</td>

        <td>{orderRate}</td>

        <td>{created}</td>

        <td className="">{claimed}</td>
        <td
          className={
            hoverOn === index &&
            (new Big(order.original_deposit_amount || '0')
              .minus(order.original_amount || '0')
              .gt(0) ||
              Number(claimedAmountIn) > 0)
              ? ' rounded-tr-xl'
              : ' rounded-r-xl'
          }
        >
          {actions}
        </td>
      </tr>

      {hoverOn === index &&
        (new Big(order.original_deposit_amount || '0')
          .minus(order.original_amount || '0')
          .gt(0) ||
          Number(claimedAmountIn) > 0) && (
          <>
            <tr className="xs:flex z-20 relative  xs:flex-col whitespace-nowrap xs:bg-cardBg xs:bg-opacity-50  bottom-2 xs:bottom-0 w-full text-sm text-v3SwapGray bg-cardBg rounded-xl px-5 pb-5 pt-10 xs:px-3 xs:py-4 xs:text-xs">
              {swapBanner}
            </tr>
          </>
        )}
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
          <div className="absolute right-4 bottom-2.5 z-50  text-xs">
            <div className="relative">
              {!!orderTx && (
                <a
                  className="flex items-center text-v3SwapGray cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(orderTx)}
                  onMouseLeave={handleMouseLeave}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {loadingStates[orderTx] ? (
                    <>
                      Tx
                      <span className="loading-dots"></span>
                    </>
                  ) : (
                    <>
                      Tx
                      <span className="ml-1.5">
                        <HiOutlineExternalLink />
                      </span>
                    </>
                  )}
                  {hoveredTx === orderTx && (
                    <div className="w-44 absolute top-6 right-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
                      <div className="flex flex-col">
                        <div
                          className="mb-2 px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                          onMouseEnter={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'block';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'none';
                            }
                          }}
                          onClick={() =>
                            handleTxClick(
                              orderTx,
                              `${getConfig().explorerUrl}/txns`
                            )
                          }
                        >
                          <NearblocksIcon />
                          <p className="ml-2 text-sm">nearblocks</p>
                          <div
                            className="ml-3 arrow"
                            style={{ display: 'none' }}
                          >
                            <TxLeftArrow />
                          </div>
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                          onMouseEnter={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'block';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'none';
                            }
                          }}
                          onClick={() =>
                            handleTxClick(
                              orderTx,
                              `${getConfig().pikespeakUrl}/transaction-viewer`
                            )
                          }
                        >
                          <PikespeakIcon />
                          <p className="ml-2 text-sm">Pikespeak...</p>
                          <div
                            className="ml-3 arrow"
                            style={{ display: 'none' }}
                          >
                            <TxLeftArrow />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </a>
              )}
            </div>
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
    </Fragment>
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
  hoverOn: number;
  setHoverOn: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loadingStates, setLoadingStates] = useState({});
  const [hoveredTx, setHoveredTx] = useState(null);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = (receipt_id) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredTx(receipt_id);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredTx(null);
    }, 200);
  };

  async function handleTxClick(receipt_id, url) {
    setLoadingStates((prevStates) => ({ ...prevStates, [receipt_id]: true }));
    try {
      const data = await getTxId(receipt_id);
      if (data && data.receipts && data.receipts.length > 0) {
        const txHash = data.receipts[0].originated_from_transaction_hash;
        window.open(`${url}/${txHash}`, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error(
        'An error occurred while fetching transaction data:',
        error
      );
    } finally {
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [receipt_id]: false,
      }));
    }
  }
  const intl = useIntl();

  const buyToken = tokensMap[token_out];

  const sellToken = tokensMap[token_in];

  const [hover, setHover] = useState<boolean>(false);

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
    <span className="flex py-4 pl-3  flex-shrink-0 items-center">
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
  );

  const buyTokenAmount = (
    <span className="flex items-center col-span-1 ">
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
    <span className="rounded-lg relative xsm:right-0 xsm:bg-none right-3 text-left  text-primaryText p-1 lg:bg-menuMoreBgColor xs:text-white">
      {`${toPrecision(calculateFeePercent(fee / 100).toString(), 2)}% `}
    </span>
  );
  const sort =
    TOKEN_LIST_FOR_RATE.indexOf(sellToken?.symbol) > -1 && +price !== 0;
  const calcPrice = sort ? new BigNumber(1).dividedBy(price).toFixed() : price;

  const orderRate = (
    <span className="whitespace-nowrap col-span-1 flex items-start xs:flex-row xs:items-center flex-col relative  xs:right-0">
      <span className="mr-1 text-white text-sm" title={calcPrice}>
        {toPrecision(calcPrice, 2)}
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
    <span className=" relative  whitespace-nowrap    text-primaryText xs:text-xs flex flex-col   xsm:justify-center  text-left xs:opacity-50">
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(timestamp) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD')}
      </span>
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(timestamp) / TIMESTAMP_DIVISOR) * 1000
        ).format('HH:mm')}
      </span>

      <span className="lg:hidden text-center relative bottom-2">
        {moment(
          Math.floor(Number(timestamp) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
      </span>
    </span>
  );

  const actions = (
    <div className=" col-span-1 pr-4  text-primaryText  text-xs flex flex-col items-end justify-self-end p-1.5">
      <span className="flex items-center text-sm text-white whitespace-nowrap">
        {<FormattedMessage id="executed" defaultMessage={'Executed'} />}
      </span>
      <div className="relative">
        {!!orderTx && (
          <a
            className="flex items-center text-v3SwapGray cursor-pointer"
            onMouseEnter={() => handleMouseEnter(orderTx)}
            onMouseLeave={handleMouseLeave}
            target="_blank"
            rel="noopener noreferrer nofollow"
          >
            {loadingStates[orderTx] ? (
              <>
                Tx
                <span className="loading-dots"></span>
              </>
            ) : (
              <>
                Tx
                <span className="ml-1.5">
                  <HiOutlineExternalLink />
                </span>
              </>
            )}
            {hoveredTx === orderTx && (
              <div className="w-44 absolute top-6 left-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
                <div className="flex flex-col">
                  <div
                    className="mb-2 px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'block';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'none';
                      }
                    }}
                    onClick={() =>
                      handleTxClick(orderTx, `${getConfig().explorerUrl}/txns`)
                    }
                  >
                    <NearblocksIcon />
                    <p className="ml-2 text-sm">nearblocks</p>
                    <div className="ml-3 arrow" style={{ display: 'none' }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                  <div
                    className="px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                    onMouseEnter={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'block';
                      }
                    }}
                    onMouseLeave={(e) => {
                      const arrow = e.currentTarget.querySelector(
                        '.arrow'
                      ) as HTMLElement;
                      if (arrow) {
                        arrow.style.display = 'none';
                      }
                    }}
                    onClick={() =>
                      handleTxClick(
                        orderTx,
                        `${getConfig().pikespeakUrl}/transaction-viewer`
                      )
                    }
                  >
                    <PikespeakIcon />
                    <p className="ml-2 text-sm">Pikespeak...</p>
                    <div className="ml-3 arrow" style={{ display: 'none' }}>
                      <TxLeftArrow />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </a>
        )}
      </div>
    </div>
  );

  const tokenPrice = useContext(PriceContext);

  return (
    <>
      <Fragment>
        <tr>
          <td>
            <div className="pb-2.5"></div>
          </td>
        </tr>
        <tr
          className={`mb-4 overflow-visible   xs:hidden px-4 py-3 text-sm   z-20   relative  w-full rounded-xl items-center   hover:bg-portfolioBarBgColor bg-portfolioBgColor `}
          style={{
            zIndex: 21,
          }}
        >
          <td className="rounded-l-xl">{sellTokenAmount}</td>

          <td>
            <span className="text-white text-lg frcs w-7 xs:hidden ">
              <MyOrderInstantSwapArrowRight />
            </span>
          </td>

          <td>{buyTokenAmount}</td>

          <td>{feeTier}</td>

          <td>{orderRate}</td>

          <td>{created}</td>

          <td className=""></td>
          <td className="rounded-r-xl">{actions}</td>
        </tr>

        {/* {hover && !ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null} */}
      </Fragment>

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

          <div className="absolute right-4 bottom-2.5 z-50  text-xs">
            <div className="relative">
              {!!orderTx && (
                <a
                  className="flex items-center text-v3SwapGray cursor-pointer"
                  onMouseEnter={() => handleMouseEnter(orderTx)}
                  onMouseLeave={handleMouseLeave}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                >
                  {loadingStates[orderTx] ? (
                    <>
                      Tx
                      <span className="loading-dots"></span>
                    </>
                  ) : (
                    <>
                      Tx
                      <span className="ml-1.5">
                        <HiOutlineExternalLink />
                      </span>
                    </>
                  )}
                  {hoveredTx === orderTx && (
                    <div className="w-44 absolute top-6 right-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
                      <div className="flex flex-col">
                        <div
                          className="mb-2 px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                          onMouseEnter={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'block';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'none';
                            }
                          }}
                          onClick={() =>
                            handleTxClick(
                              orderTx,
                              `${getConfig().explorerUrl}/txns`
                            )
                          }
                        >
                          <NearblocksIcon />
                          <p className="ml-2 text-sm">nearblocks</p>
                          <div
                            className="ml-3 arrow"
                            style={{ display: 'none' }}
                          >
                            <TxLeftArrow />
                          </div>
                        </div>
                        <div
                          className="px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                          onMouseEnter={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'block';
                            }
                          }}
                          onMouseLeave={(e) => {
                            const arrow = e.currentTarget.querySelector(
                              '.arrow'
                            ) as HTMLElement;
                            if (arrow) {
                              arrow.style.display = 'none';
                            }
                          }}
                          onClick={() =>
                            handleTxClick(
                              orderTx,
                              `${getConfig().pikespeakUrl}/transaction-viewer`
                            )
                          }
                        >
                          <PikespeakIcon />
                          <p className="ml-2 text-sm">Pikespeak...</p>
                          <div
                            className="ml-3 arrow"
                            style={{ display: 'none' }}
                          >
                            <TxLeftArrow />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </a>
              )}
            </div>
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
  orderTx,
  hoverOn,
  setHoverOn,
}: {
  order: UserOrderInfo;
  index: number;
  sellAmountToBuyAmount: any;
  tokensMap: { [key: string]: TokenMetadata };
  orderTx: string;
  hoverOn: number;
  setHoverOn: React.Dispatch<React.SetStateAction<number>>;
}) {
  const [loadingStates, setLoadingStates] = useState({});
  const [hoveredTx, setHoveredTx] = useState(null);
  const closeTimeoutRef = useRef(null);

  const handleMouseEnter = (receipt_id) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setHoveredTx(receipt_id);
  };

  const handleMouseLeave = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredTx(null);
    }, 200);
  };

  async function handleTxClick(receipt_id, url) {
    setLoadingStates((prevStates) => ({ ...prevStates, [receipt_id]: true }));
    try {
      const data = await getTxId(receipt_id);
      if (data && data.receipts && data.receipts.length > 0) {
        const txHash = data.receipts[0].originated_from_transaction_hash;
        window.open(`${url}/${txHash}`, '_blank', 'noopener,noreferrer');
      }
    } catch (error) {
      console.error(
        'An error occurred while fetching transaction data:',
        error
      );
    } finally {
      setLoadingStates((prevStates) => ({
        ...prevStates,
        [receipt_id]: false,
      }));
    }
  }
  const [claimLoading, setClaimLoading] = useState<boolean>(false);
  const intl = useIntl();

  const [cancelLoading, setCancelLoading] = useState<boolean>(false);

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

  const unClaimedAmountIn = buyAmountToSellAmount(
    order.unclaimed_amount || '0',
    order,
    price
  );

  const claimedAmountIn = buyAmountToSellAmount(
    scientificNotationToString(
      new Big(order.bought_amount || '0')
        .minus(order.unclaimed_amount || '0')
        .toString()
    ),
    order,
    price
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
        class="flex flex-col relative text-xs min-w-36 text-farmText z-50"
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
    <span className="flex py-4 pl-3  flex-shrink-0 items-center">
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
  );

  const buyTokenAmount = (
    <span className="flex items-center ">
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
    <span className="rounded-lg relative xsm:right-0 xsm:bg-none right-3 text-left  text-primaryText p-1 lg:bg-menuMoreBgColor xs:text-white">
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
      <span className="whitespace-nowrap  col-span-1 flex items-start xs:flex-row xs:items-center flex-col relative  xs:right-0">
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
    <button
      className={`rounded-lg text-xs xs:text-sm xs:w-full ml-1.5 mr-2 py-2 px-9 ${
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
      style={{
        height: '34px',
      }}
    >
      <ButtonTextWrapper
        Text={() => <FormattedMessage id="claim" defaultMessage={'Claim'} />}
        loading={claimLoading}
      ></ButtonTextWrapper>
    </button>
  );

  const unclaim = (
    <span className="whitespace-nowrap col-span-2 flex xs:flex-col items-center ">
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
    </span>
  );

  const created = (
    <span className=" relative  whitespace-nowrap    text-primaryText xs:text-xs flex flex-col   xsm:justify-center  text-left xs:opacity-50">
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD')}
      </span>
      <span className="xsm:hidden">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('HH:mm')}
      </span>

      <span className="lg:hidden text-center relative bottom-2">
        {moment(
          Math.floor(Number(order.created_at) / TIMESTAMP_DIVISOR) * 1000
        ).format('YYYY-MM-DD HH:mm')}
      </span>
    </span>
  );

  const actions = (
    <button
      className={`border col-span-1 rounded-lg xs:text-sm xs:w-full text-xs justify-self-end py-2 px-9 ${
        cancelLoading ? 'border border-transparent text-black bg-warn ' : ''
      }  border-warn border-opacity-20 text-warn  ${'hover:border hover:border-transparent hover:text-black hover:bg-warn'}`}
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
        Text={() => <FormattedMessage id="cancel" defaultMessage={'Cancel'} />}
        loading={cancelLoading}
      />
    </button>
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
    <td
      colSpan={8}
      className="xsm:block xsm:rounded-xl xs:text-xs text-v3SwapGray w-full relative lg:bottom-1.5 lg:pt-6 xsm:pt-4 bg-portfolioBgColor"
    >
      {new Big(order.original_deposit_amount || '0')
        .minus(order.original_amount || '0')
        .gt(0) && (
        <>
          <div className="flex items-center px-4 pb-4  justify-between ">
            <span className="flex items-center">
              <FormattedMessage
                id="initial_order"
                defaultMessage={'Initial Order'}
              />
              {!isMobile() && (
                <ExclamationTip
                  id="this_order_has_been_partially_filled"
                  defaultMessage="This order has been partially filled "
                  dataPlace="bottom"
                  colorhex="#7E8A93"
                  uniquenessId={
                    'this_order_has_been_partially_filled' + order.order_id
                  }
                />
              )}
            </span>

            <span className="flex items-center text-xs">
              <span title={totalIn} className="text-v3SwapGray">
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
                className="text-v3SwapGray"
              >
                {Number(totalOut) > 0 && Number(totalOut) < 0.01
                  ? '< 0.01'
                  : toPrecision(totalOut, 2)}
              </span>

              <span className="ml-1.5">{toRealSymbol(buyToken.symbol)}</span>
            </span>
          </div>

          <div className="frcb px-4 pb-4">
            <span className="flex items-center ">
              <FormattedMessage
                id={isMobile() ? 'filled_via_swap' : 'instants_swap'}
                defaultMessage={isMobile() ? 'Filled via swap' : 'Instant Swap'}
              />
              {!isMobile() && (
                <ExclamationTip
                  colorhex="#7E8A93"
                  id={instant_swap_tip()}
                  defaultMessage={instant_swap_tip()}
                  dataPlace="bottom"
                  uniquenessId={'instant_swap_tip' + order.order_id}
                />
              )}
            </span>

            <span className="frcb xsm:justify-start lg:min-w-p300">
              <div className="frcs text-xs  pr-2 text-v3SwapGray">
                <BsCheckCircle
                  className="mr-1.5"
                  fill="#42bb17"
                  stroke="#42BB17"
                />
                <span className="xsm:hidden">
                  <FormattedMessage
                    id="swappped"
                    defaultMessage={'Swapped'}
                  ></FormattedMessage>
                </span>
              </div>

              <div className="flex items-center justify-end">
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
              </div>
            </span>
          </div>
        </>
      )}

      <div className="flex items-start xsm:hidden justify-between px-4 pb-4">
        <span className="xsm:text-v3SwapGray">
          <FormattedMessage
            id="executing_capital"
            defaultMessage={'Executing'}
          />
        </span>

        <div className="flex flex-col items-end">
          <span className="frcb min-w-p300">
            <div className="frcs text-xs pr-2 text-v3SwapGray">
              <BsCheckCircle
                className="mr-1.5"
                fill="#00D6AF"
                stroke="#00D6AF"
              />

              <FormattedMessage
                id="claimed"
                defaultMessage={'Claimed'}
              ></FormattedMessage>
            </div>

            <div className="flex items-center justify-end">
              <span
                title={toPrecision(claimedAmountIn, sellToken.decimals)}
                className="text-v3SwapGray"
              >
                {Number(claimedAmountIn) > 0 && Number(claimedAmountIn) < 0.01
                  ? '< 0.01'
                  : toPrecision(claimedAmountIn, 2)}
              </span>

              <span className="ml-1.5 xsm:text-v3SwapGray">
                {toRealSymbol(sellToken.symbol)}
              </span>
              <span className="mx-6 xs:mx-2 text-v3SwapGray">
                {isClientMobie() ? (
                  <MyOrderInstantSwapArrowRight />
                ) : (
                  <MyOrderInstantSwapArrowRight />
                )}
              </span>
              <span title={claimedAmount} className="text-v3SwapGray">
                {Number(claimedAmount) > 0 && Number(claimedAmount) < 0.01
                  ? '< 0.01'
                  : toPrecision(claimedAmount, 2)}
              </span>

              <span className="ml-1.5 xsm:text-v3SwapGray">
                {toRealSymbol(buyToken.symbol)}
              </span>
            </div>
          </span>

          <span className=" pt-4  frcb min-w-p300">
            <div className="frcs text-xs pr-2 text-v3SwapGray">
              <span className="mr-1.5">
                <FilledEllipse></FilledEllipse>
              </span>

              <FormattedMessage
                id="filled"
                defaultMessage={'Filled'}
              ></FormattedMessage>
            </div>

            <div className="flex items-center justify-end">
              <span
                title={toPrecision(unClaimedAmountIn, sellToken.decimals)}
                className="text-white font-gothamBold"
              >
                {Number(unClaimedAmountIn) > 0 &&
                Number(unClaimedAmountIn) < 0.01
                  ? '< 0.01'
                  : toPrecision(unClaimedAmountIn, 2)}
              </span>

              <span className="ml-1.5 xsm:text-v3SwapGray">
                {toRealSymbol(sellToken.symbol)}
              </span>
              <span className="mx-6 xs:mx-2 text-v3SwapGray">
                {isClientMobie() ? (
                  <MyOrderInstantSwapArrowRight />
                ) : (
                  <MyOrderInstantSwapArrowRight />
                )}
              </span>
              <span
                title={unClaimedAmount}
                className="text-white font-gothamBold"
              >
                {Number(unClaimedAmount) > 0 && Number(unClaimedAmount) < 0.01
                  ? '< 0.01'
                  : toPrecision(unClaimedAmount, 2)}
              </span>

              <span className="ml-1.5 xsm:text-v3SwapGray">
                {toRealSymbol(buyToken.symbol)}
              </span>
            </div>
          </span>
        </div>
      </div>

      <div className="lg:hidden flex items-center justify-end pr-4 pb-2">
        <div className="flex  max-w-max text-primaryText bg-black bg-opacity-20 rounded-md px-2 py-1 items-center justify-end lg:hidden">
          <span className="">1</span>

          <span className="ml-1.5">
            {toRealSymbol(sort ? buyToken.symbol : sellToken.symbol)}
          </span>

          {tokenPrice?.[sort ? buyToken?.id : sellToken?.id]?.price && (
            <span className="ml-1">{`($${
              tokenPrice?.[sort ? buyToken?.id : sellToken?.id].price
            })`}</span>
          )}

          <span className="mx-6 xs:mx-2 ">=</span>
          <span className="">
            {toPrecision(
              scientificNotationToString(
                new Big(sort ? swapIn || 0 : swapOut || 0)
                  .div(
                    Number(sort ? swapOut : swapIn) === 0
                      ? 1
                      : sort
                      ? swapOut
                      : swapIn
                  )
                  .toString()
              ),
              3
            )}
          </span>

          <span className="ml-1.5">
            {toRealSymbol(sort ? sellToken.symbol : buyToken.symbol)}
          </span>
        </div>
      </div>
    </td>
  );
  return (
    <Fragment>
      <tr>
        <td colSpan={9}>
          <div className="pb-2.5"></div>
        </td>
      </tr>
      <tr
        className={`mb-4 overflow-visible   xs:hidden px-4 py-3 text-sm   z-20   relative  w-full  items-center   ${
          hoverOn === index
            ? 'bg-portfolioBarBgColor rounded-t-xl'
            : 'bg-portfolioBgColor rounded-xl'
        }`}
        onMouseEnter={() => {
          setHoverOn(index);
        }}
        style={{
          zIndex: 21,
        }}
      >
        <td className={hoverOn === index ? ' rounded-tl-xl' : ' rounded-l-xl'}>
          {sellTokenAmount}
        </td>

        <td>
          <span className="text-white text-lg frcs w-7 xs:hidden ">
            <MyOrderInstantSwapArrowRight />
          </span>
        </td>

        <td>{buyTokenAmount}</td>

        <td>{feeTier}</td>

        <td>
          <div className="w-14"></div>
        </td>

        <td>{orderRate}</td>

        <td>{created}</td>

        <td className={hoverOn === index ? ' rounded-tr-xl' : ' rounded-r-xl'}>
          {unclaim}
        </td>

        {/* {actions} */}
      </tr>

      {hoverOn === index && (
        <>
          <tr className="xs:flex z-20 relative  xs:flex-col whitespace-nowrap xs:bg-cardBg xs:bg-opacity-50  bottom-2 xs:bottom-0 w-full text-sm text-v3SwapGray bg-cardBg rounded-xl px-5 pb-5 pt-10 xs:px-3 xs:py-4 xs:text-xs">
            {swapBanner}
          </tr>

          <tr className="relative bottom-6 rounded-b-xl bg-portfolioBarBgColor">
            <td colSpan={8} className="rounded-b-xl">
              <div className="frcb pb-3 py-6 px-4 text-xs">
                <div className="frcs relative">
                  {!!orderTx && (
                    <a
                      className="flex items-center text-v3SwapGray cursor-pointer"
                      onMouseEnter={() => handleMouseEnter(orderTx)}
                      onMouseLeave={handleMouseLeave}
                      target="_blank"
                      rel="noopener noreferrer nofollow"
                    >
                      {loadingStates[orderTx] ? (
                        <>
                          Tx
                          <span className="loading-dots"></span>
                        </>
                      ) : (
                        <>
                          Tx
                          <span className="ml-1.5">
                            <HiOutlineExternalLink />
                          </span>
                        </>
                      )}
                      {hoveredTx === orderTx && (
                        <div className="w-44 absolute top-6 left-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
                          <div className="flex flex-col">
                            <div
                              className="mb-2 px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                              onMouseEnter={(e) => {
                                const arrow = e.currentTarget.querySelector(
                                  '.arrow'
                                ) as HTMLElement;
                                if (arrow) {
                                  arrow.style.display = 'block';
                                }
                              }}
                              onMouseLeave={(e) => {
                                const arrow = e.currentTarget.querySelector(
                                  '.arrow'
                                ) as HTMLElement;
                                if (arrow) {
                                  arrow.style.display = 'none';
                                }
                              }}
                              onClick={() =>
                                handleTxClick(
                                  orderTx,
                                  `${getConfig().explorerUrl}/txns`
                                )
                              }
                            >
                              <NearblocksIcon />
                              <p className="ml-2 text-sm">nearblocks</p>
                              <div
                                className="ml-3 arrow"
                                style={{ display: 'none' }}
                              >
                                <TxLeftArrow />
                              </div>
                            </div>
                            <div
                              className="px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                              onMouseEnter={(e) => {
                                const arrow = e.currentTarget.querySelector(
                                  '.arrow'
                                ) as HTMLElement;
                                if (arrow) {
                                  arrow.style.display = 'block';
                                }
                              }}
                              onMouseLeave={(e) => {
                                const arrow = e.currentTarget.querySelector(
                                  '.arrow'
                                ) as HTMLElement;
                                if (arrow) {
                                  arrow.style.display = 'none';
                                }
                              }}
                              onClick={() =>
                                handleTxClick(
                                  orderTx,
                                  `${
                                    getConfig().pikespeakUrl
                                  }/transaction-viewer`
                                )
                              }
                            >
                              <PikespeakIcon />
                              <p className="ml-2 text-sm">Pikespeak...</p>
                              <div
                                className="ml-3 arrow"
                                style={{ display: 'none' }}
                              >
                                <TxLeftArrow />
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </a>
                  )}
                </div>

                <div className="frcs">
                  {claimButton}

                  {actions}
                </div>
              </div>
            </td>
          </tr>
        </>
      )}

      {/* {hover && !ONLY_ZEROS.test(swapIn || '0') ? swapBanner : null} */}

      <div
        className="w-full mb-4 md:hidden lg:hidden"
        style={{
          zIndex: 20 - index,
        }}
      >
        {/* title */}
        <div className="rounded-t-xl relative bg-orderMobileTop px-3 pt-3">
          <div className="flex items-center relative justify-between">
            {sellTokenAmount}
            <MyOrderMobileArrow />
            {buyTokenAmount}
          </div>

          {created}

          <div className="absolute right-4 bottom-2.5 z-50  text-xs">
            {!!orderTx && (
              <a
                className="flex items-center text-v3SwapGray cursor-pointer"
                onMouseEnter={() => handleMouseEnter(orderTx)}
                onMouseLeave={handleMouseLeave}
                target="_blank"
                rel="noopener noreferrer nofollow"
              >
                {loadingStates[orderTx] ? (
                  <>
                    Tx
                    <span className="loading-dots"></span>
                  </>
                ) : (
                  <>
                    Tx
                    <span className="ml-1.5">
                      <HiOutlineExternalLink />
                    </span>
                  </>
                )}
                {hoveredTx === orderTx && (
                  <div className="w-44 absolute top-5 right-0 bg-poolDetaileTxBgColor border border-poolDetaileTxBorderColor rounded-lg p-2 shadow-lg z-50">
                    <div className="flex flex-col">
                      <div
                        className="mb-2 px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                        onMouseEnter={(e) => {
                          const arrow = e.currentTarget.querySelector(
                            '.arrow'
                          ) as HTMLElement;
                          if (arrow) {
                            arrow.style.display = 'block';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const arrow = e.currentTarget.querySelector(
                            '.arrow'
                          ) as HTMLElement;
                          if (arrow) {
                            arrow.style.display = 'none';
                          }
                        }}
                        onClick={() =>
                          handleTxClick(
                            orderTx,
                            `${getConfig().explorerUrl}/txns`
                          )
                        }
                      >
                        <NearblocksIcon />
                        <p className="ml-2 text-sm">nearblocks</p>
                        <div className="ml-3 arrow" style={{ display: 'none' }}>
                          <TxLeftArrow />
                        </div>
                      </div>
                      <div
                        className="px-3 py-2 hover:bg-poolDetaileTxHoverColor text-white rounded-md flex items-center"
                        onMouseEnter={(e) => {
                          const arrow = e.currentTarget.querySelector(
                            '.arrow'
                          ) as HTMLElement;
                          if (arrow) {
                            arrow.style.display = 'block';
                          }
                        }}
                        onMouseLeave={(e) => {
                          const arrow = e.currentTarget.querySelector(
                            '.arrow'
                          ) as HTMLElement;
                          if (arrow) {
                            arrow.style.display = 'none';
                          }
                        }}
                        onClick={() =>
                          handleTxClick(
                            orderTx,
                            `${getConfig().pikespeakUrl}/transaction-viewer`
                          )
                        }
                      >
                        <PikespeakIcon />
                        <p className="ml-2 text-sm">Pikespeak...</p>
                        <div className="ml-3 arrow" style={{ display: 'none' }}>
                          <TxLeftArrow />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </a>
            )}
          </div>
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
              <FormattedMessage defaultMessage={'Executed'} id="executed" />
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
        {new Big(order.original_deposit_amount || '0')
          .minus(order.original_amount || '0')
          .gt(0)
          ? swapBanner
          : null}
      </div>
    </Fragment>
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
  const pool_id_by_url = useDclPoolIdByCondition('all');

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

  const [activeOrderHoverOn, setActiveOrderHoverOn] = useState<number>(-1);

  const [historyOrderHoverOn, setHistoryOrderHoverOn] = useState<number>(-1);
  const [historyInfoOrderHoverOn, setHistoryInfoOrderHoverOn] =
    useState<number>(-1);

  const [sortOrderActive, setSorOrderActive] = useState<'asc' | 'desc'>('desc');

  const [sortOrderHistory, setSorOrderHistory] = useState<'asc' | 'desc'>(
    'desc'
  );

  const [historySortBy, setHistorySortBy] = useState<'claimed' | 'created'>(
    'created'
  );
  const [select_type, set_select_type] = useState<'all' | 'current'>('all');
  const [activeOrderList, setActiveOrderList] = useState<UserOrderInfo[]>();
  const [historyOrderList, setHistoryOrderList] = useState<UserOrderInfo[]>();
  const [historySwapInfoList, setHistorySwapInfoList] =
    useState<HistoryOrderSwapInfo[]>();

  const tokenIds = useMemo(() => {
    if (pool_id_by_url) {
      const [token_x, token_y, fee] = pool_id_by_url.split('|');
      return [token_x, token_y];
    }
    return [];
  }, [pool_id_by_url]);

  const tokens = useTokens(tokenIds) || [];
  const current_pair_tokens_map = tokens.reduce((acc, cur) => {
    return {
      ...acc,
      [cur.id]: cur,
    };
  }, {});

  useEffect(() => {
    if (activeOrder.length) {
      if (select_type == 'all') {
        setActiveOrderList(activeOrder);
      } else {
        setActiveOrderList(getCurrentPairOrders(activeOrder));
      }
    }
  }, [activeOrder, select_type, pool_id_by_url]);

  useEffect(() => {
    if (historyOrder.length) {
      if (select_type == 'all') {
        setHistoryOrderList(historyOrder);
      } else {
        setHistoryOrderList(getCurrentPairOrders(historyOrder));
      }
    }
  }, [historyOrder, select_type, pool_id_by_url]);
  useEffect(() => {
    if (historySwapInfo.length) {
      if (select_type == 'all') {
        setHistorySwapInfoList(historySwapInfo);
      } else {
        setHistorySwapInfoList(getCurrentPairSwapOrders(historySwapInfo));
      }
    }
  }, [historySwapInfo, select_type, pool_id_by_url]);

  function getCurrentPairOrders(orders: UserOrderInfo[]) {
    return orders.filter((order: UserOrderInfo) => {
      return order.pool_id == pool_id_by_url;
    });
  }
  function getCurrentPairSwapOrders(orders: HistoryOrderSwapInfo[]) {
    return orders.filter((order: HistoryOrderSwapInfo) => {
      return order.pool_id == pool_id_by_url;
    });
  }
  function OrderTab() {
    if (isMobile()) {
      return (
        <div className="frcb w-full">
          <div className="text-white font-gothamBold">
            <FormattedMessage
              id="your_orders"
              defaultMessage={'Your orders'}
            ></FormattedMessage>
          </div>

          <div
            className="flex text-13px p-1 rounded-xl text-white "
            style={{
              border: '1.5px solid rgba(145, 162, 174, 0.2)',
            }}
          >
            <button
              className={`px-3 rounded-lg py-1 ${
                orderType === 'active' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background: orderType === 'active' ? '#324451' : '',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                sessionStorage.setItem(ORDER_TYPE_KEY, 'active');
                setOrderType('active');
              }}
            >
              <span className="frcs">
                <FormattedMessage id="active" defaultMessage={'Active'} />
                {activeOrderList && activeOrderList.length > 0
                  ? ` (${activeOrderList.length})`
                  : null}
              </span>
            </button>

            <button
              className={`px-3 py-1 rounded-lg ${
                orderType === 'history' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background: orderType === 'history' ? '#324451' : '',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setOrderType('history');
                sessionStorage.setItem(ORDER_TYPE_KEY, 'history');
              }}
            >
              <span className="frcs">
                <FormattedMessage id="history" defaultMessage={'History'} />
                {historyOrderList && historyOrderList.length > 0
                  ? ` (${historyOrderList.length})`
                  : null}
              </span>
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex whitespace-nowrap  text-white mb-4">
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
            <FormattedMessage
              id="active_orders"
              defaultMessage={'Active Orders'}
            />
            {activeOrderList && activeOrderList.length > 0
              ? ` (${activeOrderList.length})`
              : null}
          </span>

          {orderType === 'active' && (
            <div
              className="w-full mt-2 bg-senderHot"
              style={{
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
            {historyOrderList && historyOrderList.length > 0
              ? ` (${historyOrderList.length})`
              : null}
          </span>

          {orderType === 'history' && (
            <div
              className="w-full mt-2 bg-senderHot"
              style={{
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
  function get_current_pairs() {
    if (pool_id_by_url && current_pair_tokens_map) {
      const [token_x, token_y, fee] = pool_id_by_url.split('|');
      const token_x_meta = current_pair_tokens_map[token_x];
      const token_y_meta = current_pair_tokens_map[token_y];
      if (token_x_meta?.symbol && token_y_meta?.symbol) {
        const tokens = sort_tokens_by_base([token_x_meta, token_y_meta]);
        return `${tokens[0].symbol}-${tokens[1].symbol}`;
      }
    }
    return '';
  }
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between xsm:flex-col xsm:items-end">
        {OrderTab()}
        <div className="flex items-center gap-6 xsm:mt-4 mb-4">
          <SwitchTabItem
            active={select_type == 'current'}
            clickEvent={() => {
              set_select_type('current');
            }}
          >
            Current: {get_current_pairs()}
          </SwitchTabItem>
          <SwitchTabItem
            active={select_type == 'all'}
            clickEvent={() => {
              set_select_type('all');
            }}
          >
            All
          </SwitchTabItem>
        </div>
      </div>

      {orderType === 'history' &&
        (!historyOrder || historyOrder.length === 0) && (
          <NoOrderCard text="history" />
        )}
      {orderType === 'active' && (!activeOrder || activeOrder.length === 0) && (
        <NoOrderCard text="active" />
      )}

      <table
        className="border-separate xsm:block"
        style={{
          borderSpacing: 0,
        }}
        onMouseLeave={() => {
          setActiveOrderHoverOn(-1);
          setHistoryOrderHoverOn(-1);
        }}
      >
        {orderType === 'active' && (
          <>
            <tr
              className={`mb-2.5 px-4 xs:hidden ${
                !activeOrder || activeOrder.length === 0 ? 'hidden' : ''
              } text-v3SwapGray text-sm  grid-cols-7 whitespace-nowrap`}
              onMouseEnter={() => {
                setActiveOrderHoverOn(-1);
                setHistoryOrderHoverOn(-1);
              }}
            >
              <th className="col-span-1 pl-3 text-left">
                <FormattedMessage id="you_sell" defaultMessage={'You Sell'} />
              </th>

              <th></th>

              <th className="col-span-1 text-left">
                <FormattedMessage id="you_buy" defaultMessage={'You Buy'} />
              </th>

              <th className=""></th>

              <th className=""></th>

              <th className="col-span-1 text-left">
                <FormattedMessage id="@price" defaultMessage={'@Price'} />
              </th>

              <th>
                <button
                  className="col-span-1 flex items-center "
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
              </th>

              <th>
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
              </th>
            </tr>
          </>
        )}

        {orderType === 'history' && (
          <>
            <tr
              className={`mb-2.5 px-4 xs:hidden ${
                !historyOrder || historyOrder.length === 0 ? 'hidden' : ''
              } text-v3SwapGray text-sm  whitespace-nowrap`}
              onMouseEnter={() => {
                setActiveOrderHoverOn(-1);
                setHistoryOrderHoverOn(-1);
              }}
            >
              <th className="pl-3 text-left">
                <FormattedMessage id="you_sell" defaultMessage={'You Sell'} />
              </th>

              <th></th>

              <th className="text-left">
                <FormattedMessage id="you_buy" defaultMessage={'You Buy'} />
              </th>

              <th className=""></th>

              <th className="col-span-1 text-left">
                <FormattedMessage id="@price" defaultMessage={'@Price'} />
              </th>

              <th>
                <button
                  className=" flex items-center"
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
                    {historySortBy === 'created' &&
                    sortOrderHistory === 'asc' ? (
                      <UpArrowVE />
                    ) : (
                      <DownArrowVE />
                    )}
                  </span>
                </button>
              </th>

              <th>
                <button
                  className="col-span-2 flex items-center text-right"
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
                    {historySortBy === 'claimed' &&
                    sortOrderHistory === 'asc' ? (
                      <UpArrowVE />
                    ) : (
                      <DownArrowVE />
                    )}
                  </span>
                </button>
              </th>

              <th className="col-span-1 text-right">
                <span className="pr-4">
                  <FormattedMessage id="status" defaultMessage={'Status'} />
                </span>
              </th>
            </tr>
          </>
        )}

        {orderType === 'active' &&
          activeOrderList &&
          activeOrderList.sort(activeOrderSorting).map((order, index) => {
            return (
              <ActiveLine
                tokensMap={tokensMap}
                hoverOn={activeOrderHoverOn}
                setHoverOn={setActiveOrderHoverOn}
                sellAmountToBuyAmount={sellAmountToBuyAmount}
                index={index}
                key={order.order_id}
                order={order}
                orderTx={
                  orderTxs?.find((t) => t.order_id === order.order_id)
                    ?.receipt_id || ''
                }
              />
            );
          })}
        {orderType === 'history' &&
          historyOrderList &&
          historyOrderList.sort(historyOrderSorting).map((order, index) => {
            return (
              <HistoryLine
                index={index}
                key={order.order_id}
                order={order}
                tokensMap={tokensMap}
                sellAmountToBuyAmount={sellAmountToBuyAmount}
                orderTx={
                  orderTxs?.find((t) => t.order_id === order.order_id)
                    ?.receipt_id || ''
                }
                setHoverOn={setHistoryOrderHoverOn}
                hoverOn={historyOrderHoverOn}
              />
            );
          })}
        {orderType === 'history' &&
          historySwapInfo &&
          historySwapInfo.length > 0 && (
            <tr
              onMouseEnter={() => {
                setActiveOrderHoverOn(-1);
                setHistoryOrderHoverOn(-1);
              }}
            >
              <td colSpan={8}>
                <div
                  className="inline-flex max-w-max items-center ml-4 text-primaryText mt-7  mb-3"
                  data-class="reactTip"
                  data-tooltip-id={'real_time_order_tip'}
                  data-place={'top'}
                  data-tooltip-html={getRealTimeOrderTip()}
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
              </td>
            </tr>
          )}
        {orderType === 'history' &&
          showHistoryInfo &&
          historySwapInfoList &&
          historySwapInfoList.length > 0 &&
          historySwapInfoList
            .sort((a, b) => Number(b.timestamp) - Number(a.timestamp))
            .map((sf, i) => {
              return (
                <HistorySwapInfoLine
                  index={i}
                  tokensMap={tokensMap}
                  key={sf.receipt_id}
                  token_in={sf.token_in}
                  token_out={sf.token_out}
                  amount_in={sf.amount_in}
                  amount_out={sf.amount_out}
                  orderTx={sf.receipt_id}
                  timestamp={sf.timestamp}
                  point={sf.point}
                  pool_id={sf.pool_id}
                  hoverOn={historyInfoOrderHoverOn}
                  setHoverOn={setHistoryInfoOrderHoverOn}
                />
              );
            })}
      </table>
    </div>
  );
}

function SwitchTabItem(props: any) {
  const { active, clickEvent } = props;
  return (
    <div
      className="flex items-center text-sm text-primaryText cursor-pointer"
      onClick={clickEvent}
    >
      <span className="flex items-center justify-center rounded-full w-3.5 h-3.5 border border-greenColor border-opacity-50 mr-1">
        <label
          className={`w-2 h-2 rounded-full bg-greenColor ${
            active ? '' : 'hidden'
          }`}
        ></label>
      </span>
      {props.children}
    </div>
  );
}

function MyOrderComponent() {
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

  if (!accountId) return null;

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
    <div className="max-w-7xl mx-auto flex flex-col xs:w-full md:5/6 lg:w-full">
      <PriceContext.Provider value={tokenPriceList}>
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

export default MyOrderComponent;
