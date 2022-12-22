import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
  useContext,
} from 'react';
import { FaRegQuestionCircle, FaSearch } from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import InfiniteScroll from 'react-infinite-scroll-component';
import { ShareInFarm } from '../../components/layout/ShareInFarm';
import {
  classificationOfCoins_key,
  classificationOfCoins,
} from '../../services/farm';
import { ArrowDown, ArrowDownLarge } from '../../components/icon';
import { useHistory } from 'react-router';
import { Card } from '../../components/card/Card';
import { find, isNumber, runInContext, values } from 'lodash';
import { SelectModal } from '../../components/layout/SelectModal';
import {
  useAllPools,
  usePools,
  useMorePoolIds,
  useAllWatchList,
  useWatchPools,
  useV3VolumesPools,
} from '../../state/pool';
import Loading from '../../components/layout/Loading';
import {
  useTokens,
  usePoolTokens,
  useRainbowWhitelistTokens,
  useTokenBalances,
} from '../../state/token';
import { Link } from 'react-router-dom';
import { canFarm, Pool, isNotStablePool, canFarms } from '../../services/pool';
import {
  calculateFeePercent,
  toPrecision,
  toReadableNumber,
  toInternationalCurrencySystem,
} from '../../utils/numbers';
import { CheckedTick, CheckedEmpty } from '../../components/icon/CheckBox';
import { toRealSymbol } from '../../utils/token';
import { FormattedMessage, useIntl } from 'react-intl';
import {
  DownArrowLight,
  DownArrowLightMobile,
  UpArrowDeep,
  UpArrowLight,
} from '../../components/icon';
import { FarmStamp } from '../../components/icon/FarmStamp';
import {
  SolidButton,
  FarmButton,
  GradientButton,
} from '../../components/button/Button';
import { NEAR_CLASS_STABLE_POOL_IDS, wallet } from '../../services/near';
import {
  WatchListStartEmpty,
  WatchListStartFull,
} from '../../components/icon/WatchListStar';
import { PolygonGrayDown } from '../../components/icon/Polygon';
import _, { orderBy, sortBy, filter } from 'lodash';
import QuestionMark from '../../components/farm/QuestionMark';
import { useInView } from 'react-intersection-observer';
import { QuestionTip } from '../../components/layout/TipWrapper';
import { FilterIcon } from '../../components/icon/PoolFilter';
import { TokenMetadata, REF_META_DATA } from '../../services/ft-contract';
import {
  scientificNotationToString,
  percent,
  checkAllocations,
} from '../../utils/numbers';
import { useMobile, useClientMobile, isClientMobie } from '../../utils/device';
import {
  usePoolsMorePoolIds,
  useDayVolumesPools,
  useYourliquidity,
} from '../../state/pool';
import { PoolTabV3 } from '../../components/pool/PoolTabV3';
import { SearchIcon } from '../../components/icon/FarmBoost';
import {
  WalletContext,
  getCurrentWallet,
} from '../../utils/wallets-integration';
import { unwrapedNear, wnearMetadata } from '../../services/wrap-near';
import { Images, Symbols } from '../../components/stableswap/CommonComp';
import { getVEPoolId } from '../ReferendumPage';
import { StartPoolIcon } from '../../components/icon/WatchListStar';
import {
  PoolDaoBanner,
  PoolDaoBannerMobile,
  NEAR_TEXT,
  USD_TEXT,
} from '../../components/icon/Logo';
import { VEARROW } from '../../components/icon/Referendum';
import getConfig from '../../services/config';
import { AddPoolModal } from './AddPoolPage';
import { useWalletSelector } from '../../context/WalletSelectorContext';
import {
  checkAccountTip,
  getURLInfo,
} from '../../components/layout/transactionTipPopUp';
import { checkTransactionStatus } from '../../services/swap';
import { useCanFarmV2 } from '../../state/farm';
import { PoolData, useAllStablePoolData } from '../../state/sauce';
import { formatePoolData } from '../stable/StableSwapEntry';
import {
  USD_CLASS_STABLE_POOL_IDS,
  BTC_CLASS_STABLE_POOL_IDS,
} from '../../services/near';
import BigNumber from 'bignumber.js';
import Big from 'big.js';
import { Cell, Pie, PieChart, Sector } from 'recharts';
import { OutlineButton } from '../../components/button/Button';
import { BTC_TEXT } from '../../components/icon/Logo';
import { useAllPoolsV2 } from '../../state/swapV3';
import { PoolInfo } from '~services/swapV3';
import { SelectModalV2 } from '../../components/layout/SelectModal';
import { FarmStampNew } from '../../components/icon/FarmStamp';
import { ALL_STABLE_POOL_IDS } from '../../services/near';
import { WatchList } from '../../store/RefDatabase';
import { useAllFarms } from '../../state/farm';
import { REF_FI_CONTRACT_ID } from '../../services/near';
import { AiOutlineStar } from 'react-icons/ai';

import { AiFillStar } from 'react-icons/ai';
const HIDE_LOW_TVL = 'REF_FI_HIDE_LOW_TVL';

const REF_FI_FARM_ONLY = 'REF_FI_FARM_ONLY';

export function getPoolFeeApr(
  dayVolume: string,
  pool: Pool,
  tvlInput?: number
) {
  let result = '0';
  if (dayVolume) {
    const { fee, tvl } = pool;

    const newTvl = tvlInput || tvl;

    const revenu24h = (fee / 10000) * 0.8 * Number(dayVolume);
    if (newTvl > 0 && revenu24h > 0) {
      const annualisedFeesPrct = ((revenu24h * 365) / newTvl / 2) * 100;
      result = toPrecision(annualisedFeesPrct.toString(), 2);
    }
  }
  return Number(result);
}

