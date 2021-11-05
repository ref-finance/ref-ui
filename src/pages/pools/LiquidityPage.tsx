import React, { useState, useEffect, useRef } from 'react';
import { FaRegQuestionCircle, FaSearch } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { find } from 'lodash';
import { SelectModal } from '~components/layout/SelectModal';
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
import {
  DownArrowLight,
  DownArrowLightMobile,
  UpArrowDeep,
  UpArrowLight,
} from '~components/icon';
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

function MobilePoolRow({
  pool,
  sortBy,
  watched,
}: {
  pool: Pool;
  sortBy: string;
  watched: Boolean;
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
      onClick={() => localStorage.setItem('fromMorePools', 'n')}
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
          {watched && (
            <div className="ml-2">
              <WatchListStartFull />
            </div>
          )}

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
        <div className="">
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

function MobileWatchListCard({ watchPools }: { watchPools: Pool[] }) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>(false);
  const [sortBy, onSortChange] = useState<string>('tvl');

  return (
    <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4 mb-4">
      <div className="mx-4 flex items-center justify-between mt-4">
        <div className="flex items-center">
          <div
            className={`text-${
              watchPools?.length > 0 ? 'white' : 'gray-400'
            }  text-base`}
          >
            <FormattedMessage id="my_watchlist" defaultMessage="My Watchlist" />
            {watchPools.length > 0 ? ` (${watchPools.length})` : ''}
          </div>
          <div>
            <FaRegQuestionCircle
              data-type="dark"
              data-place="right"
              data-multiline={true}
              data-tip={intl.formatMessage({ id: 'my_watchlist_copy' })}
              className="inline-block ml-2 text-xs text-primaryText"
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
      </div>
      <section className="w-full">
        <header className="p-4 text-gray-400 flex items-center justify-between text-sm">
          <div>
            <FormattedMessage id="pair" defaultMessage="Pair" />
          </div>
          <div className="flex items-center">
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
                  onSortChange={onSortChange}
                  setShowModal={setShowSelectModal}
                  className="top-10"
                />
              )}
            </div>
          </div>
        </header>
        <div className="border-b border-gray-700 "></div>
        <div className="max-h-96 overflow-y-auto">
          {watchPools?.map((pool, i) => (
            <div className="w-full hover:bg-poolRowHover" key={i}>
              <MobilePoolRow
                sortBy={sortBy}
                pool={pool}
                watched={!!find(watchPools, { id: pool.id })}
              />
            </div>
          ))}
        </div>
      </section>
    </Card>
  );
}

function MobileLiquidityPage({
  pools,
  tokenName,
  order,
  watchPools,
  hasMore,
  onSearch,
  onSortChange,
  onOrderChange,
  nextPage,
  sortBy,
  onHide,
  hideLowTVL,
  allPools,
  searchTrigger,
  setSearchTrigger,
}: {
  pools: Pool[];
  searchTrigger: Boolean;
  onSortChange: (modeSort: string) => void;
  setSearchTrigger: (mode: Boolean) => void;
  tokenName: string;
  order: string;
  watchPools: Pool[];
  sortBy: string;
  hideLowTVL: Boolean;
  hasMore: boolean;
  allPools: number;
  onHide: (mode: Boolean) => void;
  onSearch: (name: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>();
  const [searchValue, setSearchValue] = useState<string>(tokenName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (searchTrigger === false || searchTrigger === true)
      inputRef.current.focus();
  }, [searchTrigger]);

  return (
    <div className="flex flex-col w-3/6 md:w-11/12 lg:w-5/6 xs:w-11/12 m-auto md:show lg:hidden xl:hidden xs:show">
      <div className="mx-4 mb-6 mt-3">
        <div className="text-white text-xl">
          <FormattedMessage
            id="liquidity_pools"
            defaultMessage="Liquidity Pools"
          />
        </div>
      </div>
      <MobileWatchListCard watchPools={watchPools} />

      <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4">
        <div className="mx-4 flex items-center justify-between my-4">
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
                className="inline-block ml-2 text-xs text-primaryText"
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
              ' out of ' +
              (allPools ? allPools : '-')}
          </div>
        </div>
        <div className="rounded my-2 text-gray-400 flex items-center pr-2 mx-6 mb-5 bg-inputDarkBg">
          <input
            ref={inputRef}
            className={`text-sm outline-none rounded w-full py-2 px-3`}
            placeholder={intl.formatMessage({
              id: 'click_search_bar_to_search',
            })}
            value={searchValue}
            onChange={(evt) => {
              setSearchValue(evt.target.value);
            }}
            onKeyUp={(evt) => {
              if (evt.keyCode === 13) {
                onSearch(searchValue);
                setSearchTrigger(!searchTrigger);
              }
            }}
          />
          <FaSearch
            className="cursor-pointer"
            onClick={() => {
              onSearch(searchValue);
              setSearchTrigger(!searchTrigger);
            }}
          />
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
                {order === 'desc' ? <DownArrowLightMobile /> : <UpArrowDeep />}
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
                    onSortChange={onSortChange}
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
                  watched={!!find(watchPools, { id: pool.id })}
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
      onClick={() => localStorage.setItem('fromMorePools', 'n')}
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

function WatchListCard({ watchPools }: { watchPools: Pool[] }) {
  const intl = useIntl();
  return (
    <>
      <Card className=" w-full mb-2" padding="p-0 py-6" bgcolor="bg-cardBg">
        <div className="mx-8 flex items-center">
          <div
            className={`text-${
              watchPools?.length > 0 ? 'white' : 'gray-400'
            } text-lg`}
          >
            <FormattedMessage id="my_watchlist" defaultMessage="My Watchlist" />
          </div>
          <FaRegQuestionCircle
            data-type="dark"
            data-place="right"
            data-multiline={true}
            data-tip={intl.formatMessage({ id: 'my_watchlist_copy' })}
            className="inline-block ml-2 text-sm  text-gray-500"
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
        <section className="">
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
              <div
                className="w-full hover:bg-poolRowHover hover:bg-opacity-20"
                key={i}
              >
                <PoolRow pool={pool} index={i + 1} />
              </div>
            ))}
          </div>
        </section>
      </Card>
    </>
  );
}

