import React from 'react';
import { PieChart, Pie, Sector, Cell } from 'recharts';

const data = [
  {
    name: 'Blackdragon',
    number: '37.8%',
    price: '5,020.35 xREF',
    value: 400,
    color: '#FEF9D7',
  },
  {
    name: 'Lonk',
    number: '12.3%',
    price: '5,020.35 xREF',
    value: 300,
    color: '#41A14C',
  },
  {
    name: 'Neko',
    number: '10.6%',
    price: '5,020.35 xREF',
    value: 300,
    color: '#C1C1C1',
  },
  {
    name: 'Shitzu',
    number: '12.8%',
    price: '5,020.35 xREF',
    value: 200,
    color: '#AF38D9',
  },
  {
    name: 'UWON',
    number: '8.8%',
    price: '5,020.35 xREF',
    value: 200,
    color: '#EBB200',
  },
];

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
  const [activeIndex, setActiveIndex] = React.useState(0);

  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

  const STROKE_WIDTH = 10;
  const HOVER_INCREASE = 5;

  const renderCenteredText = (data, activeIndex) => {
    if (activeIndex < 0 || activeIndex >= data.length) return null;

    const activeEntry = data[activeIndex];

    return (
      <>
        <text
          x="50%"
          y="40%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: 'white',
            fontSize: '20px',
            fontWeight: '700',
          }}
        >
          {activeEntry.name}
        </text>
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{
            fill: 'white',
            fontSize: '42px',
            fontWeight: '700',
          }}
        >
          {activeEntry.number}
        </text>
        <text
          x="50%"
          y="60%"
          textAnchor="middle"
          dominantBaseline="central"
          style={{ fill: 'white', fontSize: '20px' }}
        >
          {activeEntry.price}
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
  const sectorStrokeColor = '#213441';

  return (
    <div className="flex justify-center">
      <PieChart width={500} height={440}>
        <Pie
          activeIndex={activeIndex}
          activeShape={customActiveShape}
          data={data}
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
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.color}
              stroke={sectorStrokeColor}
              strokeWidth={sectorStrokeWidth}
            />
          ))}
        </Pie>
        {activeIndex !== -1 && renderCenteredText(data, activeIndex)}
      </PieChart>
    </div>
  );
};

export default MyPieChart;
