import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { FaRegQuestionCircle, FaSearch } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';

import {
  classificationOfCoins_key,
  classificationOfCoins,
} from '~services/farm';
import { ArrowDown, ArrowDownLarge } from '~components/icon';
import { useHistory } from 'react-router';
import { Card } from '~components/card/Card';
import { find, values } from 'lodash';
import { SelectModal } from '~components/layout/SelectModal';
import {
  useAllPools,
  usePools,
  useMorePoolIds,
  useAllWatchList,
  useWatchPools,
} from '../../state/pool';
import Loading from '~components/layout/Loading';
import { useTokens, usePoolTokens } from '../../state/token';
import { Link } from 'react-router-dom';
import { canFarm, Pool, isNotStablePool } from '../../services/pool';
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
import { SolidButton, FarmButton } from '~components/button/Button';
import { wallet } from '~services/near';
import {
  WatchListStartEmpty,
  WatchListStartFull,
} from '~components/icon/WatchListStar';
import { PolygonGrayDown } from '~components/icon/Polygon';
import _, { orderBy, sortBy, filter } from 'lodash';
import QuestionMark from '~components/farm/QuestionMark';
import { useInView } from 'react-intersection-observer';
import { QuestionTip } from '~components/layout/TipWrapper';
import { FilterIcon } from '../../components/icon/PoolFilter';
import { TokenMetadata } from '../../services/ft-contract';
import { scientificNotationToString } from '../../utils/numbers';
import { useMobile, useClientMobile } from '../../utils/device';
import { usePoolsMorePoolIds } from '../../state/pool';

const HIDE_LOW_TVL = 'REF_FI_HIDE_LOW_TVL';

function SelectUi({
  onChange,
  list,
  curvalue,
  shrink,
  className,
}: {
  onChange: (e: any) => void;
  list: any;
  curvalue: string;
  shrink?: string;
  className?: string;
}) {
  const [showSelectBox, setShowSelectBox] = useState(false);
  const switchSelectBoxStatus = () => {
    setShowSelectBox(!showSelectBox);
  };
  const hideSelectBox = () => {
    setShowSelectBox(false);
  };
  return (
    <div
      className={`relative flex ${
        shrink ? 'items-end' : 'items-center '
      } lg:mr-5 outline-none`}
    >
      <span className="lg:hidden mr-2">
        <FilterIcon onShow={showSelectBox} />
      </span>
      <span className="text-farmText text-xs mr-2.5 xs:hidden md:hidden">
        <FormattedMessage id="filter_by" defaultMessage="Filter by" />
      </span>

      <span
        onClick={switchSelectBoxStatus}
        tabIndex={-1}
        onBlur={hideSelectBox}
        className={`flex items-center justify-between w-40 h-5 rounded-full px-2 box-border border cursor-pointer text-xs outline-none ${
          shrink ? 'xs:w-8 md:w-8' : ''
        } ${
          showSelectBox
            ? 'border-greenColor text-white'
            : 'border-farmText text-farmText'
        }`}
      >
        <label
          className={`whitespace-nowrap ${shrink ? 'xs:hidden md:hidden' : ''}`}
        >
          {curvalue ? list[curvalue] : null}
        </label>
        <ArrowDownLarge />
      </span>
      <div
        className={`absolute z-50 top-8 right-0 border border-farmText bg-cardBg rounded-md ${
          shrink ? 'w-32' : 'w-40'
        } ${showSelectBox ? '' : 'hidden'}`}
      >
        {Object.entries(list).map((item: any, index) => (
          <p
            key={item[0] + item[1]}
            onMouseDown={() => {
              onChange(item[0]);
            }}
            className={`flex items-center p-4 text-xs h-5 text-white text-opacity-40 my-2 cursor-pointer hover:bg-white hover:bg-opacity-10 hover:text-opacity-100
            ${
              item[0] == curvalue
                ? 'bg-white bg-opacity-10 text-opacity-100'
                : ''
            }
            `}
          >
            {item[1]}
          </p>
        ))}
      </div>
    </div>
  );
}

function MobilePoolRow({
  pool,
  sortBy,
  watched,
  selectCoinClass,
  tokens,
  morePoolIds,
}: {
  pool: Pool;
  sortBy: string;
  watched: Boolean;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
}) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const { ref, inView } = useInView();

  const curRowTokens = useTokens(pool.tokenIds, tokens);

  const history = useHistory();
  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(!!canFarm);
    });
  }, [pool]);

  if (!curRowTokens) return <></>;

  tokens = curRowTokens;

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
    <div className="w-full hover:bg-poolRowHover">
      <Link
        ref={ref}
        className="flex flex-col border-b border-gray-700 border-opacity-70 bg-cardBg w-full px-4 py-6 text-white"
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

            {morePoolIds?.length && morePoolIds?.length > 1 ? (
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
            ) : null}
          </div>
          <div>{showSortedValue({ sortBy, value: pool[sortBy] })}</div>
        </div>
      </Link>
    </div>
  );
}

