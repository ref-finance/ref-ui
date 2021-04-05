import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import Icon from '../components/tokens/Icon';
import { useTokens } from '../state/token';
import { Pool } from '../services/pool';
import { usePools } from '../state/pool';
import Loading from '../components/layout/Loading';
import PageWrap from '../components/layout/PageWrap';
import { calculateFeePercent, toRoundedReadableNumber } from '../utils/numbers';

function PoolRow({ pool }: { pool: Pool }) {
  const tokens = useTokens(pool.tokenIds);
  if (!tokens) return <Loading />;
  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const imgs = tokens.map((token, i) => (
    <Icon key={i} token={token} label={false} />
  ));

  return (
    <Link
      to={`/pools/${pool.id}`}
      className="grid grid-cols-12 py-2 text-right content-center"
    >
      <p className="grid grid-cols-2 col-span-1">{imgs}</p>
      <p className="grid col-span-4">
        {tokens[0].symbol}-{tokens[1].symbol}
      </p>
      <p className="col-span-5 text-center">
        {toRoundedReadableNumber({ decimals: 24, number: pool.shareSupply })}
      </p>
      <p className="col-span-2 text-center">{calculateFeePercent(pool.fee)}%</p>
    </Link>
  );
}

export default function PoolsPage() {
  const pools = usePools();
  if (!pools) return <Loading />;

  return (
    <>
      <PageWrap>
        <header className="grid grid-cols-6">
          <section></section>
          <section className="col-span-4">
            <h1 className="text-xl font-bold p-2 text-center">
              Available Liquidity Pools
            </h1>
          </section>
          <section>
            <Link
              to="/pools/add"
              className="flex justify-center items-center border rounded p-2 bg-secondary hover:text-primaryScale-500"
            >
              <FaPlus />
              <span className="ml-2 text-right">Add Pool</span>
            </Link>
          </section>
        </header>

        <section>
          <header className="grid grid-cols-12 py-2 text-center">
            <p className="col-span-1 border-b-2">Pool</p>
            <p className="col-span-4 border-b-2"></p>
            <p className="col-span-5 border-b-2">Total Shares</p>
            <p className="col-span-2 border-b-2">Fee</p>
          </header>
          {pools.map((pool) => (
            <PoolRow key={pool.id} pool={pool} />
          ))}
        </section>
      </PageWrap>
    </>
  );
}
