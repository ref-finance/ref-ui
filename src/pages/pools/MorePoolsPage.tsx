import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Card } from '../../components/card/Card';
import {
  BackArrowWhite,
  BackArrowGray,
  DownArrowLight,
  UpArrowDeep,
  UpArrowLight,
} from '../../components/icon';
import { FarmMiningIcon } from '../../components/icon/FarmMining';
import { BreadCrumb } from '../../components/layout/BreadCrumb';

import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { useTokens } from '../../state/token';
import { TokenMetadata } from '../../services/ft-contract';
import { FarmButton } from '../../components/button/Button';

import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import {
  useAllWatchList,
  useMorePools,
  useSeedFarmsByPools,
} from '../../state/pool';
import { PoolRPCView } from '../../services/api';
import { FarmStamp } from '../../components/icon/FarmStamp';
import { divide, find } from 'lodash';
import { WatchListStartFull } from '../../components/icon/WatchListStar';
import { scientificNotationToString } from '../../utils/numbers';
import { usePoolsFarmCount, useDayVolumesPools } from '../../state/pool';
import { useClientMobile } from '../../utils/device';
import { PoolTabV3 } from '../../components/pool/PoolTabV3';
import Loading from '../../components/layout/Loading';
import { FarmStampNew } from '../../components/icon/FarmStamp';
import { getPoolListFarmAprTip } from './utils';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import CustomTooltip from 'src/components/customTooltip/customTooltip';

interface ParamTypes {
  tokenIds: string;
}

interface LocationTypes {
  morePoolIds: string[];
  tokens: TokenMetadata[];
}
function PoolRow({
  pool,
  index,
  tokens: curTokens,
  watched,
  morePoolIds,
  farmCount,
  farmApr,
}: {
  pool: PoolRPCView;
  index: number;
  tokens: TokenMetadata[];
  watched: Boolean;
  morePoolIds: string[];
  farmCount: number;
  farmApr: number;
}) {
  const supportFarm = !!farmCount;

  const tokens = curTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return 0;
  });

  return (
    <Link
      className="grid grid-cols-8 py-3.5 text-white content-center text-sm text-left mx-8  border-b border-gray-700 border-opacity-70 hover:opacity-80"
      onClick={() => {
        localStorage.setItem('fromMorePools', 'y');
        localStorage.setItem('morePoolIds', JSON.stringify(morePoolIds));
      }}
      style={{
        height: '70px',
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
      <div className="col-span-4 flex items-center">
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
        {supportFarm && <FarmStampNew multi={farmCount > 1} />}
        {watched && (
          <div className="mx-2">
            <WatchListStartFull />
          </div>
        )}
      </div>

      <div className="col-span-1 relative right-4 py-1  ">
        {calculateFeePercent(pool?.total_fee)}%
      </div>

      <div
        className="col-span-1 py-1   "
        data-type="info"
        data-place="left"
        data-multiline={true}
        data-class={'reactTip'}
        data-tooltip-html={getPoolListFarmAprTip()}
        data-tooltip-id={'pool_list_pc_apr' + pool.id}
      >
        <span className="ml-2">
          {!pool?.baseApr
            ? '-'
            : `${toPrecision(pool?.baseApr?.toString() || '0', 2)}%`}
        </span>
        {supportFarm &&
          farmApr !== undefined &&
          farmApr !== null &&
          farmApr > 0 && (
            <div className="text-xs text-gradientFrom">
              {`+${toPrecision((farmApr * 100).toString(), 2)}%`}
            </div>
          )}

        {supportFarm && farmApr > 0 && (
          <CustomTooltip
            className="w-20"
            id={'pool_list_pc_apr' + pool.id}
            place="right"
          />
        )}
      </div>

      <div className="col-span-1 py-1 relative left-6 " title={pool.h24volume}>
        {!pool.h24volume
          ? '-'
          : Number(pool.h24volume) == 0
          ? '$0'
          : Number(pool.h24volume) < 0.01
          ? '$ <0.01'
          : `$${toInternationalCurrencySystem(pool.h24volume)}`}
      </div>

      <div
        className="col-span-1 justify-self-end relative right-4 py-1"
        title={toPrecision(
          scientificNotationToString(pool?.tvl?.toString() || '0'),
          0
        )}
      >
        ${toInternationalCurrencySystem(pool?.tvl.toString())}
      </div>
    </Link>
  );
}
const MobileRow = ({
  pool,
  tokens: curTokens,
  watched,
  morePoolIds,
  farmCount,
  farmApr,
}: {
  pool: PoolRPCView;
  tokens: TokenMetadata[];
  watched: Boolean;
  morePoolIds: string[];
  farmCount: number;
  farmApr: number;
}) => {
  const supportFarm = !!farmCount;

  const tokens = curTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return 0;
  });

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
          {supportFarm && <FarmStampNew multi={farmCount > 1} />}
        </div>

        <div className="flex flex-col text-base">
          <div className="flex items-center justify-between my-3">
            <div className="text-gray-400">
              <FormattedMessage id="fee" defaultMessage="Fee" />
            </div>
            <div>{calculateFeePercent(pool?.total_fee)}%</div>
          </div>

          <div className="flex items-center justify-between my-3">
            <div className="text-gray-400 ">
              <FormattedMessage id="apr" defaultMessage="APR" />
              {supportFarm &&
                farmApr !== undefined &&
                farmApr !== null &&
                farmApr > 0 &&
                pool.h24volume && (
                  <div className="text-xs">(Pool Fee + Farm Rewards)</div>
                )}
            </div>
            <div className="flex flex-col items-end">
              {!pool.h24volume
                ? '-'
                : `${toPrecision(pool?.baseApr?.toString() || '0', 2)}%`}
              {supportFarm &&
                farmApr !== undefined &&
                farmApr !== null &&
                farmApr > 0 &&
                pool.h24volume && (
                  <div>
                    <div className="text-xs text-gradientFrom">
                      {`+${toPrecision((farmApr * 100).toString(), 2)}%`}
                    </div>
                  </div>
                )}
            </div>
          </div>

          <div className="flex items-center justify-between my-3">
            <div className="text-gray-400">
              <FormattedMessage id="volume_24h" defaultMessage="Volume (24h)" />
            </div>
            <div>
              {' '}
              {!pool.h24volume
                ? '-'
                : Number(pool.h24volume) == 0
                ? '$0'
                : Number(pool.h24volume) < 0.01
                ? '$ <0.01'
                : `$${toInternationalCurrencySystem(pool.h24volume)}`}
            </div>
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

