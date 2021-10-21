import React, { useState, useEffect } from 'react';
import { FaRegQuestionCircle, FaSearch } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { useAllPools, usePools, useMorePoolIds } from '../../state/pool';
import Loading from '~components/layout/Loading';
import { getExchangeRate, useTokens } from '../../state/token';
import { Link } from 'react-router-dom';
import { canFarm, Pool } from '../../services/pool';
import { FarmMiningIcon } from '~components/icon/FarmMining';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { PoolDb } from '~store/RefDatabase';
import { DownArrowLight, UpArrowDeep } from '~components/icon';
import { FarmStamp } from '~components/icon/FarmStamp';
import { SolidButton } from '~components/button/Button';
import { wallet } from '~services/near';
import { WatchListStart } from '~components/icon/WatchListStart';
import { PolygonGrayDown } from '~components/icon/Polygon';
import { orderBy } from 'lodash';
// import { PolygonGrayUp } from '~components/icon/Polygon';

const ConnectToNearCard = () => {
  return (
    <Card
      width="w-full"
      className="bg-opacity-0 border rounded border-gradientFrom text-white mb-5"
      padding="p-8"
    >
      <div className="mb-8">
        <FormattedMessage
          id="connect_to_near_tip"
          defaultMessage="Connect your wallet to provide liquidity and view your deposit."
        />
      </div>
      <div className="text-xl">
        <SolidButton className="w-full">
          <FormattedMessage
            id="connect_to_near"
            defaultMessage="Connect To NEAR"
          />
        </SolidButton>
      </div>
    </Card>
  );
};

function MobilePoolRow({ pool, sortBy }: { pool: Pool; sortBy: string }) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const morePoolIds = useMorePoolIds({ topPool: pool });
  const tokens = useTokens(pool.tokenIds);
  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, [pool]);

  if (!tokens) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });
  const showSortedValue = ({
    sortBy,
    value,
  }: {
    sortBy: string;
    value?: number;
  }) => {
    if (sortBy === 'tvl')
      return toInternationalCurrencySystem(value.toString());
    else if (sortBy === 'fee') return `${calculateFeePercent(value)}%`;
  };

  const MobileMoreFarmStamp = ({ count }: { count: number }) => {
    return (
      <div className="px-1 rounded border border-greenLight text-greenLight">
        {count + '+'}
      </div>
    );
  };

  return (
    <div className="flex flex-col border-b border-gray-700 bg-cardBg w-full px-4 py-6 text-white">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center justify-start">
          <div className="flex items-center">
            <div className="h-6 w-6 border rounded-full">
              <img
                key={tokens[0].id.substring(0, 12).substring(0, 12)}
                className="rounded-full w-full"
                src={tokens[0].icon}
              />
            </div>

            <div className="h-6 w-6 border rounded-full">
              <img
                key={tokens[1].id}
                className="w-full rounded-full"
                src={tokens[1].icon}
              />
            </div>
          </div>
          <Link
            to={{
              pathname: `/pool/${pool.id}`,
              state: { tvl: pool?.tvl, backToFarms: supportFarm },
            }}
            className="text-sm ml-2 font-semibold"
          >
            {tokens[0].symbol + '-' + tokens[1].symbol}
          </Link>

          {morePoolIds?.length && morePoolIds?.length - 1 > 0 && (
            <Link
              to={{
                pathname: `/more_pools/${pool.tokenIds}`,
                state: {
                  morePoolIds: morePoolIds?.filter((id) => +id !== pool.id),
                  tokens,
                },
              }}
              className="mx-2"
            >
              <MobileMoreFarmStamp count={morePoolIds?.length - 1} />
            </Link>
          )}
        </div>
        <div className="mr-4">
          {sortBy === 'h24_volume' ? (
            <FormattedMessage id="coming_soon" defaultMessage="Coming soon" />
          ) : (
            showSortedValue({ sortBy, value: pool[sortBy] })
          )}
        </div>
      </div>
    </div>
  );
}

