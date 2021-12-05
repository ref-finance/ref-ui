import React, { useState } from 'react';
import { Card } from '~components/card/Card';
import { FormattedMessage } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import { TokenMetadata } from '~services/ft-contract';
import { Pool } from '~services/pool';
import { useIntl } from 'react-intl';
import {
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie,
  LabelListProps,
  LabelProps,
} from 'recharts';
import {
  toReadableNumber,
  toInternationalCurrencySystem,
  toPrecision,
  percent,
} from '~utils/numbers';
import { InfoLine } from './LiquidityComponents';
import _ from 'lodash';

// function LabelRender({
//   cx,
//   cy,
//   midAngle,
//   innerRadius,
//   outerRadius,
//   percent,
//   index,
//   pool,
//   tokens,
//   ...rest
// }: any) {
//   const RADIAN = Math.PI / 180;
//   const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
//   const x = cx + radius * Math.cos(-midAngle * RADIAN);
//   const y = cy + radius * Math.sin(-midAngle * RADIAN);
//   return (
//     <svg>
//       <image
//         src={tokens[index].symbol}
//         className="rounded-full w-7 h-7 border border-gradientFromHover border-solid"
//       />
//     </svg>
//   );
// }

function TokenChart({ tokens, pool }: { tokens: TokenMetadata[]; pool: Pool }) {
  const data = tokens.map((token, i) => {
    return {
      name: token.symbol,
      value: Number(toReadableNumber(token.decimals, pool.supplies[token.id])),
    };
  });
  const color = {
    DAI: 'rgba(255, 199, 0, 0.45)',
    USDT: 'rgba(0, 198, 162, 0.47)',
    USDC: 'rgba(0, 163, 255, 0.45)',
  };

  return (
    <PieChart width={200} height={200}>
      <Pie
        data={data}
        fill="#8884d8"
        innerRadius={60}
        outerRadius={80}
        dataKey="value"
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
    `(${toPrecision(percent(value, totalShares.toString()).toString(), 2)}%)`
  );
};

export default function ({
  totalStableCoins,
  tokens,
  pool,
}: {
  totalStableCoins: string;
  tokens: TokenMetadata[];
  pool: Pool;
}) {
  const [showReserves, setShowReserves] = useState<boolean>(false);
  const intl = useIntl();

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
        className={`text-xs text-primaryText ${showReserves && 'hidden'}`}
        width="w-full"
      >
        <div className="">
          <FormattedMessage
            id="total_stable_coins"
            defaultMessage="Total stablecoins"
          />
        </div>
        <div className="text-white mt-1">{totalStableCoins}</div>
        <div className="flex justify-center">
          <TokenChart tokens={tokens} pool={pool} />
        </div>
        {tokens.map((token, i) => {
          return (
            <InfoLine
              key={token.symbol}
              title={token.symbol}
              value={calculateTokenShare({ pool, token, tokens })}
            />
          );
        })}
        <InfoLine
          title={intl.formatMessage({ id: 'total_stable_coins' })}
          value={totalStableCoins || '0'}
        />

        <InfoLine
          title={intl.formatMessage({ id: 'pool_fee' })}
          value="-"
          className="my-4"
        />
        <InfoLine
          title={intl.formatMessage({ id: 'liquidity_utilisation' })}
          value="-"
        />
        <InfoLine
          title={intl.formatMessage({ id: 'daily_volume' })}
          value="-"
        />
      </Card>
    </>
  );
}
