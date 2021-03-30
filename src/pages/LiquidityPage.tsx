import React, { useEffect, useState } from 'react';
import FullCard from '~components/layout/FullCard';
import { getPools, PoolDetails } from '../services/pool';

interface LiquidityTokenRowProps {
  pool: PoolDetails;
}

interface LiquidityPageProps {
  children: string;
  hideMobile?: boolean;
}

function LiquidityTokenRow({ pool }: LiquidityTokenRowProps) {
  return (
    <tr className="h-12 border-separate  border-b border-t border-borderGray">
      <td>{pool.id}</td>
    </tr>
  );
}

function LiquidityPage() {
  const [pools, setPools] = useState<PoolDetails[]>([]);
  useEffect(() => {
    getPools().then(setPools);
  }, []);

  const TableHeader = ({ children, hideMobile }: LiquidityPageProps) => (
    <th
      className={`text-left font-light text-sm py-4 ${
        hideMobile && 'hidden'
      } lg:flex`}
    >
      {children}
    </th>
  );

  return (
    <FullCard>
      <div>
        <h1 className="text-lg font-medium pt-8">Pools</h1>
        <table className="w-full">
          <thead>
            <tr>
              <TableHeader>Name</TableHeader>
              <TableHeader hideMobile>Symbols</TableHeader>
              <TableHeader hideMobile>Liquidity</TableHeader>
            </tr>
          </thead>
          <tbody>
            {pools.map((pool) => (
              <LiquidityTokenRow pool={pool} />
            ))}
          </tbody>
        </table>
      </div>
    </FullCard>
  );
}

export default LiquidityPage;
