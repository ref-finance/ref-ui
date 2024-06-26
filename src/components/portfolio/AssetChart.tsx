import React, { useEffect, useMemo, useState, useContext } from 'react';
import { getAssets } from 'src/services/indexer';
import { useClientMobile, isClientMobie, isMobile } from '../../utils/device';
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
} from 'recharts';
import BigNumber from 'bignumber.js';
import { toPrecision, formatWithCommas } from 'src/utils/numbers';
import { DotTopArea, DotBottomArea } from '../../components/icon/Portfolio';
import { ChartNoData } from '../../components/icon/ChartNoData';
import { ConnectToNearBtn } from 'src/components/button/Button';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { PortfolioData } from '../../pages/Portfolio';
import { getAccountId } from './Tool';
import { FormattedMessage, useIntl } from 'react-intl';

const is_mobile = isMobile();
const chartAreaHeight = is_mobile ? '150px' : '280px';
export default function AssetChart() {
  const { set_history_total_asset, set_history_total_asset_done } =
    useContext(PortfolioData);
  const [assetData, setAssetData] = useState([]);
  const [assetDataDone, setAssetDataDone] = useState<boolean>(false);
  const [dimension, setDimension] = useState([
    { text: '24H', key: 'H' },
    { text: '7D', key: 'W' },
    { text: '1M', key: 'M' },
    { text: 'All', key: 'ALL' },
  ]);
  const [activeDimension, setActiveDimension] = useState<
    'M' | 'W' | 'H' | 'ALL'
  >('H');
  const { globalState } = useContext(WalletContext);
  const accountId = getAccountId();
  const isSignedIn = !!accountId || globalState.isSignedIn;
  useEffect(() => {
    if (isSignedIn) {
      getAssets(activeDimension).then((res) => {
        setAssetData(res);
        setAssetDataDone(true);
        if (activeDimension == 'H') {
          set_history_total_asset(res?.[0]?.assets || '0');
          set_history_total_asset_done(true);
        }
      });
    }
  }, [activeDimension, isSignedIn]);

  function switchDimension(key: 'M' | 'W' | 'H') {
    setActiveDimension(key);
  }
  const CustomTooltipNode = (params: any) => {
    const { active, payload } = params;
    if (active && payload && payload.length) {
      const { assets, date_itme } = payload[0].payload;
      const assetsBig = new BigNumber(assets);
      let dislay_asset;
      if (assetsBig.isEqualTo(0)) {
        dislay_asset = '$0';
      } else if (assetsBig.isLessThan('0.01')) {
        dislay_asset = '<$0.01';
      } else {
        dislay_asset =
          '$' + formatWithCommas(toPrecision(assetsBig.toFixed(), 2));
      }
      let display_time;
      const [ymd, hh] = date_itme.split(' ');
      const [week, month, day, year] = new Date(ymd.replace(/-/g, '/'))
        .toDateString()
        .split(' ');
      if (hh) {
        display_time = `${month} ${day} ${year} ${hh}:00`;
      } else {
        display_time = `${month} ${day} ${year}`;
      }
      return (
        <div className="flex flex-col border border-toolTipBoxBorderColor rounded-md bg-toolTipBoxBgColor py-2.5 px-3">
          <span className="text-xs text-primaryText">{display_time}</span>
          <span className="text-sm text-white mt-2">{dislay_asset}</span>
        </div>
      );
    }
    return <div></div>;
  };
  return (
    <div className="flex flex-col justify-between w-full px-3 pt-5 pb-2 xsm:pt-3">
      <div className="flex items-center justify-end">
        {dimension.map((item: any) => {
          return (
            <span
              key={item.key}
              onClick={() => {
                switchDimension(item.key);
              }}
              style={{
                height: '24px',
              }}
              className={`flex cursor-pointer items-center justify-center text-xs px-1 mx-1 rounded-lg ${
                activeDimension == item.key
                  ? 'bg-chartTabBgColor text-white'
                  : 'text-primaryText text-opacity-70'
              }`}
            >
              {item.text}
            </span>
          );
        })}
      </div>
      {!isSignedIn ? <UnloginArea></UnloginArea> : null}
      {isSignedIn && assetData.length == 0 && assetDataDone ? (
        <NoDataArea></NoDataArea>
      ) : null}
      {isSignedIn && assetData.length > 0 ? (
        <div style={{ height: chartAreaHeight }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={assetData}>
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c6a2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00c6a2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <defs>
                <linearGradient id="colorGradient2" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="5%" stopColor="#6A28FF" stopOpacity={1} />
                  <stop offset="95%" stopColor="#00FFD1" stopOpacity={1} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date_itme"
                tickLine={false}
                axisLine={false}
                tickFormatter={(value, index) => {
                  const [ymd, hh] = value.split(' ');
                  const [week, month, day, year] = new Date(
                    ymd.replace(/-/g, '/')
                  )
                    .toDateString()
                    .split(' ');
                  if (activeDimension == 'H') {
                    return `${hh}:00`;
                  } else if (activeDimension == 'W') {
                    return `${month} ${day} ${hh}:00`;
                  } else {
                    return `${day} ${month}`;
                  }
                }}
              />
              <Tooltip
                // wrapperStyle={
                //   {
                //     display:'none',
                //     backgroundColor:'red',
                //     border:'10px solid orange',
                //     padding:'0'
                //   }
                // }
                // itemStyle={{
                //   backgroundColor:'red',
                //   border:'10px solid orange'
                // }}
                // contentStyle={{border:'10px solid orange', backgroundColor:'red'}}
                content={<CustomTooltipNode />}
                cursor={{ opacity: '0.3' }}
              />
              <Area
                dataKey="assets"
                dot={false}
                stroke="url(#colorGradient2)"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorGradient)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      ) : null}
    </div>
  );
}

function UnloginArea() {
  return (
    <div
      className="relative flex flex-col flex-grow overflow-hidden items-center justify-center bg-darkBlueColor border border-cardBg rounded-xl mt-5 mb-10 xsm:mt-3 xsm:mb-0"
      style={{ height: chartAreaHeight }}
    >
      <DotTopArea className="absolute left-0 top-0 xsm:transform xsm:scale-50 xsm:origin-top-left"></DotTopArea>
      <DotBottomArea className="absolute right-0 bottom-0 xsm:transform xsm:scale-50 xsm:origin-bottom-right"></DotBottomArea>
      <span className="text-sm text-primaryText">
        <FormattedMessage id="Welcome"></FormattedMessage>
      </span>
      <span className="text-sm text-primaryText mt-0.5">
        <FormattedMessage id="ConnectView"></FormattedMessage>
      </span>
      <div className="mt-4 w-60 relative z-10">
        <ConnectToNearBtn></ConnectToNearBtn>
      </div>
    </div>
  );
}
function NoDataArea() {
  return (
    <div
      className="relative flex flex-col flex-grow overflow-hidden items-center justify-center bg-darkBlueColor border border-cardBg rounded-xl mt-5 mb-10 xsm:mt-3 xsm:mb-0"
      style={{ height: chartAreaHeight }}
    >
      <DotTopArea className="absolute left-0 top-0 xsm:transform xsm:scale-50 xsm:origin-top-left"></DotTopArea>
      <DotBottomArea className="absolute right-0 bottom-0 xsm:transform xsm:scale-50 xsm:origin-bottom-right"></DotBottomArea>
      <ChartNoData></ChartNoData>
      <span className="text-sm text-primaryText mb-10 xsm:mb-5">
        <FormattedMessage id="no_data" />
      </span>
    </div>
  );
}
