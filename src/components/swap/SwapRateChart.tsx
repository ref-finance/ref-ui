import React, { useContext, useEffect, useState } from 'react';
import { Images, Symbols } from '../../components/stableswap/CommonComp';
import { TokenMetadata } from '../../services/ft-contract';
import { TokenPairRate, getTokenPairRate } from '../../services/indexer';
import { SwapRateExchange } from '../icon/Arrows';
import { useTokenRate24h } from '../../state/tokenRate';
import { maxBy, minBy } from 'lodash';

import {
  ResponsiveContainer,
  LineChart,
  BarChart,
  XAxis,
  YAxis,
  Bar,
  Line,
  BarProps,
  Tooltip,
  Cell,
  Area,
  AreaChart,
  ComposedChart,
  CartesianGrid,
} from 'recharts';

import { IoArrowUpOutline } from '../reactIcons';
import { displayNumberToAppropriateDecimals } from 'src/services/commonV3';
import moment from 'moment';
import { ChartNoData } from '../../components/icon/ChartNoData';
import { FormattedMessage } from 'react-intl';
import { OrderlyLoading } from '../../pages/Orderly/components/Common/Icons';
import { numberWithCommas } from '../../pages/Orderly/utiles';
import { useClientMobile } from '../../utils/device';
import { SwapProContext } from '../../pages/SwapPage';
import { scientificNotationToString, toPrecision } from '../../utils/numbers';
import Big from 'big.js';
import { toRealSymbol } from '../../utils/token';
import SwapProTab from './SwapProTab';
export interface SwapRateChartProps {
  tokenIn: TokenMetadata;
  tokenOut: TokenMetadata;
}

type Dimensions = '24H' | '7D' | '1M' | '1Y' | 'All';

const priceFormatter = (price: string | number) => {
  return numberWithCommas(
    Number(price) === 0
      ? 0
      : Number(price) <= 0.01 && Number(price) > 0
      ? toPrecision(scientificNotationToString(price.toString()), 6)
      : new Big(scientificNotationToString(price.toString())).toFixed(4)
  );
};

const REF_FI_SWAP_RATE_DIMENSIONS = 'REF_FI_SWAP_RATE_DIMENSIONS';

