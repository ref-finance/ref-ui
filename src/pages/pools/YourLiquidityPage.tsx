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
import { toRoundedReadableNumber, percent, toPrecision } from '~utils/numbers';
import { usePool } from '~state/pool';
import { RemoveLiquidityModal } from './DetailsPage';
import { getPool, getYourPools } from '~services/indexer';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage } from 'react-intl';
import { Link, useHistory } from 'react-router-dom';
import BigNumber from 'bignumber.js';
import { LP_TOKEN_DECIMALS } from '~services/m-token';

import { canFarm } from '~services/pool';

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

  const farmSharePercent = toPrecision(
    percent(
      farmShare,
      userTotalShare
        .toNumber()
        .toLocaleString('fullwide', { useGrouping: false })
    ).toString(),
    0
  );

  let displayPercent;
  if (Number.isNaN(sharePercent) || sharePercent === 0) displayPercent = '0';
  else if (sharePercent < 0.0001)
    displayPercent = `< ${
      decimal ? '0.'.padEnd(decimal + 1, '0') + '1' : '0.0001'
    }`;
  else displayPercent = toPrecision(String(sharePercent), decimal || 4);

  return (
    <div className="">
      <div className="px-2 mb-1">{`${displayPercent}% of Total`}</div>
      {supportFarm > 0 && (
        <object>
          <Link
            className="inline-flex items-center inline-block text-xs text-gradientFrom rounded-full px-2 py-1 border border-transparent hover:border-gradientFrom"
            to="/farms"
          >
            <FarmDot inFarm={Number(farmShare) > 0} className="mr-1" />
            <div className="mr-2">
              <span className="text-gradientFrom">
                {`${farmSharePercent}% `}{' '}
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
          id="you_are_not_providing_liquidity_to_any_pools"
          defaultMessage="You aren’t providing liquidity to any pools"
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
    <div className="flex items-center flex-col w-2/5 md:w-5/6 xs:w-11/12 m-auto">
      <div className="w-full flex justify-center">
        {error && <Alert level="error" message={error.message} />}
      </div>
      <Card width="w-full" padding="px-0 py-6">
        <div className="text-white text-xl px-6 pb-6">
          <FormattedMessage id="my_liquidity" defaultMessage="My Liquidity" />
        </div>
        {pools.length > 0 ? (
          <section>
            <div className="">
              <div
                className="grid grid-cols-10 md:flex xs:flex md:items-center xs:items-center xs:justify-between md:justify-between py-2 content-center items-center text-xs text-primaryText px-6
                xs:border-b xs:border-gray-700 xs:border-opacity-70 md:border-b md:border-gray-700 md:border-opacity-70"
              >
                <div className="grid col-span-5">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="col-span-5 ml-2">
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
            <div className="flex items-center justify-center mt-4 px-6 xs:mt-12 md:mt-12">
              <AddLiquidityButton />
            </div>
          </section>
        ) : (
          <Empty />
        )}
      </Card>
    </div>
  );
}

function PoolRow(props: { pool: any; balance: string }) {
  const { pool, shares, stakeList } = usePool(props.pool.id);
  const { balance } = props;
  const tokens = useTokens(pool?.tokenIds);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [supportFarm, setSupportFarm] = useState<Number>();
  const [farmStake, setFarmStake] = useState<string | number>('0');

  const history = useHistory();

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

  if (!pool || !tokens || tokens.length < 2 || !(userTotalShare.toNumber() > 0))
    return null;

  const Images = tokens.map((token, index) => {
    const { icon, id } = token;
    if (icon)
      return (
        <img
          key={id}
          className={
            'inline-block h-7 w-7 rounded-full border border-gradientFromHover xs:-ml-1 md:-ml-1'
          }
          src={icon}
        />
      );
    return (
      <div
        key={id}
        className={
          'inline-block h-7 w-7 rounded-full bg-cardBg border border-gradientFromHover xs:-ml-1 md:-ml-1'
        }
      ></div>
    );
  });

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  return (
    <>
      {/* PC */}
      <Link
        className="xs:hidden md:hidden grid grid-cols-10 py-2 content-center items-center text-sm text-white px-6 border-t border-gray-700 border-opacity-70 cursor-pointer"
        to={`/pool/${pool.id}`}
      >
        <div className="col-span-5 inline-flex items-center">
          <div className="w-16 lg:flex lg:items-center lg:justify-between xs:ml-1 md:ml-1">
            {Images}
          </div>
          <div className="mx-4 text-left">
            {toRealSymbol(tokens[0].symbol)}-{toRealSymbol(tokens[1].symbol)}
          </div>
        </div>

        <div className="col-span-3 text-left">
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
        <div className="col-span-2 text-right z-30">
          <OutlineButton
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              setShowWithdraw(true);
            }}
            className="text-xs px-4"
            padding="py-1"
          >
            <FormattedMessage id="remove" defaultMessage="Remove" />
          </OutlineButton>
        </div>
      </Link>
      {/* Mobile */}
      <Link
        className="lg:hidden pt-6 pb-4 px-6 text-sm text-white border-b border-gray-700 border-opacity-70 flex flex-col cursor-pointer"
        to={`/pool/${pool.id}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className="ml-1 mr-2 flex items-center">{Images}</div>
            <div className="text-xs font-semibold">
              {toRealSymbol(tokens[0].symbol)}-{toRealSymbol(tokens[1].symbol)}
            </div>
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
        <div className="mt-2 self-end">
          <OutlineButton
            onClick={(e) => {
              e.preventDefault();
              setShowWithdraw(true);
            }}
            className="text-xs px-4 font-semibold"
            padding="py-1"
          >
            <FormattedMessage id="remove" defaultMessage="Remove" />
          </OutlineButton>
        </div>
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
    </>
  );
}
