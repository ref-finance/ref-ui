import React, { useContext, useMemo, useState } from 'react';
import { PieChart, Pie, Sector, Cell } from 'recharts';
import Big from 'big.js';
import { MemeContext } from './context';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { emptyObject } from './tool';
import { Seed } from '../../services/farm';
import { toReadableNumber } from '../../utils/numbers';
import {
  formatPercentage,
  formatWithCommas_number,
} from '../../utils/uiNumber';

const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="transparent"
      />
    </g>
  );
};

const MyPieChart = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { xrefSeeds, allTokenMetadatas } = useContext(MemeContext);
  const chartData = useMemo(() => {
    if (!emptyObject(xrefSeeds) && !emptyObject(allTokenMetadatas)) {
      const { MEME_TOKEN_XREF_MAP } = getMemeContractConfig();
      const { pie_color } = getMemeDataConfig();
      const chartData = [];
      const totalStakedAmount = Object.entries(MEME_TOKEN_XREF_MAP)
        .map(([memeTokenId, xrefContractId]) => {
          const xrefSeed: Seed = xrefSeeds[xrefContractId];
          const stakedAmount = toReadableNumber(
            xrefSeed.seed_decimal,
            xrefSeed.total_seed_amount
          );
          chartData.push({
            value: Big(stakedAmount).toNumber(),
            symbol: allTokenMetadatas?.[memeTokenId]?.symbol,
            icon: allTokenMetadatas?.[memeTokenId]?.icon,
            color: pie_color[memeTokenId],
          });
          return stakedAmount;
        })
        .reduce((sum, cur) => sum.plus(cur), Big(0));
      chartData.forEach((data) => {
        const percent = totalStakedAmount.gt(0)
          ? Big(data.value).div(totalStakedAmount).mul(100).toFixed()
          : 0;
        data.percent = formatPercentage(percent);
      });
      chartData.sort((b, a) => a.value - b.value);
      return chartData;
    }
  }, [xrefSeeds, allTokenMetadatas]);
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(0);
  };

  const STROKE_WIDTH = 10;
  const HOVER_INCREASE = 5;

  const renderCenteredText = (data, activeIndex) => {
    if (activeIndex < 0 || activeIndex >= data.length) return null;

    const activeEntry = data[activeIndex];

    return (
      <>
        <image x="45%" y="25%" width={40} height={40} href={activeEntry.icon} />
        <text
          x="50%"
          y="42%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: 'white',
            fontSize: '20px',
            fontWeight: '700',
          }}
        >
          {activeEntry.symbol}
        </text>
        <text
          x="50%"
          y="55%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: 'white',
            fontSize: '42px',
            fontWeight: '700',
          }}
        >
          {activeEntry.percent}
        </text>
        <text
          x="50%"
          y="68%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fill: 'white', fontSize: '20px' }}
        >
          {formatWithCommas_number(activeEntry.value)} xREF
        </text>
      </>
    );
  };

  const customActiveShape = (props) => {
    // eslint-disable-next-line react/prop-types
    if (props.index === activeIndex) {
      return renderActiveShape({
        ...props,
        // eslint-disable-next-line react/prop-types
        outerRadius: props.outerRadius + HOVER_INCREASE,
      });
    }
    return renderActiveShape(props);
  };

  const sectorStrokeWidth = 3;
  const sectorStrokeColor = '#21232F';
  if (!chartData) return null;
  return (
    <div className="flex justify-center">
      <PieChart width={345} height={345}>
        <Pie
          activeIndex={activeIndex}
          activeShape={customActiveShape}
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={130}
          outerRadius={172.5}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          stroke={sectorStrokeColor}
          strokeWidth={sectorStrokeWidth}
        >
          {chartData.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke={sectorStrokeColor}
              strokeWidth={sectorStrokeWidth}
            />
          ))}
        </Pie>
        {activeIndex !== -1 && renderCenteredText(chartData, activeIndex)}
      </PieChart>
    </div>
  );
};

export default MyPieChart;
