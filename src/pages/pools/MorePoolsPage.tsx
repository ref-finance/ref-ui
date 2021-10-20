import React, { useState, useEffect } from 'react';
import { PoolDb } from '~store/RefDatabase';
import { Link, useLocation, useParams } from 'react-router-dom';
import { Card } from '~components/card/Card';
import { BackArrow } from '~components/icon';
import { FarmMiningIcon } from '~components/icon/FarmMining';
import Loading from '~components/layout/Loading';

import { useHistory } from 'react-router';
import { FormattedMessage, useIntl } from 'react-intl';
import { PolygonGray, PolygonGreen } from '~components/icon/Polygon';
import { useTokens } from '../../state/token';
import { TokenMetadata } from '~services/ft-contract';
import { canFarm, Pool } from '../../services/pool';

import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { useMorePools } from '~state/pool';
import { PoolRPCView } from '~services/api';

interface LocationTypes {
  morePoolIds: string[];
  tokens: TokenMetadata[];
}
function PoolRow({
  pool,
  index,
  tokens,
}: {
  pool: PoolRPCView;
  index: number;
  tokens: TokenMetadata[];
}) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);

  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, [pool]);

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const farmButton = () => {
    if (supportFarm)
      return (
        <div className="flex items-center">
          <div className="px-0.5 ml-3 mr-2 text-xs text-center bg-gray-600 text-gray-400 inline-block rounded ">
            <FormattedMessage id="farms" defaultMessage="Farms" />
          </div>
          <FarmMiningIcon />
        </div>
      );
    return '';
  };

  return (
    <div className="grid grid-cols-12 py-3.5 text-white content-center text-base text-left mx-8  border-b border-gray-600">
      <div className="col-span-1">{index}</div>

      <Link
        to={{
          pathname: `/pool/${pool.id}`,
          state: { tvl: pool?.tvl },
        }}
        className="col-span-7 md:col-span-4 flex items-center"
      >
        <div className="flex items-center">
          <div className="h-9 w-9 border rounded-full mr-2">
            <img
              key={tokens[0].id.substring(0, 12).substring(0, 12)}
              className="rounded-full mr-2 w-full"
              src={tokens[0].icon}
            />
          </div>

          <div className="h-9 w-9 border rounded-full">
            <img
              key={tokens[1].id}
              className="h-9 w-9 border rounded-full"
              src={tokens[1].icon}
            />
          </div>
        </div>
        <div className="text-lg ml-7">
          {tokens[0].symbol + '-' + tokens[1].symbol}
        </div>
        {farmButton()}

        {/*  */}
      </Link>

      <div className="col-span-1 py-1 md:hidden ">
        {calculateFeePercent(pool?.total_fee)}%
      </div>
      <div className="col-span-2 sm:col-span-4 py-1">Coming soon</div>

      <div className="col-span-1 py-1">
        ${toInternationalCurrencySystem(pool?.tvl.toString())}
      </div>
    </div>
  );
}

export const MorePoolsPage = () => {
  const { state } = useLocation<LocationTypes>();
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const morePoolIds = state?.morePoolIds;
  const tokens = state?.tokens;
  const morePools = useMorePools({ morePoolIds });

  // const intl = useIntl();

  console.log(tokens, morePoolIds);

  return (
    <div className="w-4/6 lg:w-5/6 xl:w-3/4 md:w-5/6 m-auto text-white">
      <Card width="w-full" bgColor="bg-cardBg" padding="py-7 px-0">
        <div className="mx-8">
          <Link
            to={{
              pathname: '/pools',
            }}
            className="flex items-center inline-block"
          >
            <BackArrow />
            <p className="ml-3">Pools</p>
          </Link>
          <div className="flex items-center mb-14 justify-center">
            <div className="flex items-center">
              <div className="h-9 w-9 border rounded-full mr-2">
                <img
                  key={tokens[0].id.substring(0, 12).substring(0, 12)}
                  className="rounded-full mr-2 w-full"
                  src={tokens[0].icon}
                />
              </div>

              <div className="h-9 w-9 border rounded-full">
                <img
                  key={tokens[1].id}
                  className="h-9 w-9 border rounded-full"
                  src={tokens[1].icon}
                />
              </div>
            </div>
            <div className="text-2xl ml-7">
              {tokens[0].symbol + '-' + tokens[1].symbol}
            </div>
          </div>
        </div>

        <section className="px-2">
          <header className="grid grid-cols-12 py-2 pb-4 text-left text-base text-gray-400 mx-8 border-b border-gray-600">
            <p
              className="col-span-1 flex items-center"
              // onClick={() => {
              //   onSortChange('id');
              //   onOrderChange(order === 'desc' ? 'asc' : 'desc');
              // }}
            >
              <div className="mr-1">
                <FormattedMessage id="id" defaultMessage="#" />
              </div>
              {sortBy === 'id' && order === 'desc' ? (
                <PolygonGreen />
              ) : (
                <PolygonGray />
              )}
            </p>
            <p className="col-span-7 md:col-span-4">
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </p>
            <p
              className="col-span-1 md:hidden cursor-pointer flex items-center"
              onClick={() => {
                setSortBy('fee');
                setOrder(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
              {sortBy === 'fee' && order === 'desc' ? (
                <PolygonGreen />
              ) : (
                <PolygonGray />
              )}
            </p>
            <p
              className="col-span-2 flex items-center cursor-pointer "
              onClick={() => {
                setSortBy('24h_volume');
                setOrder(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <div className="mr-1">
                <FormattedMessage id="24h_volume" defaultMessage="24h Volume" />
              </div>
              {sortBy === '24h_volume' && order === 'desc' ? (
                <PolygonGreen />
              ) : (
                <PolygonGray />
              )}
            </p>

            <div
              className="col-span-1 flex items-center"
              onClick={() => {
                setSortBy('tvl');
                setOrder(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <span className="mr-1">
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
              {sortBy === 'tvl' && order === 'desc' ? (
                <PolygonGreen />
              ) : (
                <PolygonGray />
              )}
            </div>
          </header>
          <div className="max-h-96 overflow-y-auto">
            {morePools?.map((pool, i) => (
              <div className="w-full hover:bg-poolRowHover">
                <PoolRow key={i} pool={pool} index={i + 1} tokens={tokens} />
              </div>
            ))}
          </div>
        </section>
      </Card>
    </div>
  );
};
