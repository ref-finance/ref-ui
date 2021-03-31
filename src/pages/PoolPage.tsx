import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import FullCard from '~components/layout/FullCard';
import TokenList from '../components/tokens/TokenList';
import SelectToken from '../components/forms/SelectToken';
import InputAmount from '../components/forms/InputAmount';
import FormWrap from '../components/forms/FormWrap';
import {
  addLiquidityToPool,
  getPoolDetails,
  getSharesInPool,
  Pool,
  PoolDetails,
} from '~services/pool';
import { sumBN } from '~utils/numbers';
import { TokenMetadata } from '~services/token';
import { useTokens } from '~state/token';

interface ParamTypes {
  poolId: string;
}

interface TokenDetailColumnProps {
  title: string;
  value: string | number;
}

function DetailColumn({ title, value }: TokenDetailColumnProps) {
  return (
    <div className="flex flex-col mr-8 mb-8 lg:m-0 text-center">
      <h2 className="text-gray-500 pb-1">{title}</h2>
      <div>
        <p>{value}</p>
      </div>
    </div>
  );
}

function Shares({ shares }: { shares: string }) {
  if (!shares) return null;

  return <h2 className="text-lg pb-4 font-bold">My Shares: {shares}</h2>;
}

function PoolHeader({ pool, shares }: { pool: PoolDetails; shares: string }) {
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
      <h1 className="font-normal text-xl pb-2">Pool Details</h1>
      <Shares shares={shares} />
      <div className="grid grid-cols-2 gap-10">
        <DetailColumn title="Total Shares" value={pool.shareSupply} />
        <DetailColumn title="Fee" value={pool.fee} />
        <DetailColumn title="Total Liquidity" value={total} />
        <DetailColumn title="Accumulated Volume" value={volume} />
      </div>
    </div>
  );
}

function Form({ pool, tokens }: { pool: Pool; tokens: TokenMetadata[] }) {
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const fd = new FormData(event.target as HTMLFormElement);

    const amounts = pool.tokenIds.reduce<{ [key: string]: string }>(
      (acc, tokenId) => {
        acc[tokenId] = fd.get(tokenId).toString();
        return acc;
      },
      {}
    );

    await addLiquidityToPool({
      id: pool.id,
      tokenAmounts: amounts,
    });
  };

  return (
    <FormWrap title="Add Liquidity" onSubmit={handleSubmit}>
      {Object.entries(pool.supplies).map(([tokenId, max]) => (
        <fieldset className="relative grid grid-cols-4 align-center">
          <InputAmount
            className="col-span-3"
            name={tokenId}
            onMax={(input) => (input.value = max)}
          />
          <SelectToken
            tokens={tokens}
            selected={tokens.find((t) => t.id === tokenId)?.symbol}
          />
        </fieldset>
      ))}
    </FormWrap>
  );
}

export default function PoolPage() {
  const { poolId } = useParams<ParamTypes>();
  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>();
  const tokens = useTokens(pool?.tokenIds);

  useEffect(() => {
    getPoolDetails(Number(poolId)).then(setPool);
    getSharesInPool(Number(poolId)).then(setShares);
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
      <PoolHeader pool={pool} shares={shares} />
      <Form pool={pool} tokens={tokens} />
      <TokenList tokens={tokens} render={render} />
    </FullCard>
  );
}
