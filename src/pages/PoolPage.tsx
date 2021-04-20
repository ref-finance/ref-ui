import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaAngleLeft } from 'react-icons/fa';
import PageWrap from '../components/layout/PageWrap';
import InputAmount from '../components/forms/InputAmount';
import FormWrap from '../components/forms/FormWrap';
import { usePool, useRemoveLiquidity } from '../state/pool';
import { addLiquidityToPool, Pool, PoolDetails } from '../services/pool';
import {
  calculateFairShare,
  calculateFeePercent,
  percent,
  sumBN,
  toNonDivisibleNumber,
  toPrecision,
  toReadableNumber,
  toRoundedReadableNumber,
} from '../utils/numbers';
import { TokenMetadata } from '../services/ft-contract';
import { useTokenBalances, useTokens } from '../state/token';
import TokenAmount from '../components/forms/TokenAmount';
import TabFormWrap from '../components/forms/TabFormWrap';
import Loading from '../components/layout/Loading';
import Icon from '../components/tokens/Icon';
import copy from '../utils/copy';
import SlippageSelector from '~components/forms/SlippageSelector';

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
        <div>{value}</div>
      </div>
    </div>
  );
}

function Shares({
  shares,
  totalShares,
}: {
  shares: string;
  totalShares: string;
}) {
  if (!shares || !totalShares) return null;

  let sharePercent = percent(shares, totalShares);

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.0001) displayPercent = '< 0.0001';
  else displayPercent = toPrecision(String(sharePercent), 4);

  return (
    <h2 className="text-lg pb-4 font-bold text-center">
      My Shares: {displayPercent}% of Total
    </h2>
  );
}

function UnderlyingLiquidity({
  pool,
  tokens,
}: {
  pool: Pool;
  tokens: TokenMetadata[];
}) {
  return (
    <section className="max-w-xs m-auto">
      <section className="grid grid-cols-2 p-2 width-1/2">
        <Icon token={tokens[0]} />
        <span className="ml-2">
          {toRoundedReadableNumber({
            decimals: tokens[0].decimals,
            number: pool.supplies[tokens[0].id],
          })}
        </span>
      </section>
      <section className="grid grid-cols-2 p-2">
        <Icon token={tokens[1]} />
        <span className="ml-2">
          {toRoundedReadableNumber({
            decimals: tokens[1].decimals,
            number: pool.supplies[tokens[1].id],
          })}
        </span>
      </section>
    </section>
  );
}

function MyUnderlyingLiquidity({
  pool,
  tokens,
  shares,
}: {
  pool: Pool;
  tokens: TokenMetadata[];
  shares: string;
}) {
  const { minimumAmounts } = useRemoveLiquidity({
    pool,
    shares,
    slippageTolerance: 0,
  });

  return (
    <section className="max-w-xs m-auto">
      <section className="grid grid-cols-2 p-2 width-1/2">
        <Icon token={tokens[0]} />
        <span className="ml-2">
          {toRoundedReadableNumber({
            decimals: tokens[0].decimals,
            number: minimumAmounts[tokens[0].id],
          })}
        </span>
      </section>
      <section className="grid grid-cols-2 p-2">
        <Icon token={tokens[1]} />
        <span className="ml-2">
          {toRoundedReadableNumber({
            decimals: tokens[1].decimals,
            number: minimumAmounts[tokens[1].id],
          })}
        </span>
      </section>
    </section>
  );
}

