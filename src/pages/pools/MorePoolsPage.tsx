import React, { useState, useEffect } from 'react';
import { PoolDb } from '~store/RefDatabase';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Card } from '~components/card/Card';
import {
  BackArrowWhite,
  BackArrowGray,
  DownArrowLight,
  UpArrowDeep,
  UpArrowLight,
} from '~components/icon';
import { FarmMiningIcon } from '~components/icon/FarmMining';
import { BreadCrumb } from '~components/layout/BreadCrumb';

import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTokens } from '../../state/token';
import { TokenMetadata } from '~services/ft-contract';
import { canFarm, Pool } from '../../services/pool';
import { FarmButton } from '~components/button/Button';

import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { useAllWatchList, useMorePools } from '~state/pool';
import { PoolRPCView } from '~services/api';
import { FarmStamp } from '~components/icon/FarmStamp';
import { divide, find } from 'lodash';
import { WatchListStartFull } from '~components/icon/WatchListStar';

interface LocationTypes {
  morePoolIds: string[];
  tokens: TokenMetadata[];
}
function PoolRow({
  pool,
  index,
  tokens,
  watched,
  morePoolIds,
}: {
  pool: PoolRPCView;
  index: number;
  tokens: TokenMetadata[];
  watched: Boolean;
  morePoolIds: string[];
}) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const [farmCount, setFarmCount] = useState<Number>(1);

  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(!!canFarm);
      setFarmCount(canFarm);
    });
  }, [pool]);

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  return (
    <Link
      className="grid grid-cols-10 py-3.5 text-white content-center text-sm text-left mx-8  border-b border-gray-700 border-opacity-70 hover:opacity-80"
      onClick={() => {
        localStorage.setItem('fromMorePools', 'y');
        localStorage.setItem('morePoolIds', JSON.stringify(morePoolIds));
      }}
      to={{
        pathname: `/pool/${pool.id}`,
        state: {
          tvl: pool?.tvl,
          backToFarms: supportFarm,
          tokens,
          morePoolIds,
        },
      }}
    >
      <div className="col-span-7 flex items-center">
        <div className="mr-12 w-2">{pool?.id}</div>

        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-9 w-9 border border-gradientFromHover rounded-full mr-2">
              <img
                key={tokens[0].id.substring(0, 12).substring(0, 12)}
                className="rounded-full w-full"
                src={tokens[0].icon}
              />
            </div>

            <div className="h-9 w-9 border border-gradientFromHover rounded-full">
              <img
                key={tokens[1].id}
                className="w-full rounded-full"
                src={tokens[1].icon}
              />
            </div>
          </div>
          <div className="text-sm ml-7">
            {tokens[0].symbol + '-' + tokens[1].symbol}
          </div>
        </div>
        {supportFarm && <FarmButton farmCount={farmCount} />}
        {watched && (
          <div className="mx-2">
            <WatchListStartFull />
          </div>
        )}
      </div>

      <div className="col-span-2 py-1  ">
        {calculateFeePercent(pool?.total_fee)}%
      </div>

      <div className="col-span-1 py-1">
        ${toInternationalCurrencySystem(pool?.tvl.toString())}
      </div>
    </Link>
  );
}
const MobileRow = ({
  pool,
  tokens,
  watched,
  morePoolIds,
}: {
  pool: PoolRPCView;
  tokens: TokenMetadata[];
  watched: Boolean;
  morePoolIds: string[];
}) => {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const [farmCount, setFarmCount] = useState<Number>(1);

  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(!!canFarm);
      setFarmCount(canFarm);
    });
  }, [pool]);

  return (
    <Card
      width="w-full"
      bgcolor="bg-cardBg"
      className="rounded mb-2"
      padding="p-4"
    >
      <Link
        onClick={() => {
          localStorage.setItem('morePoolIds', JSON.stringify(morePoolIds));

          localStorage.setItem('fromMorePools', 'y');
        }}
        to={{
          pathname: `/pool/${pool.id}`,
          state: {
            tvl: pool?.tvl,
            backToFarms: supportFarm,
            tokens,
            morePoolIds,
          },
        }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <div className="flex items-center">
              <div className="h-6 w-6 border border-gradientFromHover rounded-full">
                <img
                  key={tokens[0].id.substring(0, 12).substring(0, 12)}
                  className="rounded-full w-full"
                  src={tokens[0].icon}
                />
              </div>

              <div className="h-6 w-6 border border-gradientFromHover rounded-full">
                <img
                  key={tokens[1].id}
                  className="w-full rounded-full"
                  src={tokens[1].icon}
                />
              </div>
            </div>
            <div className="text-lg ml-2 font-semibold">
              {tokens[0].symbol + '-' + tokens[1].symbol}
            </div>
            {watched && (
              <div className="ml-2">
                <WatchListStartFull />
              </div>
            )}
          </div>
          {supportFarm && <FarmButton farmCount={farmCount} />}
        </div>

        <div className="flex flex-col text-base">
          <div className="flex items-center justify-between my-3">
            <div className="text-gray-400">
              <FormattedMessage id="fee" defaultMessage="Fee" />
            </div>
            <div>{calculateFeePercent(pool?.total_fee)}%</div>
          </div>

          <div className="flex items-center justify-between my-3">
            <div className="text-gray-400">
              <FormattedMessage id="tvl" defaultMessage="TVL" />
            </div>
            <div>${toInternationalCurrencySystem(pool?.tvl.toString())}</div>
          </div>
        </div>
      </Link>
    </Card>
  );
};

