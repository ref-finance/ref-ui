import React, { useEffect, useMemo, useState } from 'react';
import { Card } from '../../components/card/Card';
import { FormattedMessage } from 'react-intl';
import { FaAngleUp, FaAngleDown, FaExchangeAlt } from 'react-icons/fa';
import { TokenMetadata } from '../../services/ft-contract';
import { Pool } from '../../services/pool';
import { useIntl } from 'react-intl';
import { PieChart, Cell, Pie } from 'recharts';
import { isMobile } from '../../utils/device';
import { getPool, getPoolsByIds } from '../../services/indexer';
import {
  toReadableNumber,
  toInternationalCurrencySystem,
  toPrecision,
  percent,
  calculateFeePercent,
} from '../../utils/numbers';
import { InfoLine } from './LiquidityComponents';
import _ from 'lodash';
import BigNumber from 'bignumber.js';
import { useDayVolume } from '~state/pool';
import { scientificNotationToString } from '../../utils/numbers';
import { get24hVolume } from '../../services/indexer';
import {
  ALL_STABLE_POOL_IDS,
  BTC_STABLE_POOL_ID,
  STABLE_POOL_TYPE,
} from '../../services/near';
import getConfig from '../../services/config';

export function OnlyTokenReserves() {}

function TokenChart({
  tokens,
  coinsAmounts,
  tokensMap,
}: {
  tokens: TokenMetadata[];
  coinsAmounts: { [id: string]: BigNumber };
  tokensMap: { [id: string]: TokenMetadata };
}) {
  const tokensData = calculateTokenValueAndShare(
    tokens,
    coinsAmounts,
    tokensMap
  );
  const data = tokens.map((token, i) => {
    return {
      name: token.symbol,
      value: Number(coinsAmounts[token.id]),
      token: token,
      displayV: tokensData[token.id].display2,
    };
  });
  const color = {
    DAI: 'rgba(255, 199, 0, 0.45)',
    USDT: 'rgba(0, 198, 162, 0.47)',
    USDC: 'rgba(0, 163, 255, 0.45)',
    USN: 'rgba(255, 255, 255, 0.45)',
    cUSD: 'rgba(69, 205, 133, 0.6)',
    HBTC: '#4D85F8',
    WBTC: '#ED9234',
    STNEAR: 'rgba(160, 160, 255, 0.5)',
    NEAR: 'rgba(0, 198, 162, 0.5)',
    LINEAR: 'rgba(64, 129, 255, 0.5)',
    NEARXC: '#4d5971',
    NearXC: '#4d5971',
  };

  const noBorderTokens = ['LINEAR'];

  const noBgTokens = ['LINEAR'];

  function customLabel(props: any) {
    let { cx, cy, x, y, midAngle, innerRadius, outerRadius, displayV, token } =
      props;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x1 = cx + radius * Math.cos(-midAngle * RADIAN) - 15;
    const y1 = cy + radius * Math.sin(-midAngle * RADIAN) - 15;
    if (y < cy) {
      y = y - 5;
    }

    return (
      <g>
        <text
          x={x}
          y={y - 2}
          fill="white"
          fontSize="14px"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {token.symbol}
        </text>
        <text
          x={x}
          y={y + 13}
          fill="white"
          textAnchor={x > cx ? 'start' : 'end'}
          dominantBaseline="central"
        >
          {displayV}
        </text>
        {noBorderTokens.includes(token.symbol) && (
          <circle
            r={16}
            cx={x1 + 15}
            cy={y1 + 15}
            stroke="#00c6a2"
            fill={'#0F1D27'}
            strokeWidth={1}
          />
        )}
        <foreignObject width="30" height="30" x={x1} y={y1}>
          <img
            src={token.icon}
            alt=""
            className="rounded-full"
            style={{
              width: '30px',
              height: '30px',
            }}
          />
        </foreignObject>
        {/* <image width="30" height="30" x={x1} y={y1} xlinkHref={token.icon} /> */}
      </g>
    );
  }
  let innerRadius = 55;
  let outerRadius = 75;
  let width = 400;
  if (isMobile()) {
    innerRadius = 35;
    outerRadius = 55;
    width = 380;
  }
  return (
    <PieChart width={width} height={280}>
      <Pie
        data={data}
        fill="#8884d8"
        innerRadius={innerRadius}
        outerRadius={outerRadius}
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

export const calculateTotalStableCoins = (
  pools: Pool[],
  tokens: { [id: string]: TokenMetadata }
) => {
  let coinsAmounts: { [id: string]: BigNumber } = {};

  pools.forEach((p) => {
    Object.entries(p.supplies).map(([id, amount]) => {
      coinsAmounts[id] = (
        coinsAmounts?.[id] ? coinsAmounts[id] : new BigNumber(0)
      ).plus(toReadableNumber(tokens[id].decimals, amount));
    });
  });

  const totalCoins = BigNumber.sum(...Object.values(coinsAmounts))
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  return { totalCoins, coinsAmounts };
};
const calculateTokenValueAndShare = (
  tokens: TokenMetadata[],
  coinsAmounts: { [id: string]: BigNumber },
  tokensMap: { [id: string]: TokenMetadata }
): Record<string, any> => {
  let result: Record<string, any> = {};
  const totalShares = _.sumBy(Object.values(coinsAmounts), (o) => Number(o));

  let otherTokenNumber = '0';

  Object.keys(tokensMap)
    .sort((a, b) => {
      const usdId =
        getConfig().networkId === 'mainnet' ? 'usn' : 'usdn.testnet';

      if (a === usdId) {
        return 1;
      } else {
        return -1;
      }
    })
    .reverse()
    .forEach((key, index: number) => {
      const token: TokenMetadata = tokensMap[key];
      const value = scientificNotationToString(
        coinsAmounts[token.id].toString()
      );
      let percentStr: string | number;
      if (index == tokens.length - 1) {
        percentStr = new BigNumber(100).minus(otherTokenNumber).toFixed(2);
      } else {
        percentStr = toPrecision(
          percent(value, totalShares.toString()).toString(),
          2
        );
        otherTokenNumber = BigNumber.sum(
          otherTokenNumber,
          percentStr
        ).valueOf();
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

const TypeTab = ({
  setType,
  type,
}: {
  setType: (type: STABLE_POOL_TYPE) => void;
  type: STABLE_POOL_TYPE;
}) => {
  return (
    <div className="flex items-center justify-center text-lg border-b border-gray-300 border-opacity-20 mb-10">
      <div
        className={`w-52 py-2 mb-4 text-center ${
          type === STABLE_POOL_TYPE.USD
            ? 'text-white bg-black bg-opacity-20'
            : ''
        } rounded-2xl cursor-pointer`}
        onClick={() => {
          setType(STABLE_POOL_TYPE.USD);
        }}
      >
        USD
      </div>
      <div
        className={`w-52 py-2 mb-4 text-center ${
          type === STABLE_POOL_TYPE.BTC
            ? 'text-white bg-black bg-opacity-20'
            : ''
        } rounded-2xl cursor-pointer`}
        onClick={() => {
          setType(STABLE_POOL_TYPE.BTC);
        }}
      >
        BTC
      </div>
      <div
        className={`w-52 py-2 mb-4 text-center ${
          type === STABLE_POOL_TYPE.NEAR
            ? 'text-white bg-black bg-opacity-20'
            : ''
        } rounded-2xl cursor-pointer`}
        onClick={() => {
          setType(STABLE_POOL_TYPE.NEAR);
        }}
      >
        NEAR
      </div>
    </div>
  );
};

export default function ({
  tokens,
  pools,
  swapPage,
  hiddenChart,
  hiddenMag,
  className,
  forPool,
  type = STABLE_POOL_TYPE.USD,
  setType,
}: {
  tokens: TokenMetadata[];
  pools: Pool[];
  swapPage?: boolean;
  hiddenMag?: boolean;
  hiddenChart?: boolean;
  className?: string;
  forPool?: boolean;
  type?: STABLE_POOL_TYPE;
  setType?: (type: STABLE_POOL_TYPE) => void;
}) {
  const [showReserves, setShowReserves] = useState<boolean>(true);
  const [chart, setChart] = useState(null);

  const ids = pools.map((p) => p.id);
  const [volume, setVolume] = useState<string>(null);

  const [tvl, setTvl] = useState<number>(null);

  let utilisationDisplay;

  const magId = 'token_reserves';
  const magDefaultMessage = forPool ? 'Pool Detail' : 'Token Reserves';

  const totalCoinsId = forPool
    ? 'tvl'
    : type === STABLE_POOL_TYPE.BTC
    ? 'total_bitcoins'
    : type === STABLE_POOL_TYPE.NEAR
    ? 'total_near_amount'
    : 'total_stable_coins';

  const totalUSDValueId = 'total_usd_value';

  const totalValueId =
    type === STABLE_POOL_TYPE.BTC
      ? 'bitcoin_value'
      : type === STABLE_POOL_TYPE.NEAR
      ? 'near_value'
      : 'stable_coin_value';
  const totalValueMessage =
    type === STABLE_POOL_TYPE.BTC
      ? 'Bitcoin Value'
      : type === STABLE_POOL_TYPE.NEAR
      ? 'NEAR Value'
      : 'StableCoin Value';

  useEffect(() => {
    setTvl(null);
    setVolume(null);
  }, [type]);

  useEffect(() => {
    if (ids) {
      if (ids.length > 1) {
        Promise.all(ids.map((id) => get24hVolume(id.toString()))).then(
          (vols) => {
            setVolume(_.sumBy(vols, (o) => Number(o)).toString());
          }
        );
      } else {
        get24hVolume(ids[0].toString()).then(setVolume);
      }

      getPoolsByIds({ pool_ids: ids.map((id) => id.toString()) }).then(
        (pools) => {
          setTvl(_.sumBy(pools, (o) => o.tvl));
        }
      );
    }
  }, [pools.map((p) => p.id).join('|')]);

  if (volume && tvl) {
    const utilisation = new BigNumber(volume).dividedBy(tvl).multipliedBy(100);
    if (new BigNumber('0.01').isGreaterThan(utilisation)) {
      utilisationDisplay = '<0.01%';
    } else {
      utilisationDisplay = utilisation.toFixed(2) + '%';
    }
  }
  const tokensMap: { [id: string]: TokenMetadata } = tokens.reduce(
    (pre, cur) => ({ ...pre, [cur.id]: cur }),
    {}
  );

  const intl = useIntl();

  const calTotalStableCoins = useMemo(() => {
    try {
      return calculateTotalStableCoins(pools, tokensMap).totalCoins;
    } catch (error) {
      return '0';
    }
  }, [pools, tokensMap]);

  const coinsAmounts = useMemo(() => {
    try {
      return calculateTotalStableCoins(pools, tokensMap).coinsAmounts;
    } catch (error) {
      return {};
    }
  }, [pools, tokensMap]);

  const tokensData = useMemo(() => {
    try {
      return calculateTokenValueAndShare(tokens, coinsAmounts, tokensMap);
    } catch (error) {
      return {};
    }
  }, [pools, tokens, coinsAmounts, tokensMap]);
  useEffect(() => {
    const chartList: any[] = [];
    pools
      .sort((a, b) => {
        return a.id - b.id;
      })
      .forEach((p: Pool) => {
        const coinsAmountsPerPool = {};
        const tokensPerPool: TokenMetadata[] = [];
        const tokensMapPerPool = {};
        Object.entries(p.supplies).map(([id, amount]) => {
          coinsAmountsPerPool[id] = toReadableNumber(
            tokensMap[id].decimals,
            amount
          );
          tokensPerPool.push(tokensMap[id]);
          tokensMapPerPool[id] = tokensMap[id];
        });
        chartList.push({
          coinsAmountsPerPool,
          tokensPerPool,
          tokensMapPerPool,
        });
      });

    const chartContainer = (
      <div className="flex flex-col items-center">
        {chartList.map((chartData, index) => {
          return (
            <div
              key={index}
              className={index == 1 ? 'xs:-mt-10 md:-mt-10' : ''}
            >
              <TokenChart
                tokens={chartData.tokensPerPool}
                coinsAmounts={chartData.coinsAmountsPerPool}
                tokensMap={chartData.tokensMapPerPool}
              />
            </div>
          );
        })}
      </div>
    );
    setChart(chartContainer);
  }, [type]);

  return (
    <div
      className={`${
        swapPage || forPool ? 'relative bottom-10' : ''
      } ${className}`}
    >
      {hiddenMag ? null : (
        <span
          className={`px-5 rounded-t-xl text-sm text-farmText mx-auto flex items-center justify-center cursor-pointer bg-cardBg pt-3 ${
            showReserves ? 'pb-5' : 'pb-1.5'
          }`}
          style={{
            borderTop: '1px solid #415462',
            width: '175px',
          }}
          onClick={() => {
            setShowReserves(!showReserves);
          }}
        >
          <span>
            <FormattedMessage id={magId} defaultMessage={magDefaultMessage} />
          </span>
          <span className="ml-2">
            {showReserves ? <FaAngleUp /> : <FaAngleDown />}
          </span>
        </span>
      )}

      <Card
        padding="p-8"
        bgcolor="bg-cardBg"
        className={`text-xs text-primaryText ${!showReserves && 'hidden'}`}
        width="w-full"
      >
        {forPool ? null : <TypeTab type={type} setType={setType} />}
        <div className={forPool ? 'hidden' : ''}>
          <FormattedMessage
            id={totalValueId}
            defaultMessage={totalValueMessage}
          />
        </div>
        <div
          className={`text-white mt-1 ${forPool ? 'hidden' : ''}`}
          title={toPrecision(tvl?.toString() || '0', 0)}
        >
          $
          {!tvl
            ? '-'
            : tvl < 0.001
            ? ' <0.001'
            : toInternationalCurrencySystem(tvl?.toString(), 3)}
        </div>
        <div className={`flex justify-center`}>{chart}</div>
        {Object.values(tokensData)
          .sort((a, b) => Number(b.value) - Number(a.value))
          .map(({ token, display }) => {
            return (
              <InfoLine
                key={token.symbol}
                title={token.symbol}
                value={display}
                valueTitle={toPrecision(
                  scientificNotationToString(coinsAmounts[token.id].toString()),
                  0
                )}
              />
            );
          })}
        <InfoLine
          title={intl.formatMessage({ id: totalCoinsId })}
          value={
            toInternationalCurrencySystem(
              forPool ? tvl?.toString() : calTotalStableCoins,
              3
            ) || '0'
          }
          valueTitle={toPrecision(
            forPool ? tvl?.toString() || '0' : calTotalStableCoins,
            0
          )}
        />
        {type !== 'USD' && (
          <InfoLine
            title={intl.formatMessage({ id: totalUSDValueId })}
            value={
              !tvl
                ? '$-'
                : tvl < 0.001
                ? '$<0.001'
                : `$${toInternationalCurrencySystem(tvl.toString(), 3) || '0'}`
            }
            valueTitle={toPrecision(tvl?.toString() || '0', 0)}
          />
        )}
        <div className={'py-0.5'}></div>

        <InfoLine
          title={intl.formatMessage({ id: 'liquidity_utilisation' })}
          value={utilisationDisplay || '-'}
          tipShow={true}
          tipContent={`<label class='text-xs'>${intl.formatMessage({
            id: 'volume_ratio',
          })}</label>`}
        />
        <InfoLine
          title={intl.formatMessage({ id: 'daily_volume' })}
          value={volume ? toInternationalCurrencySystem(volume) : '-'}
        />
      </Card>
    </div>
  );
}