export function getPoolFeeAprTitle(
  dayVolume: string,
  pool: Pool,
  tvlInput?: number
) {
  let result = '0';
  if (dayVolume) {
    const { fee, tvl } = pool;
    const newTvl = tvlInput || tvl;

    const revenu24h = (fee / 10000) * 0.8 * Number(dayVolume);
    if (newTvl > 0 && revenu24h > 0) {
      const annualisedFeesPrct = ((revenu24h * 365) / newTvl / 2) * 100;
      result = annualisedFeesPrct.toString();
    }
  }
  return Number(result);
}

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
      <span className="text-white text-sm mr-2.5 xs:hidden md:hidden">
        <FormattedMessage id="filter_by" defaultMessage="Filter by" />
      </span>

      <span
        onClick={switchSelectBoxStatus}
        tabIndex={-1}
        onBlur={hideSelectBox}
        className={`flex items-center justify-between min-w-24 h-5 rounded-full px-2 box-border border cursor-pointer text-xs outline-none ${
          shrink ? 'xs:w-8 md:w-8' : ''
        } ${
          showSelectBox
            ? 'border-greenColor text-white'
            : 'border-farmText text-farmText'
        }`}
      >
        <label
          className={`whitespace-nowrap lg:text-white ${
            shrink ? 'xs:hidden md:hidden' : ''
          }`}
        >
          {curvalue ? list[curvalue] : null}
        </label>
        <ArrowDownLarge />
      </span>
      <div
        className={`absolute z-50 top-8 right-0 border border-farmText bg-cardBg rounded-md min-w-24 ${
          showSelectBox ? '' : 'hidden'
        }`}
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
  supportFarm,
  h24volume,
  watchPool,
  mark,
}: {
  pool: Pool;
  sortBy: string;
  watched: Boolean;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
  supportFarm: Boolean;
  h24volume: string;
  watchPool?: boolean;
  mark?: boolean;
}) {
  const { ref } = useInView();

  const curRowTokens = useTokens(pool.tokenIds, tokens);

  const history = useHistory();

  if (!curRowTokens) return <></>;

  tokens = curRowTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return 0;
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
    else if (sortBy === 'volume_24h')
      return !h24volume
        ? '-'
        : Number(h24volume) == 0
        ? '$0'
        : Number(h24volume) < 0.01
        ? '$ <0.01'
        : `$${toInternationalCurrencySystem(h24volume)}`;
    else if (sortBy === 'apr') return `${getPoolFeeApr(h24volume, pool)}%`;
  };

  const MobileMoreFarmStamp = ({ count }: { count: number }) => {
    return (
      <div className="px-1 rounded border border-greenLight text-greenLight">
        {count}
      </div>
    );
  };

  return (
    <div className="w-full hover:bg-poolRowHover overflow-x-hidden">
      <Link
        ref={ref}
        className="flex flex-col border-b border-gray-700 border-opacity-70 bg-cardBg w-full px-2.5 py-6 text-white"
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

              <div className="h-6 w-6 border border-gradientFromHover rounded-full -ml-1.5">
                <img
                  key={tokens[1].id}
                  className="w-full rounded-full"
                  src={tokens[1].icon}
                />
              </div>
              {tokens[2] ? (
                <div className="h-6 w-6 border border-gradientFromHover rounded-full -ml-1.5">
                  <img
                    key={tokens[2].id}
                    className="w-full rounded-full"
                    src={tokens[2].icon}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex items-center flex-wrap">
              <div className="text-sm ml-2 font-semibold whitespace-nowrap mb-0.5">
                {tokens[0].symbol +
                  '-' +
                  tokens[1].symbol +
                  `${tokens[2] ? '-' + tokens[2].symbol : ''}`}
              </div>
              {mark ? (
                <span className="text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2 mb-0.5">
                  {ALL_STABLE_POOL_IDS.indexOf(pool.id.toString()) > -1 ? (
                    <FormattedMessage id="stablecoin"></FormattedMessage>
                  ) : (
                    'V1'
                  )}
                </span>
              ) : null}
            </div>
            {watched && !watchPool && (
              <div className="ml-2">
                <WatchListStartFull />
              </div>
            )}

            {morePoolIds?.length && morePoolIds?.length > 1 && !watchPool ? (
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

function MobilePoolRowV2({
  pool,
  sortBy,
  tokens,
  mark,
  watched,
  h24volume,
}: {
  pool: PoolInfo;
  sortBy: string;
  tokens?: TokenMetadata[];
  mark?: boolean;
  watched?: boolean;
  h24volume?: string;
}) {
  const { ref } = useInView();

  const curRowTokens = useTokens([pool.token_x, pool.token_y], tokens);

  const history = useHistory();

  if (!curRowTokens) return <></>;
  tokens = curRowTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
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
    else if (sortBy === 'fee') return `${calculateFeePercent(value / 100)}%`;
    else if (sortBy === 'volume_24h') {
      return geth24volume();
    } else return '/';
  };
  function goDetailV2() {
    const url_pool_id = pool.pool_id.replace(/\|/g, '@');
    history.push(`/poolV2/${url_pool_id}`);
  }
  function geth24volume() {
    const v = +(h24volume || '0');
    if (v == 0) {
      return '$0';
    } else if (v < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(v.toString(), 2);
    }
  }
  return (
    <div className="w-full hover:bg-poolRowHover" onClick={goDetailV2}>
      <div
        ref={ref}
        className="flex flex-col border-b border-gray-700 border-opacity-70 bg-cardBg w-full px-2.5 py-6 text-white"
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

              <div className="h-6 w-6 border border-gradientFromHover rounded-full -ml-1.5">
                <img
                  key={tokens[1].id}
                  className="w-full rounded-full"
                  src={tokens[1].icon}
                />
              </div>
              {tokens[2] ? (
                <div className="h-6 w-6 border border-gradientFromHover rounded-full -ml-1.5">
                  <img
                    key={tokens[2].id}
                    className="w-full rounded-full"
                    src={tokens[2].icon}
                  />
                </div>
              ) : null}
            </div>
            <div className="flex items-center flex-wrap">
              <div className="text-sm ml-2 font-semibold whitespace-nowrap mb-0.5">
                {tokens[0].symbol +
                  '-' +
                  tokens[1].symbol +
                  `${tokens[2] ? '-' + tokens[2].symbol : ''}`}
              </div>
              {mark ? (
                <span className="text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2 mb-0.5">
                  V2
                </span>
              ) : null}
            </div>
            {watched && (
              <div className="ml-2">
                <WatchListStartFull />
              </div>
            )}
          </div>
          <div>{showSortedValue({ sortBy, value: pool[sortBy] })}</div>
        </div>
      </div>
    </div>
  );
}
function MobileWatchListCard({
  watchPools,
  poolTokenMetas,
  farmCounts,
  volumes,
  watchV2Pools,
  poolsMorePoolsIds,
  watchList,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  poolsMorePoolsIds: Record<string, string[]>;
  watchList: WatchList[];
}) {
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>(false);
  const [sortBy, onSortChange] = useState<string>('tvl');
  const totalWatchList_length = watchPools?.length + watchV2Pools?.length;
  function getAllWatchPools() {
    const watchAllPools: any = [];
    watchList.forEach((d: WatchList) => {
      const { pool_id } = d;
      const targetV1 = watchPools.find((p: Pool) => {
        if (p.id.toString() == pool_id) return true;
      });
      const targetV2 = watchV2Pools.find((p: PoolInfo) => {
        if (p.pool_id == pool_id) return true;
      });
      const target = targetV1 || targetV2;
      if (target) {
        watchAllPools.push(target);
      }
    });
    return watchAllPools;
  }
  const watchAllPools = getAllWatchPools();
  return (
    <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4 mb-4 mt-2">
      <div className="mx-4 flex items-center justify-between mt-4">
        <div className="flex items-center">
          <div
            className={`text-${
              watchPools?.length > 0 ? 'white' : 'gray-400'
            }  text-base`}
          >
            <FormattedMessage id="my_watchlist" defaultMessage="My Watchlist" />
            {/* {watchPools.length > 0 ? ` (${watchPools.length})` : ''} */}
            &nbsp;
            {totalWatchList_length > 0 ? <>({totalWatchList_length})</> : ''}
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
              } w-36`}
            >
              <span
                className={`px-2 w-full text-xs h-5
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
          {watchAllPools.map((pool: any, i: number) => {
            if (pool.id?.toString()) {
              return (
                <div className="w-full hover:bg-poolRowHover" key={i}>
                  <MobilePoolRow
                    tokens={poolTokenMetas[pool.id]}
                    sortBy={sortBy}
                    pool={pool}
                    watched={!!find(watchPools, { id: pool.id })}
                    morePoolIds={poolsMorePoolsIds[pool.id]}
                    supportFarm={!!farmCounts[pool.id]}
                    h24volume={volumes[pool.id]}
                    watchPool
                    mark={true}
                  />
                </div>
              );
            } else if (pool.pool_id) {
              return (
                <MobilePoolRowV2
                  tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                  pool={pool}
                  sortBy={sortBy}
                  mark={true}
                  key={i + '-mobile-pool-row-v2'}
                  h24volume={volumes[pool.pool_id]}
                />
              );
            }
          })}
          {/* {watchPools?.map((pool, i) => (
            <div className="w-full hover:bg-poolRowHover" key={i}>
              <MobilePoolRow
                tokens={poolTokenMetas[pool.id]}
                sortBy={sortBy}
                pool={pool}
                watched={!!find(watchPools, { id: pool.id })}
                morePoolIds={poolsMorePoolsIds[pool.id]}
                supportFarm={!!farmCounts[pool.id]}
                h24volume={volumes[pool.id]}
                watchPool
                mark={true}
              />
            </div>
          ))}
          {watchV2Pools.map((pool: PoolInfo, i: number) => (
            <MobilePoolRowV2
              tokens={[pool.token_x_metadata, pool.token_y_metadata]}
              pool={pool}
              sortBy={sortBy}
              mark={true}
              key={i + '-mobile-pool-row-v2'}
            />
          ))} */}
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
  farmCounts,
  farmOnly,
  setFarmOnly,
  volumes,
  activeTab,
  switchActiveTab,
  watchV2Pools,
  watchList,
}: {
  pools: Pool[];
  poolTokenMetas: any;
  farmOnly: boolean;
  setFarmOnly: (farmOnly: boolean) => void;
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
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  switchActiveTab: (tab: string) => void;
  activeTab: string;
  watchV2Pools: PoolInfo[];
  watchList: WatchList[];
}) {
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;
  const history = useHistory();
  const intl = useIntl();
  const [showSelectModal, setShowSelectModal] = useState<Boolean>();
  const [showSelectModalV2, setShowSelectModalV2] = useState<Boolean>();

  const inputRef = useRef(null);
  const selectTokens = useRainbowWhitelistTokens();

  const selectBalances = useTokenBalances();

  const allPoolsV2 = useAllPoolsV2();
  const [v2SortBy, setV2SortBy] = useState<string>('tvl');

  const [v2Order, setV2Order] = useState<string>('desc');

  const poolv2ReSortingFunc = (p1: PoolInfo, p2: PoolInfo) => {
    const f1 = p1.fee;

    const f2 = p2.fee;

    const tvl1 = p1.tvl;

    const tvl2 = p2.tvl;

    const v1 = volumes[p1.pool_id] ? parseFloat(volumes[p1.pool_id]) : 0;

    const v2 = volumes[p2.pool_id] ? parseFloat(volumes[p2.pool_id]) : 0;

    if (v2Order === 'desc') {
      if (v2SortBy === 'tvl') {
        return tvl2 - tvl1;
      } else if (v2SortBy === 'fee') {
        return f2 - f1;
      } else if (v2SortBy === 'volume_24h') {
        return v2 - v1;
      }
    } else if (v2Order === 'asc') {
      if (v2SortBy === 'tvl') {
        return tvl1 - tvl2;
      } else if (v2SortBy === 'fee') {
        return f1 - f2;
      } else if (v2SortBy === 'volume_24h') {
        return v1 - v2;
      }
    }
  };

  const poolv2FilterFunc = (p: PoolInfo) => {
    return (
      _.includes(
        p.token_x_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      ) ||
      _.includes(
        p.token_y_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      )
    );
  };
  const tokensStar = [REF_META_DATA, unwrapedNear];

  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');
  const [showAddPoolModal, setShowAddPoolModal] = useState<boolean>(false);

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;

    return poolTokenMetas[p.id].some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };
  const outOfText = intl.formatMessage({ id: 'out_of' });

  const poolSortingFunc = (p1: Pool, p2: Pool) => {
    if (order === 'asc') {
      if (sortBy === 'apr') {
        return (
          getPoolFeeApr(volumes[p1.id], p1) - getPoolFeeApr(volumes[p2.id], p2)
        );
      } else if (sortBy === 'volume_24h') {
        return parseFloat(volumes[p1.id]) - parseFloat(volumes[p2.id]);
      }
    } else if (order === 'desc') {
      if (sortBy === 'apr') {
        return (
          getPoolFeeApr(volumes[p2.id], p2) - getPoolFeeApr(volumes[p1.id], p1)
        );
      } else if (sortBy === 'volume_24h') {
        return parseFloat(volumes[p2.id]) - parseFloat(volumes[p1.id]);
      }
    }
  };
  if (activeTab === 'v2' && !allPoolsV2) return <Loading />;

  return (
    <>
      <PoolTabV3></PoolTabV3>
      <div className="flex flex-col w-3/6 md:w-11/12 lg:w-5/6 xs:w-11/12 m-auto md:flex lg:hidden xl:hidden xs:flex">
        <MobileWatchListCard
          poolTokenMetas={poolTokenMetas}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          farmCounts={farmCounts}
          volumes={volumes}
          poolsMorePoolsIds={poolsMorePoolsIds}
          watchList={watchList}
        />

        {/* start pool card */}
        {!!getConfig().REF_VE_CONTRACT_ID ? (
          <div className="mt-1 mb-5">
            <div className="flex items-center">
              <span className="text-white text-lg ml-4 mr-2">
                <FormattedMessage
                  id="start_pool"
                  defaultMessage={'Star Pool'}
                />
              </span>
              <StartPoolIcon />
            </div>
            <Card
              className="mt-2 bg-cardBg flex flex-col  "
              width="w-full"
              padding="px-0 py-3"
            >
              <div className="flex items-center ml-5">
                <button
                  className="flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open(`/pool/${getVEPoolId()}`);
                  }}
                >
                  <Images tokens={tokensStar} size="6" className="mr-2.5" />
                  <Symbols
                    tokens={tokensStar}
                    seperator="-"
                    fontSize="text-sm"
                  ></Symbols>
                </button>
              </div>

              <PoolDaoBannerMobile />

              {/* {supportFarmStar && <FarmButton farmCount={farmCountStar} />} */}
            </Card>
          </div>
        ) : null}

        <div className="flex flex-col items-center justify-between mb-4">
          <div className="bg-cardBg flex items-center rounded-xl w-full p-1">
            <button
              className={`w-1/3 h-10 flex items-center justify-center ${
                activeTab === 'v2' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'v2'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('v2');
              }}
            >
              V2 Pools
            </button>

            <button
              className={`w-1/3 h-10 flex items-center justify-center ${
                activeTab === 'v1' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'v1'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('v1');
              }}
            >
              V1 Pools
            </button>

            <button
              className={`w-1/3 h-10 flex items-center justify-center ${
                activeTab === 'stable' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'stable'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('stable');
              }}
            >
              Stable Pools
            </button>
          </div>

          {activeTab === 'stable' && (
            <div className="flex items-center justify-end relative w-full">
              <div className="relative rounded-xl w-full my-2 text-primaryText flex items-center pr-2 bg-cardBg">
                <input
                  ref={inputRef}
                  value={tokenName}
                  className={`text-sm outline-none rounded-xl w-full py-1.5 pl-3 pr-6`}
                  placeholder={intl.formatMessage({
                    id: 'search_by_token',
                  })}
                  onChange={(evt) => {
                    onSearch(evt.target.value);
                  }}
                />
                <SearchIcon className="absolute right-2"></SearchIcon>
              </div>
            </div>
          )}
        </div>
        {activeTab === 'v1' && (
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

            <div className="rounded my-2 text-gray-400 flex items-center pr-2 mx-4 mb-5">
              <div className="relative flex items-center flex-grow">
                <input
                  ref={inputRef}
                  className={`text-sm outline-none rounded py-2 pl-3 pr-7 flex-grow bg-inputDarkBg`}
                  placeholder={intl.formatMessage({
                    id: 'search_by_token',
                  })}
                  value={tokenName}
                  onChange={(evt) => {
                    onSearch(evt.target.value);
                  }}
                />
                <SearchIcon className="absolute right-1.5"></SearchIcon>
              </div>
              {isSignedIn ? (
                <div
                  className="ml-1 text-xs"
                  data-type="info"
                  data-place="top"
                  data-multiline={true}
                  data-class="reactTip"
                  data-html={true}
                  data-tip={`
              <div className="text-xs">
                <div 
                  style="max-width: 250px;font-weight:400",
                >
                ${intl.formatMessage({ id: 'create_new_pool' })}
                </div>
              </div>
            `}
                  data-for="add_pool_tip"
                >
                  <button
                    className={`text-base ml-2 px-3 text-primaryText w-8 h-8 bg-black bg-opacity-20 hover:bg-opacity-40 hover:text-gradientFrom rounded-md flex items-center justify-center`}
                    onClick={() => {
                      setShowAddPoolModal(true);
                    }}
                  >
                    +
                  </button>
                </div>
              ) : null}
            </div>

            <div className="flex items-start justify-between mx-4 mb-2">
              <SelectUi
                list={filterList}
                onChange={setSelectCoinClass}
                curvalue={selectCoinClass}
              />

              <div className="flex flex-col">
                <div
                  className=" inline-flex items-center cursor-pointer"
                  onClick={() => {
                    farmOnly && setFarmOnly(false);
                    !farmOnly && setFarmOnly(true);
                  }}
                >
                  <div className="mr-2">
                    {farmOnly ? <CheckedTick /> : <CheckedEmpty />}
                  </div>
                  <div className="text-primaryText text-sm">
                    <FormattedMessage
                      id="farm_only"
                      defaultMessage="Farm only"
                    />
                  </div>
                </div>
                <div
                  className=" inline-flex items-center cursor-pointer mt-2"
                  onClick={() => {
                    hideLowTVL && onHide(false);
                    !hideLowTVL && onHide(true);
                  }}
                >
                  <div className="mr-2">
                    {hideLowTVL ? <CheckedTick /> : <CheckedEmpty />}
                  </div>
                  <div className="text-primaryText text-sm">
                    <FormattedMessage
                      id="hide_low_tvl_pools_mobile"
                      defaultMessage="Hide low TVL pools"
                    />
                  </div>
                </div>
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
                    {order === 'desc' ? (
                      <DownArrowLightMobile />
                    ) : (
                      <UpArrowDeep />
                    )}
                  </div>
                  <div
                    className={`relative rounded-full flex items-center border    ${
                      showSelectModal
                        ? 'border-greenColor text-white'
                        : 'border-farmText text-farmText'
                    } w-36`}
                  >
                    <span
                      className={`px-2 w-full text-xs h-5
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
              <div className="max-h-96 overflow-y-auto overflow-x-visible pool-list-container-mobile">
                {pools
                  ?.filter(poolFilterFunc)
                  .sort(poolSortingFunc)
                  .map((pool, i) => (
                    <MobilePoolRow
                      selectCoinClass={selectCoinClass}
                      tokens={poolTokenMetas[pool.id]}
                      pool={pool}
                      sortBy={sortBy}
                      watched={!!find(watchPools, { id: pool.id })}
                      key={i}
                      morePoolIds={poolsMorePoolsIds[pool.id]}
                      supportFarm={!!farmCounts[pool.id]}
                      h24volume={volumes[pool.id]}
                    />
                  ))}
              </div>
            </section>
          </Card>
        )}

        {activeTab === 'v2' && (
          <Card className="w-full" bgcolor="bg-cardBg" padding="p-0 pb-4">
            <div className="rounded my-4 text-gray-400 flex items-center pr-2 mx-4 mb-5">
              <div className="relative flex items-center flex-grow">
                <input
                  ref={inputRef}
                  className={`text-sm outline-none rounded py-2 pl-3 pr-7 flex-grow bg-inputDarkBg`}
                  placeholder={intl.formatMessage({
                    id: 'search_by_token',
                  })}
                  value={tokenName}
                  onChange={(evt) => {
                    onSearch(evt.target.value);
                  }}
                />
                <SearchIcon className="absolute right-1.5"></SearchIcon>
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
                      setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2Order === 'desc' ? (
                      <DownArrowLightMobile />
                    ) : (
                      <UpArrowDeep />
                    )}
                  </div>
                  <div
                    className={`relative rounded-full flex items-center border    ${
                      showSelectModalV2
                        ? 'border-greenColor text-white'
                        : 'border-farmText text-farmText'
                    } w-36`}
                  >
                    <span
                      className={`px-2 w-full text-xs h-5
                      flex items-center justify-between
                    `}
                      onClick={() => {
                        setShowSelectModalV2(true);
                      }}
                    >
                      <label>
                        <FormattedMessage
                          id={v2SortBy}
                          defaultMessage={v2SortBy}
                        />
                      </label>
                      <ArrowDownLarge />
                    </span>

                    {showSelectModalV2 && (
                      <SelectModalV2
                        sortMode={v2SortBy}
                        onSortChange={setV2SortBy}
                        setShowModal={setShowSelectModalV2}
                        className="top-8"
                      />
                    )}
                  </div>
                </div>
              </header>
              <div className="border-b border-gray-700 border-opacity-70" />
              <div className="max-h-96 overflow-y-auto pool-list-container-mobile">
                {allPoolsV2
                  ?.filter(poolv2FilterFunc)
                  .sort(poolv2ReSortingFunc)
                  .map((pool, i) => (
                    <MobilePoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      pool={pool}
                      sortBy={v2SortBy}
                      watched={!!find(watchV2Pools, { pool_id: pool.pool_id })}
                      key={i + '-mobile-pool-row-v2'}
                      h24volume={volumes[pool.pool_id]}
                    />
                  ))}
              </div>
            </section>
          </Card>
        )}

        {activeTab === 'stable' && (
          <StablePoolList
            searchBy={tokenName}
            volumes={volumes}
            watchPools={watchPools}
          />
        )}
      </div>
      {isSignedIn && (
        <AddPoolModal
          isOpen={showAddPoolModal}
          onRequestClose={(e) => {
            setShowAddPoolModal(false);
          }}
          tokens={selectTokens}
          balances={selectBalances}
        />
      )}
    </>
  );
}