function MobileWatchListCard({
  watchPools,
  poolTokenMetas,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>(false);
  const [sortBy, onSortChange] = useState<string>('tvl');
  const poolsMorePoolsIds = usePoolsMorePoolIds({ pools: watchPools });

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
          {/* my_watchlist_copy */}
          <QuestionTip id="my_watchlist_copy" />
        </div>
      </div>
      <section className="w-full">
        <header className="p-4 text-gray-400 flex items-center justify-between text-sm">
          <div>
            <FormattedMessage id="pair" defaultMessage="Pair" />
          </div>
          <div className="flex items-center">
            <div
              className={`relative rounded-full flex items-center border    ${
                showSelectModal
                  ? 'border-greenColor text-white'
                  : 'border-farmText text-farmText'
              } w-32`}
            >
              <span
                className={`px-3 w-full text-xs h-5
                    flex items-center justify-between
                  `}
                onClick={() => {
                  setShowSelectModal(true);
                }}
              >
                <label>
                  <FormattedMessage id={sortBy} defaultMessage={sortBy} />
                </label>
                <ArrowDownLarge />
              </span>

              {showSelectModal && (
                <SelectModal
                  onSortChange={onSortChange}
                  setShowModal={setShowSelectModal}
                  className="top-8"
                  sortMode={sortBy}
                />
              )}
            </div>
          </div>
        </header>
        <div className="border-b border-gray-700 border-opacity-70" />
        <div className="max-h-96 overflow-y-auto">
          {watchPools?.map((pool, i) => (
            <div className="w-full hover:bg-poolRowHover" key={i}>
              <MobilePoolRow
                tokens={poolTokenMetas[pool.id]}
                sortBy={sortBy}
                pool={pool}
                watched={!!find(watchPools, { id: pool.id })}
                morePoolIds={poolsMorePoolsIds[pool.id]}
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
  poolTokenMetas,
  poolsMorePoolsIds,
}: {
  pools: Pool[];
  poolTokenMetas: any;
  onSortChange: (modeSort: string) => void;
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
  poolsMorePoolsIds: Record<string, string[]>;
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>();
  const inputRef = useRef(null);
  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;

    return poolTokenMetas[p.id].some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };

  return (
    <div className="flex flex-col w-3/6 md:w-11/12 lg:w-5/6 xs:w-11/12 m-auto md:flex lg:hidden xl:hidden xs:flex">
      <div className="mx-4 mb-6 mt-3">
        <div className="text-white text-xl">
          <FormattedMessage
            id="liquidity_pools"
            defaultMessage="Liquidity Pools"
          />
        </div>
      </div>
      <MobileWatchListCard
        poolTokenMetas={poolTokenMetas}
        watchPools={watchPools}
      />

      <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4">
        <div className="mx-4 flex items-center justify-between my-4">
          <div className="flex items-center">
            <div className="text-white text-base">Top Pools</div>
            <QuestionTip id="topPoolsCopy" />
          </div>

          <div className="text-gray-400 text-xs">
            {(pools?.length ? pools?.filter(poolFilterFunc).length : '-') +
              ' out of ' +
              (allPools ? allPools : '-')}
          </div>
        </div>
        <div className="rounded my-2 text-gray-400 flex items-center pr-2 mx-6 mb-5 bg-inputDarkBg">
          <input
            ref={inputRef}
            className={`text-sm outline-none rounded w-full py-2 px-3`}
            placeholder={intl.formatMessage({
              id: 'token',
            })}
            value={tokenName}
            onChange={(evt) => {
              onSearch(evt.target.value);
            }}
          />
        </div>

        <div className="flex items-center justify-between mx-4 mb-2">
          <div
            className=" inline-flex items-center cursor-pointer"
            onClick={() => {
              hideLowTVL && onHide(false);
              !hideLowTVL && onHide(true);
            }}
          >
            <div className="mr-2">
              {hideLowTVL ? <CheckedTick /> : <CheckedEmpty />}
            </div>
            <div className="text-gray-400 text-sm">
              <FormattedMessage
                id="hide_low_tvl_pools"
                defaultMessage="Hide low TVL pools"
              />
            </div>
          </div>

          <SelectUi
            list={filterList}
            onChange={setSelectCoinClass}
            curvalue={selectCoinClass}
          />
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
              <div
                className={`relative rounded-full flex items-center border    ${
                  showSelectModal
                    ? 'border-greenColor text-white'
                    : 'border-farmText text-farmText'
                } w-32`}
              >
                <span
                  className={`px-3 w-full text-xs h-5
                    flex items-center justify-between
                  `}
                  onClick={() => {
                    setShowSelectModal(true);
                  }}
                >
                  <label>
                    <FormattedMessage id={sortBy} defaultMessage={sortBy} />
                  </label>
                  <ArrowDownLarge />
                </span>

                {showSelectModal && (
                  <SelectModal
                    sortMode={sortBy}
                    onSortChange={onSortChange}
                    setShowModal={setShowSelectModal}
                    className="top-8"
                  />
                )}
              </div>
            </div>
          </header>
          <div className="border-b border-gray-700 border-opacity-70" />
          <div className="max-h-96 overflow-y-auto pool-list-container-mobile">
            {pools?.filter(poolFilterFunc).map((pool, i) => (
              <MobilePoolRow
                selectCoinClass={selectCoinClass}
                tokens={poolTokenMetas[pool.id]}
                pool={pool}
                sortBy={sortBy}
                watched={!!find(watchPools, { id: pool.id })}
                key={i}
                morePoolIds={poolsMorePoolsIds[pool.id]}
              />
            ))}
          </div>
        </section>
      </Card>
    </div>
  );
}

function PoolRow({
  pool,
  index,
  selectCoinClass,
  tokens,
  morePoolIds,
}: {
  pool: Pool;
  index: number;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
}) {
  const [supportFarm, setSupportFarm] = useState<Boolean>(false);
  const [farmCount, setFarmCount] = useState<Number>(1);

  const curRowTokens = useTokens(pool.tokenIds, tokens);
  const history = useHistory();
  const [showLinkArrow, setShowLinkArrow] = useState(false);

  useEffect(() => {
    canFarm(pool.id).then((canFarm) => {
      setSupportFarm(!!canFarm);
      setFarmCount(canFarm);
    });
  }, [pool]);

  if (!curRowTokens) return <></>;

  tokens = curRowTokens;

  tokens.sort((a, b) => {
    if (a.symbol === 'wNEAR') return 1;
    if (b.symbol === 'wNEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });

  return (
    <div className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
      <Link
        className="grid grid-cols-8 py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80"
        onClick={() => localStorage.setItem('fromMorePools', 'n')}
        to={{
          pathname: `/pool/${pool.id}`,
          state: { tvl: pool.tvl, backToFarms: supportFarm },
        }}
      >
        <div className="col-span-5 md:col-span-4 flex items-center">
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

          {supportFarm && <FarmButton farmCount={farmCount} />}
        </div>
        <div className="col-span-1 py-1 md:hidden ">
          {calculateFeePercent(pool.fee)}%
        </div>

        <div
          className="col-span-1 py-1"
          title={toPrecision(
            scientificNotationToString(pool.tvl.toString()),
            0
          )}
        >
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
    </div>
  );
}

function WatchListCard({
  watchPools,
  poolTokenMetas,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
}) {
  const poolsMorePoolsIds = usePoolsMorePoolIds({ pools: watchPools });

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
          <QuestionTip id="my_watchlist_copy" />
        </div>
        <section className="">
          <header className="grid grid-cols-8 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
            <div className="col-span-5 md:col-span-4 flex">
              <div className="mr-6 w-2">#</div>
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="col-span-1 md:hidden flex items-center">
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
            </div>

            <div className="col-span-1 flex items-center">
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
                <PoolRow
                  pool={pool}
                  index={i + 1}
                  tokens={poolTokenMetas[pool.id]}
                  morePoolIds={poolsMorePoolsIds[pool.id]}
                />
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
  nextPage,
  allPools,
  poolTokenMetas,
  poolsMorePoolsIds,
}: {
  pools: Pool[];
  poolTokenMetas: any;
  sortBy: string;
  hideLowTVL: Boolean;
  watchPools: Pool[];
  tokenName: string;
  order: string;
  onHide: (mode: Boolean) => void;
  allPools: number;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
  poolsMorePoolsIds: Record<string, string[]>;
}) {
  const intl = useIntl();
  const inputRef = useRef(null);
  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;

    return poolTokenMetas[p.id].some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };

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
      <WatchListCard poolTokenMetas={poolTokenMetas} watchPools={watchPools} />

      <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
        <div className="flex mx-8 justify-between pb-4">
          <div>
            <div className="text-white text-lg">
              {/* <FormattedMessage id="top_pools" defaultMessage="Top Pools" /> */}
              Top Pools
            </div>

            <div className="flex items-center">
              <div className="text-gray-400 text-sm">
                {(pools?.length ? pools?.filter(poolFilterFunc).length : '-') +
                  ' out of ' +
                  (allPools ? allPools : '-')}
              </div>
              <QuestionTip id="topPoolsCopy" />
            </div>
          </div>
          <div className="flex items-center w-3/7">
            <div className="flex items-center">
              <SelectUi
                list={filterList}
                onChange={setSelectCoinClass}
                curvalue={selectCoinClass}
              />
            </div>

            <div
              className="flex items-center mr-5 cursor-pointer"
              onClick={() => {
                hideLowTVL && onHide(false);
                !hideLowTVL && onHide(true);
              }}
            >
              <div className="mr-2">
                {hideLowTVL ? <CheckedTick /> : <CheckedEmpty />}
              </div>
              <div className="text-gray-400 text-sm ">
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
                  id: 'token',
                })}
                onChange={(evt) => {
                  onSearch(evt.target.value);
                }}
              />
            </div>
          </div>
        </div>

        <section className="">
          <header className="grid grid-cols-8 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
            <div className="col-span-5 md:col-span-4 flex">
              <div className="mr-6 w-2">#</div>
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="col-span-1 md:hidden flex items-center">
              <div
                className="pr-1 cursor-pointer"
                onClick={() => {
                  onSortChange('fee');
                  sortBy !== 'fee' && onOrderChange('asc');
                  sortBy === 'fee' &&
                    onOrderChange(order === 'desc' ? 'asc' : 'desc');
                }}
              >
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
              <span
                className="cursor-pointer"
                onClick={() => {
                  onSortChange('fee');
                  sortBy !== 'fee' && onOrderChange('asc');
                  sortBy === 'fee' &&
                    onOrderChange(order === 'desc' ? 'asc' : 'desc');
                }}
              >
                {sortBy === 'fee' ? (
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

            <div className="col-span-1 flex items-center">
              <span
                className="pr-1 cursor-pointer"
                onClick={() => {
                  onSortChange('tvl');
                  sortBy !== 'tvl' && onOrderChange('asc');
                  sortBy === 'tvl' &&
                    onOrderChange(order === 'desc' ? 'asc' : 'desc');
                }}
              >
                <FormattedMessage id="tvl" defaultMessage="TVL" />
              </span>
              <span
                className="cursor-pointer"
                onClick={() => {
                  onSortChange('tvl');
                  sortBy !== 'tvl' && onOrderChange('asc');
                  sortBy === 'tvl' &&
                    onOrderChange(order === 'desc' ? 'asc' : 'desc');
                }}
              >
                {sortBy === 'tvl' ? (
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
            <p className="col-span-1">
              <FormattedMessage id="pools" defaultMessage="Pools" />
            </p>
          </header>

          <div className="max-h-96 overflow-y-auto  pool-list-container-pc">
            {pools?.filter(poolFilterFunc).map((pool, i) => (
              <PoolRow
                tokens={poolTokenMetas[pool.id]}
                key={i}
                pool={pool}
                index={i + 1}
                selectCoinClass={selectCoinClass}
                morePoolIds={poolsMorePoolsIds[pool.id]}
              />
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
  const [hideLowTVL, setHideLowTVL] = useState<Boolean>(false);
  const [displayPools, setDisplayPools] = useState<Pool[]>();
  const { pools, hasMore, nextPage, loading } = usePools({
    tokenName,
    sortBy,
    order,
  });

  const clientMobileDevice = useClientMobile();

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
  const poolTokenMetas = usePoolTokens(pools);

  const onSearch = useCallback(
    _.debounce(setTokenName, clientMobileDevice ? 50 : 500),
    [clientMobileDevice]
  );

  const poolsMorePoolsIds = usePoolsMorePoolIds({ pools: displayPools });

  if (!displayPools || loading || !watchPools || !poolTokenMetas)
    return <Loading />;

  return (
    <>
      {!clientMobileDevice && (
        <LiquidityPage_
          poolTokenMetas={poolTokenMetas}
          tokenName={tokenName}
          pools={displayPools}
          poolsMorePoolsIds={poolsMorePoolsIds}
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
          onSearch={onSearch}
          hasMore={hasMore}
          nextPage={nextPage}
        />
      )}

      {clientMobileDevice && (
        <MobileLiquidityPage
          poolTokenMetas={poolTokenMetas}
          hideLowTVL={hideLowTVL}
          poolsMorePoolsIds={poolsMorePoolsIds}
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
          onSearch={onSearch}
          hasMore={hasMore}
          nextPage={nextPage}
        />
      )}
    </>
  );
}
