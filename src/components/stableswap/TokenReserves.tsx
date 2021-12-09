import React, { useEffect, useState } from 'react';
import { Card } from '~components/card/Card';
import { FormattedMessage } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import { TokenMetadata } from '~services/ft-contract';
import { Pool } from '~services/pool';
import { useIntl } from 'react-intl';
import { PieChart, Cell, Pie } from 'recharts';
import {
  toReadableNumber,
  toInternationalCurrencySystem,
  toPrecision,
  percent,
} from '~utils/numbers';
import { InfoLine } from './LiquidityComponents';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { useDayVolume } from '~state/pool';

function TokenChart({ tokens, pool }: { tokens: TokenMetadata[]; pool: Pool }) {
  const tokensData = calculateTokenValueAndShare(pool, tokens);
  const data = tokens.map((token, i) => {
    return {
      name: token.symbol,
      value: Number(toReadableNumber(token.decimals, pool.supplies[token.id])),
      token: token,
      displayV: tokensData[token.id].display2,
    };
  });
  const color = {
    DAI: 'rgba(255, 199, 0, 0.45)',
    USDT: 'rgba(0, 198, 162, 0.47)',
    USDC: 'rgba(0, 163, 255, 0.45)',
  };

  function customLabel(props: any) {
    const {
      cx,
      cy,
      x,
      y,
      midAngle,
      innerRadius,
      outerRadius,
      displayV,
      token,
    } = props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x1 = cx + radius * Math.cos(-midAngle * RADIAN) - 15;
    const y1 = cy + radius * Math.sin(-midAngle * RADIAN) - 15;
    return (
      <g>
        <text
          x={x}
          y={y}
          fill="white"
          fontSize="14px"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {token.symbol}
        </text>
        <text
          x={x}
          y={y + 15}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {displayV}
        </text>
        <image width="30" height="30" x={x1} y={y1} xlinkHref={token.icon} />
      </g>
    );
  }

  return (
    <PieChart width={380} height={280}>
      <Pie
        data={data}
        fill="#8884d8"
        innerRadius={60}
        outerRadius={80}
        dataKey="value"
        labelLine={false}
        label={customLabel}
      >
        {data.map((entry, index) => {
          return (
            <Cell
              key={`cell-${index}`}
              fill={color[tokens[index].symbol]}
              stroke=""
            />
          );
        })}
      </Pie>
    </PieChart>
  );
}

const calculateTokenShare = ({
  token,
  pool,
  tokens,
}: {
  pool: Pool;
  token: TokenMetadata;
  tokens: TokenMetadata[];
}) => {
  const value = toReadableNumber(token.decimals, pool.supplies[token.id]);
  const totalShares = _.sumBy(
    Object.values(pool.supplies).map((v, i) =>
      toReadableNumber(tokens[i].decimals, v)
    ),
    (o) => Number(o)
  );

  return (
    toInternationalCurrencySystem(value, 2).toString() +
    ` (${toPrecision(percent(value, totalShares.toString()).toString(), 2)}%)`
  );
};

const calculateTotalStableCoins = (pool: Pool, tokens: TokenMetadata[]) => {
  const coinsAmounts = Object.values(pool.supplies).map((amount, i) =>
    toReadableNumber(tokens[i].decimals, amount)
  );

  const totalCoins = BigNumber.sum(...coinsAmounts)
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  return toInternationalCurrencySystem(totalCoins, 3);
};
const calculateTokenValueAndShare = (
  pool: any,
  tokens: any
): Record<string, any> => {
  let result: Record<string, any> = {};
  const totalShares = _.sumBy(
    Object.values(pool.supplies).map((v: string, i) =>
      toReadableNumber(tokens[i].decimals, v)
    ),
    (o) => Number(o)
  );

  let otherTokenNumber = 0;
  tokens.forEach((token: any, index: number) => {
    const value = toReadableNumber(token.decimals, pool.supplies[token.id]);
    let percentStr: string | number;
    if (index == tokens.length - 1) {
      percentStr = new BigNumber(100).minus(otherTokenNumber).toFixed();
    } else {
      percentStr = toPrecision(
        percent(value, totalShares.toString()).toString(),
        2
      );
      otherTokenNumber += Number(percentStr);
    }
    result[token.id] = {
      token,
      value,
      percentStr,
      display: `${toInternationalCurrencySystem(value, 2)} (${percentStr}%)`,
      display2: `${toInternationalCurrencySystem(value, 2)} / ${percentStr}%`,
    };
  });
  return result;
};
export default function ({
  totalStableCoins,
  tokens,
  pool,
  inSwapPage,
}: {
  totalStableCoins: string;
  tokens: TokenMetadata[];
  pool: Pool;
  inSwapPage?: boolean;
}) {
  const [showReserves, setShowReserves] = useState<boolean>(false);
  const [chart, setChart] = useState(null);
  const { id, shareSupply } = pool;
  let volume;
  let utilisationDisplay;
  volume = useDayVolume(id.toString());
  if (volume) {
    const total = toReadableNumber(18, shareSupply);
    const utilisation = new BigNumber(volume)
      .dividedBy(total)
      .multipliedBy(100);
    if (new BigNumber('0.01').isGreaterThan(utilisation)) {
      utilisationDisplay = '<0.01%';
    } else {
      utilisationDisplay = utilisation.toFixed(2) + '%';
    }
  }
  const tokensData = calculateTokenValueAndShare(pool, tokens);
  const intl = useIntl();
  useEffect(() => {
    const chart = <TokenChart tokens={tokens} pool={pool} />;
    setChart(chart);
  }, []);
  return (
    <>
      <div
        className="flex justify-center my-4"
        onClick={() => {
          setShowReserves(!showReserves);
        }}
      >
        <div className="flex items-center text-white cursor-pointer">
          <p className="block text-xs">
            <FormattedMessage
              id="token_reserves"
              defaultMessage="Token Reserves"
            />
          </p>
          <div className="pl-1 text-sm">
            {showReserves ? <FaAngleUp /> : <FaAngleDown />}
          </div>
        </div>
      </div>

      <Card
        padding="p-8"
        bgcolor="bg-cardBg"
        className={`text-xs text-primaryText ${!showReserves && 'hidden'}`}
        width="w-full"
      >
        <div className="">
          <FormattedMessage
            id="total_stable_coins"
            defaultMessage="Total stablecoins"
          />
        </div>
        <div className="text-white mt-1">
          {calculateTotalStableCoins(pool, tokens)}
        </div>
        <div className="flex justify-center">{chart}</div>
        {Object.values(tokensData).map(({ token, display }) => {
          return (
            <InfoLine key={token.symbol} title={token.symbol} value={display} />
          );
        })}
        <InfoLine
          title={intl.formatMessage({ id: 'total_stable_coins' })}
          value={calculateTotalStableCoins(pool, tokens) || '0'}
        />

        <InfoLine
          title={intl.formatMessage({ id: 'pool_fee' })}
          value={`${pool.fee}%`}
          className="my-4"
        />
        <InfoLine
          title={intl.formatMessage({ id: 'liquidity_utilisation' })}
          value={utilisationDisplay || '-'}
        />
        <InfoLine
          title={intl.formatMessage({ id: 'daily_volume' })}
          value={volume ? toInternationalCurrencySystem(volume) : '-'}
        />
      </Card>
    </>
  );
}
