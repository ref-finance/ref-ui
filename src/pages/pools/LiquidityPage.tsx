import React, { useState } from 'react';
import { Card } from '~components/card';
import { usePools } from '../../state/pool';
import Loading from '~components/layout/Loading';
import { useTokens } from '../../state/token';
import { Link } from 'react-router-dom';
import { Pool } from '../../services/pool';
import {
  calculateFeePercent,
  toRoundedReadableNumber,
} from '../../utils/numbers';

function PoolRow({ pool }: { pool: Pool }) {
  const tokens = useTokens(pool.tokenIds);
  if (!tokens) return <Loading />;
  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

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
      <p className="grid col-span-4">
        {tokens[0].symbol}-{tokens[1].symbol}
      </p>
      <p className="col-span-5">
        {toRoundedReadableNumber({ decimals: 24, number: pool.shareSupply })}
      </p>
      <p className="col-span-2">{calculateFeePercent(pool.fee)}%</p>
    </Link>
  );
}

export function LiquidityPage() {
  const [tokenName, setTokenName] = useState('');
  const [sortBy] = useState('fee');
  const [order, setOrder] = useState('desc');
  const { pools, hasMore, nextPage } = usePools({ tokenName, sortBy, order });
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
            <p className="col-span-4">Liquidity</p>
            <p className="col-span-5">Total shares</p>
            <p
              className="col-span-2 cursor-pointer"
              onClick={() => {
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