function MobileLiquidityPage({
  pools,
  tokenName,
  order,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
  sortBy,
  allPools,
}: {
  pools: Pool[];
  tokenName: string;
  order: string;
  sortBy: string;
  hasMore: boolean;
  allPools: PoolDb[];
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<boolean>();

  const SelectModal = ({
    className,
    setShowModal,
  }: {
    className?: string;
    setShowModal: (mode: boolean) => void;
  }) => {
    return (
      <Card
        width="w-36 absolute"
        className={`rounded border border-gray-400 flex text-sm flex-col items-start ${className}`}
        padding="py-1 px-0"
      >
        <div
          className="py-1 px-2  w-full hover:bg-poolRowHover hover:text-white"
          onClick={() => {
            onSortChange('h24_volume');
            setShowModal(false);
          }}
        >
          <FormattedMessage id="h24_volume" defaultMessage="24h Volume" />
        </div>
        <div
          className="py-1 px-2 w-full hover:bg-poolRowHover hover:text-white"
          onClick={() => {
            onSortChange('tvl');
            setShowModal(false);
          }}
        >
          <FormattedMessage id="tvl" defaultMessage="TVL" />
        </div>
        <div
          className="py-1 px-2   w-full hover:bg-poolRowHover hover:text-white"
          onClick={() => {
            onSortChange('fee');
            setShowModal(false);
          }}
        >
          <FormattedMessage id="fee" defaultMessage="Fee" />
        </div>
      </Card>
    );
  };

  return (
    <div className="flex items-center flex-col w-3/6 xs:w-5/6 md:w-5/6 lg:w-5/6 xs:w-11/12 m-auto md:show lg:hidden xl:hidden xs:show">
      {!wallet.isSignedIn() && <ConnectToNearCard />}
      <Card className="w-full mb-4" bgcolor="bg-cardBg" padding="p-0">
        <div className="mx-6 mb-6 mt-3">
          <div className="text-white text-xl">
            <FormattedMessage
              id="liquidity_pools"
              defaultMessage="Liquidity Pools"
            />
          </div>
        </div>
        <div className="mx-6 flex items-center justify-between mb-2">
          <div className="flex items-center">
            <div className="text-white text-base">
              <FormattedMessage id="top_pools" defaultMessage="Top Pools" />
            </div>
            <div>
              <FaRegQuestionCircle
                data-type="dark"
                data-place="bottom"
                data-multiline={true}
                data-tip={intl.formatMessage({ id: 'topPoolsCopy' })}
                className="inline-block	ml-2 text-sm text-gray-500"
              />
              <ReactTooltip className="text-sm" />
            </div>
          </div>

          <div className="text-gray-400 text-xs">
            {(pools?.length ? pools?.length : '-') +
              ' of ' +
              (allPools?.length ? allPools?.length : '-')}
          </div>
        </div>
        <div
          className="rounded my-2 text-gray-400 flex items-center pr-2 mx-6 mb-5"
          style={{
            backgroundColor: ' rgba(0, 0, 0, 0.2)',
          }}
        >
          <input
            className={`text-sm outline-none rounded w-full py-2 px-3`}
            placeholder={intl.formatMessage({ id: 'search_pools' })}
            value={tokenName}
            onChange={(evt) => onSearch(evt.target.value)}
          />
          <FaSearch />
        </div>
        <div className="hidden mb-4 flex items-center mx-6">
          <div className="text-gray-400 text-sm mr-4">
            <FormattedMessage
              id="hide_low_tvl_pools"
              defaultMessage="Hide low TVL pools"
            />
          </div>
          <WatchListStart />
        </div>
        <div className="hidden mb-4 mx-6 ">
          <div className="text-gray-400 text-sm mr-4">
            <FormattedMessage
              id="watchlist_title"
              defaultMessage="My watchlist on the top"
            />
          </div>
        </div>
        <section className="w-full">
          <header className="p-4 text-gray-400 flex items-center justify-between text-sm">
            <div>
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="flex items-center">
              <div
                className="mr-2"
                onClick={() => {
                  onOrderChange(order === 'desc' ? 'asc' : 'desc');
                }}
              >
                {order === 'desc' ? <DownArrowLight /> : <UpArrowDeep />}
              </div>
              <div className="relative rounded text-gray-400 flex items-center border border-gray-400 w-36">
                <div
                  className="p-1 border-r border-gray-400 w-32"
                  onClick={() => {
                    setShowSelectModal(true);
                  }}
                >
                  <FormattedMessage
                    id={sortBy}
                    defaultMessage={
                      sortBy !== 'h24_volume' ? sortBy : '24h Volume'
                    }
                  />
                </div>
                <div
                  className="p-1"
                  onClick={() => {
                    setShowSelectModal(true);
                  }}
                >
                  <PolygonGrayDown />
                </div>
                {showSelectModal && (
                  <SelectModal
                    setShowModal={setShowSelectModal}
                    className="top-10"
                  />
                )}
              </div>
            </div>
          </header>
          <div className="border-b border-gray-700 "></div>
          <div className="max-h-96 overflow-y-auto">
            {pools.map((pool, i) => (
              <div className="w-full hover:bg-poolRowHover" key={i}>
                <MobilePoolRow pool={pool} sortBy={sortBy} />
              </div>
            ))}
          </div>
        </section>
      </Card>
    </div>
  );
}

function PoolRow({ pool, index }: { pool: Pool; index: number }) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const tokens = useTokens(pool.tokenIds);
  const morePoolIds = useMorePoolIds({ topPool: pool });

  const [showLinkArrow, setShowLinkArrow] = useState(false);

  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, [pool]);
  if (!tokens) return <Loading />;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const farmButton = () => {
    if (supportFarm)
      return (
        <div className="flex items-center">
          <div className="mx-2">
            <FarmStamp />
          </div>
          <FarmMiningIcon />
        </div>
      );
    return '';
  };

  return (
    <div className="grid grid-cols-12 py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-600">
      <div className="col-span-6 md:col-span-4 flex items-center">
        <div className="mr-6 w-2">{index}</div>
        <Link
          to={{
            pathname: `/pool/${pool.id}`,
            state: { tvl: pool.tvl, backToFarms: supportFarm },
          }}
          className="flex items-center"
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
          <div className="text-sm ml-7">
            {tokens[0].symbol + '-' + tokens[1].symbol}
          </div>
        </Link>

        {farmButton()}
      </div>
      <div className="col-span-1 py-1 md:hidden ">
        {calculateFeePercent(pool.fee)}%
      </div>
      <div className="col-span-2 sm:col-span-4 py-1">
        <FormattedMessage id="coming_soon" defaultMessage="Coming soon" />
      </div>
      <div className="col-span-2 py-1">
        ${toInternationalCurrencySystem(pool.tvl.toString())}
      </div>
      <Link
        className="col-span-1 py-1 hover:text-green-500 hover:cursor-pointer"
        onMouseEnter={() => setShowLinkArrow(true)}
        onMouseLeave={() => setShowLinkArrow(false)}
        to={{
          pathname: `/more_pools/${pool.tokenIds}`,
          state: {
            morePoolIds: morePoolIds?.filter((id) => +id !== pool.id),
            tokens,
          },
        }}
      >
        {morePoolIds?.length ? `${morePoolIds?.length - 1} +` : '-'}
        {showLinkArrow && ' >'}
      </Link>
    </div>
  );
}