function PoolRow({
  pool,
  index,
  selectCoinClass,
  tokens,
  morePoolIds,
  supportFarm,
  farmCount,
  h24volume,
  watched,
  mark,
}: {
  pool: Pool;
  index: number;
  selectCoinClass?: string;
  tokens?: TokenMetadata[];
  morePoolIds: string[];
  supportFarm: boolean;
  farmCount: number;
  h24volume: string;
  watched?: boolean;
  mark?: boolean;
}) {
  const curRowTokens = useTokens(pool.tokenIds, tokens);
  const history = useHistory();
  const [showLinkArrow, setShowLinkArrow] = useState(false);

  if (!curRowTokens) return <></>;

  tokens = curRowTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return 0;
  });
  return (
    <div className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
      <Link
        className={`grid grid-cols-${
          mark ? 7 : 8
        } py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80`}
        onClick={() => localStorage.setItem('fromMorePools', 'n')}
        to={{
          pathname: `/pool/${pool.id}`,
          state: { tvl: pool.tvl, backToFarms: supportFarm },
        }}
      >
        <div className="col-span-3 md:col-span-4 flex items-center">
          <div className="flex items-center">
            <Images tokens={tokens} size="8" />
            <div className="flex items-center">
              <div className="text-sm ml-3">
                {tokens[0].symbol +
                  '-' +
                  tokens[1].symbol +
                  `${tokens[2] ? '-' + tokens[2]?.symbol : ''}`}
              </div>
              {mark ? (
                <span className="text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2">
                  {ALL_STABLE_POOL_IDS.indexOf(pool.id.toString()) > -1 ? (
                    <FormattedMessage id="stablecoin"></FormattedMessage>
                  ) : (
                    'V1'
                  )}
                </span>
              ) : null}
              {watched && (
                <div className="ml-2">
                  <WatchListStartFull />
                </div>
              )}
            </div>
          </div>
          {supportFarm && <FarmStampNew multi={farmCount > 1} />}
        </div>
        <div className="col-span-1 justify-self-center py-1 md:hidden ">
          {calculateFeePercent(pool.fee)}%
        </div>

        <div
          className="col-span-1 justify-self-center py-1"
          title={`${getPoolFeeAprTitle(h24volume, pool)}%`}
        >
          {!h24volume ? '-' : `${getPoolFeeApr(h24volume, pool)}%`}
        </div>

        <div
          className="col-span-1 py-1 justify-self-center relative "
          title={h24volume}
        >
          {!h24volume
            ? '-'
            : Number(h24volume) == 0
            ? '$0'
            : Number(h24volume) < 0.01
            ? '$ <0.01'
            : `$${toInternationalCurrencySystem(h24volume)}`}
        </div>

        <div
          className="col-span-1 py-1 justify-self-center relative left-4"
          title={toPrecision(
            scientificNotationToString(pool.tvl.toString()),
            0
          )}
        >
          ${toInternationalCurrencySystem(pool.tvl.toString())}
        </div>

        <div
          className={`col-span-1 justify-self-center py-1 hover:text-green-500 hover:cursor-pointer ${
            mark ? 'hidden' : ''
          }`}
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
          <span className="relative left-8">
            {morePoolIds?.length ? `${morePoolIds?.length}` : '-'}
            {showLinkArrow && ' >'}
          </span>
        </div>
      </Link>
    </div>
  );
}