function LiquidityPage_({
  pools,
  sortBy,
  tokenName,
  order,
  hasMore,
  watchPools,
  onSearch,
  onHide,
  hideLowTVL,
  onSortChange,
  onOrderChange,
  searchTrigger,
  setSearchTrigger,
  nextPage,
  allPools,
}: {
  pools: Pool[];
  sortBy: string;
  hideLowTVL: Boolean;
  watchPools: Pool[];
  tokenName: string;
  order: string;
  searchTrigger: Boolean;
  setSearchTrigger: (mode: Boolean) => void;
  onHide: (mode: Boolean) => void;
  allPools: number;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
}) {
  const intl = useIntl();
  const [searchValue, setSearchValue] = useState<string>(tokenName);
  const inputRef = useRef(null);
  useEffect(() => {
    if (searchTrigger === false || searchTrigger === true)
      inputRef.current?.focus();
  }, [searchTrigger]);
  return (
    <div className="flex flex-col whitespace-nowrap w-4/6 lg:w-5/6 xl:w-3/4 md:hidden m-auto xs:hidden">
      <div className="mb-4 mx-8">
        <div className="text-white text-xl">
          <FormattedMessage
            id="liquidity_pools"
            defaultMessage="Liquidity Pools"
          />
        </div>
      </div>
      <WatchListCard watchPools={watchPools} />

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
                className="inline-block ml-2 text-sm  text-primaryText"
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
                ref={inputRef}
                className={`text-sm outline-none rounded w-full py-2 px-3`}
                placeholder={intl.formatMessage({
                  id: 'press_enter_to_search',
                })}
                value={searchValue}
                onChange={(evt) => {
                  setSearchValue(evt.target.value);
                }}
                onKeyUp={(evt) => {
                  if (evt.keyCode === 13) {
                    onSearch(searchValue);
                    setSearchTrigger(!searchTrigger);
                  }
                }}
              />
              <FaSearch
                className="cursor-pointer"
                onClick={() => {
                  onSearch(searchValue);
                  setSearchTrigger(!searchTrigger);
                }}
              />
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
              {sortBy === 'fee' ? (
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
              className="col-span-2 flex items-center"
              onClick={() => {
                onSortChange('h24_volume');
                onOrderChange(order === 'desc' ? 'asc' : 'desc');
              }}
            >
              <div className="mr-1">
                <FormattedMessage id="h24_volume" defaultMessage="24h Volume" />
              </div>
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
            <p className="col-span-1">
              <FormattedMessage id="pools" defaultMessage="Pools" />
            </p>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {pools?.map((pool, i) => (
              <div
                className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20"
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
  const watchPools = useWatchPools();
  const [searchTrigger, setSearchTrigger] = useState<Boolean>(null);
  const [hideLowTVL, setHideLowTVL] = useState<Boolean>(false);
  const [displayPools, setDisplayPools] = useState<Pool[]>();
  const { pools, hasMore, nextPage, loading } = usePools({
    searchTrigger,
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

  if (!displayPools || loading || !watchPools) return <Loading />;

  return (
    <>
      <LiquidityPage_
        tokenName={tokenName}
        searchTrigger={searchTrigger}
        setSearchTrigger={setSearchTrigger}
        pools={displayPools}
        onHide={(isHide) => {
          localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
          setHideLowTVL(isHide);
        }}
        hideLowTVL={hideLowTVL}
        watchPools={watchPools}
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
        searchTrigger={searchTrigger}
        setSearchTrigger={setSearchTrigger}
        hideLowTVL={hideLowTVL}
        tokenName={tokenName}
        pools={displayPools}
        watchPools={watchPools}
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