export const FarmMining = () => {
  return (
    <div className="flex items-center">
      <div>
        <FarmStamp />
      </div>
      <div className="hidden">
        <FarmMiningIcon />
      </div>
    </div>
  );
};

export const MorePoolsPage = () => {
  const { state } = useLocation<LocationTypes>();
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState<boolean | 'desc' | 'asc'>('desc');
  const morePoolIds = state?.morePoolIds;
  const tokens = state?.tokens;
  const morePools = useMorePools({ morePoolIds, order, sortBy });

  const watchList = useAllWatchList();

  return (
    <>
      {/* PC */}
      <div className="xs:hidden md:hidden lg:w-5/6 xl:w-3/4 m-auto text-white">
        <Card width="w-full" bgcolor="bg-cardBg" padding="py-7 px-0">
          <div className="mx-8 text-gray-400">
            <BreadCrumb
              routes={[
                {
                  id: 'top_pools',
                  msg: 'Top Pools',
                  pathname: '/pools',
                },
                {
                  id: 'more_pools',
                  msg: 'More Pools',
                  pathname: `/more_pools`,
                },
              ]}
            />
            <div className="flex items-center mb-14 justify-center">
              <div className="flex items-center">
                <div className="h-9 w-9 border border-gradientFromHover rounded-full mr-2">
                  <img
                    key={tokens[0].id.substring(0, 12).substring(0, 12)}
                    className="rounded-full w-full mr-2"
                    src={tokens[0].icon}
                  />
                </div>

                <div className="h-9 w-9 border border-gradientFromHover rounded-full">
                  <img
                    key={tokens[1].id}
                    className="rounded-full w-full"
                    src={tokens[1].icon}
                  />
                </div>
              </div>
              <div className="text-2xl ml-7">
                {tokens[0].symbol + '-' + tokens[1].symbol}
              </div>
            </div>
          </div>

          <section className="">
            <header className="grid grid-cols-10 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
              <div className="col-span-7 flex items-center">
                <div className="mr-3 ">
                  <FormattedMessage id="pool_id" defaultMessage="Pool ID" />
                </div>
                <FormattedMessage id="pair" defaultMessage="Pair" />
              </div>
              <div
                className="col-span-2 md:hidden cursor-pointer flex items-center"
                onClick={() => {
                  setSortBy('total_fee');
                  setOrder(order === 'desc' ? 'asc' : 'desc');
                }}
              >
                <div className="mr-1">
                  <FormattedMessage id="fee" defaultMessage="Fee" />
                </div>
                {sortBy === 'total_fee' ? (
                  order === 'desc' ? (
                    <DownArrowLight />
                  ) : (
                    <UpArrowLight />
                  )
                ) : (
                  <UpArrowDeep />
                )}
              </div>

              <div
                className="col-span-1 flex items-center cursor-pointer"
                onClick={() => {
                  setSortBy('tvl');
                  setOrder(order === 'desc' ? 'asc' : 'desc');
                }}
              >
                <span className="mr-1 ">
                  <FormattedMessage id="tvl" defaultMessage="TVL" />
                </span>
                {sortBy === 'tvl' ? (
                  order === 'desc' ? (
                    <DownArrowLight />
                  ) : (
                    <UpArrowLight />
                  )
                ) : (
                  <UpArrowDeep />
                )}
              </div>
            </header>
            <div className="max-h-96 overflow-y-auto">
              {morePools?.map((pool, i) => (
                <div
                  className="w-full hover:bg-poolRowHover hover:bg-opacity-20"
                  key={i}
                >
                  <PoolRow
                    key={i}
                    pool={pool}
                    index={i + 1}
                    tokens={tokens}
                    watched={!!find(watchList, { pool_id: pool.id.toString() })}
                    morePoolIds={morePoolIds}
                  />
                </div>
              ))}
            </div>
          </section>
        </Card>
      </div>
      {/* Mobile */}
      <div className="w-11/12 lg:hidden m-auto text-white">
        <BreadCrumb
          routes={[
            {
              id: 'top_pools',
              msg: 'Top Pools',
              pathname: '/pools',
            },
            {
              id: 'more_pools',
              msg: 'More Pools',
              pathname: `/more_pools`,
            },
          ]}
        />
        <div className="flex flex-col items-center my-4 justify-center">
          <div className="flex items-center">
            <div className="h-9 w-9 border border-gradientFromHover rounded-full mr-2">
              <img
                key={tokens[0].id.substring(0, 12).substring(0, 12)}
                className="rounded-full w-full mr-2"
                src={tokens[0].icon}
              />
            </div>

            <div className="h-9 w-9 border border-gradientFromHover rounded-full">
              <img
                key={tokens[1].id}
                className="w-full rounded-full"
                src={tokens[1].icon}
              />
            </div>
          </div>
          <div className="text-2xl">
            {tokens[0].symbol + '-' + tokens[1].symbol}
          </div>
        </div>
        {morePools?.map((pool, i) => {
          return (
            <MobileRow
              tokens={tokens}
              key={i}
              pool={pool}
              watched={!!find(watchList, { pool_id: pool.id.toString() })}
              morePoolIds={morePoolIds}
            />
          );
        })}
      </div>
    </>
  );
};
