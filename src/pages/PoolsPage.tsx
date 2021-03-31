import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import FullCard from '../components/layout/FullCard';
import Icon from '~/components/tokens/Icon';
import { useTokens } from '~/state/token';
import { Pool } from '~/services/pool';
import { usePools } from '~state/pool';

function PoolRow({ pool }: { pool: Pool }) {
  const tokens = useTokens(pool.tokenIds);
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

  return (
    <FullCard>
      <h1 className="text-lg font-medium pt-8">Pools</h1>
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
    </FullCard>
  );
}
