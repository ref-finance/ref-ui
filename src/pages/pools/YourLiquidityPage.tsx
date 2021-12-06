import React, { useEffect, useState } from 'react';
import { Card } from '~components/card/Card';
import Alert from '~components/alert/Alert';
import {
  BorderButton,
  ConnectToNearBtn,
  SolidButton,
  OutlineButton,
} from '~components/button/Button';
import Loading from '~components/layout/Loading';
import { wallet } from '~services/near';
import { useTokens } from '~state/token';
import { getPoolBalance, getPoolsBalances, PoolRPCView } from '~services/api';
import {
  toRoundedReadableNumber,
  percent,
  toPrecision,
  toInternationalCurrencySystem,
  toReadableNumber,
  calculateFairShare,
} from '~utils/numbers';
import { usePool } from '~state/pool';
import { RemoveLiquidityModal, AddLiquidityModal } from './DetailsPage';
import { getPool, getYourPools } from '~services/indexer';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { LP_TOKEN_DECIMALS } from '~services/m-token';

import { canFarm, Pool } from '~services/pool';
import { formatMessage } from '@formatjs/intl';
import { TokenMetadata } from '~services/ft-contract';

function FarmDot({
  inFarm,
  className,
}: {
  inFarm: boolean;
  className?: string;
}) {
  return (
    <div
      className={`rounded-full  ${
        inFarm ? 'bg-gradientFrom' : ''
      } w-2 h-2 border border-gradientFrom ${className}`}
    />
  );
}

function MyShares({
  shares,
  totalShares,
  poolId,
  stakeList = {},
  decimal,
  supportFarm,
  farmStake = '0',
  userTotalShare,
}: {
  shares: string;
  totalShares: string;
  poolId?: number;
  stakeList?: Record<string, string>;
  decimal?: number;
  yourLP?: boolean;
  supportFarm: Number;
  farmStake: string | number;
  userTotalShare: BigNumber;
}) {
  if (!shares || !totalShares) return <div>-</div>;

  let sharePercent = percent(userTotalShare.valueOf(), totalShares);

  const farmShare = Number(farmStake).toLocaleString('fullwide', {
    useGrouping: false,
  });

  const farmSharePercent = percent(
    farmShare,
    userTotalShare.toNumber().toLocaleString('fullwide', { useGrouping: false })
  ).toString();

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.0001)
    displayPercent = `< ${
      decimal ? '0.'.padEnd(decimal + 1, '0') + '1' : '0.0001'
    }`;
  else displayPercent = toPrecision(String(sharePercent), decimal || 4);

  return (
    <div className="h-12 inline-flex flex-col justify-center xs:text-right md:text-right">
      <div className="px-2 pb-1 xs:pr-0 md:pr-0 text-sm">{`${toRoundedReadableNumber(
        {
          decimals: LP_TOKEN_DECIMALS,
          number: userTotalShare
            .toNumber()
            .toLocaleString('fullwide', { useGrouping: false }),
          precision: decimal || 6,
        }
      )} (${displayPercent}%)`}</div>
      {supportFarm > 0 && (
        <object>
          <Link
            className="items-center inline-flex text-xs text-gradientFrom rounded-full py-1 border border-transparent hover:border-gradientFrom px-2 xs:pr-0 md:pr-0"
            to={{
              pathname: '/farms',
            }}
            target="_blank"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" />
            <div className="self-start">
              <span className="text-gradientFrom">
                {`${
                  Number(farmSharePercent) < 0.1 && Number(farmSharePercent) > 0
                    ? '< 0.1'
                    : toPrecision(farmSharePercent, 2, false, false)
                }% `}{' '}
              </span>
              &nbsp;
              <FormattedMessage id="in_farm" defaultMessage="in Farm" />
            </div>
          </Link>
        </object>
      )}
    </div>
  );
}

function Empty() {
  return (
    <div className="px-6">
      <div className="text-center font-semibold text-xs mb-4 text-primaryText">
        <FormattedMessage
          id="your_liquidity_positions_will_appear_here"
          defaultMessage="Your liquidity positions will appear here."
        />
      </div>
      {wallet.isSignedIn() ? <AddLiquidityButton /> : <ConnectToNearBtn />}
    </div>
  );
}

function AddLiquidityButton() {
  const history = useHistory();

  return (
    <SolidButton onClick={() => history.push('/pools')} className="w-full">
      <FormattedMessage id="add_liquidity" defaultMessage="Add Liquidity" />
    </SolidButton>
  );
}

