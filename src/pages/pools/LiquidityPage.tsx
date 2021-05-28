import React, { useState } from 'react';
import { Card } from '~components/card/Card';
import { usePools } from '../../state/pool';
import Loading from '~components/layout/Loading';
import {getPrice, useTokens } from '../../state/token';
import { Link } from 'react-router-dom';
import { Pool } from '../../services/pool';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '../../utils/numbers';
import { round } from '~services/token';

function PoolRow({ pool }: { pool: Pool }) {
  const tokens = useTokens(pool.tokenIds);
  if (!tokens) return <Loading />;

  const images = tokens.map((token) => {
    const { icon, id } = token;
    if (icon) return <img key={id} className="h-6 w-6" src={icon} />;
    return <div key={id} className="h-6 w-6 rounded-full border"></div>;
  });

  return (
    <Link
      to={`/pool/${pool.id}`}
      className="grid grid-cols-12 py-2 content-center text-xs font-semibold text-gray-600"
    >
      <div className="grid grid-cols-2 col-span-1">{images}</div>
      <p className="grid grid-cols-2 col-span-5">
        <span>{tokens[0].symbol}={toPrecision(toReadableNumber(tokens[0].decimals || 24, pool.supplies[pool.tokenIds[0]]),4)}</span>
        <span>{tokens[1].symbol}={toPrecision(toReadableNumber(tokens[1].decimals || 24, pool.supplies[pool.tokenIds[1]]),4)}</span>
      </p>
      <p className="col-span-2">
        {getPrice(tokens,pool,pool.token0_ref_price)}
      </p>
      <p className="col-span-2">
        ${pool.tvl}
      </p>
      <p className="col-span-2">{calculateFeePercent(pool.fee)}%</p>
    </Link>
  );
}

export function LiquidityPage() {
  const [tokenName, setTokenName] = useState('');
  const [sortBy, setSoryBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const { pools, hasMore, nextPage } = usePools({ tokenName, sortBy, order, useIndexerData:true });
  if (!pools) return <Loading />;

  return (
    <div className="flex items-center flex-col">
      <div className="text-center pb-8">
        <div className="text-white text-3xl font-semibold">Liquidity Pools</div>
      </div>
      <Card width="md:w-2/3 lg:w-1/2">
        <div className="flex items-center justify-end pb-4">
          <div className="rounded-lg w-1/5 border my-2">
            <input
              className={`text-sm font-bold bg-inputBg focus:outline-none rounded-lg w-full py-2 px-3 text-greenLight`}
              placeholder="Search pools..."
              value={tokenName}
              onChange={(evt) => setTokenName(evt.target.value)}
            />
          </div>
        </div>
        <section>
          <header className="grid grid-cols-12 py-2 pb-4 text-left text-sm font-bold">
            <p className="col-span-1">Pair</p>
            <p className="col-span-5">Liquidity</p>
            <p
              className="col-span-2"
              onClick={() => {
                setSoryBy('tvl')
                setOrder(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              Market Price
            </p>
            <p className="col-span-2">
              Total Value Locked
            </p>
            <p
              className="col-span-2 cursor-pointer"
              onClick={() => {
                setSoryBy('fee')
                setOrder(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              Fee
            </p>
          </header>
          <div className="max-h-80 overflow-y-auto">
            {pools.map((pool, i) => (
              <PoolRow key={i} pool={pool} />
            ))}
            {pools.length === 0 ? (
              <div className="text-center text-xs font-semibold py-4">
                No match pool
              </div>
            ) : (
              ''
            )}
          </div>
        </section>
        {hasMore && (
          <div className="flex items-center justify-center pt-5">
            <button
              className="rounded-full text-xs text-white px-3 py-1.5 focus:outline-none font-semibold bg-greenLight"
              onClick={nextPage}
            >
              More
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}