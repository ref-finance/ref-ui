import React, { useEffect, useMemo, useState, useContext } from 'react';
import { getAssets } from '~services/indexer';
import { useClientMobile, isClientMobie } from '../../utils/device';
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
import { toPrecision, formatWithCommas } from '~utils/numbers';
export default function AssetChart() {
  const [assetData, setAssetData] = useState([]);
  const [dimension, setDimension] = useState([
    { text: '24H', key: 'H' },
    { text: '7D', key: 'W' },
    { text: '1M', key: 'M' },
  ]);
  const [activeDimension, setActiveDimension] = useState<'M' | 'W' | 'H'>('H');
  useEffect(() => {
    getAssets(activeDimension).then((res) => {
      setAssetData(res);
    });
  }, [activeDimension]);

  function switchDimension(key: 'M' | 'W' | 'H') {
    setActiveDimension(key);
  }
  const CustomTooltip = (params: any) => {
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
  if (assetData.length == 0) return null;
  return (
    <div className="flex flex-col justify-between w-full px-3 pt-5 pb-2">
      <div className="flex items-center justify-end">
        {dimension.map((item: any) => {
          return (
            <span
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
      <div style={{ height: '320px' }}>
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
            {isClientMobie() ? null : (
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
            )}

            <Tooltip
              wrapperStyle={
                {
                  // display:'none',
                  // backgroundColor:'red',
                  // border:'10px solid orange',
                  // padding:'0'
                }
              }
              // itemStyle={{
              //   backgroundColor:'red',
              //   border:'10px solid orange'
              // }}
              // contentStyle={{border:'10px solid orange', backgroundColor:'red'}}
              content={<CustomTooltip />}
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
    </div>
  );
}