export function YourLiquidityPage() {
  const [error, setError] = useState<Error>();
  const [pools, setPools] = useState<PoolRPCView[]>();
  const [balances, setBalances] = useState<string[]>();

  useEffect(() => {
    getYourPools().then(setPools);
  }, []);

  useEffect(() => {
    if (!pools) return;
    const pool_ids = pools?.map((pool) => pool.id);
    getPoolsBalances(pool_ids).then(setBalances);
  }, [pools]);

  if (!pools || !balances) return <Loading />;

  return (
    <div className="flex items flex-col w-1/2 md:w-5/6 xs:w-11/12 m-auto">
      <div className="w-full flex justify-center self-center">
        {error && <Alert level="error" message={error.message} />}
      </div>
      {/* PC */}
      <Card width="w-full" padding="px-0 py-6" className="xs:hidden md:hidden">
        <div className="text-white text-xl pr-6 pl-6 lg:pl-10 pb-6">
          <FormattedMessage
            id="your_liquidity"
            defaultMessage="Your Liquidity"
          />
        </div>
        {pools.length > 0 ? (
          <section>
            <div className="">
              <div
                className="grid grid-cols-10 md:flex xs:flex md:items-center xs:items-center xs:justify-between md:justify-between py-2 content-center items-center text-xs text-primaryText pr-6 pl-6 lg:pl-10
                xs:border-b xs:border-gray-700 xs:border-opacity-70 md:border-b md:border-gray-700 md:border-opacity-70"
              >
                <div className="col-span-2">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="col-span-2 2xl:col-span-3">
                  <FormattedMessage id="token" defaultMessage="Token" />
                </div>
                <div className="col-span-6 2xl:col-span-3 ml-8 2xl:ml-2">
                  <FormattedMessage id="my_shares" defaultMessage="My Shares" />
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {pools.map((pool, i) => (
                  <div
                    key={i}
                    className="hover:bg-poolRowHover w-full hover:bg-opacity-20"
                  >
                    <PoolRow pool={pool} balance={balances[i]} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        ) : (
          <Empty />
        )}
      </Card>
      {/* Mobile */}
      <div className="text-white text-2xl font-semibold px-4 lg:hidden">
        <FormattedMessage id="your_liquidity" defaultMessage="Your Liquidity" />
      </div>
      {pools.length > 0 ? (
        <div className="lg:hidden">
          {pools.map((pool, i) => {
            return <PoolRow pool={pool} key={i} balance={balances[i]} />;
          })}
        </div>
      ) : (
        <Card className="lg:hidden mt-4" width="w-full">
          <Empty />
        </Card>
      )}
    </div>
  );
}

function PoolRow(props: { pool: any; balance: string }) {
  const { pool, shares, stakeList } = usePool(props.pool.id);
  const { balance } = props;
  const tokens = useTokens(pool?.tokenIds);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showFunding, setShowFunding] = useState(false);
  const [supportFarm, setSupportFarm] = useState<Number>();
  const [farmStake, setFarmStake] = useState<string | number>('0');

  useEffect(() => {
    canFarm(Number(props.pool.id), true).then(setSupportFarm);
  }, [props.pool]);

  useEffect(() => {
    const seedIdList: string[] = Object.keys(stakeList);
    let tempFarmStake: string | number = '0';
    seedIdList.forEach((seed) => {
      const id = Number(seed.split('@')[1]);
      if (id == props.pool.id) {
        tempFarmStake = BigNumber.sum(farmStake, stakeList[seed]).valueOf();
      }
    });
    setFarmStake(tempFarmStake);
  }, [stakeList]);

  const userTotalShare = BigNumber.sum(shares, farmStake);

  const userTotalShareToString = userTotalShare
    .toNumber()
    .toLocaleString('fullwide', { useGrouping: false });

  if (!pool || !tokens || tokens.length < 2) return <Loading />;

  if (!(userTotalShare.toNumber() > 0)) return null;

  const Images = tokens.map((token, index) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id}
          className={
            'inline-block h-8 w-8 rounded-full border border-gradientFromHover -ml-1 -ml-1'
          }
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={
          'inline-block h-8 w-8 rounded-full bg-cardBg border border-gradientFromHover -ml-1 -ml-1'
        }
      ></div>
    );
  });

  const tokenAmountShare = (
    pool: Pool,
    token: TokenMetadata,
    shares: string
  ) => {
    const value = toRoundedReadableNumber({
      decimals: token.decimals,
      number: calculateFairShare({
        shareOf: pool.supplies[token.id],
        contribution: shares,
        totalContribution: pool.shareSupply,
      }),
      precision: 3,
      withCommas: false,
    });

    return Number(value) < 0.001 ? (
      <span className="whitespace-nowrap">{'< 0.001'}</span>
    ) : (
      toInternationalCurrencySystem(value, 3)
    );
  };

  return (
    <>
      {/* PC */}
      <Link
        className="xs:hidden md:hidden grid grid-cols-10 py-5 content-center items-center text-sm text-white pl-10 pr-6 border-t border-gray-700 border-opacity-70 cursor-pointer"
        to={{ pathname: `/pool/${pool.id}` }}
      >
        <div className="col-span-2 inline-flex items-center">
          <div className="w-16 flex items-center ml-1">{Images}</div>
        </div>

        <div className="col-span-2 2xl:col-span-3 inline-flex flex-col text-xs">
          <div className="inline-flex items-center justify-between my-1 w-32">
            <div className="font-semibold">
              {toRealSymbol(tokens[0].symbol)}
            </div>
            <div className="font-normal">
              {tokenAmountShare(pool, tokens[0], userTotalShareToString)}
            </div>
          </div>
          <div className="inline-flex items-center justify-between my-1 w-32">
            <div className="col-span-3 font-semibold">
              {toRealSymbol(tokens[1].symbol)}
            </div>
            <div className="font-normal">
              {tokenAmountShare(pool, tokens[1], userTotalShareToString)}
            </div>
          </div>
        </div>

        <div className="col-span-3 2xl:col-span-2 text-left ml-6 2xl:ml-0">
          <MyShares
            shares={shares}
            totalShares={pool.shareSupply}
            decimal={2}
            stakeList={stakeList}
            poolId={pool.id}
            supportFarm={supportFarm}
            userTotalShare={userTotalShare}
            farmStake={farmStake}
          />
        </div>
        <div className="flex items-center justify-end 2xl:justify-center text-center  col-span-3 ">
          <div className="flex items-center">
            <SolidButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowFunding(true);
              }}
              className="text-xs col-span-2 mr-4 w-24 text-center"
            >
              <FormattedMessage
                id="add_liquidity"
                defaultMessage="Add Liquidity"
              />
            </SolidButton>

            <OutlineButton
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                setShowWithdraw(true);
              }}
              className="text-xs px-4 col-span-2 w-20 text-center"
            >
              <FormattedMessage id="remove" defaultMessage="Remove" />
            </OutlineButton>
          </div>
        </div>
      </Link>
      {/* Mobile */}
      <Link
        className="lg:hidden pb-4 px-6 text-sm text-white cursor-pointer"
        to={{ pathname: `/pool/${pool.id}` }}
      >
        <Card width="w-full" padding="py-4 px-0">
          <div className="flex items-center pb-4 border-b border-gray-700 border-opacity-70 px-6">
            <div className="ml-1 mr-4 flex items-center">{Images}</div>
            <div className="text-xs font-semibold">
              {toRealSymbol(tokens[0].symbol)}-{toRealSymbol(tokens[1].symbol)}
            </div>
          </div>
          <div className="flex flex-col text-sm border-b border-gray-700 border-opacity-70 px-6">
            <div className="flex items-center justify-between my-2">
              <div className="col-span-3 text-gray-400">
                {toRealSymbol(tokens[0].symbol)}
              </div>
              <div className="font-normal">
                {tokenAmountShare(pool, tokens[0], userTotalShareToString)}
              </div>
            </div>
            <div className="flex items-center justify-between my-2">
              <div className="col-span-3 text-gray-400">
                {toRealSymbol(tokens[1].symbol)}
              </div>
              <div className="font-normal">
                {tokenAmountShare(pool, tokens[1], userTotalShareToString)}
              </div>
            </div>
          </div>

          <div className="flex items justify-between border-b border-gray-700 border-opacity-70 px-6 py-2">
            <div className="text-gray-400 text-sm">
              <FormattedMessage id="my_shares" defaultMessage="Shares" />
            </div>

            <div>
              <MyShares
                shares={shares}
                totalShares={pool.shareSupply}
                decimal={2}
                poolId={pool.id}
                stakeList={stakeList}
                supportFarm={supportFarm}
                userTotalShare={userTotalShare}
                farmStake={farmStake}
              />
            </div>
          </div>
          <div className="mt-4 flex items-center justify-center px-6">
            <div className="">
              <SolidButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowFunding(true);
                }}
                className="text-sm w-28 mr-4"
              >
                <FormattedMessage
                  id="add_liquidity"
                  defaultMessage="Add Liquidity"
                />
              </SolidButton>

              <OutlineButton
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setShowWithdraw(true);
                }}
                className="text-sm w-24"
              >
                <FormattedMessage id="remove" defaultMessage="Remove" />
              </OutlineButton>
            </div>
          </div>
        </Card>
      </Link>
      <RemoveLiquidityModal
        pool={pool}
        shares={balance}
        tokens={tokens}
        isOpen={showWithdraw}
        onRequestClose={() => setShowWithdraw(false)}
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            bottom: '50%',
          },
        }}
      />
      <AddLiquidityModal
        pool={pool}
        tokens={tokens}
        isOpen={showFunding}
        onRequestClose={() => setShowFunding(false)}
        overlayClassName=""
        style={{
          overlay: {
            backdropFilter: 'blur(15px)',
            WebkitBackdropFilter: 'blur(15px)',
          },
          content: {
            outline: 'none',
            position: 'fixed',
            bottom: '50%',
          },
        }}
      />
    </>
  );
}
