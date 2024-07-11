import React, { useContext, useMemo, useState } from 'react';
import { PieChart, Pie, Sector, Cell } from 'recharts';
import Big from 'big.js';
import { MemeContext } from './context';
import { getMemeContractConfig, getMemeDataConfig } from './memeConfig';
import { emptyObject } from './tool';
import { Seed } from '../../services/farm';
import { toReadableNumber } from '../../utils/numbers';
import { isMobile } from 'src/utils/device';
import {
  formatPercentage,
  toInternationalCurrencySystem_number,
} from '../../utils/uiNumber';
const is_mobile = isMobile();

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
        strokeWidth={0}
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
        <image x="43%" y="24%" width={44} height={44} href={activeEntry.icon} />
        <text
          x="50%"
          y="46%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: 'white',
            fontSize: '16px',
          }}
        >
          {activeEntry.symbol}
        </text>
        <text
          x="50%"
          y="64%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: 'white',
            fontSize: '38px',
            fontWeight: '700',
          }}
        >
          {activeEntry.percent}
        </text>
        <text
          x="50%"
          y="76%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fill: 'white', fontSize: '16px' }}
        >
          {toInternationalCurrencySystem_number(activeEntry.value)} xREF
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

  const sectorStrokeWidth = 2;
  const sectorStrokeColor = '#00121f';
  if (!chartData) return null;
  return (
    <div className="flex justify-center">
      <PieChart width={is_mobile ? 285 : 285} height={is_mobile ? 285 : 285}>
        <Pie
          activeIndex={activeIndex}
          activeShape={customActiveShape}
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={is_mobile ? 130 : 130}
          outerRadius={is_mobile ? 156 : 156}
          onMouseEnter={onPieEnter}
          onMouseLeave={onPieLeave}
          stroke={sectorStrokeColor}
          strokeWidth={sectorStrokeWidth}
          paddingAngle={1}
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
