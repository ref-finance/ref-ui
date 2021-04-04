import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaAngleLeft } from 'react-icons/fa';
import PageWrap from '../components/layout/PageWrap';
import TokenList from '../components/tokens/TokenList';
import InputAmount from '../components/forms/InputAmount';
import FormWrap from '../components/forms/FormWrap';
import { usePool } from '../state/pool';
import {
  addLiquidityToPool,
  Pool,
  PoolDetails,
  removeLiquidityFromPool,
} from '../services/pool';
import {
  sumBN,
  toReadableNumber,
  toRoundedReadableNumber,
} from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import { useTokenBalances, useTokens } from '../state/token';
import TokenAmount from '../components/forms/TokenAmount';
import TabFormWrap from '../components/forms/TabFormWrap';
import Loading from '../components/layout/Loading';

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

  return (
    <h2 className="text-lg pb-4 font-bold text-center">My Shares: {shares}</h2>
  );
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
      <h1 className="font-normal text-xl pb-2 text-center">Pool Details</h1>
      <Shares
        shares={toRoundedReadableNumber({ decimals: 24, number: shares })}
      />
      <div className="grid grid-cols-2 gap-10">
        <DetailColumn
          title="Total Shares"
          value={toRoundedReadableNumber({
            decimals: 24,
            number: pool.shareSupply,
          })}
        />
        <DetailColumn title="Fee" value={pool.fee} />
        <DetailColumn title="Total Liquidity" value={total} />
        <DetailColumn title="Accumulated Volume" value={volume} />
      </div>
    </div>
  );
}

function AddLiquidity({
  pool,
  tokens,
}: {
  pool: Pool;
  tokens: TokenMetadata[];
}) {
  const [firstTokenAmount, setFirstTokenAmount] = useState<string>();
  const [secondTokenAmount, setSecondTokenAmount] = useState<string>();

  const balances = useTokenBalances();
  if (!balances) return <Loading />;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!firstTokenAmount || firstTokenAmount === '0') {
      throw new Error(`Must provide at least 1 token for ${tokens[0].symbol}`);
    }

    if (!secondTokenAmount || secondTokenAmount === '0') {
      throw new Error(`Must provide at least 1 token for ${tokens[1].symbol}`);
    }

    return addLiquidityToPool({
      id: pool.id,
      tokenAmounts: [
        { token: tokens[0], amount: firstTokenAmount },
        { token: tokens[1], amount: secondTokenAmount },
      ],
    });
  };

  return (
    <FormWrap buttonText="Add Liquidity" onSubmit={handleSubmit}>
      <TokenAmount
        amount={firstTokenAmount}
        max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
        tokens={[tokens[0]]}
        selectedToken={tokens[0]}
        onChangeAmount={setFirstTokenAmount}
      />
      <TokenAmount
        amount={secondTokenAmount}
        max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
        tokens={[tokens[1]]}
        selectedToken={tokens[1]}
        onChangeAmount={setSecondTokenAmount}
      />
    </FormWrap>
  );
}

function RemoveLiquidity({ pool, shares }: { pool: Pool; shares: string }) {
  const [amount, setAmount] = useState<string>();
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    return removeLiquidityFromPool({
      id: pool.id,
      shares: amount,
      minimumAmounts: pool.tokenIds.reduce<{ [id: string]: string }>(
        (acc, id) => {
          acc[id] = '0';
          return acc;
        },
        {}
      ),
    });
  };

  return (
    <FormWrap
      buttonText="Remove Liquidity"
      canSubmit={!!amount}
      onSubmit={handleSubmit}
    >
      <InputAmount
        value={amount}
        max={toReadableNumber(24, shares)}
        onChangeAmount={setAmount}
      />
    </FormWrap>
  );
}

export default function PoolPage() {
  const { poolId } = useParams<ParamTypes>();
  const { pool, shares } = usePool(poolId);
  const tokens = useTokens(pool?.tokenIds);

  if (!pool || tokens.length < 2) return <Loading />;

  const render = (token: TokenMetadata) => {
    return (
      <p>
        <span className="font-black">Total Supply: </span>
        {toRoundedReadableNumber({
          decimals: token.decimals,
          number: pool.supplies[token.id],
        })}
      </p>
    );
  };

  if (!pool || !tokens) return <Loading />;

  return (
    <PageWrap>
      <Link to="/pools" className="mb-2">
        <FaAngleLeft size={30} />
      </Link>
      <PoolHeader pool={pool} shares={shares} />
      <TabFormWrap titles={['Add Liquidity', 'Remove Liquidity']}>
        <AddLiquidity pool={pool} tokens={tokens} />
        <RemoveLiquidity pool={pool} shares={shares} />
      </TabFormWrap>
      <TokenList tokens={tokens} render={render} />
    </PageWrap>
  );
}
