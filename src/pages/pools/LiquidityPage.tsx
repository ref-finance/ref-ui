import React, { useState, useEffect } from 'react';
import { FaRegQuestionCircle, FaSearch } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { find } from 'lodash';
import {
  useAllPools,
  usePools,
  useMorePoolIds,
  useAllWatchList,
  useWatchPools,
} from '../../state/pool';
import Loading from '~components/layout/Loading';
import { getExchangeRate, useTokens } from '../../state/token';
import { Link } from 'react-router-dom';
import { canFarm, Pool } from '../../services/pool';
import { FarmMiningIcon } from '~components/icon/FarmMining';
import { MULTI_MINING_POOLS, REF_FARM_CONTRACT_ID } from '~services/near';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { CheckedTick, CheckedEmpty } from '~components/icon/CheckBox';
import { toRealSymbol } from '~utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import { PoolDb, WatchList } from '~store/RefDatabase';
import { DownArrowLight, UpArrowDeep } from '~components/icon';
import { FarmStamp } from '~components/icon/FarmStamp';
import { SolidButton } from '~components/button/Button';
import { wallet } from '~services/near';
import {
  WatchListStartEmpty,
  WatchListStartFull,
} from '~components/icon/WatchListStar';
import { PolygonGrayDown } from '~components/icon/Polygon';
import _, { orderBy, sortBy, filter } from 'lodash';

const HIDE_LOW_TVL = 'REF_FI_HIDE_LOW_TVL';

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
        <SolidButton
          className="w-full"
          onClick={() => {
            wallet.requestSignIn(REF_FARM_CONTRACT_ID);
          }}
        >
          <FormattedMessage
            id="connect_to_near"
            defaultMessage="Connect To NEAR"
          />
        </SolidButton>
      </div>
    </Card>
  );
};

