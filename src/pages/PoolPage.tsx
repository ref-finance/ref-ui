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
  calculateFeePercent,
  percent,
  sumBN,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import { useTokenBalances, useTokens } from '../state/token';
import TokenAmount from '../components/forms/TokenAmount';
import TabFormWrap from '../components/forms/TabFormWrap';
import Loading from '../components/layout/Loading';
import Icon from '~components/tokens/Icon';

interface ParamTypes {
  poolId: string;
}

interface TokenDetailColumnProps {
  className?: string;
  title: string;
  value: string | number | React.ReactElement;
}

function DetailColumn({ className, title, value }: TokenDetailColumnProps) {
  return (
    <div className={`flex flex-col mr-8 mb-8 lg:m-0 text-center ${className}`}>
      <h2 className="text-gray-500 pb-1">{title}</h2>
      <div>
        <p>{value}</p>
      </div>
    </div>
  );
}

function Shares({ shares, totalShares }: { shares: string, totalShares: string }) {
  if (!shares || !totalShares) return null;

  let sharePercent = percent(shares, totalShares);
  console.log(sharePercent, Number.isNaN(sharePercent))

  let displayPercent;
  if(Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0' 
  else if(sharePercent < 0.0001) displayPercent = '< 0.0001'
  else displayPercent = toPrecision(String(sharePercent), 4);

  return (
    <h2 className="text-lg pb-4 font-bold text-center">My Shares: {displayPercent}% of Total</h2>
  );
}

function PoolHeader({ pool, tokens, shares }: { pool: PoolDetails; tokens: TokenMetadata[]; shares: string }) {
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
        shares={shares}
        totalShares={pool.shareSupply}
      />
      <div className="grid grid-cols-2 gap-10">
        <DetailColumn
          title="Total Shares"
          value={toRoundedReadableNumber({
            decimals: 24,
            number: pool.shareSupply,
          })}
        />
        <DetailColumn title="Fee" value={`${calculateFeePercent(pool.fee)}%`} />
        <DetailColumn title="Total Liquidity" value={total} />
        <DetailColumn title="Accumulated Volume" value={volume} />
        <DetailColumn
          className="col-span-2"
          title="Underlying liquidity"
          value={
            <section className="max-w-xs m-auto">
              <section className="grid grid-cols-2 p-2 width-1/2">
                <Icon token={tokens[0]} /><span className="ml-2">{toRoundedReadableNumber({ decimals: tokens[0].decimals, number: pool.supplies[tokens[0].id]})}</span>
              </section>
              <section className="grid grid-cols-2 p-2">
                <Icon token={tokens[1]} /><span className="ml-2">{toRoundedReadableNumber({ decimals: tokens[1].decimals, number: pool.supplies[tokens[1].id] })}</span>
              </section>
            </section>
          }
        />
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

  if (!pool || !tokens) return <Loading />;

  return (
    <PageWrap>
      <Link to="/pools" className="mb-2">
        <FaAngleLeft size={30} />
      </Link>
      <PoolHeader pool={pool} tokens={tokens} shares={shares} />
      <TabFormWrap titles={['Add Liquidity', 'Remove Liquidity']}>
        <AddLiquidity pool={pool} tokens={tokens} />
        <RemoveLiquidity pool={pool} shares={shares} />
      </TabFormWrap>
    </PageWrap>
  );
}
