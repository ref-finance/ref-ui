import React from 'react';
import { Link } from 'react-router-dom';
import { FaPlus } from 'react-icons/fa';
import Icon from '../components/tokens/Icon';
import { useTokens } from '../state/token';
import { Pool } from '../services/pool';
import { usePools } from '../state/pool';
import Loading from '../components/layout/Loading';
import PageWrap from '~components/layout/PageWrap';
import { calculateFeePercent, toRoundedReadableNumber } from '~utils/numbers';

function PoolRow({ pool }: { pool: Pool }) {
  const tokens = useTokens(pool.tokenIds);
  if (!tokens) return <Loading />;

  const imgs = tokens.map((token, i) => <Icon key={i} token={token} />);

  return (
    <Link
      to={`/pools/${pool.id}`}
      className="grid grid-cols-12 py-2 text-right content-center"
    >
      <p className="grid grid-cols-2 col-span-4 space-x-8">{imgs}</p>
      <p className="col-span-6 text-center">
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
            <h1 className="text-2xl font-medium p-2 text-center b">
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
            <p className="col-span-4 tet">Pool</p>
            <p className="col-span-6">Total Shares</p>
            <p className="col-span-2">Fee</p>
          </header>
          {pools.map((pool) => (
            <PoolRow key={pool.id} pool={pool} />
          ))}
        </section>
      </PageWrap>
    </>
  );
}