function PoolHeader({
  pool,
  tokens,
  shares,
}: {
  pool: PoolDetails;
  tokens: TokenMetadata[];
  shares: string;
}) {
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
      <Shares shares={shares} totalShares={pool.shareSupply} />
      <div className="grid grid-cols-2 gap-10">
        <DetailColumn
          title="Total Shares"
          value={toRoundedReadableNumber({
            decimals: 24,
            number: pool.shareSupply,
          })}
        />
        <DetailColumn title="Fee" value={`${calculateFeePercent(pool.fee)}%`} />
        <DetailColumn title="Total Liquidity" value="Coming Soon" />
        <DetailColumn title="Accumulated Volume" value="Coming Soon" />
        <DetailColumn
          title="Total Underlying Liquidity"
          value={<UnderlyingLiquidity pool={pool} tokens={tokens} />}
        />
        {shares ? (
          <DetailColumn
            title="My Underlying Liquidity"
            value={
              <MyUnderlyingLiquidity
                pool={pool}
                tokens={tokens}
                shares={shares}
              />
            }
          />
        ) : null}
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

  const changeFirstTokenAmount = (amount: string) => {
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setFirstTokenAmount(amount);
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[0].decimals, amount),
        totalContribution: pool.supplies[tokens[0].id],
      });

      setFirstTokenAmount(amount);
      setSecondTokenAmount(
        toReadableNumber(
          tokens[1].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[1].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        )
      );
    }
  };

  const changeSecondTokenAmount = (amount: string) => {
    if (Object.values(pool.supplies).every((s) => s === '0')) {
      setSecondTokenAmount(amount);
    } else {
      const fairShares = calculateFairShare({
        shareOf: pool.shareSupply,
        contribution: toNonDivisibleNumber(tokens[1].decimals, amount),
        totalContribution: pool.supplies[tokens[1].id],
      });

      setSecondTokenAmount(amount);
      setFirstTokenAmount(
        toReadableNumber(
          tokens[0].decimals,
          calculateFairShare({
            shareOf: pool.supplies[tokens[0].id],
            contribution: fairShares,
            totalContribution: pool.shareSupply,
          })
        )
      );
    }
  };

  return (
    <FormWrap
      buttonText="Add Liquidity"
      onSubmit={handleSubmit}
      info={copy.addLiquidity}
    >
      <TokenAmount
        amount={firstTokenAmount}
        max={toReadableNumber(tokens[0].decimals, balances[tokens[0].id])}
        tokens={[tokens[0]]}
        selectedToken={tokens[0]}
        onChangeAmount={changeFirstTokenAmount}
      />
      <TokenAmount
        amount={secondTokenAmount}
        max={toReadableNumber(tokens[1].decimals, balances[tokens[1].id])}
        tokens={[tokens[1]]}
        selectedToken={tokens[1]}
        onChangeAmount={changeSecondTokenAmount}
      />
    </FormWrap>
  );
}

function RemoveLiquidity({
  pool,
  shares,
  tokens,
}: {
  pool: Pool;
  shares: string;
  tokens: TokenMetadata[];
}) {
  const [amount, setAmount] = useState<string>();
  const [slippageTolerance, setSlippageTolerance] = useState<number>(0.5);

  const { minimumAmounts, removeLiquidity } = useRemoveLiquidity({
    pool,
    slippageTolerance,
    shares: amount ? toNonDivisibleNumber(24, amount) : '0',
  });

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    return removeLiquidity();
  };

  return (
    <FormWrap
      buttonText="Remove Liquidity"
      canSubmit={!!amount}
      onSubmit={handleSubmit}
      info={copy.removeLiquidity}
    >
      <InputAmount
        value={amount}
        max={toReadableNumber(24, shares)}
        onChangeAmount={setAmount}
      />
      <SlippageSelector
        slippageTolerance={slippageTolerance}
        onChange={setSlippageTolerance}
      />
      {amount ? (
        <>
          <p className="mt-3 text-center">Minumum Tokens Out</p>
          <section className="grid grid-cols-2 mt-3">
            {Object.entries(minimumAmounts).map(
              ([tokenId, minumumAmount], i) => {
                const token = tokens.find((t) => t.id === tokenId);

                return (
                  <section key={tokenId} className="flex items-center">
                    <Icon token={token} />
                    <span className="ml-2">
                      {toRoundedReadableNumber({
                        decimals: tokens.find((t) => t.id === tokenId).decimals,
                        number: minumumAmount,
                        precision: 6,
                      })}
                    </span>
                  </section>
                );
              }
            )}
          </section>
        </>
      ) : null}
    </FormWrap>
  );
}

export default function PoolPage() {
  const { poolId } = useParams<ParamTypes>();
  const { pool, shares } = usePool(poolId);
  const tokens = useTokens(pool?.tokenIds);

  if (!pool || !tokens || tokens.length < 2) return <Loading />;

  return (
    <PageWrap>
      <Link to="/pools" className="mb-2">
        <FaAngleLeft size={30} />
      </Link>
      <PoolHeader pool={pool} tokens={tokens} shares={shares} />
      <TabFormWrap titles={['Add Liquidity', 'Remove Liquidity']}>
        <AddLiquidity pool={pool} tokens={tokens} />
        <RemoveLiquidity pool={pool} shares={shares} tokens={tokens} />
      </TabFormWrap>
    </PageWrap>
  );
}
