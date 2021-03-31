import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import FullCard from '~components/layout/FullCard';
import TokenList from '../components/tokens/TokenList';
import { getPoolDetails, PoolDetails } from '~services/pool';
import { sumBN } from '~utils/numbers';
import { TokenMetadata } from '~services/token';

interface ParamTypes {
  poolId: string;
}

interface TokenDetailColumnProps {
  title: string;
  value: string | number;
}

function TokenDetailColumn({ title, value }: TokenDetailColumnProps) {
  return (
    <div className="flex flex-col mr-8 mb-8 lg:m-0 text-center">
      <h2 className="text-gray-500 pb-1">{title}</h2>
      <div>
        <p>{value}</p>
      </div>
    </div>
  );
}

function PoolHeader({ pool }: { pool: PoolDetails }) {
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
      <div className="grid grid-cols-2 gap-10">
        <TokenDetailColumn title="Total Shares" value={pool.shareSupply} />
        <TokenDetailColumn title="Fee" value={pool.fee} />
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

  const render = (token: TokenMetadata) => {
    return (
      <p>
        <span className="font-black">Total Supply: </span>
        {pool.supplies[token.id]}
      </p>
    );
  };

  // TODO: loading
  if (!pool) return null;

  return (
    <FullCard>
      <PoolHeader pool={pool} />
      <TokenList tokenIds={pool.tokenIds} render={render} />
    </FullCard>
  );
}
