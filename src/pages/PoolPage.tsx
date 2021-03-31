import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import FullCard from '~components/layout/FullCard';
import TokenList from '../components/tokens/TokenList';
import { getPoolDetails, getSharesInPool, PoolDetails } from '~services/pool';
import { getRegisteredTokens, getTokenBalances } from '~services/token';
import { sumBN } from '~utils/numbers';
import { TokenMetadata } from '~services/token';
import MicroModal from 'react-micro-modal';
import { estimateSwap } from '~services/swap';

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
      <h1 className=" font-normal text-xl pb-2">Pool Details</h1>
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

function SelectToken({
  selected,
  tokenIds,
  onSelect,
}: {
  selected: string;
  tokenIds: string[];
  onSelect: (id: string) => void;
}) {
  return (
    <MicroModal
      trigger={(open) => (
        <button type="button" onClick={open}>
          {selected || 'Open'}
        </button>
      )}
    >
      {(close) => (
        <>
          <h2>Select Token</h2>
          <TokenList
            tokenIds={tokenIds}
            onClick={(id) => {
              onSelect(id);
              close();
            }}
          />
        </>
      )}
    </MicroModal>
  );
}

function Form() {
  const [tokenInId, setTokenInId] = useState<string>();
  const [tokenInAmount, setTokenInAmount] = useState<string>();
  const [tokenOutId, setTokenOutId] = useState<string>();
  const [tokenOutAmount, setTokenOutAmount] = useState<string>();
  const [tokenIds, setTokenIds] = useState<string[]>([]);

  useEffect(() => {
    getRegisteredTokens().then(setTokenIds);
    getTokenBalances().then(console.log);
  }, []);

  useEffect(() => {
    if (tokenInId && tokenOutId && tokenInAmount) {
      estimateSwap({
        poolId: 0,
        tokenInId,
        tokenOutId,
        amountIn: tokenInAmount,
      }).then(setTokenOutAmount);
    }
  }, [tokenInId, tokenOutId, tokenInAmount]);

  return (
    <form onSubmit={}>
      <input
        type="number"
        placeholder="0.0"
        value={tokenInAmount}
        onChange={({ target }) => setTokenInAmount(target.value)}
      />
      <SelectToken
        selected={tokenInId}
        tokenIds={tokenIds}
        onSelect={(tokenId) => setTokenInId(tokenId)}
      />
      <input type="number" placeholder="0.0" value={tokenOutAmount} />
      <SelectToken
        selected={tokenOutId}
        tokenIds={tokenIds}
        onSelect={(tokenId) => setTokenOutId(tokenId)}
      />
      <button></button>
    </form>
  );
}

export default function PoolPage() {
  const { poolId } = useParams<ParamTypes>();
  const [pool, setPool] = useState<PoolDetails>();
  const [shares, setShares] = useState<string>();

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
      <Form></Form>
      <TokenList tokenIds={pool.tokenIds} render={render} />
    </FullCard>
  );
}