function MobilePoolRow({
  pool,
  sortBy,
}: // watched,
{
  pool: Pool;
  sortBy: string;
  // watched: Boolean;
}) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const morePoolIds = useMorePoolIds({ topPool: pool });
  const tokens = useTokens(pool.tokenIds);
  const history = useHistory();
  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, [pool]);

  // if (!tokens) return <Loading />;
  if (!tokens) return <></>;

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
        {count}
      </div>
    );
  };

  return (
    <Link
      className="flex flex-col border-b border-gray-700 bg-cardBg w-full px-4 py-6 text-white"
      to={{
        pathname: `/pool/${pool.id}`,
        state: { tvl: pool?.tvl, backToFarms: supportFarm },
      }}
    >
      <div className="flex items-center justify-between text-sm">
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
          <div className="text-sm ml-2 font-semibold">
            {tokens[0].symbol + '-' + tokens[1].symbol}
          </div>
          {/* {watched && (
            <div className="ml-2">
              <WatchListStartFull />
            </div>
          )} */}

          {morePoolIds?.length && morePoolIds?.length > 1 && (
            <div
              onClick={(e) => {
                e.preventDefault();
                history.push(`/more_pools/${pool.tokenIds}`, {
                  morePoolIds: morePoolIds,
                  tokens,
                });
              }}
              className="mx-2"
            >
              <MobileMoreFarmStamp count={morePoolIds?.length} />
            </div>
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
    </Link>
  );
}

function MobileLiquidityPage({
  pools,
  tokenName,
  order,
  // watchList,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
  sortBy,
  onHide,
  hideLowTVL,
  allPools,
}: {
  pools: Pool[];
  tokenName: string;
  order: string;
  // watchList: WatchList[];
  sortBy: string;
  hideLowTVL: Boolean;
  hasMore: boolean;
  allPools: number;
  onHide: (mode: Boolean) => void;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>();

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
          className="fixed top-0 left-0 w-screen h-screen opacity-0 z-0"
          onClick={() => {
            setShowModal(false);
          }}
        />
        <div
          className="py-2 px-2  w-full hover:bg-poolRowHover hover:text-white rounded-lg hover:opacity-80 z-30"
          onClick={() => {
            onSortChange('h24_volume');
            setShowModal(false);
          }}
        >
          <FormattedMessage id="h24_volume" defaultMessage="24h Volume" />
        </div>
        <div
          className="py-2 px-2 w-full hover:bg-poolRowHover hover:text-white rounded-lg hover:opacity-80 z-30"
          onClick={() => {
            onSortChange('tvl');
            setShowModal(false);
          }}
        >
          <FormattedMessage id="tvl" defaultMessage="TVL" />
        </div>
        <div
          className="py-2 px-2   w-full hover:bg-poolRowHover hover:text-white rounded-lg hover:opacity-80 z-30"
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
    <div className="flex flex-col w-3/6 md:w-11/12 lg:w-5/6 xs:w-11/12 m-auto md:show lg:hidden xl:hidden xs:show">
      <div className="mx-6 mb-6 mt-3">
        <div className="text-white text-xl">
          <FormattedMessage
            id="liquidity_pools"
            defaultMessage="Liquidity Pools"
          />
        </div>
      </div>
      <Card className="w-full mb-4" bgcolor="bg-cardBg" padding="p-0">
        <div className="mx-6 flex items-center justify-between my-4">
          <div className="flex items-center">
            <div className="text-white text-base">
              {/* <FormattedMessage id="top_pools" defaultMessage="Top Pools" /> */}
              Top Pools
            </div>
            <div>
              <FaRegQuestionCircle
                data-type="dark"
                data-place="right"
                data-multiline={true}
                data-tip={intl.formatMessage({ id: 'topPoolsCopy' })}
                className="inline-block	ml-2 text-xs text-primaryText"
              />
              <ReactTooltip
                className="text-xs shadow-4xl"
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
                class="tool-tip"
                textColor="#c6d1da"
              />
            </div>
          </div>

          <div className="text-gray-400 text-xs">
            {(pools?.length ? pools?.length : '-') +
              ' of ' +
              (allPools ? allPools : '-')}
          </div>
        </div>
        <div className="rounded my-2 text-gray-400 flex items-center pr-2 mx-6 mb-5 bg-inputDarkBg">
          <input
            className={`text-sm outline-none rounded w-full py-2 px-3`}
            placeholder={intl.formatMessage({ id: 'search_pools' })}
            value={tokenName}
            onChange={(evt) => onSearch(evt.target.value)}
          />
          <FaSearch />
        </div>
        <div className=" mb-4 flex items-center mx-6">
          <div className="mr-2">
            {hideLowTVL ? (
              <div onClick={() => onHide(false)}>
                <CheckedTick />
              </div>
            ) : (
              <div onClick={() => onHide(true)}>
                <CheckedEmpty />
              </div>
            )}
          </div>
          <div className="text-gray-400 text-sm mr-4">
            <FormattedMessage
              id="hide_low_tvl_pools"
              defaultMessage="Hide low TVL pools"
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
            {pools?.map((pool, i) => (
              <div className="w-full hover:bg-poolRowHover" key={i}>
                <MobilePoolRow
                  pool={pool}
                  sortBy={sortBy}
                  // watched={!!find(watchList, { pool_id: pool.id.toString() })}
                />
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
  const history = useHistory();
  const [showLinkArrow, setShowLinkArrow] = useState(false);

  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(canFarm);
    });
  }, [pool]);
  // if (!tokens) return <Loading />;
  if (!tokens) return <></>;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  const FarmButton = () => {
    return (
      <div className="flex items-center">
        <div className="mx-2">
          <FarmStamp />
        </div>
        <div>{MULTI_MINING_POOLS.includes(pool.id) && <FarmMiningIcon />}</div>
      </div>
    );
  };

  return (
    <Link
      className="grid grid-cols-12 py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-600 hover:opacity-80"
      to={{
        pathname: `/pool/${pool.id}`,
        state: { tvl: pool.tvl, backToFarms: supportFarm },
      }}
    >
      <div className="col-span-6 md:col-span-4 flex items-center">
        <div className="mr-6 w-2">{index}</div>
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-9 w-9 border border-gradientFromHover rounded-full mr-2">
              <img
                key={tokens[0].id.substring(0, 12).substring(0, 12)}
                className="rounded-full mr-2 w-full"
                src={tokens[0].icon}
              />
            </div>

            <div className="h-9 w-9 border border-gradientFromHover rounded-full">
              <img
                key={tokens[1].id}
                className="rounded-full mr-2 w-full"
                src={tokens[1].icon}
              />
            </div>
          </div>
          <div className="text-sm ml-7">
            {tokens[0].symbol + '-' + tokens[1].symbol}
          </div>
        </div>

        {supportFarm && <FarmButton />}
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

      <div
        className="col-span-1 py-1 hover:text-green-500 hover:cursor-pointer"
        onMouseEnter={() => setShowLinkArrow(true)}
        onMouseLeave={() => setShowLinkArrow(false)}
        onClick={(e) => {
          e.preventDefault();
          history.push(`/more_pools/${pool.tokenIds}`, {
            morePoolIds: morePoolIds,
            tokens,
          });
        }}
      >
        {morePoolIds?.length ? `${morePoolIds?.length}` : '-'}
        {showLinkArrow && ' >'}
      </div>
    </Link>
  );
}

function WatchListCard({ watchList }: { watchList: WatchList[] }) {
  const intl = useIntl();
  // const watchPools = useWatchPools({
  //   watchList,
  // });

  return (
    <>
      <div className="pb-6 mx-8">
        <div className="text-white text-2xl">
          <FormattedMessage
            id="liquidity_pools"
            defaultMessage="Liquidity Pools"
          />
        </div>
      </div>
      {/* <Card
        className=" w-full mb-4 hidden"
        padding="p-0 py-6"
        bgcolor="bg-cardBg"
      >
        <div className="mx-8 flex items-center">
          <div
            className={`text-${
              watchList?.length > 0 ? 'white' : 'gray-400'
            } text-lg`}
          >
            <FormattedMessage id="my_watchlist" defaultMessage="My watchlist" />
          </div>
          <FaRegQuestionCircle
            data-type="dark"
            data-place="bottom"
            data-multiline={true}
            data-tip={intl.formatMessage({ id: 'my_watchlist_copy' })}
            className="inline-block	ml-2 text-sm  text-gray-500"
          />
          <ReactTooltip className="text-sm" />
        </div>
        <section className="px-2">
          <header className="grid grid-cols-12 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-600">
            <div className="col-span-6 md:col-span-4 flex">
              <div className="mr-6 w-2">#</div>
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="col-span-1 md:hidden cursor-pointer flex items-center">
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
            </div>
            <div className="col-span-2 flex items-center">
              <div className="mr-1">
                <FormattedMessage id="h24_volume" defaultMessage="24h Volume" />
              </div>
            </div>

            <div className="col-span-2 flex items-center cursor-pointer">
              <span className="mr-1">
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
            </div>
            <p className="col-span-1">
              <FormattedMessage id="pools" defaultMessage="Pools" />
            </p>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {watchPools?.map((pool, i) => (
              <div className="w-full hover:bg-poolRowHover" key={i}>
                <PoolRow pool={pool} index={i + 1} />
              </div>
            ))}
          </div>
        </section>
      </Card> */}
    </>
  );
}

function LiquidityPage_({
  pools,
  sortBy,
  tokenName,
  order,
  hasMore,
  // watchList,
  onSearch,
  onHide,
  hideLowTVL,
  onSortChange,
  onOrderChange,
  nextPage,
  allPools,
}: {
  pools: Pool[];
  sortBy: string;
  hideLowTVL: Boolean;
  // watchList: WatchList[];
  tokenName: string;
  order: string;
  onHide: (mode: Boolean) => void;
  allPools: number;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  return (
    <div className="flex flex-col whitespace-nowrap w-4/6 lg:w-5/6 xl:w-3/4 md:hidden m-auto xs:hidden">
      {/* {<WatchListCard watchList={watchList} />} */}

      <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
        <div className="flex mx-8 justify-between pb-4">
          <div>
            <div className="text-white text-lg">
              {/* <FormattedMessage id="top_pools" defaultMessage="Top Pools" /> */}
              Top Pools
            </div>

            <div className="flex items-center">
              <div className="text-gray-400 text-sm">
                {(pools?.length ? pools?.length : '-') +
                  ' out of ' +
                  (allPools ? allPools : '-')}
              </div>

              <FaRegQuestionCircle
                data-type="dark"
                data-place="right"
                data-multiline={true}
                data-tip={intl.formatMessage({ id: 'topPoolsCopy' })}
                className="inline-block	ml-2 text-sm  text-primaryText"
              />
              <ReactTooltip
                className="text-xs shadow-4xl"
                backgroundColor="#1D2932"
                border
                borderColor="#7e8a93"
                effect="solid"
                class="tool-tip"
                textColor="#c6d1da"
              />
            </div>
          </div>
          <div className="flex items-center w-3/7">
            <div className="flex items-center">
              <div className="mr-2">
                {hideLowTVL ? (
                  <div onClick={() => onHide(false)}>
                    <CheckedTick />
                  </div>
                ) : (
                  <div onClick={() => onHide(true)}>
                    <CheckedEmpty />
                  </div>
                )}
              </div>
              <div className="text-gray-400 text-sm mr-10">
                <FormattedMessage
                  id="hide_low_tvl_pools"
                  defaultMessage="Hide low TVL pools"
                />
              </div>
            </div>
            <div className="rounded w-full my-2 text-gray-400 flex items-center pr-2 bg-inputDarkBg">
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

        <section className="">
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
              <FormattedMessage id="pools" defaultMessage="Pools" />
            </p>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {pools?.map((pool, i) => (
              <div
                className="w-full hover:bg-poolRowHover bg-blend-overlay"
                key={i}
              >
                <PoolRow pool={pool} index={i + 1} />
              </div>
            ))}
          </div>
        </section>
      </Card>
    </div>
  );
}

export function LiquidityPage() {
  const [tokenName, setTokenName] = useState('');
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const AllPools = useAllPools();
  // const watchList = useAllWatchList();
  const [hideLowTVL, setHideLowTVL] = useState<Boolean>(false);
  const [watchListTop, setWatchListTop] = useState<Boolean>(false);
  const [displayPools, setDisplayPools] = useState<Pool[]>();
  const { pools, hasMore, nextPage } = usePools({
    tokenName,
    sortBy,
    order,
  });

  useEffect(() => {
    let tempPools;

    setHideLowTVL(JSON.parse(localStorage.getItem(HIDE_LOW_TVL)) || false);

    if (hideLowTVL) {
      tempPools = _.filter(pools, (pool) => pool.tvl > 1000);
    } else {
      tempPools = pools;
    }
    setDisplayPools(tempPools);
  }, [pools, hideLowTVL]);

  // if (!displayPools || !watchList) return <Loading />;
  if (!displayPools || pools.length === 0) return <Loading />;

  return (
    <>
      <LiquidityPage_
        tokenName={tokenName}
        pools={displayPools}
        onHide={(isHide) => {
          localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
          setHideLowTVL(isHide);
        }}
        hideLowTVL={hideLowTVL}
        // watchList={watchList}
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
        hideLowTVL={hideLowTVL}
        tokenName={tokenName}
        pools={displayPools}
        // watchList={watchList}
        allPools={AllPools}
        order={order}
        sortBy={sortBy}
        onOrderChange={setOrder}
        onSortChange={setSortBy}
        onHide={(isHide) => {
          localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
          setHideLowTVL(isHide);
        }}
        onSearch={setTokenName}
        hasMore={hasMore}
        nextPage={nextPage}
      />
    </>
  );
}