export function getPoolFeeAprTitleRPCView(
  dayVolume: string,
  pool: PoolRPCView
) {
  let result = '';
  if (dayVolume) {
    const { total_fee: fee, tvl } = pool;
    const revenu24h = (fee / 10000) * 0.8 * Number(dayVolume);
    if (tvl > 0 && revenu24h > 0) {
      const annualisedFeesPrct = ((revenu24h * 365) / tvl / 2) * 100;
      result = scientificNotationToString(annualisedFeesPrct.toString());
    }
  }
  return Number(result);
}

export default function MorePoolsPage() {
  const { state } = useLocation<LocationTypes>();
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState<boolean | 'desc' | 'asc'>('desc');

  const { tokenIds } = useParams<ParamTypes>();

  const tokenIdsArray = tokenIds.split(',');

  const tokens = state?.tokens || useTokens(tokenIdsArray);
  const morePools = useMorePools({ tokenIds: tokenIdsArray, order, sortBy });

  const morePoolIds = morePools?.map((p) => p.id.toString());

  const watchList = useAllWatchList();

  const poolsFarmCount = usePoolsFarmCount({
    morePoolIds,
  });
  const clientMobileDevice = useClientMobile();

  if (!tokens || !morePools) return <Loading />;

  return (
    <>
      <PoolTabV3></PoolTabV3>
      {/* PC */}
      <div className="xs:hidden md:hidden w-1000px  m-auto text-white">
        <Card
          className="mt-4"
          width="w-full"
          bgcolor="bg-cardBg"
          padding="py-7 px-0"
        >
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
            <header className="grid grid-cols-8 py-2 pb-4 text-left text-sm text-primaryText mx-8 border-b border-gray-700 border-opacity-70">
              <div className="col-span-4 flex items-center">
                <div className="mr-3 ">
                  <FormattedMessage id="pool_id" defaultMessage="Pool ID" />
                </div>
                <FormattedMessage id="pair" defaultMessage="Pair" />
              </div>
              <div
                className={`col-span-1 relative right-4 md:hidden  flex items-center
             
                
                `}
                onClick={() => {
                  setSortBy('total_fee');
                  setOrder(
                    sortBy === 'total_fee'
                      ? order === 'desc'
                        ? 'asc'
                        : 'desc'
                      : 'desc'
                  );
                }}
              >
                <div
                  className={`mr-1 cursor-pointer
                ${sortBy !== 'total_fee' ? 'hover:text-white' : ''} ${
                    sortBy === 'total_fee' ? 'text-gradientFrom' : ''
                  }
                
                `}
                >
                  <FormattedMessage id="fee" defaultMessage="Fee" />
                </div>
                <span
                  className={`
                  ${sortBy === 'total_fee' ? '' : 'hidden'}
                  `}
                >
                  {sortBy === 'total_fee' ? (
                    order === 'desc' ? (
                      <DownArrowLight />
                    ) : (
                      <UpArrowLight />
                    )
                  ) : (
                    <UpArrowDeep />
                  )}
                </span>
              </div>
              <span
                className={`col-span-1 md:hidden  flex items-center
                
       
                `}
                onClick={() => {
                  setSortBy('apr');
                  setOrder(
                    sortBy === 'apr'
                      ? order === 'desc'
                        ? 'asc'
                        : 'desc'
                      : 'desc'
                  );
                }}
              >
                <span
                  className={`mr-1 cursor-pointer
                         ${sortBy !== 'apr' ? 'hover:text-white' : ''} ${
                    sortBy === 'apr' ? 'text-gradientFrom' : ''
                  }
                `}
                >
                  <FormattedMessage id="apr" defaultMessage="APR" />
                </span>
                <span
                  className={`
                    ${sortBy === 'apr' ? '' : 'hidden'}
                  `}
                >
                  {sortBy === 'apr' ? (
                    order === 'desc' ? (
                      <DownArrowLight />
                    ) : (
                      <UpArrowLight />
                    )
                  ) : (
                    <UpArrowDeep />
                  )}
                </span>
              </span>
              <div
                className={`col-span-1 md:hidden  flex items-center
      
                
                `}
                onClick={() => {
                  setSortBy('h24volume');
                  setOrder(
                    sortBy === 'h24volume'
                      ? order === 'desc'
                        ? 'asc'
                        : 'desc'
                      : 'desc'
                  );
                }}
              >
                <div
                  className={`mr-1 cursor-pointer whitespace-nowrap
                
                ${sortBy !== 'h24volume' ? 'hover:text-white' : ''} ${
                    sortBy === 'h24volume' ? 'text-gradientFrom' : ''
                  }
                `}
                >
                  <FormattedMessage
                    id="volume_24h"
                    defaultMessage="Volume (24h)"
                  />
                </div>

                <span>
                  {sortBy === 'h24volume' ? (
                    order === 'desc' ? (
                      <DownArrowLight />
                    ) : (
                      <UpArrowLight />
                    )
                  ) : null}
                </span>
              </div>

              <div
                className={`col-span-1 flex justify-self-end relative right-6 items-center cursor-pointer
                ${sortBy !== 'tvl' ? 'hover:text-white' : ''} ${
                  sortBy === 'tvl' ? 'text-gradientFrom' : ''
                }
                `}
                onClick={() => {
                  setSortBy('tvl');
                  setOrder(
                    sortBy === 'tvl'
                      ? order === 'desc'
                        ? 'asc'
                        : 'desc'
                      : 'desc'
                  );
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
                ) : null}
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
                    farmCount={poolsFarmCount[pool.id]}
                    farmApr={pool.farmApr}
                  />
                </div>
              ))}
            </div>
          </section>
        </Card>
      </div>
      {/* Mobile */}
      {clientMobileDevice && (
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
                watched={
                  watchList &&
                  !!watchList.map((p) => p.id).includes(pool.id.toString())
                }
                morePoolIds={morePoolIds}
                farmCount={poolsFarmCount[pool.id]}
                farmApr={pool.farmApr}
              />
            );
          })}
        </div>
      )}
    </>
  );
}
