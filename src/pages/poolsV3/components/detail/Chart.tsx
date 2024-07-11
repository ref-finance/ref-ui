import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  VolumeChart,
  TVLChart,
  ChartType,
  ChartChangeButton,
  MobileChartChangeButton,
} from '../../../pools/DetailsPage';
import { get_pool_marketdepth } from 'src/services/swapV3';
import { useV3VolumeChart, useV3TvlChart } from 'src/state/pool';
import { Card } from 'src/components/card/Card';
import { isClientMobie } from '../../../../utils/device';
import { ChartNoData } from 'src/components/icon/ChartNoData';
import { getPriceByPoint, TOKEN_LIST_FOR_RATE } from 'src/services/commonV3';
import { BigNumber } from 'bignumber.js';
import { toPrecision, formatWithCommas } from '../../../../utils/numbers';
import { SwitchButtonIcon } from '../../../../components/icon/V3';
import { FormattedMessage, useIntl } from 'react-intl';
import DclChart from '../../../../components/d3Chart/DclChart';

export function Chart(props: any) {
  const { poolDetail, tokenPriceList } = props;
  const [depthData, setDepthData] = useState();
  const [chartDisplay, setChartDisplay] = useState<ChartType>('liquidity');
  useEffect(() => {
    getChartData();
  }, []);
  async function getChartData() {
    const depthData = await get_pool_marketdepth(poolDetail.pool_id);
    setDepthData(depthData);
  }
  const monthVolume = useV3VolumeChart(poolDetail.pool_id);
  const monthTVL = useV3TvlChart(poolDetail.pool_id);
  let mobileHeight;
  if (chartDisplay == 'liquidity') {
    mobileHeight = 'auto';
  } else {
    mobileHeight = '400px';
  }
  return (
    <Card
      width="w-full"
      className="relative rounded-2xl lg:mr-4 mb-4 h-full flex flex-col items-center"
      padding="px-7 py-5 xsm:px-1 xsm:pt-0"
      bgcolor={'bg-transparent'}
      style={{
        height: isClientMobie() ? mobileHeight : '470px',
      }}
    >
      {chartDisplay === 'volume' ? (
        <VolumeChart
          data={monthVolume}
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
          showLiqudityButton={true}
        />
      ) : chartDisplay === 'tvl' ? (
        <TVLChart
          data={monthTVL}
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
          showLiqudityButton={true}
        />
      ) : (
        <LiquidityChart
          data={{ poolDetail, depthData }}
          chartDisplay={chartDisplay}
          setChartDisplay={setChartDisplay}
        ></LiquidityChart>
      )}
    </Card>
  );
}
let timer: any;
function LiquidityChart(props: any) {
  const { data, chartDisplay, setChartDisplay } = props;
  const { poolDetail, depthData } = data;
  const isMobile = isClientMobie();
  const svgDefaultWidth = isMobile
    ? document.documentElement.clientWidth - 32 || '330'
    : 750;
  const [chartLoading, setChartLoading] = useState<boolean>(true);
  const [noData, setNoData] = useState<boolean>(true);
  const [rateDirection, setRateDirection] = useState(true);
  const [svgWidth, setSvgWidth] = useState(svgDefaultWidth);
  const refDom = useRef(null);
  useEffect(() => {
    if (poolDetail?.token_x_metadata) {
      if (
        TOKEN_LIST_FOR_RATE.indexOf(poolDetail?.token_x_metadata.symbol) > -1
      ) {
        setRateDirection(false);
      } else {
        setRateDirection(true);
      }
    }
  }, [poolDetail]);
  useEffect(() => {
    if (depthData) {
      const { liquidities } = depthData;
      const list = Object.values(liquidities);
      if (list.length == 0) {
        setNoData(true);
      } else {
        setNoData(false);
      }
      setChartLoading(false);
    } else {
      setChartLoading(true);
    }
  }, [depthData, rateDirection]);
  const rateDOM = useMemo(() => {
    const { current_point, token_x_metadata, token_y_metadata } = poolDetail;
    const rate =
      Math.pow(10, token_x_metadata.decimals) /
      Math.pow(10, token_y_metadata.decimals);
    let price = getPriceByPoint(current_point, rate);
    if (!rateDirection) {
      price = new BigNumber(1).dividedBy(price).toFixed();
    }
    let displayRate;
    if (new BigNumber(price).isLessThan('0.001')) {
      displayRate = ' < 0.001';
    } else {
      displayRate = ` = ${formatWithCommas(toPrecision(price.toString(), 3))}`;
    }
    return (
      <span title={price} className="flex items-center flex-wrap xsm:text-sm">
        1 {rateDirection ? token_x_metadata.symbol : token_y_metadata.symbol}
        &nbsp;
        <span>
          {displayRate}{' '}
          {rateDirection ? token_y_metadata.symbol : token_x_metadata.symbol}
        </span>
      </span>
    );
  }, [poolDetail, rateDirection]);
  useEffect(() => {
    if (isMobile) return;
    if (refDom.current) {
      setSvgWidth(refDom.current.clientWidth || svgDefaultWidth);
      window.onresize = () => {
        clearTimeout(timer);
        timer = setTimeout(() => {
          setSvgWidth(refDom?.current?.clientWidth || svgDefaultWidth);
        }, 50);
      };
    }
  }, [refDom.current]);
  function switchRate() {
    setRateDirection(!rateDirection);
  }
  return (
    <>
      <div
        ref={refDom}
        className={`relative z-50 flex items-center xsm:flex-col-reverse xsm:items-start justify-between w-full mb-4 ${
          noData ? 'opacity-70' : ''
        }`}
      >
        <div className="flex flex-col">
          <div className="flex items-center">
            <span className="text-base text-white">{rateDOM}</span>
            <SwitchButtonIcon
              onClick={switchRate}
              className="cursor-pointer ml-2 flex-shrink-0"
            ></SwitchButtonIcon>
          </div>
          <span className="text-sm text-primaryText xsm:text-xs">
            <FormattedMessage id="current_price" />
          </span>
        </div>
        {isMobile ? (
          <MobileChartChangeButton
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={true}
          ></MobileChartChangeButton>
        ) : (
          <ChartChangeButton
            className="self-start"
            chartDisplay={chartDisplay}
            setChartDisplay={setChartDisplay}
            showLiqudityButton={true}
          />
        )}
      </div>
      {!chartLoading && noData ? (
        <EmptyLiquidityChart></EmptyLiquidityChart>
      ) : (
        <div className="mt-16">
          <DclChart
            pool_id={poolDetail?.pool_id}
            config={{
              controlHidden: true,
              svgWidth,
              svgHeight: isMobile ? '250' : '300',
            }}
            reverse={!rateDirection}
          ></DclChart>
        </div>
      )}
    </>
  );
}
function EmptyLiquidityChart() {
  return (
    <div className="absolute w-full h-full left-0 right-0 top-0 bottom-0">
      <div className="flex items-center justify-center absolute w-full h-full left-0 right-0 top-0 bottom-0  bg-chartBg opacity-70 z-10">
        <div className="relative flex flex-col">
          <ChartNoData />
          <span className="text-base text-gray-500">
            <FormattedMessage id="no_data" defaultMessage="No Data" />
          </span>
        </div>
      </div>
      <div className="absolute bottom-5 left-7 right-7 xs:hidden md:hidden">
        <div className="border border-gradientFrom w-full mb-2" />
        <div className="flex text-xs text-gray-500 justify-between">
          {[
            '24',
            '31',
            '07',
            '14',
            '21',
            '28',
            '04',
            '11',
            '18',
            '25',
            '02',
            '09',
          ].map((d, i) => {
            return <div key={i}>{d}</div>;
          })}
        </div>
      </div>
    </div>
  );
}
