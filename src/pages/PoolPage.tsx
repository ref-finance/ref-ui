import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import FullCard from '~components/layout/FullCard';
import TokenList from '../components/tokens/TokenList';
import { getPoolDetails, PoolDetails } from '~services/pool';
import { sumBN } from '../utils/numbers';

interface ParamTypes {
  poolId: string;
}

interface TokenDetailColumnProps {
  title: string;
  value: string | number;
}

function TokenDetailColumn({ title, value }: TokenDetailColumnProps) {
  return (
    <div className="flex flex-col mr-8 mb-8 lg:m-0">
      <h2 className="text-gray-500 pb-1">{title}</h2>
      <div className="flex flex-row items-center space-x-2">
        <p>{value}</p>
      </div>
    </div>
  );
}

function PoolDetails({ pool }: { pool: PoolDetails }) {
  const total = Object.values(pool.supplies).reduce(
    (acc, amount) => sumBN(acc, amount),
    ''
  );
  const volume = Object.values(pool.volumes).reduce(
    (acc, { input, output }) => sumBN(acc, input, output),
    '0'
  );
  return (
    <div className="flex flex-col lg:pl-6 mt-8 mb-14">
      <h1 className=" font-normal text-xl pb-4">Pool Details</h1>
      <div className="flex flex-row lg:space-x-24 flex-wrap">
        <TokenDetailColumn title="Total Liquidity" value={total} />
        <TokenDetailColumn title="Accumulated Volume" value={volume} />
      </div>
    </div>
  );
}

export default function PoolPage() {
  const { poolId } = useParams<ParamTypes>();
  const [pool, setPool] = useState<PoolDetails>();
  useEffect(() => {
    getPoolDetails(Number(poolId)).then(setPool);
  }, []);

  return (
    <FullCard>
      {pool && <PoolDetails pool={pool} />}
      {pool && <TokenList tokenIds={pool.tokenIds} />}
      <div className="h-10" />
    </FullCard>
  );
}