function PoolRowV2({
  pool,
  index,
  tokens,
  showCol,
  mark,
  watched,
  h24volume,
}: {
  pool: PoolInfo;
  index: number;
  tokens?: TokenMetadata[];
  showCol?: boolean;
  mark?: boolean;
  watched?: boolean;
  h24volume?: string;
}) {
  const curRowTokens = useTokens([pool.token_x, pool.token_y], tokens);
  const history = useHistory();

  if (!curRowTokens) return <></>;

  tokens = curRowTokens.sort((a, b) => {
    if (a.symbol === 'NEAR') return 1;
    if (b.symbol === 'NEAR') return -1;
    return a.symbol > b.symbol ? 1 : -1;
  });
  function goDetailV2() {
    const url_pool_id = pool.pool_id.replace(/\|/g, '@');
    history.push(`/poolV2/${url_pool_id}`);
  }
  function geth24volume() {
    const v = +(h24volume || '0');
    if (v == 0) {
      return '$0';
    } else if (v < 0.01) {
      return '<$0.01';
    } else {
      return '$' + toInternationalCurrencySystem(v.toString(), 2);
    }
  }
  return (
    <div
      className="w-full hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20 cursor-pointer"
      onClick={goDetailV2}
    >
      <div
        className={`grid ${
          showCol ? 'grid-cols-7' : 'grid-cols-8'
        } py-3.5 text-white content-center text-sm text-left mx-8 border-b border-gray-700 border-opacity-70 hover:opacity-80`}
      >
        <div
          className={`md:col-span-4 flex items-center ${
            showCol && mark ? 'col-span-3' : 'col-span-4'
          }`}
        >
          <div className="flex items-center">
            <Images tokens={tokens} size="8" />
            <div className="text-sm ml-3">
              {tokens[0].symbol +
                '-' +
                tokens[1].symbol +
                `${tokens[2] ? '-' + tokens[2].symbol : ''}`}
            </div>
          </div>
          {mark ? (
            <span className="text-xs text-v3SwapGray bg-watchMarkBackgroundColor px-2.5 py-px rounded-xl ml-2">
              V2
            </span>
          ) : null}
          {watched && (
            <div className="ml-2">
              <WatchListStartFull />
            </div>
          )}
        </div>
        <div
          className={`justify-self-center py-1 md:hidden ${
            showCol ? 'col-span-1' : 'col-span-2'
          }`}
        >
          {calculateFeePercent(pool.fee / 100)}%
        </div>

        {mark && (
          <div
            className={`col-span-1 justify-self-center py-1 md:hidden ${
              showCol ? '' : 'hidden'
            }`}
          >
            /
          </div>
        )}

        <div
          className={`col-span-1 justify-self-center py-1 md:hidden ${
            showCol ? '' : 'hidden'
          }`}
        >
          {geth24volume()}
        </div>
        <div
          className="col-span-1 py-1 justify-self-center relative left-4"
          title={toPrecision(
            scientificNotationToString(pool.tvl.toString()),
            0
          )}
        >
          ${toInternationalCurrencySystem(pool.tvl.toString())}
        </div>
      </div>
    </div>
  );
}