function LiquidityPage_({
  pools,
  sortBy,
  tokenName,
  order,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
  allPools,
}: {
  pools: Pool[];
  sortBy: string;
  tokenName: string;
  order: string;
  allPools: PoolDb[];
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  return (
    <div className="flex items-center flex-col whitespace-nowrap w-4/6 lg:w-5/6 xl:w-3/4 md:hidden m-auto xs:hidden">
      <Card className="hidden w-full mb-4" bgcolor="bg-cardBg">
        <div className="pb-6 mx-8">
          <div className="text-white text-2xl ">
            <FormattedMessage
              id="liquidity_pools"
              defaultMessage="Liquidity Pools"
            />
          </div>
        </div>
        <div className="mx-8 flex items-center">
          <div className="text-gray-400 text-sm">
            <FormattedMessage id="my_watchlist" defaultMessage="My watchlist" />
          </div>
          <FaRegQuestionCircle
            data-type="dark"
            data-place="bottom"
            data-multiline={true}
            data-tip={intl.formatMessage({ id: 'my_watchlist' })}
            className="inline-block	ml-2 text-sm  text-gray-500"
          />
          <ReactTooltip className="text-sm" />
        </div>
      </Card>
      <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
        <div className="flex mx-8 justify-between pb-4">
          <div>
            <div className="text-white text-lg">
              <FormattedMessage id="top_pools" defaultMessage="Top Pools" />
            </div>

            <div className="flex items-center">
              <div className="text-gray-400 text-sm">
                {(pools?.length ? pools?.length : '-') +
                  ' of ' +
                  (allPools?.length ? allPools?.length : '-')}
              </div>

              <FaRegQuestionCircle
                data-type="dark"
                data-place="bottom"
                data-multiline={true}
                data-tip={intl.formatMessage({ id: 'topPoolsCopy' })}
                className="inline-block	ml-2 text-sm  text-gray-500"
              />
              <ReactTooltip className="text-sm" />
            </div>
          </div>
          <div className="flex items-center w-3/7">
            <div className="flex items-center">
              <div className="text-gray-400 text-sm mr-10">
                <FormattedMessage
                  id="hide_low_tvl_pools"
                  defaultMessage="Hide low TVL pools"
                />
              </div>
            </div>

            <div
              className="rounded w-full my-2 text-gray-400 flex items-center pr-2"
              style={{
                backgroundColor: ' rgba(0, 0, 0, 0.2)',
              }}
            >
              <input
                className={`text-sm outline-none rounded w-full py-2 px-3`}
                placeholder={intl.formatMessage({ id: 'search_pools' })}
                value={tokenName}
                onChange={(evt) => onSearch(evt.target.value)}
              />
              <FaSearch />
            </div>
          </div>
        </div>

        <section className="px-2">
          <header className="grid grid-cols-12 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-600">
            <div className="col-span-6 md:col-span-4 flex">
              <div className="mr-6 w-2">#</div>
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div
              className="col-span-1 md:hidden cursor-pointer flex items-center"
              onClick={() => {
                onSortChange('fee');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
              {sortBy === 'fee' && order === 'desc' ? (
                <DownArrowLight />
              ) : (
                <UpArrowDeep />
              )}
            </div>
            <div
              className="col-span-2 flex items-center"
              onClick={() => {
                onSortChange('h24_volume');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <div className="mr-1">
                <FormattedMessage id="h24_volume" defaultMessage="24h Volume" />
              </div>
              {sortBy === 'h24_volume' && order === 'desc' ? (
                <DownArrowLight />
              ) : (
                <UpArrowDeep />
              )}
            </div>

            <div
              className="col-span-2 flex items-center cursor-pointer"
              onClick={() => {
                onSortChange('tvl');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <span className="mr-1">
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
              {sortBy === 'tvl' && order === 'desc' ? (
                <DownArrowLight />
              ) : (
                <UpArrowDeep />
              )}
            </div>
            <p className="col-span-1">
              <FormattedMessage id="more_pools" defaultMessage="More Pools" />
            </p>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {pools.map((pool, i) => (
              <div className="w-full hover:bg-poolRowHover" key={i}>
                <PoolRow pool={pool} index={i + 1} />
              </div>
            ))}
          </div>
        </section>
        {hasMore && (
          <div className="flex items-center justify-center pt-5">
            <button
              className="rounded-full text-xs text-white px-5 py-2.5 focus:outline-none  bg-greenLight"
              onClick={nextPage}
            >
              More
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

export function LiquidityPage() {
  const [tokenName, setTokenName] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');

  const { pools, hasMore, nextPage } = usePools({
    tokenName,
    sortBy,
    order,
  });

  const AllPools = useAllPools();

  if (!pools) return <Loading />;

  return (
    <>
      <LiquidityPage_
        tokenName={tokenName}
        pools={pools}
        order={order}
        sortBy={sortBy}
        allPools={AllPools}
        onOrderChange={setOrder}
        onSortChange={setSortBy}
        onSearch={setTokenName}
        hasMore={hasMore}
        nextPage={nextPage}
      />
      <MobileLiquidityPage
        tokenName={tokenName}
        pools={pools}
        allPools={AllPools}
        order={order}
        sortBy={sortBy}
        onOrderChange={setOrder}
        onSortChange={setSortBy}
        onSearch={setTokenName}
        hasMore={hasMore}
        nextPage={nextPage}
      />
    </>
  );
}