export default function SwapRateChart(props: SwapRateChartProps) {
  const { tokenIn, tokenOut } = props;

  const dimensionList = ['24H', '7D', '1M', '1Y', 'All'] as Dimensions[];

  const { swapMode, swapType } = useContext(SwapProContext);

  const isMobile = useClientMobile();

  const [priceList, setPriceList] = useState<TokenPairRate>();

  const [loadingPriceList, setLoadingPriceList] = useState<boolean>(false);

  const [reverseToken, setReverseToken] = useState<boolean>(false);

  const storedDimension = sessionStorage.getItem(
    REF_FI_SWAP_RATE_DIMENSIONS
  ) as Dimensions;

  const [displayDimension, setDisplayDimension] = useState<Dimensions>(
    storedDimension || '24H'
  );

  const [displayTokenIn, setDisplayTokenIn] = useState<TokenMetadata>(tokenIn);
  const [displayTokenOut, setDisplayTokenOut] =
    useState<TokenMetadata>(tokenOut);

  const diff = useTokenRate24h({
    base_token: displayTokenOut,
    token: displayTokenIn,
  });

  useEffect(() => {
    if (reverseToken) {
      setDisplayTokenOut(tokenIn);
      setDisplayTokenIn(tokenOut);
    } else {
      setDisplayTokenIn(tokenIn);
      setDisplayTokenOut(tokenOut);
    }
  }, [reverseToken, tokenIn, tokenOut]);

  const changeDisplayDimension = (d: Dimensions) => {
    sessionStorage.setItem(REF_FI_SWAP_RATE_DIMENSIONS, d);
    setDisplayDimension(d);
  };

  const getDimension = (raw: Dimensions) => {
    if (raw === '24H') return 'D';
    if (raw === '7D') return 'W';
    if (raw === '1M') return 'M';
    if (raw === '1Y') return 'Y';
    if (raw === 'All') return 'All';
  };

  useEffect(() => {
    if (!displayTokenIn || !displayTokenOut) return;
    setLoadingPriceList(true);
    getTokenPairRate({
      token: displayTokenIn,
      base_token: displayTokenOut,
      dimension: getDimension(displayDimension),
    })
      .then(setPriceList)
      .finally(() => {
        setLoadingPriceList(false);
      });
  }, [displayTokenIn?.id, displayTokenOut?.id, displayDimension]);

  const loading = loadingPriceList;

  if (!displayTokenIn || !displayTokenOut) return null;

  const RenderTick = (tickProps: any) => {
    let { x, y, payload, index } = tickProps;

    const { value, offset } = payload;

    x =
      index === 0
        ? x + isMobile
          ? 15
          : 0
        : value ===
          priceList.price_list[priceList.price_list.length - 1].date_time
        ? x - 10
        : x;

    y = y + 4;
    const date = moment(value);

    if (displayDimension === '24H') {
      return (
        <text
          fontSize={'10px'}
          fill="#7E8A93"
          x={x}
          y={y - 1}
          textAnchor="middle"
        >
          {date.format('HH:mm')}
        </text>
      );
    } else {
      return (
        <text
          fontSize={'10px'}
          fill="#7E8A93"
          x={x}
          y={y - 1}
          textAnchor="middle"
        >
          {isMobile ? date.format('MMM DD') : date.format('MMMM DD')}
        </text>
      );
    }
  };

  const RenderYTick = (tickProps: any) => {
    let { x, y, payload, index } = tickProps;

    const { value, offset } = payload;

    let decimals = 0;

    const max = maxBy(priceList.price_list, (item) => item.price)?.price || 0;
    const min = minBy(priceList.price_list, (item) => item.price)?.price || 0;

    const a = max - min;

    if (a > 0 && a <= 0.01) {
      decimals = 6;
    } else if (a > 0.01 && a <= 1) {
      decimals = 4;
    } else if (a > 1 && a <= 100) {
      decimals = 2;
    } else if (a > 100 && a <= 10000) {
      decimals = 0;
    }

    let displayY = new Big(
      scientificNotationToString(value.toString())
    ).toFixed(decimals);

    if (Number(a) > 10000) {
      displayY = scientificNotationToString(
        (Math.floor(Number(value) / 100) * 100).toString()
      );
    }
    const isAllSamePrice = priceList.price_list.every(
      (item) => item.price === priceList.price_list[0].price
    );

    if (index === 0 || index === 5) return null;

    if (isAllSamePrice && (index === 1 || index == 4)) return null;

    return (
      <text
        fontSize={'10px'}
        fill="#7E8A93"
        x={x + 4}
        y={y}
        textAnchor="middle"
      >
        {numberWithCommas(displayY)}
      </text>
    );
  };

  const SwapRateCustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload || !payload?.[1]) return null;

    const price = payload[1].payload.price;

    return (
      <div className=" border px-2 py-1.5 rounded-md  bg-toolTipBoxBgColor border-toolTipBoxBorderColor min-w-max">
        <div className="text-xs text-primaryText">
          {moment(payload[1].payload.date_time).format('HH:mm MMMM DD, YYYY')}
        </div>

        <div className="text-white text-sm">
          {numberWithCommas(
            Number(price) === 0
              ? 0
              : Number(price) <= 0.01 && Number(price) > 0
              ? toPrecision(scientificNotationToString(price.toString()), 6)
              : new Big(scientificNotationToString(price.toString())).toFixed(4)
          )}
        </div>
      </div>
    );
  };

  const CustomizedDot = (props: any) => {
    const { cx, cy, stroke, payload, value } = props;

    if (isMobile) return null;

    const price = payload.price;

    if (props.index === priceList?.price_list?.length - 1) {
      let decimals = 0;

      const max = maxBy(priceList.price_list, (item) => item.price)?.price || 0;
      const min = minBy(priceList.price_list, (item) => item.price)?.price || 0;

      const a = max - min;

      if (a > 0 && a <= 0.01) {
        decimals = 6;
      } else if (a > 0.01 && a <= 1) {
        decimals = 4;
      } else if (a > 1 && a <= 100) {
        decimals = 2;
      } else if (a > 100 && a <= 10000) {
        decimals = 0;
      }

      let displayY = new Big(
        scientificNotationToString(!price ? '0' : price.toString())
      ).toFixed(decimals);

      if (Number(a) > 10000) {
        displayY = scientificNotationToString(
          (Math.floor(Number(price) / 100) * 100).toString()
        );
      }

      return (
        <svg
          x={cx}
          y={cy - 10}
          xmlns="http://www.w3.org/2000/svg"
          width="37"
          height="16"
          viewBox="0 0 37 16"
          fill="none"
        >
          <foreignObject
            overflow={'visible'}
            height={16}
            width={200}
            x={displayY.length * 5 - priceFormatter(price).length * 5}
            y={2}
          >
            <div className="frcs relative ">
              <div
                className={`rounded  ${
                  diff.direction === 'down'
                    ? 'bg-sellColorNew'
                    : 'bg-gradientFromHover'
                } frcs px-1 h-4 relative right-1.5`}
                style={{
                  fontSize: '10px',
                  color: '#1D2932',
                  height: '14px',
                }}
              >
                {priceFormatter(price)}
              </div>
            </div>
          </foreignObject>

          {/* <path
            d="M6.45039 0.677939C6.83007 0.246948 7.37673 0 7.95111 0H35C36.1046 0 37 0.895431 37 2V14C37 15.1046 36.1046 16 35 16H7.9511C7.37672 16 6.83007 15.7531 6.45039 15.3221L1.16467 9.32206C0.498964 8.56639 0.498964 7.43361 1.16467 6.67794L6.45039 0.677939Z"
            fill="#00C6A2"
          />
          <text x="8" y="12" fontSize={10} fill="#1D2932">
          </text> */}
        </svg>
      );
    }

    return null;
  };

  return (
    <div className="w-full gotham_font xsm:mt-5">
      <div className="frcb ml-4 xsm:ml-1 xsm:mb-2">
        <div className="frcs">
          <Images
            borderStyle="1px solid #00D6AF"
            size="6"
            tokens={[displayTokenIn, displayTokenOut]}
            uId={'swap-chart-header' + swapMode + '-' + swapType}
            allowSameToken
            className="xsm:text-sm"
          />

          <Symbols
            className="mx-2"
            tokens={[displayTokenIn, displayTokenOut]}
            separator="/"
          />
          <div className="xsm:hidden">
            <SwapRateExchange
              onChange={() => {
                setReverseToken(!reverseToken);
              }}
            />
          </div>
        </div>
        <SwapProTab />
      </div>

      <div className="frcs mb-2 lg:hidden">
        {dimensionList.map((d) => {
          return (
            <div
              key={d}
              className={`text-xs mx-1 xsm:mx-0.5 p-1 cursor-pointer ${
                d === displayDimension
                  ? 'text-white rounded-md bg-limitOrderFeeTiersBorderColor'
                  : 'text-primaryText'
              }`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();

                changeDisplayDimension(d);
              }}
            >
              {d}
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="frcs xs:flex xs:items-center xs:mb-2 xs:justify-between xs:flex-wrap mt-3">
          <div className="frcs ml-4  xsm:ml-0">
            <span className="text-white text-2xl  mr-1">
              {diff ? priceFormatter(diff.curPrice) : '-'}
            </span>

            {diff && (
              <span className="mr-1.5 ml-0.5 text-sm text-primaryText">
                {displayTokenOut && toRealSymbol(displayTokenOut.symbol)}
              </span>
            )}
            {diff && (
              <span
                className={`frcs text-xs rounded-md px-1 py-0.5
            ${
              diff.direction === 'up'
                ? 'text-gradientFromHover bg-gradientFromHover bg-opacity-20'
                : diff.direction === 'down'
                ? 'text-sellRed bg-opacity-20 bg-sellRed'
                : 'bg-primaryText bg-opacity-20 text-primaryText'
            }
            
            `}
              >
                {diff.direction !== 'unChange' && (
                  <IoArrowUpOutline
                    className={`${
                      diff.direction === 'down' ? 'transform  rotate-180  ' : ''
                    } `}
                  />
                )}

                {diff.percent}
              </span>
            )}
            <div className="lg:hidden ml-1">
              <SwapRateExchange
                onChange={() => {
                  setReverseToken(!reverseToken);
                }}
              />
            </div>
          </div>
          {diff && (
            <div className=" lg:hidden text-primaryText  flex  items-end text-10px text-right ">
              <span className="whitespace-nowrap">
                <FormattedMessage
                  id="last_updated"
                  defaultMessage={'Last Updated'}
                ></FormattedMessage>
              </span>

              <span className="ml-1">{diff.lastUpdate}</span>
            </div>
          )}

          {diff && (
            <>
              <div className="xsm:hidden text-primaryText frcs ml-8 text-sm">
                <span>
                  <FormattedMessage
                    id="low"
                    defaultMessage={'Low'}
                  ></FormattedMessage>
                  {`(${displayDimension})`}
                </span>

                <span className="font-gothamBold ml-1.5 text-white">
                  {priceList &&
                    priceFormatter(
                      minBy(priceList.price_list, (p) => p.price)?.price || 0
                    )}
                </span>
              </div>

              <div className="frcs xsm:hidden ml-7 text-primaryText text-sm">
                <span>
                  <FormattedMessage
                    id="high"
                    defaultMessage={'High'}
                  ></FormattedMessage>
                  {`(${displayDimension})`}
                </span>

                <span className="font-gothamBold ml-1.5 text-white">
                  {priceList &&
                    priceFormatter(
                      maxBy(priceList.price_list, (p) => p.price)?.price || 0
                    )}
                </span>
              </div>
            </>
          )}
        </div>
        <div className="frcs xsm:hidden">
          {dimensionList.map((d) => {
            return (
              <div
                className={`text-xs mx-1 xsm:mx-0.5 p-1 cursor-pointer ${
                  d === displayDimension
                    ? 'text-white rounded-md bg-limitOrderFeeTiersBorderColor'
                    : 'text-primaryText'
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  changeDisplayDimension(d);
                }}
              >
                {d}
              </div>
            );
          })}
        </div>
      </div>

      {diff && (
        <div
          className="frcs  "
          style={{
            overflow: 'anywhere',
          }}
        >
          <div className="lg:hidden flex-wrap text-primaryText frcs   text-sm">
            <span className="mr-1.5">
              <FormattedMessage
                id="low"
                defaultMessage={'Low'}
              ></FormattedMessage>
              {`(${displayDimension})`}
            </span>

            <span className="font-gothamBold  text-white">
              {priceList &&
                priceFormatter(
                  minBy(priceList.price_list, (p) => p.price)?.price || 0
                )}
            </span>
          </div>

          <div className="frcs flex-wrap lg:hidden  ml-7 text-primaryText text-sm">
            <span className="mr-1.5">
              <FormattedMessage
                id="high"
                defaultMessage={'High'}
              ></FormattedMessage>
              {`(${displayDimension})`}
            </span>

            <span className="font-gothamBold  text-white">
              {priceList &&
                priceFormatter(
                  maxBy(priceList.price_list, (p) => p.price)?.price || 0
                )}
            </span>
          </div>
        </div>
      )}

      {diff && (
        <div className="mt-2 xsm:hidden text-primaryText ml-4 text-10px ">
          <FormattedMessage
            id="last_updated"
            defaultMessage={'Last Updated'}
          ></FormattedMessage>

          <span className="ml-1">{diff.lastUpdate}</span>
        </div>
      )}

      {loading && (
        <div
          className="flex flex-col relative items-center justify-center"
          style={{
            width: '100%',
            height: '300px',
          }}
        >
          <OrderlyLoading></OrderlyLoading>
        </div>
      )}

      {!loading && priceList && priceList.price_list.length === 0 && (
        <div
          className="flex flex-col items-center justify-center"
          style={{
            width: '100%',
            height: '300px',
          }}
        >
          <ChartNoData></ChartNoData>

          <div className="text-limitOrderInputColor text-sm mt-5">
            <FormattedMessage
              id="swap_chart_no_data"
              defaultMessage={'Not enough data for the chart right now.'}
            />
          </div>
        </div>
      )}
      {!loading && priceList && priceList.price_list.length > 0 && diff && (
        <div
          className="w-full "
          style={{ height: '300px', width: 'calc(100% + 35px)' }}
        >
          <ResponsiveContainer width={'100%'} height={'100%'}>
            <ComposedChart
              data={priceList.price_list.map((p) => {
                return {
                  ...p,
                  price: Number(p.price),
                  stickLast:
                    priceList.price_list[priceList.price_list.length - 1].price,
                };
              })}
            >
              <defs>
                <linearGradient
                  id="colorGradient_token_rate"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="0%"
                    stopColor={
                      diff && diff.direction === 'down' ? '#FF6A8E' : '#00c6a2'
                    }
                    stopOpacity={0.1}
                  />
                  <stop
                    offset="100%"
                    stopColor={
                      diff && diff.direction === 'down'
                        ? 'rgba(255, 106, 142, 0) '
                        : 'rgba(0, 214, 175, 0)'
                    }
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="date_time"
                tickLine={false}
                axisLine={false}
                tick={<RenderTick />}
                interval={
                  priceList.price_list.length < 10
                    ? 1
                    : priceList.price_list.length > 18
                    ? Math.ceil(priceList.price_list.length / 20) * 3
                    : 2
                }
              />

              <YAxis
                dataKey="price"
                tickLine={false}
                tickCount={6}
                axisLine={false}
                orientation="right"
                type="number"
                tick={<RenderYTick />}
                height={300}
                domain={([dataMin, dataMax]: any) => [
                  dataMin - (dataMin + dataMax) * 0.025,
                  dataMax + (dataMin + dataMax) * 0.025,
                ]}
              />

              <Tooltip
                cursor={{
                  opacity: '0.3',
                  fill: diff.direction === 'down' ? '#FF6A8e' : '#00c6a2',
                  strokeDasharray: '2, 2',
                }}
                content={<SwapRateCustomTooltip />}
              />
              <Line
                dataKey="stickLast"
                stroke={diff.direction === 'down' ? '#FF6A8e' : '#00c6a2'}
                opacity={0.3}
                strokeDasharray={'2, 2'}
                dot={false}
                activeDot={false}
              />

              <Area
                dataKey="price"
                type={'monotone'}
                dot={<CustomizedDot />}
                stroke={diff.direction === 'down' ? '#FF6A8e' : '#00c6a2'}
                strokeWidth={2}
                strokeLinejoin="round"
                fillOpacity={1}
                height={300}
                strokeLinecap="round"
                fill="url(#colorGradient_token_rate)"
                activeDot={{
                  stroke: '#0D1A23',
                  strokeWidth: 2,
                  fill: diff.direction === 'down' ? '#FF6A8e' : '#00FFD1',
                  r: 5,
                }}
                isAnimationActive={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