function WatchListCard({
  watchPools,
  poolTokenMetas,
  farmCounts,
  volumes,
  watchV2Pools,
  poolsMorePoolsIds,
  watchList,
  tokenName,
}: {
  watchPools: Pool[];
  poolTokenMetas: any;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  poolsMorePoolsIds: Record<string, string[]>;
  watchList: WatchList[];
  tokenName: string;
}) {
  const totalWatchList_length = watchPools?.length + watchV2Pools?.length;
  function getAllWatchPools() {
    const watchAllPools: any = [];
    watchList.forEach((d: WatchList) => {
      const { pool_id } = d;
      const targetV1 = watchPools.find((p: Pool) => {
        if (p.id.toString() == pool_id) return true;
      });
      const targetV2 = watchV2Pools.find((p: PoolInfo) => {
        if (p.pool_id == pool_id) return true;
      });
      const target = targetV1 || targetV2;
      if (target) {
        watchAllPools.push(target);
      }
    });
    return watchAllPools;
  }
  const watchAllPools = getAllWatchPools();

  function v1PoolFilter(p: Pool) {
    return Object.values(p.metas)?.some((t: any) =>
      _.includes(t.symbol.toLowerCase(), tokenName.toLowerCase())
    );
  }

  function v2PoolFilter(p: PoolInfo) {
    return (
      _.includes(
        p.token_x_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      ) ||
      _.includes(
        p.token_y_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      )
    );
  }

  return (
    <>
      <Card className=" w-full mb-2" padding="p-0 py-6" bgcolor="bg-cardBg">
        <section className="">
          <header className="grid grid-cols-7 py-2 pb-4 text-left text-sm text-gray-400 mx-8 border-b border-gray-700 border-opacity-70">
            <div className="col-span-3 md:col-span-4 flex">
              <FormattedMessage id="pair" defaultMessage="Pair" />
            </div>
            <div className="col-span-1 justify-self-center md:hidden flex items-center">
              <div className="mr-1">
                <FormattedMessage id="fee" defaultMessage="Fee" />
              </div>
            </div>

            <div className="col-span-1 justify-self-center relative right-1 md:hidden flex items-center">
              <div className="pr-1 ">
                <FormattedMessage id="apr" defaultMessage="APR" />
              </div>
            </div>

            <div className="col-span-1 justify-self-center relative  md:hidden flex items-center">
              <div className="pr-1 ">
                <FormattedMessage
                  id="volume_24h"
                  defaultMessage="Volume (24h)"
                />
              </div>
            </div>

            <div className="col-span-1 justify-self-center flex items-center">
              <FormattedMessage id="tvl" defaultMessage="TVL" />
            </div>
          </header>

          <div className="max-h-96 overflow-y-auto">
            {watchAllPools
              .filter((p: any) => {
                if (p.id?.toString()) {
                  return v1PoolFilter(p);
                } else if (p.pool_id) {
                  return v2PoolFilter(p);
                }
              })
              .map((pool: any, i: number) => {
                if (pool.id?.toString()) {
                  return (
                    <div
                      className="w-full hover:bg-poolRowHover hover:bg-opacity-20"
                      key={i}
                    >
                      <PoolRow
                        pool={pool}
                        index={i + 1}
                        tokens={poolTokenMetas[pool.id]}
                        morePoolIds={poolsMorePoolsIds[pool.id]}
                        farmCount={farmCounts[pool.id]}
                        supportFarm={!!farmCounts[pool.id]}
                        h24volume={volumes[pool.id]}
                        mark={true}
                      />
                    </div>
                  );
                } else if (pool.pool_id) {
                  return (
                    <PoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      key={i}
                      pool={pool}
                      index={1 + i}
                      showCol={true}
                      mark={true}
                      h24volume={volumes[pool.pool_id]}
                    />
                  );
                }
              })}
            {/* {watchPools?.map((pool, i) => (
              <div
                className="w-full hover:bg-poolRowHover hover:bg-opacity-20"
                key={i}
              >
                <PoolRow
                  pool={pool}
                  index={i + 1}
                  tokens={poolTokenMetas[pool.id]}
                  morePoolIds={poolsMorePoolsIds[pool.id]}
                  farmCount={farmCounts[pool.id]}
                  supportFarm={!!farmCounts[pool.id]}
                  h24volume={volumes[pool.id]}
                  mark={true}
                />
              </div>
            ))}
            {watchV2Pools.map((pool: PoolInfo, i: number) => {
              return (
                <PoolRowV2
                  tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                  key={i}
                  pool={pool}
                  index={1 + watchPools?.length}
                  showCol={true}
                  mark={true}
                />
              );
            })} */}
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
  farmCounts,
  farmOnly,
  setFarmOnly,
  volumes,
  activeTab,
  switchActiveTab,
  watchV2Pools,
  watchList,
  h24VolumeV2,
}: {
  pools: Pool[];
  switchActiveTab: (tab: string) => void;
  activeTab: string;
  poolTokenMetas: any;
  sortBy: string;
  hideLowTVL: Boolean;
  watchPools: Pool[];
  tokenName: string;
  order: string;
  onHide: (mode: Boolean) => void;
  allPools: number;
  h24VolumeV2: string;
  farmOnly: boolean;
  setFarmOnly: (farmOnly: boolean) => void;
  hasMore: boolean;
  onSearch: (name: string) => void;
  onSortChange: (by: string) => void;
  onOrderChange: (by: string) => void;
  nextPage: (...args: []) => void;
  poolsMorePoolsIds: Record<string, string[]>;
  farmCounts: Record<string, number>;
  volumes: Record<string, string>;
  watchV2Pools: PoolInfo[];
  watchList: WatchList[];
}) {
  const intl = useIntl();
  const inputRef = useRef(null);

  const allPoolsV2 = useAllPoolsV2();

  const [tvlV2, setTvlV2] = useState<string>();

  useEffect(() => {
    if (
      typeof allPoolsV2 === 'undefined' ||
      allPoolsV2.length === 0 ||
      allPoolsV2.every((p) => !p?.tvl)
    )
      return;

    const tvl = allPoolsV2.reduce(
      (a, b) => new Big(a || '0').plus(new Big(b.tvl || '0')),
      new Big(0)
    );

    setTvlV2(scientificNotationToString(tvl.toString()));
  }, [allPoolsV2]);
  useEffect(() => {
    if (inputRef?.current) {
      inputRef.current.value = tokenName;
    }
  }, [tokenName, inputRef?.current]);

  const selectTokens = useRainbowWhitelistTokens();

  const selectBalances = useTokenBalances();

  const filterList = { all: intl.formatMessage({ id: 'allOption' }) };
  classificationOfCoins_key.forEach((key) => {
    filterList[key] = intl.formatMessage({ id: key });
  });
  const [selectCoinClass, setSelectCoinClass] = useState<string>('all');
  const { globalState } = useContext(WalletContext);
  const isSignedIn = globalState.isSignedIn;

  const [supportFarmStar, setSupportFarmStar] = useState<Boolean>(false);
  const [farmCountStar, setFarmCountStar] = useState<Number>(1);

  const [showAddPoolModal, setShowAddPoolModal] = useState<boolean>(false);

  const [reSortBy, setReSortBy] = useState<string>('');

  const [v2SortBy, setV2SortBy] = useState<string>('tvl');

  const [v2Order, setV2Order] = useState<string>('desc');

  useEffect(() => {
    canFarm(getVEPoolId()).then(({ count }) => {
      setSupportFarmStar(!!count);
      setFarmCountStar(count);
    });
  }, []);

  const tokensStar = [REF_META_DATA, unwrapedNear];

  const poolReSortingFunc = (p1: Pool, p2: Pool) => {
    const v1 = volumes[p1.id] ? parseFloat(volumes[p1.id]) : 0;

    const v2 = volumes[p2.id] ? parseFloat(volumes[p2.id]) : 0;

    const apr1 = getPoolFeeAprTitle(v1.toString(), p1);

    const apr2 = getPoolFeeAprTitle(v2.toString(), p2);

    if (order === 'desc') {
      if (reSortBy === 'volume') {
        return v2 - v1;
      } else if (reSortBy === 'apr') {
        return apr2 - apr1;
      }
    } else if (order === 'asc') {
      if (reSortBy === 'volume') {
        return v1 - v2;
      } else if (reSortBy === 'apr') {
        return apr1 - apr2;
      }
    }
  };

  const poolv2ReSortingFunc = (p1: PoolInfo, p2: PoolInfo) => {
    const f1 = p1.fee;

    const f2 = p2.fee;

    const tvl1 = p1.tvl;

    const tvl2 = p2.tvl;

    const v1 = volumes[p1.pool_id] ? parseFloat(volumes[p1.pool_id]) : 0;

    const v2 = volumes[p2.pool_id] ? parseFloat(volumes[p2.pool_id]) : 0;

    if (v2Order === 'desc') {
      if (v2SortBy === 'tvl') {
        return tvl2 - tvl1;
      } else if (v2SortBy === 'fee') {
        return f2 - f1;
      } else if (v2SortBy === 'volume_24h') {
        return v2 - v1;
      }
    } else if (v2Order === 'asc') {
      if (v2SortBy === 'tvl') {
        return tvl1 - tvl2;
      } else if (v2SortBy === 'fee') {
        return f1 - f2;
      } else if (v2SortBy === 'volume_24h') {
        return v1 - v2;
      }
    }
  };

  const [searchFocus, setSearchFocus] = useState(false);

  const poolv2FilterFunc = (p: PoolInfo) => {
    return (
      _.includes(
        p.token_x_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      ) ||
      _.includes(
        p.token_y_metadata.symbol.toLowerCase(),
        tokenName.toLowerCase()
      )
    );
  };

  const poolFilterFunc = (p: Pool) => {
    if (selectCoinClass === 'all') return true;

    return poolTokenMetas?.[p.id]?.some((tk: TokenMetadata) =>
      classificationOfCoins[selectCoinClass].includes(tk.symbol)
    );
  };

  if (activeTab === 'v2' && !allPoolsV2) return <Loading />;
  const totalWatchList_length = watchPools?.length + watchV2Pools?.length;
  return (
    <>
      <PoolTabV3></PoolTabV3>
      <div className="flex flex-col whitespace-nowrap w-1000px m-auto ">
        {/* start pool card */}
        {!!getConfig().REF_VE_CONTRACT_ID ? (
          <div className={` mt-5 mb-3`}>
            <Card
              className="mt-2  relative flex items-center "
              width="w-full"
              bgcolor="bg-starPoolBg "
              padding="px-0 "
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(`/pool/${getVEPoolId()}`);
              }}
            >
              <div className="absolute left-3 top-0 ">
                <StartPoolIcon />
              </div>
              <div className="w-full cursor-pointer flex items-center px-8 py-3 hover:bg-poolRowHover bg-blend-overlay hover:bg-opacity-20">
                <div className="flex items-center">
                  <div className="flex items-center">
                    <Images tokens={tokensStar} size="8" className="mr-7" />
                    <Symbols
                      tokens={tokensStar}
                      seperator="-"
                      fontSize="text-sm"
                    ></Symbols>
                  </div>
                </div>

                {supportFarmStar && <FarmStampNew multi={farmCountStar > 1} />}
              </div>
              <div className="absolute flex items-center right-0 bottom-0">
                <button
                  className="text-white hover:text-gradientFrom text-lg z-30 relative top-6 right-0 flex items-center"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    window.open('/referendum');
                  }}
                >
                  <span className="text-white">
                    <FormattedMessage
                      id="more_than_a_simple_pool"
                      defaultMessage={'More than a simple pool'}
                    />
                  </span>

                  <button className=" ml-1.5">
                    <VEARROW />
                  </button>
                </button>
                <PoolDaoBanner />
              </div>
            </Card>
          </div>
        ) : null}

        <div className={`flex items-center justify-between mb-4 ${'mt-5'} `}>
          <div className=" flex text-base items-center rounded-xl p-1">
            <div className="bg-cardBg p-1 h-10 flex items-center rounded-xl">
              <button
                className={` h-full  hover:bg-viewPoolHoverBgColor border-primaryText px-4 flex items-center justify-center ${
                  activeTab === 'v2' ? 'text-white' : 'text-primaryText'
                } `}
                style={{
                  background:
                    activeTab === 'v2'
                      ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                      : null,
                  borderRadius: '10px',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  switchActiveTab('v2');
                }}
              >
                V2 Pools
              </button>
              {activeTab === 'v1' || activeTab === 'v2' ? null : (
                <div
                  className="w-px h-6"
                  style={{
                    background: '#566069',
                  }}
                ></div>
              )}

              <button
                className={` h-full flex  hover:bg-viewPoolHoverBgColor  px-4 items-center justify-center ${
                  activeTab === 'v1' ? 'text-white' : 'text-primaryText'
                } `}
                style={{
                  background:
                    activeTab === 'v1'
                      ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                      : null,
                  borderRadius: '10px',
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  switchActiveTab('v1');
                }}
              >
                V1 Pools
              </button>
            </div>

            <button
              className={`ml-2.5 h-10 px-4  hover:bg-viewPoolHoverBgColor bg-cardBg flex items-center justify-center ${
                activeTab === 'stable' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'stable'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('stable');
              }}
            >
              Stable Pools
            </button>

            <button
              className={`ml-2.5 h-10 px-4  hover:bg-viewPoolHoverBgColor bg-cardBg flex items-center justify-center ${
                activeTab === 'watchlist' ? 'text-white' : 'text-primaryText'
              } `}
              style={{
                background:
                  activeTab === 'watchlist'
                    ? 'linear-gradient(180deg, #00C6A2 0%, #008B72 100%)'
                    : null,
                borderRadius: '10px',
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                switchActiveTab('watchlist');
              }}
            >
              {activeTab === 'watchlist' ? (
                <AiFillStar fill="white" />
              ) : (
                <AiFillStar fill="#91A2AE" />
              )}
              <FormattedMessage id="watchlist" defaultMessage={'Watchlist'} />
              {totalWatchList_length > 0 ? ` (${totalWatchList_length})` : ''}
            </button>
          </div>

          <div className="flex items-center justify-end relative ">
            <div
              className={`relative rounded-xl border w-full my-2 text-white  flex items-center pr-2 `}
              style={{
                background: 'rgba(34, 46, 56, 0.2)',
                border: searchFocus ? '1px solid #3A635B' : '1px solid #304452',
              }}
            >
              <input
                ref={inputRef}
                className={`text-sm search-pool-pc outline-none rounded-xl w-full py-2 pl-3 pr-6`}
                placeholder={intl.formatMessage({
                  id: 'search_pool_by_token',
                  defaultMessage: 'Search pool by token...',
                })}
                onFocus={() => {
                  setSearchFocus(true);
                }}
                onBlur={() => {
                  setSearchFocus(false);
                }}
                onChange={(evt) => {
                  onSearch(evt.target.value);
                }}
              />
              <SearchIcon
                style={{
                  opacity: searchFocus ? '1' : '0.5',
                }}
                className="absolute right-2"
              ></SearchIcon>
            </div>

            {isSignedIn && (activeTab === 'v1' || activeTab === 'v2') ? (
              <div
                className="ml-1 text-xs"
                data-type="info"
                data-place="top"
                data-multiline={true}
                data-class="reactTip"
                data-html={true}
                data-tip={`
              <div class="text-xs opacity-50">
                <div 
                  style="font-weight:400",
                >
                ${intl.formatMessage({
                  id: 'v2_pool_are_not_available_to_be_created_yet',

                  defaultMessage:
                    'V2 Pools are not available to be created yet',
                })}
                </div>
              </div>
            `}
                data-for="add_pool_tip"
              >
                <SolidButton
                  className={`text-sm ml-2 px-3 text-white rounded-lg flex items-center justify-center`}
                  onClick={() => {
                    setShowAddPoolModal(true);
                  }}
                  disabled={activeTab === 'v2'}
                >
                  <span className="mr-1">+</span>

                  <span>
                    <FormattedMessage
                      id="create_pool"
                      defaultMessage={'Create Pool'}
                    />
                  </span>
                </SolidButton>

                {activeTab === 'v2' && (
                  <ReactTooltip
                    className="w-20"
                    id="add_pool_tip"
                    backgroundColor="#1D2932"
                    border
                    borderColor="#7e8a93"
                    textColor="#C6D1DA"
                    effect="solid"
                  />
                )}
              </div>
            ) : null}
          </div>
        </div>
        {activeTab === 'watchlist' && (
          <WatchListCard
            poolTokenMetas={poolTokenMetas}
            watchPools={watchPools}
            farmCounts={farmCounts}
            volumes={volumes}
            watchV2Pools={watchV2Pools}
            watchList={watchList}
            poolsMorePoolsIds={poolsMorePoolsIds}
            tokenName={tokenName}
          />
        )}
        {activeTab === 'v1' && (
          <Card width="w-full" className="bg-cardBg" padding="pb-7 px-0">
            <div
              className="flex px-6 py-5 justify-between rounded-t-xl mb-2"
              style={{
                background: '#293742',
              }}
            >
              <div className="flex items-center">
                <div className="text-white text-lg font-bold">Top Pools</div>

                <div className="flex items-center">
                  <span className="mr-1">
                    <QuestionTip id="topPoolsCopy" />
                  </span>

                  <div className="text-white text-sm">
                    {(pools?.length
                      ? pools?.filter(poolFilterFunc).length
                      : '-') +
                      ' out of ' +
                      (allPools ? allPools : '-')}
                  </div>
                </div>
              </div>

              <div className="ml-8 justify-between  flex">
                <div className="flex items-center">
                  <div
                    className="flex items-center mr-5 cursor-pointer"
                    onClick={() => {
                      farmOnly && setFarmOnly(false);
                      !farmOnly && setFarmOnly(true);
                    }}
                  >
                    <div className="mr-2">
                      {farmOnly ? <CheckedTick /> : <CheckedEmpty />}
                    </div>
                    <div className="text-white text-sm ">
                      <FormattedMessage id="farm" defaultMessage="Farm" />
                    </div>
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
                    <div className="text-white text-sm ">
                      <FormattedMessage
                        id="hide_low_tvl_pools"
                        defaultMessage="Hide low TVL pools"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center">
                  <SelectUi
                    list={filterList}
                    onChange={setSelectCoinClass}
                    curvalue={selectCoinClass}
                  />
                </div>
              </div>
            </div>

            <section className="">
              <header className="grid grid-cols-8 py-2 pb-4 text-left text-sm text-primaryText mx-8 border-b border-gray-700 border-opacity-70">
                <div className="col-span-3 md:col-span-4 flex">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="col-span-1 justify-self-center md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      sortBy !== 'fee' ? 'hover:text-white' : ''
                    } ${sortBy === 'fee' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      onSortChange('fee');
                      setReSortBy('');
                      sortBy !== 'fee' && onOrderChange('desc');
                      sortBy === 'fee' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="fee" defaultMessage="Fee" />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      sortBy !== 'fee' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      onSortChange('fee');
                      setReSortBy('');
                      sortBy !== 'fee' && onOrderChange('desc');
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

                <div className="col-span-1 justify-self-center  relative right-1 md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      reSortBy !== 'apr' ? 'hover:text-white' : ''
                    } ${reSortBy === 'apr' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      onSortChange('');
                      setReSortBy('apr');
                      reSortBy !== 'apr' && onOrderChange('desc');
                      reSortBy === 'apr' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="apr" defaultMessage="APR" />
                  </span>

                  <span
                    className={reSortBy !== 'apr' ? 'hidden' : 'cursor-pointer'}
                    onClick={() => {
                      onSortChange('');
                      setReSortBy('apr');
                      reSortBy !== 'apr' && onOrderChange('desc');
                      reSortBy === 'apr' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {reSortBy === 'apr' ? (
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

                <div className="col-span-1 justify-self-center relative  md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      reSortBy !== 'volume' ? 'hover:text-white' : ''
                    } ${reSortBy === 'volume' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      onSortChange('');
                      setReSortBy('volume');
                      reSortBy !== 'volume' && onOrderChange('desc');
                      reSortBy === 'volume' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage
                      id="volume_24h"
                      defaultMessage="Volume (24h)"
                    />
                  </span>

                  <span
                    className={
                      reSortBy !== 'volume' ? 'hidden' : 'cursor-pointer'
                    }
                    onClick={() => {
                      onSortChange('');
                      setReSortBy('volume');
                      reSortBy !== 'volume' && onOrderChange('desc');
                      reSortBy === 'volume' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {reSortBy === 'volume' ? (
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

                <div className="col-span-1 justify-self-center relative left-4 flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      sortBy !== 'tvl' ? 'hover:text-white' : ''
                    } ${sortBy === 'tvl' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      onSortChange('tvl');
                      setReSortBy('');

                      sortBy !== 'tvl' && onOrderChange('desc');
                      sortBy === 'tvl' &&
                        onOrderChange(order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="tvl" defaultMessage="TVL" />
                  </span>
                  <span
                    className={sortBy !== 'tvl' ? 'hidden' : 'cursor-pointer'}
                    onClick={() => {
                      onSortChange('tvl');
                      setReSortBy('');
                      sortBy !== 'tvl' && onOrderChange('desc');
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
                <p className="col-span-1 justify-self-end relative right-6">
                  <FormattedMessage id="pools" defaultMessage="Pools" />
                </p>
              </header>

              <div className="max-h-96 overflow-y-auto  pool-list-container-pc">
                {pools
                  ?.filter(poolFilterFunc)
                  .sort(poolReSortingFunc)
                  .map((pool, i) => (
                    <PoolRow
                      tokens={poolTokenMetas[pool.id]}
                      key={i}
                      pool={pool}
                      index={i + 1}
                      selectCoinClass={selectCoinClass}
                      morePoolIds={poolsMorePoolsIds[pool.id]}
                      supportFarm={!!farmCounts[pool.id]}
                      farmCount={farmCounts[pool.id]}
                      h24volume={volumes[pool.id]}
                      watched={!!find(watchPools, { id: pool.id })}
                    />
                  ))}
              </div>
            </section>
          </Card>
        )}

        {activeTab === 'v2' && (
          <Card width="w-full" className="bg-cardBg" padding="py-7 px-0">
            <section className="">
              <header className="grid grid-cols-7 py-2 pb-4 text-left text-sm text-primaryText mx-8 border-b border-gray-700 border-opacity-70">
                <div className="col-span-4 flex">
                  <FormattedMessage id="pair" defaultMessage="Pair" />
                </div>
                <div className="col-span-1 justify-self-center md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'fee' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'fee' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('fee');
                      v2SortBy !== 'fee' && setV2Order('desc');
                      v2SortBy === 'fee' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="fee" defaultMessage="Fee" />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'fee' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('fee');
                      v2SortBy !== 'fee' && setV2Order('desc');
                      v2SortBy === 'fee' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'fee' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-1 justify-self-center md:hidden flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'volume_24h' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'volume_24h' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('volume_24h');
                      v2SortBy !== 'volume_24h' && setV2Order('desc');
                      v2SortBy === 'volume_24h' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage
                      id="volume_24h"
                      defaultMessage="Volume (24h)"
                    />
                  </span>

                  <span
                    className={`cursor-pointer ${
                      v2SortBy !== 'volume_24h' ? 'hidden' : ''
                    }`}
                    onClick={() => {
                      setV2SortBy('volume_24h');
                      v2SortBy !== 'volume_24h' && setV2Order('desc');
                      v2SortBy === 'volume_24h' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'volume_24h' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>

                <div className="col-span-1 justify-self-center relative left-4 flex items-center">
                  <span
                    className={`pr-1  cursor-pointer ${
                      v2SortBy !== 'tvl' ? 'hover:text-white' : ''
                    } ${v2SortBy === 'tvl' ? 'text-gradientFrom' : ''}`}
                    onClick={() => {
                      setV2SortBy('tvl');
                      setReSortBy('');

                      v2SortBy !== 'tvl' && setV2Order('desc');
                      v2SortBy === 'tvl' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    <FormattedMessage id="tvl" defaultMessage="TVL" />
                  </span>
                  <span
                    className={v2SortBy !== 'tvl' ? 'hidden' : 'cursor-pointer'}
                    onClick={() => {
                      setV2SortBy('tvl');
                      setReSortBy('');
                      v2SortBy !== 'tvl' && setV2Order('desc');
                      v2SortBy === 'tvl' &&
                        setV2Order(v2Order === 'desc' ? 'asc' : 'desc');
                    }}
                  >
                    {v2SortBy === 'tvl' ? (
                      v2Order === 'desc' ? (
                        <DownArrowLight />
                      ) : (
                        <UpArrowLight />
                      )
                    ) : (
                      <UpArrowDeep />
                    )}
                  </span>
                </div>
              </header>

              <div className="max-h-96 overflow-y-auto  pool-list-container-pc">
                {allPoolsV2
                  .sort(poolv2ReSortingFunc)
                  .filter(poolv2FilterFunc)
                  .map((pool, i) => (
                    <PoolRowV2
                      tokens={[pool.token_x_metadata, pool.token_y_metadata]}
                      key={i}
                      pool={pool}
                      watched={!!find(watchV2Pools, { pool_id: pool.pool_id })}
                      index={i + 1}
                      showCol={true}
                      h24volume={volumes[pool.pool_id]}
                    />
                  ))}
              </div>
            </section>
          </Card>
        )}

        {activeTab === 'stable' && (
          <StablePoolList
            searchBy={tokenName}
            volumes={volumes}
            watchPools={watchPools}
          />
        )}
      </div>
      {isSignedIn && (
        <AddPoolModal
          isOpen={showAddPoolModal}
          onRequestClose={(e) => {
            setShowAddPoolModal(false);
          }}
          tokens={selectTokens}
          balances={selectBalances}
        />
      )}
    </>
  );
}

export const REF_FI_POOL_ACTIVE_TAB = 'REF_FI_POOL_ACTIVE_TAB_VALUE';

export const REF_FI_POOL_SEARCH_BY = 'REF_FI_POOL_SEARCH_BY_VALUE';

export function LiquidityPage() {
  window.onunload = () => {
    sessionStorage.removeItem(REF_FI_POOL_SEARCH_BY);
  };
  const storeTokenName = sessionStorage.getItem(REF_FI_POOL_SEARCH_BY);

  const [tokenName, setTokenName] = useState(storeTokenName || '');
  const [sortBy, setSortBy] = useState('tvl');
  const [order, setOrder] = useState('desc');
  const AllPools = useAllPools();
  const {
    watchPools,
    watchV2PoolsFinal: watchV2Pools,
    watchList,
  } = useWatchPools();
  const [hideLowTVL, setHideLowTVL] = useState<Boolean>(false);
  const [displayPools, setDisplayPools] = useState<Pool[]>();
  const { pools, hasMore, nextPage, loading, volumes } = usePools({
    tokenName,
    sortBy,
    order,
  });

  const [farmOnly, setFarmOnly] = useState<boolean>(
    localStorage.getItem(REF_FI_FARM_ONLY) === '1' || false
  );

  const [activeTab, setActiveTab] = useState<string>(
    localStorage.getItem(REF_FI_POOL_ACTIVE_TAB) || 'v1'
  );

  const switchActiveTab = (curTab: string) => {
    setActiveTab(curTab);

    localStorage.setItem(REF_FI_POOL_ACTIVE_TAB, curTab);
  };

  const [farmCounts, setFarmCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    const pool_ids_v1 = pools.map((p) => p.id);
    const pool_ids_watchPools = watchPools.map((p: Pool) => p.id);
    const pool_ids = pool_ids_v1.concat(pool_ids_watchPools);
    canFarms({
      pool_ids,
    }).then(setFarmCounts);
  }, [pools]);

  const clientMobileDevice = useClientMobile();

  useEffect(() => {
    let tempPools = pools;

    setHideLowTVL(JSON.parse(localStorage.getItem(HIDE_LOW_TVL)) || false);

    if (hideLowTVL) {
      tempPools = _.filter(tempPools, (pool) => pool.tvl > 1000);
    }
    if (farmOnly) {
      tempPools = _.filter(tempPools, (pool) => !!farmCounts[pool.id]);
    }
    setDisplayPools(tempPools);
  }, [pools, hideLowTVL, farmOnly, farmCounts]);
  const poolTokenMetas = usePoolTokens(pools);

  const onSearch = useCallback(
    _.debounce(
      (name: string) => {
        setTokenName(name);
        sessionStorage.setItem(REF_FI_POOL_SEARCH_BY, name);
      },
      clientMobileDevice ? 50 : 500
    ),
    [clientMobileDevice]
  );

  const history = useHistory();

  const { txHash } = getURLInfo();
  useEffect(() => {
    if (txHash && getCurrentWallet()?.wallet?.isSignedIn()) {
      checkTransactionStatus(txHash).then((res) => {
        let status: any = res.status;

        if (
          res.transaction?.actions?.[0]?.FunctionCall?.method_name === 'execute'
        ) {
          let receipt = res?.receipts_outcome?.find(
            (o: any) => o?.outcome?.executor_id === REF_FI_CONTRACT_ID
          );

          if (receipt) {
            status = receipt?.outcome?.status;
          }
        }

        const data: string | undefined = status.SuccessValue;

        if (data) {
          const buff = Buffer.from(data, 'base64');
          const pool_id = buff.toString('ascii');

          history.push(`/pool/${pool_id}`);
        } else {
          history.replace(`/pools`);
        }
      });
    }
  }, [txHash]);

  const poolsMorePoolsIds = usePoolsMorePoolIds();

  const watchPoolVolumes = useDayVolumesPools(watchPools.map((p) => p.id));
  const v3PoolVolumes = useV3VolumesPools();
  const [h24VolumeV2, setH24VolumeV2] = useState<string>();

  useEffect(() => {
    if (Object.keys(v3PoolVolumes).length > 0) {
      const h24Volume = Object.values(v3PoolVolumes).reduce(
        (a, b) => new Big(a || '0').plus(new Big(b || '0')),
        new Big(0)
      );

      setH24VolumeV2(scientificNotationToString(h24Volume.toString()));
    }
  }, [v3PoolVolumes]);

  const allVolumes = { ...watchPoolVolumes, ...volumes, ...v3PoolVolumes };

  if (!displayPools || loading || !watchPools || !poolTokenMetas)
    return <Loading />;

  return (
    <>
      {!clientMobileDevice && (
        <LiquidityPage_
          poolTokenMetas={poolTokenMetas}
          activeTab={activeTab}
          h24VolumeV2={h24VolumeV2}
          switchActiveTab={switchActiveTab}
          tokenName={tokenName}
          pools={displayPools}
          poolsMorePoolsIds={poolsMorePoolsIds}
          onHide={(isHide) => {
            localStorage.setItem(HIDE_LOW_TVL, isHide.toString());
            setHideLowTVL(isHide);
          }}
          farmCounts={farmCounts}
          hideLowTVL={hideLowTVL}
          farmOnly={farmOnly}
          setFarmOnly={(farmOnly: boolean) => {
            setFarmOnly(farmOnly);
            localStorage.setItem(REF_FI_FARM_ONLY, farmOnly ? '1' : '0');
          }}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          watchList={watchList}
          volumes={allVolumes}
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
          activeTab={activeTab}
          switchActiveTab={switchActiveTab}
          poolTokenMetas={poolTokenMetas}
          hideLowTVL={hideLowTVL}
          poolsMorePoolsIds={poolsMorePoolsIds}
          tokenName={tokenName}
          pools={displayPools}
          watchPools={watchPools}
          watchV2Pools={watchV2Pools}
          watchList={watchList}
          allPools={AllPools}
          volumes={allVolumes}
          order={order}
          sortBy={sortBy}
          farmCounts={farmCounts}
          farmOnly={farmOnly}
          setFarmOnly={(farmOnly: boolean) => {
            setFarmOnly(farmOnly);
            localStorage.setItem(REF_FI_FARM_ONLY, farmOnly ? '1' : '0');
          }}
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

const calculateTokenValueAndShare = (
  tokens: TokenMetadata[],
  coinsAmounts: { [id: string]: BigNumber },
  tokensMap: { [id: string]: TokenMetadata }
): Record<string, any> => {
  let result: Record<string, any> = {};
  const totalShares = _.sumBy(Object.values(coinsAmounts), (o) => Number(o));

  let otherTokenNumber = '0';

  Object.keys(tokensMap)
    .sort((a, b) => {
      const usdId =
        getConfig().networkId === 'mainnet' ? 'usn' : 'usdn.testnet';

      if (a === usdId) {
        return 1;
      } else {
        return -1;
      }
    })
    .reverse()
    .forEach((key, index: number) => {
      const token: TokenMetadata = tokensMap[key];

      const value = scientificNotationToString(
        coinsAmounts[token.id].toString()
      );
      let percentStr: string | number;
      if (index == tokens.length - 1) {
        percentStr = new BigNumber(100).minus(otherTokenNumber).toFixed(2);
      } else {
        percentStr = toPrecision(
          percent(value, totalShares.toString()).toString(),
          2
        );
        otherTokenNumber = BigNumber.sum(
          otherTokenNumber,
          percentStr
        ).valueOf();
      }
      result[token.id] = {
        token,
        value,
        percentStr,
        display: `${toInternationalCurrencySystem(value, 2)} (${percentStr}%)`,
        display2: `${toInternationalCurrencySystem(value, 2)} / ${percentStr}%`,
      };
    });

  const percents = Object.values(result).map((o) =>
    toPrecision(
      scientificNotationToString(
        new Big(o.value || '0')
          .div(totalShares || 1)
          .times(100)
          .toString()
      ),
      2
    )
  );

  const finalPercents = checkAllocations('100', percents);

  Object.keys(result).forEach((key, index) => {
    result[key].percentStr = finalPercents[index];
    result[key].display = `${toInternationalCurrencySystem(
      result[key].value,
      2
    )} (${finalPercents[index]}%)`;
    result[key].display2 = `${toInternationalCurrencySystem(
      result[key].value,
      2
    )} / ${finalPercents[index]}%`;
  });

  return result;
};

function TokenChart({
  tokens,
  coinsAmounts,
  tokensMap,
  activeToken,
}: {
  tokens: TokenMetadata[];
  coinsAmounts: { [id: string]: BigNumber };
  tokensMap: { [id: string]: TokenMetadata };
  activeToken: string;
}) {
  const tokensData = calculateTokenValueAndShare(
    tokens,
    coinsAmounts,
    tokensMap
  );

  const data = tokens.map((token, i) => {
    return {
      name: token.symbol,
      value: Number(coinsAmounts[token.id]),
      token: token,
      displayV: tokensData[token.id].display2,
    };
  });
  const color = {
    DAI: 'rgba(255, 199, 0, 0.45)',
    'USDT.e': '#167356',
    USDT: '#167356',
    'USDC.e': 'rgba(0, 163, 255, 0.45)',
    USDC: 'rgba(0, 163, 255, 0.45)',
    USN: 'rgba(255, 255, 255, 0.45)',
    cUSD: 'rgba(69, 205, 133, 0.6)',
    HBTC: '#4D85F8',
    WBTC: '#ED9234',
    STNEAR: '#A0A0FF',
    NEAR: '#A0B1AE',
    LINEAR: '#4081FF',
    NEARXC: '#4d5971',
    NearXC: '#4d5971',
    NearX: '#00676D',
    USDt: '#0E8585',
  };

  const colorLight = {
    DAI: 'rgba(255, 199, 0, 1)',
    'USDT.e': '#167356',
    USDT: '#167356',
    USDC: 'rgba(0, 163, 255, 1)',
    'USDC.e': 'rgba(0, 163, 255, 1)',
    USN: 'rgba(255, 255, 255, 1)',
    cUSD: 'rgba(69, 205, 133, 1)',
    HBTC: '#4D85F8',
    WBTC: '#ED9234',
    STNEAR: '#A0A0FF',
    NEAR: '#A0B1AE',
    LINEAR: '#4081FF',
    NEARXC: '#4d5971',
    NearXC: '#4d5971',
    NearX: '#00676D',
    USDt: '#0E8585',
  };

  let innerRadius = 30;
  let outerRadius = 40;
  let width = 80;

  const renderActiveShape = (props: any) => {
    const RADIAN = Math.PI / 180;
    const {
      cx,
      cy,
      midAngle,
      startAngle,
      endAngle,
      fill,
      payload,
      percent,
      value,
      index,
      token,
    } = props;
    const sin = Math.sin(-RADIAN * midAngle);
    const cos = Math.cos(-RADIAN * midAngle);
    const sx = cx + (outerRadius - 2) * cos;
    const sy = cy + (outerRadius - 2) * sin;
    const mx = cx + (outerRadius + 30) * cos;
    const my = cy + (outerRadius + 30) * sin;
    const ex = mx + (cos >= 0 ? 1 : -1) * 30;
    const ey = my;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          startAngle={startAngle}
          endAngle={endAngle}
          innerRadius={innerRadius - 5}
          outerRadius={outerRadius}
          fill={colorLight[token.symbol]}
          stroke={null}
          strokeWidth={2}
        />
      </g>
    );
  };

  const customLabel = activeToken && (
    <div className="text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
      {tokensData[activeToken].percentStr}%
    </div>
  );

  return (
    <>
      {customLabel}
      <PieChart width={width} height={80}>
        <Pie
          data={data}
          fill="#8884d8"
          innerRadius={innerRadius}
          outerRadius={outerRadius}
          dataKey="value"
          labelLine={false}
          activeShape={renderActiveShape}
          activeIndex={data.findIndex((o) => o.token.id === activeToken)}
        >
          {data.map((entry, index) => {
            return (
              <Cell
                key={`cell-${index}`}
                fill={color[tokens[index].symbol]}
                stroke=""
              />
            );
          })}
        </Pie>
      </PieChart>
    </>
  );
}

const RenderDisplayTokensAmounts = ({
  tokens,
  coinsAmounts,
  chartActiveToken,
  setChartActiveToken,
}: {
  tokens: TokenMetadata[];
  coinsAmounts: { [id: string]: BigNumber };
  chartActiveToken?: string;
  setChartActiveToken?: (token: string) => void;
}) => {
  return (
    <div className="flex items-center  flex-shrink-0 xs:-mr-1.5 md:-mr-1.5">
      {tokens.map((token, i) => {
        return (
          <span
            className={`flex   `}
            key={token.id + 'pool_page_stable_pool'}
            onMouseEnter={() => {
              setChartActiveToken && setChartActiveToken(token.id);
            }}
            onMouseLeave={() => {
              setChartActiveToken('');
            }}
          >
            {i ? (
              <span className="mx-1.5 py-1.5 text-primaryText ">+</span>
            ) : null}
            <span
              className={`flex px-1.5 rounded-lg py-1.5 items-center ${
                chartActiveToken === token.id
                  ? 'bg-black bg-opacity-20 text-white'
                  : 'text-primaryText'
              }`}
            >
              <span className="mr-1.5">
                <img
                  src={token.icon}
                  alt=""
                  className="w-4 h-4 border border-gradientFrom rounded-full flex-1 flex-shrink-0"
                />
              </span>

              <span
                className=" text-sm"
                title={toPrecision(
                  scientificNotationToString(coinsAmounts[token.id].toString()),
                  0
                )}
              >
                {toInternationalCurrencySystem(
                  scientificNotationToString(coinsAmounts[token.id].toString())
                )}
              </span>
            </span>
          </span>
        );
      })}
    </div>
  );
};

const StablePoolClassIcon = ({ id }: { id: string }) => {
  const stableClassIcon = NEAR_CLASS_STABLE_POOL_IDS.includes(id) ? (
    <NEAR_TEXT />
  ) : USD_CLASS_STABLE_POOL_IDS.includes(id) ? (
    <USD_TEXT />
  ) : (
    <BTC_TEXT />
  );

  const isMobile = useClientMobile();

  return <div className="absolute top-0  left-5">{stableClassIcon}</div>;
};

function StablePoolCard({
  poolData,
  h24volume,
  watched,
}: {
  poolData: PoolData;
  h24volume: string;
  watched?: boolean;
}) {
  const formattedPool = formatePoolData(poolData);

  const [hover, setHover] = useState<boolean>(false);

  const { shares, farmStakeV1, farmStakeV2, userTotalShare } = useYourliquidity(
    poolData.pool.id
  );

  const [chartActiveToken, setChartActiveToken] = useState<string>();

  const { accountId } = useWalletSelector();

  const isSignedIn = !!accountId;
  const { farmCount: countV2, endedFarmCount: endedFarmCountV2 } = useCanFarmV2(
    poolData.pool.id,
    true
  );

  const haveFarm = countV2 > endedFarmCountV2;

  const onlyEndedFarmsV2 = endedFarmCountV2 === countV2;
  const history = useHistory();

  const isMobile = useClientMobile();

  return (
    <div
      className="mb-4 xs:mb-2 md:mb-2"
      onMouseLeave={() => {
        setHover(false);
      }}
    >
      <Link
        to={`/sauce/${poolData.pool.id}`}
        className={`${
          hover || isMobile ? 'bg-v3HoverDarkBgColor' : 'bg-cardBg'
        } relative z-20 rounded-xl xs:rounded-t-xl md:rounded-t-xl xs:rounded-b-none md:rounded-b-none px-8 xs:px-5 md:px-5 w-full h-28 xs:h-20 md:h-20 flex items-center justify-between`}
        onMouseEnter={() => {
          setHover(true);
        }}
      >
        <StablePoolClassIcon id={poolData.pool.id.toString()} />
        <div
          className={`w-5/12 xs:w-full md:w-full ${
            haveFarm
              ? 'xs:relative xs:top-1 xs:items-start md:relative md:top-1 md:items-start'
              : ''
          }  flex items-center   xs:justify-between md:justify-between`}
        >
          <Images tokens={poolData.tokens} size="8" className="mr-4" />

          <div className="flex xs:flex-col xs:items-end items-center">
            <div className="flex items-center">
              <Symbols
                fontSize="xs:text-sm md:text-sm lg:text-lg lg:font-bold "
                tokens={poolData.tokens}
                seperator="-"
              />
              {watched && (
                <div className="ml-2">
                  <WatchListStartFull />
                </div>
              )}
            </div>

            <span
              className="ml-1 xs:relative md:relative xs:top-1 md:top-1 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                window.open(
                  `/v2farms/${poolData.pool.id}-${
                    onlyEndedFarmsV2 ? 'e' : 'r'
                  }`,
                  '_blank'
                );
              }}
            >
              {haveFarm && (
                <FarmStampNew multi={countV2 - endedFarmCountV2 > 1} />
              )}
            </span>
          </div>
        </div>

        <div className="w-7/12 flex  xs:hidden md:hidden items-center">
          <div
            className="col-span-1 w-32 py-1 text-lg relative right-3"
            title={h24volume}
          >
            {!h24volume
              ? '-'
              : Number(h24volume) == 0
              ? '$0'
              : Number(h24volume) < 0.01
              ? '$ <0.01'
              : `$${toInternationalCurrencySystem(h24volume)}`}
          </div>

          <div className="flex flex-col   flex-shrink-0 relative lg:right-12 lg2:right-8   2xl:-right-4">
            <div
              className="col-span-1 py-1 text-lg "
              title={toPrecision(
                scientificNotationToString(poolData.poolTVL.toString()),
                0
              )}
            >
              ${toInternationalCurrencySystem(poolData.poolTVL.toString())}
            </div>

            <RenderDisplayTokensAmounts
              tokens={poolData.tokens}
              coinsAmounts={formattedPool.coinsAmounts}
              chartActiveToken={chartActiveToken}
              setChartActiveToken={setChartActiveToken}
            />
          </div>

          <div className="absolute xl:right-8 lg:right-4 xs:hidden md:hidden">
            <TokenChart
              tokens={poolData.tokens}
              coinsAmounts={formattedPool.coinsAmounts}
              tokensMap={poolData.tokens.reduce(
                (acc, cur, i) => ({ ...acc, [cur.id]: cur }),
                {}
              )}
              activeToken={chartActiveToken}
            />
          </div>
        </div>
      </Link>

      <div
        className={`w-full justify-between text-sm rounded-b-xl z-10 relative pt-7 pb-3 bottom-3 px-8 xs:px-5 md:px-5 bg-cardBg flex xs:flex-col md:flex-col items-center ${
          !hover && !isMobile ? 'hidden' : ''
        }`}
      >
        <div className="lg:hidden w-full flex  justify-between text-sm text-white">
          <div className="text-xs text-v3SwapGray">
            <FormattedMessage id="tvl" defaultMessage={'TVL'} />
          </div>

          <div className="flex flex-col items-end ">
            <span
              title={toPrecision(
                scientificNotationToString(poolData.poolTVL.toString()),
                0
              )}
            >
              ${toInternationalCurrencySystem(poolData.poolTVL.toString())}
            </span>

            <RenderDisplayTokensAmounts
              tokens={poolData.tokens}
              coinsAmounts={formattedPool.coinsAmounts}
            />
          </div>
        </div>

        <div className="lg:hidden w-full mt-2 flex justify-between text-sm text-white">
          <div className="text-xs text-v3SwapGray">
            <FormattedMessage id="volume_24h" defaultMessage={'Volume (24h)'} />
          </div>

          <div title={h24volume}>
            {!h24volume
              ? '-'
              : Number(h24volume) == 0
              ? '$0'
              : Number(h24volume) < 0.01
              ? '$ <0.01'
              : `$${toInternationalCurrencySystem(h24volume)}`}
          </div>
        </div>

        <div className="flex items-center xs:hidden md:hidden">
          <div className="text-primaryText text-base">
            <FormattedMessage id="your_shares" defaultMessage="Your Shares" />
          </div>

          <div className="text-lg ml-5 mr-2.5 text-white">
            {formattedPool.displayMyShareAmount}
          </div>
          <div className="text-primaryText mr-4">
            {formattedPool.displaySharePercent}
          </div>

          <div
            className={`cursor-pointer ${!haveFarm ? 'hidden' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              window.open(
                `/v2farms/${poolData.pool.id}-${onlyEndedFarmsV2 ? 'e' : 'r'}`,
                '_blank'
              );
            }}
          >
            <ShareInFarm
              farmStake={farmStakeV2}
              userTotalShare={userTotalShare}
              forStable
            />
          </div>
        </div>

        <div className="flex xs:hidden md:hidden items-center">
          <SolidButton
            className={`w-full rounded-lg text-center  flex items-center justify-center h-9 min-w-40  py-1 mr-2 text-sm`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/sauce/${poolData.pool.id}`, {
                stableTab: 'add_liquidity',
                shares,
                pool: poolData.pool,
              });
            }}
          >
            <FormattedMessage
              id="add_liquidity"
              defaultMessage="Add Liquidity"
            />
          </SolidButton>
          <OutlineButton
            className="w-full py-1  min-w-40 ml-2 text-sm  h-9 rounded-lg flex items-center justify-center"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              history.push(`/sauce/${poolData.pool.id}`, {
                stableTab: 'remove_liquidity',
                shares,
                pool: poolData.pool,
              });
            }}
          >
            <FormattedMessage
              id="remove_liquidity"
              defaultMessage="Remove Liquidity"
            />
          </OutlineButton>
        </div>
      </div>
    </div>
  );
}

function StablePoolList({
  searchBy,
  volumes,
  watchPools,
}: {
  searchBy: string;
  volumes: Record<string, string>;
  watchPools: Pool[];
}) {
  const [option, setOption] = useState<string>('ALL');

  const [orderStable, setorderStable] = useState<string>('desc');

  const [sortBy, setSortBy] = useState<string>('tvl');

  const allStablePoolData = useAllStablePoolData();

  if (!allStablePoolData || allStablePoolData.some((pd) => !pd))
    return <Loading />;

  const filterFunc = (p: PoolData) => {
    const b1 =
      option === 'ALL'
        ? true
        : option === 'NEAR'
        ? NEAR_CLASS_STABLE_POOL_IDS.includes(p.pool.id.toString())
        : option === 'USD'
        ? USD_CLASS_STABLE_POOL_IDS.includes(p.pool.id.toString())
        : BTC_CLASS_STABLE_POOL_IDS.includes(p.pool.id.toString());
    const b2 = p.tokens.some((t) =>
      _.includes(t.symbol.toLowerCase(), searchBy.toLowerCase())
    );

    return b1 && b2;
  };

  const sortingFunc = (p1: PoolData, p2: PoolData) => {
    const v1 = Number(p1.poolTVL.toString());
    const v2 = Number(p2.poolTVL.toString());

    const vol1 = Number(volumes[p1.pool.id.toString()] || '0');
    const vol2 = Number(volumes[p2.pool.id.toString()] || '0');

    if (orderStable === 'desc') {
      if (sortBy === 'tvl') {
        return v2 - v1;
      } else {
        return vol2 - vol1;
      }
    } else {
      if (sortBy === 'tvl') {
        return v1 - v2;
      } else {
        return vol1 - vol2;
      }
    }
  };

  return (
    <>
      <div className="flex relative mb-4 xs:mb-2 md:mb-2 items-center">
        <div className="flex items-center w-5/12 xs:w-full md:w-full xs:justify-between md:justify-between">
          {['ALL', 'USD', 'BTC', 'NEAR'].map((o) => {
            return (
              <button
                key={o + '-stable-pool-type'}
                className={`text-sm xs:text-base md:text-base flex px-3 mr-3 py-1 rounded-xl items-center justify-center  ${
                  option === o ? 'bg-cardBg text-white' : 'text-primaryText'
                } `}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setOption(o);
                }}
              >
                {o}
              </button>
            );
          })}
        </div>

        <div className="w-7/12 xs:hidden md:hidden flex items-center text-primaryText ">
          <div className="w-32 relative xl:right-8 lg:right-12 flex items-center">
            <span
              className={`pr-1 cursor-pointer
              
              ${
                sortBy !== 'volume_24h'
                  ? 'hover:text-white'
                  : 'text-gradientFrom'
              }
    
              `}
              onClick={() => {
                setSortBy('volume_24h');

                setorderStable(
                  orderStable === 'desc' && sortBy === 'volume_24h'
                    ? 'asc'
                    : 'desc'
                );
              }}
            >
              <FormattedMessage id="volume_24h" defaultMessage="Volume (24h)" />
            </span>
            <span
              className={`cursor-pointer ${
                sortBy !== 'volume_24h' ? 'hidden' : ''
              } `}
              onClick={() => {
                setSortBy('volume_24h');
                setorderStable(
                  orderStable === 'desc' && sortBy === 'volume_24h'
                    ? 'asc'
                    : 'desc'
                );
              }}
            >
              {orderStable === 'desc' && sortBy === 'volume_24h' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )}
            </span>
          </div>

          <div
            className={`relative lg:right-12 lg2:right-8   2xl:-right-4    inline-flex items-center`}
          >
            <span
              className={`pr-1 cursor-pointer
              ${sortBy !== 'tvl' ? 'hover:text-white' : 'text-gradientFrom'}
              `}
              onClick={() => {
                setSortBy('tvl');

                setorderStable(
                  orderStable === 'desc' && sortBy === 'tvl' ? 'asc' : 'desc'
                );
              }}
            >
              <FormattedMessage id="tvl" defaultMessage="TVL" />
            </span>
            <span
              className={`cursor-pointer ${sortBy !== 'tvl' ? 'hidden' : ''}`}
              onClick={() => {
                setSortBy('tvl');

                setorderStable(
                  orderStable === 'desc' && sortBy === 'tvl' ? 'asc' : 'desc'
                );
              }}
            >
              {orderStable === 'desc' && sortBy === 'tvl' ? (
                <DownArrowLight />
              ) : (
                <UpArrowLight />
              )}
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col text-white mb-4">
        {allStablePoolData
          .filter(filterFunc)
          .sort(sortingFunc)
          .map((pd, i) => {
            return (
              <StablePoolCard
                key={pd.pool.id.toString() + i + '-list-render'}
                poolData={pd}
                h24volume={volumes[pd.pool.id.toString()]}
                watched={!!find(watchPools, { id: pd.pool.id })}
              />
            );
          })}
      </div>
    </>
  );
}
