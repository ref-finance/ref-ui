import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '~/components/tokens/Icon';
import { useTokens } from '~/state/token';
import { Pool } from '~/services/pool';
import { usePools } from '~state/pool';
import Loading from '~components/layout/Loading';

function PoolRow({ pool }: { pool: Pool }) {
  const tokens = useTokens(pool.tokenIds);
  if (!tokens) return <Loading />;

  const imgs = tokens.map((token, i) => <Icon key={i} token={token} />);
  const symbol = tokens.map((token) => token.symbol).join('-');

  return (
    <Link
      to={`/pools/${pool.id}`}
      className="grid grid-cols-12 py-2 text-right content-center"
    >
      <p className="flex justify-end">{imgs}</p>
      <p className="col-span-2">{symbol}</p>
      <p className="col-span-8">{pool.shareSupply}</p>
      <p>{pool.fee}</p>
    </Link>
  );
}

export default function PoolsPage() {
  const pools = usePools();
  if (!pools) return <Loading />;

  return (
    <section className="bg-white w-2/3 m-auto px-10 py-5 rounded ring-2 ring-primary overflow-y-scroll">
      <h1 className="text-lg font-medium p-2 text-center">Pools</h1>
      <section>
        <header className="grid grid-cols-12 py-2 text-right">
          <p className="col-span-3">Symbol</p>
          <p className="col-span-8">Total Shares</p>
          <p>Fee</p>
        </header>
        {pools.map((pool) => (
          <PoolRow key={pool.id} pool={pool} />
        ))}
      </section>
    </section>
  );
}
